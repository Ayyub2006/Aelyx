import express from 'express';
import { loginUser, getMe, registerAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Temporarily expose register-admin to create the initial admin account
router.post('/register-admin', registerAdmin);

export default router;
