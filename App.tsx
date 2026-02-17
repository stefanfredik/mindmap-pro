
import React, { useState, useEffect } from 'react';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { MindMapData, Page, ThemeMode, MindMapNode } from './types';
import { SAMPLE_MINDMAP, THEMES, DEFAULT_THEME_ID, DEFAULT_NODE_STYLE } from './constants';
import { Moon, Sun } from 'lucide-react';
import { generateId, applyTheme } from './utils';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [mindMaps, setMindMaps] = useState<MindMapData[]>([SAMPLE_MINDMAP]);
  const [theme, setTheme] = useState<ThemeMode>(ThemeMode.LIGHT);

  // Initialize Theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme(ThemeMode.DARK);
    }
  }, []);

  useEffect(() => {
    if (theme === ThemeMode.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT);
  };

  // Handlers
  const handleLogin = () => {
    setCurrentPage(Page.DASHBOARD);
  };

  const handleCreateMap = () => {
    const defaultTheme = THEMES.find(t => t.id === DEFAULT_THEME_ID) || THEMES[0];
    const rootId = generateId();
    
    // Initial nodes
    const initialNodes: MindMapNode[] = [{
        id: rootId,
        parentId: null,
        content: "Central Topic",
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 - 100 },
        style: { ...DEFAULT_NODE_STYLE, ...defaultTheme.rootStyle }
    }];

    const newMap: MindMapData = {
      id: generateId(),
      title: "New Mind Map",
      themeId: DEFAULT_THEME_ID,
      layout: 'mindmap',
      nodes: initialNodes, // applyTheme not strictly needed for single root if style manually set, but Editor will apply it on mount
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMindMaps([...mindMaps, newMap]);
    setCurrentMapId(newMap.id);
    setCurrentPage(Page.EDITOR);
  };

  const handleOpenMap = (id: string) => {
    setCurrentMapId(id);
    setCurrentPage(Page.EDITOR);
  };

  const handleDeleteMap = (id: string) => {
    setMindMaps(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveMap = (updatedMap: MindMapData) => {
    setMindMaps(prev => prev.map(m => m.id === updatedMap.id ? updatedMap : m));
  };

  const handleBackToDashboard = () => {
    setCurrentPage(Page.DASHBOARD);
    setCurrentMapId(null);
  };

  // Render Page
  const renderContent = () => {
    switch (currentPage) {
      case Page.LANDING:
        return <Landing onGetStarted={handleLogin} />;
      case Page.DASHBOARD:
        return (
          <Dashboard 
            mindMaps={mindMaps} 
            onCreate={handleCreateMap}
            onOpen={handleOpenMap}
            onDelete={handleDeleteMap}
          />
        );
      case Page.EDITOR:
        const currentMap = mindMaps.find(m => m.id === currentMapId);
        if (!currentMap) return <div>Error: Map not found</div>;
        return (
          <Editor 
            data={currentMap} 
            onSave={handleSaveMap}
            onBack={handleBackToDashboard}
          />
        );
      default:
        return <div>404</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Global Theme Toggle (Absolute top-right, except in Editor which has its own layout) */}
      {currentPage !== Page.EDITOR && (
        <button
          onClick={toggleTheme}
          className="fixed top-6 right-6 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-600 dark:text-yellow-400 hover:scale-110 transition-transform"
          aria-label="Toggle Theme"
        >
          {theme === ThemeMode.LIGHT ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      )}

      {renderContent()}
    </div>
  );
};

export default App;
