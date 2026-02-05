
import React from 'react';
import { FadeIn } from '../components/Components';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export const PrivacyScreen: React.FC = () => {
  return (
    <div className="bg-[#fdfcf8] py-32">
        <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto space-y-20">
                <div className="text-center space-y-8">
                    <div className="w-24 h-24 bg-amber-200 rounded-[2.5rem] flex items-center justify-center mx-auto text-stone-900 shadow-2xl mb-10">
                        <Shield className="w-12 h-12" />
                    </div>
                    <h1 className="text-6xl font-serif font-bold text-stone-900">Privacy & <br /> Data Integrity.</h1>
                    <p className="text-stone-400 text-lg font-serif italic max-w-2xl mx-auto">"Our commitment to protecting your biometric silhouette and personal identity in the digital space."</p>
                </div>

                <div className="bg-white rounded-[4rem] p-12 lg:p-20 border border-stone-100 shadow-sm space-y-16">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-4">
                            <span className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-xs font-bold text-stone-400">01</span> 
                            The Biometric Silhouette
                        </h2>
                        <p className="text-stone-500 leading-relaxed font-serif italic text-lg">
                            To perform neural try-on, our AI analyzes specific body proportions from your uploaded photos. These are converted into high-dimensional vector embeddings (your "silhouette"). We do not store original photos on our permanent servers unless you explicitly save them to your digital closet.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-4">
                            <span className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-xs font-bold text-stone-400">02</span> 
                            Data Sanitization
                        </h2>
                        <p className="text-stone-500 leading-relaxed font-serif italic text-lg">
                            Any data transmitted to our neural processing engines is encrypted in transit and at rest. We employ automated scrubbing routines that purge temporary session data every 24 hours to ensure your visual assets remain private.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-4">
                            <span className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-xs font-bold text-stone-400">03</span> 
                            AI Ethics & Training
                        </h2>
                        <p className="text-stone-500 leading-relaxed font-serif italic text-lg">
                            We do not sell your style preferences or body measurements to third-party advertisers. Your silhouette data is exclusively yours, used solely to power the concierge and stylist features of the The New You platform.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-4">
                            <span className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-xs font-bold text-stone-400">04</span> 
                            The Right to Erasure
                        </h2>
                        <p className="text-stone-500 leading-relaxed font-serif italic text-lg">
                            Within the Account Preferences, members have the ability to purge their entire digital archive, including closet projections, measurement data, and the biometric silhouette, with immediate and irreversible effect.
                        </p>
                    </section>
                    
                    <div className="pt-12 border-t border-stone-50">
                        <div className="flex items-center gap-3 text-green-500 font-bold uppercase tracking-widest text-[10px]">
                            <CheckCircle className="w-4 h-4" /> Last Updated: October 2024 • Version 2.0
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <p className="text-stone-400 text-xs font-medium uppercase tracking-[0.2em]">Compliance Inquiries</p>
                    <p className="text-stone-900 font-bold">thenewyouai@gmail.com</p>
                </div>
            </div>
        </div>
    </div>
  );
};
