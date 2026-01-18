import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, phone, password, role = UserRole.CITIZEN } = req.body;

      if (!name || !email || !password) {
        throw new AppError('Name, email, and password are required', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      const token = jwt.sign(
        { id: userId, role },
        config.jwt.secret
      );

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

      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const userId = uuidv4();
      const userRole = UserRole.CITIZEN;

      const token = jwt.sign(
        { id: userId, role: userRole },
        config.jwt.secret
      );

      res.json({
        message: 'Login successful',
        user: {
          id: userId,
          email,
          role: userRole
        },
        token
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Login failed' });
    }
  }
}
