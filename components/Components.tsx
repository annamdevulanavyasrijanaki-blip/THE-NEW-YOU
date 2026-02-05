
import React, { ReactNode } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass' | 'danger';
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Logo: React.FC<{ className?: string, showText?: boolean, dark?: boolean }> = ({ className = "w-8 h-8", showText = false, dark = false }) => (
    <div className={`flex items-center gap-3 ${dark ? 'text-white' : 'text-brand-onyx'}`}>
        <div className={`${className} relative flex items-center justify-center`}>
            {/* The Lens Symbol */}
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                <path d="M50 5 C74.85 5 95 25.15 95 50 C95 74.85 74.85 95 50 95 C25.15 95 5 74.85 5 50 C5 25.15 25.15 5 50 5 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M50 20 C66.57 20 80 33.43 80 50 C80 66.57 66.57 80 50 80 C33.43 80 20 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
            </svg>
        </div>
        {showText && (
            <span className="font-serif font-bold text-xl tracking-tight uppercase">
                The New You
            </span>
        )}
    </div>
);

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden transition-all duration-500 rounded-2xl font-bold uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-onyx text-brand-champagne hover:bg-brand-onyx/90 hover:shadow-luxury border border-brand-onyx",
    secondary: "bg-brand-champagne text-brand-onyx hover:bg-white border border-brand-champagne hover:shadow-luxury",
    outline: "border-2 border-brand-sandstone text-brand-onyx hover:bg-brand-sandstone hover:text-white",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} px-8 py-5`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && icon}
      {children}
    </button>
  );
};

export const PageContainer: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen w-full bg-brand-ivory text-brand-onyx ${className}`}>
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-sandstone/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-champagne/10 rounded-full blur-[120px]" />
    </div>
    
    <div className="relative z-10 w-full flex flex-col min-h-screen">
        {children}
    </div>
  </div>
);

/**
 * FadeIn component with optional id prop to support anchor-based scrolling.
 * Fixes type error in BlogScreen.tsx where FadeIn was receiving an id prop.
 */
export const FadeIn: React.FC<{ children: ReactNode, delay?: number, className?: string, onClick?: (e: React.MouseEvent) => void, id?: string }> = ({ children, delay = 0, className = '', onClick, id }) => (
  <div 
    id={id}
    className={`animate-fade-in-up opacity-0 ${className}`} 
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    onClick={onClick}
  >
    {children}
  </div>
);

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "Neural Processing..." }) => (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-ivory/95 backdrop-blur-md">
        <div className="relative">
            <div className="w-24 h-24 border-2 border-brand-sandstone/20 border-t-brand-onyx rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Logo className="w-8 h-8 animate-pulse-soft" />
            </div>
        </div>
        <p className="mt-8 text-brand-onyx font-serif tracking-[0.3em] uppercase text-[10px] animate-pulse-soft">{message}</p>
    </div>
);
