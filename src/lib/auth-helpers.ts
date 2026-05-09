import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  username: string | null;
  displayUsername: string | null;
  nickname: string | null;
  role: string;
  isAgent: boolean;
};

type SessionResult = {
  user: SessionUser;
  session: unknown;
} | null;

export async function getSession(request: NextRequest): Promise<SessionResult> {
  return auth.api.getSession({ headers: request.headers }) as Promise<SessionResult>;
}
