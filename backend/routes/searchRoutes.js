import express from 'express';
const router = express.Router();

import { search } from '../controllers/searchController.js';


router.get('/', search);

export default router;

