import { GoogleGenAI, Type } from "@google/genai";
import { BestOutfitSelection, OutfitSuggestion, Product } from '../types';

// Global retry logic for AI and remote asset synchronization
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 2000): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const msg = error?.message?.toLowerCase() || "";
      // Only retry on network or temporary server issues
      const isRetryable = msg.includes("429") || msg.includes("quota") || msg.includes("503") || msg.includes("limit") || msg.includes("deadline");
      if (attempt < maxRetries - 1 && isRetryable) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        console.warn(`[Atelier] Connection unstable. Syncing attempt ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Normalizes images for Gemini input.
 * Ensures images are JPEG and within resolution limits to avoid API rejection.
 */
export const resizeImage = async (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str) { resolve(""); return; }
    const img = new Image();
    const src = base64Str.startsWith('data:') ? base64Str : `data:image/jpeg;base64,${base64Str}`;
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(base64Str.split(',')[1] || base64Str); return; }
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Return raw base64 without prefix for Gemini SDK
      resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
    };
    img.onerror = () => resolve(base64Str.split(',')[1] || base64Str); 
  });
};

/**
 * Synchronizes remote assets (Boutique images) into base64 for processing.
 */
export const imageUrlToBase64 = async (url: string): Promise<string> => {
  return withRetry(async () => {
    // Using a reliable proxy to handle CORS for fashion assets
    const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg&q=80`;
    const response = await fetch(proxiedUrl);
    
    if (!response.ok) {
      throw new Error(`Cloud asset synchronization failed: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error("Neural processing failed to encode asset stream."));
        }
      };
      reader.onerror = () => reject(new Error("I/O error during asset serialization."));
      reader.readAsDataURL(blob);
    });
  });
};

/**
 * CORE: HIGH-FIDELITY VIRTUAL TRY-ON
 * Uses Gemini 2.5 Flash Image to synthesize subject and garment.
 */
export const generateVirtualTryOn = async (userImageBase64: string, dressImageBase64: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Ensure inputs are clean and resized
    const cleanUser = await resizeImage(userImageBase64, 1024, 1024);
    const cleanDress = await resizeImage(dressImageBase64, 1024, 1024);
    
    const prompt = `FASHION RECONSTRUCTION TASK:
    Perform a high-fidelity virtual try-on. 
    Subject: First image provided.
    Garment: Second image provided.
    
    INSTRUCTIONS:
    1. Replace the subject's current clothing with the target garment from the second image.
    2. Maintain subject identity (face, hair, skin tone) exactly.
    3. Ensure realistic draping and fabric physics based on the subject's pose.
    4. Harmonize lighting and shadows so the garment looks natively integrated.
    5. Output the single photorealistic result.`;

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
        // Note: maxOutputTokens and thinkingConfig are omitted for image generation to prevent SDK errors
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => !!p.inlineData);
    if (!part || !part.inlineData) {
      throw new Error("The neural engine failed to return visual data. Please try a clearer silhouette photo.");
    }
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

/**
 * CONCIERGE CHAT
 * Provides styling advice using Gemini 3 Flash.
 */
export const chatWithAI = async (message: string, imageBase64?: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [{ text: message }];
    
    if (imageBase64) {
      const cleanImg = await resizeImage(imageBase64, 512, 512);
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanImg } });
    }

    // DO set thinkingBudget to 0 when maxOutputTokens is set to avoid empty responses on Gemini 3 models
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: { parts },
      config: { 
        systemInstruction: "You are LuxeFit AI, a premium concierge. Provide elite styling advice in 1-2 elegant sentences.",
        maxOutputTokens: 150,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    return response.text || "I am currently recalibrating my aesthetic sensors. How else can I assist your style journey?";
  });
};

/**
 * BIOMETRIC COLOR THEORY
 * Analyzes skin tones to suggest palettes.
 */
export const analyzeColorTheory = async (imageBase64: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanImg = await resizeImage(imageBase64, 512, 512);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { text: "Analyze skin undertones from this selfie and return a Seasonal Palette JSON." }, 
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

/**
 * REFINEMENT
 * Tweaks specific visual parameters of a result.
 */
export const refineVirtualTryOn = async (imageBase64: string, type: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanImg = await resizeImage(imageBase64, 1024, 1024);
    const prompt = `Refine this fashion synthesis. Task: ${type}. Enhance shadows, lighting, and texture realism.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => !!p.inlineData);
    return (part && part.inlineData) ? `data:image/png;base64,${part.inlineData.data}` : "";
  });
};

/**
 * ATELIER STYLIST SUGGESTIONS
 * Suggests items to complete a look.
 */
export const getStylistSuggestions = async (imageBase64: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanImg = await resizeImage(imageBase64, 768, 768);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { text: "Suggest 3 complementary styling pieces to complete this outfit. Return as structured JSON." }, 
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

/**
 * ASSET GENERATION
 * Creates lookbooks or product shots.
 */
export const generateLookbookImage = async (garmentBase64: string, items: OutfitSuggestion[], title: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanImg = await resizeImage(garmentBase64, 1024, 1024);
    const itemsText = items.map(i => i.itemName).join(", ");
    const prompt = `FASHION EDITORIAL: Stylized lookbook image for "${title}". Feature the primary garment styled with: ${itemsText}. Use high-end studio lighting and a clean architectural background.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => !!p.inlineData);
    if (!part || !part.inlineData) throw new Error("Lookbook synthesis failed.");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const generateProductImage = async (desc: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `High-end minimalist product shot of ${desc}. Centered on a pure white studio background. Professional lighting.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    const part = response.candidates?.[0]?.content?.parts?.find(p => !!p.inlineData);
    if (!part || !part.inlineData) throw new Error("Product asset generation failure.");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

/**
 * SELECTION ENGINE
 * Chooses the best outfit from multiple candidates.
 */
export const selectBestOutfit = async (images: string[], context: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const resizedImages = await Promise.all(images.map(img => resizeImage(img, 512, 512)));
    
    const parts: any[] = [{ text: `Analyze these outfit options for the following occasion: "${context}". Determine which is the most aesthetically appropriate and return your choice as JSON.` }];
    resizedImages.forEach(img => parts.push({ inlineData: { mimeType: 'image/jpeg', data: img } }));
    
    // DO use gemini-3-pro-preview for complex reasoning tasks (outfit selection/aesthetic analysis)
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
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