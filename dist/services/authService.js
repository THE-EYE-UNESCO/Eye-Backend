"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const databaseService_1 = require("./databaseService");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
const config_1 = require("../config");
class AuthService {
    constructor() {
        this.db = databaseService_1.DatabaseService.getInstance();
    }
    async register(userData) {
        const { name, email, phone, password, role = types_1.UserRole.CITIZEN } = userData;
        if (!name || !email || !password) {
            throw new errorHandler_1.AppError('Name, email, and password are required', 400);
        }
        if (password.length < 6) {
            throw new errorHandler_1.AppError('Password must be at least 6 characters long', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await this.db.createUser({
            name,
            email,
            phone: phone || '',
            role,
            password_hash: hashedPassword
        });
        const token = this.generateToken(user.id, user.role);
        const { password_hash: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async login(email, password) {
        if (!email || !password) {
            throw new errorHandler_1.AppError('Email and password are required', 400);
        }
        const user = await this.db.getUserByEmail(email);
        if (!user) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        const token = this.generateToken(user.id, user.role);
        const { password_hash: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
            return decoded;
        }
        catch (error) {
            throw new errorHandler_1.AppError('Invalid token', 401);
        }
    }
    generateToken(userId, role) {
        return jsonwebtoken_1.default.sign({ id: userId, role }, config_1.config.jwt.secret);
    }
}
exports.AuthService = AuthService;
