"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryController = void 0;
const storyService_1 = require("../services/storyService");
const errorHandler_1 = require("../middleware/errorHandler");
class StoryController {
    constructor() {
        this.storyService = new storyService_1.StoryService();
    }
    async createStory(req, res) {
        try {
            const citizenId = req.user?.id;
            if (!citizenId)
                throw new errorHandler_1.AppError('Unauthorized', 401);
            const story = await this.storyService.createStory(citizenId, req.body);
            res.status(201).json({ message: 'Story shared successfully', story });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                return res.status(error.statusCode).json({ message: error.message });
            res.status(500).json({ message: 'Failed to share story' });
        }
    }
    async getStories(req, res) {
        try {
            const userId = req.user?.id;
            const stories = await this.storyService.getStories(userId);
            res.json({ stories });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch stories' });
        }
    }
    async likeStory(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new errorHandler_1.AppError('Unauthorized', 401);
            const { id } = req.params;
            await this.storyService.likeStory(id, userId);
            res.json({ message: 'Story liked' });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to like story' });
        }
    }
    async unlikeStory(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new errorHandler_1.AppError('Unauthorized', 401);
            const { id } = req.params;
            await this.storyService.unlikeStory(id, userId);
            res.json({ message: 'Story unliked' });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to unlike story' });
        }
    }
    async addComment(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new errorHandler_1.AppError('Unauthorized', 401);
            const { id } = req.params;
            const comment = await this.storyService.addComment(id, userId, req.body);
            res.status(201).json({ message: 'Comment added', comment });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                return res.status(error.statusCode).json({ message: error.message });
            res.status(500).json({ message: 'Failed to add comment' });
        }
    }
    async getComments(req, res) {
        try {
            const { id } = req.params;
            const comments = await this.storyService.getComments(id);
            res.json({ comments });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch comments' });
        }
    }
    async updateStory(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new errorHandler_1.AppError('Unauthorized', 401);
            const { id } = req.params;
            const story = await this.storyService.updateStory(id, userId, req.body);
            res.json({ message: 'Story updated successfully', story });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                return res.status(error.statusCode).json({ message: error.message });
            res.status(500).json({ message: 'Failed to update story' });
        }
    }
    async deleteStory(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new errorHandler_1.AppError('Unauthorized', 401);
            const { id } = req.params;
            await this.storyService.deleteStory(id, userId);
            res.json({ message: 'Story deleted successfully' });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                return res.status(error.statusCode).json({ message: error.message });
            res.status(500).json({ message: 'Failed to delete story' });
        }
    }
    async getStats(req, res) {
        try {
            const stats = await this.storyService.getStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch community stats' });
        }
    }
}
exports.StoryController = StoryController;
