import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      personId: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    personId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    personId: string | null;
  }
}
