import { body } from 'express-validator';

const createPostValidation = [
  body('content').trim().notEmpty() .withMessage('Post content is required').isLength({ max: 1000 }).withMessage('Post cannot exceed 1000 characters'),
   
   
];

export { createPostValidation };
