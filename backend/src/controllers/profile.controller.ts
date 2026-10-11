import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      include: { user: { select: { email: true, phone: true, role: true } } }
    });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { first_name, last_name } = req.body;

    const profile = await prisma.profile.update({
      where: { user_id: userId },
      data: { first_name, last_name },
    });

    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const avatarUrl = `/uploads/${file.filename}`;

    const profile = await prisma.profile.update({
      where: { user_id: userId },
      data: { avatar_url: avatarUrl },
    });

    res.status(200).json({ message: 'Avatar uploaded successfully', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
