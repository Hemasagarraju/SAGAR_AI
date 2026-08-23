const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { initQueue } = require('./queues/executionQueue');

const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);

// Security & Utility Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from client or local dev tools
      callback(null, true);
    },
    credentials: true
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'SAGARAGENT_AI Multi-Agent Operations Automation Platform',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Bootstrap Server
async function bootstrap() {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Initialize Socket.IO
    initSocket(server, env.clientUrl);
    console.log('[Socket.IO] Real-time engine initialized.');

    // 3. Initialize BullMQ / InMemory Queue
    initQueue();

    // 4. Start HTTP Server
    server.listen(env.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 SAGARAGENT_AI Server running on port ${env.port}`);
      console.log(`📡 Client URL: ${env.clientUrl}`);
      console.log(`⚡ Environment: ${env.nodeEnv}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal error during bootstrap:', err);
    process.exit(1);
  }
}

bootstrap();

module.exports = { app, server };
