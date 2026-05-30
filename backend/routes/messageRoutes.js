import express from 'express';
const router = express.Router();

import {getConversations, getMessages,sendMessage 
} from '../controllers/messageController.js';

import { protect } from '../middleware/authMiddleware.js';


router.get('/conversations', protect, getConversations);

router.get('/:userId', protect, getMessages);

router.post('/:userId', protect, sendMessage);

export default router;

