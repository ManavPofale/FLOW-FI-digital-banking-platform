import { Router } from 'express';
import { getPlatformStats, getPendingKycUsers, updateKycStatus } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect ALL routes with authentication and Admin RBAC
router.use(authenticate, authorize(['ADMIN']));

router.get('/stats', getPlatformStats);
router.get('/kyc/pending', getPendingKycUsers);
router.put('/kyc/:kycId', updateKycStatus);

export default router;
