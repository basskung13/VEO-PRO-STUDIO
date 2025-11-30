
import React, { useState } from 'react';
import { Users, ChevronDown, Check, Edit2, X, Settings } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountBarProps {
  currentAccountIndex: number;
  activeSlotCount: number;
  usageMap: Record<number, number>;
  userProfiles: Record<number, UserProfile>;
  maxCount: number;
  onAccountSelect: (index: number) => void;
  onResetCurrent: () => void;
  onUpdateProfileName: (index: number, name: string) => void;
  onOpenSettings: () => void;
}

const AccountBar: React.FC<AccountBarProps> = ({ 
  currentAccountIndex, 
  activeSlotCount,
  usageMap, 
  userProfiles,
  maxCount, 
  onAccountSelect,
  onResetCurrent,
  onUpdateProfileName,
  onOpenSettings
}) => {
  const currentUsage = usageMap[currentAccountIndex] || 0;
  const isLimitReached = currentUsage >= maxCount;
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // Generate accounts list based on the active slot count
  const accounts = Array.from({ length: activeSlotCount }, (_, i) => i);
  
  const currentProfile = userProfiles[currentAccountIndex] || { name: `Account ${currentAccountIndex + 1}` };
  const currentProfileName = currentProfile.name;

  const handleStartEdit = (e: React.MouseEvent, index: number, name: string) => {
    e.stopPropagation();
    setEditingId(index);
    setEditName(name);
  };

  const handleSaveEdit = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (editName.trim()) {
      onUpdateProfileName(index, editName.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <div className="bg-emerald-600 p-2 rounded-lg">
            <span className="font-bold text-xl text-white tracking-tight">Veo Launcher</span>
        </div>
        <span className="text-slate-400 text-sm hidden sm:inline-block">| Multi-Account Manager</span>
      </div>

      <div className="flex items-center gap-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        
        {/* Usage Indicators */}
        <div className="flex items-center gap-2 px-3 border-r border-slate-800 pr-4">
           <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Usage</span>
           <div className="flex gap-1">
              {[...Array(maxCount)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < currentUsage ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-700'
                  }`}
                />
              ))}
           </div>
           <span className={`ml-2 text-sm font-mono ${isLimitReached ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
             {currentUsage}/{maxCount}
           </span>
           
           {currentUsage > 0 && (
             <button 
               onClick={onResetCurrent} 
               className="ml-2 text-[10px] text-slate-600 hover:text-white underline uppercase"
               title="Reset counter for this account"
             >
               Clear
             </button>
           )}
        </div>

        {/* Account Dropdown */}
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-w-[160px] justify-between ${
                    isLimitReached 
                    ? 'bg-red-900/20 text-red-400 border border-red-900/50' 
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
            >
                <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{currentProfileName.startsWith('Account ') ? `Google ${currentProfileName}` : currentProfileName}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Select Browser Profile</p>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {accounts.map((idx) => {
                          const usage = usageMap[idx] || 0;
                          const isFull = usage >= maxCount;
                          const profile = userProfiles[idx] || { name: `Account ${idx + 1}` };
                          const profileName = profile.name;
                          const profileEmail = profile.email;
                          const isEditing = editingId === idx;

                          return (
                              <div
                                  key={idx}
                                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer group border-b border-slate-800/50 last:border-0 ${
                                      currentAccountIndex === idx ? 'bg-slate-800/50' : ''
                                  }`}
                                  onClick={() => {
                                    if (!isEditing) {
                                      onAccountSelect(idx);
                                      setIsOpen(false);
                                    }
                                  }}
                              >
                                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                      
                                      {isEditing ? (
                                        <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                                          <input 
                                            autoFocus
                                            type="text" 
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white w-full focus:border-emerald-500 outline-none"
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleSaveEdit(e as any, idx);
                                              if (e.key === 'Escape') handleCancelEdit(e as any);
                                            }}
                                          />
                                          <button onClick={(e) => handleSaveEdit(e, idx)} className="text-emerald-400 p-1 hover:bg-slate-700 rounded"><Check size={12} /></button>
                                          <button onClick={handleCancelEdit} className="text-red-400 p-1 hover:bg-slate-700 rounded"><X size={12} /></button>
                                        </div>
                                      ) : (
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm text-slate-200 font-medium truncate">{profileName}</p>
                                              <button 
                                                onClick={(e) => handleStartEdit(e, idx, profileName)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-emerald-400 transition-opacity p-0.5"
                                              >
                                                <Edit2 size={10} />
                                              </button>
                                            </div>
                                            {profileEmail ? (
                                              <p className="text-[10px] text-slate-400 truncate">{profileEmail}</p>
                                            ) : (
                                              <p className="text-[10px] text-slate-600">authuser={idx}</p>
                                            )}
                                        </div>
                                      )}
                                  </div>
                                  <div className="flex items-center gap-2 pl-2">
                                      <span className={`text-xs font-mono ${isFull ? 'text-red-400' : 'text-slate-400'}`}>
                                          {usage}/{maxCount}
                                      </span>
                                      {currentAccountIndex === idx && !isEditing && <Check size={14} className="text-emerald-400" />}
                                  </div>
                              </div>
                          );
                      })}
                    </div>
                    
                    {/* Manage Button */}
                    <div className="p-2 bg-slate-950 border-t border-slate-800">
                        <button
                           onClick={() => {
                             setIsOpen(false);
                             onOpenSettings();
                           }}
                           className="w-full py-2 px-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                           <Settings size={14} />
                           Manage Connections
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AccountBar;
