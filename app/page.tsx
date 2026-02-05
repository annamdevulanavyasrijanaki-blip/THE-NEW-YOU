"use client";

import dynamic from 'next/dynamic';

// Dynamically import the core logic to ensure client-side window/navigator availability
const AppCore = dynamic(() => import('@/components/AppCore'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-brand-ivory flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-brand-sandstone/20 border-t-brand-onyx rounded-full animate-spin" />
    </div>
  )
});

export default function Home() {
  return <AppCore />;
}