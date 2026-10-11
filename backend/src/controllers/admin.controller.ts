import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const getPlatformStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    
    const wallets = await prisma.wallet.findMany({ select: { balance: true } });
    const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    
    const loans = await prisma.loan.findMany({ select: { amount: true } });
    const totalLoanVolume = loans.reduce((sum, l) => sum + l.amount, 0);
    
    const transactions = await prisma.transaction.findMany({ select: { amount: true } });
    const totalTransactionVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

    const pendingKycCount = await prisma.kYC.count({ where: { status: 'PENDING' } });

    res.status(200).json({
      totalUsers,
      totalWalletBalance,
      totalLoanVolume,
      totalTransactionVolume,
      pendingKycCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch platform stats' });
  }
};

export const getPendingKycUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kycRecords = await prisma.kYC.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { email: true, phone: true } },
        documents: true
      },
      orderBy: { submitted_at: 'asc' }
    });

    res.status(200).json(kycRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch KYC records' });
  }
};

export const updateKycStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { kycId } = req.params;
    const { status } = req.body; // 'VERIFIED' or 'REJECTED'

    if (status !== 'VERIFIED' && status !== 'REJECTED') {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const updatedKyc = await prisma.kYC.update({
      where: { id: kycId },
      data: { 
        status,
        verified_at: status === 'VERIFIED' ? new Date() : null
      }
    });

    // If verified, maybe boost their trust score immediately as a bonus?
    if (status === 'VERIFIED') {
      const profile = await prisma.profile.findUnique({ where: { user_id: updatedKyc.user_id } });
      if (profile && (profile.trust_score || 0) < 700) {
        await prisma.profile.update({
          where: { user_id: updatedKyc.user_id },
          data: { trust_score: 750 } // Instant boost!
        });
      }
    }

    res.status(200).json({ message: `KYC ${status} successfully`, kyc: updatedKyc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update KYC status' });
  }
};
