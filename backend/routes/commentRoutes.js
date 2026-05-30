import express from 'express';
const router = express.Router();

import { deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';


router.delete('/:id', protect, deleteComment);

export default router;

