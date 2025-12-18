import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { generateContent } from './services/academicIntegrityService';
import { GenerationService } from './services/generationService';
import { SubscriptionService } from './services/subscriptionService';
import { supabase } from './lib/supabase';
import { 
  RotateCcw,
  PanelLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { Mode, GenerationResponse, HistoryItem, EssayLength } from './types';
import { useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useGenerationHistory } from './hooks/useGenerationHistory';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import MetricsPanel from './components/MetricsPanel';
import EthicsDisclaimer from './components/EthicsDisclaimer';
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
  const { history, addItem, deleteItem } = useGenerationHistory();

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
  
  // Track sign-out to prevent race conditions
  const isSigningOutRef = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  // Keyboard shortcut for sidebar: Cmd + .
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check subscription status
  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    async function checkPremiumStatus(retries = 0) {
      if (isSigningOutRef.current || !mounted) return;
      if (!user) return;

      try {
        const premium = await SubscriptionService.isPremium(user.id);
        if (!mounted || isSigningOutRef.current) return;
        setIsPremium(premium);

        // If false, retry up to 5 times (propagation lag)
        if (!premium && retries < 5) {
          setTimeout(() => {
            if (mounted) checkPremiumStatus(retries + 1);
          }, 2000);
        }
      } catch (error) {
          console.error('[App] Failed to check premium status:', error);
          // Fail Safe: If we encounter an error (network/timeout), DO NOT downgrade the user
          // Only update state if we get a successful 'false' from the service.
          // If we were already premium, keep it that way until we can verify otherwise.
          setIsPremium(prev => {
            if (prev) {
              console.warn('[App] Keeping existing Premium status despite check failure');
              return true;
            }
            return false;
          });
        }
    }

    if (user) {
      isSigningOutRef.current = false;
      setIsPremium(null);
      const timeoutId = setTimeout(() => {
        if (mounted) checkPremiumStatus();
      }, 1000);

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
          () => checkPremiumStatus()
        )
        .subscribe();

      return () => {
        clearTimeout(timeoutId);
        mounted = false;
        if (channel) supabase.removeChannel(channel);
      };
    } else {
      setIsPremium(false);
    }

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, view]);
  
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const MONTHLY_LIMIT = 20;

  const outputContainerRef = useRef<HTMLDivElement>(null);

  const getGreeting = () => {
    const hours = new Date().getHours();
    
    // Morning: 5 AM - 11:59 AM (French)
    if (hours >= 5 && hours < 12) {
      return "Bonjour";
    }
    // Afternoon: 12 PM - 5:59 PM (German)
    if (hours >= 12 && hours < 18) {
      return "Guten Tag";
    }
    // Evening: 6 PM - 10:59 PM (Korean)
    if (hours >= 18 && hours < 23) {
      return "Annyeonghaseyo";
    }
    // Midnight: 11 PM - 4:59 AM (Filipino)
    return "Kumusta";
  };

  useEffect(() => {
    if (generatedContent && outputContainerRef.current) {
      setTimeout(() => {
        outputContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [generatedContent]);

  useEffect(() => {
    const accepted = localStorage.getItem('hasAcceptedDisclaimer');
    if (!accepted) {
      setShowDisclaimer(true);
    } else {
      setDisclaimerAccepted(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && view !== 'app' && !isSigningOut && !isSigningOutRef.current) {
      handleEnterApp()
    }
  }, [isAuthenticated, user, view, isSigningOut])

  useEffect(() => {
    if (!user) {
      if (isSigningOut) setIsSigningOut(false);
      isSigningOutRef.current = false;
    }
  }, [user, isSigningOut]);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('hasAcceptedDisclaimer', 'true');
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };

  const handleGenerate = async (input: string, additionalInstructions: string = '', useSearch: boolean = false) => {
    const modeToUse = selectedMode || 'essay';
    if (!disclaimerAccepted) {
        setShowDisclaimer(true);
        return;
    }

    let currentPremiumStatus = isPremium;
    if (user) {
      try {
        currentPremiumStatus = await SubscriptionService.isPremium(user.id);
        if (currentPremiumStatus !== isPremium) setIsPremium(currentPremiumStatus);
      } catch (err) {
        currentPremiumStatus = isPremium;
      }
    }

    if (user && currentPremiumStatus === false) {
      try {
        const usage = await GenerationService.getMonthlyUsage(user.id);
        if (usage >= MONTHLY_LIMIT) {
          setUsageCount(usage);
          setLimitModalOpen(true);
          return;
        }
      } catch (err) {
        setUsageCount(MONTHLY_LIMIT);
        setLimitModalOpen(true);
        return;
      }
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await generateContent(modeToUse, input, additionalInstructions, undefined, useSearch, selectedLength);
      setGeneratedContent(response);
      addItem({
        mode: modeToUse,
        input: input,
        output: response.text,
        metrics: response.metrics,
      }).catch(err => console.error('[App] Failed to save to history:', err));
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate content. Please check your API key in .env.local');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedMode('essay');
    setGeneratedContent(null);
    setIsGenerating(false);
    setCopied(false);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };


  const handleRestoreHistory = (item: HistoryItem) => {
    setSelectedMode(item.mode);
    setGeneratedContent({
      text: item.output,
      metrics: item.metrics,
      warnings: [],
    });
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
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
    setShowDisclaimer(false);
    const pendingSubscription = localStorage.getItem('pendingSubscription');
    if (pendingSubscription === 'premium') {
      setShowUpgradeModal(true);
      localStorage.removeItem('pendingSubscription');
    }
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
    setShowDisclaimer(true);
  };

  const handleEnterAuth = () => {
    setInitAuthSignup(false);
    setView('auth');
  };

  const handleBackToLanding = () => {
    setView('landing');
    setSelectedMode('essay');
    setGeneratedContent(null);
    setShowDisclaimer(false);
    setShowTour(false);
    setInitAuthSignup(false);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true)
    isSigningOutRef.current = true
    setView('landing')
    setSelectedMode('essay')
    setGeneratedContent(null)
    setShowDisclaimer(false)
    setDisclaimerAccepted(false)
    setShowTour(false)
    setInitAuthSignup(false)
    setCopied(false)
    setIsGenerating(false)
    try {
      await signOut()
    } catch (localError) {
      console.error('[App] Local sign out failed:', localError)
    }
  };

  const mainClasses = `min-h-screen font-sans selection:bg-[#CC785C] selection:text-white transition-colors duration-300 ${
    theme === 'dark' ? 'bg-[#1a1a1a] text-[#e5e5e5]' : 'bg-[#F5F3EE] text-[#2D2D2D]'
  }`;

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
            onLogin={() => {}}
            onBack={handleBackToLanding}
            theme={theme}
            initialIsSignUp={initAuthSignup}
          />
        </Suspense>
      )}

      {view === 'app' && (
        <div className={`relative flex min-h-screen overflow-hidden ${mainClasses}`}>
          <Sidebar 
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            history={history}
            onHistoryItemClick={handleRestoreHistory}
            onNewChat={handleReset}
            isAuthenticated={isAuthenticated}
            user={user}
            isPremium={isPremium}
            theme={theme}
            toggleTheme={toggleTheme}
            onSignOut={handleSignOut}
            onUpgrade={() => setShowUpgradeModal(true)}
            onDeleteHistoryItem={(id, e) => {
              e.stopPropagation();
              deleteItem(id);
            }}
          />

          <div className={`
             flex-1 flex flex-col relative transition-all duration-300
             ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}
          `}>
              <header className="sticky top-0 p-4 z-40 flex justify-between items-center bg-[#F5F3EE]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm pointer-events-auto border-b border-transparent transition-all duration-300">
                  <div className="flex items-center gap-2 sm:gap-3">
                      {!isSidebarOpen && (
                          <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-white/10"
                            title="Open Sidebar (Cmd+.)"
                          >
                            <PanelLeft className="w-5 h-5 text-gray-500" />
                          </button>
                      )}
                  </div>



                  <div className="flex items-center gap-2">
                      <button
                        onClick={toggleTheme}
                        className="p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-white/10"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                      >
                        {theme === 'dark' ? (
                          <Sun className="w-5 h-5 text-[#C1A87D]" />
                        ) : (
                          <Moon className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                  </div>
              </header>

              <div className="absolute top-20 -left-20 w-96 h-96 bg-[#F2E8CF]/10 rounded-full blur-3xl animate-float -z-10 pointer-events-none"></div>
              <div className="absolute top-40 right-0 w-72 h-72 bg-[#CC785C]/5 rounded-full blur-3xl animate-float-delayed -z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-3xl animate-float -z-10 pointer-events-none"></div>

              <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full relative">
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
                        setShowUpgradeModal(true);
                    }}
                    theme={theme}
                    usageCount={usageCount}
                    limit={MONTHLY_LIMIT}
                />

                {!generatedContent && (
                    <div className="flex-1 flex flex-col items-center justify-center px-4 w-full min-h-[75vh] sm:min-h-[85vh] animate-in fade-in duration-700">
                        <div className="text-center mb-6 sm:mb-12">
                             <h1 className="text-3xl sm:text-5xl font-serif text-[#2D2D2D] dark:text-[#EAEAEA] mb-3">
                                {getGreeting()}, <span className="text-[#C1A87D] dark:text-[#F2E8CF] italic">{user?.email?.split('@')[0] || 'Academic Agent'}</span>
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
                              selectedLength={selectedLength}
                              isGenerating={isGenerating}
                              searchEnabled={searchEnabled}
                              onSearchToggle={setSearchEnabled}
                              theme={theme}
                            />
                        </div>
                    </div>
                )}

                {generatedContent && (
                   <div className="flex-1 w-full pt-4 sm:pt-8 px-4 sm:px-6 pb-20">
                       <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                             <div className="flex justify-between items-center sm:hidden">
                                 <button 
                                     onClick={handleReset}
                                     className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#CC785C] transition-colors"
                                 >
                                     <RotateCcw className="w-3 h-3" /> New Chat
                                 </button>
                             </div>
                             <RevealOnScroll>
                                 <MetricsPanel metrics={generatedContent.metrics} />
                             </RevealOnScroll>
                             <RevealOnScroll delay={100}>
                                 <OutputPanel
                                     ref={outputContainerRef}
                                     text={generatedContent.text}
                                     warnings={generatedContent.warnings}
                                     onCopy={handleCopy}
                                     copied={copied}
                                 />
                             </RevealOnScroll>
                             
                             <div className="hidden sm:flex justify-center pt-8">
                                <button 
                                    onClick={handleReset}
                                    className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-500 hover:text-[#C1A87D] hover:border-[#C1A87D] transition-all flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" /> Start New Generation
                                </button>
                             </div>
                       </div>
                   </div>
                )}
              </main>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <OnboardingTour
          isOpen={showTour && view === 'app'}
          onComplete={handleTourComplete}
        />
      </Suspense>

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
