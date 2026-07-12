declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: 'ADMIN' | 'STAFF';
      };
    }
  }
}

export {};
