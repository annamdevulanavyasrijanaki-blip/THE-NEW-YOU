
import { GoogleGenAI, Type } from "@google/genai";
import { BestOutfitSelection, OutfitSuggestion, Product } from '../types';

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, baseDelay = 2500): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const msg = error?.message?.toLowerCase() || "";
      const isRetryable = msg.includes("429") || msg.includes("quota") || msg.includes("503") || msg.includes("limit") || msg.includes("deadline");
      if (attempt < maxRetries - 1 && isRetryable) {
        const delay = baseDelay * Math.pow(1.5, attempt) + Math.random() * 1000;
        console.warn(`[Atelier] Neural link stabilizing. Calibrating attempt ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

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
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
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

export const generateVirtualTryOn = async (userImageBase64: string, dressImageBase64: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanUser = await resizeImage(userImageBase64, 1024, 1024);
    const cleanDress = await resizeImage(dressImageBase64, 1024, 1024);
    
    const prompt = `CRITICAL ARCHITECTURAL DIRECTIVE: HIGH-FIDELITY FASHION RECONSTRUCTION.
    IMAGE 1: Subject silhouette.
    IMAGE 2: Target garment/asset.
    NEURAL TRANSFORMATION PROTOCOL:
    1. SURGICAL CLOTHING ERASURE: Perfectly remove all existing garments from the subject in Image 1. Pay absolute attention to skin boundaries, neckline, and wrists. Ensure zero "ghosting" of original fabric.
    2. MATERIAL SPECTRALITY: 
       - If garment in Image 2 is SILK/SATIN: Render with high specular sheen, liquid-like fluid draping, and soft surface reflections.
       - If garment is COTTON/LINEN: Render with visible weave texture, matte finish, and sharp structural folds.
    3. POSE-AWARE TENSION PHYSICS: Simulate realistic micro-creases and stress-folds at natural joint pivots (elbows, waist, armpits) based on the subject's posture in Image 1. 
    4. AMBIENT LIGHTING HARMONIZATION: Analyze lighting intensity and temperature from Image 1. Apply matching highlights and contact shadows to the new garment so it integrates natively.
    5. IDENTITY LOCK: Maintain the subject's face, hair, and skin tone with 100% fidelity.
    OUTPUT REQUIREMENT: Perform a full synthesis. Do NOT return original photos. Return a single photorealistic result.`;

    // Added maxOutputTokens to accompany thinkingBudget as per Gemini SDK guidelines.
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
        maxOutputTokens: 25000,
        thinkingConfig: { thinkingBudget: 15000 }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part) throw new Error("Synthesis failed to resolve visual data. Neural engine recalibration required.");
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
    // Added thinkingBudget to accompany maxOutputTokens to ensure sufficient tokens are reserved for the final output.
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: { parts },
      config: { 
        systemInstruction: "You are LuxeFit AI. Provide elite, concierge-level styling advice in exactly one sentence.", 
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 }
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
          { text: "Analyze skin undertones and return Seasonal Palette JSON." }, 
          { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }
        ] 
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { season: { type: Type.STRING }, colors: { type: Type.ARRAY, items: { type: Type.STRING } }, advice: { type: Type.STRING } },
          required: ["season", "colors", "advice"]
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
    const prompt = `NEURAL POLISHING: Optimize lighting for ${type}. Ensure realistic shadows and micro-textures.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : "";
  });
};

export const getStylistSuggestions = async (imageBase64: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanImg = await resizeImage(imageBase64, 768, 768);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [{ text: "Suggest 3 complementary styling pieces. Return JSON." }, { inlineData: { mimeType: 'image/jpeg', data: cleanImg } }] 
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptTitle: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { itemName: { type: Type.STRING }, description: { type: Type.STRING }, category: { type: Type.STRING }, searchQuery: { type: Type.STRING }, visualDescription: { type: Type.STRING } }, required: ["itemName", "description", "category", "searchQuery", "visualDescription"] } }
          },
          required: ["conceptTitle", "suggestions"]
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
    const prompt = `PROFESSIONAL LOOKBOOK: Fashion editorial for ${title}. Main garment styled with ${itemsText}. High-end studio lighting.`;
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
    if (!part) throw new Error("Asset generation failure.");
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
          properties: { selectedIndex: { type: Type.NUMBER }, reasoning: { type: Type.STRING }, stylingTips: { type: Type.STRING } },
          required: ["selectedIndex", "reasoning", "stylingTips"]
        }
      } 
    });
    return JSON.parse(response.text || "{}");
  });
};
