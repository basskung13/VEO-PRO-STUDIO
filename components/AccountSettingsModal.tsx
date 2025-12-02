

import React from 'react';
import { X, ExternalLink, Mail, User, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { UserProfile } from '../types';
import { openGoogleAccountChooser } from '../services/geminiService';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfiles: Record<number, UserProfile>;
  onUpdateProfile: (index: number, data: Partial<UserProfile>) => void;
  activeSlotCount: number;
  onUpdateSlotCount: (count: number) => void;
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  userProfiles,
  onUpdateProfile,
  activeSlotCount,
  onUpdateSlotCount
}) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Account Management
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Link and verify your Google browser profiles.
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
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Section: Active Connections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Linked Profiles</h3>
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

export default AccountSettingsModal;