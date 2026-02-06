import { Router } from 'express';
import { StoryController } from '../controllers/storyController';
import { authenticate } from '../middleware/auth';

const router = Router();
const storyController = new StoryController();

router.post('/', authenticate, (req, res) => storyController.createStory(req, res));
router.get('/', authenticate, (req, res) => storyController.getStories(req, res));
router.post('/:id/like', authenticate, (req, res) => storyController.likeStory(req, res));
router.delete('/:id/like', authenticate, (req, res) => storyController.unlikeStory(req, res));
router.post('/:id/comments', authenticate, (req, res) => storyController.addComment(req, res));
router.get('/:id/comments', authenticate, (req, res) => storyController.getComments(req, res));
router.put('/:id', authenticate, (req, res) => storyController.updateStory(req, res));
router.delete('/:id', authenticate, (req, res) => storyController.deleteStory(req, res));
router.get('/stats', authenticate, (req, res) => storyController.getStats(req, res));

export { router as storyRoutes };
