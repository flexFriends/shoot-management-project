import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { prisma } from './src/config/db.js';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = http.createServer(app);

// Health check - ensure DB is connected
async function startServer() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection established');

    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   Studio Shoot Management System       ║
║   Environment: ${NODE_ENV.padEnd(24)}║
║   Server: http://localhost:${PORT.toString().padEnd(27)}║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

startServer();

export default server;
