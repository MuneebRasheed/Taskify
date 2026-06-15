import { supabase } from '../supabase/client';
import * as FileSystem from 'expo-file-system/legacy';

export interface UploadImageResult {
  url?: string;
  error?: string;
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Upload an image to Supabase Storage
 * @param uri - Local file URI from image picker
 * @param userId - User ID for organizing uploads
 * @returns Signed URL of uploaded image or error (valid for 1 year)
 */
export async function uploadCoverImage(
  uri: string,
  userId: string
): Promise<UploadImageResult> {
  try {
    console.log('[uploadCoverImage] Starting upload for user:', userId);
    console.log('[uploadCoverImage] Image URI:', uri);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${userId}/${timestamp}-${randomStr}.jpg`;
    
    console.log('[uploadCoverImage] Target filename:', fileName);

    // Read the image as base64 using expo-file-system
    let base64: string;
    try {
      base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      console.log('[uploadCoverImage] Base64 length:', base64.length);
    } catch (readError) {
      console.error('[uploadCoverImage] Failed to read file:', readError);
      return { error: 'Failed to read image file' };
    }

    if (!base64 || base64.length === 0) {
      console.error('[uploadCoverImage] Base64 is empty');
      return { error: 'Image file is empty' };
    }

    // Convert base64 to ArrayBuffer
    const arrayBuffer = base64ToArrayBuffer(base64);
    console.log('[uploadCoverImage] ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');

    if (arrayBuffer.byteLength === 0) {
      console.error('[uploadCoverImage] ArrayBuffer is empty');
      return { error: 'Failed to process image data' };
    }

    // Upload to Supabase Storage with ArrayBuffer
    const { data, error } = await supabase.storage
      .from('goal-covers')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('[uploadCoverImage] Upload error:', error);
      return { error: error.message };
    }

    console.log('[uploadCoverImage] Upload successful, path:', data.path);

    // Get signed URL (valid for 1 year = 31536000 seconds)
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from('goal-covers')
      .createSignedUrl(data.path, 31536000);

    if (signedError || !signedUrlData) {
      console.error('[uploadCoverImage] Signed URL error:', signedError);
      return { error: 'Failed to generate signed URL' };
    }

    console.log('[uploadCoverImage] Signed URL:', signedUrlData.signedUrl);
    return { url: signedUrlData.signedUrl };
  } catch (err) {
    console.error('[uploadCoverImage] Exception:', err);
    return { error: err instanceof Error ? err.message : 'Upload failed' };
  }
}
