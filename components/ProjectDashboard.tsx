
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { FolderPlus, FolderOpen, Trash2, Clock, Film, Search, LayoutGrid, List, Settings, Plus, X, Tag } from 'lucide-react';

interface ProjectDashboardProps {
  projects: Project[];
  onCreateProject: (name: string, category: string) => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

// 40+ Default Categories with Thai Translations
const DEFAULT_CATEGORIES = [
  // General & Social
  'General (ทั่วไป)', 
  'Vlog (วิดีโอบล็อก)', 
  'Social Story (สตอรี่แนวตั้ง)', 
  'Instagram Reel (รีล)', 
  'TikTok Trend (ติ๊กต็อกเทรนด์)', 
  'YouTube Short (ยูทูบชอร์ต)', 
  
  // Cinematic & Fiction
  'Short Film (หนังสั้น)', 
  'Feature Film (ภาพยนตร์ขนาดยาว)', 
  'Teaser/Trailer (ตัวอย่างภาพยนตร์)', 
  'Sci-Fi (ไซไฟ/วิทยาศาสตร์)', 
  'Fantasy (แฟนตาซี)', 
  'Horror (สยองขวัญ)', 
  'Thriller (ระทึกขวัญ)', 
  'Action (แอคชั่น/ต่อสู้)', 
  'Romance (โรแมนติก/รัก)', 
  'Drama (ดราม่า/ชีวิต)', 
  'Comedy (คอเมดี้/ตลก)', 
  'Mystery (ลึกลับ/สืบสวน)', 
  'Animation (แอนิเมชัน)', 
  'Experimental (ทดลอง/ศิลปะ)',
  
  // Music & Art
  'Music Video (มิวสิควิดีโอ)', 
  'Visualizer (ภาพประกอบเพลง)', 
  'Lyric Video (วิดีโอเนื้อเพลง)', 
  'Performance (การแสดงสด)', 
  'Fashion Film (ภาพยนตร์แฟชั่น)', 
  'Art Showcase (โชว์ผลงานศิลปะ)',
  
  // Business & Corporate
  'Commercial (โฆษณา)', 
  'Product Demo (สาธิตสินค้า)', 
  'Corporate Presentation (นำเสนอองค์กร)', 
  'Real Estate Tour (อสังหาริมทรัพย์)', 
  'Testimonial (รีวิวจากผู้ใช้)', 
  'Event Recap (สรุปงานอีเวนต์)', 
  'Crowdfunding Video (ระดมทุน)',
  
  // Education & Info
  'Education (การศึกษา)', 
  'Tutorial/How-To (สอนทำ/ฮาวทู)', 
  'Documentary (สารคดี)', 
  'News Report (ข่าว/รายงาน)', 
  'Interview (สัมภาษณ์)', 
  'Video Essay (วิเคราะห์เจาะลึก)', 
  'History (ประวัติศาสตร์)',
  
  // Lifestyle & Niche
  'Travel Log (บันทึกการเดินทาง)', 
  'Cooking/Food (ทำอาหาร/อาหาร)', 
  'Fitness/Workout (ออกกำลังกาย)', 
  'Gaming (เกม)', 
  'ASMR (ผ่อนคลาย)', 
  'Unboxing (แกะกล่อง)', 
  'Review (รีวิวสินค้า)', 
  'Time-lapse (ไทม์แลปส์)', 
  'Slow Motion (สโลว์โมชัน)'
];

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onCreateProject, onSelectProject, onDeleteProject }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Category State
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newProjectCategory, setNewProjectCategory] = useState('General (ทั่วไป)');
  
  // Category Management State
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  // Load categories from local storage on mount
  useEffect(() => {
    const savedCats = localStorage.getItem('veo_project_categories');
    if (savedCats) {
      try {
        setCategories(JSON.parse(savedCats));
      } catch (e) {
        console.error("Failed to parse saved categories");
      }
    }
  }, []);

  // Save categories to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('veo_project_categories', JSON.stringify(categories));
  }, [categories]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim(), newProjectCategory);
      setNewProjectName('');
      setIsCreating(false);
      // Reset management state just in case
      setIsManagingCategories(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryInput.trim()) {
      const trimmed = newCategoryInput.trim();
      if (!categories.includes(trimmed)) {
        setCategories(prev => [...prev, trimmed].sort());
        setNewProjectCategory(trimmed); // Auto select the new one
      }
      setNewCategoryInput('');
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    // Removed window.confirm to ensure direct interaction without browser blocking
    const updatedCategories = categories.filter(c => c !== catToDelete);
    setCategories(updatedCategories);
    
    // If the currently selected category is the one being deleted, switch to a valid one
    if (newProjectCategory === catToDelete) {
      setNewProjectCategory(updatedCategories.length > 0 ? updatedCategories[0] : 'General (ทั่วไป)');
    }
  };

  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('th-TH', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             <LayoutGrid className="text-emerald-500" size={32} /> Project Studio
           </h1>
           <p className="text-slate-400 mt-1">Manage your creative projects and video series.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                 type="text" 
                 placeholder="Search projects..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-emerald-500 outline-none"
              />
           </div>
           <button 
             onClick={() => setIsCreating(true)}
             className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 whitespace-nowrap transition-transform active:scale-95"
           >
             <FolderPlus size={18} /> New Project
           </button>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                 <h2 className="text-xl font-bold text-white">
                    {isManagingCategories ? 'Manage Categories' : 'Create New Project'}
                 </h2>
                 {isManagingCategories && (
                    <button onClick={() => setIsManagingCategories(false)} className="text-emerald-400 text-xs font-bold hover:underline">
                        Done
                    </button>
                 )}
              </div>

              {!isManagingCategories ? (
                // --- CREATE MODE ---
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Project Name</label>
                      <input 
                        autoFocus
                        type="text" 
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        placeholder="e.g. Alien Coffee Shop"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-slate-400 text-xs font-bold uppercase">Category / Theme</label>
                        <button 
                            type="button" 
                            onClick={() => setIsManagingCategories(true)}
                            className="text-[10px] text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                        >
                            <Settings size={10} /> Edit List
                        </button>
                      </div>
                      <select 
                        value={newProjectCategory}
                        onChange={e => setNewProjectCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500 appearance-none"
                      >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-slate-800 mt-2">
                        <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-lg font-bold hover:bg-slate-700 transition-colors">Cancel</button>
                        <button type="submit" disabled={!newProjectName.trim()} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-900/20">Create Project</button>
                    </div>
                </form>
              ) : (
                // --- MANAGE CATEGORIES MODE ---
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            placeholder="Add new category..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500"
                        />
                        <button 
                            onClick={handleAddCategory}
                            disabled={!newCategoryInput.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 pb-2">
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <div key={cat} className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 group hover:border-slate-500 transition-colors">
                                    <Tag size={12} className="text-slate-500" />
                                    <span>{cat}</span>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteCategory(cat);
                                        }}
                                        className="ml-1 text-slate-500 hover:text-red-400 p-1 rounded-full hover:bg-red-900/20 transition-colors cursor-pointer flex-shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-800 mt-2">
                        <button onClick={() => setIsManagingCategories(false)} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm">
                            Back to Create
                        </button>
                    </div>
                </div>
              )}
           </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
           <Film size={64} className="mx-auto text-slate-700 mb-4" />
           <h3 className="text-xl font-bold text-slate-400">No projects yet</h3>
           <p className="text-slate-500 mb-6">Create your first project to start organizing your stories.</p>
           <button 
             onClick={() => setIsCreating(true)}
             className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
           >
             Create a Project
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filteredProjects.map(project => (
             <div 
               key={project.id} 
               className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all group relative flex flex-col h-full"
             >
                <div 
                  onClick={() => onSelectProject(project.id)}
                  className="h-32 bg-slate-800 relative cursor-pointer group-hover:bg-slate-750 transition-colors"
                >
                    <div className="absolute inset-0 flex items-center justify-center text-slate-700 group-hover:text-slate-600">
                        <Film size={48} />
                    </div>
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur px-2 py-1 rounded text-[10px] text-emerald-400 border border-emerald-900/50 font-bold uppercase truncate max-w-[120px]">
                        {project.category}
                    </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                   <div className="flex justify-between items-start mb-2">
                      <h3 
                        onClick={() => onSelectProject(project.id)}
                        className="font-bold text-lg text-white truncate cursor-pointer hover:text-emerald-400 transition-colors"
                      >
                          {project.name}
                      </h3>
                      <button 
                        onClick={() => {
                            if(window.confirm(`Delete project "${project.name}"?`)) onDeleteProject(project.id);
                        }}
                        className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                          <Trash2 size={16} />
                      </button>
                   </div>
                   
                   <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">
                       {project.plot || "No plot description yet..."}
                   </p>
                   
                   <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                       <span className="flex items-center gap-1">
                           <List size={12} /> {project.scenes.length} Scenes
                       </span>
                       <span className="flex items-center gap-1">
                           <Clock size={12} /> {formatDate(project.updatedAt)}
                       </span>
                   </div>
                   
                   <button 
                      onClick={() => onSelectProject(project.id)}
                      className="mt-3 w-full py-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                   >
                       <FolderOpen size={14} /> Open Project
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
