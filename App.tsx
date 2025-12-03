
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { fetchProjects, fetchCharacters, fetchAnnouncements, saveProject, deleteProjectDb } from './services/db';
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
import AdminPanel from './components/AdminPanel';
import { constructVeoPrompt, openGeminiWeb } from './services/geminiService';
import { HistoryItem, AccountUsage, UserProfile, ApiKey, CustomOption, Character, Scene, VideoMetadata, Project, Announcement } from './types';
import { Sparkles, Video, User, Settings, AlertTriangle, Loader2, Clapperboard, Share2, LayoutGrid, ChevronRight, Shield, AlertCircle, DollarSign, LogOut, XCircle, CheckCircle } from 'lucide-react';

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

type View = 'dashboard' | 'generator' | 'characters' | 'settings' | 'production' | 'upload' | 'admin';

const MainApp: React.FC = () => {
  const { appUser, currentUser, logout, isDemoMode } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Local State (Settings that stay local for now)
  const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(0);
  const [activeSlotCount, setActiveSlotCount] = useState<number>(2);
  const [accountUsage, setAccountUsage] = useState<AccountUsage>({});
  const [userProfiles, setUserProfiles] = useState<Record<number, UserProfile>>({});
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeStoryApiKeyId, setActiveStoryApiKeyId] = useState<string | null>(null);
  const [activeCharacterApiKeyId, setActiveCharacterApiKeyId] = useState<string | null>(null);
  const [activeProductionApiKeyId, setActiveProductionApiKeyId] = useState<string | null>(null);
  const [activeFalApiKeyId, setActiveFalApiKeyId] = useState<string | null>(null);
  const [activeUploadPostApiKeyId, setActiveUploadPostApiKeyId] = useState<string | null>(null);
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const MAX_DAILY_COUNT = 2; 

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    const loadUserData = async () => {
        if (currentUser) {
            // Load from DB
            const userProjects = await fetchProjects(currentUser.uid);
            setProjects(userProjects);
            const userChars = await fetchCharacters(currentUser.uid);
            setCharacters(userChars);
            
            // Load Global Announcements
            const anns = await fetchAnnouncements();
            setAnnouncements(anns.filter(a => a.isActive));
        }
    };
    loadUserData();
  }, [currentUser]);

  // Load Local Settings
  useEffect(() => {
      const savedUsage = localStorage.getItem('veo_account_usage');
      const savedProfiles = localStorage.getItem('veo_user_profiles');
      const savedSlotCount = localStorage.getItem('veo_active_slot_count');
      const savedApiKeys = localStorage.getItem('veo_api_keys');
      const savedCustomOptions = localStorage.getItem('veo_custom_options');
      
      if (savedUsage) setAccountUsage(JSON.parse(savedUsage));
      if (savedProfiles) setUserProfiles(JSON.parse(savedProfiles));
      if (savedSlotCount) setActiveSlotCount(parseInt(savedSlotCount, 10));
      if (savedApiKeys) setApiKeys(JSON.parse(savedApiKeys));
      
      // Load Key IDs
      setActiveStoryApiKeyId(localStorage.getItem('veo_active_story_key_id'));
      setActiveCharacterApiKeyId(localStorage.getItem('veo_active_character_key_id'));
      setActiveProductionApiKeyId(localStorage.getItem('veo_active_production_key_id'));
      setActiveFalApiKeyId(localStorage.getItem('veo_active_fal_key_id'));
      setActiveUploadPostApiKeyId(localStorage.getItem('veo_active_upload_post_key_id'));

      if (savedCustomOptions) {
        try {
          const parsed = JSON.parse(savedCustomOptions);
          setCustomOptions(parsed.length > 0 ? parsed : DEFAULT_CUSTOM_OPTIONS_DATA);
        } catch { setCustomOptions(DEFAULT_CUSTOM_OPTIONS_DATA); }
      } else { setCustomOptions(DEFAULT_CUSTOM_OPTIONS_DATA); }
  }, []);

  // Sync Local Changes
  useEffect(() => { localStorage.setItem('veo_account_usage', JSON.stringify(accountUsage)); }, [accountUsage]);
  useEffect(() => { localStorage.setItem('veo_user_profiles', JSON.stringify(userProfiles)); }, [userProfiles]);
  useEffect(() => { localStorage.setItem('veo_api_keys', JSON.stringify(apiKeys)); }, [apiKeys]);
  useEffect(() => { if(activeStoryApiKeyId) localStorage.setItem('veo_active_story_key_id', activeStoryApiKeyId); }, [activeStoryApiKeyId]);
  useEffect(() => { if(activeCharacterApiKeyId) localStorage.setItem('veo_active_character_key_id', activeCharacterApiKeyId); }, [activeCharacterApiKeyId]);
  useEffect(() => { if(activeProductionApiKeyId) localStorage.setItem('veo_active_production_key_id', activeProductionApiKeyId); }, [activeProductionApiKeyId]);
  useEffect(() => { if(activeFalApiKeyId) localStorage.setItem('veo_active_fal_key_id', activeFalApiKeyId); }, [activeFalApiKeyId]);
  useEffect(() => { if(activeUploadPostApiKeyId) localStorage.setItem('veo_active_upload_post_key_id', activeUploadPostApiKeyId); }, [activeUploadPostApiKeyId]);
  useEffect(() => { localStorage.setItem('veo_custom_options', JSON.stringify(customOptions)); }, [customOptions]);

  // Sync Projects/Chars to DB is handled in specific actions below

  const createNewProject = async (name: string, category: string) => {
    if (!currentUser) return;
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: currentUser.uid,
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
    
    // Save to DB
    await saveProject(newProject);
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setCurrentView('generator');
  };

  const updateActiveProject = async (updates: Partial<Project>) => {
    if (!activeProjectId || !currentUser) return;
    const project = projects.find(p => p.id === activeProjectId);
    if (!project) return;
    const updatedProject = { ...project, ...updates };
    
    // Optimistic Update
    setProjects(prev => prev.map(p => p.id === activeProjectId ? updatedProject : p));
    // DB Save
    await saveProject(updatedProject);
  };

  const deleteProject = async (id: string) => {
    await deleteProjectDb(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setCurrentView('dashboard');
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const handleGenerateSceneVideo = (prompt: string): boolean => {
    // ... existing logic ...
    const availableAccounts: number[] = [];
    for (let i = 0; i < activeSlotCount; i++) {
      if ((accountUsage[i] || 0) < MAX_DAILY_COUNT) {
        availableAccounts.push(i);
      }
    }
    if (availableAccounts.length > 0) {
      let nextAccountIndex = currentAccountIndex;
      if (!availableAccounts.includes(currentAccountIndex)) {
          const randomIndex = Math.floor(Math.random() * availableAccounts.length);
          nextAccountIndex = availableAccounts[randomIndex];
      }
      setCurrentAccountIndex(nextAccountIndex);
      setAccountUsage(prev => ({ ...prev, [nextAccountIndex]: (prev[nextAccountIndex] || 0) + 1 }));
      const config = { prompt: prompt, aspectRatio: activeProject?.settings.aspectRatio || '16:9' };
      const finalPrompt = constructVeoPrompt(config);
      navigator.clipboard.writeText(finalPrompt).catch(() => {});
      openGeminiWeb(nextAccountIndex); 
      // setHistory
      return true;
    } else {
      alert("Quota Full!");
      return false;
    }
  };

  // --- ACCESS CONTROL ---
  if (appUser?.isBanned) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
              <XCircle className="text-red-500 mb-4" size={64}/>
              <h1 className="text-3xl font-bold text-white mb-2">บัญชีถูกระงับ (Account Banned)</h1>
              <p className="text-slate-400 mb-6">บัญชีของคุณถูกระงับการใช้งานเนื่องจากละเมิดข้อตกลง</p>
              <button onClick={() => logout()} className="bg-slate-800 text-white px-4 py-2 rounded-lg">ออกจากระบบ</button>
          </div>
      );
  }

  // Subscription Gate (Allow access to Settings/Payment but block Generator)
  const isSubscribed = appUser?.subscriptionStatus === 'active';
  const showPaymentWall = !isSubscribed && (currentView === 'generator' || currentView === 'characters' || currentView === 'production' || currentView === 'upload');

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans">
       {/* Top Bar */}
       <div className="w-full bg-slate-900 border-b border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-2">
                <div className="bg-emerald-600 p-2 rounded-lg">
                    <span className="font-bold text-xl text-white tracking-tight">Veo Studio</span>
                </div>
                {isDemoMode && <span className="bg-amber-900/50 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/50">DEMO MODE</span>}
                {appUser?.role === 'admin' && <span className="bg-purple-900/50 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-500/50 font-bold uppercase">ADMIN</span>}
            </div>

            <div className="flex items-center gap-4">
                {/* Subscription Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isSubscribed ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                    {isSubscribed ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span className="text-xs font-bold uppercase">{isSubscribed ? 'Premium' : 'Unpaid'}</span>
                </div>

                <div className="flex items-center gap-3">
                   <div className="text-right hidden sm:block">
                       <p className="text-sm font-bold text-white">{appUser?.email}</p>
                       <p className="text-[10px] text-slate-500 uppercase">{appUser?.role}</p>
                   </div>
                   <button onClick={() => logout()} className="p-2 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-colors" title="Logout">
                       <LogOut size={16} />
                   </button>
                </div>
            </div>
       </div>

       {/* Navigation */}
       <nav className="container mx-auto px-4 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
             <button onClick={() => { setActiveProjectId(null); setCurrentView('dashboard'); }} className="text-slate-400 hover:text-white flex items-center gap-1 font-bold text-sm">
                 <LayoutGrid size={16}/> Dashboard
             </button>
             {activeProject && (
                 <>
                    <ChevronRight size={16} className="text-slate-600"/>
                    <span className="text-emerald-400 font-bold text-sm flex items-center gap-2"><Video size={16}/> {activeProject.name}</span>
                 </>
             )}
          </div>
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1 shadow-lg overflow-x-auto">
             {appUser?.role === 'admin' && (
                 <button onClick={() => setCurrentView('admin')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${currentView === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Shield size={16}/> Admin
                 </button>
             )}
             <button onClick={() => setCurrentView('settings')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${currentView === 'settings' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Settings size={16}/> Settings
             </button>
             {activeProject && (
                 <>
                    <button onClick={() => setCurrentView('characters')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${currentView === 'characters' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        <User size={16}/> Characters
                    </button>
                    <button onClick={() => setCurrentView('generator')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${currentView === 'generator' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        <Video size={16}/> Storyboard
                    </button>
                    <button onClick={() => setCurrentView('production')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${currentView === 'production' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        <Clapperboard size={16}/> Production
                    </button>
                    <button onClick={() => setCurrentView('upload')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${currentView === 'upload' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        <Share2 size={16}/> Upload
                    </button>
                 </>
             )}
          </div>
       </nav>

       <main className="container mx-auto px-4 pt-6">
           
           {/* Announcement Banner */}
           {!showPaymentWall && announcements.length > 0 && currentView === 'dashboard' && (
               <div className="mb-6 space-y-2">
                   {announcements.map(ann => (
                       <div key={ann.id} className={`p-4 rounded-xl border flex items-start gap-3 ${
                           ann.type === 'info' ? 'bg-blue-900/20 border-blue-500/30 text-blue-100' :
                           ann.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-100' :
                           ann.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-100' :
                           'bg-red-900/20 border-red-500/30 text-red-100'
                       }`}>
                           <AlertCircle size={20} className="shrink-0 mt-0.5" />
                           <div>
                               <h4 className="font-bold">{ann.title}</h4>
                               <p className="text-sm opacity-90">{ann.content}</p>
                           </div>
                       </div>
                   ))}
               </div>
           )}

           {/* Payment Wall */}
           {showPaymentWall ? (
               <div className="max-w-2xl mx-auto bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl mt-10">
                   <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
                       <DollarSign size={32} />
                   </div>
                   <h2 className="text-2xl font-bold text-white mb-2">Subscription Required</h2>
                   <p className="text-slate-400 mb-6">
                       ฟีเจอร์นี้สำหรับสมาชิก Premium เท่านั้น <br/>
                       กรุณาชำระค่าบริการ 50 บาท/เดือน เพื่อปลดล็อกการใช้งาน
                   </p>
                   <div className="bg-white p-4 rounded-lg w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                       {/* Mock QR */}
                       <div className="w-full h-full border-4 border-black flex items-center justify-center text-black font-bold text-xs text-center">
                           [MOCK QR CODE]<br/>PromptPay: 50 THB
                       </div>
                   </div>
                   <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold w-full hover:bg-emerald-500 transition-colors">
                       แจ้งชำระเงิน (Inform Payment)
                   </button>
                   <p className="text-xs text-slate-500 mt-4">*ระบบจะแจ้งเตือนแอดมินเพื่อตรวจสอบ เมื่ออนุมัติแล้วคุณจะใช้งานได้ทันที</p>
               </div>
           ) : (
               <>
                {currentView === 'admin' && appUser?.role === 'admin' && <AdminPanel />}
                {currentView === 'dashboard' && <ProjectDashboard projects={projects} onCreateProject={createNewProject} onSelectProject={(id) => { setActiveProjectId(id); setCurrentView('generator'); }} onDeleteProject={deleteProject} />}
                {currentView === 'settings' && <GlobalSettings 
                    userProfiles={userProfiles} onUpdateProfile={(i,d) => setUserProfiles(p => ({...p, [i]: {...(p[i]||{}), ...d}}))}
                    activeSlotCount={activeSlotCount} onUpdateSlotCount={setActiveSlotCount}
                    apiKeys={apiKeys} onAddKey={k => setApiKeys(p=>[...p,k])} onRemoveKey={id => setApiKeys(p => p.filter(k=>k.id!==id))} onUpdateKey={(id,u) => setApiKeys(p => p.map(k=>k.id===id?{...k,...u}:k))}
                    activeStoryApiKeyId={activeStoryApiKeyId} onSelectStoryKey={setActiveStoryApiKeyId}
                    activeCharacterApiKeyId={activeCharacterApiKeyId} onSelectCharacterKey={setActiveCharacterApiKeyId}
                    activeProductionApiKeyId={activeProductionApiKeyId} onSelectProductionKey={setActiveProductionApiKeyId}
                    activeFalApiKeyId={activeFalApiKeyId} onSelectFalKey={setActiveFalApiKeyId}
                    activeUploadPostApiKeyId={activeUploadPostApiKeyId} onSelectUploadPostKey={setActiveUploadPostApiKeyId}
                />}
                {activeProject && currentView === 'characters' && (
                    <CharacterStudio characters={characters} onSaveCharacter={async (c) => { 
                        await import('./services/db').then(m => m.saveCharacterDb(currentUser!.uid, c));
                        setCharacters(p => { const x = p.findIndex(o=>o.id===c.id); if(x>=0){const n=[...p];n[x]=c;return n;} return [...p,c]; });
                    }} onDeleteCharacter={async (id) => {
                        await import('./services/db').then(m => m.deleteCharacterDb(currentUser!.uid, id));
                        setCharacters(p => p.filter(c=>c.id!==id));
                    }} onBack={() => setCurrentView('generator')} customOptions={customOptions} onAddCustomOption={o => setCustomOptions(p=>[...p,o])} onRemoveCustomOption={id => setCustomOptions(p=>p.filter(o=>o.id!==id))} activeCharacterApiKey={apiKeys.find(k=>k.id===activeCharacterApiKeyId)||null} onOpenApiKeyManager={() => setCurrentView('settings')} />
                )}
                {activeProject && currentView === 'generator' && (
                    <PromptBuilder project={activeProject} onUpdateProject={updateActiveProject} characters={characters} activeStoryApiKey={apiKeys.find(k=>k.id===activeStoryApiKeyId)||null} onOpenApiKeyManager={()=>setCurrentView('settings')} onGenerateSceneVideo={handleGenerateSceneVideo} onNavigateToCharacterStudio={()=>setCurrentView('characters')} customOptions={customOptions} onAddCustomOption={o=>setCustomOptions(p=>[...p,o])} onRemoveCustomOption={id=>setCustomOptions(p=>p.filter(o=>o.id!==id))} accountUsage={accountUsage} activeSlotCount={activeSlotCount} maxDailyCount={MAX_DAILY_COUNT} />
                )}
                {activeProject && currentView === 'production' && (
                    <Production project={activeProject} onUpdateProject={updateActiveProject} activeProductionApiKey={apiKeys.find(k=>k.id===activeProductionApiKeyId)||null} activeFalApiKey={apiKeys.find(k=>k.id===activeFalApiKeyId)||null} onOpenApiKeyManager={()=>setCurrentView('settings')} onProceedToUpload={()=>setCurrentView('upload')} />
                )}
                {activeProject && currentView === 'upload' && (
                    <SocialUpload project={activeProject} activeUploadPostApiKey={apiKeys.find(k=>k.id===activeUploadPostApiKeyId)||null} onOpenApiKeyManager={()=>setCurrentView('settings')} />
                )}
               </>
           )}
       </main>
    </div>
  );
};

// Wrapper
const App: React.FC = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  
  // This wrapper handles the initial loading state of AuthProvider
  const Content = () => {
    const { loading, currentUser } = useAuth();
    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={48}/></div>;
    if (!currentUser) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            {showSignup 
                ? <SignupScreen onSignup={(u,p) => import('./contexts/AuthContext').then(m => {/* handled inside hook */})} onSwitchToSignup={() => setShowSignup(false)} />
                : <LoginScreen onLogin={(u,p) => {/* handled inside hook */}} onSwitchToSignup={() => setShowSignup(true)} />
            }
        </div>;
    }
    return <MainApp />;
  };

  return (
    <AuthProvider>
       <Content />
    </AuthProvider>
  );
};

export default App;
