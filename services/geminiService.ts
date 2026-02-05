import { GoogleGenAI, Type } from "@google/genai";
import { BestOutfitSelection, OutfitSuggestion, Product } from '../types';

/**
 * Robust retry wrapper for high-throughput studio usage.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 4, baseDelay = 2000): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message?.toLowerCase() || "";
      const isQuotaError = errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("limit");
      
      if (attempt < maxRetries - 1 && isQuotaError) {
        const delay = baseDelay * (attempt + 1) + Math.random() * 1000;
        console.warn(`[LuxeFit] Calibrating Neural Channels. Syncing in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * High-Efficiency Resizer for Gemini 2.5 Flash Image.
 */
export const resizeImage = async (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str) { resolve(""); return; }
    const img = new Image();
    const src = base64Str.startsWith('data:') ? base64Str : `data:image/jpeg;base64,${base64Str}`;
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(base64Str.split(',')[1] || base64Str); return; }
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = () => resolve(base64Str.split(',')[1] || base64Str); 
  });
};

export const imageUrlToBase64 = async (url: string): Promise<string> => {
  const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg&q=85`;
  const response = await fetch(proxiedUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * High-Performance Virtual Try-On using Gemini 2.5 Flash Image.
 * Optimized for photorealism, fabric physics, and lighting harmony.
 */
export const generateVirtualTryOn = async (userImageBase64: string, dressImageBase64: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanUser = await resizeImage(userImageBase64, 1024, 1024);
    const cleanDress = await resizeImage(dressImageBase64, 1024, 1024);
    
    const prompt = `VIRTUAL TRY-ON SYNTHESIS PROTOCOL (HIGH PHOTOREALISM):
    1. ANALYZE: Image 1 is the subject person. Image 2 is the target garment.
    2. ERASING & PREPARATION: Properly erase all traces of original clothing, accessories, or interfering patterns from the person in Image 1. Pay meticulous attention to hands, neck, arms, and torso edges to ensure the original fabric is completely removed before the new layer is applied.
    3. DRAPING & PHYSICS: Map the garment from Image 2 onto the subject in Image 1. Simulate realistic fabric wrinkles, folds, and creases that occur naturally based on the subject's specific body pose, limb positions, and gravitational tension. The fabric must follow the body's silhouette perfectly.
    4. TEXTURE & MATERIAL: Preserve the realistic texture, weave, and sheen of the garment from Image 2, ensuring it looks like a physical material (e.g., silk, cotton, denim).
    5. LIGHTING & COLOR GRADING: Analyze the ambient lighting (direction, intensity, temperature) in Image 1. Apply subtle color grading and shadow matching to the garment so it natively integrates into the lighting environment of the original scene.
    6. IDENTITY PRESERVATION: Maintain the subject's exact face, hair, skin tone, hands, and background from Image 1 without any distortion or neural hallucinations.
    7. FINAL FINISH: Produce a seamless, high-fidelity fashion editorial result with no blurred artifacts or visible edges.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanUser } },
          { inlineData: { mimeType: 'image/jpeg', data: cleanDress } },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: { aspectRatio: "3:4" }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part) throw new Error("Synthesis failed.");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const chatWithAI = async (message: string, imageBase64?: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [{ text: message }];
    if (imageBase64) {
      const cleanImg = await resizeImage(imageBase64, 512, 512);
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanImg } });
    }
    
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: { parts },
      config: {
        systemInstruction: "You are LuxeFit AI. Provide elite, concise styling advice in one expert sentence.",
        maxOutputTokens: 100,
      }
    });
    return response.text || "...";
  });
};

export const analyzeColorTheory = async (imageBase64: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanImg = await resizeImage(imageBase64, 512, 512);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { text: "Analyze skin tones. Return JSON." }, 
          { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }
        ] 
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            season: { type: Type.STRING },
            colors: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.STRING }
          },
          required: ["season", "colors", "advice"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateLookbookImage = async (garmentBase64: string, items: OutfitSuggestion[], title: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanImg = await resizeImage(garmentBase64, 1024, 1024);
    const itemsText = items.map(i => i.itemName).join(", ");
    const prompt = `HIGH-FIDELITY LOOKBOOK: Create a professional fashion editorial for ${title}. 
    Feature the main garment from the image styled with ${itemsText}. 
    Clean composition, premium studio lighting.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part) throw new Error("Lookbook failed.");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const generateProductImage = async (desc: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Product shot of ${desc}, centered, pure white background.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part) throw new Error("Asset failure.");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const selectBestOutfit = async (images: string[], context: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const resizedImages = await Promise.all(images.map(img => resizeImage(img, 512, 512)));
    const parts: any[] = [{ text: `Best for ${context}? Return JSON.` }];
    resizedImages.forEach(img => parts.push({ inlineData: { mimeType: 'image/jpeg', data: img } }));

    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: { parts }, 
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            selectedIndex: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            stylingTips: { type: Type.STRING }
          },
          required: ["selectedIndex", "reasoning", "stylingTips"]
        }
      } 
    });
    return JSON.parse(response.text || "{}");
  });
};

export const getStylistSuggestions = async (imageBase64: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanImg = await resizeImage(imageBase64, 768, 768);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { text: "Suggest 3 pieces. Return JSON." }, 
          { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }
        ] 
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptTitle: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  searchQuery: { type: Type.STRING },
                  visualDescription: { type: Type.STRING }
                },
                required: ["itemName", "description", "category", "searchQuery", "visualDescription"]
              }
            }
          },
          required: ["conceptTitle", "suggestions"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const refineVirtualTryOn = async (imageBase64: string, type: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanImg = await resizeImage(imageBase64, 1024, 1024);
    const prompt = `REFINE PROTOCOL: Optimize lighting and fit for ${type}. Remove artifacts. Ensure realistic shadows and fabric textures.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : "";
  });
};