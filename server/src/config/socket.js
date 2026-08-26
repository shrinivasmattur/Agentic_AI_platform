const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: false,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket Client Connected: ${socket.id}`);

    socket.on('subscribe:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
        console.log(`Socket ${socket.id} joined room execution:${executionId}`);
      }
    });

    socket.on('unsubscribe:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('Socket.IO not initialized yet');
  }
  return io;
};

const emitAgentEvent = (executionId, eventData) => {
  if (!io) return;
  io.to(`execution:${executionId}`).emit('agent:event', {
    executionId,
    timestamp: new Date(),
    ...eventData,
  });

  io.emit('system:notification', {
    executionId,
    timestamp: new Date(),
    ...eventData,
  });
};

module.exports = {
  initSocket,
  getIO,
  emitAgentEvent,
};
