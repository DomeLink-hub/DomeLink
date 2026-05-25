import sharp from 'sharp';

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
]);

export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
]);

export const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export const isSupportedUploadType = (mimeType: string) =>
  ALLOWED_IMAGE_MIME_TYPES.has(mimeType) || ALLOWED_DOCUMENT_MIME_TYPES.has(mimeType);

export const optimizeImageBuffer = async (input: Buffer) => {
  return sharp(input)
    .rotate()
    .resize({ width: 2200, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
};

export const buildUploadFolder = (scope: 'architects' | 'portfolios' | 'consultations' | 'inspirations' | 'projects' | 'deliverables') => {
  return `domelink/${scope}`;
};
