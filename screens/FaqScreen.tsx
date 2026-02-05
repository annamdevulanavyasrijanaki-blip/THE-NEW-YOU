
import React, { useState } from 'react';
import { FadeIn } from '../components/Components';
import { Plus, Minus, HelpCircle, Search, Sparkles, Shield, User, Zap } from 'lucide-react';

const CATEGORIZED_FAQ = [
  {
    category: "Technology",
    icon: <Zap className="w-5 h-5" />,
    items: [
      { q: "What exactly is Neural Try-On?", a: "Neural Try-On is our proprietary AI technology that analyzes your body's silhouette, pose, and lighting to realistically overlay a garment. Unlike simple 2D filters, it simulates fabric physics, ambient occlusion, and texture mapping." },
      { q: "How accurate is the fit?", a: "Our AI is currently 94% accurate to real-world drape. For best results, we recommend uploading a high-resolution photo with neutral lighting and a clear silhouette." },
      { q: "How long does the AI projection take?", a: "Typically, a neural stitch takes between 5 to 12 seconds, depending on the complexity of the garment and the lighting environment." }
    ]
  },
  {
    category: "Security & Data",
    icon: <Shield className="w-5 h-5" />,
    items: [
      { q: "Is my photo data secure?", a: "Security is our highest priority. Your photos are processed in memory and are never used to train global AI models without your explicit consent. We use bank-level encryption for all biometric data storage." },
      { q: "What is your data retention policy?", a: "We employ automated scrubbing routines that purge temporary session data every 24 hours. Permanent storage only occurs for items you explicitly save to your closet." }
    ]
  },
  {
    category: "Experience & Membership",
    icon: <User className="w-5 h-5" />,
    items: [
      { q: "What is the AI Stylist feature?", a: "The AI Stylist is a generative consultant that analyzes your curated looks and provides styling advice, matching accessory suggestions, and occasion-based outfit picks." },
      { q: "Is there a cost to use the service?", a: "We offer a 'Studio Pass' for basic concierge services. Professional-grade high-resolution exports and unlimited stylist consultations require a premium membership." }
    ]
  }
];

export const FaqScreen: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>("Technology-0");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = CATEGORIZED_FAQ.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="bg-[#fdfcf8] min-h-screen py-32 pb-48">
        <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto space-y-24">
                {/* Header */}
                <div className="text-center space-y-8">
                    <div className="w-20 h-20 bg-stone-900 rounded-[2rem] flex items-center justify-center mx-auto text-amber-200 mb-8 shadow-2xl relative">
                        <HelpCircle className="w-10 h-10" />
                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
                    </div>
                    <h1 className="text-6xl font-serif font-bold text-stone-900 leading-tight">Collective <br /> Intelligence.</h1>
                    <p className="text-stone-400 text-xl font-serif italic max-w-xl mx-auto">Explore the neural mechanics and operational protocols of The New You studio.</p>
                </div>

                {/* Search Bar */}
                <div className="relative group max-w-2xl mx-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search the intelligence hub..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-[2rem] py-6 pl-16 pr-8 text-sm focus:border-amber-400 outline-none shadow-sm transition-all text-stone-800"
                    />
                </div>

                {/* FAQ Groups */}
                <div className="space-y-16">
                    {filteredCategories.map((cat, catIdx) => (
                        <FadeIn key={catIdx} delay={catIdx * 100} className="space-y-6">
                            <div className="flex items-center gap-4 px-4">
                                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-900">
                                    {cat.icon}
                                </div>
                                <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">{cat.category}</h2>
                            </div>
                            
                            <div className="space-y-3">
                                {cat.items.map((item, idx) => {
                                    const id = `${cat.category}-${idx}`;
                                    const isOpen = openId === id;
                                    
                                    return (
                                        <div key={id} className={`bg-white rounded-[2.5rem] border transition-all duration-500 ${isOpen ? 'border-amber-200 shadow-xl' : 'border-stone-100 shadow-sm'}`}>
                                            <button 
                                                onClick={() => setOpenId(isOpen ? null : id)}
                                                className="w-full p-8 flex items-center justify-between text-left group"
                                            >
                                                <span className={`text-lg font-bold uppercase tracking-widest transition-colors ${isOpen ? 'text-stone-900' : 'text-stone-500 group-hover:text-stone-900'}`}>{item.q}</span>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-amber-400 text-white rotate-180' : 'bg-stone-50 text-stone-300'}`}>
                                                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                </div>
                                            </button>
                                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="px-8 pb-8">
                                                    <div className="h-px bg-stone-50 mb-8"></div>
                                                    <p className="text-stone-500 leading-relaxed font-serif italic text-lg pr-12">"{item.a}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </FadeIn>
                    ))}

                    {filteredCategories.length === 0 && (
                      <div className="text-center py-20 bg-stone-50 rounded-[3rem] border border-dashed border-stone-200">
                        <p className="text-stone-400 font-serif italic">No matching records found for "{searchQuery}".</p>
                      </div>
                    )}
                </div>

                <div className="bg-stone-900 rounded-[4rem] p-16 text-center border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400 opacity-10 blur-3xl"></div>
                    <div className="relative z-10 space-y-6">
                      <h3 className="text-3xl font-serif font-bold text-white leading-tight">Still Seeking Clarity?</h3>
                      <p className="text-stone-400 mb-8 max-w-lg mx-auto font-serif italic leading-relaxed">Our human support concierge is available for bespoke inquiries regarding your account or unique styling challenges.</p>
                      <button className="bg-amber-400 text-stone-900 px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-xl shadow-amber-400/20">Direct Transmission</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
