import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

function decodeAgentKey(agentKey: string): { username: string; password: string } | null {
  try {
    const payload = Buffer.from(agentKey, 'base64').toString('utf-8');
    const parsed = JSON.parse(payload) as { username: string; password: string };
    if (!parsed.username || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { agentKey?: string };
    const { agentKey } = body;

    if (!agentKey) {
      return NextResponse.json({ error: 'Agent key is required' }, { status: 400 });
    }

    const decoded = decodeAgentKey(agentKey);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid agent key' }, { status: 401 });
    }

    const signInResult = await auth.api.signInUsername({
      body: {
        username: decoded.username,
        password: decoded.password,
        rememberMe: true,
      },
    }) as { token: string; user: { id: string } };

    if (!signInResult?.user) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 });
    }

    const sessionToken = signInResult.token;

    const response = NextResponse.json({ ok: true, token: sessionToken });
    response.headers.set(
      'Set-Cookie',
      `better-auth.session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    );

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
