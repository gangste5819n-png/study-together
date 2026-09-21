import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password using bcrypt
 */
export const hashPassword = async (plainPassword) => {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Valid password string is required for hashing');
  }
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Compares plain-text password with bcrypt hash
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generates a signed JWT for an authenticated user
 */
export const generateToken = (user) => {
  const payload = {
    userId: user._id ? user._id.toString() : user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Verifies a JWT token and returns decoded payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
};
