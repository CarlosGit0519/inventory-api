import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

async function startServer(): Promise<void> {
  await prisma.$connect();
  console.log('Connected to PostgreSQL.');

  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}.`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Unable to start server.', error);
  process.exit(1);
});
