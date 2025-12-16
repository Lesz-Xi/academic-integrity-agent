import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface Step {
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  yOffset?: number;
}

const TOUR_STEPS: Step[] = [
  {
    targetId: 'mode-selector',
    title: 'Choose Your Strategy',
    description: 'Select a specialized writing mode: Essay/Research for complex arguments, Computer Science for technical docs, or Paraphrase to humanize existing text.',
    position: 'top',
    yOffset: 120
  },
  {
    targetId: 'length-selector',
    title: 'Set Your Target Length',
    description: 'Choose Short, Medium, or Long output. This auto-adjusts when you use quick actions like Expand.',
    position: 'top',
    yOffset: 80
  },
  {
    targetId: 'input-panel',
    title: 'Upload or Type Content',
    description: 'Upload a file or paste text. After uploading, quick-action buttons appear: Humanize, Expand, Shorten, or Custom.',
    position: 'top',
    yOffset: 230
  },
  {
    targetId: 'history-panel',
    title: 'Track Generations',
    description: 'Access your recent work here. Your history is saved locally so you never lose a good output.',
    position: 'bottom'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

export default function OnboardingTour({ onComplete, isOpen }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSteps, setActiveSteps] = useState<Step[]>([]);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const { theme } = useTheme();

  // Disable scroll when tour is open - REMOVED to allow scrollIntoView to work
  // Instead we rely on the interaction blocker overlay
  
  // Initialize and filter steps when tour opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow RevealOnScroll animations to settle/render
      const timer = setTimeout(() => {
        const validSteps = TOUR_STEPS.filter(step => {
          const el = document.getElementById(step.targetId);
          // Only include if element exists AND has dimensions (visible)
          return el && el.getBoundingClientRect().height > 0;
        });
        setActiveSteps(validSteps);
        setCurrentStep(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeSteps.length === 0) return;

    const updatePosition = () => {
      // Safety check for index
      if (currentStep >= activeSteps.length) {
         onComplete();
         return;
      }

      const step = activeSteps[currentStep];
      const element = document.getElementById(step.targetId);
      
      if (element) {
        // Use 'auto' for instant scroll to avoid async timing issues
        element.scrollIntoView({ behavior: 'auto', block: 'center' });
        setTargetRect(element.getBoundingClientRect());
      } else {
        // Should not happen with pre-filtering, but safe fallback
        onComplete();
      }
    };

    const timer = setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true }); // Update on scroll to keep spotlight attached

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, isOpen, activeSteps, onComplete]);

  if (!isOpen || !targetRect || activeSteps.length === 0) return null;

  const step = activeSteps[currentStep];
  const isLastStep = currentStep === activeSteps.length - 1;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    const gap = 20; // Space between target and tooltip
    const tooltipWidth = 320; 
    
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'top':
        // Use custom offset if provided, else default
        const offset = step.yOffset || 180;
        top = targetRect.top - gap - offset; 
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      default:
        top = targetRect.bottom + gap;
        left = targetRect.left;
    }

    // Ensure within viewport bounds (simple check)
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
    
    // Check vertical bounds (flip if needed could go here, keeping simple for now)
    if (top < 10) top = 10;
    
    return { top, left, width: tooltipWidth };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Interaction Blocker - Blocks clicks on the app */}
      <div className="fixed inset-0 pointer-events-auto z-[99]" />

      {/* Spotlight Circle with shadow overlay */}
      <div 
        className="absolute transition-all duration-500 ease-out border-2 border-[#D2B48C] rounded-xl shadow-[0_0_0_99999px_rgba(0,0,0,0.7)] pointer-events-none z-[100]"
        style={{
          top: targetRect.top - 10,
          left: targetRect.left - 10,
          width: targetRect.width + 20,
          height: targetRect.height + 20,
        }}
      />

      {/* Tooltip Card */}
      <div 
        className="absolute pointer-events-auto z-[101] transition-all duration-500 ease-out"
        style={getTooltipStyle()}
      >
        <div className={`${
          theme === 'dark' ? 'bg-[#252525] border-[#444] text-white' : 'bg-white border-[#E5E3DD] text-[#2D2D2D]'
        } border rounded-xl shadow-2xl p-6 relative`}>
            {/* Arrow */}
            {/* Simplified arrow for now */}

            <button 
                onClick={onComplete}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
                <span className="text-xs font-bold text-[#D2B48C] tracking-wider uppercase">
                    Step {currentStep + 1} of {activeSteps.length}
                </span>
                <h3 className="text-lg font-bold mt-1">{step.title}</h3>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed mb-6">
                {step.description}
            </p>

            <div className="flex items-center justify-between">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className={`flex items-center text-sm font-medium ${
                        currentStep === 0 ? 'opacity-0 cursor-default' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>

                <button
                    onClick={() => {
                        if (isLastStep) {
                            onComplete();
                        } else {
                            setCurrentStep(currentStep + 1);
                        }
                    }}
                    className="flex items-center bg-[#D2B48C] hover:bg-[#C1A87D] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                    {isLastStep ? 'Get Started' : 'Next'}
                    {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
