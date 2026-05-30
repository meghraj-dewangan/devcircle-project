import express from 'express';
const router = express.Router();

import {getUserProfile,updateProfile,uploadAvatar,getFollowers,getFollowing 
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';


router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);


router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);


router.get('/:username', getUserProfile);

export default router;

