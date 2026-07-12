import { prisma } from '../lib/prisma';

async function main(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
  console.log('Connected to PostgreSQL.');
}

main()
  .catch((error: unknown) => {
    console.error('Unable to connect to PostgreSQL.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
