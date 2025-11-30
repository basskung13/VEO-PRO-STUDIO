
import React, { useState, useEffect } from 'react';
import AccountBar from './components/AccountBar';
import VideoHistory from './components/VideoHistory';
import AccountSettingsModal from './components/AccountSettingsModal';
import PromptBuilder from './components/PromptBuilder';
import ApiKeyManager from './components/ApiKeyManager';
import CharacterStudio from './components/CharacterStudio';
import { constructVeoPrompt, openGeminiWeb } from './services/geminiService';
import { HistoryItem, AspectRatio, AccountUsage, UserProfile, ApiKey, CustomOption, Character } from './types';
import { Sparkles, ExternalLink, Command, AlertTriangle, ChevronDown, Video, User, Key } from 'lucide-react';

const STYLES = [
  'Cinematic',
  'Photorealistic',
  'Anime',
  'Cyberpunk',
  '3D Render',
  'Vintage',
  'Noir',
  'Watercolor'
];

type View = 'generator' | 'characters';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('generator');
  // Removed prompt, aspectratio, style states that were used for freeform
  // PromptBuilder now manages its own scenes
  
  // Account & Quota Management
  const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(0);
  const [activeSlotCount, setActiveSlotCount] = useState<number>(2);
  const [accountUsage, setAccountUsage] = useState<AccountUsage>({});
  const [userProfiles, setUserProfiles] = useState<Record<number, UserProfile>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // API Key Management
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isKeyManagerOpen, setIsKeyManagerOpen] = useState(false);

  // Characters
  const [characters, setCharacters] = useState<Character[]>([]);
  
  const MAX_DAILY_COUNT = 2;

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastCopied, setLastCopied] = useState<boolean>(false);

  // Load data
  useEffect(() => {
    try {
      const savedUsage = localStorage.getItem('veo_account_usage');
      const savedProfiles = localStorage.getItem('veo_user_profiles');
      const savedSlotCount = localStorage.getItem('veo_active_slot_count');
      const savedApiKeys = localStorage.getItem('veo_api_keys');
      const savedActiveKey = localStorage.getItem('veo_active_key_id');
      const savedCharacters = localStorage.getItem('veo_characters');
      
      if (savedUsage) setAccountUsage(JSON.parse(savedUsage));
      if (savedProfiles) setUserProfiles(JSON.parse(savedProfiles));
      if (savedSlotCount) setActiveSlotCount(parseInt(savedSlotCount, 10));
      if (savedApiKeys) setApiKeys(JSON.parse(savedApiKeys));
      if (savedActiveKey) setActiveKeyId(savedActiveKey);
      if (savedCharacters) setCharacters(JSON.parse(savedCharacters));
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  }, []);

  // Save changes
  useEffect(() => { localStorage.setItem('veo_account_usage', JSON.stringify(accountUsage)); }, [accountUsage]);
  useEffect(() => { localStorage.setItem('veo_user_profiles', JSON.stringify(userProfiles)); }, [userProfiles]);
  useEffect(() => { localStorage.setItem('veo_active_slot_count', activeSlotCount.toString()); }, [activeSlotCount]);
  useEffect(() => { localStorage.setItem('veo_api_keys', JSON.stringify(apiKeys)); }, [apiKeys]);
  useEffect(() => { if(activeKeyId) localStorage.setItem('veo_active_key_id', activeKeyId); }, [activeKeyId]);
  useEffect(() => { localStorage.setItem('veo_characters', JSON.stringify(characters)); }, [characters]);

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

  // Launch specific prompt from Storyboard
  const handleDirectLaunch = (promptStr: string) => {
    if (!promptStr.trim()) return;
    
    // Add default style/aspect ratio logic if needed, currently raw prompt
    const finalPrompt = constructVeoPrompt({
      prompt: promptStr,
      aspectRatio: '16:9', // Default for storyboard scenes
      style: 'Cinematic' // Default style
    });

    navigator.clipboard.writeText(finalPrompt).then(() => {
       setLastCopied(true);
       setTimeout(() => setLastCopied(false), 3000);
    }).catch(err => console.error('Failed to copy: ', err));

    addToHistory(promptStr, finalPrompt);

    setAccountUsage(prev => ({
        ...prev,
        [currentAccountIndex]: (prev[currentAccountIndex] || 0) + 1
    }));

    openGeminiWeb(currentAccountIndex);
  };

  const handleCopyOnly = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetCurrentAccount = () => {
      setAccountUsage(prev => ({ ...prev, [currentAccountIndex]: 0 }));
  };

  const updateProfile = (index: number, data: Partial<UserProfile>) => {
    setUserProfiles(prev => ({
      ...prev,
      [index]: { ...(prev[index] || { name: `Account ${index + 1}` }), ...data }
    }));
  };

  const updateProfileName = (index: number, name: string) => {
    updateProfile(index, { name });
  };

  const activeApiKeyObj = apiKeys.find(k => k.id === activeKeyId) || null;
  const currentUsage = accountUsage[currentAccountIndex] || 0;
  const isLimitReached = currentUsage >= MAX_DAILY_COUNT;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans">
      <AccountBar 
        currentAccountIndex={currentAccountIndex}
        activeSlotCount={activeSlotCount}
        usageMap={accountUsage}
        userProfiles={userProfiles}
        maxCount={MAX_DAILY_COUNT}
        onAccountSelect={setCurrentAccountIndex}
        onResetCurrent={resetCurrentAccount}
        onUpdateProfileName={updateProfileName}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <AccountSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfiles={userProfiles}
        onUpdateProfile={updateProfile}
        activeSlotCount={activeSlotCount}
        onUpdateSlotCount={setActiveSlotCount}
      />

      <ApiKeyManager
        isOpen={isKeyManagerOpen}
        onClose={() => setIsKeyManagerOpen(false)}
        apiKeys={apiKeys}
        activeKeyId={activeKeyId}
        onAddKey={(k) => {
          setApiKeys(prev => [...prev, k]);
          if (!activeKeyId) setActiveKeyId(k.id);
        }}
        onRemoveKey={(id) => {
          setApiKeys(prev => prev.filter(k => k.id !== id));
          if (activeKeyId === id) setActiveKeyId(null);
        }}
        onSelectKey={setActiveKeyId}
      />

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 mt-6 flex justify-center">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1 shadow-lg">
             <button
               onClick={() => setCurrentView('generator')}
               className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${currentView === 'generator' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
                <Video size={16} /> Storyboard Pro
             </button>
             <button
               onClick={() => setCurrentView('characters')}
               className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${currentView === 'characters' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
                <User size={16} /> Character Studio
             </button>
          </div>
      </nav>

      <main className="container mx-auto px-4 pt-6 flex flex-col items-center">
        
        {currentView === 'characters' ? (
             <div className="w-full max-w-6xl animate-fade-in-up">
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
                 />
             </div>
        ) : (
            <>
                <div className="w-full max-w-7xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 animate-fade-in">
                
                {isLimitReached && (
                    <div className="absolute top-0 left-0 right-0 bg-red-500/10 border-b border-red-500/20 p-2 flex items-center justify-center gap-2 text-red-300 text-xs z-20">
                        <AlertTriangle size={12} />
                        <span>โควต้าบัญชีนี้เต็มแล้ว กรุณาสลับบัญชีด้านบน</span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-emerald-500" />
                        Veo Storyboard Pro
                    </h2>

                    <button 
                        onClick={() => setIsKeyManagerOpen(true)}
                        className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${activeApiKeyObj ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-900/10 text-amber-500 border-amber-500/30 hover:bg-amber-900/20'}`}
                    >
                        <Key size={12} />
                        {activeApiKeyObj ? activeApiKeyObj.name : 'ตั้งค่า API Key'}
                    </button>
                </div>

                <div className="relative z-10">
                    {/* Storyboard Interface is now the ONLY interface */}
                    <PromptBuilder 
                        characters={characters}
                        activeApiKey={activeApiKeyObj}
                        onOpenApiKeyManager={() => setIsKeyManagerOpen(true)}
                        onLaunchScene={handleDirectLaunch}
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
