import { Router } from 'express';
import { register, login, refresh, logout, sendOtp, verifyOtp } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Example protected route for testing
router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'Access granted to protected route', user: req.user });
});

export default router;
