import { Response } from 'express';
import { StoryService } from '../services/storyService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class StoryController {
  private storyService: StoryService;

  constructor() {
    this.storyService = new StoryService();
  }

  async createStory(req: AuthRequest, res: Response) {
    try {
      const citizenId = req.user?.id;
      if (!citizenId) throw new AppError('Unauthorized', 401);

      const story = await this.storyService.createStory(citizenId, req.body);
      res.status(201).json({ message: 'Story shared successfully', story });
    } catch (error) {
      if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
      res.status(500).json({ message: 'Failed to share story' });
    }
  }

  async getStories(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const stories = await this.storyService.getStories(userId);
      res.json({ stories });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stories' });
    }
  }

  async likeStory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);
      
      const { id } = req.params;
      await this.storyService.likeStory(id as string, userId);
      res.json({ message: 'Story liked' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to like story' });
    }
  }

  async unlikeStory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);
      
      const { id } = req.params;
      await this.storyService.unlikeStory(id as string, userId);
      res.json({ message: 'Story unliked' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to unlike story' });
    }
  }

  async addComment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);
      
      const { id } = req.params;
      const comment = await this.storyService.addComment(id as string, userId, req.body);
      res.status(201).json({ message: 'Comment added', comment });
    } catch (error) {
      if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
      res.status(500).json({ message: 'Failed to add comment' });
    }
  }

  async getComments(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const comments = await this.storyService.getComments(id as string);
      res.json({ comments });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch comments' });
    }
  }

  async updateStory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);
      
      const { id } = req.params;
      const story = await this.storyService.updateStory(id as string, userId, req.body);
      res.json({ message: 'Story updated successfully', story });
    } catch (error) {
      if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
      res.status(500).json({ message: 'Failed to update story' });
    }
  }

  async deleteStory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);
      
      const { id } = req.params;
      await this.storyService.deleteStory(id as string, userId);
      res.json({ message: 'Story deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
      res.status(500).json({ message: 'Failed to delete story' });
    }
  }

  async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await this.storyService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch community stats' });
    }
  }
}
