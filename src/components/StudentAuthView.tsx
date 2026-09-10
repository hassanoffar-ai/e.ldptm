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
  Sparkles,
  ShieldCheck,
  Building2,
  BookOpen
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
  const [loginIdentifier, setLoginIdentifier] = useState(''); // ID or FIN
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [finCode, setFinCode] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState<string | null>(null);

  // Handle Student Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanId || !cleanPass) {
      setLoginError('Zəhmət olmasa Tələbə ID / FİN və şifrənizi daxil edin.');
      return;
    }

    // Match by studentId or finCode
    const matched = students.find(
      (s) =>
        s.studentId.toLowerCase() === cleanId ||
        (s.finCode && s.finCode.toLowerCase() === cleanId)
    );

    if (!matched) {
      setLoginError(
        'Daxil edilən Tələbə ID və ya FİN kod sistemdə tapılmadı. Əgər qeydiyyatdan keçməmisinizsə, aşağıdan qeydiyyatdan keçin.'
      );
      return;
    }

    // Check password if set, or default fallback
    const expectedPassword = matched.passwordHash || '123456';
    if (cleanPass !== expectedPassword) {
      setLoginError('Daxil edilmiş şifrə yanlışdır. Zəhmət olmasa yenidən yoxlayın.');
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

  // Handle Student Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setRegisterError('Ad və soyadınızı daxil edin.');
      return;
    }

    const cleanFin = finCode.trim().toUpperCase();
    if (cleanFin.length < 5) {
      setRegisterError('FİN kod düzgün daxil edilməlidir (şəxsiyyət vəsiqəsindən 7 simvol).');
      return;
    }

    const cleanStudentId = studentId.trim().toUpperCase();
    if (!cleanStudentId) {
      setRegisterError('Tələbə ID daxil edilməlidir (məsələn: YTP-2024-001).');
      return;
    }

    // Check duplicate studentId
    const existing = students.find(
      (s) =>
        s.studentId.toUpperCase() === cleanStudentId ||
        (s.finCode && s.finCode.toUpperCase() === cleanFin)
    );

    if (existing) {
      setRegisterError(
        'Bu Tələbə ID və ya FİN kod artıq sistemdə qeydiyyatdan keçib. Zəhmət olmasa birbaşa login olun.'
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

    const fullName = `${lastName.trim()} ${firstName.trim()}`;
    const newStudent: Student = {
      id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      studentId: cleanStudentId,
      finCode: cleanFin,
      name: fullName,
      group: 'YTP',
      specialty: 'Yüksək Texniki Peşə',
      phone: phone.trim(),
      email: email.trim(),
      passwordHash: password,
      status: 'active',
    };

    // Save student to global database
    onRegisterStudent(newStudent);

    // Provide feedback and switch to login page
    setRegisterSuccessMsg(
      `Qeydiyyatınız uğurla tamamlandı! Zəhmət olmasa ID: "${cleanStudentId}" və təyin etdiyiniz şifrə ilə daxil olun.`
    );
    setLoginIdentifier(cleanStudentId);
    setLoginPassword('');
    setAuthMode('login');

    // Reset register fields
    setFirstName('');
    setLastName('');
    setFinCode('');
    setStudentId('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
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

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-purple-200">
          <Building2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Lənkəran Dövlət Peşə Təhsil Mərkəzi</span>
        </div>
      </header>

      {/* Main Center Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 relative z-10 my-2 sm:my-4">
        <div className="w-full max-w-xl bg-slate-900/85 backdrop-blur-2xl border border-slate-700/60 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-purple-950/60 relative">
          {/* Header Banner */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold mb-3 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>YTP Subbakalavr Təhsili</span>
            </div>
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
                  Tələbə ID və ya FİN Kod
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Məs: YTP-2024-001 və ya FİN kod"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
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
                  <span>Qeydiyyatdan Keçin</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTRATION FORM */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Adınız *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Məsələn: Əli"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Məsələn: Məmmədov"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    FİN Kod (Şəxsiyyət vəsiqəsi) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    placeholder="7 simvol (məs: 5ABC123)"
                    value={finCode}
                    onChange={(e) => setFinCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tələbə ID-si *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: YTP-2024-001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Əlaqə Nömrəsi *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+994 (50) 000-00-00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-poçt Ünvanı
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="telebe@mail.ru"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Şifrə Təyin Edin *
                  </label>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    placeholder="Ən azı 4 simvol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                  />
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

              {registerError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{registerError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#5300b7] to-[#7c3aed] hover:from-[#430094] hover:to-[#6d28d9] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-3"
              >
                <span>Qeydiyyatı Tamamla</span>
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
      <footer className="w-full py-4 text-center text-xs text-slate-500 relative z-10">
        Lənkəran Dövlət Peşə Təhsil Mərkəzi — Yüksək Texniki Peşə (YTP) © 2026
      </footer>
    </div>
  );
};
