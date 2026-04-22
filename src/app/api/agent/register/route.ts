import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { randomBytes, randomUUID } from 'crypto';

function encodeAgentKey(username: string, password: string): string {
  const payload = JSON.stringify({ username, password });
  return Buffer.from(payload).toString('base64');
}

export async function POST(_request: NextRequest) {
  try {
    const username = `agent${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const password = randomBytes(16).toString('hex');
    const email = `${username}@agent.local`;

    const result = await auth.api.signUpEmail({
      body: {
        username,
        password,
        email,
        name: username,
      },
    });

    if (!result) {
      return NextResponse.json({ error: 'Failed to create agent user' }, { status: 500 });
    }

    const agentKey = encodeAgentKey(username, password);

    return NextResponse.json({ ok: true, agentKey });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
