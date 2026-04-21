import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { getDb } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export const auth = betterAuth({
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
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.nickname && user.username) {
            return {
              data: {
                ...user,
                nickname: user.username,
              },
            };
          }
          return { data: user };
        },
      },
    },
  },
});
