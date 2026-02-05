import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Search, 
  Shirt, 
  ArrowLeft, 
  Plus, 
  X, 
  Camera, 
  Zap,
  CheckCircle2,
  Download,
  Heart,
  ImageIcon,
  RotateCcw,
  Bookmark,
  LayoutGrid
} from 'lucide-react';
import { FadeIn, LoadingOverlay } from '../components/Components';
import { getStylistSuggestions, generateProductImage, selectBestOutfit, generateLookbookImage } from '../services/geminiService';
import { OutfitSuggestion, SavedLook, Screen } from '../types';

interface StylistScreenProps {
  onSaveLook: (look: SavedLook) => void;
  onNavigate?: (screen: Screen) => void; 
}

type Mode = 'NONE' | 'COMPLETE_LOOK' | 'PICK_OUTFIT';

const TooltipIconButton: React.FC<{ 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ onClick, icon, label, variant = 'outline', disabled, size = 'md', className = '' }) => {
  const sizes = {
    sm: "w-10 h-10 rounded-xl",
    md: "w-14 h-14 rounded-[1.2rem]",
    lg: "w-16 h-16 rounded-[1.5rem]"
  };
  
  const variants = {
    outline: "bg-white text-brand-onyx border-2 border-brand-sandstone/20 hover:border-brand-onyx hover:bg-brand-ivory",
    primary: "bg-brand-onyx text-brand-champagne hover:bg-black shadow-luxury",
    ghost: "bg-brand-ivory/50 text-brand-onyx hover:bg-brand-onyx hover:text-brand-champagne border border-brand-sandstone/10"
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`relative group flex items-center justify-center transition-all duration-500 shadow-sm ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-20 cursor-not-allowed' : 'active:scale-90 hover:-translate-y-0.5'}`}
      >
        {icon}
      </button>
      <div className="absolute bottom-full mb-3 px-4 py-2 bg-stone-900/95 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-[-4px] pointer-events-none whitespace-nowrap shadow-2xl z-[100]">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900/95"></div>
      </div>
    </div>
  );
};

export const StylistScreen: React.FC<StylistScreenProps> = ({ onSaveLook, onNavigate }) => {
  const [mode, setMode] = useState<Mode>('NONE');

  // --- COMPLETE MY LOOK STATE ---
  const [uploadedOutfit, setUploadedOutfit] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [conceptTitle, setConceptTitle] = useState<string>("");
  const [conceptImage, setConceptImage] = useState<string | null>(null);
  const [suggestionImages, setSuggestionImages] = useState<Record<string, string>>({});
  
  // --- PICK FOR OCCASION STATE ---
  const [wardrobeImages, setWardrobeImages] = useState<string[]>([]);
  const [occasionContext, setOccasionContext] = useState('');
  const [selectionResult, setSelectionResult] = useState<{index: number, reason: string, tips: string} | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");

  const singleUploadRef = useRef<HTMLInputElement>(null);
  const multiUploadRef = useRef<HTMLInputElement>(null);

  const handleShopItem = (query: string, platform: 'google' | 'amazon' | 'myntra') => {
    let url = '';
    const q = encodeURIComponent(query);
    switch (platform) {
        case 'amazon': url = `https://www.amazon.in/s?k=${q}`; break;
        case 'myntra': url = `https://www.google.com/search?q=site:myntra.com+${q}`; break;
        case 'google': default: url = `https://www.google.com/search?tbm=shop&q=${q}`; break;
    }
    window.open(url, '_blank');
  };

  const resetState = () => {
    setMode('NONE');
    setUploadedOutfit(null);
    setSuggestions([]);
    setWardrobeImages([]);
    setOccasionContext('');
    setSelectionResult(null);
    setConceptImage(null);
    setSuggestionImages({});
    setConceptTitle("");
  };

  const handleUploadSingle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadedOutfit(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerateCompleteLook = async () => {
    if (!uploadedOutfit) return;
    setIsLoading(true);
    setLoadingStep("Analyzing Silhouette Architecture...");
    
    try {
      const result = await getStylistSuggestions(uploadedOutfit);
      const newSuggestions = result?.suggestions || [];
      setSuggestions(newSuggestions);
      setConceptTitle(result?.conceptTitle || "Neural Ensemble");
      
      // Resilient Asset Loop with independent retries and 1.2s cooldown
      for (const s of newSuggestions) {
          setLoadingStep(`Sourcing: ${s.itemName}...`);
          let retries = 0;
          let success = false;
          while (retries < 3 && !success) {
              try {
                  const img = await generateProductImage(s.visualDescription || s.itemName);
                  if (img) {
                      setSuggestionImages(prev => ({...prev, [s.itemName]: img}));
                      success = true;
                  }
              } catch (e) {
                  retries++;
                  await new Promise(r => setTimeout(r, 2500));
              }
          }
          await new Promise(r => setTimeout(r, 1200));
      }
      
      setLoadingStep("Finalizing Lookbook Composition...");
      try {
        const lookbookImg = await generateLookbookImage(uploadedOutfit, newSuggestions, result?.conceptTitle || "Ensemble");
        setConceptImage(lookbookImg);
      } catch (e) {
        console.warn("Lookbook failed, fallback to original garment.");
      }
      
    } catch (err: any) {
      console.error("Styling failure:", err);
      const errorMsg = err?.message?.toLowerCase() || "";
      if (errorMsg.includes("quota")) {
        alert("The studio is at peak capacity. Please wait 30 seconds.");
      } else {
        alert("Atelier synchronization interrupted. Please try a different photo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCompleteLook = () => {
      const finalImage = conceptImage || uploadedOutfit;
      if (!finalImage) return;
      onSaveLook({
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          image: finalImage,
          items: [conceptTitle, ...suggestions.map(s => s.itemName)],
          folder: 'Stylist Archive'
      });
  };

  const handleDownload = (image: string, name?: string) => {
    if (!image) return;
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '_').slice(0, 19);
    const link = document.createElement('a');
    link.href = image;
    link.download = `${name || 'outfit'}_${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadMulti = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (wardrobeImages.length + files.length > 3) {
        alert("Max 3 candidate images.");
        e.target.value = '';
        return;
      }
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setWardrobeImages(prev => [...prev, reader.result as string].slice(0, 3));
        reader.readAsDataURL(file as Blob);
      });
      e.target.value = '';
    }
  };

  const handlePickOutfit = async () => {
    if (wardrobeImages.length < 2 || !occasionContext.trim()) return;
    setIsLoading(true);
    setLoadingStep("Processing Neural Compatibility...");
    try {
        const result = await selectBestOutfit(wardrobeImages, occasionContext);
        if (result && typeof result.selectedIndex === 'number') {
          setSelectionResult({
              index: result.selectedIndex,
              reason: result.reasoning || "Optimized for context.",
              tips: result.stylingTips || "Minimalist accessories recommended."
          });
        }
    } catch (e) {
        alert("The selection engine is temporarily busy.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6 pb-40">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 md:mb-20">
        <div className="flex items-center gap-4 md:gap-6">
            {mode !== 'NONE' && (
                <button onClick={resetState} className="w-10 h-10 md:w-12 md:h-12 bg-white border border-brand-sandstone/20 rounded-2xl flex items-center justify-center text-brand-onyx hover:bg-brand-onyx hover:text-white transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}
            <div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-onyx leading-tight">The Atelier</h1>
                <p className="text-[8px] md:text-[10px] font-bold text-brand-sandstone uppercase tracking-[0.4em] mt-1 md:mt-2">Neural Studio • High-Performance Active</p>
            </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-green-500/10 rounded-full border border-green-500/20 text-green-600 text-[10px] font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" /> System Optimized
        </div>
      </div>

      {mode === 'NONE' && (
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <FadeIn delay={100}>
                  <div className="bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-brand-sandstone/10 shadow-luxury hover:shadow-luxury-hover hover:-translate-y-1 transition-all group flex flex-col justify-between min-h-[450px] md:min-h-[550px] relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-champagne/5 rounded-full blur-3xl group-hover:bg-brand-champagne/10 transition-colors"></div>
                      <div className="relative z-10 space-y-6 md:space-y-8">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-champagne/10 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-brand-champagne group-hover:scale-110 group-hover:bg-brand-onyx transition-all duration-700">
                              <Shirt className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                          <div className="space-y-3 md:space-y-4">
                              <h3 className="text-3xl md:text-4xl font-serif font-bold text-brand-onyx">Complete My Look</h3>
                              <p className="text-brand-slate text-base md:text-lg leading-relaxed font-serif italic max-w-sm">Neural composition for your anchor garments.</p>
                          </div>
                      </div>
                      <div className="mt-8 flex justify-center">
                        <TooltipIconButton onClick={() => setMode('COMPLETE_LOOK')} icon={<Sparkles className="w-7 h-7" />} label="Synthesize Styled Look" variant="primary" size="lg" />
                      </div>
                  </div>
              </FadeIn>

              <FadeIn delay={200}>
                  <div className="bg-brand-onyx p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-luxury hover:shadow-luxury-hover hover:-translate-y-1 transition-all group flex flex-col justify-between min-h-[450px] md:min-h-[550px] text-white relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-brand-champagne/5 transition-colors"></div>
                      <div className="relative z-10 space-y-6 md:space-y-8">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-brand-champagne group-hover:scale-110 group-hover:bg-brand-champagne group-hover:text-brand-onyx transition-all duration-700">
                              <LayoutGrid className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                          <div className="space-y-3 md:space-y-4">
                              <h3 className="text-3xl md:text-4xl font-serif font-bold text-white">Pick for Occasion</h3>
                              <p className="text-brand-slate text-base md:text-lg leading-relaxed font-serif italic max-w-sm opacity-80">Upload candidates and let AI resolve the optimal aesthetic choice.</p>
                          </div>
                      </div>
                      <div className="mt-8 flex justify-center">
                        <TooltipIconButton onClick={() => setMode('PICK_OUTFIT')} icon={<Zap className="w-7 h-7" />} label="Resolve Best Outfit" variant="primary" size="lg" />
                      </div>
                  </div>
              </FadeIn>
          </div>
      )}

      {mode === 'COMPLETE_LOOK' && (
          <FadeIn>
              {suggestions.length === 0 ? (
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="bg-white p-8 md:p-20 rounded-[3rem] md:rounded-[4rem] border border-brand-sandstone/10 shadow-luxury flex flex-col items-center text-center space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-onyx">Complete My Look</h2>
                            <p className="text-brand-slate text-base md:text-lg font-serif italic max-w-lg">One garment, infinite neural possibilities.</p>
                        </div>
                        <div onClick={() => singleUploadRef.current?.click()} className={`w-full max-w-md aspect-square rounded-[2rem] md:rounded-[3rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${uploadedOutfit ? 'border-brand-champagne bg-brand-ivory' : 'border-brand-sandstone/20 bg-brand-ivory/50 hover:bg-white hover:border-brand-champagne'}`}>
                            <input type="file" ref={singleUploadRef} className="hidden" accept="image/*" onChange={handleUploadSingle} />
                            {uploadedOutfit ? <img src={uploadedOutfit} className="w-full h-full object-cover" alt="Uploaded" /> : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Camera className="w-8 h-8 text-brand-sandstone" /></div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-brand-sandstone">Upload Silhouette</span>
                                </div>
                            )}
                        </div>
                        <TooltipIconButton disabled={!uploadedOutfit || isLoading} onClick={handleGenerateCompleteLook} icon={<Sparkles className="w-8 h-8" />} label="Synthesize Ensemble" variant="primary" size="lg" />
                    </div>
                </div>
              ) : (
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-20 animate-fade-in-up">
                    <div className="space-y-10 order-1">
                        <div className="bg-white p-2 md:p-4 rounded-[3rem] md:rounded-[4rem] border border-brand-sandstone/10 shadow-luxury relative group">
                            <div className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden aspect-[3/4] bg-brand-ivory">
                                <img src={conceptImage || uploadedOutfit || ""} alt="Lookbook" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-onyx via-brand-onyx/40 to-transparent p-6 md:p-12 pt-24 md:pt-32">
                                    <span className="text-[8px] md:text-[10px] font-bold tracking-[0.5em] text-brand-champagne uppercase mb-3 md:mb-4 block">Neural Studio Result</span>
                                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">{conceptTitle}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6 max-w-lg mx-auto w-full pt-4">
                             <TooltipIconButton onClick={handleSaveCompleteLook} icon={<Bookmark className="w-6 h-6" />} label="Archive Look" variant="primary" />
                             <TooltipIconButton onClick={() => alert("Added to Favorites!")} icon={<Heart className="w-6 h-6" />} label="Like" />
                             <TooltipIconButton onClick={resetState} icon={<RotateCcw className="w-6 h-6" />} label="Reset Atelier" />
                             <TooltipIconButton onClick={() => handleDownload(conceptImage || uploadedOutfit || "", conceptTitle)} icon={<Download className="w-6 h-6" />} label="Download Composition" />
                        </div>
                    </div>
                    <div className="space-y-8 md:space-y-10 order-2">
                        <h3 className="text-xl md:text-2xl font-serif font-bold text-brand-onyx flex items-center gap-4">
                            <ShoppingBag className="w-6 h-6 text-brand-champagne" /> Boutique Suggestions
                        </h3>
                        <div className="space-y-6 lg:max-h-[850px] lg:overflow-y-auto pr-0 lg:pr-4 no-scrollbar">
                            {suggestions.map((item, idx) => (
                                <FadeIn key={idx} delay={idx * 150} className="bg-white rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-brand-sandstone/10 flex flex-col sm:flex-row gap-6 group hover:shadow-luxury transition-all relative">
                                    <div className="w-24 h-32 bg-brand-ivory rounded-2xl flex items-center justify-center overflow-hidden border border-brand-sandstone/10 shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-sm relative mx-auto sm:mx-0">
                                         {suggestionImages[item.itemName] ? <img src={suggestionImages[item.itemName]} alt={item.itemName} className="w-full h-full object-contain mix-blend-multiply p-2" /> : (
                                             <div className="flex flex-col items-center gap-2 opacity-20"><ImageIcon className="w-6 h-6 text-brand-sandstone animate-pulse" /><span className="text-[8px] font-bold uppercase tracking-widest text-center px-2">Synchronizing...</span></div>
                                         )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
                                        <div className="mb-4 sm:pr-12">
                                             <span className="text-[8px] font-bold text-brand-champagne uppercase tracking-[0.3em]">{item.category}</span>
                                             <h4 className="text-xl font-serif font-bold text-brand-onyx mt-1">{item.itemName}</h4>
                                             <p className="text-xs text-brand-slate mt-2 leading-relaxed font-serif italic opacity-70 line-clamp-2">"{item.description}"</p>
                                        </div>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                            <TooltipIconButton onClick={() => handleShopItem(item.searchQuery, 'google')} icon={<Search className="w-4 h-4" />} label="Google" size="sm" variant="ghost" />
                                            <TooltipIconButton onClick={() => handleShopItem(item.searchQuery, 'amazon')} icon={<ShoppingBag className="w-4 h-4" />} label="Amazon" size="sm" variant="ghost" />
                                            <TooltipIconButton onClick={() => handleShopItem(item.searchQuery, 'myntra')} icon={<ShoppingBag className="w-4 h-4" />} label="Myntra" size="sm" variant="ghost" />
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </div>
              )}
          </FadeIn>
      )}

      {mode === 'PICK_OUTFIT' && (
          <FadeIn className="max-w-6xl mx-auto">
              {!selectionResult ? (
                  <div className="bg-white p-8 md:p-20 rounded-[3rem] md:rounded-[5rem] border border-brand-sandstone/10 shadow-luxury space-y-12 md:space-y-16">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-onyx">Pick for Occasion</h2>
                        <p className="text-brand-slate text-base md:text-lg font-serif italic opacity-80">Upload candidates. Let AI resolve the optimal aesthetic choice.</p>
                    </div>
                    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 md:gap-20">
                        <div className="space-y-8 order-2 lg:order-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h4 className="text-[10px] font-bold text-brand-sandstone uppercase tracking-[0.5em]">01. Silhouette Candidates</h4>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[0, 1, 2].map((slotIdx) => {
                                    const img = wardrobeImages[slotIdx];
                                    if (img) {
                                        return (
                                            <div key={slotIdx} className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border-2 border-white group animate-fade-in-up bg-brand-ivory">
                                                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Option" />
                                                <button onClick={() => setWardrobeImages(prev => prev.filter((_, i) => i !== slotIdx))} className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors z-10"><X className="w-4 h-4 text-red-500" /></button>
                                            </div>
                                        );
                                    }
                                    if (slotIdx === wardrobeImages.length) {
                                        return (
                                            <label key={slotIdx} className="aspect-[3/4] rounded-2xl md:rounded-3xl border-2 border-dashed border-brand-sandstone/30 flex flex-col items-center justify-center bg-brand-ivory cursor-pointer hover:bg-white hover:border-brand-champagne transition-all group">
                                                <Plus className="w-6 h-6 text-brand-sandstone group-hover:scale-125 transition-transform" />
                                                <input type="file" multiple ref={multiUploadRef} className="hidden" accept="image/*" onChange={handleUploadMulti} />
                                            </label>
                                        );
                                    }
                                    return <div key={slotIdx} className="aspect-[3/4] rounded-2xl md:rounded-3xl border border-brand-sandstone/10 bg-brand-ivory/30 flex items-center justify-center opacity-40"><ImageIcon className="w-5 h-5 text-brand-sandstone" /></div>;
                                })}
                            </div>
                        </div>
                        <div className="space-y-8 md:space-y-12 order-1 lg:order-2">
                            <div className="space-y-4 md:space-y-6">
                                <h4 className="text-[10px] font-bold text-brand-sandstone uppercase tracking-[0.5em]">02. Define Purpose</h4>
                                <textarea value={occasionContext} onChange={(e) => setOccasionContext(e.target.value)} placeholder="E.g. A sunset gala in Santorini..." className="w-full bg-brand-ivory border border-brand-sandstone/20 rounded-[2rem] p-6 text-brand-onyx focus:outline-none focus:border-brand-champagne min-h-[180px] shadow-inner font-serif italic text-lg leading-relaxed resize-none" />
                            </div>
                            <div className="flex justify-center">
                              <TooltipIconButton disabled={wardrobeImages.length < 2 || !occasionContext.trim() || isLoading} onClick={handlePickOutfit} icon={<Zap className="w-8 h-8" />} label="Resolve Aesthetic Hierarchy" variant="primary" size="lg" />
                            </div>
                        </div>
                    </div>
                  </div>
              ) : (
                  <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-24 bg-white p-6 md:p-16 lg:p-24 rounded-[3rem] md:rounded-[6rem] border border-brand-sandstone/10 shadow-luxury items-center animate-fade-in-up">
                      <div className="relative group w-full">
                          <div className="absolute -inset-4 md:-inset-12 bg-brand-champagne/20 blur-[60px] md:blur-[120px] opacity-30 animate-pulse-soft"></div>
                          <div className="relative aspect-[3/4] rounded-[2rem] md:rounded-[5rem] overflow-hidden shadow-2xl border-[8px] md:border-[16px] lg:border-[24px] border-white group-hover:scale-[1.02] transition-transform duration-1000 bg-brand-ivory">
                              <img src={wardrobeImages[selectionResult.index]} className="w-full h-full object-contain" alt="Winner" />
                              <div className="absolute top-6 left-6 md:top-12 md:left-12">
                                  <div className="bg-brand-champagne text-brand-onyx px-4 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] shadow-2xl flex items-center gap-2 md:gap-3"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> Selected</div>
                              </div>
                          </div>
                      </div>
                      <div className="space-y-8 md:space-y-12 w-full">
                          <div className="space-y-6 md:space-y-10">
                            <h2 className="text-4xl md:text-7xl font-serif font-bold text-brand-onyx leading-[1.1]">Resolved <br /><span className="text-brand-sandstone italic">Aesthetic.</span></h2>
                            <div className="space-y-6 md:space-y-10">
                                <div className="space-y-3 md:space-y-4"><h4 className="text-[10px] font-bold text-brand-champagne uppercase tracking-[0.5em]">Neural Rationale</h4><p className="text-lg md:text-2xl text-brand-onyx font-serif italic leading-relaxed opacity-90">"{selectionResult.reason}"</p></div>
                                <div className="p-8 md:p-12 bg-brand-ivory rounded-[2.5rem] md:rounded-[4rem] border border-brand-sandstone/10 space-y-4 shadow-inner relative"><Sparkles className="absolute top-4 right-4 md:top-8 md:right-8 w-5 h-5 md:w-6 md:h-6 text-brand-champagne/40" /><h4 className="text-[10px] font-bold text-brand-sandstone uppercase tracking-[0.5em]">Stylist Directive</h4><p className="text-base md:text-lg text-brand-slate leading-relaxed font-serif italic">"{selectionResult.tips}"</p></div>
                            </div>
                          </div>
                          <div className="flex justify-start gap-6 pt-4">
                              <TooltipIconButton onClick={() => onSaveLook({ id: Date.now().toString(), date: new Date().toLocaleDateString(), image: wardrobeImages[selectionResult.index], items: ["AI Choice", occasionContext], folder: 'Occasions' })} icon={<Bookmark className="w-6 h-6" />} label="Save Selected" variant="primary" />
                              <TooltipIconButton onClick={resetState} icon={<RotateCcw className="w-6 h-6" />} label="Restart Session" />
                              <TooltipIconButton onClick={() => handleDownload(wardrobeImages[selectionResult.index], 'selected_outfit')} icon={<Download className="w-6 h-6" />} label="Export" />
                          </div>
                      </div>
                  </div>
              )}
          </FadeIn>
      )}
      {isLoading && <LoadingOverlay message={loadingStep} />}
    </div>
  );
};