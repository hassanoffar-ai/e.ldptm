import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  Phone,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Student, StudentUser } from '../types';
import { saveStoredStudentSession } from '../data/auth';

interface StudentAuthViewProps {
  students: Student[];
  onRegisterStudent: (newStudent: Student) => void;
  onLoginSuccess: (studentUser: StudentUser) => void;
}

export const StudentAuthView: React.FC<StudentAuthViewProps> = ({
  students,
  onRegisterStudent,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Student ID
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form states (Student ID assigned by admin)
  const [registerStudentId, setRegisterStudentId] = useState('');
  // Details entered by student
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState<string | null>(null);

  const cleanRegisterId = registerStudentId.trim();

  // Find student in registered DB by Student ID (or finCode for legacy)
  const matchedStudentById =
    cleanRegisterId.length >= 2
      ? (students || []).find((s) => {
          if (!s) return false;
          const sId = (s.studentId || '').trim().toLowerCase();
          const sDbId = (s.id || '').trim().toLowerCase();
          const sFin = (s.finCode || '').trim().toLowerCase();
          const target = cleanRegisterId.toLowerCase();
          return sId === target || sDbId === target || sFin === target;
        }) || null
      : null;

  // Auto-fill existing details if already partially saved
  useEffect(() => {
    if (matchedStudentById) {
      if (!phone && matchedStudentById.phone && !matchedStudentById.phone.includes('000 00 00')) {
        setPhone(matchedStudentById.phone);
      }
      if (!email && matchedStudentById.email && !matchedStudentById.email.includes('@eldptm.edu.az')) {
        setEmail(matchedStudentById.email);
      }
    }
  }, [matchedStudentById]);

  // Handle Student Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanId || !cleanPass) {
      setLoginError('Zəhmət olmasa Tələbə ID və şifrənizi daxil edin.');
      return;
    }

    // Match by studentId, id, or legacy finCode
    const matched = (students || []).find((s) => {
      if (!s) return false;
      const sId = (s.studentId || '').toLowerCase();
      const sDbId = (s.id || '').toLowerCase();
      const sFin = (s.finCode || '').toLowerCase();
      return sId === cleanId || sDbId === cleanId || sFin === cleanId;
    });

    if (!matched) {
      setLoginError(
        'Daxil edilən Tələbə ID sistemdə tapılmadı. Əgər qeydiyyatdan keçməmisinizsə, aşağıdan qeydiyyatdan keçin.'
      );
      return;
    }

    // Check password
    const expectedPassword = matched.passwordHash || '123456';
    if (cleanPass !== expectedPassword) {
      if (!matched.isRegistered) {
        setLoginError(
          'Daxil edilmiş şifrə yanlışdır. Əgər portalda ilk dəfəsinizsə, aşağıdakı "Qeydiyyatdan keçin" bölməsindən şifrənizi təyin edin.'
        );
      } else {
        setLoginError('Daxil edilmiş şifrə yanlışdır. Zəhmət olmasa yenidən yoxlayın.');
      }
      return;
    }

    const sessionUser: StudentUser = {
      id: matched.id || '',
      studentId: matched.studentId || matched.finCode || '',
      finCode: matched.finCode || matched.studentId || '',
      name: matched.name || 'Tələbə',
      group: matched.group || '',
      specialty: matched.specialty || '',
      email: matched.email || '',
      phone: matched.phone || '',
    };

    saveStoredStudentSession(sessionUser);
    onLoginSuccess(sessionUser);
  };

  // Handle Student Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!cleanRegisterId) {
      setRegisterError('Zəhmət olmasa mərkəz tərəfindən sizə təqdim edilmiş Tələbə ID-ni daxil edin.');
      return;
    }

    if (!matchedStudentById) {
      setRegisterError(
        `Daxil edilən Tələbə ID (${cleanRegisterId}) mərkəzin bazasında tapılmadı. Yalnız admin tərəfindən qeydiyyata alınmış rəsmi tələbələr qeydiyyatdan keçə bilər.`
      );
      return;
    }

    if (matchedStudentById.isRegistered) {
      setRegisterError(
        `Bu Tələbə ID (${matchedStudentById.studentId} — ${matchedStudentById.name}) artıq qeydiyyatdan keçib. Zəhmət olmasa birbaşa daxil olun.`
      );
      return;
    }

    if (!phone.trim()) {
      setRegisterError('Zəhmət olmasa əlaqə nömrənizi daxil edin.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setRegisterError('Zəhmət olmasa düzgün Gmail / E-poçt ünvanınızı daxil edin.');
      return;
    }

    if (password.length < 6) {
      setRegisterError('Şəxsi şifrə ən azı 6 simvoldan ibarət olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError('Daxil edilən şifrələr bir-biri ilə üst-üstə düşmür.');
      return;
    }

    const updatedStudent: Student = {
      ...matchedStudentById,
      name: matchedStudentById.name,
      passwordHash: password.trim(),
      phone: phone.trim(),
      email: email.trim(),
      isRegistered: true,
    };

    // Save updated student
    onRegisterStudent(updatedStudent);

    // Provide feedback and switch to login page
    setRegisterSuccessMsg(
      `Hörmətli ${matchedStudentById.name}, qeydiyyatınız uğurla tamamlandı! Tələbə ID (${matchedStudentById.studentId}) və təyin etdiyiniz şifrə ilə daxil ola bilərsiniz.`
    );
    setLoginIdentifier(matchedStudentById.studentId);
    setLoginPassword('');
    setAuthMode('login');

    // Reset register fields
    setRegisterStudentId('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-between relative overflow-hidden text-slate-100 antialiased selection:bg-[#5300b7] selection:text-white">
      {/* Background Lighting Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-[#5300b7]/25 blur-[160px]" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#1e1b4b]/70 blur-[150px]" />
      </div>

      {/* Top Navbar */}
      <header className="w-full px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#5300b7] to-[#7c3aed] flex items-center justify-center text-white shadow-xl shadow-purple-950/40 shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-xl tracking-tight text-white block leading-tight">
              E-LDPTM
            </span>
            <span className="text-[10px] sm:text-[11px] text-purple-300 font-semibold tracking-wide uppercase">
              Yüksək Texniki Peşə (YTP) Portalı
            </span>
          </div>
        </div>
      </header>

      {/* Main Center Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 relative z-10 my-2 sm:my-4">
        <div className="w-full max-w-xl bg-slate-900/85 backdrop-blur-2xl border border-slate-700/60 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-purple-950/60 relative">
          {/* Header Banner */}
          <div className="text-center mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {authMode === 'login' ? 'Tələbə Girişi' : 'Tələbə Qeydiyyatı'}
            </h2>
          </div>

          {/* Registration Success Notification (when redirected to login) */}
          {registerSuccessMsg && authMode === 'login' && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <strong className="block font-bold text-emerald-200">Təbriklər!</strong>
                <span>{registerSuccessMsg}</span>
              </div>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tələbə ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder=" "
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Şəxsi Şifrə
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder=" "
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#5300b7] to-[#7c3aed] hover:from-[#430094] hover:to-[#6d28d9] text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-2"
              >
                <span>Şəxsi Kabinetə Daxil Ol</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Bottom prompt for registration */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
                <p className="text-xs sm:text-sm text-slate-400">
                  Hesabınız yoxdur?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setRegisterError(null);
                      setRegisterSuccessMsg(null);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-bold hover:underline cursor-pointer ml-1"
                  >
                    Qeydiyyatdan keçin
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTRATION FORM - STUDENT ID VERIFICATION */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Identification: Student ID Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tələbə ID
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    required
                    placeholder=" "
                    value={registerStudentId}
                    onChange={(e) => {
                      setRegisterStudentId(e.target.value);
                      setRegisterError(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Verification Feedback Badges */}
              {cleanRegisterId.length >= 2 && !matchedStudentById && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-rose-200">
                      Tələbə ID ({cleanRegisterId}) bazada tapılmadı
                    </span>
                    <p className="text-rose-300/90 text-[11px]">
                      Yalnız mərkəz administrasiyası tərəfindən rəsmi Tələbə ID təyin olunmuş tələbələr qeydiyyatdan keçə bilər.
                    </p>
                  </div>
                </div>
              )}

              {matchedStudentById && matchedStudentById.isRegistered && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <span className="font-semibold block text-amber-100">
                      Bu Tələbə ID üzrə hesab artıq qeydiyyatdan keçib
                    </span>
                    <p className="text-[11px]">
                      Hörmətli <strong className="text-white">{matchedStudentById.name}</strong>, portalda hesabınız aktivdir.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier(matchedStudentById.studentId);
                        setAuthMode('login');
                        setRegisterError(null);
                      }}
                      className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <span>Giriş səhifəsinə keç</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {matchedStudentById && !matchedStudentById.isRegistered && (
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-slate-200 flex items-center justify-between shadow-inner animate-in fade-in">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{matchedStudentById.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      İxtisas: <strong className="text-white">{matchedStudentById.specialty}</strong> • Kurs: <strong className="text-white">{matchedStudentById.group}</strong>
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
              )}

              {/* Part 2: Student enters personal contact & password details */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <div className="text-[11px] text-purple-300 font-medium flex items-center gap-1">
                  <span>Şəxsi əlaqə və şifrə məlumatlarınızı daxil edin:</span>
                </div>

                {/* Əlaqə Nömrəsi və Gmail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Əlaqə Nömrəsi
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="tel"
                        required
                        placeholder=" "
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (registerError) setRegisterError(null);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Gmail / E-poçt Hesabı
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="email"
                        required
                        placeholder=" "
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (registerError) setRegisterError(null);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Şəxsi Şifrə və Şifrənin Təkrarı */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Şəxsi Şifrə Təyin Edin
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        placeholder="Ən azı 6 simvol"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (registerError) setRegisterError(null);
                        }}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Şifrənin Təkrarı
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        placeholder="Şifrəni təkrar daxil edin"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (registerError) setRegisterError(null);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {registerError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{registerError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={Boolean(matchedStudentById?.isRegistered)}
                className="w-full py-3.5 bg-gradient-to-r from-[#5300b7] to-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#430094] hover:to-[#6d28d9] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-3"
              >
                <span>Qeydiyyatdan keçin</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                Hesabınız aktivdir?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setRegisterError(null);
                  }}
                  className="text-purple-400 hover:text-purple-300 font-bold hover:underline cursor-pointer ml-1"
                >
                  Giriş səhifəsinə qayıt
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 relative z-10 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>Lənkəran Dövlət Peşə Təhsil Mərkəzi — Yüksək Texniki Peşə (YTP) © 2026</span>
        </div>
      </footer>
    </div>
  );
};
