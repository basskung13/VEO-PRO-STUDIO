
import React from 'react';
import { HistoryItem } from '../types';
import { Copy, Clock, MessageSquare } from 'lucide-react';

interface HistoryProps {
  items: HistoryItem[];
  onCopy: (text: string) => void;
}

const VideoHistory: React.FC<HistoryProps> = ({ items, onCopy }) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <Clock size={20} />
        Recent Prompts
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/30 transition-all flex justify-between items-start gap-4 group"
          >
            <div className="flex items-start gap-3 overflow-hidden">
               <div className="mt-1 bg-slate-800 p-2 rounded-full shrink-0">
                  <MessageSquare size={16} className="text-emerald-400" />
               </div>
               <div>
                  <p className="text-slate-200 text-sm font-medium line-clamp-1">{item.originalPrompt}</p>
                  <p className="text-slate-500 text-xs font-mono mt-1 line-clamp-1 bg-slate-950 px-2 py-1 rounded w-fit">
                    {item.finalPrompt}
                  </p>
                  <span className="text-[10px] text-slate-600 mt-2 block">
                      {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
               </div>
            </div>
            
            <button
              onClick={() => onCopy(item.finalPrompt)}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <Copy size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoHistory;