import React, { useState } from 'react';
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
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  BookOpen,
} from 'lucide-react';
import { Student, StudentUser } from '../types';
import { saveStoredStudentSession } from '../data/auth';

interface StudentAuthViewProps {
  students: Student[];
  onRegisterStudent: (newStudent: Student) => void;
  onLoginSuccess: (studentUser: StudentUser) => void;
  onNavigateToAdmin?: () => void;
}

export const StudentAuthView: React.FC<StudentAuthViewProps> = ({
  students,
  onRegisterStudent,
  onLoginSuccess,
  onNavigateToAdmin,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState(''); // ID or FIN
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form states
  const [finCode, setFinCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState<string | null>(null);

  // Live lookup of student by FIN code
  const cleanRegisterFin = finCode.trim().toUpperCase();
  const matchedRegisterStudent =
    cleanRegisterFin.length === 7
      ? students.find(
          (s) => s.finCode && s.finCode.trim().toUpperCase() === cleanRegisterFin
        ) || null
      : null;

  // Handle Student Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanId || !cleanPass) {
      setLoginError('Zəhmət olmasa FİN kod və ya Tələbə ID və şifrənizi daxil edin.');
      return;
    }

    // Match by finCode or studentId
    const matched = students.find(
      (s) =>
        (s.finCode && s.finCode.toLowerCase() === cleanId) ||
        s.studentId.toLowerCase() === cleanId
    );

    if (!matched) {
      setLoginError(
        'Daxil edilən FİN kod və ya Tələbə ID sistemdə tapılmadı. Əgər qeydiyyatdan keçməmisinizsə, aşağıdan qeydiyyatdan keçin.'
      );
      return;
    }

    // Check password if set, or default fallback
    const expectedPassword = matched.passwordHash || '123456';
    if (cleanPass !== expectedPassword) {
      if (!matched.isRegistered) {
        setLoginError(
          'Daxil edilmiş şifrə yanlışdır. Əgər portalda ilk dəfəsinizsə, aşağıdakı "Qeydiyyatdan Keçin" bölməsindən FİN kodunuzla şifrənizi təyin edin.'
        );
      } else {
        setLoginError('Daxil edilmiş şifrə yanlışdır. Zəhmət olmasa yenidən yoxlayın.');
      }
      return;
    }

    const sessionUser: StudentUser = {
      id: matched.id,
      studentId: matched.studentId,
      finCode: matched.finCode || '',
      name: matched.name,
      group: matched.group,
      specialty: matched.specialty,
      email: matched.email,
      phone: matched.phone,
    };

    saveStoredStudentSession(sessionUser);
    onLoginSuccess(sessionUser);
  };

  // Handle Student Registration using solely their FIN code
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    const cleanFin = finCode.trim().toUpperCase();
    if (cleanFin.length !== 7) {
      setRegisterError('FİN kod şəxsiyyət vəsiqəsindən dəqiq 7 simvol olmalıdır.');
      return;
    }

    // Match against students in database
    const matched = students.find(
      (s) => s.finCode && s.finCode.trim().toUpperCase() === cleanFin
    );

    if (!matched) {
      setRegisterError(
        `Daxil edilən FİN kod (${cleanFin}) mərkəzin tələbə bazasında tapılmadı. Yalnız Lənkəran Dövlət Peşə Təhsil Mərkəzində qeydiyyatda olan tələbələr qeydiyyatdan keçə bilər.`
      );
      return;
    }

    if (matched.isRegistered) {
      setRegisterError(
        `Bu FİN kod (${cleanFin} — ${matched.name}) artıq qeydiyyatdan keçib. Zəhmət olmasa birbaşa daxil olun.`
      );
      return;
    }

    if (password.length < 4) {
      setRegisterError('Şifrə ən azı 4 simvoldan ibarət olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError('Daxil edilən şifrələr bir-biri ilə üst-üstə düşmür.');
      return;
    }

    const updatedStudent: Student = {
      ...matched,
      passwordHash: password,
      phone: phone.trim() || matched.phone,
      email: email.trim() || matched.email,
      isRegistered: true,
    };

    // Save updated student to database
    onRegisterStudent(updatedStudent);

    // Provide feedback and switch to login page
    setRegisterSuccessMsg(
      `Hörmətli ${matched.name}, qeydiyyatınız uğurla tamamlandı! Təyin etdiyiniz şifrə ilə daxil ola bilərsiniz.`
    );
    setLoginIdentifier(cleanFin);
    setLoginPassword('');
    setAuthMode('login');

    // Reset register fields
    setFinCode('');
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

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-purple-200">
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Lənkəran Dövlət Peşə Təhsil Mərkəzi</span>
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
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
              {authMode === 'login'
                ? 'Semestr ballarınızı və fəaliyyətinizi izləmək üçün hesabınıza daxil olun'
                : 'Yüksək Texniki Peşə tələbəsi olaraq portalda şəxsi hesabınızı yaradın'}
            </p>
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
                  FİN Kod (və ya Tələbə ID)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="7 simvollu FİN kodunuz (məs: 5ABC123)"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono uppercase"
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
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Hesab şifrəniz"
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
              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2">
                <span className="text-xs text-slate-400 block">
                  Sistemdə hesabınız yoxdur?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setRegisterError(null);
                    setRegisterSuccessMsg(null);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-purple-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span>FİN Kod ilə Qeydiyyatdan Keçin</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTRATION FORM - FIN CODE ONLY */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setRegisterError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold mb-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Giriş səhifəsinə qayıt</span>
              </button>

              {/* FIN Code Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>FİN Kod (Şəxsiyyət vəsiqəsi) *</span>
                  <span className="text-[11px] font-mono text-purple-400 font-semibold">
                    {cleanRegisterFin.length}/7 simvol
                  </span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    required
                    maxLength={7}
                    placeholder="Məs: 5ABC123"
                    value={finCode}
                    onChange={(e) => {
                      setFinCode(e.target.value.toUpperCase());
                      setRegisterError(null);
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono uppercase tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Qeydiyyat yalnız mərkəzdə təhsil alan tələbənin öz 7 simvollu FİN kodu ilə aparılır.
                </p>
              </div>

              {/* Status 1: 7 chars entered but not found in students database */}
              {cleanRegisterFin.length === 7 && !matchedRegisterStudent && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block text-rose-200">
                      FİN kod ({cleanRegisterFin}) tələbə bazasında tapılmadı!
                    </span>
                    <p className="text-rose-300/90 leading-relaxed text-[11px]">
                      Yalnız Lənkəran Dövlət Peşə Təhsil Mərkəzində qeydiyyatda olan tələbələr portala qeydiyyatdan keçə bilər. Əgər bu mərkəzin tələbəsisinizsə, zəhmət olmasa tədris hissəsinə müraciət edin.
                    </p>
                  </div>
                </div>
              )}

              {/* Status 2: Found but already registered */}
              {matchedRegisterStudent && matchedRegisterStudent.isRegistered && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <span className="font-semibold block text-amber-100">
                      Bu FİN kod üzrə hesab artıq qeydiyyatdan keçib
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      Hörmətli <strong className="text-white">{matchedRegisterStudent.name}</strong>, portalda hesabınız artıq aktivdir. Birbaşa daxil ola bilərsiniz.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier(cleanRegisterFin);
                        setAuthMode('login');
                        setRegisterError(null);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <span>Giriş səhifəsinə keç</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Status 3: Found and eligible to register */}
              {matchedRegisterStudent && !matchedRegisterStudent.isRegistered && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  {/* Verified Card */}
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-slate-200 space-y-2.5 shadow-inner">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Tələbə Məlumatları Təsdiqləndi</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-purple-500/20">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ad, Soyad:</span>
                        <strong className="text-white text-sm">{matchedRegisterStudent.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Tələbə ID:</span>
                        <strong className="text-purple-300 font-mono">{matchedRegisterStudent.studentId}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Qrup:</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-200 font-semibold text-[11px] inline-block mt-0.5">
                          {matchedRegisterStudent.group}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">İxtisas:</span>
                        <span className="text-slate-300 text-[11px]">{matchedRegisterStudent.specialty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Password setup */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Şəxsi Şifrə Təyin Edin *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          placeholder="Ən azı 4 simvol"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-3 pr-8 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
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
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Şifrənin Təkrarı *
                      </label>
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        placeholder="Təkrar daxil edin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Optional Contact Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Əlaqə Nömrəsi <span className="text-[10px] text-slate-400">(İstəyə bağlı)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          placeholder={matchedRegisterStudent.phone || "+994 (50) 000-00-00"}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        E-poçt Ünvanı <span className="text-[10px] text-slate-400">(İstəyə bağlı)</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          placeholder={matchedRegisterStudent.email || "telebe@mail.ru"}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {registerError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{registerError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={cleanRegisterFin.length !== 7 || !matchedRegisterStudent || !!matchedRegisterStudent?.isRegistered}
                className="w-full py-3.5 bg-gradient-to-r from-[#5300b7] to-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#430094] hover:to-[#6d28d9] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-3"
              >
                <span>
                  {cleanRegisterFin.length === 7 && !matchedRegisterStudent
                    ? 'FİN Kod Tələbə Bazasında Tapılmadı'
                    : matchedRegisterStudent?.isRegistered
                    ? 'Artıq Qeydiyyatdan Keçilib'
                    : 'Qeydiyyatı Tamamla'}
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                Artıq hesabınız var?{' '}
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
