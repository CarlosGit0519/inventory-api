import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
const port = Number(process.env.PORT ?? 3001);

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be defined.');
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number.');
}

export const env = {
  databaseUrl,
  port,
};
