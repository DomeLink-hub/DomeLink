import { cloudinary } from './cloudinary.service.js';

export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'raw' | 'video' | 'auto' = 'image') => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
};
