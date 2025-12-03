import React, { useState, useEffect, useRef } from 'react';
import { Scene, Character, ApiKey, AspectRatio, CustomOption, Project, AccountUsage } from '../types';
import { generateStoryboardFromPlot, generateCreativePrompt } from '../services/geminiService';
import { Film, Sun, Mic2, Wand2, User, Check, RefreshCw, Languages, MessageSquare, Clapperboard, Settings2, Loader2, Sparkles, Plus, Trash2, Copy, MonitorPlay, Zap, X, Play, AlertTriangle } from 'lucide-react';

interface PromptBuilderProps {
  // Now receives the full project object
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  
  characters: Character[];
  activeStoryApiKey: ApiKey | null;
  onOpenApiKeyManager: () => void;
  onGenerateSceneVideo: (prompt: string) => boolean;
  onNavigateToCharacterStudio: () => void;
  customOptions: CustomOption[];
  onAddCustomOption: (option: CustomOption) => void;
  onRemoveCustomOption: (id: string) => void;
  
  // Account Stats for Batch Logic
  accountUsage: AccountUsage;
  activeSlotCount: number;
  maxDailyCount: number;
}

const WEATHERS = ['Sunny (แดดจัด)', 'Cloudy (เมฆมาก)', 'Rainy (ฝนตก)', 'Stormy (พายุ)', 'Snowy (หิมะตก)', 'Foggy (หมอกหนา)', 'Windy (ลมแรง)'];
const ATMOSPHERES = ['Cinematic (ภาพยนตร์)', 'Dreamy (ชวนฝัน)', 'Gloomy (หม่นหมอง)', 'Vibrant (สดใส)', 'Dark/Horror (สยองขวัญ)', 'Romantic (โรแมนติก)', 'Cyberpunk (ไซเบอร์)', 'Retro (ย้อนยุค)'];
const LIGHTINGS = ['Natural (ธรรมชาติ)', 'Golden Hour (แสงทอง)', 'Neon (นีออน)', 'Studio (สตูดิโอ)', 'Low Key (มืดสลัว)', 'Dramatic (ดรามาติก)', 'Soft (นุ่มนวล)'];

const STORY_ATTRIBUTE_KEYS = ['storyDialect', 'storyTone', 'storyStyle', 'environmentElement'];

const DEFAULT_STORY_OPTIONS: { [key: string]: string[] } = {
  storyDialect: ['TH ไทยกลาง', 'TH ภาษาอีสาน', 'TH ภาษาเหนือ (คำเมือง)', 'TH ภาษาใต้', 'TH ราชาศัพท์', 'TH ไทยโบราณ', 'CN จีนคลาสสิก', 'KR เกาหลีโบราณ', 'JP ญี่ปุ่น', 'GB English', 'Old English'],
  storyTone: ['Serious/Dramatic (จริงจัง/ดราม่า)', 'Comedy (ตลก/ขบขัน)', 'Romantic (โรแมนติก)', 'Action/Thriller (แอคชั่น/ระทึกขวัญ)', 'Horror (สยองขวัญ)', 'Mystery (ลึกลับ)', 'Whimsical (เพ้อฝัน)', 'Sarcastic (เสียดสี)'],
  storyStyle: ['Cinematic Movie (ภาพยนตร์)', 'Documentary (สารคดี)', 'Anime Style (อนิเมะ)', 'Music Video (MV)', 'Vlog/Handheld (มือถือ)', 'Noir (ฟิล์มนัวร์)', 'Wes Anderson Style (สมมาตร/พาสเทล)', 'Cyberpunk (ไซเบอร์พังค์)'],
  environmentElement: ['Crowd (ฝูงคน)', 'Rain (ฝน)', 'Fog (หมอก)', 'Neon Lights (ไฟนีออน)', 'Trees (ต้นไม้)', 'Cars (รถยนต์)', 'Animals (สัตว์)', 'Fire (ไฟ)', 'Smoke (ควัน)']
};

const PromptBuilder: React.FC<PromptBuilderProps> = ({ 
  project,
  onUpdateProject,
  characters, 
  activeStoryApiKey,
  onOpenApiKeyManager,
  onGenerateSceneVideo,
  onNavigateToCharacterStudio,
  customOptions,
  onAddCustomOption,
  onRemoveCustomOption,
  accountUsage,
  activeSlotCount,
  maxDailyCount
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Helper to update project settings easier
  const updateSettings = (key: keyof typeof project.settings, value: any) => {
    onUpdateProject({
      settings: { ...project.settings, [key]: value },
      updatedAt: Date.now()
    });
  };

  const cleanVal = (val: string) => val ? val.split('(')[0].trim() : '';

  const getOptions = (key: string) => {
    const defaults = DEFAULT_STORY_OPTIONS[key] || [];
    const customs = customOptions
      .filter(opt => opt.attributeKey === key)
      .map(opt => opt.value);
    return Array.from(new Set([...defaults, ...customs]));
  };
  
  const combinedEnvironmentElements = getOptions('environmentElement');
  const combinedDialects = getOptions('storyDialect');
  const combinedTones = getOptions('storyTone');
  const combinedStyles = getOptions('storyStyle');

  const toggleCharacterSelection = (charId: string) => {
    const currentSelected = project.selectedCharacterIds;
    const newSelected = currentSelected.includes(charId) 
      ? currentSelected.filter(id => id !== charId) 
      : [...currentSelected, charId];
    onUpdateProject({ selectedCharacterIds: newSelected, updatedAt: Date.now() });
  };

  const handleRandomizeSettings = () => {
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    const newSettings = { ...project.settings };
    newSettings.weather = randomItem(WEATHERS);
    newSettings.atmosphere = randomItem(ATMOSPHERES);
    newSettings.lighting = randomItem(LIGHTINGS);
    newSettings.intensity = Math.floor(Math.random() * 100);
    
    if (combinedDialects.length > 0) newSettings.dialect = randomItem(combinedDialects);
    if (combinedTones.length > 0) newSettings.tone = randomItem(combinedTones);
    if (combinedStyles.length > 0) newSettings.style = randomItem(combinedStyles);

    onUpdateProject({ settings: newSettings, updatedAt: Date.now() });

    if (characters.length > 0) {
      const shuffled = [...characters].sort(() => 0.5 - Math.random());
      const numToSelect = Math.floor(Math.random() * Math.min(3, characters.length)) + 1;
      const selectedIds = shuffled.slice(0, numToSelect).map(c => c.id);
      onUpdateProject({ 
        selectedCharacterIds: selectedIds, 
        maxCharactersPerScene: Math.max(1, Math.min(numToSelect, 3)),
        updatedAt: Date.now()
      });
    }
  };

  const handleAiGenerate = async () => {
    if (!activeStoryApiKey?.key) {
      onOpenApiKeyManager();
      alert("กรุณาตั้งค่า API Key สำหรับสร้างเรื่องราว (Story API Key) ก่อนใช้งาน AI Director ครับ");
      return;
    }
    if (!project.plot.trim()) {
      alert("กรุณาใส่เนื้อเรื่องย่อ (Plot) ก่อนครับ");
      return;
    }

    setIsGenerating(true);
    try {
      const moodContext = {
        weather: cleanVal(project.settings.weather),
        atmosphere: cleanVal(project.settings.atmosphere),
        lighting: cleanVal(project.settings.lighting),
        intensity: project.settings.intensity,
        dialect: cleanVal(project.settings.dialect),
        tone: cleanVal(project.settings.tone),
        style: cleanVal(project.settings.style)
      };
      
      const selectedChars = characters.filter(c => project.selectedCharacterIds.includes(c.id));

      const newScenes = await generateStoryboardFromPlot(
        project.plot,
        selectedChars,
        project.maxCharactersPerScene,
        project.numberOfScenes,
        moodContext,
        activeStoryApiKey.key
      ); 
      onUpdateProject({ scenes: newScenes, updatedAt: Date.now() });
    } catch (e: any) {
      alert(e.message || "เกิดข้อผิดพลาดในการสร้างบท");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      characterId: 'none',
      action: '',
      setting: '',
      dialogue: '', 
      environmentElements: [],
      shotType: 'Wide Angle',
      duration: '5s',
      generationStatus: 'idle'
    };
    onUpdateProject({ scenes: [...project.scenes, newScene], updatedAt: Date.now() });
  };

  const handleRemoveScene = (id: string) => {
    onUpdateProject({ scenes: project.scenes.filter(s => s.id !== id), updatedAt: Date.now() });
  };

  const updateScene = (id: string, field: keyof Scene, value: string | string[]) => {
    onUpdateProject({ 
        scenes: project.scenes.map(s => s.id === id ? { ...s, [field]: value } : s),
        updatedAt: Date.now()
    });
  };

  const toggleEnvironmentElement = (sceneId: string, element: string) => {
    onUpdateProject({
        scenes: project.scenes.map(s => {
            if (s.id === sceneId) {
                const currentElements = s.environmentElements || [];
                const newElements = currentElements.includes(element)
                ? currentElements.filter(item => item !== element)
                : [...currentElements, element];
                return { ...s, environmentElements: newElements };
            }
            return s;
        }),
        updatedAt: Date.now()
    });
  };

  const getIntensityDescription = (val: number) => {
    if (val < 30) return 'ปกติ (Normal)';
    if (val < 60) return 'จริงจัง (Serious)';
    if (val < 90) return 'รุนแรง (Intense)';
    return 'เกรี้ยวกราด (Extreme Fury)';
  };

  const constructPrompt = (scene: Scene) => {
    const char = characters.find(c => c.id === scene.characterId);
    let prompt = '';
    
    prompt += `${cleanVal(project.settings.style)}, ${scene.shotType} of `;

    if (char) {
      prompt += `${char.description} `;
    } else {
      prompt += `a character `;
    }

    prompt += `${scene.action} `;

    if (scene.setting) {
      prompt += `in ${scene.setting}`;
      if (scene.environmentElements && scene.environmentElements.length > 0) {
        prompt += ` with ${scene.environmentElements.map(cleanVal).join(', ')}`;
      }
      prompt += `, `;
    } else if (scene.environmentElements && scene.environmentElements.length > 0) {
       prompt += `with ${scene.environmentElements.map(cleanVal).join(', ')}, `;
    }
    
    prompt += `${cleanVal(project.settings.weather)}, ${cleanVal(project.settings.atmosphere)} atmosphere, ${cleanVal(project.settings.lighting)} lighting. `;
    
    if (char) {
        prompt += `Character is showing ${getIntensityDescription(project.settings.intensity).split(' ')[0]}. `; 
    }

    if (scene.dialogue?.trim()) {
      prompt += `Character is speaking with expression matching: "${scene.dialogue.trim()}". `;
    }

    prompt += `highly detailed, 4k, ${cleanVal(project.settings.tone)} tone.`;
    
    return prompt.trim();
  };

  const handleGenerateCreativePrompt = async () => {
    if (!activeStoryApiKey?.key) {
      onOpenApiKeyManager();
      alert("กรุณาตั้งค่า API Key สำหรับสร้างพรอมต์ (Story API Key) ก่อนใช้ AI สร้างพรอมต์");
      return;
    }
    if (!project.plot.trim()) {
      alert("กรุณาใส่ Concept ก่อนครับ");
      return;
    }
    setIsGenerating(true); 
    try {
      const creativePrompt = await generateCreativePrompt(project.plot, activeStoryApiKey.key);
      onUpdateProject({ plot: creativePrompt, updatedAt: Date.now() });
    } catch (e: any) {
      alert(e.message || "เกิดข้อผิดพลาดในการสร้างพรอมต์เชิงสร้างสรรค์");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // --- BATCH GENERATION COMPONENT ---
  const BatchProductionModal = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoRunning, setIsAutoRunning] = useState(false);
    // Use ReturnType<typeof setTimeout> to support both browser and potential Node-like environments
    const autoRunRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Calculate queue logic locally for display
    const queueItems = project.scenes.map((scene, idx) => {
      const prompt = constructPrompt(scene);
      return { scene, prompt, idx };
    });

    const stopAutoRun = () => {
        if (autoRunRef.current) clearTimeout(autoRunRef.current);
        setIsAutoRunning(false);
    };

    const runBatchItem = (index: number) => {
        if (index >= queueItems.length) {
            stopAutoRun();
            return;
        }

        const item = queueItems[index];
        const success = onGenerateSceneVideo(item.prompt);
        
        if (success) {
            updateScene(item.scene.id, 'generationStatus', 'completed');
            
            // If Auto Running, schedule next
            if (isAutoRunning) {
                // If this is the last item, stop
                if (index === queueItems.length - 1) {
                     stopAutoRun();
                } else {
                     setCurrentIndex(index + 1);
                     autoRunRef.current = setTimeout(() => {
                         runBatchItem(index + 1);
                     }, 4000); // 4 seconds delay between windows to be safe
                }
            } else {
                // Manual Mode: Just advance cursor
                if (index < queueItems.length - 1) setCurrentIndex(index + 1);
            }
        } else {
            // Failed (quota full?), stop auto run
            stopAutoRun();
        }
    };

    const startAutoRun = () => {
        setIsAutoRunning(true);
        runBatchItem(currentIndex);
    };

    useEffect(() => {
        return () => stopAutoRun();
    }, []);

    // Filter to only not completed for initial view? No, show all for overview.

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="text-emerald-500 fill-emerald-500" /> Auto-Production Queue
                        </h2>
                        <p className="text-slate-400 text-sm">Automate the opening of Gemini windows for each scene.</p>
                    </div>
                    <button onClick={() => setShowBatchModal(false)} className="text-slate-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="flex gap-4 mb-4 bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-xl items-center">
                         <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400">
                             <Play size={24} fill="currentColor" />
                         </div>
                         <div className="flex-1">
                             <h3 className="font-bold text-emerald-100">Batch Control</h3>
                             <p className="text-xs text-emerald-200/70">
                                 {isAutoRunning 
                                    ? `Running sequence... Please wait 4s between windows.` 
                                    : `Click Start to automatically copy prompts and open windows sequentially.`}
                             </p>
                         </div>
                         {!isAutoRunning ? (
                             <button 
                                onClick={startAutoRun}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all hover:scale-105"
                             >
                                 Start Auto-Sequence
                             </button>
                         ) : (
                             <button 
                                onClick={stopAutoRun}
                                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 flex items-center gap-2 animate-pulse"
                             >
                                 Stop Sequence
                             </button>
                         )}
                    </div>

                    <div className="space-y-2">
                        {queueItems.map((item, i) => {
                            const isCurrent = i === currentIndex;
                            const isCompleted = item.scene.generationStatus === 'completed';
                            
                            return (
                                <div 
                                    key={item.scene.id} 
                                    className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                                        isCurrent 
                                            ? 'bg-emerald-900/20 border-emerald-500/50 shadow-md transform scale-[1.01]' 
                                            : isCompleted
                                                ? 'bg-slate-950/50 border-slate-800 opacity-70'
                                                : 'bg-slate-900 border-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-white text-emerald-600' : 'bg-slate-800 text-slate-500'}`}>
                                            {isCompleted ? <Check size={14} /> : i + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-medium truncate ${isCurrent ? 'text-white' : 'text-slate-400'}`}>Scene {i+1}: {item.scene.action}</p>
                                            <p className="text-xs text-slate-600 truncate">{item.prompt}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {isCurrent && isAutoRunning && <Loader2 size={16} className="text-emerald-500 animate-spin" />}
                                        <button 
                                            onClick={() => {
                                                setCurrentIndex(i);
                                                runBatchItem(i);
                                            }}
                                            disabled={isAutoRunning && !isCurrent}
                                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                                                isCompleted 
                                                ? 'bg-slate-800 text-emerald-500' 
                                                : 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300'
                                            }`}
                                        >
                                            {isCompleted ? 'Re-Run' : 'Launch'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {showBatchModal && <BatchProductionModal />}

      {/* Left Column: Story Setup */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
             <div>
                <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                    <Film size={16} /> Story Setup
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Project: <span className="text-white font-bold">{project.name}</span></p>
             </div>
             <button 
                onClick={handleRandomizeSettings}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
             >
                <RefreshCw size={12} /> สุ่ม
             </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">พล็อตเรื่อง / เรื่องย่อ</label>
              <textarea 
                value={project.plot}
                onChange={e => onUpdateProject({ plot: e.target.value, updatedAt: Date.now() })}
                placeholder="เช่น แมวนักบินอวกาศกำลังซ่อมยานแล้วเจอเอเลี่ยนมอบดอกไม้ให้..."
                className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            <button
              onClick={handleGenerateCreativePrompt}
              disabled={isGenerating || !activeStoryApiKey?.key || !project.plot.trim()}
              className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeStoryApiKey?.key && project.plot.trim()
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Wand2 size={14} /> {isGenerating ? 'สร้างพรอมต์...' : 'ใช้ AI สร้างพรอมต์'}
            </button>

            {/* Character Selection */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <User size={12}/> เลือกตัวละครสำหรับบท
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {characters.length === 0 && (
                  <p className="text-slate-600 text-xs italic">
                    ยังไม่มีตัวละคร 
                    <button onClick={onNavigateToCharacterStudio} className="text-emerald-400 hover:underline ml-1">ไปสร้าง</button>
                  </p>
                )}
                {characters.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => toggleCharacterSelection(c.id)}
                    className={`text-xs bg-slate-950 p-2 rounded border transition-all cursor-pointer flex justify-between items-center ${
                      project.selectedCharacterIds.includes(c.id) 
                      ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' 
                      : 'border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="font-bold">{c.name}</span>
                    {project.selectedCharacterIds.includes(c.id) && <Check size={14} className="text-emerald-400"/>}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">ตัวละครสูงสุดต่อฉาก</label>
                  <input
                    type="number" min="1" max={Math.min(project.selectedCharacterIds.length || 1, 3)}
                    value={project.maxCharactersPerScene}
                    onChange={e => onUpdateProject({ maxCharactersPerScene: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                    disabled={project.selectedCharacterIds.length === 0}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">จำนวนฉากที่ต้องการ</label>
                  <input
                    type="number" min="1" max="10"
                    value={project.numberOfScenes}
                    onChange={e => onUpdateProject({ numberOfScenes: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Global Moods (Persisted in Project) */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-3">
               <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Sun size={12}/> บรรยากาศ (Global)</h4>
               
               <div className="grid grid-cols-2 gap-2">
                   <div className="col-span-2">
                       <label className="text-[10px] text-slate-500 block mb-1">Aspect Ratio</label>
                       <select value={project.settings.aspectRatio} onChange={e => updateSettings('aspectRatio', e.target.value)} className="w-full bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold rounded text-xs p-1.5 outline-none">
                           <option value="16:9">16:9 (แนวนอน)</option>
                           <option value="9:16">9:16 (แนวตั้ง)</option>
                       </select>
                   </div>
                   <div>
                       <label className="text-[10px] text-slate-500 block mb-1">สภาพอากาศ</label>
                       <select value={project.settings.weather} onChange={e => updateSettings('weather', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none">
                           {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
                       </select>
                   </div>
                   <div>
                       <label className="text-[10px] text-slate-500 block mb-1">แสง</label>
                       <select value={project.settings.lighting} onChange={e => updateSettings('lighting', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none">
                           {LIGHTINGS.map(l => <option key={l} value={l}>{l}</option>)}
                       </select>
                   </div>
                   <div className="col-span-2">
                       <label className="text-[10px] text-slate-500 block mb-1">บรรยากาศ</label>
                       <select value={project.settings.atmosphere} onChange={e => updateSettings('atmosphere', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none">
                           {ATMOSPHERES.map(a => <option key={a} value={a}>{a}</option>)}
                       </select>
                   </div>
               </div>

               <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Mic2 size={10}/> ความเข้มข้นอารมณ์</span>
                        <span>{project.settings.intensity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={project.settings.intensity} onChange={e => updateSettings('intensity', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)` }} />
               </div>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-3">
               <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Settings2 size={12}/> รายละเอียดการเล่าเรื่อง</h4>
               <div>
                   <label className="text-[10px] text-slate-500 block mb-1">ภาษา/สำเนียง</label>
                   <select value={project.settings.dialect} onChange={e => updateSettings('dialect', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none">
                       {combinedDialects.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
               </div>
               <div>
                   <label className="text-[10px] text-slate-500 block mb-1">น้ำเสียงการเล่า</label>
                   <select value={project.settings.tone} onChange={e => updateSettings('tone', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none">
                       {combinedTones.map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
               </div>
               <div>
                   <label className="text-[10px] text-slate-500 block mb-1">สไตล์การกำกับ</label>
                   <select value={project.settings.style} onChange={e => updateSettings('style', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none">
                       {combinedStyles.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
               </div>
            </div>
            
            <button 
                onClick={handleAiGenerate}
                disabled={isGenerating || !activeStoryApiKey?.key}
                className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${
                    isGenerating || !activeStoryApiKey?.key
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/20'
                }`}
            >
                {isGenerating ? (<><Loader2 size={18} className="animate-spin"/> AI กำลังเขียนบท...</>) : (<><Sparkles size={18}/> ใช้ AI สร้างบท</>)}
            </button>
          </div>
        </div>
      </div>
      
      {/* Right Column: Scene List */}
      <div className="w-full lg:w-2/3 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
             <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MonitorPlay className="text-emerald-500" /> Storyboard Scenes
                </h3>
             </div>
             <div className="flex gap-2">
                 {/* BATCH BUTTON */}
                 {project.scenes.length > 0 && (
                     <button 
                        onClick={() => setShowBatchModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 hover:scale-105"
                     >
                        <Zap size={14} fill="currentColor" /> Auto-Production Queue
                     </button>
                 )}
                 <button onClick={handleAddScene} className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
                    <Plus size={14} /> เพิ่มฉากเอง
                 </button>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[500px]">
             {project.scenes.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                    <Film size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium">ยังไม่มีฉากในโปรเจคนี้</p>
                    <p className="text-sm">สร้างพล็อตเรื่องทางซ้ายแล้วกดปุ่ม "ใช้ AI สร้างบท"</p>
                </div>
             )}
             {project.scenes.map((scene, index) => (
                <div key={scene.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-emerald-500/30 transition-all group">
                    {/* ... (Existing Scene Card UI, but using updateScene) ... */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <span className="bg-slate-800 text-slate-300 font-mono font-bold px-2 py-1 rounded text-xs">SCENE {index + 1}</span>
                            <span className="text-slate-500 text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{scene.duration}</span>
                             <span className="text-emerald-500 text-xs bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50">{scene.shotType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             {/* Quick Status Toggle */}
                             <button 
                                onClick={() => updateScene(scene.id, 'generationStatus', scene.generationStatus === 'completed' ? 'idle' : 'completed')}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${scene.generationStatus === 'completed' ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500' : 'bg-slate-950 text-slate-500 border-slate-800'}`}
                             >
                                 {scene.generationStatus === 'completed' ? 'Done' : 'Pending'}
                             </button>
                            <button onClick={() => handleRemoveScene(scene.id)} className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">การกระทำ (Action)</label>
                                <textarea value={scene.action} onChange={e => updateScene(scene.id, 'action', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 h-16 resize-none focus:border-emerald-500 outline-none"/>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">สถานที่ (Setting)</label>
                                <input type="text" value={scene.setting} onChange={e => updateScene(scene.id, 'setting', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-emerald-500 outline-none"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">บทพูด (Dialogue)</label>
                                <textarea value={scene.dialogue} onChange={e => updateScene(scene.id, 'dialogue', e.target.value)} placeholder="(ไม่มีบทพูด)" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-300 h-16 resize-none focus:border-emerald-500 outline-none italic"/>
                            </div>
                             <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">องค์ประกอบเสริม</label>
                                <div className="flex flex-wrap gap-1">
                                    {combinedEnvironmentElements.map(elem => (
                                        <button key={elem} onClick={() => toggleEnvironmentElement(scene.id, elem)} className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${scene.environmentElements?.includes(elem) ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                                            {cleanVal(elem)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-3 border-t border-slate-800">
                         <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 bg-slate-950 p-2 rounded text-[10px] text-slate-500 font-mono truncate border border-slate-800">{constructPrompt(scene)}</div>
                            <button onClick={() => navigator.clipboard.writeText(constructPrompt(scene))} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors" title="Copy Prompt">
                                <Copy size={14} />
                            </button>
                             <button 
                                onClick={() => {
                                    const success = onGenerateSceneVideo(constructPrompt(scene));
                                    if (success) updateScene(scene.id, 'generationStatus', 'completed');
                                }} 
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-2 shadow-lg shadow-emerald-900/20 whitespace-nowrap"
                            >
                                <MonitorPlay size={14} /> สร้างวิดีโอ (Veo)
                            </button>
                         </div>
                    </div>
                </div>
             ))}
          </div>
      </div>
    </div>
  );
};

export default PromptBuilder;