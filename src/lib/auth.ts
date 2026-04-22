import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { getDb } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'eng-learn-local-secret-key-2026-for-dev-only-please-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  database: drizzleAdapter(getDb(), {
    provider: 'sqlite',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 1,
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 31,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      nickname: {
        type: 'string',
        required: false,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
      isAgent: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const data = { ...user } as Record<string, unknown>;
          if (!data.nickname && data.username) {
            data.nickname = data.username;
          }
          if (data.email && String(data.email).endsWith('@agent.local')) {
            data.isAgent = true;
          }
          return { data };
        },
      },
    },
  },
});
