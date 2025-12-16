
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { generateContent } from './services/academicIntegrityService';
import { GenerationService } from './services/generationService';
import { SubscriptionService } from './services/subscriptionService';
import { Info, RotateCcw, Moon, Sun, LogOut, Crown, XCircle } from 'lucide-react';
import { Mode, GenerationResponse, HistoryItem, EssayLength } from './types';
import { useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useGenerationHistory } from './hooks/useGenerationHistory';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ModeSelector from './components/ModeSelector';
import LengthSelector from './components/LengthSelector';
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

  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
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
  const [isPremium, setIsPremium] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Check subscription status
  useEffect(() => {
    async function checkPremiumStatus() {
      if (user) {
        try {
          const premium = await SubscriptionService.isPremium(user.id);
          setIsPremium(premium);
        } catch (error) {
          console.error('[App] Failed to check premium status:', error);
        }
      } else {
        setIsPremium(false);
      }
    }
    checkPremiumStatus();
  }, [user]);
  
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
    
    if (!selectedMode || !disclaimerAccepted) {
        console.warn('[App] Generation blocked: Missing mode or disclaimer not accepted');
        return;
    }

    // Check usage limit before generating (skip for premium users)
    if (user && !isPremium) {
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
      const response = await generateContent(selectedMode, input, additionalInstructions, undefined, useSearch, selectedLength);
      console.log('[App] Generation complete, setting content');
      setGeneratedContent(response);

      // Save to history in background (don't block UI)
      addItem({
        mode: selectedMode,
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
    setSelectedMode(null);
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

    // Pre-populate UI for the tour so all steps are visible
    if (!selectedMode) {
      setSelectedMode('cs');
    }

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
    setSelectedMode(null);
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
    setSelectedMode(null)
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

  const handleCancelSubscription = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription?\n\n' +
      'You will keep access until the end of your current billing period.'
    );
    
    if (!confirmed) return;
    
    setIsCanceling(true);
    try {
      await SubscriptionService.cancelSubscription(user.id);
      setIsPremium(false);
      alert('Your subscription has been canceled. You will retain access until the end of your current billing period.');
    } catch (error) {
      console.error('[App] Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setIsCanceling(false);
    }
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
        <div className={`relative overflow-hidden ${mainClasses}`}>
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

          {/* Header */}
          <header className={`border-b shadow-sm/50 sticky top-0 z-40 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#252525] border-[#333]' : 'bg-white border-[#E5E3DD]'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#F2E8CF] rounded-lg flex items-center justify-center text-[#2D2D2D] font-bold text-lg md:text-xl shadow-sm">
                  A
                </div>
                <div>
                  <h1 className={`text-lg md:text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'}`}>
                    Academic Integrity <span className={theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}>Agent</span>
                  </h1>
                  <p className={`text-xs hidden sm:block ${theme === 'dark' ? 'text-claude-subtext' : 'text-gray-500'}`}>
                    {isAuthenticated ? `${user?.email}` : 'Anti-Detection Writing Assistant'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'text-yellow-400 hover:bg-[#333]' : 'text-slate-600 hover:bg-[#F5F3EE]'
                  }`}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className={`h-6 w-px mx-1 sm:mx-2 ${theme === 'dark' ? 'bg-[#444]' : 'bg-gray-200'}`}></div>

                <button
                  onClick={handleReset}
                  className={`flex items-center gap-2 px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-[#F2E8CF]/10 ${
                    theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F] hover:bg-[#85683F]/10'
                  }`}
                  title="Reset Application"
                  aria-label="Reset Application"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Start Over</span>
                </button>

                <div className={`h-6 w-px mx-1 sm:mx-2 ${theme === 'dark' ? 'bg-[#444]' : 'bg-gray-200'}`}></div>

                <button
                  onClick={() => setShowTour(true)}
                  className={`flex items-center gap-2 px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-[#F2E8CF]/10 ${
                    theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F] hover:bg-[#85683F]/10'
                  }`}
                  title="Start Tour"
                  aria-label="Start Tour"
                >
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">Guide</span>
                </button>

                <button
                  onClick={() => setShowDisclaimer(true)}
                  className={`flex items-center gap-2 px-2 sm:px-3 py-2 text-sm rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-[#333] hover:text-white'
                      : 'text-[#2D2D2D] hover:bg-[#F5F3EE]'
                  }`}
                  aria-label="Ethics Policy"
                  id="ethics-policy"
                >
                  <Info className="w-4 h-4" />
                  <span className="hidden md:inline">Ethics Policy</span>
                </button>

                {isAuthenticated && (
                  <>
                    <div className={`h-6 w-px mx-1 sm:mx-2 ${theme === 'dark' ? 'bg-[#444]' : 'bg-gray-200'}`}></div>
                    
                    {!isPremium && (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors bg-gradient-to-r from-[#F2E8CF] to-[#CC785C] text-white hover:opacity-90 shadow-sm"
                        title="Upgrade to Premium"
                        aria-label="Upgrade to Premium"
                      >
                        <Crown className="w-4 h-4" />
                        <span className="hidden sm:inline">Upgrade</span>
                      </button>
                    )}
                    
                    {isPremium && (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={isCanceling}
                        className={`flex items-center gap-2 px-2 sm:px-3 py-2 text-sm rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'text-orange-400 hover:bg-orange-400/10'
                            : 'text-orange-600 hover:bg-orange-50'
                        } ${isCanceling ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Cancel Subscription"
                        aria-label="Cancel Subscription"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">{isCanceling ? 'Canceling...' : 'Cancel Plan'}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className={`flex items-center gap-2 px-2 sm:px-3 py-2 text-sm rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'text-red-400 hover:bg-red-400/10'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Sign Out"
                      aria-label="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto py-12 space-y-12 px-4 sm:px-6">
            {/* Recent History */}
            <div id="history-panel">
              {historyLoading ? (
                <LoadingSpinner message="Loading history..." />
              ) : history.length > 0 ? (
                <div key={selectedMode || 'history'} className="animate-pop-up">
                  <HistoryPanel
                    history={history}
                    activeMode={selectedMode || 'essay'}
                    onDelete={handleDeleteHistory}
                    onRestore={handleRestoreHistory}
                  />
                </div>
              ) : null}
            </div>

            {/* Mode Selection */}
            <RevealOnScroll delay={100}>
              <ModeSelector
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
              />
            </RevealOnScroll>

            {/* Length Selection - Not shown for Paraphrase mode (output length matches input) */}
            {selectedMode && selectedMode !== 'paraphrase' && (
              <RevealOnScroll delay={150}>
                <div id="length-selector">
                  <LengthSelector
                    selectedLength={selectedLength}
                    onSelectLength={setSelectedLength}
                  />
                </div>
              </RevealOnScroll>
            )}

            {/* Input Panel */}
            {selectedMode && (
              <RevealOnScroll delay={200}>
                <InputPanel
                  mode={selectedMode}
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
              </RevealOnScroll>
            )}

            {/* Metrics Panel */}
            {generatedContent && (
              <RevealOnScroll>
                <MetricsPanel metrics={generatedContent.metrics} />
              </RevealOnScroll>
            )}

            {/* Output Panel */}
            {generatedContent && (
              <RevealOnScroll delay={100}>
                <OutputPanel
                  ref={outputContainerRef}
                  text={generatedContent.text}
                  warnings={generatedContent.warnings}
                  onCopy={handleCopy}
                  copied={copied}
                />
              </RevealOnScroll>
            )}
          </main>

          {/* Footer */}

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
