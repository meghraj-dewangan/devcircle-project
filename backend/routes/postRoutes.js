import express from 'express';
const router = express.Router();

import { getFeed,getExplorePosts,createPost,getPostById,deletePost,repostPost,likePost,unlikePost
} from '../controllers/postController.js';

import { getComments, addComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { createPostValidation } from '../validations/postValidation.js';


router.get('/explore', getExplorePosts);
router.get('/', protect, getFeed);
router.post('/', protect, upload.single('image'), createPostValidation, createPost);


router.get('/:id', getPostById);
router.delete('/:id', protect, deletePost);

// Like / unlike
router.post('/:id/repost', protect, repostPost);
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);


router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);

export default router;

