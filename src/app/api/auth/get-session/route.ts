import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (session?.user) {
    return NextResponse.json(session);
  }

  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}
