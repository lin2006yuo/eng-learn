import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createApiToken } from '@/lib/token';

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

    const result = await auth.api.signInUsername({
      body: {
        username: decoded.username,
        password: decoded.password,
        rememberMe: true,
      },
      returnHeaders: true,
    });

    if (!result?.response?.user) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 });
    }

    const userId = result.response.user.id;
    const apiToken = await createApiToken(userId, 'cli', 90);

    const response = NextResponse.json({ ok: true, token: apiToken });

    for (const cookie of result.headers.getSetCookie()) {
      response.headers.append('Set-Cookie', cookie);
    }

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
