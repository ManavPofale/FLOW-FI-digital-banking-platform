import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const uploadKycDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || (!files.pan && !files.aadhaar)) {
      res.status(400).json({ message: 'No documents provided' });
      return;
    }

    let kyc = await prisma.kYC.findUnique({ where: { user_id: userId } });
    if (!kyc) {
      kyc = await prisma.kYC.create({ data: { user_id: userId, status: 'PENDING' } });
    }

    const documentsToCreate = [];

    if (files.pan && files.pan.length > 0) {
      documentsToCreate.push({
        kyc_id: kyc.id,
        type: 'PAN',
        file_url: `/uploads/${files.pan[0].filename}`,
      });
    }

    if (files.aadhaar && files.aadhaar.length > 0) {
      documentsToCreate.push({
        kyc_id: kyc.id,
        type: 'AADHAAR',
        file_url: `/uploads/${files.aadhaar[0].filename}`,
      });
    }

    await prisma.document.createMany({
      data: documentsToCreate
    });

    res.status(200).json({ message: 'KYC documents uploaded successfully', status: kyc.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getKycStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const kyc = await prisma.kYC.findUnique({
      where: { user_id: userId },
      include: { documents: true }
    });

    if (!kyc) {
      res.status(404).json({ message: 'KYC not found for this user' });
      return;
    }

    res.status(200).json(kyc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
