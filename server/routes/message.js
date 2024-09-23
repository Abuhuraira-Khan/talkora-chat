import express from 'express';
import { createMessage ,getMessages,deleteMessage} from '../controllers/message-controller.js';

const router = express.Router();

router.post('/send-message', createMessage);
router.get('/get-messages/:id', getMessages);
router.post('/delete-message', deleteMessage);

export default router