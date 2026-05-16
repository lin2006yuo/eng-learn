import sharp from 'sharp';

const MAX_WIDTH = 512;
const MAX_HEIGHT = 512;
const WEBP_QUALITY = 80;

export async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}
