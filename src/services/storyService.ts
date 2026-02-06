import { DatabaseService } from './databaseService';
import { CreateStoryRequest, Story, StoryComment, PostCommentRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export class StoryService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async createStory(citizenId: string, storyData: CreateStoryRequest): Promise<Story> {
    const { title, body, image_url, tag } = storyData;

    if (!title || !body) {
      throw new AppError('Title and body are required', 400);
    }

    const story = await this.db.createStory({
      id: uuidv4(),
      citizen_id: citizenId,
      title,
      body,
      image_url,
      tag
    });

    return {
      ...story,
      likes_count: 0,
      comments_count: 0,
      user_has_liked: false
    };
  }

  async getStories(userId?: string): Promise<Story[]> {
    return this.db.getAllStories(userId);
  }

  async likeStory(storyId: string, userId: string): Promise<void> {
    await this.db.likeStory(uuidv4(), storyId, userId);
  }

  async unlikeStory(storyId: string, userId: string): Promise<void> {
    await this.db.unlikeStory(storyId, userId);
  }

  async addComment(storyId: string, userId: string, commentData: PostCommentRequest): Promise<StoryComment> {
    const { body } = commentData;

    if (!body) {
      throw new AppError('Comment body is required', 400);
    }

    return this.db.addComment({
      id: uuidv4(),
      story_id: storyId,
      user_id: userId,
      body
    });
  }

  async getComments(storyId: string): Promise<StoryComment[]> {
    return this.db.getCommentsByStory(storyId);
  }

  async updateStory(storyId: string, citizenId: string, updateData: any): Promise<Story> {
    const updated = await this.db.updateStory(storyId, citizenId, updateData);
    if (!updated) {
      throw new AppError('Story not found or unauthorized', 404);
    }
    return updated;
  }

  async deleteStory(storyId: string, citizenId: string): Promise<void> {
    const deleted = await this.db.deleteStory(storyId, citizenId);
    if (!deleted) {
      throw new AppError('Story not found or unauthorized', 404);
    }
  }

  async getStats(): Promise<any> {
    return this.db.getCommunityStats();
  }
}
