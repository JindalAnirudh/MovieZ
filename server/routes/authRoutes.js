import express from 'express';
import { login, me, register } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/users/register', register);
router.post('/users/login', login);
router.get('/users/me', verifyToken, me);

export default router;
