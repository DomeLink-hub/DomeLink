import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env.js';

const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;
const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'domelink';

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('Cloudinary not fully configured. Set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET to enable uploads.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };

type UploadResult = {
  public_id: string;
  secure_url: string;
  resource_type: string;
  bytes?: number;
  width?: number;
  height?: number;
};

export const uploadFile = async (filePath: string, opts: { folder?: string; resourceType?: 'image' | 'auto' } = {}) => {
  const folder = opts.folder || uploadFolder;
  const resource_type = opts.resourceType || 'auto';
  const res = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type,
    quality: 'auto:good',
    fetch_format: 'auto',
    transformation: { quality: 'auto' },
  });
  return res as unknown as UploadResult;
};

export const deleteResource = async (publicId: string, resourceType: 'image' | 'raw' | 'auto' = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export const generateResponsiveUrls = (publicId: string, sizes: number[] = [360, 720, 1080]) => {
  return sizes.map((w) => cloudinary.url(publicId, { width: w, crop: 'scale', quality: 'auto', fetch_format: 'auto' }));
};

export const getTransformedUrl = (publicId: string, options: { width?: number; height?: number; crop?: string } = {}) => {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'scale',
    quality: 'auto',
    fetch_format: 'auto',
  });
};

export default {
  uploadFile,
  deleteResource,
  generateResponsiveUrls,
  getTransformedUrl,
};
