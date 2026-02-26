// File validation and utility functions

export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

export const DEFAULT_OPTIONS: FileUploadOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'png', 'jpg', 'jpeg', 'gif'],
};

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: FileUploadOptions = DEFAULT_OPTIONS
): { valid: boolean; error?: string } {
  const { maxSize = DEFAULT_OPTIONS.maxSize, allowedTypes = DEFAULT_OPTIONS.allowedTypes } = options;

  // Check file size
  if (maxSize && file.size > maxSize) {
    return {
      valid: false,
      error: `文件大小超过限制。最大: ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: `不支持的文件类型。允许: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Generate unique file name
 */
export function generateFileName(file: File): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = file.name.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Convert file size to readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
