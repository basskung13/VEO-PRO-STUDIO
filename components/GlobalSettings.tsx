import React, { useState } from 'react';
import { ApiKey, UserProfile } from '../types';
import { Key, Plus, Trash2, ExternalLink, User, Settings, Zap, Share2, Video, Sparkles, Clapperboard, Edit2, Check, X } from 'lucide-react';

interface GlobalSettingsProps {
  // Account Management Props
  userProfiles: Record<number, UserProfile>;
  onUpdateProfile: (index: number, data: Partial<UserProfile>) => void;
  activeSlotCount: number;
  onUpdateSlotCount: (count: number) => void;
  // API Key Management Props
  apiKeys: ApiKey[];
  activeStoryApiKeyId: string | null;
  activeCharacterApiKeyId: string | null;
  activeProductionApiKeyId: string | null;
  activeFalApiKeyId: string | null;
  activeUploadPostApiKeyId: string | null;
  onAddKey: (key: ApiKey) => void;
  onRemoveKey: (id: string) => void;
  onUpdateKey: (id: string, updates: Partial<ApiKey>) => void;
  onSelectStoryKey: (id: string) => void;
  onSelectCharacterKey: (id: string) => void;
  onSelectProductionKey: (id: string) => void;
  onSelectFalKey: (id: string) => void;
  onSelectUploadPostKey: (id: string) => void;
}

const FeatureSelector = ({ label, icon, value, onChange, keys, color }: { label: string, icon: React.ReactNode, value: string | null, onChange: (id: string) => void, keys: ApiKey[], color: string }) => (
  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col gap-3 shadow-md hover:border-slate-600 transition-all">
      <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${color}`}>
          {icon} {label}
      </div>
      <select 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg p-2.5 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
      >
          <option value="">-- Select API Key --</option>
          {keys.map(k => (
              <option key={k.id} value={k.id}>{k.name} ({k.key.substring(0, 4)}...)</option>
          ))}
      </select>
  </div>
);

const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  userProfiles,
  onUpdateProfile,
  activeSlotCount,
  onUpdateSlotCount,
  apiKeys,
  activeStoryApiKeyId,
  activeCharacterApiKeyId,
  activeProductionApiKeyId,
  activeFalApiKeyId,
  activeUploadPostApiKeyId,
  onAddKey,
  onRemoveKey,
  onUpdateKey,
  onSelectStoryKey,
  onSelectCharacterKey,
  onSelectProductionKey,
  onSelectFalKey,
  onSelectUploadPostKey
}) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddKey = () => {
    if (newKeyName.trim() && newKeyValue.trim()) {
      onAddKey({
        id: Date.now().toString(),
        name: newKeyName.trim(),
        key: newKeyValue.trim()
      });
      setNewKeyName('');
      setNewKeyValue('');
    }
  };

  const handleAddSlot = () => {
    if (activeSlotCount < 5) onUpdateSlotCount(activeSlotCount + 1);
  };

  const handleRemoveLastSlot = () => {
    if (activeSlotCount > 1) onUpdateSlotCount(activeSlotCount - 1);
  };
  
  const startEditing = (key: ApiKey) => {
      setEditingId(key.id);
      setEditName(key.name);
  };

  const saveEdit = (id: string) => {
      if(editName.trim()) {
          onUpdateKey(id, { name: editName.trim() });
      }
      setEditingId(null);
      setEditName('');
  };

  const cancelEdit = () => {
      setEditingId(null);
      setEditName('');
  };

  const activeAccounts = Array.from({ length: activeSlotCount }, (_, i) => i);

  return (
    <div className="w-full max-w-6xl animate-fade-in pb-10">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="text-emerald-500" size={24} />
              Global Settings
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Manage connected Google accounts and External API Services.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Section: API Key Configuration (Features) */}
          <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="text-emerald-500" size={16} /> Feature Assignment (Assign Keys to Services)
                  </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                 <FeatureSelector 
                    label="Storyboard Director" 
                    icon={<Sparkles size={14}/>} 
                    value={activeStoryApiKeyId} 
                    onChange={onSelectStoryKey} 
                    keys={apiKeys} 
                    color="text-blue-400"
                 />
                 <FeatureSelector 
                    label="Character Designer" 
                    icon={<User size={14}/>} 
                    value={activeCharacterApiKeyId} 
                    onChange={onSelectCharacterKey} 
                    keys={apiKeys} 
                    color="text-pink-400"
                 />
                 <FeatureSelector 
                    label="Production Metadata" 
                    icon={<Clapperboard size={14}/>} 
                    value={activeProductionApiKeyId} 
                    onChange={onSelectProductionKey} 
                    keys={apiKeys} 
                    color="text-emerald-400"
                 />
                 <FeatureSelector 
                    label="Video Gen (Fal AI)" 
                    icon={<Video size={14}/>} 
                    value={activeFalApiKeyId} 
                    onChange={onSelectFalKey} 
                    keys={apiKeys} 
                    color="text-purple-400"
                 />
                 <FeatureSelector 
                    label="Social Distribution" 
                    icon={<Share2 size={14}/>} 
                    value={activeUploadPostApiKeyId} 
                    onChange={onSelectUploadPostKey} 
                    keys={apiKeys} 
                    color="text-orange-400"
                 />
              </div>
              <p className="text-xs text-slate-500 italic">* You can select the same API Key for multiple features.</p>
          </div>

          {/* Section: API Key List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Key className="text-emerald-500" size={16} /> API Key Manager (Add / Remove)
                </h3>
            </div>

             {/* Add New Key */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Service Name / Label</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., My Gemini Key"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex-[2] w-full space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">API Key String</label>
                <input
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="Paste your API key here..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none font-mono"
                />
              </div>
              <button
                onClick={handleAddKey}
                disabled={!newKeyName || !newKeyValue}
                className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Plus size={16} /> Save Key
              </button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {apiKeys.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                   No API Keys saved. Add one above to enable AI features.
                </div>
              )}
              {apiKeys.map((key) => {
                 const usedIn = [];
                 if (activeStoryApiKeyId === key.id) usedIn.push("Storyboard");
                 if (activeCharacterApiKeyId === key.id) usedIn.push("Character");
                 if (activeProductionApiKeyId === key.id) usedIn.push("Metadata");
                 if (activeFalApiKeyId === key.id) usedIn.push("Fal");
                 if (activeUploadPostApiKeyId === key.id) usedIn.push("Upload");
                 
                 const isEditing = editingId === key.id;

                 return (
                    <div key={key.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-slate-700 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-slate-800 p-2 rounded text-slate-400">
                          <Key size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                              {isEditing ? (
                                  <input 
                                    autoFocus
                                    type="text" 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="bg-slate-950 border border-slate-600 rounded px-2 py-0.5 text-sm text-white outline-none focus:border-emerald-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit(key.id);
                                        if (e.key === 'Escape') cancelEdit();
                                    }}
                                  />
                              ) : (
                                  <p className="text-sm font-bold text-white">{key.name}</p>
                              )}
                              
                              {usedIn.length > 0 && !isEditing && (
                                  <div className="flex gap-1">
                                      {usedIn.map(u => (
                                          <span key={u} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                                              {u}
                                          </span>
                                      ))}
                                  </div>
                              )}
                          </div>
                          {!isEditing && (
                              <p className="text-[10px] text-slate-500 font-mono">
                                {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 4)}
                              </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                             <>
                                <button
                                    onClick={() => saveEdit(key.id)}
                                    className="p-2 text-emerald-500 hover:bg-emerald-900/20 rounded transition-colors"
                                    title="Save Name"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
                                    title="Cancel"
                                >
                                    <X size={16} />
                                </button>
                             </>
                        ) : (
                             <>
                                <button
                                    onClick={() => startEditing(key)}
                                    className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                                    title="Edit Name"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => onRemoveKey(key.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                    title="Remove Key"
                                >
                                    <Trash2 size={16} />
                                </button>
                             </>
                        )}
                      </div>
                    </div>
                 );
              })}
            </div>

             {/* Beautiful Resource Links */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 mt-4">
                 <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex flex-col gap-2 p-4 rounded-xl border border-blue-900/30 bg-gradient-to-br from-slate-900 to-blue-950/20 hover:from-slate-900 hover:to-blue-900/40 transition-all hover:scale-[1.02] hover:border-blue-500/50 group"
                 >
                    <div className="flex items-center justify-between">
                        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                            <Sparkles size={20} />
                        </div>
                        <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">Get Gemini Key</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Google AI Studio</p>
                    </div>
                 </a>

                 <a 
                    href="https://fal.ai/dashboard/keys" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex flex-col gap-2 p-4 rounded-xl border border-indigo-900/30 bg-gradient-to-br from-slate-900 to-indigo-950/20 hover:from-slate-900 hover:to-indigo-900/40 transition-all hover:scale-[1.02] hover:border-indigo-500/50 group"
                 >
                    <div className="flex items-center justify-between">
                        <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 group-hover:text-indigo-300 transition-colors">
                            <Video size={20} />
                        </div>
                        <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">Get Fal.ai Key</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Video Generation</p>
                    </div>
                 </a>

                 <a 
                    href="https://app.upload-post.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex flex-col gap-2 p-4 rounded-xl border border-orange-900/30 bg-gradient-to-br from-slate-900 to-orange-950/20 hover:from-slate-900 hover:to-orange-900/40 transition-all hover:scale-[1.02] hover:border-orange-500/50 group"
                 >
                    <div className="flex items-center justify-between">
                        <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400 group-hover:text-orange-300 transition-colors">
                            <Share2 size={20} />
                        </div>
                        <ExternalLink size={14} className="text-slate-600 group-hover:text-orange-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">Get Social Upload Key</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Upload-Post.com</p>
                    </div>
                 </a>
            </div>
          </div>

          {/* Section: Account Management */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <User className="text-emerald-500" size={16} /> Linked Browser Profiles
                </h3>
                <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {activeSlotCount}/5 Slots Used
                </span>
            </div>

            <div className="space-y-3">
              {activeAccounts.map((idx) => {
                const profile = userProfiles[idx] || { name: '', email: '' };
                const isConfigured = profile.name || profile.email;
                
                return (
                  <div key={idx} className={`border rounded-xl p-4 transition-all group ${isConfigured ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-900/30 border-slate-800/50 border-dashed'}`}>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border font-mono text-xs shrink-0 ${isConfigured ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                           <span className="font-bold">{idx}</span>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500 hidden sm:block">Friendly Name</label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => onUpdateProfile(idx, { name: e.target.value })}
                            placeholder={`e.g. Personal, Work...`}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none placeholder-slate-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500 hidden sm:block">Email Hint</label>
                          <input
                            type="text"
                            value={profile.email || ''}
                            onChange={(e) => onUpdateProfile(idx, { email: e.target.value })}
                            placeholder="user@gmail.com"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none placeholder-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <button onClick={handleAddSlot} disabled={activeSlotCount >= 5} className="text-xs bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 px-3 py-2 rounded hover:bg-emerald-900/40 disabled:opacity-50 flex items-center gap-1"><Plus size={14}/> Add Profile Slot</button>
              <button onClick={handleRemoveLastSlot} disabled={activeSlotCount <= 1} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-3 py-2 rounded hover:bg-slate-700 disabled:opacity-50">Remove Last Slot</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;