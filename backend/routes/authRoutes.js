import express from 'express';
const router = express.Router();

import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

import { registerValidation, loginValidation } from '../validations/authValidation.js';

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

router.get('/me', protect, getMe);

export default router;

