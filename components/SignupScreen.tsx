// components/SignupScreen.tsx
import React, { useState } from 'react';
import { User, Lock, UserPlus, Sparkles } from 'lucide-react';

interface SignupScreenProps {
  onSignup: (username: string, password: string) => void;
  onSwitchToLogin: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onSignup, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    onSignup(username, password);
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <Sparkles className="mx-auto text-emerald-500 mb-4" size={48} />
        <h2 className="text-3xl font-bold text-white mb-2">สร้างบัญชีใหม่</h2>
        <p className="text-slate-400 text-sm">มาเริ่มสร้างเรื่องราวของคุณกัน!</p>
        <p className="text-xs text-amber-500 mt-2">
          (การสมัครนี้เป็นการจำลองสถานะบนเบราว์เซอร์เท่านั้น ไม่ได้เชื่อมต่อกับระบบหลังบ้านจริง)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="signup-username">
            ชื่อผู้ใช้ / อีเมล
          </label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              id="signup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 outline-none transition-colors"
              placeholder="username@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="signup-password">
            รหัสผ่าน
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="confirm-password">
            ยืนยันรหัสผ่าน
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          <UserPlus size={20} /> สร้างบัญชี
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-slate-400 text-sm">
          มีบัญชีอยู่แล้ว?{' '}
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            className="text-emerald-400 hover:underline font-medium"
          >
            เข้าสู่ระบบ
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;