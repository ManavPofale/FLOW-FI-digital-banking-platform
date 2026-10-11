import { Router } from 'express';
import { calculateTrustScore, applyForLoan, getMyLoans } from '../controllers/loan.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/calculate-score', calculateTrustScore);
router.post('/apply', applyForLoan);
router.get('/my-loans', getMyLoans);

export default router;
