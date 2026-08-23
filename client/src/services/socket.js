import { io } from 'socket.io-client';

let socket = null;

function getSocketUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
}

export function getSocket() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!socket) {
    const serverUrl = getSocketUrl();
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      autoConnect: true,
      extraHeaders: {
        'Bypass-Tunnel-Reminder': 'true'
      }
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to SAGARAGENT_AI real-time stream:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  return socket;
}

export function joinExecutionRoom(executionId) {
  const s = getSocket();
  if (s && executionId) {
    s.emit('join:execution', executionId);
  }
}

export function leaveExecutionRoom(executionId) {
  const s = getSocket();
  if (s && executionId) {
    s.emit('leave:execution', executionId);
  }
}

export function joinUserRoom(userId) {
  const s = getSocket();
  if (s && userId) {
    s.emit('join:user', userId);
  }
}
