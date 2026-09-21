import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const getClientOrigins = () => {
  const originStr = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  return originStr.split(',').map((o) => o.trim()).filter(Boolean);
};

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  clientOrigin: process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  clientOrigins: getClientOrigins(),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studytogether',
  jwtSecret: process.env.JWT_SECRET || 'dev_study_together_jwt_secret_key_change_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

if (config.isProduction && config.jwtSecret === 'dev_study_together_jwt_secret_key_change_in_prod') {
  console.warn('[SECURITY WARNING] Using default fallback JWT secret in production mode! Set a strong JWT_SECRET environment variable.');
}

