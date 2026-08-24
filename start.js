const { spawn } = require('child_process');
const path = require('path');

const publicPort = process.env.PORT || 3000;
const backendPort = process.env.BACKEND_PORT || 5000;

console.log('====================================================');
console.log('🚀 [SAGAR AI] Starting Full-Stack Cloud Deployment');
console.log(`📡 Public Frontend Port (Next.js): ${publicPort}`);
console.log(`⚡ Internal Backend Port (Express): ${backendPort}`);
console.log('====================================================');

// 1. Start backend server
const serverProcess = spawn('node', ['src/server.js'], {
  cwd: path.join(__dirname, 'server'),
  env: {
    ...process.env,
    PORT: backendPort.toString()
  },
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('[Runner] Backend error:', err);
});

// 2. Start Next.js client
const clientProcess = spawn('npx', ['next', 'start', '-H', '0.0.0.0', '-p', publicPort.toString()], {
  cwd: path.join(__dirname, 'client'),
  env: {
    ...process.env,
    PORT: publicPort.toString(),
    BACKEND_INTERNAL_URL: `http://127.0.0.1:${backendPort}`
  },
  stdio: 'inherit'
});

clientProcess.on('error', (err) => {
  console.error('[Runner] Frontend error:', err);
});

// Graceful shutdown
const cleanExit = () => {
  console.log('[Runner] Shutting down services...');
  try { serverProcess.kill(); } catch (e) {}
  try { clientProcess.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGTERM', cleanExit);
process.on('SIGINT', cleanExit);
