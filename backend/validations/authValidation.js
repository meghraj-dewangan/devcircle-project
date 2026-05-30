import { body } from 'express-validator';


const registerValidation = [

    body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3, max: 40 }).withMessage('username must be between 3 and 40 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('username can only have letters,numbers and underscores '),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
];

const loginValidation = [
     body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email address'),
      body('password').notEmpty().withMessage('Password is required'),
];

export { registerValidation, loginValidation };


