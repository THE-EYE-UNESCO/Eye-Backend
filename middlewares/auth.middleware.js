import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

export const authorise = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token || typeof (token) == "undefined") {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    const user = await User.findById(decoded.id).select('-password -role');
    if (!user) {
      return res.status(404).json({ message: 'No user found with this token' });
    }
    const id = user._id;
    req.user = { id };
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
