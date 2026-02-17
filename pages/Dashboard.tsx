
import React, { useState, useEffect } from 'react';
import { Plus, Clock, MoreVertical, FileText, Trash2, Edit, ExternalLink } from 'lucide-react';
import { MindMapData } from '../types';

interface DashboardProps {
  mindMaps: MindMapData[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ mindMaps, onCreate, onOpen, onDelete }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering window click
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Close menu first to ensure UI feels responsive
    setActiveMenuId(null);
    // Use setTimeout to allow menu to close before alert/confirm blocks thread
    setTimeout(() => {
        if (window.confirm('Are you sure you want to delete this mindmap?')) {
            onDelete(id);
        }
    }, 10);
  };
  
  const handleOpenMap = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onOpen(id);
      setActiveMenuId(null);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Mindmaps</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your ideas and projects</p>
        </div>
        <button 
          onClick={onCreate}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          New Mindmap
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Card (Quick Action) */}
        <button 
          onClick={onCreate}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-blue-50 dark:hover:bg-gray-800 transition-all group h-64"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900">
            <Plus size={32} />
          </div>
          <span className="font-medium">Create New Mindmap</span>
        </button>

        {mindMaps.map((map) => (
          <div 
            key={map.id} 
            className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col h-64 relative group ${activeMenuId === map.id ? 'z-10 ring-2 ring-blue-500/20' : ''}`}
          >
            <div 
              className="flex-grow bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center cursor-pointer relative rounded-t-xl"
              onClick={() => onOpen(map.id)}
            >
              {/* Mini Preview Placeholder */}
              <div className="opacity-30 dark:opacity-20 flex flex-col items-center">
                 <div className="w-16 h-8 bg-blue-400 rounded-md mb-2"></div>
                 <div className="flex gap-4">
                    <div className="w-12 h-6 bg-green-400 rounded-md"></div>
                    <div className="w-12 h-6 bg-orange-400 rounded-md"></div>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl overflow-hidden">
                    <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow text-sm font-medium text-primary">Open Editor</span>
                 </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-start rounded-b-xl">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2" title={map.title}>
                  {map.title}
                </h3>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 gap-2">
                  <Clock size={12} />
                  <span>{new Date(map.updatedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{map.nodes.length} nodes</span>
                </div>
              </div>
              <div className="relative">
                <button 
                  type="button"
                  className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${activeMenuId === map.id ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200' : ''}`}
                  onClick={(e) => handleMenuToggle(e, map.id)}
                  title="More options"
                >
                  <MoreVertical size={16} />
                </button>
                
                {activeMenuId === map.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        <button 
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            onClick={(e) => handleOpenMap(e, map.id)}
                        >
                            <ExternalLink size={14} /> Open
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-0.5"></div>
                        <button 
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            onClick={(e) => handleDelete(e, map.id)}
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
