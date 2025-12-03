import React, { useState, useEffect } from 'react';
import AccountBar from './components/AccountBar';
import VideoHistory from './components/VideoHistory';
import GlobalSettings from './components/GlobalSettings';
import PromptBuilder from './components/PromptBuilder';
import CharacterStudio from './components/CharacterStudio';
import Production from './components/Production';
import SocialUpload from './components/SocialUpload';
import ProjectDashboard from './components/ProjectDashboard';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import { constructVeoPrompt, openGeminiWeb } from './services/geminiService';
import { HistoryItem, AspectRatio, AccountUsage, UserProfile, ApiKey, CustomOption, Character, LoggedInUser, Scene, VideoMetadata, Project } from './types';
import { Sparkles, Video, User, Settings, AlertTriangle, Loader2, Clapperboard, Share2, LayoutGrid, ChevronRight } from 'lucide-react';

// Default data for custom options
const DEFAULT_CUSTOM_OPTIONS_DATA: CustomOption[] = [
  { id: 'opt-sp1', value: 'Human (มนุษย์)', attributeKey: 'species' },
  { id: 'opt-sp2', value: 'Elf (เอลฟ์)', attributeKey: 'species' },
  { id: 'opt-sp3', value: 'Robot/Android (หุ่นยนต์)', attributeKey: 'species' },
  { id: 'opt-sp4', value: 'Cat (แมว)', attributeKey: 'species' },
  { id: 'opt-sp5', value: 'Dog (สุนัข)', attributeKey: 'species' },
  { id: 'opt-sp6', value: 'Alien (เอเลี่ยน)', attributeKey: 'species' },
  { id: 'opt-g1', value: 'Male (ชาย)', attributeKey: 'gender' },
  { id: 'opt-g2', value: 'Female (หญิง)', attributeKey: 'gender' },
  { id: 'opt-cat1', value: 'Sci-Fi', attributeKey: 'storyCategory' },
  { id: 'opt-cat2', value: 'Fantasy', attributeKey: 'storyCategory' },
  { id: 'opt-det1', value: 'Cyberpunk Dystopia', attributeKey: 'storyDetail' },
  { id: 'opt-det2', value: 'High Fantasy World', attributeKey: 'storyDetail' }
];

type View = 'dashboard' | 'generator' | 'characters' | 'settings' | 'production' | 'upload';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // --- Authentication State ---
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [showAuthScreen, setShowAuthScreen] = useState<'login' | 'signup' | 'none'>('none');
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  // ----------------------------

  // Account & Quota Management
  const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(0);
  const [activeSlotCount, setActiveSlotCount] = useState<number>(2);
  const [accountUsage, setAccountUsage] = useState<AccountUsage>({});
  const [userProfiles, setUserProfiles] = useState<Record<number, UserProfile>>({});
  
  // API Key Management
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeStoryApiKeyId, setActiveStoryApiKeyId] = useState<string | null>(null);
  const [activeCharacterApiKeyId, setActiveCharacterApiKeyId] = useState<string | null>(null);
  const [activeProductionApiKeyId, setActiveProductionApiKeyId] = useState<string | null>(null);
  const [activeFalApiKeyId, setActiveFalApiKeyId] = useState<string | null>(null);
  const [activeUploadPostApiKeyId, setActiveUploadPostApiKeyId] = useState<string | null>(null);

  // Global Data
  const [characters, setCharacters] = useState<Character[]>([]);
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  const MAX_DAILY_COUNT = 2; 

  // --- PROJECT MANAGEMENT STATE ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedUsage = localStorage.getItem('veo_account_usage');
      const savedProfiles = localStorage.getItem('veo_user_profiles');
      const savedSlotCount = localStorage.getItem('veo_active_slot_count');
      const savedApiKeys = localStorage.getItem('veo_api_keys');
      const savedActiveStoryKeyId = localStorage.getItem('veo_active_story_key_id');
      const savedActiveCharacterKeyId = localStorage.getItem('veo_active_character_key_id');
      const savedActiveProductionKeyId = localStorage.getItem('veo_active_production_key_id');
      const savedActiveFalKeyId = localStorage.getItem('veo_active_fal_key_id');
      const savedActiveUploadPostKeyId = localStorage.getItem('veo_active_upload_post_key_id');
      const savedCharacters = localStorage.getItem('veo_characters');
      const savedLoggedInUser = localStorage.getItem('veo_logged_in_user');
      const savedCustomOptions = localStorage.getItem('veo_custom_options');
      const savedProjects = localStorage.getItem('veo_projects');
      const savedActiveProjectId = localStorage.getItem('veo_active_project_id');
      
      if (savedUsage) setAccountUsage(JSON.parse(savedUsage));
      if (savedProfiles) setUserProfiles(JSON.parse(savedProfiles));
      if (savedSlotCount) setActiveSlotCount(parseInt(savedSlotCount, 10));
      if (savedApiKeys) setApiKeys(JSON.parse(savedApiKeys));
      if (savedActiveStoryKeyId) setActiveStoryApiKeyId(savedActiveStoryKeyId);
      if (savedActiveCharacterKeyId) setActiveCharacterApiKeyId(savedActiveCharacterKeyId);
      if (savedActiveProductionKeyId) setActiveProductionApiKeyId(savedActiveProductionKeyId);
      if (savedActiveFalKeyId) setActiveFalApiKeyId(savedActiveFalKeyId);
      if (savedActiveUploadPostKeyId) setActiveUploadPostApiKeyId(savedActiveUploadPostKeyId);
      if (savedCharacters) setCharacters(JSON.parse(savedCharacters));
      if (savedProjects) setProjects(JSON.parse(savedProjects));
      if (savedActiveProjectId) setActiveProjectId(savedActiveProjectId);

      if (savedCustomOptions) {
        try {
          const parsedOptions = JSON.parse(savedCustomOptions);
          setCustomOptions(Array.isArray(parsedOptions) && parsedOptions.length > 0 ? parsedOptions : DEFAULT_CUSTOM_OPTIONS_DATA);
        } catch {
          setCustomOptions(DEFAULT_CUSTOM_OPTIONS_DATA);
        }
      } else {
        setCustomOptions(DEFAULT_CUSTOM_OPTIONS_DATA);
      }

      if (savedLoggedInUser) {
        setLoggedInUser(JSON.parse(savedLoggedInUser));
        setShowAuthScreen('none');
      } else {
        setShowAuthScreen('login');
      }

    } catch (e) {
      console.error("Failed to load settings", e);
      setLoggedInUser(null);
      setShowAuthScreen('login');
      setCustomOptions(DEFAULT_CUSTOM_OPTIONS_DATA);
    } finally {
      setIsAuthCheckComplete(true);
    }
  }, []);

  // Save data effects
  useEffect(() => { localStorage.setItem('veo_account_usage', JSON.stringify(accountUsage)); }, [accountUsage]);
  useEffect(() => { localStorage.setItem('veo_user_profiles', JSON.stringify(userProfiles)); }, [userProfiles]);
  useEffect(() => { localStorage.setItem('veo_active_slot_count', activeSlotCount.toString()); }, [activeSlotCount]);
  useEffect(() => { localStorage.setItem('veo_api_keys', JSON.stringify(apiKeys)); }, [apiKeys]);
  useEffect(() => { if(activeStoryApiKeyId) localStorage.setItem('veo_active_story_key_id', activeStoryApiKeyId); else localStorage.removeItem('veo_active_story_key_id'); }, [activeStoryApiKeyId]);
  useEffect(() => { if(activeCharacterApiKeyId) localStorage.setItem('veo_active_character_key_id', activeCharacterApiKeyId); else localStorage.removeItem('veo_active_character_key_id'); }, [activeCharacterApiKeyId]);
  useEffect(() => { if(activeProductionApiKeyId) localStorage.setItem('veo_active_production_key_id', activeProductionApiKeyId); else localStorage.removeItem('veo_active_production_key_id'); }, [activeProductionApiKeyId]);
  useEffect(() => { if(activeFalApiKeyId) localStorage.setItem('veo_active_fal_key_id', activeFalApiKeyId); else localStorage.removeItem('veo_active_fal_key_id'); }, [activeFalApiKeyId]);
  useEffect(() => { if(activeUploadPostApiKeyId) localStorage.setItem('veo_active_upload_post_key_id', activeUploadPostApiKeyId); else localStorage.removeItem('veo_active_upload_post_key_id'); }, [activeUploadPostApiKeyId]);
  useEffect(() => { localStorage.setItem('veo_characters', JSON.stringify(characters)); }, [characters]);
  useEffect(() => { localStorage.setItem('veo_custom_options', JSON.stringify(customOptions)); }, [customOptions]);
  useEffect(() => { localStorage.setItem('veo_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { if(activeProjectId) localStorage.setItem('veo_active_project_id', activeProjectId); else localStorage.removeItem('veo_active_project_id'); }, [activeProjectId]);
  useEffect(() => { if (loggedInUser) localStorage.setItem('veo_logged_in_user', JSON.stringify(loggedInUser)); else localStorage.removeItem('veo_logged_in_user'); }, [loggedInUser]);


  // Project Management Functions
  const createNewProject = (name: string, category: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      plot: '',
      scenes: [],
      settings: {
        weather: 'Sunny (แดดจัด)',
        atmosphere: 'Cinematic (ภาพยนตร์)',
        lighting: 'Natural (ธรรมชาติ)',
        intensity: 30,
        dialect: 'TH ไทยกลาง',
        tone: 'Serious/Dramatic (จริงจัง/ดราม่า)',
        style: 'Cinematic Movie (ภาพยนตร์)',
        aspectRatio: '16:9'
      },
      selectedCharacterIds: [],
      maxCharactersPerScene: 1,
      numberOfScenes: 3,
      metadata: null
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setCurrentView('generator');
  };

  const updateActiveProject = (updates: Partial<Project>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setCurrentView('dashboard');
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const addToHistory = (original: string, final: string) => {
     const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      originalPrompt: original,
      finalPrompt: final,
      createdAt: Date.now(),
      accountIndex: currentAccountIndex
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleCopyOnly = (text: string) => navigator.clipboard.writeText(text);

  const resetCurrentAccount = () => setAccountUsage(prev => ({ ...prev, [currentAccountIndex]: 0 }));
  const updateProfile = (index: number, data: Partial<UserProfile>) => setUserProfiles(prev => ({ ...prev, [index]: { ...(prev[index] || { name: `Account ${index + 1}` }), ...data } }));
  const updateProfileName = (index: number, name: string) => updateProfile(index, { name });
  const handleAddCustomOption = (option: CustomOption) => setCustomOptions(prev => [...prev, option]);
  const handleRemoveCustomOption = (id: string) => setCustomOptions(prev => prev.filter(opt => opt.id !== id));

  // Updated to return boolean for batch processing logic
  const handleGenerateSceneVideo = (prompt: string): boolean => {
    const availableAccounts: number[] = [];
    for (let i = 0; i < activeSlotCount; i++) {
      if ((accountUsage[i] || 0) < MAX_DAILY_COUNT) {
        availableAccounts.push(i);
      }
    }

    if (availableAccounts.length > 0) {
      // Find current index in available, or pick next one
      let nextAccountIndex = currentAccountIndex;
      if (!availableAccounts.includes(currentAccountIndex)) {
          // If current is full, pick random or first available
          // Simple load balancing: pick the one with lowest usage? Or just random.
          const randomIndex = Math.floor(Math.random() * availableAccounts.length);
          nextAccountIndex = availableAccounts[randomIndex];
      }

      setCurrentAccountIndex(nextAccountIndex);
      setAccountUsage(prev => ({ ...prev, [nextAccountIndex]: (prev[nextAccountIndex] || 0) + 1 }));
      const config = { prompt: prompt, aspectRatio: activeProject?.settings.aspectRatio || '16:9' };
      const finalPrompt = constructVeoPrompt(config);
      
      // Auto copy to clipboard for user convenience before opening
      navigator.clipboard.writeText(finalPrompt).catch(() => {});
      
      openGeminiWeb(nextAccountIndex); 
      addToHistory(prompt, finalPrompt);
      return true;
    } else {
      alert("โควต้าการสร้างวิดีโอของทุกบัญชีเต็มแล้วสำหรับวันนี้ กรุณารอวันพรุ่งนี้หรือเคลียร์โควต้าบัญชี");
      return false;
    }
  };

  const activeStoryApiKeyObj = apiKeys.find(k => k.id === activeStoryApiKeyId) || null;
  const activeCharacterApiKeyObj = apiKeys.find(k => k.id === activeCharacterApiKeyId) || null;
  const activeProductionApiKeyObj = apiKeys.find(k => k.id === activeProductionApiKeyId) || null;
  const activeFalApiKeyObj = apiKeys.find(k => k.id === activeFalApiKeyId) || null;
  const activeUploadPostApiKeyObj = apiKeys.find(k => k.id === activeUploadPostApiKeyId) || null;
  
  const handleLogin = (username: string, password: string) => { if (username && password) { setLoggedInUser({ username }); setShowAuthScreen('none'); } else { alert("กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน"); } };
  const handleSignup = (username: string, password: string) => { if (username && password) { setLoggedInUser({ username }); setShowAuthScreen('none'); } else { alert("กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน"); } };
  const handleLogout = () => { setLoggedInUser(null); setShowAuthScreen('login'); };


  if (!isAuthCheckComplete) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans"><Loader2 size={48} className="animate-spin mb-4" /></div>;
  if (!loggedInUser) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">{showAuthScreen === 'login' ? <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setShowAuthScreen('signup')} /> : <SignupScreen onSignup={handleSignup} onSwitchToLogin={() => setShowAuthScreen('login')} />}</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans">
      {/* Top Bar for Account Management */}
      <AccountBar 
          currentAccountIndex={currentAccountIndex}
          activeSlotCount={activeSlotCount}
          usageMap={accountUsage}
          userProfiles={userProfiles}
          maxCount={MAX_DAILY_COUNT}
          onAccountSelect={setCurrentAccountIndex} 
          onResetCurrent={resetCurrentAccount}
          onUpdateProfileName={updateProfileName}
          onOpenSettings={() => setCurrentView('settings')}
          loggedInUser={loggedInUser}
          onLogout={handleLogout}
      />

      {/* Main Navigation - Shows breadcrumbs if in a project */}
      <nav className="container mx-auto px-4 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setActiveProjectId(null);
                setCurrentView('dashboard');
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 font-bold text-sm"
            >
              <LayoutGrid size={16}/> Dashboard
            </button>
            {activeProject && (
              <>
                <ChevronRight size={16} className="text-slate-600"/>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                   <Video size={16}/> {activeProject.name}
                </span>
              </>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1 shadow-lg overflow-x-auto">
             <button onClick={() => setCurrentView('settings')} className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${currentView === 'settings' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Settings size={16} /> <span className="hidden sm:inline">Settings</span>
             </button>
             {activeProject && (
              <>
                 <button onClick={() => setCurrentView('characters')} className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${currentView === 'characters' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <User size={16} /> <span className="hidden sm:inline">Characters</span>
                 </button>
                 <button onClick={() => setCurrentView('generator')} className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${currentView === 'generator' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Video size={16} /> <span className="hidden sm:inline">Storyboard</span>
                 </button>
                 <button onClick={() => setCurrentView('production')} className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${currentView === 'production' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Clapperboard size={16} /> <span className="hidden sm:inline">Production</span>
                 </button>
                 <button onClick={() => setCurrentView('upload')} className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${currentView === 'upload' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Share2 size={16} /> <span className="hidden sm:inline">Distribution</span>
                 </button>
              </>
             )}
          </div>
      </nav>

      <main className="container mx-auto px-4 pt-6 flex flex-col items-center">
        {/* DASHBOARD VIEW */}
        {!activeProject && currentView !== 'settings' && (
          <ProjectDashboard 
            projects={projects}
            onCreateProject={createNewProject}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              setCurrentView('generator');
            }}
            onDeleteProject={deleteProject}
          />
        )}
        
        {/* SETTINGS VIEW */}
        {currentView === 'settings' && (
          <GlobalSettings
            userProfiles={userProfiles}
            onUpdateProfile={updateProfile}
            activeSlotCount={activeSlotCount}
            onUpdateSlotCount={setActiveSlotCount}
            apiKeys={apiKeys}
            activeStoryApiKeyId={activeStoryApiKeyId}
            activeCharacterApiKeyId={activeCharacterApiKeyId}
            activeProductionApiKeyId={activeProductionApiKeyId}
            activeFalApiKeyId={activeFalApiKeyId}
            activeUploadPostApiKeyId={activeUploadPostApiKeyId}
            onAddKey={(k) => setApiKeys(prev => [...prev, k])}
            onRemoveKey={(id) => {
              setApiKeys(prev => prev.filter(k => k.id !== id));
              if (activeStoryApiKeyId === id) setActiveStoryApiKeyId(null);
              if (activeCharacterApiKeyId === id) setActiveCharacterApiKeyId(null);
              if (activeProductionApiKeyId === id) setActiveProductionApiKeyId(null);
              if (activeFalApiKeyId === id) setActiveFalApiKeyId(null);
              if (activeUploadPostApiKeyId === id) setActiveUploadPostApiKeyId(null);
            }}
            onSelectStoryKey={setActiveStoryApiKeyId}
            onSelectCharacterKey={setActiveCharacterApiKeyId}
            onSelectProductionKey={setActiveProductionApiKeyId}
            onSelectFalKey={setActiveFalApiKeyId}
            onSelectUploadPostKey={setActiveUploadPostApiKeyId}
          />
        )}

        {/* ACTIVE PROJECT VIEWS (Persist State by Hiding instead of Unmounting) */}
        {activeProject && (
           <>
             {/* Character Studio */}
             <div className={`w-full max-w-6xl ${currentView === 'characters' ? 'block' : 'hidden'}`}>
                 <CharacterStudio 
                    characters={characters}
                    onSaveCharacter={(newChar) => {
                        setCharacters(prev => {
                            const exists = prev.find(c => c.id === newChar.id);
                            if (exists) return prev.map(c => c.id === newChar.id ? newChar : c);
                            return [...prev, newChar];
                        });
                    }}
                    onDeleteCharacter={(id) => setCharacters(prev => prev.filter(c => c.id !== id))}
                    onBack={() => setCurrentView('generator')}
                    customOptions={customOptions}
                    onAddCustomOption={handleAddCustomOption}
                    onRemoveCustomOption={handleRemoveCustomOption}
                    activeCharacterApiKey={activeCharacterApiKeyObj}
                    onOpenApiKeyManager={() => setCurrentView('settings')}
                 />
             </div>

             {/* Production */}
             <div className={`w-full max-w-7xl ${currentView === 'production' ? 'block' : 'hidden'}`}>
                <Production 
                   project={activeProject}
                   onUpdateProject={updateActiveProject}
                   activeProductionApiKey={activeProductionApiKeyObj}
                   activeFalApiKey={activeFalApiKeyObj}
                   onOpenApiKeyManager={() => setCurrentView('settings')}
                   onProceedToUpload={() => setCurrentView('upload')}
                />
             </div>

             {/* Social Upload */}
             <div className={`w-full max-w-7xl ${currentView === 'upload' ? 'block' : 'hidden'}`}>
                <SocialUpload 
                   project={activeProject}
                   activeUploadPostApiKey={activeUploadPostApiKeyObj}
                   onOpenApiKeyManager={() => setCurrentView('settings')}
                />
             </div>

             {/* Generator (Storyboard) */}
             <div className={`w-full max-w-7xl ${currentView === 'generator' ? 'block' : 'hidden'}`}>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300">
                    {(accountUsage[currentAccountIndex] || 0) >= MAX_DAILY_COUNT && (
                        <div className="absolute top-0 left-0 right-0 bg-red-500/10 border-b border-red-500/20 p-2 flex items-center justify-center gap-2 text-red-300 text-xs z-20">
                            <AlertTriangle size={12} /> <span>โควต้าบัญชีนี้เต็มแล้ว ระบบจะสุ่มบัญชีใหม่ให้เมื่อคุณกดสร้าง</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Sparkles className="text-emerald-500" /> Veo Storyboard Pro: {activeProject.name}</h2>
                    </div>
                    <div className="relative z-10">
                        <PromptBuilder 
                            project={activeProject}
                            onUpdateProject={updateActiveProject}
                            characters={characters}
                            activeStoryApiKey={activeStoryApiKeyObj}
                            onOpenApiKeyManager={() => setCurrentView('settings')}
                            onGenerateSceneVideo={handleGenerateSceneVideo}
                            onNavigateToCharacterStudio={() => setCurrentView('characters')}
                            customOptions={customOptions}
                            onAddCustomOption={handleAddCustomOption}
                            onRemoveCustomOption={handleRemoveCustomOption}
                            accountUsage={accountUsage}
                            activeSlotCount={activeSlotCount}
                            maxDailyCount={MAX_DAILY_COUNT}
                        />
                    </div>
                </div>
                <VideoHistory items={history} onCopy={handleCopyOnly} />
             </div>
           </>
        )}
      </main>
    </div>
  );
};

export default App;