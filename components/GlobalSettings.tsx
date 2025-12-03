
import React, { useState } from 'react';
import { ApiKey, UserProfile } from '../types';
import { Key, Plus, Trash2, ExternalLink, Mail, User, Settings, Check, Zap, Share2, Video, Globe } from 'lucide-react';

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
  activeFalApiKeyId: string | null;
  activeUploadPostApiKeyId: string | null;
  onAddKey: (key: ApiKey) => void;
  onRemoveKey: (id: string) => void;
  onSelectStoryKey: (id: string) => void;
  onSelectCharacterKey: (id: string) => void;
  onSelectFalKey: (id: string) => void;
  onSelectUploadPostKey: (id: string) => void;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  userProfiles,
  onUpdateProfile,
  activeSlotCount,
  onUpdateSlotCount,
  apiKeys,
  activeStoryApiKeyId,
  activeCharacterApiKeyId,
  activeFalApiKeyId,
  activeUploadPostApiKeyId,
  onAddKey,
  onRemoveKey,
  onSelectStoryKey,
  onSelectCharacterKey,
  onSelectFalKey,
  onSelectUploadPostKey
}) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

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
          
          {/* Section: Account Management */}
          <div className="space-y-4">
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

          {/* Section: API Keys */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Key className="text-emerald-500" size={16} /> API Key Manager
                </h3>
            </div>

            {/* Quick Access Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all group">
                    <div className="bg-blue-500/20 p-2 rounded text-blue-400 group-hover:text-white group-hover:bg-blue-500 transition-colors"><Zap size={18}/></div>
                    <div>
                        <div className="text-xs font-bold text-slate-300">Google AI Studio</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">Get Gemini Key <ExternalLink size={8}/></div>
                    </div>
                 </a>
                 <a href="https://fal.ai/dashboard" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all group">
                    <div className="bg-purple-500/20 p-2 rounded text-purple-400 group-hover:text-white group-hover:bg-purple-500 transition-colors"><Video size={18}/></div>
                    <div>
                        <div className="text-xs font-bold text-slate-300">Fal.ai Dashboard</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">Get Video Gen Key <ExternalLink size={8}/></div>
                    </div>
                 </a>
                 <a href="https://app.upload-post.com/api-keys" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all group">
                    <div className="bg-orange-500/20 p-2 rounded text-orange-400 group-hover:text-white group-hover:bg-orange-500 transition-colors"><Share2 size={18}/></div>
                    <div>
                        <div className="text-xs font-bold text-slate-300">Upload-Post.com</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">Get Social API Key <ExternalLink size={8}/></div>
                    </div>
                 </a>
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

            {/* Key List */}
            <div className="space-y-2">
              {apiKeys.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                   No API Keys saved. Add one above to enable AI features.
                </div>
              )}
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded text-slate-400">
                      <Key size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{key.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     {/* Usage Toggles */}
                     <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-1 border border-slate-800">
                        <button 
                            onClick={() => onSelectStoryKey(activeStoryApiKeyId === key.id ? '' : key.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeStoryApiKeyId === key.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Use for Story Generation"
                        >
                            Story
                        </button>
                        <button 
                            onClick={() => onSelectCharacterKey(activeCharacterApiKeyId === key.id ? '' : key.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeCharacterApiKeyId === key.id ? 'bg-pink-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Use for Character Generation"
                        >
                            Char
                        </button>
                        <button 
                            onClick={() => onSelectFalKey(activeFalApiKeyId === key.id ? '' : key.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeFalApiKeyId === key.id ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Use for Fal AI Video"
                        >
                            Fal
                        </button>
                         <button 
                            onClick={() => onSelectUploadPostKey(activeUploadPostApiKeyId === key.id ? '' : key.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeUploadPostApiKeyId === key.id ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Use for Social Upload"
                        >
                            Upload
                        </button>
                     </div>

                    <button
                      onClick={() => onRemoveKey(key.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                      title="Remove Key"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
