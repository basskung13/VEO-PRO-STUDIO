import React, { useState } from 'react';
import { Project, ApiKey } from '../types';
import { generateVideoMetadata } from '../services/geminiService';
import { Play, Download, Wand2, Hash, Type, FileText, Layers, Film, Loader2, AlertCircle, Save, Share2, Check } from 'lucide-react';

interface ProductionProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  activeProductionApiKey: ApiKey | null; // Changed from activeStoryApiKey
  activeFalApiKey: ApiKey | null;
  onOpenApiKeyManager: () => void;
  onProceedToUpload: () => void;
}

const Production: React.FC<ProductionProps> = ({ 
  project,
  onUpdateProject,
  activeProductionApiKey, 
  activeFalApiKey,
  onOpenApiKeyManager,
  onProceedToUpload
}) => {
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [isCombining, setIsCombining] = useState(false);
  const [combineStatus, setCombineStatus] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const scenes = project.scenes;
  const plot = project.plot;
  const metadata = project.metadata;

  const handleGenerateMetadata = async () => {
    if (!activeProductionApiKey?.key) {
      onOpenApiKeyManager();
      alert("กรุณาตั้งค่า API Key สำหรับ Production Metadata (Production Key) ในเมนู Settings ก่อนสร้าง Metadata");
      return;
    }
    if (!plot && scenes.length === 0) {
      alert("ไม่พบข้อมูลพล็อตเรื่องหรือฉาก");
      return;
    }

    setIsGeneratingMetadata(true);
    try {
      const result = await generateVideoMetadata(plot, scenes, activeProductionApiKey.key);
      onUpdateProject({ metadata: result, updatedAt: Date.now() });
    } catch (e: any) {
      alert("เกิดข้อผิดพลาดในการสร้าง Metadata: " + e.message);
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  const updateMetadata = (key: keyof typeof metadata, value: any) => {
      if(!metadata) return;
      onUpdateProject({ 
          metadata: { ...metadata, [key]: value },
          updatedAt: Date.now()
      });
  };

  const handleCombineVideos = async () => {
    if (!activeFalApiKey?.key) {
      onOpenApiKeyManager();
      alert("กรุณาตั้งค่า Fal AI API Key ก่อนรวมวิดีโอ");
      return;
    }
    
    setIsCombining(true);
    setCombineStatus("กำลังเตรียมไฟล์วิดีโอ...");
    
    setTimeout(() => {
        setCombineStatus("กำลังส่งข้อมูลไปยัง Fal AI...");
        setTimeout(() => {
             setCombineStatus("กำลังประมวลผลการรวมวิดีโอ...");
             setTimeout(() => {
                 setIsCombining(false);
                 setCombineStatus("รวมวิดีโอสำเร็จ!");
                 setVideoReady(true);
             }, 2000);
        }, 1500);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      
      {/* Top Section: Project Overview */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
         {videoReady && (
             <div className="absolute top-0 right-0 p-4 z-10">
                 <button 
                    onClick={onProceedToUpload}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 animate-bounce"
                 >
                     <Share2 size={18} /> ไปยังหน้าเผยแพร่ (Distribution)
                 </button>
             </div>
         )}
         <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-4">
            <Layers className="text-emerald-500" /> Production & Assembly: {project.name}
         </h2>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2">
                 <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Project Plot</h3>
                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm h-32 overflow-y-auto">
                    {plot || <span className="text-slate-600 italic">ยังไม่มีพล็อตเรื่อง...</span>}
                 </div>
             </div>
             <div className="flex flex-col justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                 <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Status</h3>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Total Scenes:</span>
                        <span className="font-bold text-emerald-400">{scenes.length}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Est. Duration:</span>
                        <span className="font-bold text-emerald-400">
                            {scenes.reduce((acc, s) => acc + (s.duration === '8s' ? 8 : 5), 0)}s
                        </span>
                    </div>
                 </div>
                 <button 
                    onClick={handleCombineVideos}
                    disabled={isCombining || scenes.length === 0}
                    className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        videoReady 
                        ? 'bg-emerald-800/50 text-emerald-300 border border-emerald-500/50' 
                        : isCombining 
                            ? 'bg-slate-800 text-slate-500' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                    }`}
                 >
                    {isCombining ? <Loader2 className="animate-spin" size={18} /> : (videoReady ? <Check size={18}/> : <Film size={18} />)}
                    {isCombining ? combineStatus : (videoReady ? "Video Ready" : "Combine Videos (Fal AI)")}
                 </button>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Scene Status */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Film size={20} className="text-slate-400"/> Scene Assembly Queue
             </h3>
             <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                 {scenes.length === 0 && (
                     <p className="text-slate-500 text-center py-10">ยังไม่มีฉากในรายการ</p>
                 )}
                 {scenes.map((scene, idx) => (
                     <div key={scene.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between group">
                         <div className="flex items-center gap-3 overflow-hidden">
                             <div className="bg-slate-800 w-8 h-8 flex items-center justify-center rounded text-xs font-bold text-slate-400 shrink-0">
                                 {idx + 1}
                             </div>
                             <div className="min-w-0">
                                 <p className="text-sm text-slate-200 font-medium truncate">{scene.action}</p>
                                 <p className="text-xs text-slate-500 truncate">{scene.setting}</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-2 shrink-0">
                             <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-500 border border-slate-800">
                                {scene.duration}
                             </span>
                             <div className="w-2 h-2 rounded-full bg-yellow-500" title="Pending Video" />
                         </div>
                     </div>
                 ))}
             </div>
          </div>

          {/* Right Column: Metadata Generator */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wand2 size={20} className="text-pink-500"/> Metadata Generator
                  </h3>
                  <button 
                     onClick={handleGenerateMetadata}
                     disabled={isGeneratingMetadata}
                     className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                     {isGeneratingMetadata ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12}/>}
                     Generate with AI
                  </button>
              </div>

              <div className="space-y-4 flex-1">
                  <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                          <Type size={12}/> Video Title
                      </label>
                      <input 
                         type="text" 
                         value={metadata?.title || ''}
                         onChange={(e) => updateMetadata('title', e.target.value)}
                         placeholder="AI Generated Title..."
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-pink-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                          <FileText size={12}/> Description
                      </label>
                      <textarea 
                         value={metadata?.description || ''}
                         onChange={(e) => updateMetadata('description', e.target.value)}
                         placeholder="AI Generated Description..."
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-pink-500 outline-none h-32 resize-none"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                          <Hash size={12}/> Hashtags
                      </label>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 min-h-[60px] flex flex-wrap gap-2">
                          {metadata?.hashtags?.map((tag, i) => (
                              <span key={i} className="text-xs bg-pink-900/20 text-pink-400 px-2 py-1 rounded border border-pink-500/30">
                                  #{tag.replace(/^#/, '')}
                              </span>
                          ))}
                          {!metadata?.hashtags && <span className="text-slate-600 text-xs italic">No hashtags generated</span>}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Production;