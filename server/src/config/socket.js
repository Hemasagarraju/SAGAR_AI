const { Server } = require('socket.io');

let io = null;

function initSocket(httpServer, clientUrl) {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join execution room to listen to granular agent timeline events
    socket.on('join:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined room execution:${executionId}`);
      }
    });

    socket.on('leave:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
        console.log(`[Socket.IO] Socket ${socket.id} left room execution:${executionId}`);
      }
    });

    // Join user notifications room
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user room user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

function emitExecutionEvent(executionId, eventName, data) {
  if (io && executionId) {
    io.to(`execution:${executionId}`).emit(eventName, data);
    // Also emit globally for live dashboard activity feeds
    io.emit('dashboard:activity', { executionId, eventName, data });
  }
}

function emitUserNotification(userId, notification) {
  if (io && userId) {
    io.to(`user:${userId}`).emit('notification:new', notification);
    io.emit('notification:broadcast', notification);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitExecutionEvent,
  emitUserNotification
};
