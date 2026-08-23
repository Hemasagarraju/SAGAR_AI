require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agentflow_ai',
  jwtSecret: process.env.JWT_SECRET || 'agentflow_ai_jwt_secret_dev_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  credentialEncryptionKey: process.env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
};
