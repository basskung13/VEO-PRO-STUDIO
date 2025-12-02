
import React, { useState } from 'react';
import { Scene, Character, ApiKey, AspectRatio } from '../types';
import { generateStoryboardFromPlot, generateVeoVideo, generateCreativePrompt } from '../services/geminiService'; // Import generateCreativePrompt
// Add missing Lucide React icons
import { Film, Sun, Mic2, Wand2, AlertCircle, Video, Plus, Trash2, Copy, MonitorPlay } from 'lucide-react';

interface PromptBuilderProps {
  characters: Character[];
  activeApiKey: ApiKey | null; // Keep activeApiKey for UI display purposes if needed, but not for API calls
  onOpenApiKeyManager: () => void;
  onLaunchScene: (prompt: string) => void;
  onNavigateToCharacterStudio: () => void; // New prop for navigation
}

const WEATHERS = ['Sunny (แดดจัด)', 'Cloudy (เมฆมาก)', 'Rainy (ฝนตก)', 'Stormy (พายุ)', 'Snowy (หิมะตก)', 'Foggy (หมอกหนา)', 'Windy (ลมแรง)'];
const ATMOSPHERES = ['Cinematic (ภาพยนตร์)', 'Dreamy (ชวนฝัน)', 'Gloomy (หม่นหมอง)', 'Vibrant (สดใส)', 'Dark/Horror (สยองขวัญ)', 'Romantic (โรแมนติก)', 'Cyberpunk (ไซเบอร์)', 'Retro (ย้อนยุค)'];
const LIGHTINGS = ['Natural (ธรรมชาติ)', 'Golden Hour (แสงทอง)', 'Neon (นีออน)', 'Studio (สตูดิโอ)', 'Low Key (มืดสลัว)', 'Dramatic (ดรามาติก)', 'Soft (นุ่มนวล)'];

const PromptBuilder: React.FC<PromptBuilderProps> = ({ 
  characters, 
  activeApiKey, // This is now primarily for UI display, actual API calls use process.env.API_KEY
  onOpenApiKeyManager,
  onLaunchScene,
  onNavigateToCharacterStudio // Destructure new prop
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

  const handleAiGenerate = async () => {
    // For general AI generation, we still rely on the user having set an API key in the manager.
    // The specific `window.aistudio` logic is only for image/video generation with specific models.
    if (!activeApiKey) {
      onOpenApiKeyManager();
      alert("กรุณาตั้งค่า API Key ก่อนใช้งาน AI Director ครับ");
      return;
    }
    if (!plot.trim()) {
      alert("กรุณาใส่เนื้อเรื่องย่อ (Plot) ก่อนครับ");
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
      
      // Removed apiKeyFromProp argument as service function now uses process.env.API_KEY
      const newScenes = await generateStoryboardFromPlot(plot, characters, moodContext); 
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
      shotType: 'Wide Angle',
      duration: '5s',
      generationStatus: 'idle'
    };
    setScenes([...scenes, newScene]);
  };

  const handleRemoveScene = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
  };

  const updateScene = (id: string, field: keyof Scene, value: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, [field]: value } : s));
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
    
    // 1. Style/Shot
    prompt += `${scene.shotType} of `;

    // 2. Character
    if (char) {
      prompt += `${char.description} `;
    } else {
      prompt += `a character `;
    }

    // 3. Action
    prompt += `${scene.action} `;

    // 4. Setting & Environment (Global Settings Applied)
    if (scene.setting) {
      prompt += `in ${scene.setting}, `;
    }
    
    // Append Global Moods
    prompt += `${cleanVal(weather)}, ${cleanVal(atmosphere)} atmosphere, ${cleanVal(lighting)} lighting. `;
    
    // Append Intensity if relevant to character
    if (char) {
        prompt += `Character is showing ${getIntensityDescription(intensity).split(' ')[0]}. `; // Use only Thai part
    }

    // 5. Technical
    prompt += `highly detailed, 4k`;
    
    return prompt.trim();
  };

  const handleGenerateVideo = async (sceneId: string) => {
    if (!activeApiKey) { // Still use activeApiKey to determine if the user has *configured* an API Key for general purpose.
      onOpenApiKeyManager();
      alert("กรุณาตั้งค่า API Key ก่อนใช้งาน AI Director ครับ (ต้องใช้ API Key แบบชำระเงินสำหรับ Veo)");
      return;
    }
    
    // For Veo, we also need to explicitly check window.aistudio.hasSelectedApiKey()
    // and potentially open the selection dialog.
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      try {
        const hasAistudioKey = await window.aistudio.hasSelectedApiKey();
        if (!hasAistudioKey) {
          alert("สำหรับ Veo คุณต้องเลือก API Key ที่ผูกกับการเรียกเก็บเงินแล้ว ผ่านหน้าต่าง 'ตั้งค่า API Key' ที่จะเปิดขึ้นมา");
          await window.aistudio.openSelectKey();
          // Assume success and proceed as per guidelines
        }
      } catch (aistudioError) {
        console.error("Error with aistudio.hasSelectedApiKey/openSelectKey:", aistudioError);
        alert("เกิดข้อผิดพลาดในการตรวจสอบ/เลือก API Key จากระบบ (AISTUDIO). โปรดลองอีกครั้ง");
        return;
      }
    } else {
      alert("Veo API Key selection is not available. Please ensure your environment supports window.aistudio.");
      return;
    }


    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const prompt = constructPrompt(scene);

    // Update status to generating
    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, generationStatus: 'generating' } : s));

    try {
      // Removed apiKeyFromProp argument as service function now uses process.env.API_KEY
      const videoUrl = await generateVeoVideo(prompt, aspectRatio); 
      
      setScenes(prev => prev.map(s => s.id === sceneId ? { 
        ...s, 
        generationStatus: 'completed',
        generatedVideoUrl: videoUrl
      } : s));
    } catch (error: any) {
      console.error(error);
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, generationStatus: 'error' } : s));
      alert(error.message || "เกิดข้อผิดพลาดในการสร้างวีดีโอ (API Error)");
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
              disabled={isGenerating || !activeApiKey} // Disable if no activeApiKey for general AI director features
              className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeApiKey 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg' 
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isGenerating ? (
                <>กำลังเขียนบท...</>
              ) : (
                <><Wand2 size={16} /> {activeApiKey ? 'ใช้ AI เขียนบท (Generate Scenes)' : 'ตั้งค่า API Key เพื่อใช้ AI'}</>
              )}
            </button>
            
            {!activeApiKey && (
               <p className="text-xs text-center text-amber-500 cursor-pointer hover:underline" onClick={onOpenApiKeyManager}>
                 <AlertCircle size={10} className="inline mr-1"/>
                 คลิกเพื่อตั้งค่า API Key
               </p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
           <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-2">ข้อมูลตัวละคร ({characters.length})</h3>
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
               <div key={c.id} className="text-xs bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                 <span className="text-emerald-400 font-bold">{c.name}</span>
                 <span className="text-slate-500 truncate max-w-[100px]">{c.nameEn}</span>
               </div>
             ))}
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
                      <option value="Close Up">Close Up (ระยะใกล้)</option>
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
              </div>

              {/* Video Generation Result */}
              {scene.generatedVideoUrl && (
                  <div className="mb-4 bg-black rounded-lg overflow-hidden border border-slate-800">
                      <video 
                          src={scene.generatedVideoUrl} 
                          controls 
                          className="w-full h-auto max-h-[400px]"
                          autoPlay
                          loop
                      />
                      <div className="p-2 bg-slate-950 text-center">
                          <a 
                              href={scene.generatedVideoUrl} 
                              download="veo_video.mp4"
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-emerald-400 hover:underline"
                          >
                              Download Video
                          </a>
                      </div>
                  </div>
              )}

              {/* Error Message */}
              {scene.generationStatus === 'error' && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs">
                      Failed to generate video. Please check your API Key and Quota.
                  </div>
              )}

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
                       onClick={() => onLaunchScene(constructPrompt(scene))}
                       className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded flex items-center gap-2 border border-slate-700"
                     >
                       <MonitorPlay size={14} /> Web Launch
                     </button>

                     <button
                       onClick={() => handleGenerateVideo(scene.id)}
                       disabled={scene.generationStatus === 'generating'}
                       className={`px-4 py-1.5 rounded flex items-center gap-2 text-xs font-bold shadow-lg transition-all ${
                           scene.generationStatus === 'generating'
                           ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                           : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                       }`}
                     >
                       {scene.generationStatus === 'generating' ? 'Generating...' : 'Generate (API)'}
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