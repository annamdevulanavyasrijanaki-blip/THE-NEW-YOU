
import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  Archive, 
  Zap, 
  Scan, 
  Quote, 
  Camera, 
  UserCheck, 
  Maximize2, 
  Layers,
  Palette,
  CheckCircle2,
  Star,
  BookOpen,
  HelpCircle,
  Layout,
  Type,
  Clock,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Button, FadeIn, Logo } from '../components/Components';
import { Screen } from '../types';

export const LandingScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-brand-ivory selection:bg-brand-champagne/30">
      
      {/* 1. HERO BANNER - THE IMMERSIVE OPENING */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brand-onyx">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[80vw] h-full bg-gradient-to-l from-brand-champagne/20 to-transparent z-10"></div>
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-brand-sandstone/10 rounded-full blur-[180px] z-0"></div>
          
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68624d5517?q=80&w=2400&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 object-top scale-105" 
            alt="High Fashion Editorial" 
          />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-3/5 space-y-10">
              <FadeIn>
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-brand-champagne/10 border border-brand-champagne/20 text-brand-champagne text-[10px] font-bold uppercase tracking-[0.4em] backdrop-blur-md">
                  <Sparkles className="w-4 h-4" /> Neural Fashion Evolution
                </div>
              </FadeIn>
              
              <FadeIn delay={100}>
                <h1 className="text-6xl md:text-8xl xl:text-[7.5rem] font-serif font-bold text-white leading-[0.85] tracking-tighter">
                  Your Personal <br /> <span className="text-brand-champagne italic">AI Stylist.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={200}>
                <p className="text-xl md:text-2xl text-brand-slate font-serif italic max-w-2xl leading-relaxed opacity-90">
                  Try outfits instantly. Upload, style, shop, and glow with the world's most advanced AI-powered fashion concierge.
                </p>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <Button 
                    onClick={() => onNavigate(Screen.HOME)}
                    variant="secondary" 
                    className="py-7 px-14 rounded-[2.5rem] text-sm shadow-2xl shadow-brand-champagne/20 group"
                    icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  >
                    Start Styling
                  </Button>
                  <Button 
                    onClick={() => onNavigate(Screen.ABOUT)}
                    variant="glass" 
                    className="py-7 px-14 rounded-[2.5rem] text-sm"
                  >
                    Explore Vision
                  </Button>
                </div>
              </FadeIn>
            </div>

            {/* Floating Mockup Preview */}
            <FadeIn delay={400} className="w-full lg:w-2/5 hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-champagne/30 blur-[100px] rounded-full"></div>
                <div className="relative aspect-[9/16] w-80 mx-auto bg-brand-onyx rounded-[3.5rem] border-[10px] border-brand-slate/20 shadow-2xl overflow-hidden p-1">
                  <div className="w-full h-full rounded-[3rem] overflow-hidden bg-brand-ivory relative">
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-onyx/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-brand-champagne">AI Analysis</p>
                      <p className="text-lg font-serif italic">Silk Slip Silhouette</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION - THE CORE PILLARS */}
      <section className="py-32 md:py-48 bg-white relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
            <h2 className="text-sm font-bold text-brand-sandstone uppercase tracking-[0.5em]">The Ecosystem</h2>
            <h3 className="text-5xl md:text-6xl font-serif font-bold text-brand-onyx">Studio <span className="italic text-brand-champagne">Essentials.</span></h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { 
                icon: <Zap className="w-8 h-8" />, 
                title: "AI Style Try-On", 
                desc: "Visualize any garment on your silhouette with physics-defying realism.",
                color: "bg-blue-50 text-blue-600"
              },
              { 
                icon: <Archive className="w-8 h-8" />, 
                title: "Smart Closet", 
                desc: "Digitize your wardrobe and organize collections into neural folders.",
                color: "bg-purple-50 text-purple-600"
              },
              { 
                icon: <Sparkles className="w-8 h-8" />, 
                title: "AI Suggestions", 
                desc: "Get bespoke outfit architectures based on your biological pigments.",
                color: "bg-amber-50 text-amber-600"
              },
              { 
                icon: <ShoppingBag className="w-8 h-8" />, 
                title: "Shop the Look", 
                desc: "Seamlessly source pieces from global ateliers within the app.",
                color: "bg-green-50 text-green-600"
              }
            ].map((feat, idx) => (
              <FadeIn key={idx} delay={idx * 100} className="bg-brand-ivory p-12 rounded-[3.5rem] border border-brand-sandstone/10 luxury-card group hover:-translate-y-4 transition-all">
                <div className={`w-16 h-16 ${feat.color} rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 duration-500`}>
                  {feat.icon}
                </div>
                <h4 className="text-2xl font-serif font-bold text-brand-onyx mb-4">{feat.title}</h4>
                <p className="text-brand-slate text-sm leading-relaxed font-serif italic">{feat.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: BLOG PREVIEW SECTION */}
      <section className="py-32 bg-brand-ivory border-y border-brand-sandstone/10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-brand-sandstone uppercase tracking-[0.5em]">The Gazette</h2>
              <h3 className="text-5xl font-serif font-bold text-brand-onyx">Style <span className="italic text-brand-sandstone">Intelligence.</span></h3>
            </div>
            <Button onClick={() => onNavigate(Screen.BLOG)} variant="outline" className="rounded-2xl py-4" icon={<ArrowRight className="w-4 h-4" />}>Read More Articles</Button>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: "The Architecture of Neural Draping",
                excerpt: "How our latest update improved silk and linen physics simulation by over 40% for the summer season.",
                tag: "Tech",
                image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop"
              },
              {
                title: "Sustainable Fashion: The Digital First Movement",
                excerpt: "Exploring how virtual try-on is drastically reducing the global carbon footprint of retail returns.",
                tag: "Sustainability",
                image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop"
              }
            ].map((post, idx) => (
              <FadeIn key={idx} delay={idx * 150} className="group cursor-pointer" onClick={() => onNavigate(Screen.BLOG)}>
                <div className="bg-white rounded-[3rem] overflow-hidden border border-brand-sandstone/10 shadow-sm group-hover:shadow-xl transition-all duration-700">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={post.title} />
                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-brand-onyx">{post.tag}</div>
                  </div>
                  <div className="p-10 space-y-4">
                    <div className="flex items-center gap-4 text-[9px] font-bold text-brand-slate uppercase tracking-widest opacity-60">
                      <Clock className="w-3.5 h-3.5" /> 8 Min Read
                    </div>
                    <h4 className="text-2xl font-serif font-bold text-brand-onyx group-hover:text-brand-champagne transition-colors">{post.title}</h4>
                    <p className="text-brand-slate text-sm font-serif italic leading-relaxed line-clamp-2">"{post.excerpt}"</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS - THE NEURAL PROTOCOL */}
      <section className="py-32 bg-brand-onyx text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-0"></div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-sm font-bold text-brand-champagne uppercase tracking-[0.5em]">The Protocol</h2>
            <h3 className="text-5xl font-serif font-bold italic">Bespoke in Seconds.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-20">
            {[
              { step: "01", icon: <Camera className="w-10 h-10" />, title: "Capture Silhouette", desc: "Upload a selfie to define your biometric frame." },
              { step: "02", icon: <Layers className="w-10 h-10" />, title: "Select Couture", desc: "Choose a dress or upload an item from any gallery." },
              { step: "03", icon: <Sparkles className="w-10 h-10" />, title: "Neural Synthesis", desc: "Our engine projects the garment with perfect physics." }
            ].map((step, idx) => (
              <div key={idx} className="text-center space-y-8 group">
                <div className="relative">
                  <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto text-brand-champagne group-hover:bg-brand-champagne group-hover:text-brand-onyx transition-all duration-700">
                    {step.icon}
                  </div>
                  <span className="absolute -top-4 -right-4 text-6xl font-serif font-bold italic text-white/5 select-none">{step.step}</span>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-bold uppercase tracking-widest">{step.title}</h4>
                  <p className="text-brand-slate text-sm font-serif italic max-w-[250px] mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: FAQ PREVIEW SECTION */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <h2 className="text-sm font-bold text-brand-sandstone uppercase tracking-[0.5em]">Assistance</h2>
              <h3 className="text-5xl font-serif font-bold text-brand-onyx">Common <span className="italic text-brand-champagne">Inquiries.</span></h3>
            </div>

            <div className="space-y-4">
              {[
                { q: "What exactly is Neural Try-On?", a: "Neural Try-On is our proprietary AI technology that analyzes your body's silhouette, pose, and lighting to realistically overlay a garment." },
                { q: "How accurate is the fit?", a: "Our AI is currently 94% accurate to real-world drape based on biometric calibration." },
                { q: "Is my photo data secure?", a: "Your photos are processed in memory and never used to train global AI models without your explicit consent." }
              ].map((item, idx) => (
                <div key={idx} className="p-8 bg-brand-ivory rounded-3xl border border-brand-sandstone/10 flex items-start gap-6 group hover:border-brand-champagne transition-all cursor-pointer" onClick={() => onNavigate(Screen.FAQ)}>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-onyx shrink-0 group-hover:bg-brand-onyx group-hover:text-white transition-all shadow-sm">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-brand-onyx uppercase tracking-widest">{item.q}</h4>
                    <p className="text-brand-slate text-sm font-serif italic">"{item.a}"</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button onClick={() => onNavigate(Screen.FAQ)} variant="primary" className="rounded-2xl py-5 px-10" icon={<BookOpen className="w-5 h-5" />}>View All FAQs</Button>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: BRAND GUIDE PREVIEW SECTION */}
      <section className="py-32 bg-brand-onyx text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-full bg-brand-champagne/5 blur-[120px]"></div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="w-full lg:w-1/2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-brand-champagne uppercase tracking-[0.5em]">The DNA</h2>
                <h3 className="text-5xl font-serif font-bold">Visual Identity <br /> <span className="italic text-brand-sandstone">Foundations.</span></h3>
                <p className="text-brand-slate text-lg font-serif italic leading-relaxed opacity-80">"The architecture of The New You is a precise intersection between digital precision and couture heritage."</p>
              </div>
              <Button onClick={() => onNavigate(Screen.BRAND_GUIDE)} variant="secondary" className="rounded-2xl py-6 px-12" icon={<Layout className="w-5 h-5" />}>Full Brand Guide</Button>
            </div>

            <div className="w-full lg:w-1/2 grid grid-cols-2 gap-8">
              <FadeIn className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => onNavigate(Screen.BRAND_GUIDE)}>
                <div className="w-14 h-14 bg-brand-champagne/10 rounded-2xl flex items-center justify-center text-brand-champagne">
                  <Palette className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em]">Chromatic</h4>
                  <p className="text-2xl font-serif font-bold">Spectrum DNA</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1C1917] border border-white/10"></div>
                  <div className="w-8 h-8 rounded-full bg-[#D6C7B3]"></div>
                  <div className="w-8 h-8 rounded-full bg-[#E8D1B5]"></div>
                </div>
              </FadeIn>

              <FadeIn delay={100} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => onNavigate(Screen.BRAND_GUIDE)}>
                <div className="w-14 h-14 bg-brand-champagne/10 rounded-2xl flex items-center justify-center text-brand-champagne">
                  <Type className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em]">Typography</h4>
                  <p className="text-2xl font-serif font-bold">Semantic Pacing</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-serif font-bold">Lora Bold</p>
                  <p className="text-xs font-sans font-bold uppercase tracking-widest opacity-40">Montserrat</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US - THE ARCHITECTURE */}
      <section className="py-40 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="flex-1 space-y-12">
              <div className="space-y-6">
                <h2 className="text-sm font-bold text-brand-sandstone uppercase tracking-[0.5em]">The Advantage</h2>
                <h3 className="text-5xl md:text-6xl font-serif font-bold text-brand-onyx leading-tight">Engineered for <br /><span className="italic text-brand-champagne">The Perfectionist.</span></h3>
                <p className="text-brand-slate text-lg font-serif italic max-w-xl">
                  We don't just overlay images; we reconstruct reality. Our proprietary engine handles the nuances that others ignore.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-10">
                {[
                  { icon: <Maximize2 className="w-6 h-6" />, title: "Pixel Precision", desc: "Clean background removal and millimetric alignment." },
                  { icon: <UserCheck className="w-6 h-6" />, title: "Face Preservation", desc: "Neural masking ensures your identity remains untouched." },
                  { icon: <CheckCircle2 className="w-6 h-6" />, title: "Physics Engine", desc: "Realistic fabric draping based on pose and lighting." },
                  { icon: <Palette className="w-6 h-6" />, title: "Chromatic Mapping", desc: "Adapts garment tones to match your skin's spectral DNA." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="mt-1 text-brand-champagne">{item.icon}</div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-brand-onyx uppercase tracking-widest text-xs">{item.title}</h4>
                      <p className="text-brand-slate text-xs font-serif italic leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="aspect-square bg-brand-ivory rounded-[4rem] border border-brand-sandstone/10 shadow-luxury flex items-center justify-center p-12 overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop" 
                  className="w-full h-full object-cover rounded-[3rem] grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-2xl" 
                />
                <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl p-6 text-center animate-pulse-soft">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-onyx">AI Silhouette Confidence: 99.4%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS - THE SOCIAL FABRIC */}
      <section className="py-40 bg-brand-ivory border-y border-brand-sandstone/10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-sm font-bold text-brand-sandstone uppercase tracking-[0.5em]">Voices</h2>
            <h3 className="text-5xl font-serif font-bold text-brand-onyx italic">Member Perspectives.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { name: "Julianne V.", role: "Creative Director", quote: "The neural drapes are indistinguishable from real life. It has saved me countless hours of physical fittings." },
              { name: "Marcus T.", role: "Fashion Blogger", quote: "Finally, an app that understands skin undertones. The Neural Color Theory is a complete game changer." },
              { name: "Serena K.", role: "Entrepreneur", quote: "The smartest closet I've ever owned. Organising my digital archive is now part of my morning ritual." }
            ].map((t, idx) => (
              <FadeIn key={idx} delay={idx * 150} className="bg-white p-12 rounded-[3.5rem] shadow-luxury space-y-8 flex flex-col items-center text-center group">
                <div className="flex gap-1 text-brand-champagne">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-brand-onyx text-xl font-serif italic leading-relaxed">"{t.quote}"</p>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-onyx">{t.name}</h4>
                  <p className="text-xs text-brand-slate mt-1 font-serif italic">{t.role}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION - THE FINAL EVOLUTION */}
      <section className="py-60 relative overflow-hidden bg-brand-onyx">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <Logo className="w-[120vw] h-[120vw] text-white rotate-12" />
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center space-y-16">
          <FadeIn className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-6xl md:text-9xl font-serif font-bold text-white leading-[0.85]">
              Redefine <br /> <span className="italic text-brand-sandstone">The Paradigm.</span>
            </h2>
            <p className="text-xl md:text-2xl text-brand-slate font-serif italic max-w-2xl mx-auto">
              Step into the studio today and witness the total transformation of your personal silhouette.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button 
                onClick={() => onNavigate(Screen.HOME)}
                variant="secondary" 
                className="py-10 px-24 rounded-[3rem] text-lg font-bold shadow-luxury"
              >
                Try Now
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
};
