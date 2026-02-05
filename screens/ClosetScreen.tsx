
import React, { useState } from 'react';
import { SavedLook, Screen } from '../types';
import { FadeIn, Button } from '../components/Components';
import { CLOSET_FOLDERS } from '../constants';
import { Folder, Share2, Trash2, Plus, ShoppingBag, MoveRight, Sparkles, BookOpen, X, Heart, Mail, Link as LinkIcon, Twitter, Instagram, Globe, Copy, Check } from 'lucide-react';

interface ClosetScreenProps {
  savedLooks: SavedLook[];
  onUpdateLook: (lookId: string, newFolder: string) => void;
  onToggleFavorite: (lookId: string) => void;
  onDeleteLook: (lookId: string) => void;
  onNavigate: (screen: Screen) => void;
}

export const ClosetScreen: React.FC<ClosetScreenProps> = ({ savedLooks, onUpdateLook, onToggleFavorite, onDeleteLook, onNavigate }) => {
  const [activeFolder, setActiveFolder] = useState('All');
  const [folders, setFolders] = useState(CLOSET_FOLDERS);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [movingLookId, setMovingLookId] = useState<string | null>(null);
  const [sharingLook, setSharingLook] = useState<SavedLook | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleCreateFolder = () => {
      const trimmed = newFolderName.trim();
      if (trimmed && !folders.includes(trimmed)) {
          setFolders(prev => [...prev, trimmed]);
          setActiveFolder(trimmed);
          setNewFolderName('');
          setIsCreatingFolder(false);
      }
  };

  const handleMoveLook = (lookId: string, folderName: string) => {
      onUpdateLook(lookId, folderName);
      setMovingLookId(null);
  };

  const handleShare = (look: SavedLook) => {
    setSharingLook(look);
    setShareFeedback(null);
  };

  const handleCopyDirectLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerShareFeedback = (msg: string) => {
    setShareFeedback(msg);
    setTimeout(() => setShareFeedback(null), 3000);
  };

  const performShare = async (platform: 'twitter' | 'instagram' | 'email' | 'other') => {
    if (!sharingLook) return;
    const url = sharingLook.image;
    const encodedUrl = encodeURIComponent(url);
    const shareTitle = "Check out my look from The New You ✨";
    const shareText = "I styled this look using The New You App";
    
    // Attempt Web Share API first for mobile/supported browsers
    if (navigator.share && platform !== 'instagram') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url
        });
        return;
      } catch (err) {
        // If user cancelled, just return. For actual errors, fallback to links.
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallbacks
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodedUrl}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent("My Outfit from The New You")}&body=${encodeURIComponent(shareText + ": " + url)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't support direct link sharing via URL
        navigator.clipboard.writeText(url);
        triggerShareFeedback("Link copied. Open Instagram and paste to share.");
        break;
      case 'other':
        navigator.clipboard.writeText(url);
        triggerShareFeedback("Link copied to clipboard!");
        break;
    }
  };

  const filteredLooks = activeFolder === 'All' 
    ? savedLooks 
    : activeFolder === 'Favorites'
    ? savedLooks.filter(l => l.isFavorite)
    : savedLooks.filter(l => l.folder === activeFolder);

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
            <h1 className="text-4xl font-serif font-bold text-stone-900">Digital Archive</h1>
            <p className="text-stone-400 mt-1 font-bold uppercase tracking-[0.3em] text-[10px]">Your Curated Style Vault</p>
        </div>
        
        <div className="flex gap-4 items-center overflow-x-auto scrollbar-hide pb-2 w-full md:w-auto">
            {folders.map(folder => (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-widest ${
                  activeFolder === folder
                    ? 'bg-stone-900 text-white shadow-xl shadow-stone-200' 
                    : 'bg-white text-stone-500 border border-stone-100 hover:border-stone-300 shadow-sm'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                {folder}
              </button>
            ))}
            <button 
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-widest hover:text-stone-900 hover:border-stone-400 transition-all bg-white shadow-sm"
            >
                <Plus className="w-4 h-4" /> New Collection
            </button>
        </div>
      </div>

      {isCreatingFolder && (
          <FadeIn className="max-w-md mx-auto bg-white p-8 rounded-[3rem] border border-stone-100 shadow-2xl flex flex-col gap-6 animate-fade-in-up">
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-stone-800">Create Collection</h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Group your looks by event or mood</p>
              </div>
              <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="E.g. Summer Soiree"
                  className="bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm text-stone-800 flex-1 focus:outline-none focus:border-amber-400 shadow-inner"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div className="flex gap-3">
                <button onClick={handleCreateFolder} className="flex-1 bg-stone-900 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest">Establish</button>
                <button onClick={() => setIsCreatingFolder(false)} className="px-6 py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px] hover:text-stone-900">Cancel</button>
              </div>
          </FadeIn>
      )}

      {filteredLooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 px-12 bg-white rounded-[4rem] border border-stone-100 shadow-sm text-center max-w-4xl mx-auto">
            <div className="relative mb-10">
                <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-amber-400" />
                </div>
                <div className="absolute -top-4 -right-4 p-4 bg-white rounded-[1.5rem] shadow-2xl">
                    <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
            </div>
            
            <h3 className="text-4xl font-serif font-bold text-stone-900 mb-6">A New Chapter Begins.</h3>
            <p className="text-lg text-stone-500 mb-12 max-w-xl leading-relaxed font-serif italic">
                {activeFolder === 'All' 
                  ? "Your archive is currently empty. To populate your closet, explore the Boutique or start a styling session in the Atelier."
                  : `Your "${activeFolder}" collection has no items yet. Move looks from your Archive to organize your style journey.`}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
                <Button 
                    variant="primary" 
                    className="flex-1 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs"
                    onClick={() => onNavigate(Screen.SHOP)}
                    icon={<ShoppingBag className="w-5 h-5" />}
                >
                    Visit Boutique
                </Button>
                <Button 
                    variant="outline"
                    className="flex-1 border-stone-200 text-stone-900 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs"
                    onClick={() => onNavigate(Screen.STYLIST)}
                    icon={<Sparkles className="w-5 h-5" />}
                >
                    Neural Styling
                </Button>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
            {filteredLooks.map((look, idx) => (
                <FadeIn key={look.id} delay={idx * 50}>
                    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-sm group hover:shadow-2xl transition-all duration-700 h-full flex flex-col relative">
                        <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
                            <img src={look.image} alt="Look" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            
                            <button 
                              onClick={() => onToggleFavorite(look.id)}
                              className={`absolute top-6 left-6 p-3 rounded-2xl backdrop-blur-md shadow-xl transition-all z-10 ${look.isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-stone-400 hover:text-red-500'}`}
                            >
                              <Heart className={`w-4 h-4 ${look.isFavorite ? 'fill-current' : ''}`} />
                            </button>

                            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px] duration-500">
                                <button 
                                    onClick={() => handleShare(look)}
                                    className="p-4 rounded-2xl bg-white text-stone-900 shadow-2xl hover:scale-110 transition-transform hover:bg-blue-100"
                                    title="Share Look"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setMovingLookId(movingLookId === look.id ? null : look.id)}
                                    className="p-4 rounded-2xl bg-white text-stone-900 shadow-2xl hover:scale-110 transition-transform hover:bg-purple-100"
                                    title="Categorize"
                                >
                                    <MoveRight className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => onDeleteLook(look.id)}
                                    className="p-4 rounded-2xl bg-white text-red-500 shadow-2xl hover:scale-110 transition-transform hover:bg-red-50"
                                    title="Delete Look"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] text-stone-300 font-bold uppercase tracking-[0.2em]">{look.date}</span>
                                {look.folder && (
                                  <span className="text-[9px] px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-700 font-bold uppercase tracking-widest shadow-sm">
                                    {look.folder}
                                  </span>
                                )}
                            </div>
                            <p className="text-lg font-serif font-bold text-stone-800 line-clamp-2 leading-relaxed italic mb-4">
                                "{look.items.join(', ')}"
                            </p>

                            {/* Cloud Sharing Link Button */}
                            <button 
                                onClick={() => handleCopyDirectLink(look.image, look.id)}
                                className={`mt-auto flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all ${copiedId === look.id ? 'bg-green-500 text-white' : 'bg-brand-ivory text-brand-onyx hover:bg-brand-onyx hover:text-white border border-brand-sandstone/10'}`}
                            >
                                {copiedId === look.id ? <><Check className="w-3 h-3" /> Link Copied</> : <><Copy className="w-3 h-3" /> Copy Share Link</>}
                            </button>

                            {movingLookId === look.id && (
                                <FadeIn className="absolute inset-x-4 bottom-4 bg-white/95 backdrop-blur-xl border border-stone-100 p-8 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] animate-fade-in-up">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.4em]">Establish Link To:</p>
                                        <button onClick={() => setMovingLookId(null)}><X className="w-4 h-4 text-stone-300 hover:text-stone-900" /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                                        {folders.filter(f => f !== 'All' && f !== 'Favorites').map(f => (
                                            <button 
                                                key={f} 
                                                onClick={() => handleMoveLook(look.id, f)}
                                                className={`px-4 py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all border ${look.folder === f ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 border-stone-100 text-stone-500 hover:bg-white hover:border-amber-400'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </FadeIn>
                            )}
                        </div>
                    </div>
                </FadeIn>
            ))}
        </div>
      )}

      {/* SHARE MODAL */}
      {sharingLook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-onyx/80 backdrop-blur-xl">
          <FadeIn className="bg-white w-full max-w-xl rounded-[4rem] p-12 lg:p-16 shadow-2xl relative overflow-hidden">
             <button onClick={() => setSharingLook(null)} className="absolute top-10 right-10 p-2 text-stone-400 hover:text-stone-900">
               <X className="w-6 h-6" />
             </button>
             
             <div className="text-center space-y-8">
               <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-4">
                 <Share2 className="w-8 h-8" />
               </div>
               
               <div className="space-y-2">
                 <h2 className="text-3xl font-serif font-bold text-stone-900">Share Your Silhouette</h2>
                 <p className="text-stone-500 font-serif italic text-lg leading-relaxed">Broadcast your curated look to your fashion network.</p>
               </div>

               <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-stone-300 shrink-0" />
                    <span className="text-xs text-stone-400 truncate">{sharingLook.image}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(sharingLook.image);
                      triggerShareFeedback("Link copied!");
                    }}
                    className={`text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl border transition-all shadow-sm whitespace-nowrap ${shareFeedback === 'Link copied!' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-stone-900 border-stone-200'}`}
                  >
                    {shareFeedback === 'Link copied!' ? 'Link Copied!' : 'Copy Link'}
                  </button>
               </div>

               <div className="grid grid-cols-4 gap-4 pt-4">
                  {[
                    { id: 'twitter', icon: <Twitter className="w-5 h-5" />, label: "Twitter", color: "text-sky-500" },
                    { id: 'instagram', icon: <Instagram className="w-5 h-5" />, label: "Instagram", color: "text-pink-500" },
                    { id: 'email', icon: <Mail className="w-5 h-5" />, label: "Email", color: "text-stone-500" },
                    { id: 'other', icon: <Globe className="w-5 h-5" />, label: "Other", color: "text-stone-400" }
                  ].map((s) => (
                    <button 
                      key={s.id} 
                      onClick={() => performShare(s.id as any)}
                      className="flex flex-col items-center gap-3 group"
                    >
                       <div className={`w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform border border-stone-100`}>
                         {s.icon}
                       </div>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-900">{s.label}</span>
                    </button>
                  ))}
               </div>

               {shareFeedback && shareFeedback !== 'Link copied!' && (
                 <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest animate-fade-in-up">
                   {shareFeedback}
                 </div>
               )}

               <div className="pt-10">
                 <Button variant="outline" className="w-full py-5 rounded-2xl" onClick={() => setSharingLook(null)}>Done</Button>
               </div>
             </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
};
