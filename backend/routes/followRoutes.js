import express from 'express';
const router = express.Router();

import { followUser, unfollowUser, getFollowStatus, getBulkFollowStatus } from '../controllers/followController.js';

import { protect } from '../middleware/authMiddleware.js';

router.get('/status-bulk', protect, getBulkFollowStatus);
router.post('/:userId', protect, followUser);
router.delete('/:userId', protect, unfollowUser);
router.get('/:userId/status', protect, getFollowStatus);

export default router;

