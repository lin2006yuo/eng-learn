import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadToR2 } from '@/lib/r2-upload';
import { compressImage } from '@/lib/image-compress';
import { hashBuffer, findExistingImage, saveImageCache } from '@/lib/image-hash';
import { HttpCode } from '@/shared/types/http-code';

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: HttpCode.UNAUTHORIZED });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: '请选择文件' }, { status: HttpCode.BAD_REQUEST });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: '只允许图片' }, { status: HttpCode.BAD_REQUEST });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '图片不能超过 5MB' }, { status: HttpCode.BAD_REQUEST });
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImage(rawBuffer);
  const hash = hashBuffer(compressed);

  const existingUrl = await findExistingImage(hash);
  if (existingUrl) {
    return NextResponse.json({ url: existingUrl });
  }

  const url = await uploadToR2(compressed, `${Date.now()}.webp`, 'image/webp');
  await saveImageCache(hash, url, compressed.length);

  return NextResponse.json({ url });
}