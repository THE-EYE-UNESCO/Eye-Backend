"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryService = void 0;
const databaseService_1 = require("./databaseService");
const errorHandler_1 = require("../middleware/errorHandler");
const uuid_1 = require("uuid");
class StoryService {
    constructor() {
        this.db = databaseService_1.DatabaseService.getInstance();
    }
    async createStory(citizenId, storyData) {
        const { title, body, image_url, tag } = storyData;
        if (!title || !body) {
            throw new errorHandler_1.AppError('Title and body are required', 400);
        }
        const story = await this.db.createStory({
            id: (0, uuid_1.v4)(),
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
    async getStories(userId) {
        return this.db.getAllStories(userId);
    }
    async likeStory(storyId, userId) {
        await this.db.likeStory((0, uuid_1.v4)(), storyId, userId);
    }
    async unlikeStory(storyId, userId) {
        await this.db.unlikeStory(storyId, userId);
    }
    async addComment(storyId, userId, commentData) {
        const { body } = commentData;
        if (!body) {
            throw new errorHandler_1.AppError('Comment body is required', 400);
        }
        return this.db.addComment({
            id: (0, uuid_1.v4)(),
            story_id: storyId,
            user_id: userId,
            body
        });
    }
    async getComments(storyId) {
        return this.db.getCommentsByStory(storyId);
    }
    async updateStory(storyId, citizenId, updateData) {
        const updated = await this.db.updateStory(storyId, citizenId, updateData);
        if (!updated) {
            throw new errorHandler_1.AppError('Story not found or unauthorized', 404);
        }
        return updated;
    }
    async deleteStory(storyId, citizenId) {
        const deleted = await this.db.deleteStory(storyId, citizenId);
        if (!deleted) {
            throw new errorHandler_1.AppError('Story not found or unauthorized', 404);
        }
    }
    async getStats() {
        return this.db.getCommunityStats();
    }
}
exports.StoryService = StoryService;
