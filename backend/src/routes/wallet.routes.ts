import { Router } from 'express';
import { getBalance, addMoneyMock, withdrawMoneyMock, transferMoney } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/balance', getBalance);
router.post('/add', addMoneyMock);
router.post('/withdraw', withdrawMoneyMock);
router.post('/transfer', transferMoney);

export default router;
