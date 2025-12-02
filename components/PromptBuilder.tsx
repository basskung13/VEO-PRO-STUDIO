import React, { useState } from 'react';
import { Scene, Character, ApiKey, AspectRatio, CustomOption } from '../types';
import { generateStoryboardFromPlot, generateCreativePrompt, handleAistudioApiKeySelection } from '../services/geminiService';
// Fix: Added User and Check icons to the import statement.
import { Film, Sun, Mic2, Wand2, AlertCircle, Video, Plus, Trash2, Copy, MonitorPlay, Key, Link, User, Check } from 'lucide-react'; // Added Link icon for billing

interface PromptBuilderProps {
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
}

const WEATHERS = ['Sunny (แดดจัด)', 'Cloudy (เมฆมาก)', 'Rainy (ฝนตก)', 'Stormy (พายุ)', 'Snowy (หิมะตก)', 'Foggy (หมอกหนา)', 'Windy (ลมแรง)'];
const ATMOSPHERES = ['Cinematic (ภาพยนตร์)', 'Dreamy (ชวนฝัน)', 'Gloomy (หม่นหมอง)', 'Vibrant (สดใส)', 'Dark/Horror (สยองขวัญ)', 'Romantic (โรแมนติก)', 'Cyberpunk (ไซเบอร์)', 'Retro (ย้อนยุค)'];
const LIGHTINGS = ['Natural (ธรรมชาติ)', 'Golden Hour (แสงทอง)', 'Neon (นีออน)', 'Studio (สตูดิโอ)', 'Low Key (มืดสลัว)', 'Dramatic (ดรามาติก)', 'Soft (นุ่มนวล)'];

const PromptBuilder: React.FC<PromptBuilderProps> = ({ 
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
  customOptions // Destructure customOptions
}) => {
  const [plot, setPlot] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Global Settings
  const [weather, setWeather] = useState('Sunny (แดดจัด)');
  const [atmosphere, setAtmosphere] = useState('Cinematic (ภาพยนตร์)');
  const [lighting, setLighting] = useState('Natural (ธรรมชาติ)');
  const [intensity, setIntensity] = useState(30);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  const cleanVal = (val: string) => val.split('(')[0].trim();

  // Helper to get environment element options from customOptions
  const getEnvironmentElementOptions = () => {
    return customOptions
      .filter(opt => opt.attributeKey === 'environmentElement')
      .map(opt => opt.value);
  };
  const combinedEnvironmentElements = getEnvironmentElementOptions();

  // Fix: Adjusted `toggleCharacterSelection` to pass the new array directly, aligning with `onSelectCharactersForStoryboard` prop type.
  // Helper to toggle selected characters for storyboard
  const toggleCharacterSelection = (charId: string) => {
    const currentSelected = selectedCharactersForStoryboard;
    const newSelected = currentSelected.includes(charId) 
      ? currentSelected.filter(id => id !== charId) 
      : [...currentSelected, charId];
    onSelectCharactersForStoryboard(newSelected);
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
    if (maxCharactersPerScene < 1 || maxCharactersPerScene > selectedCharactersForStoryboard.length || maxCharactersPerScene > 3) { // Example max
      alert(`จำนวนตัวละครสูงสุดต่อฉากต้องอยู่ระหว่าง 1 ถึง ${Math.min(selectedCharactersForStoryboard.length, 3)} ครับ`);
      return;
    }


    setIsGenerating(true);
    try {
      const moodContext = {
        weather: cleanVal(weather),
        atmosphere: cleanVal(atmosphere),
        lighting: cleanVal(lighting),
        intensity
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
    setScenes(prevScenes => prevScenes.map(s => {
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
    
    // 1. Shot Type/Angle
    prompt += `${scene.shotType} of `;

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

    // 5. Dialogue (Optional)
    if (scene.dialogue?.trim()) {
      prompt += `Character says "${scene.dialogue.trim()}". `;
    }

    // 6. Technical
    prompt += `highly detailed, 4k`;
    
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
          <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
            <Film size={16} /> Story Setup
          </h3>
          
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
                    <div className="flex justify-between text-[8px] text-slate-600 mt-1 uppercase">
                        <span>Normal</span>
                        <span>Serious</span>
                        <span>Extreme</span>
                    </div>
               </div>
            </div>

            <button
              onClick={handleAiGenerate}
              disabled={isGenerating || !activeStoryApiKey?.key || !plot.trim()}
              className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeStoryApiKey?.key && plot.trim()
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg' 
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isGenerating ? (
                <>กำลังเขียนบท...</>
              ) : (
                <><Wand2 size={16} /> {activeStoryApiKey?.key ? 'ใช้ AI เขียนบท (Generate Scenes)' : 'ตั้งค่า API Key เพื่อใช้ AI'}</>
              )}
            </button>
            
            {!activeStoryApiKey?.key && (
               <p className="text-xs text-center text-amber-500 cursor-pointer hover:underline" onClick={onOpenApiKeyManager}>
                 <AlertCircle size={10} className="inline mr-1"/>
                 คลิกเพื่อตั้งค่า API Key (Story)
               </p>
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Timeline */}
      <div className="w-full lg:w-2/3 space-y-4">
        <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Video size={20} className="text-emerald-500"/> Timeline ({scenes.length} Scenes)
          </h2>
          <button 
            onClick={handleAddScene}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
          >
            <Plus size={14} /> เพิ่มฉากเปล่า
          </button>
        </div>

        <div className="space-y-4 pb-20">
          {scenes.length === 0 && (
             <div className="text-center py-20 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                <Film size={48} className="mx-auto mb-4 opacity-20"/>
                <p>ยังไม่มีฉากในไทม์ไลน์</p>
                <p className="text-xs mt-2">พิมพ์พล็อตเรื่องทางซ้าย เลือกบรรยากาศ แล้วกด "ใช้ AI เขียนบท"</p>
             </div>
          )}

          {scenes.map((scene, index) => (
            <div key={scene.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-sm hover:border-emerald-500/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-950 text-slate-400 text-xs px-2 py-1 rounded font-mono border border-slate-800">
                  SCENE {index + 1}
                </span>
                <div className="flex gap-2">
                   <button 
                     onClick={() => handleRemoveScene(scene.id)}
                     className="text-slate-600 hover:text-red-400 p-1"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">Character</label>
                    <select 
                      value={scene.characterId}
                      onChange={e => updateScene(scene.id, 'characterId', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="none">ไม่ระบุ / คนทั่วไป</option>
                      {characters.map(c => <option key={c.id} value={c.id}>{c.name} ({c.nameEn})</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">Shot Type</label>
                    <select 
                      value={scene.shotType}
                      onChange={e => updateScene(scene.id, 'shotType', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="Wide Angle">Wide Angle (มุมกว้าง)</option>
                      <option value="Close Up (ระยะใกล้)">Close Up (ระยะใกล้)</option>
                      <option value="Drone Shot">Drone Shot (โดรน)</option>
                      <option value="Tracking Shot">Tracking Shot (กล้องตาม)</option>
                      <option value="Over the Shoulder">Over the Shoulder (ข้ามไหล่)</option>
                      <option value="Low Angle">Low Angle (มุมเสย)</option>
                    </select>
                 </div>
                 <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Action / เหตุการณ์</label>
                    <input 
                      value={scene.action}
                      onChange={e => updateScene(scene.id, 'action', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500 outline-none"
                      placeholder="ตัวละครทำอะไร..."
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Setting / สถานที่</label>
                    <input 
                      value={scene.setting}
                      onChange={e => updateScene(scene.id, 'setting', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500 outline-none"
                      placeholder="สถานที่..."
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">บทพูดตัวอย่าง (Dialogue)</label>
                    <textarea 
                      value={scene.dialogue || ''}
                      onChange={e => updateScene(scene.id, 'dialogue', e.target.value)}
                      className="w-full h-16 bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500 outline-none resize-none"
                      placeholder="บทพูดของตัวละครในฉากนี้..."
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">องค์ประกอบในฉาก (Environment Elements)</label>
                    <div className="flex flex-wrap gap-2">
                      {combinedEnvironmentElements.length > 0 ? (
                        combinedEnvironmentElements.map(option => (
                          <span 
                            key={option} 
                            onClick={() => toggleEnvironmentElement(scene.id, option)}
                            className={`cursor-pointer px-3 py-1 text-xs rounded-full border transition-all ${
                              scene.environmentElements?.includes(option) 
                                ? 'bg-emerald-900/50 border-emerald-500 text-emerald-100' 
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {option}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500 text-xs">(ไม่มีตัวเลือก)</p>
                      )}
                    </div>
                 </div>
              </div>

              {/* Removed Video Generation Result and Error Message as per user's request */}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-500">
                     Len: {constructPrompt(scene).length} chars
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                     <button
                       onClick={() => navigator.clipboard.writeText(constructPrompt(scene))}
                       className="px-3 py-1.5 text-slate-400 hover:text-white text-xs border border-slate-700 rounded hover:bg-slate-800 flex items-center gap-2"
                     >
                       <Copy size={14} /> Copy
                     </button>
                     
                     <button
                       onClick={() => onGenerateSceneVideo(constructPrompt(scene))} // Renamed prop
                       className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded flex items-center gap-2 border border-slate-700"
                     >
                       <MonitorPlay size={14} /> Web Launch
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