import express from 'express';
import { addStories,getStories,getStory,getStoryById } from '../controllers/stories-controller.js';

const router = express.Router();

router.post('/add-story', addStories);
router.get('/get-connected-stories', getStories);
router.get('/get-story/:username', getStory);
router.get('/get-story-by-id/:id', getStoryById);

export default router