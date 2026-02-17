
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Clock, MoreVertical, Trash2, ExternalLink, Brain, ChevronDown, 
  LogOut, User, Settings, Search, X, Camera, Mail, Briefcase, Bell, Globe, Moon, Sun, Shield, Save
} from 'lucide-react';
import { MindMapData, ThemeMode } from '../types';

interface DashboardProps {
  mindMaps: MindMapData[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  job: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  mindMaps, onCreate, onOpen, onDelete, onLogout, theme, toggleTheme 
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Modals State
  const [activeModal, setActiveModal] = useState<'profile' | 'settings' | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'You (Owner)',
    email: 'user@mindmap.pro',
    job: 'Product Designer'
  });
  const [tempProfile, setTempProfile] = useState<UserProfile>(userProfile);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setActiveMenuId(null);
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Update temp profile when opening modal
  useEffect(() => {
    if (activeModal === 'profile') {
      setTempProfile(userProfile);
    }
  }, [activeModal, userProfile]);

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleProfileToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowProfileMenu(!showProfileMenu);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
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

  const saveProfile = () => {
    setUserProfile(tempProfile);
    setActiveModal(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const filteredMaps = mindMaps.filter(map => 
    map.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
         <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Brain className="w-8 h-8" />
            <span className="hidden sm:inline">MindMap Pro</span>
         </div>

         <div className="flex items-center gap-4">
             {/* Search Bar */}
             <div className="hidden md:flex relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search maps..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-gray-700 border-none rounded-full text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white w-64 transition-all"
                 />
             </div>

             {/* Profile Menu */}
             <div className="relative" ref={profileMenuRef}>
                 <button 
                    onClick={handleProfileToggle}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                 >
                     <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                         {getInitials(userProfile.name)}
                     </div>
                     <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
                 </button>

                 {showProfileMenu && (
                     <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                         <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                             <p className="font-semibold text-gray-900 dark:text-white truncate">{userProfile.name}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userProfile.email}</p>
                         </div>
                         <div className="p-1">
                             <button 
                                onClick={() => { setActiveModal('profile'); setShowProfileMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors"
                             >
                                 <User size={16} /> My Profile
                             </button>
                             <button 
                                onClick={() => { setActiveModal('settings'); setShowProfileMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors"
                             >
                                 <Settings size={16} /> Settings
                             </button>
                         </div>
                         <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                         <div className="p-1">
                             <button 
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-3 transition-colors"
                             >
                                 <LogOut size={16} /> Log Out
                             </button>
                         </div>
                     </div>
                 )}
             </div>
         </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Mindmaps</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                {filteredMaps.length} {filteredMaps.length === 1 ? 'project' : 'projects'} found
            </p>
            </div>
            <button 
            onClick={onCreate}
            className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
            >
            <Plus size={20} />
            New Mindmap
            </button>
        </div>

        {/* Mobile Search Bar (visible only on small screens) */}
        <div className="md:hidden mb-6">
            <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search maps..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                 />
             </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Card (Quick Action) */}
            <button 
            onClick={onCreate}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-blue-50 dark:hover:bg-gray-800 transition-all group h-64"
            >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                <Plus size={32} />
            </div>
            <span className="font-medium">Create New Mindmap</span>
            </button>

            {filteredMaps.map((map) => (
            <div 
                key={map.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col h-64 relative group ${activeMenuId === map.id ? 'z-10 ring-2 ring-blue-500/20' : ''}`}
            >
                <div 
                className="flex-grow bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center cursor-pointer relative rounded-t-xl overflow-hidden"
                onClick={() => onOpen(map.id)}
                >
                {/* Mini Preview Placeholder */}
                <div className="opacity-30 dark:opacity-20 flex flex-col items-center transform group-hover:scale-105 transition-transform duration-500">
                    <div className="w-16 h-8 bg-blue-400 rounded-md mb-2"></div>
                    <div className="flex gap-4">
                        <div className="w-12 h-6 bg-green-400 rounded-md"></div>
                        <div className="w-12 h-6 bg-orange-400 rounded-md"></div>
                    </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 backdrop-blur-[1px]">
                    <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg text-sm font-medium text-primary transform translate-y-2 group-hover:translate-y-0 transition-transform">Open Editor</span>
                </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-start rounded-b-xl relative bg-white dark:bg-gray-800">
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
            
            {filteredMaps.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400">
                    <p>No mindmaps found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-blue-500" /> My Profile
                    </h3>
                    <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md mb-3">
                                {getInitials(tempProfile.name)}
                            </div>
                            <button className="absolute bottom-3 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                <Camera size={16} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500">Allowed *.jpeg, *.jpg, *.png, max 3 MB</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={tempProfile.name} 
                                    onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="email" 
                                    value={tempProfile.email} 
                                    onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={tempProfile.job} 
                                    onChange={(e) => setTempProfile({...tempProfile, job: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">Cancel</button>
                    <button onClick={saveProfile} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="text-gray-500" /> Settings
                    </h3>
                    <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h4>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    {theme === ThemeMode.DARK ? <Moon size={24} /> : <Sun size={24} />}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Theme Preference</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleTheme}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${theme === ThemeMode.DARK ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${theme === ThemeMode.DARK ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                        <Bell size={24} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your projects</p>
                                    </div>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600">
                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Language</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Select your interface language</p>
                                    </div>
                                </div>
                                <select className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500">
                                    <option>English (US)</option>
                                    <option>Indonesian</option>
                                    <option>Spanish</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h4>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Delete Account</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Permanently remove your account and data</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors font-medium text-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm">
                        Done
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
