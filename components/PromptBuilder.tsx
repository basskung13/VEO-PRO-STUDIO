import React, { useState } from 'react';
import { Scene, Character, ApiKey, AspectRatio, CustomOption } from '../types';
import { generateStoryboardFromPlot, generateCreativePrompt, handleAistudioApiKeySelection } from '../services/geminiService';
// Fix: Added User and Check icons to the import statement.
import { Film, Sun, Mic2, Wand2, AlertCircle, Video, Plus, Trash2, Copy, MonitorPlay, Key, Link, User, Check, RefreshCw, Languages, MessageSquare, Clapperboard, Settings2, Filter, Loader2, Sparkles } from 'lucide-react'; // Added Link icon for billing

interface PromptBuilderProps {
  // New props for state management lifted to App.tsx
  plot: string;
  setPlot: (plot: string) => void;
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  
  characters: Character[];
  activeStoryApiKey: ApiKey | null;
  onOpenApiKeyManager: () => void;
  onGenerateSceneVideo: (prompt: string) => void; // Renamed from onLaunchScene
  onNavigateToCharacterStudio: () => void;
  // New props for storyboard generation control
  selectedCharactersForStoryboard: string[]; // Character IDs
  onSelectCharactersForStoryboard: (ids: string[]) => void;
  maxCharactersPerScene: number;
  onSetMaxCharactersPerScene: (count: number) => void;
  numberOfScenes: number;
  onSetNumberOfScenes: (count: number) => void;
  customOptions: CustomOption[]; // For environment elements
  onAddCustomOption: (option: CustomOption) => void;
  onRemoveCustomOption: (id: string) => void;
}

const WEATHERS = ['Sunny (แดดจัด)', 'Cloudy (เมฆมาก)', 'Rainy (ฝนตก)', 'Stormy (พายุ)', 'Snowy (หิมะตก)', 'Foggy (หมอกหนา)', 'Windy (ลมแรง)'];
const ATMOSPHERES = ['Cinematic (ภาพยนตร์)', 'Dreamy (ชวนฝัน)', 'Gloomy (หม่นหมอง)', 'Vibrant (สดใส)', 'Dark/Horror (สยองขวัญ)', 'Romantic (โรแมนติก)', 'Cyberpunk (ไซเบอร์)', 'Retro (ย้อนยุค)'];
const LIGHTINGS = ['Natural (ธรรมชาติ)', 'Golden Hour (แสงทอง)', 'Neon (นีออน)', 'Studio (สตูดิโอ)', 'Low Key (มืดสลัว)', 'Dramatic (ดรามาติก)', 'Soft (นุ่มนวล)'];

// Map of attribute keys to their Thai display names for custom option categories in Storyboard
const STORY_ATTRIBUTE_CATEGORIES_MAP: { [key: string]: string } = {
  storyDialect: 'ภาษา/สำเนียง (Dialect)',
  storyTone: 'น้ำเสียงการเล่า (Story Tone)',
  storyStyle: 'สไตล์การกำกับ (Directing Style)',
  environmentElement: 'องค์ประกอบสภาพแวดล้อม (Environment Element)'
};

const STORY_ATTRIBUTE_KEYS = ['storyDialect', 'storyTone', 'storyStyle', 'environmentElement'];

// DEFAULT OPTIONS for Storyboard to ensure dropdowns are not empty
const DEFAULT_STORY_OPTIONS: { [key: string]: string[] } = {
  storyDialect: ['TH ไทยกลาง', 'TH ภาษาอีสาน', 'TH ภาษาเหนือ (คำเมือง)', 'TH ภาษาใต้', 'TH ราชาศัพท์', 'TH ไทยโบราณ', 'CN จีนคลาสสิก', 'KR เกาหลีโบราณ', 'JP ญี่ปุ่น', 'GB English', 'Old English'],
  storyTone: ['Serious/Dramatic (จริงจัง/ดราม่า)', 'Comedy (ตลก/ขบขัน)', 'Romantic (โรแมนติก)', 'Action/Thriller (แอคชั่น/ระทึกขวัญ)', 'Horror (สยองขวัญ)', 'Mystery (ลึกลับ)', 'Whimsical (เพ้อฝัน)', 'Sarcastic (เสียดสี)'],
  storyStyle: ['Cinematic Movie (ภาพยนตร์)', 'Documentary (สารคดี)', 'Anime Style (อนิเมะ)', 'Music Video (MV)', 'Vlog/Handheld (มือถือ)', 'Noir (ฟิล์มนัวร์)', 'Wes Anderson Style (สมมาตร/พาสเทล)', 'Cyberpunk (ไซเบอร์พังค์)'],
  environmentElement: ['Crowd (ฝูงคน)', 'Rain (ฝน)', 'Fog (หมอก)', 'Neon Lights (ไฟนีออน)', 'Trees (ต้นไม้)', 'Cars (รถยนต์)', 'Animals (สัตว์)', 'Fire (ไฟ)', 'Smoke (ควัน)']
};

const PromptBuilder: React.FC<PromptBuilderProps> = ({ 
  plot,
  setPlot,
  scenes,
  setScenes,
  characters, 
  activeStoryApiKey,
  onOpenApiKeyManager,
  onGenerateSceneVideo, // Renamed prop
  onNavigateToCharacterStudio,
  selectedCharactersForStoryboard,
  onSelectCharactersForStoryboard,
  maxCharactersPerScene,
  onSetMaxCharactersPerScene,
  numberOfScenes,
  onSetNumberOfScenes,
  customOptions, // Destructure customOptions
  onAddCustomOption,
  onRemoveCustomOption
}) => {
  // Local state for generating status
  const [isGenerating, setIsGenerating] = useState(false);

  // Global Settings
  const [weather, setWeather] = useState('Sunny (แดดจัด)');
  const [atmosphere, setAtmosphere] = useState('Cinematic (ภาพยนตร์)');
  const [lighting, setLighting] = useState('Natural (ธรรมชาติ)');
  const [intensity, setIntensity] = useState(30);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  // NEW: Detailed Story Settings
  const [dialect, setDialect] = useState('TH ไทยกลาง');
  const [storyTone, setStoryTone] = useState('Serious/Dramatic (จริงจัง/ดราม่า)');
  const [storyStyle, setStoryStyle] = useState('Cinematic Movie (ภาพยนตร์)');

  // Custom Option Management State
  const [newCustomOptionValue, setNewCustomOptionValue] = useState('');
  const [selectedManageCategory, setSelectedManageCategory] = useState<string>(STORY_ATTRIBUTE_KEYS[0]);


  const cleanVal = (val: string) => val.split('(')[0].trim();

  // Helper to get options from customOptions prop based on attribute key
  const getOptions = (key: string) => {
    const defaults = DEFAULT_STORY_OPTIONS[key] || [];
    const customs = customOptions
      .filter(opt => opt.attributeKey === key)
      .map(opt => opt.value);
    // Merge and unique
    return Array.from(new Set([...defaults, ...customs]));
  };
  
  const combinedEnvironmentElements = getOptions('environmentElement');
  const combinedDialects = getOptions('storyDialect');
  const combinedTones = getOptions('storyTone');
  const combinedStyles = getOptions('storyStyle');

  // Fix: Adjusted `toggleCharacterSelection` to pass the new array directly, aligning with `onSelectCharactersForStoryboard` prop type.
  // Helper to toggle selected characters for storyboard
  const toggleCharacterSelection = (charId: string) => {
    const currentSelected = selectedCharactersForStoryboard;
    const newSelected = currentSelected.includes(charId) 
      ? currentSelected.filter(id => id !== charId) 
      : [...currentSelected, charId];
    onSelectCharactersForStoryboard(newSelected);
  };

  // NEW: Randomize Settings Function
  const handleRandomizeSettings = () => {
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // Randomize Mood
    setWeather(randomItem(WEATHERS));
    setAtmosphere(randomItem(ATMOSPHERES));
    setLighting(randomItem(LIGHTINGS));
    setIntensity(Math.floor(Math.random() * 100));
    
    // Randomize Detailed Story Settings
    if (combinedDialects.length > 0) setDialect(randomItem(combinedDialects));
    if (combinedTones.length > 0) setStoryTone(randomItem(combinedTones));
    if (combinedStyles.length > 0) setStoryStyle(randomItem(combinedStyles));

    // Randomize Character Selection (Select 1-3 characters)
    if (characters.length > 0) {
      const shuffled = [...characters].sort(() => 0.5 - Math.random());
      const numToSelect = Math.floor(Math.random() * Math.min(3, characters.length)) + 1;
      const selectedIds = shuffled.slice(0, numToSelect).map(c => c.id);
      onSelectCharactersForStoryboard(selectedIds);
      onSetMaxCharactersPerScene(Math.max(1, Math.min(numToSelect, 3)));
    }
  };

  const handleAddCustomOptionClick = () => {
    if (newCustomOptionValue.trim() && selectedManageCategory) {
      // Check for duplicate
      const isDuplicate = customOptions.some(
        opt => opt.value.trim() === newCustomOptionValue.trim() && opt.attributeKey === selectedManageCategory
      );
      if (isDuplicate) {
        alert('ตัวเลือกนี้มีอยู่แล้วในหมวดหมู่เดียวกัน!');
        return;
      }

      onAddCustomOption({
        id: Date.now().toString(),
        value: newCustomOptionValue.trim(),
        attributeKey: selectedManageCategory as any // Type assertion needed or update CustomOption type
      });
      setNewCustomOptionValue('');
    }
  };


  const handleAiGenerate = async () => {
    if (!activeStoryApiKey?.key) {
      onOpenApiKeyManager();
      alert("กรุณาตั้งค่า API Key สำหรับสร้างเรื่องราว (Story API Key) ก่อนใช้งาน AI Director ครับ");
      return;
    }
    if (!plot.trim()) {
      alert("กรุณาใส่เนื้อเรื่องย่อ (Plot) ก่อนครับ");
      return;
    }
    if (numberOfScenes < 1 || numberOfScenes > 10) { // Example range
      alert("จำนวนฉากต้องอยู่ระหว่าง 1 ถึง 10 ครับ");
      return;
    }
    if (maxCharactersPerScene < 1 || maxCharactersPerScene > Math.max(1, selectedCharactersForStoryboard.length) || maxCharactersPerScene > 3) {
      // Just a warning/correction logic, generally we want to allow at least 1
      // alert(`จำนวนตัวละครสูงสุดต่อฉากต้องอยู่ระหว่าง 1 ถึง ${Math.min(selectedCharactersForStoryboard.length, 3)} ครับ`);
      // Relaxed validation for UX
    }


    setIsGenerating(true);
    try {
      const moodContext = {
        weather: cleanVal(weather),
        atmosphere: cleanVal(atmosphere),
        lighting: cleanVal(lighting),
        intensity,
        dialect: cleanVal(dialect), // New
        tone: cleanVal(storyTone), // New
        style: cleanVal(storyStyle) // New
      };
      
      const selectedChars = characters.filter(c => selectedCharactersForStoryboard.includes(c.id));

      const newScenes = await generateStoryboardFromPlot(
        plot,
        selectedChars,
        maxCharactersPerScene,
        numberOfScenes,
        moodContext,
        activeStoryApiKey.key
      ); 
      setScenes(newScenes);
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
      dialogue: '', // Initialize dialogue
      environmentElements: [], // Initialize environment elements
      shotType: 'Wide Angle',
      duration: '5s',
      generationStatus: 'idle'
    };
    setScenes([...scenes, newScene]);
  };

  const handleRemoveScene = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
  };

  const updateScene = (id: string, field: keyof Scene, value: string | string[]) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleEnvironmentElement = (sceneId: string, element: string) => {
    setScenes(scenes.map(s => {
      if (s.id === sceneId) {
        const currentElements = s.environmentElements || [];
        const newElements = currentElements.includes(element)
          ? currentElements.filter(item => item !== element)
          : [...currentElements, element];
        return { ...s, environmentElements: newElements };
      }
      return s;
    }));
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
    
    // 1. Style & Shot
    prompt += `${cleanVal(storyStyle)}, ${scene.shotType} of `;

    // 2. Character
    if (char) {
      prompt += `${char.description} `;
    } else {
      prompt += `a character `;
    }

    // 3. Action
    prompt += `${scene.action} `;

    // 4. Setting & Environment (Global Settings Applied + Scene specific elements)
    if (scene.setting) {
      prompt += `in ${scene.setting}`;
      if (scene.environmentElements && scene.environmentElements.length > 0) {
        prompt += ` with ${scene.environmentElements.map(cleanVal).join(', ')}`;
      }
      prompt += `, `;
    } else if (scene.environmentElements && scene.environmentElements.length > 0) {
       prompt += `with ${scene.environmentElements.map(cleanVal).join(', ')}, `;
    }
    
    // Append Global Moods
    prompt += `${cleanVal(weather)}, ${cleanVal(atmosphere)} atmosphere, ${cleanVal(lighting)} lighting. `;
    
    // Append Intensity if relevant to character
    if (char) {
        prompt += `Character is showing ${getIntensityDescription(intensity).split(' ')[0]}. `; // Use only Thai part
    }

    // 5. Dialogue (Optional) - Note: Veo doesn't generate audio from this, but context helps visual emotion
    if (scene.dialogue?.trim()) {
      prompt += `Character is speaking with expression matching: "${scene.dialogue.trim()}". `;
    }

    // 6. Technical
    prompt += `highly detailed, 4k, ${cleanVal(storyTone)} tone.`;
    
    return prompt.trim();
  };

  // Removed handleGenerateVideo as per user's request

  const handleGenerateCreativePrompt = async () => {
    if (!activeStoryApiKey?.key) {
      onOpenApiKeyManager();
      alert("กรุณาตั้งค่า API Key สำหรับสร้างพรอมต์ (Story API Key) ก่อนใช้ AI สร้างพรอมต์");
      return;
    }
    if (!plot.trim()) {
      alert("กรุณาใส่ Concept ก่อนครับ");
      return;
    }
    setIsGenerating(true); // Reuse isGenerating state
    try {
      const creativePrompt = await generateCreativePrompt(plot, activeStoryApiKey.key); // Pass activeStoryApiKey.key
      setPlot(creativePrompt); // Update plot with the generated prompt
    } catch (e: any) {
      alert(e.message || "เกิดข้อผิดพลาดในการสร้างพรอมต์เชิงสร้างสรรค์");
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      
      {/* Left Column: Story Setup */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Film size={16} /> Story Setup
             </h3>
             <button 
                onClick={handleRandomizeSettings}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                title="สุ่มการตั้งค่าทั้งหมด (ตัวละคร, บรรยากาศ, สไตล์)"
             >
                <RefreshCw size={12} /> สุ่ม (Random)
             </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">พล็อตเรื่อง / เรื่องย่อ</label>
              <textarea 
                value={plot}
                onChange={e => setPlot(e.target.value)}
                placeholder="เช่น แมวนักบินอวกาศกำลังซ่อมยานแล้วเจอเอเลี่ยนมอบดอกไม้ให้..."
                className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            {/* Creative Prompt Button */}
            <button
              onClick={handleGenerateCreativePrompt}
              disabled={isGenerating || !activeStoryApiKey?.key || !plot.trim()}
              className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeStoryApiKey?.key && plot.trim()
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Wand2 size={14} /> {isGenerating ? 'สร้างพรอมต์...' : 'ใช้ AI สร้างพรอมต์'}
            </button>

            {/* Character Selection for Storyboard */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <User size={12}/> เลือกตัวละครสำหรับบท (Select Characters)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {characters.length === 0 && (
                  <p className="text-slate-600 text-xs italic">
                    ยังไม่มีตัวละคร 
                    <button 
                      onClick={onNavigateToCharacterStudio} 
                      className="text-emerald-400 hover:underline ml-1"
                    >
                        ไปสร้างที่หน้า Character Studio
                    </button>
                  </p>
                )}
                {characters.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => toggleCharacterSelection(c.id)}
                    className={`text-xs bg-slate-950 p-2 rounded border transition-all cursor-pointer flex justify-between items-center ${
                      selectedCharactersForStoryboard.includes(c.id) 
                      ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' 
                      : 'border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="font-bold">{c.name}</span>
                    {selectedCharactersForStoryboard.includes(c.id) && <Check size={14} className="text-emerald-400"/>}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">จำนวนตัวละครสูงสุดต่อฉาก (Max Characters per Scene)</label>
                  <input
                    type="number"
                    min="1"
                    max={Math.min(selectedCharactersForStoryboard.length || 1, 3)} // Max 3 or num selected chars
                    value={maxCharactersPerScene}
                    onChange={e => onSetMaxCharactersPerScene(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                    disabled={selectedCharactersForStoryboard.length === 0}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">จำนวนฉากที่ต้องการ (Number of Scenes)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={numberOfScenes}
                    onChange={e => onSetNumberOfScenes(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                  />
                </div>
              </div>
            </div>


            {/* Environment & Mood Controls */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-3">
               <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Sun size={12}/> บรรยากาศ & การตั้งค่า (Global)
               </h4>
               
               <div className="grid grid-cols-2 gap-2">
                   <div className="col-span-2">
                       <label className="text-[10px] text-slate-500 block mb-1">Aspect Ratio (สัดส่วนภาพ)</label>
                       <select 
                          value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)}
                          className="w-full bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold rounded text-xs p-1.5 outline-none"
                       >
                           <option value="16:9">16:9 (Landscape / แนวนอน)</option>
                           <option value="9:16">9:16 (Portrait / แนวตั้ง)</option>
                       </select>
                   </div>
                   <div>
                       <label className="text-[10px] text-slate-500 block mb-1">สภาพอากาศ</label>
                       <select
                          value={weather} onChange={e => setWeather(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                       >
                           {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
                       </select>
                   </div>
                   <div>
                       <label className="text-[10px] text-slate-500 block mb-1">แสง (Lighting)</label>
                       <select
                          value={lighting} onChange={e => setLighting(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                       >
                           {LIGHTINGS.map(l => <option key={l} value={l}>{l}</option>)}
                       </select>
                   </div>
                   <div className="col-span-2">
                       <label className="text-[10px] text-slate-500 block mb-1">บรรยากาศ (Atmosphere)</label>
                       <select
                          value={atmosphere} onChange={e => setAtmosphere(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                       >
                           {ATMOSPHERES.map(a => <option key={a} value={a}>{a}</option>)}
                       </select>
                   </div>
               </div>

               {/* Intensity Slider */}
               <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Mic2 size={10}/> ความเข้มข้นอารมณ์</span>
                        <span>{intensity}% <span className="text-slate-500">({getIntensityDescription(intensity)})</span></span>
                    </div>
                    <input
                        type="range"
                        min="0" max="100"
                        value={intensity}
                        onChange={e => setIntensity(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
                        }}
                    />
               </div>
            </div>

            {/* NEW: Detailed Story Context */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-3">
               <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Settings2 size={12}/> รายละเอียดการเล่าเรื่อง (Detailed Context)
               </h4>
               
               <div>
                   <label className="text-[10px] text-slate-500 block mb-1 flex items-center gap-1">
                      <Languages size={10}/> ภาษา/สำเนียง (Dialect)
                   </label>
                   <select
                      value={dialect} onChange={e => setDialect(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                   >
                       {combinedDialects.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
               </div>
               
               <div>
                   <label className="text-[10px] text-slate-500 block mb-1 flex items-center gap-1">
                      <MessageSquare size={10}/> น้ำเสียงการเล่า (Story Tone)
                   </label>
                   <select
                      value={storyTone} onChange={e => setStoryTone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                   >
                       {combinedTones.map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
               </div>

               <div>
                   <label className="text-[10px] text-slate-500 block mb-1 flex items-center gap-1">
                      <Clapperboard size={10}/> สไตล์การกำกับ (Directing Style)
                   </label>
                   <select
                      value={storyStyle} onChange={e => setStoryStyle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-white p-1.5 outline-none"
                   >
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
                {isGenerating ? (
                    <><Loader2 size={18} className="animate-spin"/> AI กำลังเขียนบท...</>
                ) : (
                    <><Sparkles size={18}/> ใช้ AI สร้างบท (Generate Storyboard)</>
                )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Right Column: Scene List */}
      <div className="w-full lg:w-2/3 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
             <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Video className="text-emerald-500" /> Storyboard Scenes
                </h3>
                <p className="text-slate-400 text-xs">ฉากที่สร้างจาก AI จะปรากฏที่นี่ คุณสามารถแก้ไขและกดสร้างวิดีโอทีละฉากได้</p>
             </div>
             <button 
                onClick={handleAddScene}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
             >
                <Plus size={14} /> เพิ่มฉากเอง
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[500px]">
             {scenes.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                    <Film size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium">ยังไม่มีฉาก</p>
                    <p className="text-sm">สร้างพล็อตเรื่องทางซ้ายแล้วกดปุ่ม "ใช้ AI สร้างบท"</p>
                </div>
             )}
             
             {scenes.map((scene, index) => (
                <div key={scene.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-emerald-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <span className="bg-slate-800 text-slate-300 font-mono font-bold px-2 py-1 rounded text-xs">
                                SCENE {index + 1}
                            </span>
                            <span className="text-slate-500 text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                {scene.duration}
                            </span>
                             <span className="text-emerald-500 text-xs bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50">
                                {scene.shotType}
                            </span>
                        </div>
                        <button 
                           onClick={() => handleRemoveScene(scene.id)}
                           className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">การกระทำ (Action)</label>
                                <textarea 
                                   value={scene.action}
                                   onChange={e => updateScene(scene.id, 'action', e.target.value)}
                                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 h-16 resize-none focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">สถานที่ (Setting)</label>
                                <input 
                                   type="text"
                                   value={scene.setting}
                                   onChange={e => updateScene(scene.id, 'setting', e.target.value)}
                                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">บทพูด (Dialogue)</label>
                                <textarea 
                                   value={scene.dialogue}
                                   onChange={e => updateScene(scene.id, 'dialogue', e.target.value)}
                                   placeholder="(ไม่มีบทพูด)"
                                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 h-16 resize-none focus:border-emerald-500 outline-none italic"
                                />
                            </div>
                             <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">องค์ประกอบเสริม (Environment)</label>
                                <div className="flex flex-wrap gap-1">
                                    {combinedEnvironmentElements.map(elem => (
                                        <button
                                           key={elem}
                                           onClick={() => toggleEnvironmentElement(scene.id, elem)}
                                           className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                               scene.environmentElements?.includes(elem)
                                               ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300'
                                               : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                           }`}
                                        >
                                            {cleanVal(elem)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-slate-800">
                         <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 bg-slate-950 p-2 rounded text-[10px] text-slate-500 font-mono truncate border border-slate-800">
                                {constructPrompt(scene)}
                            </div>
                            <button
                               onClick={() => navigator.clipboard.writeText(constructPrompt(scene))}
                               className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                               title="Copy Prompt"
                            >
                                <Copy size={14} />
                            </button>
                             <button
                               onClick={() => onGenerateSceneVideo(constructPrompt(scene))}
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