import express from 'express';
const router = express.Router();

import {getPopularTags,getQuestions,createQuestion,getQuestionById,updateQuestion,deleteQuestion,voteQuestion 
} from '../controllers/questionController.js';

import { getAnswers, addAnswer } from '../controllers/answerController.js';
import { protect } from '../middleware/authMiddleware.js';

import { createQuestionValidation } from '../validations/questionValidation.js';

router.get('/tags', getPopularTags);
router.get('/', getQuestions);
router.post('/', protect, createQuestionValidation, createQuestion);

router.get('/:id', getQuestionById);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);
router.post('/:id/vote', protect, voteQuestion);


router.get('/:id/answers', getAnswers);
router.post('/:id/answers', protect, addAnswer);

export default router;

