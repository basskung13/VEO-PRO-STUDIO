

import React, { useState } from 'react';
import { ApiKey } from '../types';
import { Key, Plus, Trash2, Check, Eye, EyeOff, X, ExternalLink } from 'lucide-react';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKey[];
  activeKeyId: string | null;
  onAddKey: (key: ApiKey) => void;
  onRemoveKey: (id: string) => void;
  onSelectKey: (id: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  isOpen,
  onClose,
  apiKeys,
  activeKeyId,
  onAddKey,
  onRemoveKey,
  onSelectKey
}) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleAdd = () => {
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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="text-emerald-500" size={20} />
              จัดการ API Key
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              เพิ่ม Gemini API Key เพื่อใช้ฟีเจอร์ AI Director
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto">
          
          {/* Add New Key */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">เพิ่มคีย์ใหม่</h3>
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
                  type={showKey ? "text" : "password"}
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
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  title={showKey ? "ซ่อน" : "แสดง"}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                onClick={handleAdd}
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

          {/* Key List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">คีย์ที่บันทึกไว้ ({apiKeys.length})</h3>
            {apiKeys.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4 bg-slate-900/30 rounded-lg border border-dashed border-slate-800">
                ยังไม่มี API Key
              </p>
            ) : (
              apiKeys.map((key) => {
                const isActive = activeKeyId === key.id;
                return (
                  <div 
                    key={key.id}
                    onClick={() => onSelectKey(key.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {key.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {key.key.substring(0, 8)}...
                        </p>
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
              })
            )}
          </div>

        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;