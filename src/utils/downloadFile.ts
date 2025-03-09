
/**
 * Downloads a file from a URL
 * @param url The URL of the file to download
 * @param filename Optional filename to use for the download
 */
export const downloadFile = async (url: string, filename?: string) => {
  try {
    // Use the download edge function
    const downloadUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download?url=${encodeURIComponent(url)}`;
    
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    if (filename) {
      link.download = filename;
    }
    
    // Append to the document
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}
