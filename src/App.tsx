import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { generateContent } from './services/academicIntegrityService';
import { Info, RotateCcw, Moon, Sun, LogOut } from 'lucide-react';
import { Mode, GenerationResponse, HistoryItem } from './types';
import { useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useGenerationHistory } from './hooks/useGenerationHistory';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ModeSelector from './components/ModeSelector';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import MetricsPanel from './components/MetricsPanel';
import EthicsDisclaimer from './components/EthicsDisclaimer';
import HistoryPanel from './components/HistoryPanel';
import RevealOnScroll from './components/RevealOnScroll';

// Lazy load route-level components for code splitting
const OnboardingTour = lazy(() => import('./components/OnboardingTour'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const AuthPage = lazy(() => import('./components/AuthPage'));

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, signOut, loading: authLoading } = useAuth();
  const { history, addItem, deleteItem, loading: historyLoading } = useGenerationHistory();

  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
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
    if (!selectedMode || !disclaimerAccepted) return;

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      // Pass searchEnabled to generateContent (5th parameter)
      const response = await generateContent(selectedMode, input, additionalInstructions, undefined, useSearch);
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

  const handleCopy = () => {
    if (generatedContent?.text) {
      navigator.clipboard.writeText(generatedContent.text);
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
    
    // Then try to sign out from Supabase (with timeout)
    try {
      const signOutPromise = signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout')), 5000)
      )
      
      await Promise.race([signOutPromise, timeoutPromise])
      console.log('[App] Sign out successful')
    } catch (error) {
      console.error('[App] Sign out error (ignored):', error)
      // Ignore errors - state is already reset
    } finally {
      setIsSigningOut(false)
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
          <div className="fixed top-20 -left-20 w-96 h-96 bg-[#D2B48C]/10 rounded-full blur-3xl animate-float -z-10 pointer-events-none"></div>
          <div className="fixed top-40 right-0 w-72 h-72 bg-[#CC785C]/5 rounded-full blur-3xl animate-float-delayed -z-10 pointer-events-none"></div>
          <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-3xl animate-float -z-10 pointer-events-none"></div>

          <EthicsDisclaimer
            isOpen={showDisclaimer}
            onClose={() => setShowDisclaimer(false)}
            onAccept={handleAcceptDisclaimer}
            canClose={disclaimerAccepted}
          />

          {/* Header */}
          <header className={`border-b shadow-sm/50 sticky top-0 z-40 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#252525] border-[#333]' : 'bg-white border-[#E5E3DD]'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#D2B48C] rounded-lg flex items-center justify-center text-[#2D2D2D] font-bold text-lg md:text-xl shadow-sm">
                  A
                </div>
                <div>
                  <h1 className={`text-lg md:text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'}`}>
                    Academic Integrity <span className="text-[#D2B48C]">Agent</span>
                  </h1>
                  <p className={`text-xs hidden sm:block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
                  className={`flex items-center gap-2 px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'text-yellow-400 hover:bg-yellow-400/10'
                      : 'text-yellow-600 hover:bg-yellow-50'
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
                  className={`flex items-center gap-2 px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'text-yellow-400 hover:bg-yellow-400/10'
                      : 'text-yellow-600 hover:bg-yellow-50'
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

          <main className="max-w-7xl mx-auto py-8 space-y-8 px-4 sm:px-6">
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

            {/* Input Panel */}
            {selectedMode && (
              <RevealOnScroll delay={200}>
                <InputPanel
                  mode={selectedMode}
                  onGenerate={handleGenerate}
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
          <footer className={`mt-16 py-8 border-t transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#252525] border-[#333]' : 'bg-white border-[#E5E3DD]'
          }`}>
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                For educational and research purposes only. Always follow your institution's academic integrity policies.
              </p>
            </div>
          </footer>
        </div>
      )}

      <Suspense fallback={null}>
        <OnboardingTour
          isOpen={showTour && view === 'app'}
          onComplete={handleTourComplete}
        />
      </Suspense>
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
