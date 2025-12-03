
import React, { useState } from 'react';
import { Project } from '../types';
import { FolderPlus, FolderOpen, Trash2, Clock, Film, MoreVertical, Search, LayoutGrid, List } from 'lucide-react';

interface ProjectDashboardProps {
  projects: Project[];
  onCreateProject: (name: string, category: string) => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const CATEGORIES = ['General', 'Short Film', 'Music Video', 'Vlog', 'Commercial', 'Education', 'Comedy'];

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onCreateProject, onSelectProject, onDeleteProject }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('General');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim(), newProjectCategory);
      setNewProjectName('');
      setIsCreating(false);
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
           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
              <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Project Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      placeholder="e.g. Alien Coffee Shop"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Category / Theme</label>
                    <select 
                      value={newProjectCategory}
                      onChange={e => setNewProjectCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-lg font-bold hover:bg-slate-700">Cancel</button>
                      <button type="submit" disabled={!newProjectName.trim()} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 disabled:opacity-50">Create Project</button>
                  </div>
              </form>
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
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur px-2 py-1 rounded text-[10px] text-emerald-400 border border-emerald-900/50 font-bold uppercase">
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
