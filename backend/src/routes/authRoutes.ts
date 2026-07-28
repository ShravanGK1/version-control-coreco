import { Router } from 'express';
import { login, refreshToken, logout } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router;
