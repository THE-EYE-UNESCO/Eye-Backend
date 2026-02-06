"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
    constructor() {
        this.authService = new authService_1.AuthService();
    }
    async register(req, res) {
        try {
            const { name, email, phone, password, role = types_1.UserRole.CITIZEN } = req.body;
            const result = await this.authService.register({
                name,
                email,
                phone,
                password,
                role
            });
            res.status(201).json({
                message: 'User registered successfully',
                ...result
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Registration failed', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            res.json({
                message: 'Login successful',
                ...result
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
