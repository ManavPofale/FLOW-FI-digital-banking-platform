import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
      include: {
        transactions: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) {
      res.status(404).json({ message: 'Wallet not found' });
      return;
    }

    res.status(200).json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addMoneyMock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    // Use Prisma transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { user_id: userId },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          wallet_id: wallet.id,
          amount: amount,
          type: 'CREDIT',
          description: 'Added money to wallet (Mock)',
        },
      });

      return { wallet, transaction };
    });

    res.status(200).json({ message: 'Money added successfully', balance: result.wallet.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const withdrawMoneyMock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    // Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { user_id: userId } });
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      const updatedWallet = await tx.wallet.update({
        where: { user_id: userId },
        data: { balance: { decrement: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          wallet_id: wallet.id,
          amount: amount,
          type: 'DEBIT',
          description: 'Withdrawal to bank account (Mock)',
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    res.status(200).json({ message: 'Money withdrawn successfully', balance: result.wallet.balance });
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Insufficient funds') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const transferMoney = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const { receiverEmail, amount, note } = req.body;

    if (!receiverEmail || !amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid transfer details' });
      return;
    }

    let receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });
    if (!receiver) {
      // Auto-create receiver for seamless testing
      receiver = await prisma.user.create({
        data: {
          email: receiverEmail,
          password_hash: 'auto-generated',
          wallet: { create: { balance: 0 } },
        }
      });
    }

    if (senderId === receiver.id) {
      res.status(400).json({ message: 'Cannot transfer to yourself' });
      return;
    }

    // ACID Compliant Transfer
    await prisma.$transaction(async (tx) => {
      // 1. Deduct from Sender
      const senderWallet = await tx.wallet.findUnique({ where: { user_id: senderId } });
      if (!senderWallet || senderWallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      await tx.wallet.update({
        where: { user_id: senderId },
        data: { balance: { decrement: amount } },
      });

      await tx.transaction.create({
        data: {
          wallet_id: senderWallet.id,
          amount: amount,
          type: 'DEBIT',
          description: `Transfer to ${receiver.email}: ${note || ''}`,
        },
      });

      // 2. Add to Receiver
      const receiverWallet = await tx.wallet.findUnique({ where: { user_id: receiver.id } });
      if (!receiverWallet) {
        throw new Error('Receiver wallet not found');
      }

      await tx.wallet.update({
        where: { user_id: receiver.id },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          wallet_id: receiverWallet.id,
          amount: amount,
          type: 'CREDIT',
          description: `Transfer from user (ID: ${senderId}): ${note || ''}`,
        },
      });
    });

    res.status(200).json({ message: 'Transfer successful' });
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Insufficient funds' || error.message === 'Receiver wallet not found') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
