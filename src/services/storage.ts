import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'book-cover';

export async function uploadBookCover(file: File, bookId: number): Promise<string> {
  try {
    console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `book-${bookId}-${Date.now()}.${fileExtension}`;
    const filePath = `covers/${fileName}`;
    
    console.log('Uploading to path:', filePath);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error(`Failed to upload book cover: ${error.message}`);
    }

    console.log('Upload successful, data:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    console.log('Public URL generated:', publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('Unexpected error uploading book cover:', err);
    throw err;
  }
}

export async function deleteBookCover(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.indexOf(BUCKET_NAME);
    
    if (bucketIndex === -1) {
      console.warn('Could not extract file path from URL:', imageUrl);
      return;
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting book cover:', error);
      // Don't throw - we don't want to block book deletion if image deletion fails
    }
  } catch (err) {
    console.error('Unexpected error deleting book cover:', err);
  }
}

export async function getBookCoverUrl(path: string): Promise<string> {
  try {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (err) {
    console.error('Error getting book cover URL:', err);
    return '';
  }
}