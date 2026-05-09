import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validateApiToken } from '@/lib/token';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (session?.user) {
    return NextResponse.json(session);
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const userId = await validateApiToken(token);

    if (userId) {
      const db = getDb();
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });

      if (user) {
        return NextResponse.json({ user });
      }
    }
  }

  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}
