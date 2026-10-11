import { Router } from 'express';
import { uploadKycDocuments, getKycStatus } from '../controllers/kyc.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.post('/upload', upload.fields([{ name: 'pan', maxCount: 1 }, { name: 'aadhaar', maxCount: 1 }]), uploadKycDocuments);
router.get('/status', getKycStatus);

export default router;
