import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { DatabaseService } from './databaseService';
import { User, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';

export class AuthService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async register(userData: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    password: string;
    role?: UserRole;
  }): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const { name, email, phone, address, password, role = UserRole.CITIZEN } = userData;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.db.createUser({
      name,
      email,
      phone: phone || '',
      address: address || '',
      role,
      password_hash: hashedPassword
    });

    const token = this.generateToken(user.id, user.role);

    const { password_hash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await this.db.getUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user.id, user.role);

    const { password_hash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async verifyToken(token: string): Promise<{ id: string; role: UserRole }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string; role: UserRole };
      return decoded;
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }

  private generateToken(userId: string, role: UserRole): string {
    return jwt.sign(
      { id: userId, role },
      config.jwt.secret
    );
  }
}
