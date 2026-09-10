import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Clock,
  LogOut,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart3,
  Shield,
  Building2,
  Check,
  Percent,
  Sparkles
} from 'lucide-react';
import { ExamSession, GradeBookCourse, StudentUser } from '../types';

interface PublicPortalViewProps {
  student: StudentUser;
  courses: GradeBookCourse[];
  sessions: ExamSession[];
  onLogout: () => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  student,
  courses,
  sessions,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'grades' | 'schedule' | 'attendance' | 'rules'>(
    'grades'
  );

  // Filter courses for this student (either by group or explicit student grade record)
  const studentCoursesWithGrades = courses
    .map((course) => {
      const studentGrade = course.grades.find(
        (g) =>
          g.studentId === student.id ||
          g.idNumber.toLowerCase() === student.studentId.toLowerCase() ||
          g.studentName.toLowerCase().includes(student.name.toLowerCase())
      );

      const isForMyGroup =
        course.group.toLowerCase().trim() === student.group.toLowerCase().trim();

      if (!studentGrade && !isForMyGroup) {
        return null;
      }

      return {
        course,
        grade: studentGrade || null,
      };
    })
    .filter(Boolean) as Array<{
    course: GradeBookCourse;
    grade: {
      studentId: string;
      studentName: string;
      idNumber: string;
      seminar: number | null;
      laboratory: number | null;
      independentWork: number | null;
      colloquium: number | null;
      examScore?: number | null;
    } | null;
  }>;

  // Filter sessions for student's group
  const studentSessions = sessions.filter(
    (s) =>
      s.group.toLowerCase().trim() === student.group.toLowerCase().trim() ||
      s.items.some(
        (item) =>
          item.studentId.toLowerCase() === student.studentId.toLowerCase() ||
          item.studentName.toLowerCase().includes(student.name.toLowerCase())
      )
  );

  // Calculate overall statistics
  const totalCourses = studentCoursesWithGrades.length;
  let totalEntryScore = 0;
  let scoredCoursesCount = 0;

  studentCoursesWithGrades.forEach(({ grade }) => {
    if (grade) {
      const entryScore =
        (grade.seminar || 0) +
        (grade.laboratory || 0) +
        (grade.independentWork || 0) +
        (grade.colloquium || 0);
      if (entryScore > 0) {
        totalEntryScore += entryScore;
        scoredCoursesCount++;
      }
    }
  });

  const averageEntryScore =
    scoredCoursesCount > 0 ? (totalEntryScore / scoredCoursesCount).toFixed(1) : '0';

  const getLetterScore = (total: number) => {
    if (total >= 91) return { letter: 'A', text: 'Əla', color: 'text-emerald-700 bg-emerald-50' };
    if (total >= 81) return { letter: 'B', text: 'Çox yaxşı', color: 'text-blue-700 bg-blue-50' };
    if (total >= 71) return { letter: 'C', text: 'Yaxşı', color: 'text-cyan-700 bg-cyan-50' };
    if (total >= 61) return { letter: 'D', text: 'Kafi', color: 'text-amber-700 bg-amber-50' };
    if (total >= 51) return { letter: 'E', text: 'Qənaətbəxş', color: 'text-orange-700 bg-orange-50' };
    return { letter: 'F', text: 'Qeyri-kafi', color: 'text-rose-700 bg-rose-50' };
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#121c2a] flex flex-col antialiased">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand & Specialty */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5300b7] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-purple-950/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#121c2a] tracking-tight">
                  E-LDPTM
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5300b7] text-[10px] font-bold uppercase tracking-wider">
                  YTP Şəxsi Kabinet
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Lənkəran Dövlət Peşə Təhsil Mərkəzi
              </p>
            </div>
          </div>

          {/* Student Profile Overview & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {student.name}
              </span>
              <span className="text-[11px] font-mono text-purple-700 font-semibold">
                {student.studentId} {student.group && student.group !== 'YTP' ? `• Qrup: ${student.group}` : '• YTP'}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="Kabinetdən Çıxış"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Çıxış</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Profile Card */}
      <section className="bg-gradient-to-r from-[#5300b7] via-[#6d28d9] to-[#7c3aed] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identity info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-inner">
              {student.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {student.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold">
                  Aktiv Tələbə
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-purple-100/90 font-medium">
                <span>
                  Tələbə ID: <strong className="font-mono text-white">{student.studentId}</strong>
                </span>
                <span>•</span>
                <span>
                  FİN Kod: <strong className="font-mono text-white">{student.finCode || 'Qeyd olunub'}</strong>
                </span>
                <span>•</span>
                <span>
                  Qrup: <strong className="text-white">{student.group}</strong>
                </span>
              </div>

              <p className="text-xs text-purple-200 pt-0.5">
                İxtisas: <strong className="text-white">{student.specialty}</strong> (Yüksək Texniki Peşə)
              </p>
            </div>
          </div>

          {/* KPI Mini Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[11px] text-purple-200 uppercase font-semibold block">
                Semestr Fənləri
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {totalCourses} fənn
              </span>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[11px] text-purple-200 uppercase font-semibold block">
                Orta Giriş Balı
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {averageEntryScore} / 50
              </span>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] text-purple-200 uppercase font-semibold block">
                Təhsil Pilləsi
              </span>
              <span className="text-xs font-bold text-emerald-300 block mt-1">
                YTP Subbakalavr
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-3 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'grades'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Semestr Balları və Qiymətlər</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'schedule'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>İmtahan Cədvəli ({studentSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'attendance'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Davamiyyət İcmalı</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'rules'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>YTP Qiymətləndirmə Qaydaları</span>
          </button>
        </div>
      </div>

      {/* 4. Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: SEMESTER GRADES & ACTIVITY */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Cari Semestr Fənləri və Qiymətləndirmə Fəaliyyəti
                </h2>
                <p className="text-xs text-slate-500">
                  Admin panel tərəfindən daxil edilən və təsdiqlənən 50 ballıq aralıq qiymətləndirmə göstəriciləri
                </p>
              </div>
              <div className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl">
                Maksimum: 50 Bal Giriş + 50 Bal İmtahan = 100 Bal
              </div>
            </div>

            {studentCoursesWithGrades.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-600" />
                <h3 className="text-base font-bold text-slate-700">
                  Hazırda heç bir fənn üzrə jurnal daxil edilməyib
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Müəllimlər və inzibatçılar fənn ballarını daxil etdikdə burada dərhal əks olunacaq.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {studentCoursesWithGrades.map(({ course, grade }) => {
                  const seminar = grade?.seminar ?? null;
                  const lab = grade?.laboratory ?? null;
                  const indep = grade?.independentWork ?? null;
                  const colloq = grade?.colloquium ?? null;
                  const exam = grade?.examScore ?? null;

                  const entryTotal =
                    (seminar || 0) + (lab || 0) + (indep || 0) + (colloq || 0);

                  const hasScored =
                    seminar !== null ||
                    lab !== null ||
                    indep !== null ||
                    colloq !== null;

                  const isQualifiedForExam = entryTotal >= 17;
                  const finalTotal = exam !== null ? entryTotal + exam : entryTotal;
                  const letterData = exam !== null ? getLetterScore(finalTotal) : null;

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-purple-300 transition-all space-y-4"
                    >
                      {/* Course Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 bg-purple-50 text-[#5300b7] rounded-lg text-xs font-mono font-bold">
                              {course.subjectCode}
                            </span>
                            <h3 className="font-bold text-base text-slate-900">
                              {course.subject}
                            </h3>
                          </div>
                          <span className="text-xs text-slate-500 mt-1 block">
                            Qrup: <strong className="text-slate-700">{course.group}</strong> • İxtisas: {course.specialty} • Semestr: {course.semester}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              !hasScored
                                ? 'bg-slate-50 text-slate-500 border-slate-200'
                                : isQualifiedForExam
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {!hasScored
                              ? 'Qiymətləndirmə Gözlənilir'
                              : isQualifiedForExam
                              ? 'İmtahana Buraxılır'
                              : 'İmtahana Buraxılmır (Bal < 17)'}
                          </span>
                        </div>
                      </div>

                      {/* 50 Point Breakdown Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                          <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                            Seminar (Maks 10)
                          </span>
                          <span className="text-lg font-bold text-slate-800 font-mono">
                            {seminar !== null ? `${seminar} bal` : '-'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                          <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                            Laboratoriya (Maks 10)
                          </span>
                          <span className="text-lg font-bold text-slate-800 font-mono">
                            {lab !== null ? `${lab} bal` : '-'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                          <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                            Sərbəst İş (Maks 10)
                          </span>
                          <span className="text-lg font-bold text-slate-800 font-mono">
                            {indep !== null ? `${indep} bal` : '-'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                          <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                            Kollokvium (Maks 20)
                          </span>
                          <span className="text-lg font-bold text-slate-800 font-mono">
                            {colloq !== null ? `${colloq} bal` : '-'}
                          </span>
                        </div>

                        {/* Total Entry Score (50) */}
                        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center col-span-2 sm:col-span-1">
                          <span className="text-[11px] text-purple-700 font-extrabold uppercase block mb-1">
                            Giriş Balı (Maks 50)
                          </span>
                          <span className="text-xl font-black text-[#5300b7] font-mono">
                            {entryTotal} / 50
                          </span>
                        </div>
                      </div>

                      {/* Final summary footer */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>
                            {course.lastSaved
                              ? `Son yenilənmə: ${course.lastSaved}`
                              : 'Cari semestr üzrə aktiv jurnal'}
                          </span>
                        </div>

                        {letterData && (
                          <div className="flex items-center gap-2">
                            <span>Yekun Qiymət:</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-md font-bold font-mono ${letterData.color}`}
                            >
                              {finalTotal} bal ({letterData.letter} - {letterData.text})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXAM SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Qrupunuz Üzrə İmtahan Cədvəli
              </h2>
              <p className="text-xs text-slate-500">
                YTP {student.group} qrupu üçün planlaşdırılmış imtahan sessiyaları
              </p>
            </div>

            {studentSessions.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                Qrupunuz üçün hazırda heç bir imtahan sessiyası təyin edilməyib.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 bg-purple-50 text-[#5300b7] rounded-lg font-mono font-bold text-xs">
                        {s.subjectCode}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          s.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-700'
                            : s.status === 'ongoing'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {s.status === 'upcoming'
                          ? 'Planlaşdırılır'
                          : s.status === 'ongoing'
                          ? 'İmtahan Gedir'
                          : 'Tamamlandı'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{s.subject}</h3>

                    <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>Tarix: <strong>{s.date}</strong> saat <strong>{s.time}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <span>İmtahan Zalı: <strong>{s.room}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <span>Nəzarətçi: <strong>{s.supervisor || 'Təyin olunur'}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Davamiyyət və Dərsdə İştirak Monitorinqi
              </h2>
              <p className="text-xs text-slate-500">
                Subbakalavr təhsil standartları üzrə fənlər üzrə qayıb limitləri və iştirak payı
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-semibold block mb-1">
                  Ümumi İştirak Payı
                </span>
                <span className="text-3xl font-black text-emerald-600">100%</span>
                <p className="text-[11px] text-slate-400 mt-2">
                  Qayıb limiti aşılmayıb
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-semibold block mb-1">
                  İcazə Verilən Maksimum Qayıb
                </span>
                <span className="text-3xl font-black text-slate-800">25%</span>
                <p className="text-[11px] text-slate-400 mt-2">
                  25%-dən çox qayıb imtahandan məhrumiyyətdir
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-semibold block mb-1">
                  Status
                </span>
                <span className="text-lg font-bold text-emerald-600 mt-2 block">
                  İmtahana İcazəli
                </span>
                <p className="text-[11px] text-slate-400 mt-2">
                  Davamiyyət üzrə heç bir məhdudiyyət yoxdur
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: YTP RULES */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900">
                Yüksək Texniki Peşə (YTP) Tədris və Qiymətləndirmə Təlimatı
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Subbakalavr təhsil proqramı çərçivəsində tətbiq edilən əsas meyarlar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>50 Ballıq İmtahanöncəsi Qiymətləndirmə</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Semestr ərzində tələbə seminar (10 bal), laboratoriya (10 bal), sərbəst iş (10 bal)
                  və kollokviumlardan (20 bal) maksimum 50 bal toplayır.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>İmtahana Buraxılış Şərti (17 Bal)</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tələbənin imtahana buraxılması üçün semestr ərzində toplanan giriş balı
                  ən azı 17 bal olmalıdır. 17 baldan aşağı olduqda tələbə imtahana buraxılmır.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Yekun Qiymətləndirmə Şkalası</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A (91-100): Əla, B (81-90): Çox yaxşı, C (71-80): Yaxşı, D (61-70): Kafi,
                  E (51-60): Qənaətbəxş, F (51-dən aşağı): Qeyri-kafi (kəsr).
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs">
                    4
                  </span>
                  <span>Subbakalavr Diplomuna Təsiri</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  YTP pilləsini uğurla başa vuran məzunlar subbakalavr dərəcəsi qazanır və
                  ali təhsil müəssisələrinə müsabiqədənkənar və ya imtiyazlı qəbul hüququ əldə edirlər.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Lənkəran Dövlət Peşə Təhsil Mərkəzi — Yüksək Texniki Peşə (YTP) Şəxsi Kabineti © 2026
      </footer>
    </div>
  );
};
