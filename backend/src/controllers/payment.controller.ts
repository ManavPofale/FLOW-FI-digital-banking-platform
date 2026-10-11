import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import QRCode from 'qrcode';
import prisma from '../prisma';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    
    // Create signature to verify
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
       res.status(400).json({ message: 'Payment verification failed' });
       return;
    }

    // Payment is authentic, add to wallet
    await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { user_id: userId },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          wallet_id: wallet.id,
          amount: amount,
          type: 'CREDIT',
          description: `Added money via Razorpay (ID: ${razorpay_payment_id})`,
        },
      });
    });

    res.status(200).json({ message: 'Payment verified and wallet updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const generateQR = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true } });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // QR Data format: a simple JSON string to identify the receiver
    const qrData = JSON.stringify({
      flowfi_id: userId,
      email: user.email,
      phone: user.phone
    });

    const qrDataURL = await QRCode.toDataURL(qrData);
    res.status(200).json({ qrCode: qrDataURL, data: qrData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const payViaQR = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const { receiverId, amount, note } = req.body;

    if (!receiverId || !amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid payment details' });
      return;
    }

    if (senderId === receiverId) {
      res.status(400).json({ message: 'Cannot pay yourself' });
      return;
    }

    // ACID Transfer
    await prisma.$transaction(async (tx) => {
      // Deduct Sender
      const senderWallet = await tx.wallet.findUnique({ where: { user_id: senderId } });
      if (!senderWallet || senderWallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      await tx.wallet.update({
        where: { user_id: senderId },
        data: { balance: { decrement: amount } },
      });

      const receiverUser = await tx.user.findUnique({ where: { id: receiverId } });

      await tx.transaction.create({
        data: {
          wallet_id: senderWallet.id,
          amount: amount,
          type: 'DEBIT',
          description: `QR Payment to ${receiverUser?.email}: ${note || ''}`,
        },
      });

      // Add to Receiver
      const receiverWallet = await tx.wallet.findUnique({ where: { user_id: receiverId } });
      if (!receiverWallet) {
        throw new Error('Receiver wallet not found');
      }

      await tx.wallet.update({
        where: { user_id: receiverId },
        data: { balance: { increment: amount } },
      });

      const senderUser = await tx.user.findUnique({ where: { id: senderId } });

      await tx.transaction.create({
        data: {
          wallet_id: receiverWallet.id,
          amount: amount,
          type: 'CREDIT',
          description: `QR Payment from ${senderUser?.email}: ${note || ''}`,
        },
      });
    });

    res.status(200).json({ message: 'QR Payment successful' });
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Insufficient funds' || error.message === 'Receiver wallet not found') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
