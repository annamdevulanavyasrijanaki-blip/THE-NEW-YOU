"use client";

import dynamic from 'next/dynamic';

const AppCore = dynamic(() => import('@/components/AppCore'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-brand-ivory flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-brand-sandstone/20 border-t-brand-onyx rounded-full animate-spin" />
        <p className="font-serif italic text-brand-slate tracking-widest text-[10px] uppercase">Initializing Atelier...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return <AppCore />;
}