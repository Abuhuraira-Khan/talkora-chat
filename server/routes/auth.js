import express from 'express';
import { signUp,login,verify } from '../controllers/auth-controller.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/verify', verify);
router.post('/login', login);
// router.get('/verify-me', verifyMe);

export default router