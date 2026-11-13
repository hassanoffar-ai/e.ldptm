import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  Globe,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from 'lucide-react';
import { AdminUser } from '../types';
import { saveStoredSession } from '../data/auth';
import { fetchProfileByUsername } from '../lib/supabase';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onNavigateHome: () => void;
  onNavigateToTicket?: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateToTicket,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Zəhmət olmasa istifadəçi adını və şifrəni daxil edin.');
      return;
    }

    // Direct entry for ticket kiosk if "bilet"
    if (cleanUser === 'bilet' && cleanPass.length > 0) {
      if (onNavigateToTicket) {
        onNavigateToTicket();
        return;
      }
    }

    setIsLoading(true);

    try {
      // Fetch user profile from Supabase public.profiles
      const profile = await fetchProfileByUsername(cleanUser);

      if (!profile) {
        setErrorMessage('Daxil edilmiş istifadəçi adı və ya şifrə yanlışdır.');
        setIsLoading(false);
        return;
      }

      // Check role (must be admin or super_admin)
      if (profile.role !== 'admin' && profile.role !== 'super_admin') {
        setErrorMessage('Bu hesabın Admin Panelinə daxil olmaq səlahiyyəti yoxdur.');
        setIsLoading(false);
        return;
      }

      // Check password directly from Supabase
      if (!profile.passwordHash || profile.passwordHash !== cleanPass) {
        setErrorMessage('Daxil edilmiş istifadəçi adı və ya şifrə yanlışdır.');
        setIsLoading(false);
        return;
      }

      // Direct successful login (Autozator ləğv edildi)
      const adminUser: AdminUser = {
        username: profile.username,
        fullName: profile.fullName || profile.username,
        role: profile.role === 'super_admin' ? 'super_admin' : 'admin',
      };

      saveStoredSession(adminUser);
      onLoginSuccess(adminUser);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        'Supabase ilə əlaqə qurularkən xəta baş verdi. Zəhmət olmasa internet əlaqənizi və ya profiles cədvəlini yoxlayın.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-between relative overflow-hidden text-slate-100 antialiased selection:bg-[#6d28d9] selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#6d28d9]/25 blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#1e1b4b]/60 blur-[150px]" />
      </div>

      {/* Top Navbar */}
      <header className="w-full px-4 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#6d28d9] to-[#9333ea] flex items-center justify-center text-white shadow-lg shadow-purple-900/30 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block leading-tight">
              E-LDPTM
            </span>
            <span className="text-[10px] sm:text-[11px] text-purple-300 font-medium tracking-wide uppercase">
              Mərkəzi İdarəetmə Sistemi
            </span>
          </div>
        </div>

        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">Əsas Sayta Qayıt</span>
          <span className="sm:hidden">Əsas Sayt</span>
        </button>
      </header>

      {/* Center Card */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 relative z-10 my-2 sm:my-4">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative shadow-purple-950/50">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Admin Panelinə Giriş
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              İstifadəçi adınızı (superadmin və ya admin) və şifrənizi daxil edin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                İstifadəçi Adı
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin və ya admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Şifrə
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Hesab şifrəsi"
                  className="w-full pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] hover:from-[#5b21b6] hover:to-[#6d28d9] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yoxlanılır...</span>
                </>
              ) : (
                <>
                  <span>Hesaba Daxil Ol</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 relative z-10">
        E-LDPTM Tədris Mərkəzi Təhlükəsiz İdarəetmə Sistemi © 2026
      </footer>
    </div>
  );
};
