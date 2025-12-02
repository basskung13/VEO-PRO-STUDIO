
import React, { useState } from 'react';
import { ApiKey, UserProfile } from '../types';
import { Key, Plus, Trash2, Check, Eye, EyeOff, X, ExternalLink, Mail, User, CheckCircle, Settings } from 'lucide-react';
import { openGoogleAccountChooser } from '../services/geminiService';

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Account Management Props
  userProfiles: Record<number, UserProfile>;
  onUpdateProfile: (index: number, data: Partial<UserProfile>) => void;
  activeSlotCount: number;
  onUpdateSlotCount: (count: number) => void;
  // API Key Management Props
  apiKeys: ApiKey[];
  activeStoryApiKeyId: string | null;
  activeCharacterApiKeyId: string | null;
  onAddKey: (key: ApiKey) => void;
  onRemoveKey: (id: string) => void;
  onSelectStoryKey: (id: string) => void;
  onSelectCharacterKey: (id: string) => void;
}

const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({
  isOpen,
  onClose,
  userProfiles,
  onUpdateProfile,
  activeSlotCount,
  onUpdateSlotCount,
  apiKeys,
  activeStoryApiKeyId,
  activeCharacterApiKeyId,
  onAddKey,
  onRemoveKey,
  onSelectStoryKey,
  onSelectCharacterKey,
}) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [showExistingKeyId, setShowExistingKeyId] = useState<string | null>(null);

  if (!isOpen) return null;

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
    if (activeSlotCount < 5) {
      onUpdateSlotCount(activeSlotCount + 1);
    }
  };

  const handleRemoveLastSlot = () => {
    if (activeSlotCount > 1) {
      onUpdateSlotCount(activeSlotCount - 1);
    }
  };

  const activeAccounts = Array.from({ length: activeSlotCount }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="text-emerald-500" size={24} />
              Global Settings
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Manage accounts and API keys.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Section: Account Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Linked Browser Profiles</h3>
                <span className="text-xs text-slate-500">{activeSlotCount}/5 Slots Used</span>
            </div>

            <div className="space-y-3">
              {activeAccounts.map((idx) => {
                const profile = userProfiles[idx] || { name: '', email: '' };
                const isConfigured = profile.name || profile.email;
                
                return (
                  <div key={idx} className={`border rounded-xl p-4 transition-all group ${isConfigured ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-900/30 border-slate-800/50 border-dashed'}`}>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      
                      {/* Identity Badge */}
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border font-mono text-xs shrink-0 ${isConfigured ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                           <span className="font-bold">{idx}</span>
                        </div>
                        <div className="sm:hidden flex flex-col">
                            <span className="text-slate-300 text-sm font-medium">Browser Profile {idx}</span>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500 hidden sm:block">
                            Friendly Name
                          </label>
                          <div className="relative">
                            <User size={12} className="absolute left-3 top-2.5 text-slate-600" />
                            <input
                              type="text"
                              value={profile.name}
                              onChange={(e) => onUpdateProfile(idx, { name: e.target.value })}
                              placeholder={`e.g. Personal, Work...`}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:border-emerald-500 outline-none placeholder-slate-600 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500 hidden sm:block">
                            Associated Email
                          </label>
                          <div className="relative">
                            <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input
                              type="text"
                              value={profile.email || ''}
                              onChange={(e) => onUpdateProfile(idx, { email: e.target.value })}
                              placeholder="verify@link.com"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-300 focus:border-emerald-500 outline-none placeholder-slate-600 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        {/* Open Button */}
                        <button
                          onClick={() => openGoogleAccountChooser(idx, profile.email)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all border border-slate-700 hover:border-slate-600 min-w-[80px]"
                          title="Open Gemini and verify this account via Account Chooser"
                        >
                          <ExternalLink size={14} />
                          Open
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slot Management Buttons */}
            <div className="flex gap-3">
              {activeSlotCount < 5 && (
                 <button 
                   onClick={handleAddSlot}
                   className="flex-1 py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                 >
                   <Plus size={16} />
                   Add Profile Slot
                 </button>
              )}
              {activeSlotCount > 1 && (
                 <button 
                   onClick={handleRemoveLastSlot}
                   className="px-4 py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                   title="Remove the last profile slot"
                 >
                   <Trash2 size={16} />
                 </button>
              )}
            </div>
          </div>


          {/* Section: API Key Management */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Key className="text-emerald-500" size={16} />
                API Key Management
            </h3>

            {/* Add New Key */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase">เพิ่มคีย์ใหม่</h4>
                <div className="grid grid-cols-1 gap-3">
                <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="ชื่อเรียก (เช่น ส่วนตัว, บริษัท)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
                <div className="relative">
                    <input
                    type={showNewKey ? "text" : "password"}
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    placeholder="วาง Google Gemini API Key ที่นี่..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-20 py-2 text-sm text-white focus:border-emerald-500 outline-none font-mono"
                    />
                    
                    {/* Create Key Link Button */}
                    <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-10 top-2.5 text-slate-500 hover:text-emerald-400 transition-colors"
                    title="ไปที่หน้าสร้าง API Key"
                    >
                    <ExternalLink size={14} />
                    </a>

                    {/* Show/Hide Button */}
                    <button
                    type="button"
                    onClick={() => setShowNewKey(!showNewKey)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                    title={showNewKey ? "ซ่อน" : "แสดง"}
                    >
                    {showNewKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
                <button
                    onClick={handleAddKey}
                    disabled={!newKeyName || !newKeyValue}
                    className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    newKeyName && newKeyValue 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    <Plus size={16} /> บันทึกคีย์
                </button>
                </div>
            </div>

            {/* Key List & Selection */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase">คีย์ที่บันทึกไว้ ({apiKeys.length})</h4>
              {apiKeys.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4 bg-slate-900/30 rounded-lg border border-dashed border-slate-800">
                  ยังไม่มี API Key
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Story API Key Selection */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase">Story/Video Generation API Key</h5>
                    <select
                      value={activeStoryApiKeyId || ''}
                      onChange={(e) => onSelectStoryKey(e.target.value || null)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="">(เลือก API Key)</option>
                      {apiKeys.map(key => (
                        <option key={key.id} value={key.id}>{key.name}</option>
                      ))}
                    </select>
                    {activeStoryApiKeyId && (
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <Key size={12} /> Key: {apiKeys.find(k => k.id === activeStoryApiKeyId)?.key.substring(0, 8)}...
                      </div>
                    )}
                  </div>

                  {/* Character API Key Selection */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                    <h5 className="text-xs font-bold text-indigo-400 uppercase">Character Image Generation API Key</h5>
                    <select
                      value={activeCharacterApiKeyId || ''}
                      onChange={(e) => onSelectCharacterKey(e.target.value || null)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="">(เลือก API Key)</option>
                      {apiKeys.map(key => (
                        <option key={key.id} value={key.id}>{key.name}</option>
                      ))}
                    </select>
                    {activeCharacterApiKeyId && (
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <Key size={12} /> Key: {apiKeys.find(k => k.id === activeCharacterApiKeyId)?.key.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <h4 className="text-xs font-bold text-slate-300 uppercase mt-6">จัดการคีย์ทั้งหมด</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {apiKeys.map((key) => {
                  const isActiveStory = activeStoryApiKeyId === key.id;
                  const isActiveCharacter = activeCharacterApiKeyId === key.id;
                  return (
                    <div 
                      key={key.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isActiveStory || isActiveCharacter
                          ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${isActiveStory || isActiveCharacter ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isActiveStory || isActiveCharacter ? 'text-emerald-300' : 'text-slate-300'}`}>
                            {key.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500 font-mono truncate">
                              {showExistingKeyId === key.id ? key.key : key.key.substring(0, 8) + '...'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setShowExistingKeyId(showExistingKeyId === key.id ? null : key.id); }}
                              className="text-slate-500 hover:text-white"
                              title={showExistingKeyId === key.id ? "ซ่อน" : "แสดง"}
                            >
                              {showExistingKeyId === key.id ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveKey(key.id);
                        }}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="ลบ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <CheckCircle size={16} />
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default GlobalSettingsModal;
