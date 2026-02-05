// DO cast result of db.get to any to resolve property access on unknown type
// DO use item.id instead of undefined variable id in mobile menu
import React, { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { StylistScreen } from './screens/StylistScreen';
import { ShopScreen } from './screens/ShopScreen';
import { ClosetScreen } from './screens/ClosetScreen';
import { AccountScreen } from './screens/AccountScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AuthScreen } from './screens/AuthScreen';
import { LandingScreen } from './screens/LandingScreen';
import { AboutScreen } from './screens/AboutScreen';
import { FaqScreen } from './screens/FaqScreen';
import { ContactScreen } from './screens/ContactScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { BlogScreen } from './screens/BlogScreen';
import { BrandGuideScreen } from './screens/BrandGuideScreen';
import { PageContainer, LoadingOverlay, Logo, Button, FadeIn } from './components/Components';
import { Screen, SavedLook } from './types';
import { MessageCircle, Sparkles, ShoppingBag, Archive, User, LogOut, Menu, X, Globe, Info, HelpCircle, Shield, FileText, Layout, BookOpen, Check } from 'lucide-react';
import { imageUrlToBase64 } from './services/geminiService';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { initDB, db, STORES } from './services/db';
import { uploadToImgBB } from './services/imgbb';

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LANDING);
  const [preSelectedDress, setPreSelectedDress] = useState<string | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [isPreparingTryOn, setIsPreparingTryOn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterSubmitted, setIsNewsletterSubmitted] = useState(false);
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);

  useEffect(() => {
    // 1. Initialize local data
    const initializePersistence = async () => {
      try {
        await initDB();
        
        // Load settings: last visited screen
        const lastScreenData = await db.get(STORES.SETTINGS, 'last_screen') as any;
        if (lastScreenData && Object.values(Screen).includes(lastScreenData.value)) {
          setCurrentScreen(lastScreenData.value as Screen);
        }

        // Load saved looks from IndexedDB
        const pastGens = await db.getAll(STORES.CLOSET);
        if (pastGens && pastGens.length > 0) {
          const mappedGens = pastGens.map(item => ({
            ...item,
            image: item.imageUrl || item.image, // Ensure the UI consistently uses the cloud URL
            date: new Date(item.savedAt || Date.now()).toLocaleDateString()
          })).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
          
          setSavedLooks(mappedGens);
        }
      } catch (err) {
        console.error("Archive Initialization Error:", err);
      }
    };

    initializePersistence();

    // 2. Set up auth listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleNavClick(Screen.LANDING);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleTryOnFromShop = async (dressImage: string, dressName: string) => {
    setIsPreparingTryOn(true);
    handleNavClick(Screen.HOME);
    
    try {
        const base64 = await imageUrlToBase64(dressImage);
        setPreSelectedDress(base64);
    } catch (e) {
        console.error("Critical: Failed to fetch the boutique garment image.", e);
        alert("Sorry, we couldn't process the garment for try-on. Please try an image from a different source.");
    } finally {
        setIsPreparingTryOn(false);
    }
  };

  const handleSaveLook = async (look: SavedLook) => {
      setIsUploading(true);
      try {
          let imageToUpload = look.image;
          if (imageToUpload.startsWith('http')) {
            imageToUpload = await imageUrlToBase64(imageToUpload);
          }
          const uploadedUrl = await uploadToImgBB(imageToUpload);
          const isDuplicate = savedLooks.some(l => l.image === uploadedUrl);
          if (isDuplicate) {
            alert("This look is already in your archive. ✨");
            setIsUploading(false);
            return;
          }
          let source: "try-on" | "styled-look" | "manual-save" = "manual-save";
          if (look.folder === 'Try-Ons') source = "try-on";
          else if (look.folder === 'Stylist Archive' || look.folder === 'Lookbook Inspired') source = "styled-look";

          const id = look.id || `look-${Date.now()}`;
          const savedAt = Date.now();
          const idbEntry = {
            id, imageUrl: uploadedUrl, thumbnailUrl: uploadedUrl, savedAt, source,
            items: look.items, folder: look.folder || 'Uncategorized', isFavorite: look.isFavorite || false
          };
          await db.put(STORES.CLOSET, idbEntry);
          const lookToState: SavedLook = { ...look, id, image: uploadedUrl, date: new Date(savedAt).toLocaleDateString() };
          setSavedLooks(prev => [lookToState, ...prev]);
          alert("Look archived successfully! ✨");
      } catch (err) {
          console.error("Archive failure:", err);
          alert("Archive synchronization failed.");
      } finally {
          setIsUploading(false);
      }
  };

  const handleClearSavedLooks = async () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      await db.clear(STORES.CLOSET);
      setSavedLooks([]);
    }
  };

  const handleUpdateLook = async (lookId: string, newFolder: string) => {
      setSavedLooks(prev => prev.map(look => look.id === lookId ? { ...look, folder: newFolder } : look));
      const existing = await db.get(STORES.CLOSET, lookId) as any;
      if (existing) { await db.put(STORES.CLOSET, { ...existing, folder: newFolder }); }
  };

  const handleToggleFavorite = async (lookId: string) => {
    let newState = false;
    setSavedLooks(prev => prev.map(look => {
      if (look.id === lookId) { newState = !look.isFavorite; return { ...look, isFavorite: newState }; }
      return look;
    }));
    const existing = await db.get(STORES.CLOSET, lookId) as any;
    if (existing) { await db.put(STORES.CLOSET, { ...existing, isFavorite: newState }); }
  };

  const handleDeleteLook = async (lookId: string) => {
    if (window.confirm("Remove this look?")) {
      await db.delete(STORES.CLOSET, lookId);
      setSavedLooks(prev => prev.filter(look => look.id !== lookId));
    }
  };

  const handleNavClick = async (id: Screen) => {
    setCurrentScreen(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try { await db.put(STORES.SETTINGS, { key: 'last_screen', value: id }); } catch(e) {}
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsNewsletterLoading(true);
    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdLYZ--khQmX-4p1tCrgFRRC6dlDknQTxENsK_XtG1PkbmkJg/formResponse";
    const params = new URLSearchParams();
    params.append('entry.1007963966', newsletterEmail);
    try {
      await fetch(googleFormUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
      setIsNewsletterSubmitted(true);
      setNewsletterEmail('');
    } catch (error) { setIsNewsletterSubmitted(true); } finally { setIsNewsletterLoading(false); }
  };

  const allNavItems = [
    { id: Screen.LANDING, label: 'Home', icon: <Globe className="w-4 h-4" /> },
    { id: Screen.ABOUT, label: 'About', icon: <Info className="w-4 h-4" /> },
    { id: Screen.BLOG, label: 'Glow Hub', icon: <Sparkles className="w-4 h-4" /> },
    { id: Screen.FAQ, label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { id: Screen.BRAND_GUIDE, label: 'Brand Guide', icon: <Layout className="w-4 h-4" /> },
    { id: Screen.CONTACT, label: 'Contact', icon: <MessageCircle className="w-4 h-4" /> },
    { id: Screen.HOME, label: 'Concierge', icon: <MessageCircle className="w-4 h-4" /> },
    { id: Screen.STYLIST, label: 'Atelier', icon: <Sparkles className="w-4 h-4" /> },
    { id: Screen.SHOP, label: 'Boutique', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: Screen.CLOSET, label: 'Closet', icon: <Archive className="w-4 h-4" /> },
    { id: Screen.ACCOUNT, label: 'Account', icon: <User className="w-4 h-4" /> },
  ];

  if (isAuthChecking) {
    return <PageContainer><LoadingOverlay message="Authenticating..." /></PageContainer>;
  }

  const renderScreen = () => {
    const isFullyVerified = user?.emailVerified || user?.providerData.some(p => p.providerId === 'google.com');
    if ((!user || !isFullyVerified) && [Screen.HOME, Screen.STYLIST, Screen.SHOP, Screen.CLOSET, Screen.ACCOUNT, Screen.SETTINGS].includes(currentScreen)) {
        return <AuthScreen onAuthSuccess={() => handleNavClick(currentScreen)} />;
    }

    switch (currentScreen) {
      case Screen.LANDING: return <LandingScreen onNavigate={handleNavClick} />;
      case Screen.HOME: return <HomeScreen preSelectedDress={preSelectedDress} onSaveLook={handleSaveLook} />;
      case Screen.STYLIST: return <StylistScreen onSaveLook={handleSaveLook} />;
      case Screen.SHOP: return <ShopScreen onTryOn={handleTryOnFromShop} />;
      case Screen.CLOSET: return <ClosetScreen savedLooks={savedLooks} onUpdateLook={handleUpdateLook} onNavigate={handleNavClick} onToggleFavorite={handleToggleFavorite} onDeleteLook={handleDeleteLook} />;
      case Screen.ACCOUNT: return <AccountScreen onTryOnFromShop={handleTryOnFromShop} onNavigate={handleNavClick} />;
      case Screen.SETTINGS: return <SettingsScreen onNavigate={handleNavClick} onLogout={handleLogout} onClearSavedLooks={handleClearSavedLooks} savedLooks={savedLooks} />;
      case Screen.ABOUT: return <AboutScreen />;
      case Screen.FAQ: return <FaqScreen />;
      case Screen.CONTACT: return <ContactScreen />;
      case Screen.PRIVACY: return <PrivacyScreen />;
      case Screen.BLOG: return <BlogScreen onNavigate={handleNavClick} onSaveLook={handleSaveLook} />;
      case Screen.BRAND_GUIDE: return <BrandGuideScreen />;
      default: return <LandingScreen onNavigate={handleNavClick} />;
    }
  };

  return (
    <PageContainer>
      <header className="sticky top-0 z-[60] bg-brand-ivory/90 backdrop-blur-xl border-b border-brand-sandstone/10 px-6 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="cursor-pointer shrink-0" onClick={() => handleNavClick(Screen.LANDING)}>
            <Logo showText />
          </div>

          <nav className="hidden 2xl:flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
            {allNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-full text-[8px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                  currentScreen === item.id ? 'text-brand-onyx bg-brand-champagne/20' : 'text-brand-slate hover:text-brand-onyx hover:bg-brand-ivory'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden 2xl:flex items-center gap-4 shrink-0">
            {!user ? (
               <Button onClick={() => handleNavClick(Screen.HOME)} variant="primary" className="py-2.5 px-6 rounded-xl text-[9px]">Get Started</Button>
            ) : (
                <button onClick={handleLogout} className="p-2 text-brand-slate hover:text-red-500 transition-colors" title="Logout"><LogOut className="w-5 h-5" /></button>
            )}
          </div>

          <button className="2xl:hidden p-2 text-brand-onyx" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-brand-onyx/40 backdrop-blur-md 2xl:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-brand-ivory shadow-2xl p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <Logo showText />
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-7 h-7" /></button>
            </div>
            
            <div className="space-y-4">
              {allNavItems.map(item => (
                <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${currentScreen === item.id ? 'bg-brand-onyx text-brand-champagne shadow-lg' : 'text-brand-slate hover:bg-white'}`}>
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
            {user && (
                <button onClick={handleLogout} className="mt-12 w-full flex items-center justify-center gap-4 p-4 text-red-500 font-bold border border-red-100 rounded-xl uppercase text-[10px] tracking-widest bg-red-50/30">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 w-full relative">
        <FadeIn key={currentScreen}>
          {renderScreen()}
        </FadeIn>
      </main>

      {isPreparingTryOn && <LoadingOverlay message="Synchronizing High-Res Assets..." />}
      {isUploading && <LoadingOverlay message="Archiving to Studio Vault..." />}

      <footer className="bg-brand-onyx text-brand-slate pt-20 pb-12 px-6 border-t border-white/5">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                <div className="space-y-8">
                    <Logo showText dark />
                    <p className="text-sm leading-relaxed italic font-serif opacity-70 max-w-xs">
                      "Redefining the human silhouette through the lens of artificial intelligence."
                    </p>
                </div>
                <div className="space-y-6">
                    <h4 className="text-white font-bold uppercase tracking-[0.3em] text-[10px]">Brand Vision</h4>
                    <ul className="text-xs space-y-4 font-medium">
                        <li><button onClick={() => handleNavClick(Screen.LANDING)} className="hover:text-brand-champagne transition-colors uppercase">Home</button></li>
                        <li><button onClick={() => handleNavClick(Screen.ABOUT)} className="hover:text-brand-champagne transition-colors uppercase">About</button></li>
                        <li><button onClick={() => handleNavClick(Screen.BLOG)} className="hover:text-brand-champagne transition-colors uppercase">Glow Hub</button></li>
                    </ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-white font-bold uppercase tracking-[0.3em] text-[10px]">The Studio</h4>
                    <ul className="text-xs space-y-4 font-medium">
                        <li><button onClick={() => handleNavClick(Screen.HOME)} className="hover:text-brand-champagne transition-colors uppercase">Concierge</button></li>
                        <li><button onClick={() => handleNavClick(Screen.STYLIST)} className="hover:text-brand-champagne transition-colors uppercase">Atelier</button></li>
                        <li><button onClick={() => handleNavClick(Screen.SHOP)} className="hover:text-brand-champagne transition-colors uppercase">Boutique</button></li>
                    </ul>
                </div>
                <div className="space-y-8">
                    <h4 className="text-white font-bold uppercase tracking-[0.3em] text-[10px]">Style Dispatch</h4>
                    <div className="space-y-4 pt-4">
                        {isNewsletterSubmitted ? (
                          <div className="flex items-center gap-3 p-3 bg-brand-champagne/10 border border-brand-champagne/20 rounded-lg animate-fade-in-up">
                            <Check className="w-4 h-4 text-brand-champagne" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-champagne">Confirmed.</span>
                          </div>
                        ) : (
                          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                            <input type="email" required value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[10px] w-full outline-none focus:border-brand-champagne transition-all text-white" />
                            <button type="submit" disabled={isNewsletterLoading} className="bg-brand-champagne text-brand-onyx px-4 py-3 rounded-lg font-bold text-[9px] uppercase tracking-wider hover:bg-white transition-all disabled:opacity-50">Join</button>
                          </form>
                        )}
                    </div>
                </div>
            </div>
            <div className="border-t border-white/5 pt-10 text-[9px] uppercase tracking-[0.3em] font-bold opacity-50">
                <span>© 2024 THE NEW YOU - NEURAL FASHION AI. ALL RIGHTS RESERVED.</span>
            </div>
          </div>
      </footer>
    </PageContainer>
  );
};

export default App;