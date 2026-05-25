import { cloudinary } from './cloudinary.service.js';
import { buildUploadFolder, optimizeImageBuffer } from './optimize.service.js';

type UploadScope = 'architects' | 'portfolios' | 'consultations' | 'inspirations' | 'projects' | 'deliverables';

type UploadOptions = {
  scope: UploadScope;
  resourceType?: 'image' | 'raw' | 'auto';
  fileName?: string;
  folderSuffix?: string;
};

export const uploadToCloudinary = async (buffer: Buffer, mimeType: string, options: UploadOptions) => {
  const folder = options.folderSuffix ? `${buildUploadFolder(options.scope)}/${options.folderSuffix}` : buildUploadFolder(options.scope);
  const isImage = mimeType.startsWith('image/');
  const uploadBuffer = isImage ? await optimizeImageBuffer(buffer) : buffer;
  const dataUri = `data:${mimeType};base64,${uploadBuffer.toString('base64')}`;

  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: options.resourceType || (isImage ? 'image' : 'auto'),
    filename_override: options.fileName,
    unique_filename: true,
    overwrite: false,
    quality: 'auto:good',
    fetch_format: 'auto',
  });
};
