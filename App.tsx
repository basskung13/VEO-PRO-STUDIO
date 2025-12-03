
import React, { useState, useEffect } from 'react';
import AccountBar from './components/AccountBar';
import VideoHistory from './components/VideoHistory';
import GlobalSettings from './components/GlobalSettings';
import PromptBuilder from './components/PromptBuilder';
import CharacterStudio from './components/CharacterStudio';
import Production from './components/Production';
import SocialUpload from './components/SocialUpload';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import { constructVeoPrompt, openGeminiWeb } from './services/geminiService';
import { HistoryItem, AspectRatio, AccountUsage, UserProfile, ApiKey, CustomOption, Character, LoggedInUser, Scene, VideoMetadata } from './types';
import { Sparkles, Video, User, Settings, AlertTriangle, Loader2, Clapperboard, Share2 } from 'lucide-react';

const STYLES = [
  'Cinematic', 'Photorealistic', 'Anime', 'Cyberpunk', '3D Render', 'Vintage', 'Noir', 'Watercolor'
];

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

type View = 'generator' | 'characters' | 'settings' | 'production' | 'upload';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('settings');
  
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
  const [activeFalApiKeyId, setActiveFalApiKeyId] = useState<string | null>(null);
  const [activeUploadPostApiKeyId, setActiveUploadPostApiKeyId] = useState<string | null>(null);

  // Characters & Storyboard
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharactersForStoryboard, setSelectedCharactersForStoryboard] = useState<string[]>([]);
  const [maxCharactersPerScene, setMaxCharactersPerScene] = useState<number>(1);
  const [numberOfScenes, setNumberOfScenes] = useState<number>(3);
  
  // Lifted State: Plot and Scenes
  const [plot, setPlot] = useState<string>('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  // Lifted State: Metadata for Production -> Upload
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);

  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  const MAX_DAILY_COUNT = 2; 

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
      const savedActiveFalKeyId = localStorage.getItem('veo_active_fal_key_id');
      const savedActiveUploadPostKeyId = localStorage.getItem('veo_active_upload_post_key_id');
      const savedCharacters = localStorage.getItem('veo_characters');
      const savedLoggedInUser = localStorage.getItem('veo_logged_in_user');
      const savedCustomOptions = localStorage.getItem('veo_custom_options');
      const savedSelectedChars = localStorage.getItem('veo_selected_story_chars');
      const savedMaxCharsPerScene = localStorage.getItem('veo_max_chars_per_scene');
      const savedNumScenes = localStorage.getItem('veo_num_scenes');
      const savedPlot = localStorage.getItem('veo_current_plot');
      const savedScenes = localStorage.getItem('veo_current_scenes');
      
      if (savedUsage) setAccountUsage(JSON.parse(savedUsage));
      if (savedProfiles) setUserProfiles(JSON.parse(savedProfiles));
      if (savedSlotCount) setActiveSlotCount(parseInt(savedSlotCount, 10));
      if (savedApiKeys) setApiKeys(JSON.parse(savedApiKeys));
      if (savedActiveStoryKeyId) setActiveStoryApiKeyId(savedActiveStoryKeyId);
      if (savedActiveCharacterKeyId) setActiveCharacterApiKeyId(savedActiveCharacterKeyId);
      if (savedActiveFalKeyId) setActiveFalApiKeyId(savedActiveFalKeyId);
      if (savedActiveUploadPostKeyId) setActiveUploadPostApiKeyId(savedActiveUploadPostKeyId);
      if (savedCharacters) setCharacters(JSON.parse(savedCharacters));
      if (savedSelectedChars) setSelectedCharactersForStoryboard(JSON.parse(savedSelectedChars));
      if (savedMaxCharsPerScene) setMaxCharactersPerScene(parseInt(savedMaxCharsPerScene, 10));
      if (savedNumScenes) setNumberOfScenes(parseInt(savedNumScenes, 10));
      if (savedPlot) setPlot(savedPlot);
      if (savedScenes) setScenes(JSON.parse(savedScenes));

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
  useEffect(() => { if(activeStoryApiKeyId) localStorage.setItem('veo_active_story_key_id', activeStoryApiKeyId); }, [activeStoryApiKeyId]);
  useEffect(() => { if(activeCharacterApiKeyId) localStorage.setItem('veo_active_character_key_id', activeCharacterApiKeyId); }, [activeCharacterApiKeyId]);
  useEffect(() => { if(activeFalApiKeyId) localStorage.setItem('veo_active_fal_key_id', activeFalApiKeyId); }, [activeFalApiKeyId]);
  useEffect(() => { if(activeUploadPostApiKeyId) localStorage.setItem('veo_active_upload_post_key_id', activeUploadPostApiKeyId); }, [activeUploadPostApiKeyId]);
  useEffect(() => { localStorage.setItem('veo_characters', JSON.stringify(characters)); }, [characters]);
  useEffect(() => { localStorage.setItem('veo_custom_options', JSON.stringify(customOptions)); }, [customOptions]);
  useEffect(() => { localStorage.setItem('veo_selected_story_chars', JSON.stringify(selectedCharactersForStoryboard)); }, [selectedCharactersForStoryboard]);
  useEffect(() => { localStorage.setItem('veo_max_chars_per_scene', maxCharactersPerScene.toString()); }, [maxCharactersPerScene]);
  useEffect(() => { localStorage.setItem('veo_num_scenes', numberOfScenes.toString()); }, [numberOfScenes]);
  useEffect(() => { localStorage.setItem('veo_current_plot', plot); }, [plot]);
  useEffect(() => { localStorage.setItem('veo_current_scenes', JSON.stringify(scenes)); }, [scenes]);
  useEffect(() => { if (loggedInUser) localStorage.setItem('veo_logged_in_user', JSON.stringify(loggedInUser)); else localStorage.removeItem('veo_logged_in_user'); }, [loggedInUser]);

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

  const handleGenerateSceneVideo = (prompt: string) => {
    const availableAccounts: number[] = [];
    for (let i = 0; i < activeSlotCount; i++) {
      if ((accountUsage[i] || 0) < MAX_DAILY_COUNT) {
        availableAccounts.push(i);
      }
    }

    if (availableAccounts.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableAccounts.length);
      const nextAccountIndex = availableAccounts[randomIndex];
      setCurrentAccountIndex(nextAccountIndex);
      setAccountUsage(prev => ({ ...prev, [nextAccountIndex]: (prev[nextAccountIndex] || 0) + 1 }));
      const config = { prompt: prompt, aspectRatio: '16:9' as AspectRatio };
      const finalPrompt = constructVeoPrompt(config);
      openGeminiWeb(nextAccountIndex); 
      addToHistory(prompt, finalPrompt);
    } else {
      alert("โควต้าการสร้างวิดีโอของทุกบัญชีเต็มแล้วสำหรับวันนี้ กรุณารอวันพรุ่งนี้หรือเคลียร์โควต้าบัญชี");
    }
  };

  const activeStoryApiKeyObj = apiKeys.find(k => k.id === activeStoryApiKeyId) || null;
  const activeCharacterApiKeyObj = apiKeys.find(k => k.id === activeCharacterApiKeyId) || null;
  const activeFalApiKeyObj = apiKeys.find(k => k.id === activeFalApiKeyId) || null;
  const activeUploadPostApiKeyObj = apiKeys.find(k => k.id === activeUploadPostApiKeyId) || null;
  
  const handleLogin = (username: string, password: string) => { if (username && password) { setLoggedInUser({ username }); setShowAuthScreen('none'); } else { alert("กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน"); } };
  const handleSignup = (username: string, password: string) => { if (username && password) { setLoggedInUser({ username }); setShowAuthScreen('none'); } else { alert("กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน"); } };
  const handleLogout = () => { setLoggedInUser(null); setShowAuthScreen('login'); };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  if (!isAuthCheckComplete) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans"><Loader2 size={48} className="animate-spin mb-4" /></div>;
  if (!loggedInUser) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">{showAuthScreen === 'login' ? <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setShowAuthScreen('signup')} /> : <SignupScreen onSignup={handleSignup} onSwitchToLogin={() => setShowAuthScreen('login')} />}</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans">
      {currentView === 'generator' && (
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
      )}

      {/* Main Navigation */}
      <nav className={`container mx-auto px-4 ${currentView === 'generator' ? 'mt-6' : 'mt-8'} flex justify-center`}>
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1 shadow-lg overflow-x-auto">
             <button onClick={() => setCurrentView('settings')} className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${currentView === 'settings' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Settings size={16} /> <span className="hidden sm:inline">Settings</span>
             </button>
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
          </div>
      </nav>

      <main className="container mx-auto px-4 pt-6 flex flex-col items-center">
        {currentView === 'settings' ? (
          <GlobalSettings
            userProfiles={userProfiles}
            onUpdateProfile={updateProfile}
            activeSlotCount={activeSlotCount}
            onUpdateSlotCount={setActiveSlotCount}
            apiKeys={apiKeys}
            activeStoryApiKeyId={activeStoryApiKeyId}
            activeCharacterApiKeyId={activeCharacterApiKeyId}
            activeFalApiKeyId={activeFalApiKeyId}
            activeUploadPostApiKeyId={activeUploadPostApiKeyId}
            onAddKey={(k) => setApiKeys(prev => [...prev, k])}
            onRemoveKey={(id) => {
              setApiKeys(prev => prev.filter(k => k.id !== id));
              if (activeStoryApiKeyId === id) setActiveStoryApiKeyId(null);
              if (activeCharacterApiKeyId === id) setActiveCharacterApiKeyId(null);
              if (activeFalApiKeyId === id) setActiveFalApiKeyId(null);
              if (activeUploadPostApiKeyId === id) setActiveUploadPostApiKeyId(null);
            }}
            onSelectStoryKey={setActiveStoryApiKeyId}
            onSelectCharacterKey={setActiveCharacterApiKeyId}
            onSelectFalKey={setActiveFalApiKeyId}
            onSelectUploadPostKey={setActiveUploadPostApiKeyId}
          />
        ) : currentView === 'characters' ? (
             <div className="w-full max-w-6xl">
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
        ) : currentView === 'production' ? (
            <div className="w-full max-w-7xl">
                <Production 
                   scenes={scenes}
                   plot={plot}
                   onUpdateScene={updateScene}
                   activeStoryApiKey={activeStoryApiKeyObj}
                   activeFalApiKey={activeFalApiKeyObj}
                   onOpenApiKeyManager={() => setCurrentView('settings')}
                   metadata={videoMetadata}
                   onUpdateMetadata={setVideoMetadata}
                   onProceedToUpload={() => setCurrentView('upload')}
                />
            </div>
        ) : currentView === 'upload' ? (
          <div className="w-full max-w-7xl">
              <SocialUpload 
                 metadata={videoMetadata}
                 activeUploadPostApiKey={activeUploadPostApiKeyObj}
                 onOpenApiKeyManager={() => setCurrentView('settings')}
              />
          </div>
        ) : (
            <>
                <div className="w-full max-w-7xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 animate-fade-in">
                {(accountUsage[currentAccountIndex] || 0) >= MAX_DAILY_COUNT && (
                    <div className="absolute top-0 left-0 right-0 bg-red-500/10 border-b border-red-500/20 p-2 flex items-center justify-center gap-2 text-red-300 text-xs z-20">
                        <AlertTriangle size={12} /> <span>โควต้าบัญชีนี้เต็มแล้ว ระบบจะสุ่มบัญชีใหม่ให้เมื่อคุณกดสร้าง</span>
                    </div>
                )}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Sparkles className="text-emerald-500" /> Veo Storyboard Pro</h2>
                </div>
                <div className="relative z-10">
                    <PromptBuilder 
                        plot={plot} 
                        setPlot={setPlot}
                        scenes={scenes}
                        setScenes={setScenes}
                        characters={characters}
                        activeStoryApiKey={activeStoryApiKeyObj}
                        onOpenApiKeyManager={() => setCurrentView('settings')}
                        onGenerateSceneVideo={handleGenerateSceneVideo}
                        onNavigateToCharacterStudio={() => setCurrentView('characters')}
                        selectedCharactersForStoryboard={selectedCharactersForStoryboard}
                        onSelectCharactersForStoryboard={setSelectedCharactersForStoryboard}
                        maxCharactersPerScene={maxCharactersPerScene}
                        onSetMaxCharactersPerScene={setMaxCharactersPerScene}
                        numberOfScenes={numberOfScenes}
                        onSetNumberOfScenes={setNumberOfScenes}
                        customOptions={customOptions}
                        onAddCustomOption={handleAddCustomOption}
                        onRemoveCustomOption={handleRemoveCustomOption}
                    />
                </div>
                </div>
                <VideoHistory items={history} onCopy={handleCopyOnly} />
            </>
        )}
      </main>
    </div>
  );
};

export default App;
