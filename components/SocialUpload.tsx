
import React, { useState } from 'react';
import { VideoMetadata, ApiKey, SocialPlatform } from '../types';
import { uploadToSocialPlatform } from '../services/uploadPostService';
import { Share2, Youtube, Facebook, Instagram, Music2, Globe, Lock, EyeOff, Send, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface SocialUploadProps {
  metadata: VideoMetadata | null;
  activeUploadPostApiKey: ApiKey | null;
  onOpenApiKeyManager: () => void;
}

const SocialUpload: React.FC<SocialUploadProps> = ({ metadata, activeUploadPostApiKey, onOpenApiKeyManager }) => {
  // Local state for toggles and privacy
  const [platforms, setPlatforms] = useState<Record<SocialPlatform, boolean>>({
    tiktok: true,
    youtube: true,
    instagram: false,
    facebook: false
  });

  const [privacy, setPrivacy] = useState<Record<SocialPlatform, 'public' | 'private' | 'unlisted'>>({
    tiktok: 'public',
    youtube: 'public',
    instagram: 'public',
    facebook: 'public'
  });

  // Upload States
  const [uploadStatus, setUploadStatus] = useState<Record<SocialPlatform, { status: 'idle' | 'uploading' | 'success' | 'error', progress: number, message?: string }>>({
    tiktok: { status: 'idle', progress: 0 },
    youtube: { status: 'idle', progress: 0 },
    instagram: { status: 'idle', progress: 0 },
    facebook: { status: 'idle', progress: 0 }
  });

  const togglePlatform = (p: SocialPlatform) => setPlatforms(prev => ({ ...prev, [p]: !prev[p] }));
  
  const handlePrivacyChange = (p: SocialPlatform, val: string) => 
    setPrivacy(prev => ({ ...prev, [p]: val as any }));

  const handleLaunchDistribution = async () => {
    if (!activeUploadPostApiKey?.key) {
      onOpenApiKeyManager();
      alert("กรุณาตั้งค่า API Key (Upload-Post Key) ในเมนู Settings ก่อนเริ่มการอัปโหลด");
      return;
    }

    if (!metadata) {
      alert("ไม่พบข้อมูล Metadata กรุณากลับไปสร้างในหน้า Production ก่อน");
      return;
    }

    // Filter enabled platforms
    const targetPlatforms = (Object.keys(platforms) as SocialPlatform[]).filter(p => platforms[p]);

    if (targetPlatforms.length === 0) {
      alert("กรุณาเลือกแพลตฟอร์มอย่างน้อย 1 ช่องทาง");
      return;
    }

    // Reset statuses
    targetPlatforms.forEach(p => {
       setUploadStatus(prev => ({ ...prev, [p]: { status: 'uploading', progress: 0 } }));
    });

    // Launch uploads in parallel (mocked)
    targetPlatforms.forEach(async (p) => {
      try {
        await uploadToSocialPlatform(p, metadata, activeUploadPostApiKey.key, (progress) => {
            setUploadStatus(prev => ({ ...prev, [p]: { ...prev[p], progress } }));
        });
        setUploadStatus(prev => ({ ...prev, [p]: { status: 'success', progress: 100, message: 'Upload Complete' } }));
      } catch (e: any) {
        setUploadStatus(prev => ({ ...prev, [p]: { status: 'error', progress: 0, message: e.message } }));
      }
    });
  };

  const getIcon = (p: SocialPlatform) => {
    switch(p) {
        case 'tiktok': return <Music2 size={20} />;
        case 'youtube': return <Youtube size={20} />;
        case 'instagram': return <Instagram size={20} />;
        case 'facebook': return <Facebook size={20} />;
    }
  };

  const getColor = (p: SocialPlatform) => {
    switch(p) {
        case 'tiktok': return 'text-pink-400 bg-pink-900/20 border-pink-500/30';
        case 'youtube': return 'text-red-400 bg-red-900/20 border-red-500/30';
        case 'instagram': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
        case 'facebook': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Share2 className="text-emerald-500" /> Social Distribution Center
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                    Powered by <span className="text-orange-400 font-bold">Upload-Post.com</span>
                </p>
             </div>
             {!activeUploadPostApiKey?.key && (
                 <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                     <AlertTriangle size={16}/>
                     <span>API Key Not Configured</span>
                     <button onClick={onOpenApiKeyManager} className="underline hover:text-red-300 ml-2">Fix Now</button>
                 </div>
             )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Metadata Preview */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg lg:col-span-1">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Content Preview</h3>
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden mb-4">
                    <div className="aspect-video bg-slate-900 flex items-center justify-center text-slate-600">
                        <Share2 size={48} opacity={0.2} />
                    </div>
                    <div className="p-4">
                        <h4 className="font-bold text-white text-sm mb-2">{metadata?.title || "Untitled Video"}</h4>
                        <p className="text-xs text-slate-400 line-clamp-3 mb-3">{metadata?.description || "No description available."}</p>
                        <div className="flex flex-wrap gap-1">
                            {metadata?.hashtags?.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Platform Config */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Select Platforms & Privacy</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {(Object.keys(platforms) as SocialPlatform[]).map(platform => (
                        <div key={platform} className={`border rounded-xl p-4 transition-all ${platforms[platform] ? 'bg-slate-800 border-slate-600' : 'bg-slate-950/50 border-slate-800 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${getColor(platform)}`}>
                                    {getIcon(platform)}
                                    <span className="capitalize font-bold text-sm">{platform}</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={platforms[platform]} onChange={() => togglePlatform(platform)} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            {platforms[platform] && (
                                <div className="flex flex-col gap-2 animate-fade-in">
                                    <div className="flex gap-2">
                                        <button onClick={() => handlePrivacyChange(platform, 'public')} className={`flex-1 py-1 text-xs rounded border flex items-center justify-center gap-1 ${privacy[platform] === 'public' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                                            <Globe size={12}/> Public
                                        </button>
                                        <button onClick={() => handlePrivacyChange(platform, 'unlisted')} className={`flex-1 py-1 text-xs rounded border flex items-center justify-center gap-1 ${privacy[platform] === 'unlisted' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                                            <EyeOff size={12}/> Unlisted
                                        </button>
                                        <button onClick={() => handlePrivacyChange(platform, 'private')} className={`flex-1 py-1 text-xs rounded border flex items-center justify-center gap-1 ${privacy[platform] === 'private' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                                            <Lock size={12}/> Private
                                        </button>
                                    </div>
                                    
                                    {/* Upload Progress Bar */}
                                    {uploadStatus[platform].status !== 'idle' && (
                                        <div className="mt-2 bg-slate-900 rounded-full h-2 overflow-hidden relative">
                                            <div 
                                                className={`h-full transition-all duration-300 ${uploadStatus[platform].status === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${uploadStatus[platform].progress}%` }}
                                            />
                                        </div>
                                    )}
                                    {uploadStatus[platform].status === 'success' && (
                                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                                            <CheckCircle2 size={10} /> Upload Complete
                                        </div>
                                    )}
                                    {uploadStatus[platform].status === 'error' && (
                                        <div className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                                            <AlertTriangle size={10} /> {uploadStatus[platform].message}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-auto">
                    <button 
                        onClick={handleLaunchDistribution}
                        disabled={!activeUploadPostApiKey?.key || !metadata}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                             !activeUploadPostApiKey?.key || !metadata
                             ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                             : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20 hover:scale-[1.01]'
                        }`}
                    >
                        <Send size={24} /> Launch Distribution
                    </button>
                    <p className="text-center text-[10px] text-slate-500 mt-2">
                        By clicking Launch, you agree to upload content to selected platforms according to their ToS.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SocialUpload;
