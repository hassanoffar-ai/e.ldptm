import React, { useState } from 'react';
import {
  Shield,
  Search,
  Ticket,
  Calendar,
  Award,
  BookOpen,
  MapPin,
  Clock,
  Printer,
  ChevronRight,
  Lock,
  GraduationCap,
  FileCheck,
  AlertCircle,
  QrCode,
  Sparkles,
  Phone,
  Mail,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { ExamSession, GradeBookCourse, Student } from '../types';

interface PublicPortalViewProps {
  students: Student[];
  sessions: ExamSession[];
  courses: GradeBookCourse[];
  onNavigateToAdmin: () => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  students,
  sessions,
  courses,
  onNavigateToAdmin,
}) => {
  const [activeSection, setActiveSection] = useState<
    'search_ticket' | 'schedule' | 'grades' | 'rules'
  >('search_ticket');

  const [searchQuery, setSearchQuery] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // For grades search in public
  const [gradeSearchGroup, setGradeSearchGroup] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFoundStudent(null);
      return;
    }

    const match = students.find(
      (s) =>
        s.studentId.toLowerCase() === query ||
        s.name.toLowerCase().includes(query) ||
        (s.phone && s.phone.includes(query))
    );

    setFoundStudent(match || null);
  };

  // Find all exam items for the found student
  const studentExamItems = foundStudent
    ? sessions.flatMap((session) => {
        const item = session.items.find(
          (i) =>
            i.studentId === foundStudent.studentId ||
            i.studentName.toLowerCase() === foundStudent.name.toLowerCase()
        );
        return item
          ? [
              {
                session,
                item,
              },
            ]
          : [];
      })
    : [];

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#121c2a] flex flex-col antialiased">
      {/* 1. Public Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Institution Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5300b7] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-purple-900/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#121c2a] tracking-tight">
                  E-LDPTM
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5300b7] text-[10px] font-bold tracking-wider uppercase">
                  Tələbə Portalı
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Lənkəran Dövlət Peşə Təhsil Mərkəzi
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveSection('search_ticket')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeSection === 'search_ticket'
                  ? 'bg-white text-[#5300b7] shadow-xs'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Bileti Yoxla
            </button>
            <button
              onClick={() => setActiveSection('schedule')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeSection === 'schedule'
                  ? 'bg-white text-[#5300b7] shadow-xs'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              İmtahan Cədvəli
            </button>
            <button
              onClick={() => setActiveSection('grades')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeSection === 'grades'
                  ? 'bg-white text-[#5300b7] shadow-xs'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Nəticələr
            </button>
            <button
              onClick={() => setActiveSection('rules')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeSection === 'rules'
                  ? 'bg-white text-[#5300b7] shadow-xs'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Təlimatlar
            </button>
          </nav>

          {/* Admin Girişi Button */}
          <div className="flex items-center gap-3">
            <button
              id="public-to-admin-btn"
              onClick={onNavigateToAdmin}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5300b7] hover:bg-[#430094] text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Girişi</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-b from-white via-purple-50/40 to-[#f8f9ff] border-b border-slate-200/80 py-12 md:py-16 relative overflow-hidden no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-[#5300b7] text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rəsmi Elektron İmtahan Portalı</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            İmtahan Biletini və Cədvəlini{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5300b7] to-[#7c3aed]">
              Onlayn Yoxla
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Lənkəran Dövlət Peşə Təhsil Mərkəzinin tələbələri üçün imtahan zalları,
            kompüter bölgüsü və rəsmi imtahan biletlərinin birbaşa yoxlanışı sistemi.
          </p>

          {/* Quick Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-200/80"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tələbə bilet kodu (məs: TL-2024-001) və ya Ad Soyad..."
                className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Axtar və Yoxla</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>Məsələn:</span>
            {students.slice(0, 3).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setSearchQuery(st.studentId);
                  setFoundStudent(st);
                  setHasSearched(true);
                  setActiveSection('search_ticket');
                }}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 rounded-lg border border-slate-200 text-[#5300b7] font-mono text-[11px] cursor-pointer transition-colors"
              >
                {st.studentId} ({st.name.split(' ')[0]})
              </button>
            ))}
            {students.length === 0 && (
              <span className="italic text-slate-400">
                (Bazada tələbə qeydiyyatı admin tərəfindən aparılır)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 3. Main Dynamic Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: Search Ticket Results */}
        {activeSection === 'search_ticket' && (
          <div className="space-y-6">
            {hasSearched && !foundStudent && (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Tələbə Məlumatı Tapılmadı
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
                  Daxil etdiyiniz &quot;{searchQuery}&quot; üzrə sistemdə heç bir tələbə qeydi tapılmadı.
                  Zəhmət olmasa tələbə kodunuzu və ya adınızı dəqiq daxil edin.
                </p>
              </div>
            )}

            {foundStudent && (
              <div className="space-y-6">
                {/* Student Overview Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#5300b7] font-bold text-xl flex items-center justify-center">
                      {foundStudent.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {foundStudent.name}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          Aktiv Tələbə
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                        <span>
                          Kod: <strong className="font-mono text-slate-700">{foundStudent.studentId}</strong>
                        </span>
                        <span>•</span>
                        <span>Qrup: <strong className="text-slate-700">{foundStudent.group}</strong></span>
                        <span>•</span>
                        <span>İxtisas: <strong className="text-slate-700">{foundStudent.specialty}</strong></span>
                      </div>
                    </div>
                  </div>

                  {studentExamItems.length > 0 && (
                    <button
                      onClick={handlePrintTicket}
                      className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-[#5300b7] border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Rəsmi Bileti Çap Et</span>
                    </button>
                  )}
                </div>

                {/* Exam Tickets for Student */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#5300b7]" />
                    <span>Təyin Edilmiş İmtahan Biletləri ({studentExamItems.length})</span>
                  </h3>

                  {studentExamItems.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
                      Bu tələbə üçün hazırda heç bir aktiv imtahan protokolu təyin edilməyib.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {studentExamItems.map(({ session, item }) => (
                        <div
                          key={session.id + item.id}
                          className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />

                          <div>
                            {/* Header of Ticket */}
                            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                                  Elektron İmtahan Buraxılış Vərəqəsi
                                </span>
                                <h4 className="text-base font-bold text-slate-900 mt-1">
                                  {session.subject}
                                </h4>
                                <span className="text-xs text-slate-500">
                                  Fənn kodu: {session.subjectCode}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-sm font-bold text-[#5300b7] bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                                  № {item.ticketNo}
                                </span>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 my-4 text-xs">
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Tarix və Saat</span>
                                </div>
                                <div className="font-bold text-slate-800">
                                  {session.date} | {session.time}
                                </div>
                              </div>

                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                                  <span>İmtahan Zalı</span>
                                </div>
                                <div className="font-bold text-slate-800">
                                  {session.room || item.room}
                                </div>
                              </div>

                              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
                                <div className="text-[11px] text-purple-600 font-semibold mb-1">
                                  Kompüter Masası:
                                </div>
                                <div className="text-sm font-extrabold text-[#5300b7] font-mono">
                                  MASA-{item.computerNo}
                                </div>
                              </div>

                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-[11px] text-slate-400 mb-1">
                                  Nəzarətçi:
                                </div>
                                <div className="font-medium text-slate-700 truncate">
                                  {session.supervisor || 'Təyin edilməyib'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer with QR / Validation */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <div className="flex items-center gap-2">
                              <QrCode className="w-5 h-5 text-purple-700" />
                              <span>Rəsmi E-LDPTM Təsdiqi</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">
                              Bilet saatı: {item.ticketTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If user hasn't searched yet, show interactive cards */}
            {!hasSearched && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div
                  onClick={() => setActiveSection('schedule')}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5300b7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    İmtahan Cədvəlləri
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Mərkəzdə keçirilən bütün imtahanların tarix, saat və zal siyahısını canlı izləyin.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#5300b7]">
                    <span>Cədvələ Bax</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('grades')}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bal və Qiymət Nəticələri
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Müəllimlər tərəfindən dərc edilmiş imtahanöncəsi və yekun balları şəffaf yoxlayın.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-700">
                    <span>Ballara Bax</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('rules')}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    İmtahan Qaydaları
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Elektron test imtahanı zamanı tələbələrin əməl etməli olduğu təhlükəsizlik təlimatları.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <span>Qaydaları Oxu</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Live Schedule */}
        {activeSection === 'schedule' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Planlaşdırılan İmtahan Cədvəli
                </h2>
                <p className="text-xs text-slate-500">
                  Cari semestr üzrə keçirilən bütün elektron imtahan sessiyaları
                </p>
              </div>
              <span className="text-xs px-3 py-1 bg-purple-100 text-[#5300b7] rounded-full font-bold">
                Cəmi {sessions.length} sessiya
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
                Hazırda sistemdə planlaşdırılmış imtahan sessiyası yoxdur.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-[#5300b7]">
                        {s.subjectCode}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          s.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-700'
                            : s.status === 'ongoing'
                            ? 'bg-amber-50 text-amber-700 animate-pulse'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {s.status === 'upcoming'
                          ? 'Gözlənilir'
                          : s.status === 'ongoing'
                          ? 'İmtahan Gedir'
                          : 'Tamamlandı'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{s.subject}</h3>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tarix: {s.date} ({s.time})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Zal: {s.room}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>Qrup: {s.group} ({s.specialty})</span>
                      </div>
                    </div>

                    <div className="pt-2 text-right">
                      <span className="text-[11px] text-slate-400">
                        Qeydiyyatda: <strong>{s.items.length} tələbə</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Published Grades */}
        {activeSection === 'grades' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Dərc Edilmiş Nəticələr və Qiymət Cədvəlləri
                </h2>
                <p className="text-xs text-slate-500">
                  Tələbələr və valideynlər üçün şəffaf imtahanöncəsi və kollokvium balları
                </p>
              </div>
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Qrup və ya fənn üzrə axtar..."
                  value={gradeSearchGroup}
                  onChange={(e) => setGradeSearchGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
                Hazırda heç bir fənn qiymət jurnalı dərc olunmayıb.
              </div>
            ) : (
              <div className="space-y-4">
                {courses
                  .filter(
                    (c) =>
                      !gradeSearchGroup ||
                      c.group.toLowerCase().includes(gradeSearchGroup.toLowerCase()) ||
                      c.subject.toLowerCase().includes(gradeSearchGroup.toLowerCase())
                  )
                  .map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">
                              {course.subject}
                            </h3>
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-[#5300b7] text-[10px] font-bold">
                              {course.group}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            İxtisas: {course.specialty} • Semestr: {course.semester}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                          Rəsmi Qiymət Cədvəli
                        </span>
                      </div>

                      {/* Grades Table */}
                      <div className="overflow-x-auto mt-3">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                            <tr>
                              <th className="py-2 px-3">№</th>
                              <th className="py-2 px-3">Tələbə Adı</th>
                              <th className="py-2 px-3">Tələbə Kodu</th>
                              <th className="py-2 px-3 text-center">Seminar (10)</th>
                              <th className="py-2 px-3 text-center">Laboratoriya (10)</th>
                              <th className="py-2 px-3 text-center">Sərbəst İş (10)</th>
                              <th className="py-2 px-3 text-center">Kollokvium (20)</th>
                              <th className="py-2 px-3 text-center font-bold text-purple-700">İmtahana Giriş Balı (50)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {course.grades.map((g, idx) => {
                              const total =
                                (g.seminar || 0) +
                                (g.laboratory || 0) +
                                (g.independentWork || 0) +
                                (g.colloquium || 0);
                              return (
                                <tr key={g.studentId} className="hover:bg-slate-50/60">
                                  <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                                  <td className="py-2 px-3 font-semibold text-slate-800">
                                    {g.studentName}
                                  </td>
                                  <td className="py-2 px-3 font-mono text-slate-500">
                                    {g.idNumber}
                                  </td>
                                  <td className="py-2 px-3 text-center">{g.seminar ?? '-'}</td>
                                  <td className="py-2 px-3 text-center">{g.laboratory ?? '-'}</td>
                                  <td className="py-2 px-3 text-center">{g.independentWork ?? '-'}</td>
                                  <td className="py-2 px-3 text-center">{g.colloquium ?? '-'}</td>
                                  <td className="py-2 px-3 text-center font-bold text-purple-800">
                                    {total} / 50
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Rules & Guidelines */}
        {activeSection === 'rules' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Elektron İmtahan Qaydaları və Tələblər
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tələbələrin imtahan zalında riayət etməli olduğu əsas nizam-intizam təlimatı
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Şəxsiyyəti Təsdiq Edən Sənəd</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  İmtahan zalına daxil olarkən tələbə şəxsiyyət vəsiqəsini və çap edilmiş
                  elektron imtahan biletini nəzarətçiyə təqdim etməlidir.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Vaxtında İştirak</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  İmtahanın başlanmasına ən azı 15 dəqiqə qalmış zala gəlmək tələb olunur.
                  İmtahan başladıqdan sonra zala tələbə buraxılmır.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Kompüter və Bilet Uyğunluğu</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hər bir tələbə yalnız biletində göstərilmiş nömrəli kompüter arxasında
                  əyləşməli və imtahan protokolunu imzalamalıdır.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs">
                    4
                  </span>
                  <span>Elektron Vasitələrin Qadağası</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Zala mobil telefon, smart saat, kalkulyator və digər rabitə cihazları
                  keçirmək qəti qadağandır və imtahandan xaric olunma səbəbidir.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-800">E-LDPTM</span> — Lənkəran Dövlət Peşə Təhsil Mərkəzi © 2026.
            Bütün hüquqlar qorunur.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToAdmin}
              className="text-[#5300b7] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>İdarəetmə Paneli (/admin)</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
