
import React, { useState } from 'react';
import { User, Lock, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SignupScreenProps {
  onSignup: (username: string, password: string) => void;
  onSwitchToLogin: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onSwitchToLogin }) => {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
        await signup(email, password);
        // Auth state change will handle redirect
    } catch (e: any) {
        setError(e.message || "Failed to create account");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <Sparkles className="mx-auto text-emerald-500 mb-4" size={48} />
        <h2 className="text-3xl font-bold text-white mb-2">สร้างบัญชีใหม่</h2>
        <p className="text-slate-400 text-sm">เริ่มใช้งาน Veo Studio Cloud</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2">อีเมล</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 outline-none"
              placeholder="username@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2">รหัสผ่าน</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2">ยืนยันรหัสผ่าน</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : <><UserPlus size={20} /> สร้างบัญชี</>}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-slate-400 text-sm">
          มีบัญชีอยู่แล้ว?{' '}
          <button onClick={onSwitchToLogin} className="text-emerald-400 hover:underline font-medium">
            เข้าสู่ระบบ
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;
