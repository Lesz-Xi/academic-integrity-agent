import React, { useState } from 'react';
import { Facebook, ArrowLeft, Check, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onLogin: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
  initialIsSignUp?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack, theme, initialIsSignUp = false }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { needsConfirmation } = await signUpWithEmail(email, password);
        if (needsConfirmation) {
          setSuccess('Check your email to confirm your account!');
        } else {
          onLogin();
        }
      } else {
        await signInWithEmail(email, password);
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      // Will redirect to Google OAuth
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithFacebook();
    } catch (err: any) {
      setError(err.message || 'Facebook sign-in failed');
      setLoading(false);
    }
  };

  const handleInstagramAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithInstagram();
    } catch (err: any) {
      setError(err.message || 'Instagram sign-in failed');
      setLoading(false);
    }
  };

  // Custom Google Icon SVG since Lucide doesn't have a branded multi-color one
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-[#F5F3EE] text-[#2D2D2D]'
    }`}>
      {/* Left Column (Brand/Visual) */}
      <div className={`hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 ${
        theme === 'dark' ? 'bg-[#111]' : 'bg-[#E5E3DD]'
      }`}>
        {/* Background Patterns */}
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[100px] opacity-20 pointer-events-none ${
           theme === 'dark' ? 'bg-[#F2E8CF]' : 'bg-[#CC785C]'
        }`} />
        
        <div className="relative z-10">
          <div className="w-10 h-10 bg-[#F2E8CF] rounded-xl flex items-center justify-center text-[#2D2D2D] font-bold text-xl shadow-lg mb-6">
            A
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ACADEMIC INTELLIGENCE</h1>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="text-6xl text-[#F2E8CF] font-serif mb-4">"</div>
          <p className="text-2xl font-light leading-relaxed mb-6">
            Integrity is not just what you write, but how you synthesize it. 
            Our intelligent infrastructure powers the future of ethical academic research.
          </p>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F2E8CF] to-[#E5AA70] flex items-center justify-center text-[#1a1a1a] font-bold">
                JD
             </div>
             <div>
                <p className="font-bold">Julian Davis</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Head of Ethics, Archetype Univ.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <button 
            onClick={onBack}
            className={`absolute top-8 left-8 p-2 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-[#333]' : 'hover:bg-[#E5E3DD]'
            }`}
        >
            <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold">{isSignUp ? 'Create account' : 'Welcome back'}</h2>
                <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isSignUp ? 'Sign up to get started with the workspace.' : 'Enter your credentials to access the workspace.'}
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{success}</p>
                </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Email address</label>
                    <input 
                        type="email" 
                        placeholder="name@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg outline-none transition-all border ${
                            theme === 'dark' 
                                ? 'bg-[#252525] border-[#444] focus:border-[#F2E8CF] text-white placeholder-gray-600' 
                                : 'bg-white border-gray-300 focus:border-[#F2E8CF] text-[#2D2D2D]'
                        }`}
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg outline-none transition-all border ${
                            theme === 'dark' 
                                ? 'bg-[#252525] border-[#444] focus:border-[#D2B48C] text-white placeholder-gray-600' 
                                : 'bg-white border-gray-300 focus:border-[#D2B48C] text-[#2D2D2D]'
                        }`}
                    />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div 
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                rememberMe 
                                    ? 'bg-[#D2B48C] border-[#D2B48C]' 
                                    : (theme === 'dark' ? 'border-[#444] bg-[#252525]' : 'border-gray-300 bg-white')
                            }`}
                            onClick={() => setRememberMe(!rememberMe)}
                        >
                            {rememberMe && <Check className="w-3 h-3 text-[#1a1a1a]" />}
                        </div>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Remember for 30 days</span>
                    </label>
                    <button className="text-[#D2B48C] hover:underline font-medium">Forgot password?</button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-white text-[#1a1a1a] font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg active:scale-[0.99] transform text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    {isSignUp ? 'Sign up' : 'Sign in'}
                </button>
            </form>

            <div className="space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${theme === 'dark' ? 'border-[#333]' : 'border-gray-300'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className={`px-2 ${theme === 'dark' ? 'bg-[#1a1a1a] text-gray-500' : 'bg-[#F5F3EE] text-gray-500'}`}>
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className={`flex items-center justify-center py-2.5 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            theme === 'dark' ? 'border-[#444] hover:bg-[#252525]' : 'border-gray-300 hover:bg-white'
                        }`}
                        title="Sign in with Google"
                    >
                        <GoogleIcon />
                    </button>
                    <button 
                        type="button"
                        onClick={handleFacebookAuth}
                        disabled={loading}
                        className={`flex items-center justify-center py-2.5 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                         theme === 'dark' ? 'border-[#444] hover:bg-[#252525]' : 'border-gray-300 hover:bg-white'
                        }`}
                        title="Sign in with Facebook"
                    >
                        <Facebook className="w-5 h-5 text-[#1877F2]" fill="#1877F2" strokeWidth={0} />
                    </button>
                    <button 
                        type="button"
                        onClick={handleInstagramAuth}
                        disabled={loading}
                        className={`flex items-center justify-center py-2.5 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                         theme === 'dark' ? 'border-[#444] hover:bg-[#252525]' : 'border-gray-300 hover:bg-white'
                        }`}
                        title="Sign in with Instagram"
                    >
                         {/* Instagram Gradient Icon */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <defs>
                                <linearGradient id="instaGradient" x1="2" y1="22" x2="22" y2="2">
                                    <stop offset="0%" stopColor="#f09433"/>
                                    <stop offset="25%" stopColor="#e6683c"/>
                                    <stop offset="50%" stopColor="#dc2743"/>
                                    <stop offset="75%" stopColor="#cc2366"/>
                                    <stop offset="100%" stopColor="#bc1888"/>
                                </linearGradient>
                            </defs>
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#instaGradient)" fill="none" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#instaGradient)" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="url(#instaGradient)" />
                        </svg>
                    </button>
                </div>

                <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[#D2B48C] font-bold hover:underline"
                    >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
