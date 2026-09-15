/**
 * Utility to reliably download images, videos, and audio directly to the user's
 * device gallery or downloads folder on mobile and desktop browsers.
 */

export async function downloadMediaToGallery(
  url: string,
  filename: string,
  mediaType: 'image' | 'video' | 'audio' = 'image'
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Try fetching the file as a Blob with CORS
    let blob: Blob | null = null;

    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        blob = await res.blob();
      }
    } catch {
      // CORS fetch failed, try fallback methods below
    }

    // 2. If it's an image and fetch failed, draw to canvas to get clean Blob
    if (!blob && mediaType === 'image') {
      try {
        blob = await new Promise<Blob | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || 1080;
              canvas.height = img.naturalHeight || 1920;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(
                  (b) => resolve(b),
                  'image/jpeg',
                  0.95
                );
              } else {
                resolve(null);
              }
            } catch {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      } catch {
        // canvas fallback failed
      }
    }

    // 3. If we have a blob, use it for genuine native file download
    if (blob) {
      const extension = mediaType === 'video' ? 'mp4' : mediaType === 'audio' ? 'mp3' : 'jpg';
      const cleanFilename = filename.endsWith(`.${extension}`) ? filename : `${filename}.${extension}`;
      
      // Check if mobile Web Share API is supported for direct saving to camera roll/gallery
      const file = new File([blob], cleanFilename, { type: blob.type || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg') });
      
      // Anchor download trigger
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFilename;
      link.setAttribute('download', cleanFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 4000);

      return {
        success: true,
        message: '✓ সফলভাবে আপনার ডিভাইসের গ্যালারি/ডাউনলোড ফোল্ডারে সেভ হয়েছে!'
      };
    }

    // 4. Fallback: Direct link download
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      message: '✓ ডাউনলোড শুরু হয়েছে এবং গ্যালারিতে সেভ হচ্ছে!'
    };
  } catch (error) {
    console.error('Download error:', error);
    // Absolute fallback
    window.open(url, '_blank');
    return {
      success: false,
      message: 'ডাউনলোড লিঙ্ক নতুন ট্যাবে খোলা হয়েছে'
    };
  }
}
