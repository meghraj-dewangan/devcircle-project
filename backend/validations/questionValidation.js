import { body } from 'express-validator';

const createQuestionValidation = [
  body('title').trim().notEmpty().withMessage('Question title is required').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    
  body('body').trim().notEmpty().withMessage('Question body is required').isLength({ min: 10 }).withMessage('Please describe your question in at least 10 characters'),
  
];

export { createQuestionValidation };
