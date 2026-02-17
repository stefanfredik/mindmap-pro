
import React, { useState } from 'react';
import { ArrowRight, Brain, Share2, Zap, X, Mail, Lock, Loader2 } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

// Google Logo Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate network delay for realistic feel
    setTimeout(() => {
      setIsLoading(false);
      onGetStarted();
    }, 1500);
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGoogleLogin();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl">
          <Brain className="w-8 h-8" />
          <span>MindMap Pro</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => openModal('login')}
            className="text-gray-600 dark:text-gray-300 hover:text-primary font-medium px-4 py-2"
          >
            Login
          </button>
          <button 
            onClick={() => openModal('signup')}
            className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto mt-10 sm:mt-0 z-0">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          Organize your thoughts <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Visually & Collaboratively
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
          The ultimate tool for brainstorming, project planning, and note-taking. 
          Unleash your creativity with our intuitive mind mapping solution.
        </p>
        
        <button 
          onClick={() => openModal('signup')}
          className="group bg-primary hover:bg-blue-600 text-white text-lg px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          Start Mind Mapping Now
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="grid md:grid-cols-3 gap-8 mt-20 w-full text-left">
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 text-primary">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Fast & Intuitive</h3>
            <p className="text-gray-600 dark:text-gray-400">Drag, drop, and organize ideas in seconds with our lightning-fast interface.</p>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 text-secondary">
              <Share2 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Real-time Collab</h3>
            <p className="text-gray-600 dark:text-gray-400">Work together with your team in real-time. See changes as they happen.</p>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4 text-accent">
              <Brain size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">AI Powered</h3>
            <p className="text-gray-600 dark:text-gray-400">Generate ideas and expand your mind maps automatically with built-in AI tools.</p>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-gray-500 text-sm">
        © 2026 MindMap Pro. All rights reserved.
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 relative">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="flex justify-center mb-4 text-primary">
                  <Brain className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {authMode === 'login' 
                    ? 'Enter your details to access your mind maps' 
                    : 'Start visualizing your ideas today'}
                </p>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white px-4 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors mb-6 shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-medium">Or continue with email</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <form onSubmit={handleStandardSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white transition-all"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex justify-center items-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="ml-2 text-primary font-bold hover:underline"
                >
                  {authMode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
