import { Router } from 'express';
import { createOrder, verifyPayment, generateQR, payViaQR } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/qr/generate', generateQR);
router.post('/qr/pay', payViaQR);

export default router;
