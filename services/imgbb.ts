
const IMGBB_API_KEY = 'e437e058d45f80a2f4c0194e8d4520d4';
const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';

export const uploadToImgBB = async (base64Image: string): Promise<string> => {
  // Remove data:image/...;base64, prefix if present
  const base64Data = base64Image.split(',')[1] || base64Image;

  const formData = new FormData();
  formData.append('image', base64Data);

  try {
    const response = await fetch(`${IMGBB_ENDPOINT}?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'ImgBB Upload Failed');
    }

    const result = await response.json();
    return result.data.url;
  } catch (error) {
    console.error('ImgBB Upload Error:', error);
    throw error;
  }
};
