import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Briefcase, 
  CheckSquare, 
  Mail, 
  BarChart3, 
  Sparkles,
  Calendar,
  Settings,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';

const Tutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);

  // Check if user has completed tutorial before
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorial_completed');
    if (tutorialCompleted === 'true') {
      setShowTutorial(false);
    }
  }, []);

  const tutorialSteps = [
    {
      id: 'welcome',
      title: '👋 Welcome to JobTracker!',
      subtitle: 'Your AI-powered job application companion',
      icon: Target,
      color: 'blue',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            JobTracker helps you organize your job search with powerful features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-medium text-blue-900">Track Applications</div>
                <div className="text-sm text-blue-700">Monitor all your job applications in one place</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-medium text-green-900">Auto-Import from Gmail</div>
                <div className="text-sm text-green-700">Automatically sync job emails</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-medium text-purple-900">AI Assistant</div>
                <div className="text-sm text-purple-700">Get career advice powered by Gemini AI</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-medium text-yellow-900">Gamification</div>
                <div className="text-sm text-yellow-700">Earn points and unlock achievements</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              This quick tour will show you how to get started in just 5 steps!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'applications',
      title: '📋 Track Your Applications',
      subtitle: 'Manage all your job applications',
      icon: Briefcase,
      color: 'indigo',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The <strong>Applications</strong> page is your central hub for tracking job applications.
          </p>
          
          <div className="bg-white border-2 border-indigo-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
              <Check className="w-5 h-5" />
              What you can do:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Add applications manually</strong> with company, position, and status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Track status changes</strong> from Applied → Interview → Offer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Add notes</strong> for each application</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Filter by status</strong> to focus on specific stages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>View statistics</strong> at a glance</span>
              </li>
            </ul>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-900 font-medium mb-2">💡 Pro Tip:</p>
            <p className="text-sm text-indigo-800">
              Click the <strong>"Add Application"</strong> button in the top right to manually add your first job application!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'email-sync',
      title: '📧 Email Sync Magic',
      subtitle: 'Automatically import from Gmail',
      icon: Mail,
      color: 'green',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Save time by automatically importing job applications from your Gmail inbox!
          </p>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-green-900 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              How it works:
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-medium text-gray-900">Set up Gmail API</div>
                  <div className="text-sm text-gray-600">Download credentials from Google Cloud Console (one-time setup)</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-medium text-gray-900">Click "Sync Emails"</div>
                  <div className="text-sm text-gray-600">Your browser will open for Gmail authorization</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="font-medium text-gray-900">Watch the magic happen</div>
                  <div className="text-sm text-gray-600">Applications are automatically imported and status updates tracked</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-600 font-medium mb-1">Detects</div>
              <div className="text-sm text-green-900">
                ✓ Application confirmations<br/>
                ✓ Assessment invites<br/>
                ✓ Interview requests<br/>
                ✓ Rejection notices
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs text-blue-600 font-medium mb-1">Smart Features</div>
              <div className="text-sm text-blue-900">
                ✓ No duplicates<br/>
                ✓ Status updates<br/>
                ✓ AI parsing (optional)<br/>
                ✓ History tracking
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>📖 Setup Guide:</strong> Check the EMAIL_SYNC_SETUP.md file for detailed instructions!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'tasks',
      title: '✅ Gamified Tasks',
      subtitle: 'Stay motivated with points & achievements',
      icon: CheckSquare,
      color: 'purple',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Turn your job search into a game! Complete tasks, earn points, and unlock achievements.
          </p>
          
          <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">Task Categories & Points:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-purple-50 rounded">
                <span className="text-gray-700">Apply to Job</span>
                <span className="font-bold text-purple-600">20 pts</span>
              </div>
              <div className="flex justify-between p-2 bg-purple-50 rounded">
                <span className="text-gray-700">Skill Building</span>
                <span className="font-bold text-purple-600">25 pts</span>
              </div>
              <div className="flex justify-between p-2 bg-purple-50 rounded">
                <span className="text-gray-700">Cover Letter</span>
                <span className="font-bold text-purple-600">15 pts</span>
              </div>
              <div className="flex justify-between p-2 bg-purple-50 rounded">
                <span className="text-gray-700">Interview Prep</span>
                <span className="font-bold text-purple-600">15 pts</span>
              </div>
              <div className="flex justify-between p-2 bg-purple-50 rounded">
                <span className="text-gray-700">Resume Update</span>
                <span className="font-bold text-purple-600">10 pts</span>
              </div>
              <div className="flex justify-between p-2 bg-purple-50 rounded">
                <span className="text-gray-700">Follow Up</span>
                <span className="font-bold text-purple-600">10 pts</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">🏆 Achievements:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="font-medium">🎯 Getting Started</div>
                <div className="text-gray-600">Complete first task</div>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="font-medium">🔥 On a Roll</div>
                <div className="text-gray-600">3-day streak</div>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="font-medium">💯 Century Club</div>
                <div className="text-gray-600">Earn 100 points</div>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="font-medium">⚡ Power User</div>
                <div className="text-gray-600">5 tasks in one day</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-assistant',
      title: '🤖 AI Career Assistant',
      subtitle: 'Powered by Google Gemini',
      icon: Sparkles,
      color: 'pink',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Get personalized career guidance with AI-powered tools!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
              <div className="font-semibold text-blue-900 mb-1">📄 Resume Matching</div>
              <div className="text-sm text-blue-800">Analyze how well your resume matches job descriptions</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
              <div className="font-semibold text-green-900 mb-1">✉️ Cover Letter Generator</div>
              <div className="text-sm text-green-800">Create personalized cover letters instantly</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3">
              <div className="font-semibold text-purple-900 mb-1">💼 Interview Prep</div>
              <div className="text-sm text-purple-800">Get common questions and expert tips</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3">
              <div className="font-semibold text-orange-900 mb-1">🔍 Company Research</div>
              <div className="text-sm text-orange-800">Learn insights about target companies</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3 md:col-span-2">
              <div className="font-semibold text-yellow-900 mb-1">💡 Career Advice</div>
              <div className="text-sm text-yellow-800">Get personalized career guidance and job search strategies</div>
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <p className="text-sm text-pink-900 font-medium mb-2">🚀 Setup Required:</p>
            <p className="text-sm text-pink-800">
              Add your <strong>GEMINI_API_KEY</strong> to the <code className="bg-white px-1 py-0.5 rounded">.env</code> file to enable AI features. 
              Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      title: '📊 Analytics & Insights',
      subtitle: 'Track your progress',
      icon: BarChart3,
      color: 'cyan',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Visualize your job search progress with powerful analytics!
          </p>
          
          <div className="bg-white border-2 border-cyan-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">📈</div>
                <div className="font-medium text-gray-900 mt-1">Application Trends</div>
                <div className="text-xs text-gray-600">Track applications over time</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">🎯</div>
                <div className="font-medium text-gray-900 mt-1">Status Breakdown</div>
                <div className="text-xs text-gray-600">See where you stand</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">⏱️</div>
                <div className="font-medium text-gray-900 mt-1">Response Times</div>
                <div className="text-xs text-gray-600">Average time to hear back</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">🏆</div>
                <div className="font-medium text-gray-900 mt-1">Success Rate</div>
                <div className="text-xs text-gray-600">Interview conversion rate</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Calendar View:</strong> See your applications and interviews on a timeline. 
              Perfect for planning your job search strategy!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: '🎉 You\'re All Set!',
      subtitle: 'Ready to supercharge your job search',
      icon: Check,
      color: 'emerald',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">You're Ready to Go!</h3>
            <p className="text-emerald-800">
              You now know the basics. Let's get your job search started!
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">📋 Quick Start Checklist:</h4>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span>Add your first job application</span>
              </label>
              <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span>Set up Gmail sync (optional)</span>
              </label>
              <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span>Create your first task</span>
              </label>
              <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span>Try the AI Assistant</span>
              </label>
              <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span>Explore Analytics</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">💡 Need Help?</p>
            <p className="text-sm text-blue-800">
              Click the <strong>Settings</strong> icon and select "Show Tutorial" to revisit this guide anytime!
            </p>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Good luck with your job search! 💪</p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('tutorial_completed', 'true');
    setShowTutorial(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('tutorial_completed', 'true');
    setShowTutorial(false);
    if (onComplete) onComplete();
  };

  if (!showTutorial) {
    return null;
  }

  const colorClasses = {
    blue: {
      bg: 'bg-blue-600',
      light: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      gradient: 'from-blue-600 to-blue-700'
    },
    indigo: {
      bg: 'bg-indigo-600',
      light: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
      gradient: 'from-indigo-600 to-indigo-700'
    },
    green: {
      bg: 'bg-green-600',
      light: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      gradient: 'from-green-600 to-green-700'
    },
    purple: {
      bg: 'bg-purple-600',
      light: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      gradient: 'from-purple-600 to-purple-700'
    },
    pink: {
      bg: 'bg-pink-600',
      light: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-600',
      gradient: 'from-pink-600 to-pink-700'
    },
    cyan: {
      bg: 'bg-cyan-600',
      light: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-600',
      gradient: 'from-cyan-600 to-cyan-700'
    },
    emerald: {
      bg: 'bg-emerald-600',
      light: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
      gradient: 'from-emerald-600 to-emerald-700'
    }
  };

  const colors = colorClasses[currentStepData.color];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors.gradient} text-white p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                <p className="text-white text-opacity-90 text-sm">{currentStepData.subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-1">
            {tutorialSteps.map((step, index) => (
              <div
                key={step.id}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index <= currentStep
                    ? 'bg-white'
                    : 'bg-white bg-opacity-30'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-white text-opacity-75 mt-2">
            Step {currentStep + 1} of {tutorialSteps.length}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isFirstStep
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {isLastStep ? (
              <button
                onClick={handleComplete}
                className={`flex items-center gap-2 px-6 py-2 ${colors.bg} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
              >
                Get Started
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-2 ${colors.bg} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to show tutorial button in settings
export const TutorialButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
    >
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <div className="font-medium text-gray-900">Show Tutorial</div>
        <div className="text-sm text-gray-600">Revisit the getting started guide</div>
      </div>
    </button>
  );
};

export default Tutorial;