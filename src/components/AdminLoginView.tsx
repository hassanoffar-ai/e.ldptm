import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  Globe,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Smartphone,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { AdminUser, UserProfile } from '../types';
import { saveStoredSession } from '../data/auth';
import {
  fetchProfileByUsername,
  updateProfileTotpInDb,
} from '../lib/supabase';
import {
  generateBase32Secret,
  formatSecretForDisplay,
  getTotpUri,
  getQrCodeImageUrl,
  verifyTotpCode,
} from '../lib/totp';

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
  // Step 1: Credentials | Step 2: 2FA TOTP Authenticator
  const [step, setStep] = useState<'credentials' | 'totp_verify' | 'totp_setup'>('credentials');

  // Credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Matched profile from Supabase
  const [authenticatedProfile, setAuthenticatedProfile] = useState<UserProfile | null>(null);

  // TOTP States
  const [totpCode, setTotpCode] = useState('');
  const [tempTotpSecret, setTempTotpSecret] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Handle Step 1: Username & Password Verification via Supabase public.profiles
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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
      // 1. Fetch user directly from Supabase public.profiles
      const profile = await fetchProfileByUsername(cleanUser);

      if (!profile) {
        setErrorMessage(
          'Daxil edilmiş istifadəçi adı və ya şifrə yanlışdır (Profil tapılmadı).'
        );
        setIsLoading(false);
        return;
      }

      // Check role (must be admin or super_admin)
      if (profile.role !== 'admin' && profile.role !== 'super_admin') {
        setErrorMessage(
          'Bu hesabın Admin Panelinə daxil olmaq səlahiyyəti yoxdur.'
        );
        setIsLoading(false);
        return;
      }

      // Check password directly from Supabase
      if (!profile.passwordHash || profile.passwordHash !== cleanPass) {
        setErrorMessage('Daxil edilmiş istifadəçi adı və ya şifrə yanlışdır.');
        setIsLoading(false);
        return;
      }

      // Passwords matched! Save profile in state
      setAuthenticatedProfile(profile);

      // Superadmin and Admin require Authenticator (TOTP)
      if (profile.isTotpEnabled && profile.totpSecret) {
        // Already set up 2FA -> Go to verify step
        setStep('totp_verify');
      } else {
        // Needs 2FA setup -> Generate fresh secret and show QR code
        const newSecret = generateBase32Secret(20);
        setTempTotpSecret(newSecret);
        setStep('totp_setup');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        'Supabase ilə əlaqə qurularkən xəta baş verdi. Zəhmət olmasa internet əlaqənizi və ya profiles cədvəlini yoxlayın.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Verify existing TOTP code
  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!authenticatedProfile || !authenticatedProfile.totpSecret) {
      setErrorMessage('Autozator məlumatı tapılmadı.');
      return;
    }

    const cleanCode = totpCode.trim().replace(/\s+/g, '');
    const isValid = verifyTotpCode(cleanCode, authenticatedProfile.totpSecret);

    if (!isValid) {
      setErrorMessage(
        'Daxil edilmiş 6 rəqəmli kod yanlışdır və ya vaxtı bitib. Google Authenticator tətbiqindəki cari kodu daxil edin.'
      );
      return;
    }

    // Success! Finish login
    completeLogin(authenticatedProfile);
  };

  // Handle Step 2: Setup new TOTP and activate
  const handleSetupTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!authenticatedProfile || !tempTotpSecret) {
      setErrorMessage('Quraşdırma məlumatı tapılmadı.');
      return;
    }

    const cleanCode = totpCode.trim().replace(/\s+/g, '');
    const isValid = verifyTotpCode(cleanCode, tempTotpSecret);

    if (!isValid) {
      setErrorMessage(
        'Daxil edilmiş 6 rəqəmli test kodu yanlışdır. Tətbiqdəki kodu dəqiq daxil edin.'
      );
      return;
    }

    setIsLoading(true);

    // Save secret to Supabase public.profiles
    const result = await updateProfileTotpInDb(
      authenticatedProfile.username,
      tempTotpSecret,
      true
    );

    if (!result.success) {
      setErrorMessage('Autozator açarı Supabase-də saxlanıla bilmədi: ' + (result.error || ''));
      setIsLoading(false);
      return;
    }

    const updatedProfile: UserProfile = {
      ...authenticatedProfile,
      totpSecret: tempTotpSecret,
      isTotpEnabled: true,
    };

    completeLogin(updatedProfile);
  };

  const completeLogin = (profile: UserProfile) => {
    const adminUser: AdminUser = {
      username: profile.username,
      fullName: profile.fullName || profile.username,
      role: profile.role === 'super_admin' ? 'super_admin' : 'admin',
    };

    saveStoredSession(adminUser);
    onLoginSuccess(adminUser);
  };

  const handleCopySecret = () => {
    if (!tempTotpSecret) return;
    navigator.clipboard.writeText(tempTotpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setTotpCode('');
    setErrorMessage(null);
  };

  const totpUri =
    authenticatedProfile && tempTotpSecret
      ? getTotpUri(authenticatedProfile.username, tempTotpSecret, 'E-LDPTM Admin')
      : '';
  const qrUrl = totpUri ? getQrCodeImageUrl(totpUri) : '';

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
          
          {/* STEP 1: CREDENTIALS (USERNAME & PASSWORD) */}
          {step === 'credentials' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3 shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Admin Panelinə Giriş
                </h2>
                <p className="text-xs text-slate-400 mt-1.5">
                  Hesab məlumatları birbaşa Supabase <span className="font-mono text-purple-300">public.profiles</span> serverindən oxunur
                </p>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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
                      <span>Növbəti: Autozator Doğrulaması</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* STEP 2A: TOTP VERIFICATION (EXISTING 2FA) */}
          {step === 'totp_verify' && authenticatedProfile && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-inner">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Google Authenticator
                </h2>
                <p className="text-xs text-slate-400 mt-1.5">
                  <span className="text-white font-semibold">{authenticatedProfile.fullName}</span> hesabı üçün 2FA aktivdir. Telefonunuzdakı 6 rəqəmli kodu daxil edin.
                </p>
              </div>

              <form onSubmit={handleVerifyTotp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                    6 Rəqəmli Doğrulama Kodu
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      required
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full py-3.5 text-center bg-slate-800/80 border border-purple-500/50 rounded-xl text-2xl tracking-[0.35em] font-mono text-purple-200 placeholder-slate-600 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Kod hər 30 saniyədən bir avtomatik yenilənir
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={totpCode.trim().length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] hover:from-[#5b21b6] hover:to-[#6d28d9] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kodu Təsdiqlə və Daxil Ol</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  className="w-full py-2.5 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Fərqli istifadəçi ilə daxil ol</span>
                </button>
              </form>
            </>
          )}

          {/* STEP 2B: TOTP SETUP (FIRST TIME 2FA ENROLLMENT) */}
          {step === 'totp_setup' && authenticatedProfile && (
            <>
              <div className="text-center mb-4">
                <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2 shadow-inner">
                  <QrCode className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Google Authenticator Quraşdırılması
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Super Admin və Admin hesabları üçün iki faktorlu qoruma məcburidir.
                </p>
              </div>

              {/* QR Code & Secret */}
              <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 text-center mb-4">
                <p className="text-[11px] font-medium text-purple-300 mb-2.5">
                  1. Telefonunuzda <b>Google Authenticator</b> tətbiqini açıb QR kodu skan edin:
                </p>

                <div className="inline-block p-2 bg-white rounded-xl shadow-md my-1">
                  <img
                    src={qrUrl}
                    alt="Authenticator QR Code"
                    className="w-36 h-36 mx-auto block"
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/60">
                  <p className="text-[11px] text-slate-400 mb-1.5">
                    Və ya tətbiqdə Gizli Açarı əl ilə daxil edin:
                  </p>
                  <div className="flex items-center justify-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg">
                    <span className="font-mono text-xs font-bold text-amber-300 tracking-wider">
                      {formatSecretForDisplay(tempTotpSecret)}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      title="Açarı kopyala"
                      className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Verify Test Code Form */}
              <form onSubmit={handleSetupTotp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                    2. Tətbiqdə yaranan 6 rəqəmli kodu daxil edin:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full py-3 text-center bg-slate-800/90 border border-purple-500/50 rounded-xl text-xl tracking-[0.3em] font-mono text-purple-200 placeholder-slate-600 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || totpCode.trim().length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Supabase-də yadda saxlanılır...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Autozatoru Aktivləşdir və Daxil Ol</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Geri qayıt</span>
                </button>
              </form>
            </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 relative z-10">
        E-LDPTM Tədris Mərkəzi Təhlükəsiz İdarəetmə Sistemi © 2026
      </footer>
    </div>
  );
};
