// components/LoginScreen.tsx
import React, { useState } from 'react';
import { User, Lock, LogIn, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
  onSwitchToSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <Sparkles className="mx-auto text-emerald-500 mb-4" size={48} />
        <h2 className="text-3xl font-bold text-white mb-2">เข้าสู่ระบบ</h2>
        <p className="text-slate-400 text-sm">ยินดีต้อนรับกลับ!</p>
        <p className="text-xs text-amber-500 mt-2">
          (การล็อกอินนี้เป็นการจำลองสถานะบนเบราว์เซอร์เท่านั้น ไม่ได้เชื่อมต่อกับระบบหลังบ้านจริง)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="username">
            ชื่อผู้ใช้ / อีเมล
          </label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 outline-none transition-colors"
              placeholder="username@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="password">
            รหัสผ่าน
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
        >
          <LogIn size={20} /> เข้าสู่ระบบ
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-slate-400 text-sm">
          ยังไม่มีบัญชี?{' '}
          <button 
            type="button" 
            onClick={onSwitchToSignup}
            className="text-emerald-400 hover:underline font-medium"
          >
            สมัครที่นี่
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;