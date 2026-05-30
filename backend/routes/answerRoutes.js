import express from 'express';
const router = express.Router();

import { acceptAnswer, voteAnswer } from '../controllers/answerController.js';

import { protect } from '../middleware/authMiddleware.js';

router.put('/:id/accept', protect, acceptAnswer);
router.post('/:id/vote', protect, voteAnswer);

export default router;

