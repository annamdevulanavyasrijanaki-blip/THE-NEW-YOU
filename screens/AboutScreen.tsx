
import React from 'react';
import { FadeIn } from '../components/Components';
import { Sparkles, Shield, Zap, Globe, Heart, Eye } from 'lucide-react';

export const AboutScreen: React.FC = () => {
  return (
    <div className="bg-white">
      <section className="py-32 bg-stone-900 text-white">
          <div className="container mx-auto px-6 lg:px-12 text-center">
              <FadeIn className="max-w-3xl mx-auto space-y-8">
                  <h1 className="text-7xl font-serif font-bold leading-tight">The Vision <br /> Behind The Lens.</h1>
                  <p className="text-stone-400 text-xl font-serif italic leading-relaxed">"We believe fashion is the ultimate expression of human identity, and AI is the brush we use to paint it."</p>
              </FadeIn>
          </div>
      </section>

      <section className="py-32">
          <div className="container mx-auto px-6 lg:px-12">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                  <div className="relative">
                      <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border border-stone-100">
                          <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Fashion Mission" />
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-400 rounded-full flex flex-col items-center justify-center p-8 text-stone-900 text-center shadow-2xl">
                          <Heart className="w-8 h-8 mb-2" />
                          <span className="text-xs font-bold uppercase tracking-widest">Driven by Humanity</span>
                      </div>
                  </div>

                  <div className="space-y-12">
                      <div className="space-y-4">
                          <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.4em]">Our Mission</h2>
                          <h3 className="text-5xl font-serif font-bold text-stone-900">The Problem of Fit.</h3>
                          <p className="text-stone-500 text-lg leading-relaxed font-serif italic">
                              Every year, millions of tons of fashion waste are generated due to poor fit and mismatched expectations. E-commerce is broken—we buy, we wait, we return, we regret.
                          </p>
                          <p className="text-stone-500 text-lg leading-relaxed font-serif italic">
                              The New You was founded to bridge this gap. By leveraging proprietary neural-stitching algorithms, we allow you to truly *see* yourself in couture before a single thread is shipped.
                          </p>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                          {[
                              { icon: <Shield className="w-6 h-6" />, title: "Trust", desc: "Data security is our foundation." },
                              { icon: <Zap className="w-6 h-6" />, title: "Precision", desc: "Pixel-perfect neural fit." },
                              { icon: <Globe className="w-6 h-6" />, title: "Planet", desc: "Reducing returns and waste." },
                              { icon: <Eye className="w-6 h-6" />, title: "Identity", desc: "Your silhouette, empowered." }
                          ].map((v, i) => (
                              <div key={i} className="space-y-2">
                                  <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-900">{v.icon}</div>
                                  <h4 className="font-bold uppercase tracking-widest text-[10px] text-stone-900">{v.title}</h4>
                                  <p className="text-xs text-stone-400">{v.desc}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section className="py-32 bg-stone-50">
          <div className="container mx-auto px-6 lg:px-12 text-center">
              <div className="max-w-3xl mx-auto mb-20">
                  <h3 className="text-4xl font-serif font-bold text-stone-900">Sustainable Innovation.</h3>
                  <p className="text-stone-500 mt-6 leading-relaxed">By reducing return rates by an estimated 65%, The New You is not just a styling tool—it's a critical infrastructure for a sustainable fashion future.</p>
              </div>
          </div>
      </section>
    </div>
  );
};
