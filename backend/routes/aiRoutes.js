import express from 'express';
const router = express.Router();

import {
    improvePost, improveQuestion, generateTags, detectVague, suggestAnswer
} from '../controllers/aiController.js';

import { protect } from '../middleware/authMiddleware.js';

router.post('/improve-post', protect, improvePost);

router.post('/improve-question', protect, improveQuestion);
router.post('/generate-tags', protect, generateTags);
router.post('/detect-vague', protect, detectVague);

router.post('/suggest-answer', protect, suggestAnswer);

export default router;

