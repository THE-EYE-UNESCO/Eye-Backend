import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateTokenAndSetCookie = async (userId, res) => {
  try {
    const token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );
    // Set cookie
    res.cookie('token', token, {
      expires: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  } catch (error) {
    throw new Error(error)
  }
};