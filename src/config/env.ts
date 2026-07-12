import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
const port = Number(process.env.PORT ?? 3001);
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '1h';

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be defined.');
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number.');
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined.');
}

export const env = {
  databaseUrl,
  port,
  jwtSecret,
  jwtExpiresIn,
};
