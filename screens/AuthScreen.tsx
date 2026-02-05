
import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { syncUserProfile } from '../services/firestore';
import { 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle,
  Loader2,
  ArrowRight,
  KeyRound,
  Check
} from 'lucide-react';
import { Button, FadeIn } from '../components/Components';

/**
 * MANDATORY: Email Verification Screen
 */
const EmailVerificationScreen: React.FC<{ email: string; onReturnToLogin: () => void }> = ({ email, onReturnToLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-[90vh] p-8">
      <FadeIn className="w-full max-w-xl bg-white rounded-[4rem] shadow-2xl border border-stone-100 p-16 text-center space-y-10">
        <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-green-500 shadow-xl">
          <Mail className="w-12 h-12" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-serif font-bold text-stone-900 leading-tight">Identity Check</h2>
          <p className="text-stone-500 text-lg leading-relaxed font-serif italic">
            We have sent you a verification email to <span className="text-stone-900 font-bold not-italic">{email}</span>. verify it and log in.
          </p>
        </div>

        <div className="pt-6">
          <Button 
            onClick={onReturnToLogin}
            className="w-full py-6 rounded-2xl shadow-xl shadow-green-200/50"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Login
          </Button>
        </div>
        
        <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest pt-4">
          Thank you for securing your digital profile.
        </p>
      </FadeIn>
    </div>
  );
};

/**
 * SUCCESS: Password Reset Sent Screen
 */
const PasswordResetSuccessScreen: React.FC<{ email: string; onReturnToLogin: () => void }> = ({ email, onReturnToLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-[90vh] p-8">
      <FadeIn className="w-full max-w-xl bg-white rounded-[4rem] shadow-2xl border border-stone-100 p-16 text-center space-y-10">
        <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-amber-500 shadow-xl">
          <KeyRound className="w-12 h-12" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-serif font-bold text-stone-900 leading-tight">Reset Link Dispatched</h2>
          <p className="text-stone-500 text-lg leading-relaxed font-serif italic">
            We sent you a password change link to <span className="text-stone-900 font-bold not-italic">{email}</span>. 
            Please check your inbox.
          </p>
        </div>

        <div className="pt-6">
          <Button 
            onClick={onReturnToLogin}
            className="w-full py-6 rounded-2xl shadow-xl shadow-amber-200/50"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Login
          </Button>
        </div>
      </FadeIn>
    </div>
  );
};

export const AuthScreen: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const mapAuthError = (code: string) => {
    switch (code) {
      case 'auth/too-many-requests':
        return "Too many attempts. For security, please wait a few minutes before trying again.";
      case 'auth/email-already-in-use':
        return "This email is already registered.";
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return "Invalid email or password.";
      case 'auth/network-request-failed':
        return "Network connection issue. Please check your internet.";
      default:
        return "Authentication failed. Please check your credentials.";
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSentTo(email);
    } catch (err: any) {
      setError(mapAuthError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        // Apply session persistence based on "Remember Me"
        await setPersistence(
          auth, 
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );

        const result = await signInWithEmailAndPassword(auth, email, password);
        
        if (!result.user.emailVerified) {
          await sendEmailVerification(result.user);
          setVerificationSentTo(email);
          await signOut(auth); 
          setIsLoading(false);
          return;
        }

        await syncUserProfile(result.user.uid, result.user.email || '', result.user.displayName || '');
        onAuthSuccess();
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        if (userCredential.user) {
          if (name) { 
            await updateProfile(userCredential.user, { displayName: name }); 
          }
          await sendEmailVerification(userCredential.user);
          setVerificationSentTo(email);
          await signOut(auth);
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setError(mapAuthError(err.code));
    } finally { 
      setIsLoading(false); 
    }
  };

  const resetToLogin = () => {
    setVerificationSentTo(null);
    setResetSentTo(null);
    setIsForgotPassword(false);
    setIsLogin(true);
    setError(null);
  };

  if (verificationSentTo) {
    return <EmailVerificationScreen email={verificationSentTo} onReturnToLogin={resetToLogin} />;
  }

  if (resetSentTo) {
    return <PasswordResetSuccessScreen email={resetSentTo} onReturnToLogin={resetToLogin} />;
  }

  return (
    <div className="flex items-center justify-center min-h-[90vh] p-8">
      <FadeIn className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[4rem] shadow-2xl border border-stone-100 overflow-hidden">
        {/* Visual Brand Side */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-stone-900 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-200/5 rounded-full blur-3xl"></div>
            
            <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-200 text-stone-900 shadow-xl mb-10">
                    <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="text-5xl font-serif font-bold leading-tight mb-6">Redefining the digital atelier.</h2>
                <p className="text-stone-400 text-lg leading-relaxed max-w-sm font-serif italic">"Step into a world where couture meets artificial intelligence. Your bespoke virtual wardrobe awaits."</p>
            </div>
            
            <div className="relative pt-10 border-t border-white/10">
                <div className="flex -space-x-3 mb-4">
                    {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-stone-900 bg-stone-800 flex items-center justify-center text-[10px] font-bold">M{i}</div>)}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">Join 10k+ Fashion Innovators</p>
            </div>
        </div>

        {/* Form Side */}
        <div className="p-10 lg:p-20 bg-white">
            <div className="text-center lg:text-left mb-12">
              <h1 className="text-4xl font-serif font-bold text-stone-800 mb-3">
                {isForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Join the Collective")}
              </h1>
              <p className="text-stone-400 text-sm font-medium">
                {isForgotPassword ? "We'll send you a neural recovery link." : "Access your personal concierge and vault."}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4 text-red-600 text-sm animate-fade-in-up">
                <AlertCircle className="w-6 h-6 mt-0.5 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={isForgotPassword ? handleForgotPassword : handleAuth} className="space-y-6">
              {!isLogin && !isForgotPassword && (
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                  <input type="text" placeholder="Full Member Name" required className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-5 pl-14 pr-6 text-sm focus:border-amber-400 focus:bg-white outline-none shadow-sm transition-all" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                <input type="email" placeholder="Email Address" required className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-5 pl-14 pr-6 text-sm focus:border-amber-400 focus:bg-white outline-none shadow-sm transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              {!isForgotPassword && (
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                  <input type="password" placeholder="Password" required className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-5 pl-14 pr-6 text-sm focus:border-amber-400 focus:bg-white outline-none shadow-sm transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                  <input type="password" placeholder="Confirm Password" required className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-5 pl-14 pr-6 text-sm focus:border-amber-400 focus:bg-white outline-none shadow-sm transition-all" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              )}

              {isLogin && !isForgotPassword && (
                <div className="flex items-center justify-between px-2">
                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <div className="w-5 h-5 border-2 border-stone-200 rounded-lg bg-white transition-all peer-checked:bg-stone-900 peer-checked:border-stone-900 group-hover:border-stone-400"></div>
                      <Check className="absolute w-3 h-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest group-hover:text-stone-600 transition-colors">Remember Me</span>
                  </label>

                  <button 
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(null); }}
                    className="text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-stone-900 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full py-5 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-amber-200/50" isLoading={isLoading}>
                {isForgotPassword ? "Get Reset Link" : (isLogin ? "Authenticate Account" : "Submit Registration")}
              </Button>
            </form>

            <div className="mt-10 text-center">
              <button onClick={() => { 
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                  setIsLogin(true);
                } else {
                  setIsLogin(!isLogin);
                }
                setError(null);
              }} className="text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-colors">
                {isForgotPassword ? "Return to authentication" : (isLogin ? "Establish a new profile" : "Return to authentication")}
              </button>
            </div>
        </div>
      </FadeIn>
    </div>
  );
};
