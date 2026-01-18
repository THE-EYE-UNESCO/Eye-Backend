"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const config_1 = require("../config");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
    async register(req, res) {
        try {
            const { name, email, phone, password, role = types_1.UserRole.CITIZEN } = req.body;
            if (!name || !email || !password) {
                throw new errorHandler_1.AppError('Name, email, and password are required', 400);
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const userId = (0, uuid_1.v4)();
            const token = jsonwebtoken_1.default.sign({ id: userId, role }, config_1.config.jwt.secret);
            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: userId,
                    name,
                    email,
                    phone,
                    role
                },
                token
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Registration failed' });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new errorHandler_1.AppError('Email and password are required', 400);
            }
            const userId = (0, uuid_1.v4)();
            const userRole = types_1.UserRole.CITIZEN;
            const token = jsonwebtoken_1.default.sign({ id: userId, role: userRole }, config_1.config.jwt.secret);
            res.json({
                message: 'Login successful',
                user: {
                    id: userId,
                    email,
                    role: userRole
                },
                token
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Login failed' });
        }
    }
}
exports.AuthController = AuthController;
