import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Sparkles, X, MessageSquare, Sun, Ruler, Palette, Download, Save, Camera, Shirt, RotateCcw } from 'lucide-react';
import { ChatMessage, SavedLook } from '../types';
import { generateVirtualTryOn, chatWithAI, refineVirtualTryOn } from '../services/geminiService';
import { FadeIn, LoadingOverlay } from '../components/Components';

interface HomeScreenProps {
  preSelectedDress?: string | null;
  onSaveLook: (look: SavedLook) => void;
}

const TooltipIconButton: React.FC<{ 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  variant?: 'dark' | 'light' | 'danger' | 'accent';
  disabled?: boolean;
  className?: string;
}> = ({ onClick, icon, label, variant = 'light', disabled, className = '' }) => {
  const baseClasses = "relative group flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-500 shadow-sm";
  const variants = {
    light: "bg-white text-stone-600 hover:text-brand-onyx border border-stone-200 hover:border-brand-onyx",
    dark: "bg-brand-onyx text-brand-champagne hover:bg-black",
    danger: "bg-white text-red-500 border border-stone-200 hover:bg-red-50 hover:border-red-200",
    accent: "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-20 cursor-not-allowed' : 'active:scale-90 hover:-translate-y-0.5'}`}
      >
        {icon}
      </button>
      <div className="absolute bottom-full mb-3 px-3 py-1.5 bg-stone-900/95 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-[-4px] pointer-events-none whitespace-nowrap shadow-2xl z-[100]">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900/95"></div>
      </div>
    </div>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ preSelectedDress, onSaveLook }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      text: "Bonjour! I'm your AI Concierge. Upload your photo and a garment to start a virtual try-on instantly.",
      isTyping: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [stagedUserPhoto, setStagedUserPhoto] = useState<string | null>(null);
  const [stagedDressPhoto, setStagedDressPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("Neural Stitching...");
  
  const userFileInputRef = useRef<HTMLInputElement>(null);
  const dressFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preSelectedDress) {
        setStagedDressPhoto(`data:image/jpeg;base64,${preSelectedDress}`);
        addMessage({ role: 'ai', text: "Garment added to fitting tray. Upload your photo to see the results." });
    }
  }, [preSelectedDress]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const addMessage = (msg: Partial<ChatMessage>) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', ...msg } as ChatMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    addMessage({ role: 'user', text });
    setMessages(prev => [...prev, { id: 'typing', role: 'ai', isTyping: true }]);
    try {
      const response = await chatWithAI(text);
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      addMessage({ role: 'ai', text: response });
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      addMessage({ role: 'ai', text: "The studio is very busy. Please try your question again in a moment." });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'dress') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'user') {
          setStagedUserPhoto(base64);
          addMessage({ role: 'user', text: "Uploaded my silhouette photo." });
      } else {
          setStagedDressPhoto(base64);
          addMessage({ role: 'user', text: "Uploaded a new garment." });
      }
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateTryOn = async () => {
    if (!stagedUserPhoto || !stagedDressPhoto) return;
    setIsProcessing(true);
    setProcessingMessage("Initializing Sync...");
    setMessages(prev => [...prev, { id: 'typing', role: 'ai', isTyping: true }]);

    try {
      const userBase64 = stagedUserPhoto.split(',')[1];
      const dressBase64 = stagedDressPhoto.split(',')[1];
      const resultImage = await generateVirtualTryOn(userBase64, dressBase64);
      
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      addMessage({ role: 'ai', text: "The digital projection is ready.✨", image: resultImage, type: 'try-on-result' });
      setStagedDressPhoto(null);
    } catch (error: any) {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      const errorMsg = error?.message?.toLowerCase() || "";
      
      if (errorMsg.includes("quota") || errorMsg.includes("429") || errorMsg.includes("limit")) {
          addMessage({ role: 'ai', text: "Studio at capacity. Recalibrating engines—please wait 15-20 seconds and try again. Your photos are safe in the tray." });
      } else if (errorMsg.includes("safety") || errorMsg.includes("filtered")) {
          addMessage({ role: 'ai', text: "The AI safety protocols blocked this specific garment synthesis. Please try a different photo with clearer lighting." });
      } else {
          addMessage({ role: 'ai', text: "The fitting room experienced a synchronization lag. Let's try that one more time." });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefine = async (instruction: 'fix-light' | 'refine-fit' | 'pop-color', messageId: string, currentImage: string) => {
    setIsProcessing(true);
    setProcessingMessage("Neural Polishing...");
    try {
      const base64Only = currentImage.split(',')[1];
      const refinedImage = await refineVirtualTryOn(base64Only, instruction);
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, image: refinedImage } : msg));
    } catch (error) {
      addMessage({ role: 'ai', text: "Polishing delayed. Please try again in a moment." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (image: string) => {
    const link = document.createElement('a');
    link.href = image;
    link.download = `tryon_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToCloset = (image: string) => {
    onSaveLook({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      image: image,
      items: ["AI Virtual Try-On"],
      folder: 'Try-Ons'
    });
  };

  return (
    <div className="max-w-[900px] mx-auto py-4 md:py-8 px-4 md:px-6 pb-24">
      <FadeIn className="w-full flex flex-col bg-white rounded-[2.5rem] border border-stone-100 shadow-luxury overflow-hidden h-[75vh] md:h-[800px] relative">
        <div className="p-4 lg:p-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-amber-200" /></div>
                <div>
                    <h3 className="font-serif font-bold text-stone-800">AI Concierge</h3>
                    <p className="text-[10px] uppercase font-bold text-green-500 tracking-widest">Neural Stability Active</p>
                </div>
            </div>
            <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scroll-smooth">
            {messages.map((msg) => (
                <FadeIn key={msg.id}>
                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] md:max-w-[80%] rounded-[2rem] p-4 lg:p-5 shadow-sm transition-all duration-300 ${msg.role === 'user' ? 'bg-stone-900 text-white rounded-br-none' : 'bg-stone-50 border border-stone-100 text-stone-800 rounded-bl-none'}`}>
                            {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                            {msg.image && (
                                <div className="mt-4 space-y-6">
                                    <div className="rounded-2xl overflow-hidden shadow-xl border border-stone-200 bg-white"><img src={msg.image} className="w-full h-auto max-h-[500px] object-contain" alt="Result" /></div>
                                    {msg.type === 'try-on-result' && (
                                        <div className="flex flex-wrap justify-center gap-3 pt-2">
                                            <TooltipIconButton onClick={() => handleRefine('fix-light', msg.id, msg.image!)} icon={<Sun className="w-5 h-5" />} label="Lighting" />
                                            <TooltipIconButton onClick={() => handleRefine('refine-fit', msg.id, msg.image!)} icon={<Ruler className="w-5 h-5" />} label="Tailor" />
                                            <TooltipIconButton onClick={() => handleRefine('pop-color', msg.id, msg.image!)} icon={<Palette className="w-5 h-5" />} label="Vibrancy" />
                                            <TooltipIconButton onClick={() => handleDownload(msg.image!)} icon={<Download className="w-5 h-5" />} label="Download" variant="dark" />
                                            <TooltipIconButton onClick={() => handleSaveToCloset(msg.image!)} icon={<Save className="w-5 h-5" />} label="Archive" variant="danger" />
                                        </div>
                                    )}
                                </div>
                            )}
                            {msg.isTyping && <div className="flex space-x-1.5 pt-2"><div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div><div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div></div>}
                        </div>
                    </div>
                </FadeIn>
            ))}
            <div ref={messagesEndRef} />
        </div>
        <div className="p-4 lg:p-6 border-t border-stone-100 bg-white">
            {(stagedUserPhoto || stagedDressPhoto) && (
                <div className="flex gap-4 mb-6 animate-fade-in-up">
                    {stagedUserPhoto && <div className="relative group"><div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-champagne shadow-md"><img src={stagedUserPhoto} className="w-full h-full object-cover" alt="User" /></div><button onClick={() => setStagedUserPhoto(null)} className="absolute -top-2 -right-2 bg-brand-onyx text-white p-1 rounded-full"><X className="w-3 h-3" /></button></div>}
                    {stagedDressPhoto && <div className="relative group"><div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-champagne shadow-md"><img src={stagedDressPhoto} className="w-full h-full object-cover" alt="Dress" /></div><button onClick={() => setStagedDressPhoto(null)} className="absolute -top-2 -right-2 bg-brand-onyx text-white p-1 rounded-full"><X className="w-3 h-3" /></button></div>}
                </div>
            )}
            <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar">
                <TooltipIconButton onClick={() => userFileInputRef.current?.click()} icon={<UserIcon className="w-5 h-5" />} label="Upload Photo" variant={stagedUserPhoto ? 'accent' : 'light'} />
                <TooltipIconButton onClick={() => dressFileInputRef.current?.click()} icon={<Shirt className="w-5 h-5" />} label="Upload Garment" variant={stagedDressPhoto ? 'accent' : 'light'} />
                <TooltipIconButton disabled={!stagedUserPhoto || !stagedDressPhoto || isProcessing} onClick={handleGenerateTryOn} icon={<Sparkles className="w-5 h-5" />} label="Initialize Synthesis" variant="dark" />
            </div>
            <div className="flex gap-3">
                <div className="flex-1 relative group">
                    <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask for styling advice..." className="w-full bg-stone-50 border border-stone-200 rounded-full py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-amber-400 transition-all shadow-inner" />
                    <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                </div>
                <button onClick={handleSendMessage} disabled={!inputText.trim()} className="w-12 lg:w-16 h-12 lg:h-16 rounded-full bg-stone-900 text-white flex items-center justify-center disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-xl"><Send className="w-5 lg:w-6 h-5 lg:h-6 ml-1" /></button>
            </div>
        </div>
      </FadeIn>
      <input type="file" ref={userFileInputRef} className="hidden" accept="image/*" onChange={e => handleFileSelect(e, 'user')} />
      <input type="file" ref={dressFileInputRef} className="hidden" accept="image/*" onChange={e => handleFileSelect(e, 'dress')} />
      {isProcessing && <LoadingOverlay message={processingMessage} />}
    </div>
  );
};