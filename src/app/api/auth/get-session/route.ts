import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (session?.user) {
    return NextResponse.json(session);
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    const headers = new Headers(request.headers);
    headers.set('cookie', `better-auth.session_token=${token}`);

    const bearerSession = await auth.api.getSession({ headers });

    if (bearerSession?.user) {
      return NextResponse.json(bearerSession);
    }
  }

  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}
