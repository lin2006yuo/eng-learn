import { createAuthClient } from 'better-auth/react';
import { usernameClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { auth } from '@/lib/auth';

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});

export const { signIn, signUp, signOut, useSession, updateUser } = authClient;
