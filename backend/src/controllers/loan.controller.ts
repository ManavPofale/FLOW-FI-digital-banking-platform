import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const calculateTrustScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Gather financial footprint
    const kyc = await prisma.kYC.findUnique({ where: { user_id: userId } });
    const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
    const wallet = await prisma.wallet.findUnique({ 
      where: { user_id: userId },
      include: {
        transactions: { take: 10, orderBy: { created_at: 'desc' } }
      }
    });

    let score = 0;
    let reasoning = '';

    if (process.env.GEMINI_API_KEY) {
      // Use Real Gemini AI
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are an expert AI credit risk analyst. Analyze the following user data and generate a trust score between 300 and 900.
        KYC Status: ${kyc?.status || 'NOT_SUBMITTED'}
        Profile Completeness: ${profile?.first_name ? 'High' : 'Low'}
        Current Balance: ${wallet?.balance || 0}
        Recent Transactions: ${wallet?.transactions.length || 0} transactions
        
        Respond ONLY with a valid JSON object in this exact format, with no markdown formatting or extra text:
        {"score": <number>, "reasoning": "<string>"}
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      // Clean up markdown code blocks if any
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(text);
      score = parsed.score;
      reasoning = parsed.reasoning;
    } else {
      // Mock Fallback
      if (kyc?.status === 'VERIFIED') {
        score = Math.floor(Math.random() * (900 - 700 + 1)) + 700;
        reasoning = 'Excellent score due to verified KYC status.';
      } else {
        score = Math.floor(Math.random() * (600 - 300 + 1)) + 300;
        reasoning = 'Low score. Please complete KYC verification to improve.';
      }
    }

    // Update Profile
    const updatedProfile = await prisma.profile.update({
      where: { user_id: userId },
      data: { trust_score: score }
    });

    res.status(200).json({ trust_score: score, reasoning, profile: updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to calculate AI Trust Score' });
  }
};

export const applyForLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { amount, term_months } = req.body;

    if (!amount || amount <= 0 || !term_months || term_months <= 0) {
      res.status(400).json({ message: 'Invalid loan parameters' });
      return;
    }

    const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
    const score = profile?.trust_score || 0;

    if (score < 500) {
      res.status(400).json({ message: 'Loan Rejected. AI Trust Score is too low. Please improve your score.' });
      return;
    }

    const interestRate = score >= 750 ? 10.5 : 14.5; // Better rate for higher score
    
    // EMI Calculation (P x R x (1+R)^N / [(1+R)^N-1])
    const r = interestRate / (12 * 100);
    const emi = (amount * r * Math.pow(1 + r, term_months)) / (Math.pow(1 + r, term_months) - 1);

    const isInstantlyApproved = score >= 700;

    await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          user_id: userId,
          amount,
          interest_rate: interestRate,
          term_months,
          emi: Math.round(emi * 100) / 100,
          status: isInstantlyApproved ? 'APPROVED' : 'PENDING',
          approved_at: isInstantlyApproved ? new Date() : null,
        }
      });

      // Disburse funds immediately if approved
      if (isInstantlyApproved) {
        const wallet = await tx.wallet.update({
          where: { user_id: userId },
          data: { balance: { increment: amount } }
        });

        await tx.transaction.create({
          data: {
            wallet_id: wallet.id,
            amount: amount,
            type: 'CREDIT',
            description: `Loan Disbursement (Loan ID: ${loan.id})`
          }
        });
      }
    });

    res.status(200).json({ 
      message: isInstantlyApproved ? 'Loan instantly approved and disbursed!' : 'Loan application submitted for review.',
      status: isInstantlyApproved ? 'APPROVED' : 'PENDING',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const loans = await prisma.loan.findMany({
      where: { user_id: userId },
      orderBy: { applied_at: 'desc' }
    });
    res.status(200).json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
