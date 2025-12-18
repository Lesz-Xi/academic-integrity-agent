import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { generateContent } from './services/academicIntegrityService';
import { GenerationService } from './services/generationService';
import { SubscriptionService } from './services/subscriptionService';
import { supabase } from './lib/supabase';
import { RotateCcw, Moon, Sun, Crown, LogOut } from 'lucide-react';
import { Mode, GenerationResponse, HistoryItem, EssayLength } from './types';
import { useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useGenerationHistory } from './hooks/useGenerationHistory';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import MetricsPanel from './components/MetricsPanel';
import EthicsDisclaimer from './components/EthicsDisclaimer';
import HistoryPanel from './components/HistoryPanel';
import RevealOnScroll from './components/RevealOnScroll';
import LimitReachedModal from './components/LimitReachedModal';
import CheckoutModal from './components/CheckoutModal';

// Lazy load route-level components for code splitting
const OnboardingTour = lazy(() => import('./components/OnboardingTour'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const AuthPage = lazy(() => import('./components/AuthPage'));

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, signOut, loading: authLoading } = useAuth();
  const { history, addItem, deleteItem, loading: historyLoading } = useGenerationHistory();

  // Default to 'essay' so the UI is ready immediately
  const [selectedMode, setSelectedMode] = useState<Mode>('essay');
  const [selectedLength, setSelectedLength] = useState<EssayLength>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerationResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [initAuthSignup, setInitAuthSignup] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  // Check subscription status with Realtime and Polling
  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    async function checkPremiumStatus(retries = 0) {
      if (!user) {
        if (mounted) setIsPremium(false);
        return;
      }

      try {
        console.log(`[App] Checking premium status (Attempt ${retries + 1})...`);
        const premium = await SubscriptionService.isPremium(user.id);
        
        if (mounted) {
          console.log('[App] Premium status result:', premium);
          
          if (premium) {
            // SUCCESS: Set to true immediately
            setIsPremium(true);
          } else if (retries < 5) {
            // MAYBE FALSE: Retry a few times before confirming
            console.log('[App] Premium check returned false, retrying...');
            const delay = (retries + 1) * 1000; // 1s, 2s, 3s, 4s, 5s
            setTimeout(() => checkPremiumStatus(retries + 1), delay);
          } else {
            // CONFIRMED FALSE: All retries exhausted, user is definitely not premium
            console.log('[App] All retries exhausted, user is not premium');
            setIsPremium(false);
          }
        }
      } catch (error) {
        console.error('[App] Failed to check premium status:', error);
        // On error, retry if possible before giving up
        if (mounted && retries < 5) {
          const delay = (retries + 1) * 1000;
          setTimeout(() => checkPremiumStatus(retries + 1), delay);
        } else if (mounted) {
          setIsPremium(false);
        }
      }
    }

    if (user) {
      // 1. Immediate Check
      checkPremiumStatus();

      // 2. Realtime Subscription
      channel = supabase
        .channel(`public:subscriptions:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: any) => {
            console.log('[App] Subscription change detected:', payload);
            checkPremiumStatus(); // Re-check on any change
          }
        )
        .subscribe();
    } else {
      setIsPremium(false);
    }

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, view]);
  
  // Usage Limit State
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const MONTHLY_LIMIT = 20; // Free tier: 20 generations before requiring subscription

  const outputContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to content when generated or restored
  useEffect(() => {
    if (generatedContent && outputContainerRef.current) {
      setTimeout(() => {
        outputContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [generatedContent]);

  useEffect(() => {
    // Check if user has previously accepted
    const accepted = localStorage.getItem('hasAcceptedDisclaimer');
    if (!accepted) {
      setShowDisclaimer(true);
    } else {
      setDisclaimerAccepted(true);
    }
  }, []);

  // Auto-redirect to app after successful authentication (but not during sign-out)
  useEffect(() => {
    if (isAuthenticated && user && view !== 'app' && !isSigningOut) {
      console.log('[App] User authenticated, redirecting to app')
      handleEnterApp()
    }
  }, [isAuthenticated, user, view, isSigningOut])

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('hasAcceptedDisclaimer', 'true');
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };

  const handleGenerate = async (input: string, additionalInstructions: string, useSearch: boolean = false) => {
    console.log('[App] handleGenerate triggered', { selectedMode, disclaimerAccepted, inputLength: input.length });
    
    // Ensure we have a mode (defaulting to essay if somehow null)
    const modeToUse = selectedMode || 'essay';
    
    if (!disclaimerAccepted) {
        console.warn('[App] Generation blocked: Disclaimer not accepted');
        setShowDisclaimer(true);
        return;
    }

    // Do a FRESH premium check every time to avoid race conditions with stale state
    let currentPremiumStatus = isPremium;
    if (user) {
      try {
        currentPremiumStatus = await SubscriptionService.isPremium(user.id);
        // Sync UI state if it differs (fixes stale state on login)
        if (currentPremiumStatus !== isPremium) {
          console.log('[App] Syncing premium state:', currentPremiumStatus);
          setIsPremium(currentPremiumStatus);
        }
      } catch (err) {
        console.error('[App] Fresh premium check failed, using cached state:', err);
        // Fall back to cached state if the fresh check fails
      }
    }

    // Check usage limit before generating (skip for premium users)
    if (user && !currentPremiumStatus) {
      try {
        const usage = await GenerationService.getMonthlyUsage(user.id);
        console.log('[App] Current usage:', usage);
        
        if (usage >= MONTHLY_LIMIT) {
          console.warn('[App] Monthly limit reached! Showing limit modal. Usage:', usage, 'Limit:', MONTHLY_LIMIT);
          setUsageCount(usage);
          setLimitModalOpen(true);
          return; // Block generation
        }
      } catch (err) {
        console.error('[App] Failed to check usage (failing closed):', err);
        // Fail closed - if we can't verify usage, show upgrade modal for security
        setUsageCount(MONTHLY_LIMIT);
        setLimitModalOpen(true);
        return;
      }
    }

    console.log('[App] Usage check passed, starting generation...');
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      console.log('[App] Calling generateContent...');
      // Pass searchEnabled (5th param) and selectedLength (6th param) to generateContent
      const response = await generateContent(modeToUse, input, additionalInstructions, undefined, useSearch, selectedLength);
      console.log('[App] Generation complete, setting content');
      setGeneratedContent(response);

      // Save to history in background (don't block UI)
      addItem({
        mode: modeToUse,
        input: input,
        output: response.text,
        metrics: response.metrics,
      }).catch(err => {
        console.error('[App] Failed to save to history:', err);
      });
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate content. Please check your API key in .env.local');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedMode('essay'); // Reset to default mode
    setGeneratedContent(null);
    setIsGenerating(false);
    setCopied(false);
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteItem(id);
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setSelectedMode(item.mode);
    setGeneratedContent({
      text: item.output,
      metrics: item.metrics,
      warnings: [],
    });
  };

  const handleCopy = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnterApp = () => {
    if (!isAuthenticated) {
      setInitAuthSignup(false);
      setView('auth');
      return;
    }

    setView('app');
    setShowDisclaimer(false); // Ensure disclaimer is closed before tour starts

    // Check for pending subscription intent
    const pendingSubscription = localStorage.getItem('pendingSubscription');
    if (pendingSubscription === 'premium') {
      console.log('[App] Found pending subscription intent, opening upgrade modal');
      setShowUpgradeModal(true);
      localStorage.removeItem('pendingSubscription');
    }

    // Default mode already set to essay

    // Check if tour has been seen
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      setTimeout(() => setShowTour(true), 1000);
    }
  };

  const handleSignUp = () => {
    setInitAuthSignup(true);
    setView('auth');
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenOnboardingTour', 'true');

    // Open Ethics Disclaimer immediately after tour
    setShowDisclaimer(true);
  };

  const handleEnterAuth = () => {
    setInitAuthSignup(false);
    setView('auth');
  };

  const handleBackToLanding = () => {
    setView('landing');
    // Reset app state when going back to landing
    setSelectedMode('essay');
    setGeneratedContent(null);
    setShowDisclaimer(false);
    setShowTour(false);
    setInitAuthSignup(false);
  };

  const handleSignOut = async () => {
    console.log('[App] Signing out user')
    
    // Prevent auto-redirect during sign-out
    setIsSigningOut(true)
    
    // Reset state IMMEDIATELY - don't wait for Supabase
    setView('landing')
    setSelectedMode('essay')
    setGeneratedContent(null)
    setShowDisclaimer(false)
    setDisclaimerAccepted(false)
    setShowTour(false)
    setInitAuthSignup(false)
    setCopied(false)
    setIsGenerating(false)
    
    // CRITICAL: Clear local session FIRST (instant, no API call)
    try {
      // Force clear localStorage session to prevent auto-login
      await signOut()
      console.log('[App] Local session cleared')
    } catch (localError) {
      console.error('[App] Local sign out failed:', localError)
      // Even if this fails, continue - state is already reset
    }
    
    // Allow auth state to update
    setTimeout(() => {
      setIsSigningOut(false)
    }, 100)
  };

  const mainClasses = `min-h-screen font-sans selection:bg-[#CC785C] selection:text-white transition-colors duration-300 ${
    theme === 'dark' ? 'bg-[#1a1a1a] text-[#e5e5e5]' : 'bg-[#F5F3EE] text-[#2D2D2D]'
  }`;

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <>
      {view === 'landing' && (
        <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
          <LandingPage
            onEnterApp={handleEnterApp}
            onLoginClick={handleEnterAuth}
            onSignUpClick={handleSignUp}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        </Suspense>
      )}

      {view === 'auth' && (
        <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
          <AuthPage
            onLogin={() => {
              // Once logged in, the useEffect hook will handle redirection to app
            }}
            onBack={handleBackToLanding}
            theme={theme}
            initialIsSignUp={initAuthSignup}
          />
        </Suspense>
      )}

      {view === 'app' && (
        <div className={`relative overflow-hidden flex flex-col ${mainClasses}`}>
          {/* Parallax Background Blobs */}
          <div className="fixed top-20 -left-20 w-96 h-96 bg-[#F2E8CF]/10 rounded-full blur-3xl animate-float -z-10 pointer-events-none"></div>
          <div className="fixed top-40 right-0 w-72 h-72 bg-[#CC785C]/5 rounded-full blur-3xl animate-float-delayed -z-10 pointer-events-none"></div>
          <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-3xl animate-float -z-10 pointer-events-none"></div>

          <EthicsDisclaimer
            isOpen={showDisclaimer}
            onClose={() => setShowDisclaimer(false)}
            onAccept={handleAcceptDisclaimer}
            canClose={disclaimerAccepted}
          />

          <LimitReachedModal 
            isOpen={limitModalOpen}
            onClose={() => setLimitModalOpen(false)}
            onUpgrade={() => {
              setLimitModalOpen(false);
              setShowUpgradeModal(true); // Open checkout modal directly
            }}
            theme={theme}
            usageCount={usageCount}
            limit={MONTHLY_LIMIT}
          />

          {/* Minimal Header */}
          <header className="absolute top-0 right-0 left-0 p-4 z-40 flex justify-between items-center pointer-events-none">
             {/* Left side empty or minimal logo if desired, but user asked for Claude style which is empty top left usually unless menu opened */}
             <div className="pointer-events-auto">
                {/* Optional: Add a subtle home/reset button here if needed */}
             </div>

             <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-full px-4 py-2">
                 <button
                   onClick={toggleTheme}
                   className={`p-2 rounded-full transition-colors ${
                     theme === 'dark' ? 'text-yellow-400 hover:bg-[#333]' : 'text-slate-600 hover:bg-[#F5F3EE]'
                   }`}
                   title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                 >
                   {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>

                 {isPremium === false && isAuthenticated && (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors bg-gradient-to-r from-[#F2E8CF] to-[#CC785C] text-white hover:opacity-90 shadow-sm"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Upgrade</span>
                      </button>
                 )}

                 {/* Sign Out Button */}
                 {isAuthenticated && (
                     <button
                       onClick={handleSignOut}
                       className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-black/5 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10"
                       title="Sign out"
                     >
                       <LogOut className="w-3.5 h-3.5" />
                       <span className="hidden sm:inline">Sign Out</span>
                     </button>
                 )}
             </div>
          </header>

          <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full relative">
            
            {/* Centered Welcome & Input Area (Visible when no content generated) */}
            {!generatedContent && (
                <div className="flex-1 flex flex-col items-center justify-center px-4 w-full min-h-[80vh] animate-in fade-in duration-700">
                    <div className="text-center mb-8 sm:mb-12">
                         <h1 className="text-4xl sm:text-5xl font-serif text-[#2D2D2D] dark:text-[#EAEAEA] mb-4">
                            Welcome, <span className="text-[#C1A87D] dark:text-[#F2E8CF] italic">{user?.email?.split('@')[0] || 'Scholar'}</span>
                         </h1>
                    </div>

                    <div className="w-full max-w-3xl">
                        <InputPanel
                          mode={selectedMode || 'essay'}
                          onGenerate={handleGenerate}
                          onInputChange={(input: string) => {
                            if (!input.trim()) {
                              setGeneratedContent(null);
                              setCopied(false);
                            }
                          }}
                          onModeChange={setSelectedMode}
                          onLengthChange={setSelectedLength}
                          isGenerating={isGenerating}
                          searchEnabled={searchEnabled}
                          onSearchToggle={setSearchEnabled}
                          theme={theme}
                        />
                    </div>
                </div>
            )}

            {/* Generated Content View (Visible when content exists) */}
            {generatedContent && (
               <div className="flex-1 w-full pt-24 px-4 sm:px-6 pb-20">
                   {/* We could keep the input at top or move to bottom. For now, let's keep the user flow of seeing the input logic above or implicitly handled. 
                       Actually, in a chat interface, the input usually moves to bottom. 
                       But to stick to the current "Generation" style where you see the output clearly:
                   */}
                   
                   <div className="max-w-4xl mx-auto space-y-8">
                        {/* Quick controls to go back/reset */}
                        <div className="flex justify-between items-center">
                            <button 
                                onClick={handleReset}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#CC785C] transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" /> Start New Generation
                            </button>
                        </div>

                        {/* Analysis Metrics */}
                        <RevealOnScroll>
                            <MetricsPanel metrics={generatedContent.metrics} />
                        </RevealOnScroll>

                        {/* The Content */}
                        <RevealOnScroll delay={100}>
                            <OutputPanel
                                ref={outputContainerRef}
                                text={generatedContent.text}
                                warnings={generatedContent.warnings}
                                onCopy={handleCopy}
                                copied={copied}
                            />
                        </RevealOnScroll>
                        
                        {/* Input could be repeated at bottom for follow-up if we fully move to chat, but for now this is good */}
                   </div>
               </div>
            )}

            {/* History Panel - Tucked away or visible? 
                In the new Minimal design, history might be in a sidebar. 
                For now, let's put it at the bottom of the landing state or hidden.
                Let's keep it visible but subtle at the bottom of the landing view for quick access.
            */}
             {!generatedContent && !historyLoading && history.length > 0 && (
                <div className="pb-8 px-4 w-full max-w-5xl mx-auto opacity-80 hover:opacity-100 transition-opacity">
                    <HistoryPanel
                        history={history.slice(0, 3)} // Only show recent 3
                        activeMode={selectedMode || 'essay'}
                        onDelete={handleDeleteHistory}
                        onRestore={handleRestoreHistory}
                    />
                </div>
            )}

          </main>
        </div>
      )}

      <Suspense fallback={null}>
        <OnboardingTour
          isOpen={showTour && view === 'app'}
          onComplete={handleTourComplete}
        />
      </Suspense>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <CheckoutModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          planName="Premium"
          planId="premium"
          planPrice={8}
          billingCycle="monthly"
          theme={theme}
          onSuccess={() => {
            setShowUpgradeModal(false);
            alert('Welcome to Premium! Enjoy unlimited generations.');
          }}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
