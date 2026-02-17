import React from 'react';
import { ArrowRight, Brain, Share2, Zap } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl">
          <Brain className="w-8 h-8" />
          <span>MindMap Pro</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onGetStarted}
            className="text-gray-600 dark:text-gray-300 hover:text-primary font-medium px-4 py-2"
          >
            Login
          </button>
          <button 
            onClick={onGetStarted}
            className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto mt-10 sm:mt-0">
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
          onClick={onGetStarted}
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
    </div>
  );
};