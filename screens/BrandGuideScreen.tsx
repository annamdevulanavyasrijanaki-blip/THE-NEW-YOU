
import React, { useState, useEffect } from 'react';
import { 
  FadeIn, 
  Logo, 
  Button 
} from '../components/Components';
import { 
  Sparkles, 
  CheckCircle, 
  XCircle,
  Copy, 
  Download, 
  ArrowRight,
  Eye,
  Heart,
  Zap,
  Layout,
  MessageSquare,
  Shield,
  Palette,
  Type,
  ImageIcon,
  Box,
  Menu,
  ChevronRight
} from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: <Box className="w-4 h-4" /> },
  { id: 'values', label: 'Brand Values', icon: <Heart className="w-4 h-4" /> },
  { id: 'logo', label: 'Logo Usage', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'colors', label: 'Color Palette', icon: <Palette className="w-4 h-4" /> },
  { id: 'typography', label: 'Typography', icon: <Type className="w-4 h-4" /> },
  { id: 'imagery', label: 'Imagery Style', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'ui-components', label: 'UI Components', icon: <Layout className="w-4 h-4" /> },
  { id: 'voice', label: 'Voice & Tone', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'dos-donts', label: 'Do\'s & Don\'ts', icon: <CheckCircle className="w-4 h-4" /> },
];

export const BrandGuideScreen: React.FC = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const downloadAsset = (name: string) => {
    // Mock download functionality
    const blob = new Blob(["Asset Data"], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.png`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Observe scroll to update active navigation item
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-brand-ivory min-h-screen">
      {/* Mobile Top Nav */}
      <div className="lg:hidden sticky top-[60px] z-50 bg-white/80 backdrop-blur-md border-b border-brand-sandstone/10 p-4 overflow-x-auto no-scrollbar flex gap-4">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeSection === section.id ? 'bg-brand-onyx text-brand-champagne shadow-lg' : 'bg-brand-sandstone/10 text-brand-slate'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sticky Sidebar Nav */}
        <aside className="hidden lg:block w-72 h-[calc(100vh-60px)] sticky top-[60px] p-12 border-r border-brand-sandstone/10 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-brand-sandstone uppercase tracking-[0.3em] mb-6">Navigation</p>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all group ${
                  activeSection === section.id 
                    ? 'bg-brand-onyx text-brand-champagne shadow-luxury' 
                    : 'text-brand-slate hover:bg-brand-sandstone/5'
                }`}
              >
                <span className={activeSection === section.id ? 'text-brand-champagne' : 'text-brand-sandstone group-hover:text-brand-onyx'}>
                  {section.icon}
                </span>
                {section.label}
              </button>
            ))}
          </div>
          
          <div className="mt-20 p-6 bg-brand-onyx rounded-[2rem] text-white space-y-4">
            <Logo className="w-8 h-8 text-brand-champagne" />
            <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed opacity-60">
              The New You <br /> Visual Identity System v2.0
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-20 space-y-40">
          
          {/* OVERVIEW SECTION */}
          <section id="overview" className="scroll-mt-40 space-y-12">
            <FadeIn className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-champagne/10 border border-brand-champagne/20 text-brand-champagne text-[9px] font-bold uppercase tracking-[0.4em]">
                <Box className="w-3 h-3" /> The Design System
              </div>
              <h1 className="text-6xl lg:text-8xl font-serif font-bold text-brand-onyx leading-tight tracking-tighter">
                Brand <span className="italic text-brand-sandstone">Guide.</span>
              </h1>
              <p className="text-2xl font-serif italic text-brand-slate max-w-2xl">
                "The aesthetic architecture of The New You: A dialogue between generative precision and couture heritage."
              </p>
            </FadeIn>

            <FadeIn delay={100} className="grid lg:grid-cols-2 gap-12 bg-white p-12 lg:p-16 rounded-[4rem] border border-brand-sandstone/10 shadow-luxury">
              <div className="space-y-6">
                <h3 className="text-3xl font-serif font-bold text-brand-onyx">Our Mission</h3>
                <p className="text-lg text-brand-slate font-serif italic leading-relaxed">
                  The New You is a luxurious, AI-powered virtual try-on and styling assistant. We exist to bridge the gap between imagination and reality, empowering individuals to visualize their perfect silhouette before it ever touches their skin.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-serif font-bold text-brand-onyx">The Problem</h3>
                <p className="text-lg text-brand-slate font-serif italic leading-relaxed">
                  Modern fashion consumption is fragmented. We solve the "fit frustration" by using proprietary neural-stitching algorithms to provide a risk-free, high-fidelity visualization of garments on personal biometric frames.
                </p>
              </div>
            </FadeIn>
          </section>

          {/* VALUES SECTION */}
          <section id="values" className="scroll-mt-40 space-y-16">
            <div className="flex items-center justify-between border-b border-brand-sandstone/20 pb-8">
              <h2 className="text-4xl font-serif font-bold text-brand-onyx">Brand Values</h2>
              <span className="text-[10px] font-bold text-brand-sandstone uppercase tracking-widest">Internal Compass</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Shield className="w-6 h-6" />, title: "Trust", desc: "We prioritize biometric security and data sanitization as our absolute baseline." },
                { icon: <Zap className="w-6 h-6" />, title: "Innovation", desc: "We push the boundaries of neural synthesis to reconstruct reality, not just filter it." },
                { icon: <Eye className="w-6 h-6" />, title: "Precision", desc: "Every pixel matters. We strive for 99% accuracy in drape, texture, and silhouette." },
                { icon: <Heart className="w-6 h-6" />, title: "Inclusivity", desc: "Our AI is trained to understand and celebrate the infinite diversity of the human form." },
                { icon: <Sparkles className="w-6 h-6" />, title: "Simplicity", desc: "Luxury is the removal of friction. Our interface stays silent, allowing style to speak." },
                { icon: <Box className="w-6 h-6" />, title: "Sustainability", desc: "By reducing return rates, we minimize the environmental footprint of fashion." },
              ].map((val, idx) => (
                <div key={idx} className="group p-10 bg-white rounded-[3rem] border border-brand-sandstone/10 shadow-sm hover:shadow-luxury hover:-translate-y-2 transition-all">
                  <div className="w-14 h-14 bg-brand-ivory rounded-2xl flex items-center justify-center text-brand-onyx group-hover:bg-brand-onyx group-hover:text-brand-champagne transition-all mb-6">
                    {val.icon}
                  </div>
                  <h4 className="text-xl font-serif font-bold text-brand-onyx mb-4">{val.title}</h4>
                  <p className="text-sm text-brand-slate leading-relaxed font-serif italic">"{val.desc}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* LOGO SECTION */}
          <section id="logo" className="scroll-mt-40 space-y-16">
            <div className="flex items-center justify-between border-b border-brand-sandstone/20 pb-8">
              <h2 className="text-4xl font-serif font-bold text-brand-onyx">Logo Usage</h2>
              <span className="text-[10px] font-bold text-brand-sandstone uppercase tracking-widest">Neural Aperture</span>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="bg-white p-12 lg:p-20 rounded-[4rem] border border-brand-sandstone/10 shadow-luxury flex flex-col items-center gap-12 group">
                <Logo showText className="w-16 h-16 text-brand-onyx group-hover:scale-110 transition-transform duration-1000" />
                <div className="flex flex-col items-center gap-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone">Light Background Variation</p>
                  <div className="flex gap-3">
                    <button onClick={() => downloadAsset('logo-light-svg')} className="flex items-center gap-2 px-6 py-3 bg-brand-ivory rounded-xl text-[9px] font-bold uppercase tracking-widest text-brand-onyx hover:bg-brand-onyx hover:text-white transition-all">
                      <Download className="w-3.5 h-3.5" /> SVG
                    </button>
                    <button onClick={() => downloadAsset('logo-light-png')} className="flex items-center gap-2 px-6 py-3 bg-brand-ivory rounded-xl text-[9px] font-bold uppercase tracking-widest text-brand-onyx hover:bg-brand-onyx hover:text-white transition-all">
                      <Download className="w-3.5 h-3.5" /> PNG
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-brand-onyx p-12 lg:p-20 rounded-[4rem] shadow-luxury flex flex-col items-center gap-12 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <Logo showText dark className="w-16 h-16 group-hover:scale-110 transition-transform duration-1000" />
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Dark Background Variation</p>
                  <div className="flex gap-3">
                    <button onClick={() => downloadAsset('logo-dark-svg')} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-brand-onyx transition-all">
                      <Download className="w-3.5 h-3.5" /> SVG
                    </button>
                    <button onClick={() => downloadAsset('logo-dark-png')} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-brand-onyx transition-all">
                      <Download className="w-3.5 h-3.5" /> PNG
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-brand-sandstone/5 rounded-[2.5rem] border border-brand-sandstone/10 flex items-start gap-6">
              <Sparkles className="w-6 h-6 text-brand-sandstone shrink-0 mt-1" />
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-brand-onyx">Usage Note</h5>
                <p className="text-sm text-brand-slate font-serif italic">"Always maintain clear space equivalent to the height of the lens symbol around the logo. Avoid distortion, drop shadows (unless system standard), or unauthorized color filters."</p>
              </div>
            </div>
          </section>

          {/* COLORS SECTION */}
          <section id="colors" className="scroll-mt-40 space-y-16">
            <div className="flex items-center justify-between border-b border-brand-sandstone/20 pb-8">
              <h2 className="text-4xl font-serif font-bold text-brand-onyx">Color Palette</h2>
              <span className="text-[10px] font-bold text-brand-sandstone uppercase tracking-widest">Spectral DNA</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { name: "Brand Onyx", hex: "#1C1917", usage: "Text & Depth", text: "text-white" },
                { name: "Sandstone", hex: "#D6C7B3", usage: "Accents & UI", text: "text-brand-onyx" },
                { name: "Champagne", hex: "#E8D1B5", usage: "Highlights", text: "text-brand-onyx" },
                { name: "Brand Ivory", hex: "#FDFCF8", usage: "Canvas", text: "text-brand-onyx" },
                { name: "Slate Grey", hex: "#706F6C", usage: "Subtitles", text: "text-white" },
              ].map((color, idx) => (
                <div 
                  key={idx} 
                  className={`aspect-[3/4] rounded-[3rem] p-8 flex flex-col justify-between transition-all hover:scale-105 active:scale-95 shadow-xl group cursor-pointer relative overflow-hidden ${color.text}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <div className="flex justify-end opacity-0 group-hover:opacity-40 transition-opacity">
                    <Copy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 mb-1">{color.usage}</p>
                    <h4 className="text-xs font-bold uppercase tracking-widest leading-none mb-3">{color.name}</h4>
                    <p className="text-2xl font-serif font-bold">
                      {copiedColor === color.hex ? 'COPIED!' : color.hex}
                    </p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 opacity-0 group-hover:opacity-100 transition-all"></div>
                </div>
              ))}
            </div>
          </section>

          {/* TYPOGRAPHY SECTION */}
          <section id="typography" className="scroll-mt-40 space-y-16">
            <div className="flex items-center justify-between border-b border-brand-sandstone/20 pb-8">
              <h2 className="text-4xl font-serif font-bold text-brand-onyx">Typography</h2>
              <span className="text-[10px] font-bold text-brand-sandstone uppercase tracking-widest">Semantic Pacing</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-brand-sandstone/10 shadow-luxury space-y-12">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-brand-sandstone border-b border-brand-ivory pb-4">
                    <span>Primary Font / Headings</span>
                    <span>Lora (Serif)</span>
                  </div>
                  <div className="space-y-6">
                    <p className="text-6xl font-serif font-bold text-brand-onyx">H1 Display</p>
                    <p className="text-4xl font-serif font-bold text-brand-onyx">H2 Section Heading</p>
                    <p className="text-2xl font-serif font-bold text-brand-onyx">H3 Component Title</p>
                    <p className="text-xl font-serif italic text-brand-slate opacity-80">"Stylist italic usage for quotes and emphasis."</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-brand-sandstone/10 shadow-luxury space-y-12">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-brand-sandstone border-b border-brand-ivory pb-4">
                    <span>Secondary Font / UI & Body</span>
                    <span>Montserrat (Sans)</span>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-onyx">Button Label / Meta Text</p>
                      <p className="text-xs text-brand-slate leading-relaxed">System metadata, navigation items, and button labels use high tracking and uppercase formatting.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-brand-onyx">Body Paragraph Medium</p>
                      <p className="text-sm text-brand-slate leading-relaxed">The quick brown fox jumps over the luxury silhouette. Clean, readable, and geometrically balanced for high-resolution displays.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-sandstone">Caption text for supporting details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* IMAGERY SECTION */}
          <section id="imagery" className="scroll-mt-40 space-y-16">
            <div className="flex items-center justify-between border-b border-brand-sandstone/20 pb-8">
              <h2 className="text-4xl font-serif font-bold text-brand-onyx">Imagery Style</h2>
              <span className="text-[10px] font-bold text-brand-sandstone uppercase tracking-widest">Visual Atmosphere</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { 
                  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000",
                  type: "Fashion Editorial",
                  rules: "Natural lighting, high contrast, clean architectural backgrounds."
                },
                { 
                  image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000",
                  type: "UI Product Mock",
                  rules: "Pure white backgrounds, soft shadows, 1:1 or 4:5 ratios."
                }
              ].map((style, idx) => (
                <div key={idx} className="space-y-6 group">
                  <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-sm group-hover:shadow-luxury transition-all duration-1000">
                    <img src={style.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s]" />
                  </div>
                  <div className="px-6 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-onyx">{style.type}</h4>
                    <p className="text-xs text-brand-slate font-serif italic leading-relaxed">"{style.rules}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* UI COMPONENTS SECTION */}
          <section id="ui-components" className="scroll-mt-40 space-y-16">
            <div className="flex items-center justify-between border-b border-brand-sandstone/20 pb-8">
              <h2 className="text-4xl font-serif font-bold text-brand-onyx">UI Components</h2>
              <span className="text-[10px] font-bold text-brand-sandstone uppercase tracking-widest">Building Blocks</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone">Button Variations</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Button variant="primary">Primary Call</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="outline" disabled>Disabled</Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone">System Chips</h4>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-5 py-2 bg-brand-onyx text-brand-champagne rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg">Active Selection</span>
                    <span className="px-5 py-2 bg-brand-ivory border border-brand-sandstone/20 rounded-full text-[9px] font-bold uppercase tracking-widest text-brand-slate">Inactive Filter</span>
                    <span className="px-5 py-2 bg-brand-champagne/20 text-brand-onyx border border-brand-champagne/30 rounded-full text-[9px] font-bold uppercase tracking-widest">Neural Tag</span>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone">Inputs & Controls</h4>
                  <div className="space-y-4 max-w-sm">
                    <div className="relative group">
                      <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-sandstone" />
                      <input type="text" placeholder="Archival search..." className="w-full bg-white border border-brand-sandstone/20 rounded-2xl py-4 pl-14 pr-6 text-sm focus:border-brand-onyx outline-none transition-all shadow-sm" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-6 bg-brand-onyx rounded-full p-1 flex items-center justify-end">
                        <div className="w-4 h-4 rounded-full bg-white"></div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-slate">Toggle Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* VOICE & TONE SECTION */}
          <section id="voice" className="scroll-mt-40 space-y-16">
            <div className="flex items-center justify-between border-b border-brand-sandstone/20 pb-8">
              <h2 className="text-4xl font-serif font-bold text-brand-onyx">Voice & Tone</h2>
              <span className="text-[10px] font-bold text-brand-sandstone uppercase tracking-widest">Linguistic DNA</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-brand-sandstone/10 shadow-luxury space-y-10">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-onyx">Brand Voice Is:</h4>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Encouraging", detail: "Empowering users through style." },
                    { label: "Concise", detail: "Removing semantic clutter." },
                    { label: "Sophisticated", detail: "Elevated, editorial vocabulary." },
                    { label: "Neural", detail: "Technically precise yet poetic." },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-lg font-serif font-bold text-brand-onyx italic">{item.label}</p>
                      <p className="text-[10px] text-brand-slate leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-10 border-t border-brand-ivory space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone">Sample Dispatch Copy</p>
                  <p className="text-xl font-serif italic text-brand-onyx leading-relaxed">
                    "Your neural wardrobe has been successfully synchronized. Ready to visualize your next silhouette?"
                  </p>
                </div>
              </div>

              <div className="bg-brand-onyx p-12 lg:p-16 rounded-[4rem] text-white space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px]"></div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40">Brand Voice Is Not:</h4>
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  {[
                    { label: "Robotic", detail: "Cold or overly mechanical." },
                    { label: "Hype-driven", detail: "Avoiding empty marketing slang." },
                    { label: "Judgmental", detail: "Style is subjective and personal." },
                    { label: "Verbose", detail: "We value the user's mental space." },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-lg font-serif font-bold text-white italic opacity-80">{item.label}</p>
                      <p className="text-[10px] text-brand-slate leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-10 border-t border-white/10 space-y-4 relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">The Anti-Sample</p>
                  <p className="text-xl font-serif italic text-white/40 leading-relaxed line-through">
                    "ERROR: Try again later. We are fixing our AI stuff for you right now."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* DO'S & DON'TS SECTION */}
          <section id="dos-donts" className="scroll-mt-40 space-y-16 pb-40">
            <div className="flex items-center justify-between border-b border-brand-sandstone/20 pb-8">
              <h2 className="text-4xl font-serif font-bold text-brand-onyx">Do's & Don'ts</h2>
              <span className="text-[10px] font-bold text-brand-sandstone uppercase tracking-widest">Protocol Compliance</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center gap-4 text-green-500">
                  <CheckCircle className="w-8 h-8" />
                  <h4 className="text-2xl font-serif font-bold">Standard Protocol</h4>
                </div>
                <div className="grid gap-4">
                  {[
                    "Use high-contrast silhouette photos for try-on.",
                    "Maintain the 3rem rounding radius on all containers.",
                    "Use Lora for emotional/high-level headings.",
                    "Ensure white backgrounds for product visualizations.",
                    "Communicate technical processing steps as 'Neural Synchronization'.",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 p-6 bg-green-50/30 rounded-3xl border border-green-100 text-stone-700">
                      <span className="text-xs font-bold text-green-500">{(idx + 1).toString().padStart(2, '0')}</span>
                      <p className="text-sm font-serif italic">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-4 text-red-500">
                  <XCircle className="w-8 h-8" />
                  <h4 className="text-2xl font-serif font-bold">Prohibited Methods</h4>
                </div>
                <div className="grid gap-4">
                  {[
                    "Applying drop shadows to the primary logo lens.",
                    "Using non-brand neon colors for UI highlighting.",
                    "Using Montserrat for emotional stylist quotes.",
                    "Crowding the negative space of the Ivory canvas.",
                    "Referring to the technology as 'simple filters'.",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 p-6 bg-red-50/30 rounded-3xl border border-red-100 text-stone-700">
                      <span className="text-xs font-bold text-red-400">{(idx + 1).toString().padStart(2, '0')}</span>
                      <p className="text-sm font-serif italic">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-brand-onyx rounded-[4rem] p-12 lg:p-24 text-center space-y-10 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <Logo className="w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 rotate-12" />
              </div>
              <FadeIn className="max-w-2xl mx-auto space-y-8 relative z-10">
                <h3 className="text-5xl font-serif font-bold">Ready to <span className="text-brand-sandstone italic">Create?</span></h3>
                <p className="text-brand-slate text-xl font-serif italic leading-relaxed">
                  "Our system is designed to be lived in. Use these foundations to build the future of fashion intelligence."
                </p>
                <div className="flex justify-center gap-6 pt-6">
                  <Button variant="secondary" className="py-6 px-12 rounded-[2rem]" icon={<Download className="w-4 h-4" />}>Full UI Kit</Button>
                </div>
              </FadeIn>
            </div>
          </section>

        </main>
      </div>
      
      {/* Copied Feedback */}
      {copiedColor && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up">
          <div className="bg-brand-onyx text-brand-champagne px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">HEX {copiedColor} Copied to clipboard</span>
          </div>
        </div>
      )}
    </div>
  );
};
