
import React, { useState } from 'react';
import { User, Lock, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
  onSwitchToSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToSignup }) => {
  const { login, loginWithGoogle, isDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        await login(email, password);
    } catch (e: any) {
        setError(e.message || "Failed to login");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    try {
        await loginWithGoogle();
    } catch (e: any) {
        setError(e.message || "Google Login Failed");
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <Sparkles className="mx-auto text-emerald-500 mb-4" size={48} />
        <h2 className="text-3xl font-bold text-white mb-2">Veo Studio</h2>
        <p className="text-slate-400 text-sm">เข้าสู่ระบบเพื่อจัดการโปรเจกต์ของคุณ</p>
        {isDemoMode && <p className="text-xs text-amber-500 mt-2 bg-amber-900/20 py-1 rounded border border-amber-900/50">⚠️ No Firebase Config. Running in Demo Mode.</p>}
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
              placeholder="name@example.com"
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
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging in...' : <><LogIn size={20} /> เข้าสู่ระบบ</>}
        </button>
      </form>

      {!isDemoMode && (
          <div className="mt-4">
            <button 
                onClick={handleGoogle}
                type="button"
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12.5S6.42 23 12.09 23c5.83 0 8.8-4.15 8.8-8.65c0-.75-.1-1.27-.1-1.27z"/></svg>
                Sign in with Google
            </button>
          </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-slate-400 text-sm">
          ยังไม่มีบัญชี?{' '}
          <button onClick={onSwitchToSignup} className="text-emerald-400 hover:underline font-medium">
            สมัครที่นี่
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
