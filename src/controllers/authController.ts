import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response) {
    try {
      const { name, email, phone, password, role = UserRole.CITIZEN } = req.body;

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
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Registration failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      res.json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Login failed' });
    }
  }
}
