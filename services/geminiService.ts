import { GoogleGenAI, Type } from "@google/genai";
import { BestOutfitSelection, OutfitSuggestion, Product } from '../types';

/**
 * Robust Neural Retry Wrapper.
 * Prevents "lag" errors by silently handling network jitter and rate limits (429/503).
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, baseDelay = 3000): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message?.toLowerCase() || "";
      const isRetryable = errorMessage.includes("429") || 
                          errorMessage.includes("quota") || 
                          errorMessage.includes("limit") ||
                          errorMessage.includes("503") ||
                          errorMessage.includes("deadline");
      
      if (attempt < maxRetries - 1 && isRetryable) {
        const delay = baseDelay * (attempt + 1) + Math.random() * 1500;
        console.warn(`[Atelier] Neural link stabilizing. Calibrating attempt ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * High-Resolution Neural Image Pre-processor.
 * Prepares images for high-fidelity Gemini 2.5 synthesis.
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
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
 * MANDATORY SURGICAL TRY-ON SYNTHESIS.
 * High-Fidelity requirements: Photorealism, Pose-aware Draping, and Identity Lock.
 */
export const generateVirtualTryOn = async (userImageBase64: string, dressImageBase64: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanUser = await resizeImage(userImageBase64, 1024, 1024);
    const cleanDress = await resizeImage(dressImageBase64, 1024, 1024);
    
    const prompt = `NEURAL ATELIER PROTOCOL: SURGICAL FASHION SYNTHESIS.
    
    ASSETS:
    IMAGE 1: Subject person for try-on.
    IMAGE 2: Target garment/dress asset.
    
    EXECUTION DIRECTIVE (MANDATORY):
    1. SURGICAL CLOTHING ERASURE: Cleanly erase ALL traces of the original clothing from the person in Image 1. Pay microscopic attention to boundaries at the neck, shoulders, wrists, and ankles. Ensure no original fabric "ghosting" or shadows remain.
    2. FABRIC PHYSICS & DRAPING: Map the garment from Image 2 onto the subject in Image 1. You MUST simulate realistic fabric wrinkles, micro-creases, and tension points that occur naturally based on the subject's specific pose (e.g., bends in elbows, waist twists).
    3. MATERIAL FIDELITY: Observe the material in Image 2. 
       - If SILK/SATIN: Render with liquid-like drape, soft reflections, and high specular sheen.
       - If COTTON/LINEN: Render with visible weave texture, matte finish, and structural crispness.
    4. AMBIENT HARMONIZATION: Match the synthesized garment's lighting, color temperature, and shadows to the environment of Image 1 exactly.
    5. IDENTITY LOCK: Maintain the user's face, hair, and skin tone with 100% fidelity.
    
    FAILURE CONDITION: Return ONLY a high-fidelity pixel-perfect synthesis. Do NOT return original photos. Synthesis is mandatory.`;

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
        imageConfig: { aspectRatio: "3:4" },
        thinkingConfig: { thinkingBudget: 12000 } // Higher budget for complex physics calculations
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part) throw new Error("Synthesis failed to produce visual data. Neural recalibration required.");
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
        systemInstruction: "You are LuxeFit AI Concierge. Provide elite, one-sentence styling insights.",
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
          { text: "Analyze skin undertones for color theory. Return JSON." }, 
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
    const prompt = `HIGH-FIDELITY LOOKBOOK: Professional fashion editorial for ${title}. 
    Garment styled with ${itemsText}. Premium studio lighting.`;
    
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
      contents: { parts: [{ text: `High-end product shot of ${desc}, centered, pure white studio background.` }] },
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
    const parts: any[] = [{ text: `Analyze for ${context} and pick the best. Return JSON.` }];
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
          { text: "Suggest 3 complementary styling pieces. Return JSON." }, 
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
    const prompt = `REFINE PROTOCOL: Optimize lighting and fit for ${type}. Ensure realistic contact shadows and fabric micro-textures.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : "";
  });
};