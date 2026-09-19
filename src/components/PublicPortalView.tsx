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
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExamSession, GradeBookCourse, SpecialtyModule, StudentGrade, StudentUser } from '../types';
import { getStoredModules, SEMESTERS_LIST } from '../data/mockData';

interface PublicPortalViewProps {
  student: StudentUser;
  courses: GradeBookCourse[];
  sessions: ExamSession[];
  onLogout: () => void;
  onNavigateToAdmin?: () => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  student,
  courses,
  sessions,
  onLogout,
  onNavigateToAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<
    'grades' | 'modules' | 'schedule' | 'attendance' | 'rules'
  >('grades');
  const [selectedSemesterForModules, setSelectedSemesterForModules] = useState<string>('all');
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);

  // Load modules list from localStorage or fallback
  const allModules: SpecialtyModule[] = React.useMemo(() => {
    return getStoredModules();
  }, []);

  // Filter modules for this student's specialty
  const mySpecialtyModules = React.useMemo(() => {
    return allModules.filter(
      (m) =>
        m.specialtyName.toLowerCase().trim() === student.specialty.toLowerCase().trim() ||
        student.specialty.toLowerCase().includes(m.specialtyName.toLowerCase()) ||
        m.specialtyName.toLowerCase().includes(student.specialty.toLowerCase())
    );
  }, [allModules, student.specialty]);

  // Filter courses for this student (either by group + specialty or explicit student grade record)
  const studentCoursesWithGrades = courses
    .map((course) => {
      const studentGrade = course.grades.find(
        (g) =>
          g.studentId === student.id ||
          g.idNumber.toLowerCase() === student.studentId.toLowerCase() ||
          (student.finCode && g.idNumber.toLowerCase() === student.finCode.toLowerCase()) ||
          g.studentName.toLowerCase().includes(student.name.toLowerCase())
      );

      const isForMyCohort =
        course.group.toLowerCase().trim() === student.group.toLowerCase().trim() &&
        (!course.specialty || course.specialty.toLowerCase().trim() === student.specialty.toLowerCase().trim());

      if (!studentGrade && !isForMyCohort) {
        return null;
      }

      return {
        course,
        grade: studentGrade || null,
      };
    })
    .filter(Boolean) as Array<{
    course: GradeBookCourse;
    grade: StudentGrade | null;
  }>;

  // Filter sessions for student's group and specialty
  const studentSessions = sessions.filter(
    (s) =>
      ((s.group.toLowerCase().trim() === student.group.toLowerCase().trim()) &&
       (!s.specialty || s.specialty.toLowerCase().trim() === student.specialty.toLowerCase().trim())) ||
      s.items.some(
        (item) =>
          item.studentId.toLowerCase() === student.studentId.toLowerCase() ||
          (student.finCode && item.studentId.toLowerCase() === student.finCode.toLowerCase()) ||
          item.studentName.toLowerCase().includes(student.name.toLowerCase())
      )
  );

  const calculateEntryScore = (g: StudentGrade) => {
    const att = g.attendance ?? 0;
    const sem = g.seminar ?? 0;
    const col1 = g.colloquium1 ?? (g.colloquium ? Math.min(g.colloquium, 15) : 0);
    const col2 = g.colloquium2 ?? (g.laboratory ? Math.min(g.laboratory, 15) : 0);
    return att + sem + col1 + col2;
  };

  const calculateTotalScore = (g: StudentGrade) => {
    return calculateEntryScore(g) + (g.examScore ?? 0);
  };

  // Calculate overall statistics
  const totalCourses = studentCoursesWithGrades.length;
  let totalEntryScore = 0;
  let scoredCoursesCount = 0;

  studentCoursesWithGrades.forEach(({ grade }) => {
    if (grade) {
      const entryScore = calculateEntryScore(grade);
      if (entryScore > 0) {
        totalEntryScore += entryScore;
        scoredCoursesCount++;
      }
    }
  });

  const averageEntryScore =
    scoredCoursesCount > 0 ? (totalEntryScore / scoredCoursesCount).toFixed(1) : '0';

  const getEvaluationStatus = (g: StudentGrade) => {
    const entry = calculateEntryScore(g);
    const exam = g.examScore;

    if (exam === null || exam === undefined) {
      if (entry >= 17) {
        return {
          isPassed: true,
          status: 'İmtahana Buraxılır',
          subtext: `Giriş balı: ${entry} / 50`,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
        };
      }
      return {
        isPassed: false,
        status: 'İmtahana Buraxılmır (Bal < 17)',
        subtext: `Giriş balı: ${entry} / 50`,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
      };
    }

    if (exam < 17) {
      return {
        isPassed: false,
        status: 'Kəsildi (İmtahan balı < 17)',
        subtext: `İmtahan: ${exam} bal`,
        color: 'text-rose-700 bg-rose-50 border-rose-200',
      };
    }

    const total = entry + exam;
    if (total <= 50) {
      return {
        isPassed: false,
        status: 'Kəsildi (Ümumi bal ≤ 50)',
        subtext: `Yekun: ${total} bal`,
        color: 'text-rose-700 bg-rose-50 border-rose-200',
      };
    }

    let letter = 'E';
    let text = 'Qənaətbəxş';
    if (total >= 91) {
      letter = 'A';
      text = 'Əla';
    } else if (total >= 81) {
      letter = 'B';
      text = 'Çox yaxşı';
    } else if (total >= 71) {
      letter = 'C';
      text = 'Yaxşı';
    } else if (total >= 61) {
      letter = 'D';
      text = 'Kafi';
    }

    return {
      isPassed: true,
      status: `Müvəffəq (${letter} — ${text})`,
      subtext: `Yekun: ${total} bal`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#121c2a] flex flex-col antialiased">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand & Specialty */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#5300b7] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-purple-950/20 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-[#121c2a] tracking-tight">
                  E-LDPTM
                </span>
                <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5300b7] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  YTP Şəxsi Kabinet
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Lənkəran Dövlət Peşə Təhsil Mərkəzi
              </p>
            </div>
          </div>

          {/* Student Profile Overview & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
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
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="Kabinetdən Çıxış"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Çıxış</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Profile Card */}
      <section className="bg-gradient-to-r from-[#5300b7] via-[#6d28d9] to-[#7c3aed] text-white py-6 sm:py-8 px-3 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Identity info */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-extrabold text-xl sm:text-3xl shadow-inner shrink-0">
              {student.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight break-words leading-tight">
                  {student.name}
                </h1>
                <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-200 text-[11px] sm:text-xs font-bold shrink-0">
                  Aktiv Tələbə
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-purple-100/90 font-medium">
                <span>
                  Tələbə ID: <strong className="font-mono text-white">{student.studentId || student.finCode}</strong>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] sm:text-[11px] text-purple-200 uppercase font-semibold block">
                Semestr Fənləri
              </span>
              <span className="text-lg sm:text-2xl font-black text-white">
                {totalCourses} fənn
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] sm:text-[11px] text-purple-200 uppercase font-semibold block">
                Orta Giriş Balı
              </span>
              <span className="text-lg sm:text-2xl font-black text-amber-300 font-mono">
                {averageEntryScore} / 50
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] sm:text-[11px] text-purple-200 uppercase font-semibold block">
                Təhsil Pilləsi
              </span>
              <span className="text-xs font-bold text-emerald-300 block mt-0.5 sm:mt-1">
                YTP Subbakalavr
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex space-x-1.5 sm:space-x-3 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'grades'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Semestr Balları və Qiymətlər</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'modules'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Modullar və Sillabuslar</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'schedule'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>İmtahan Cədvəli ({studentSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'attendance'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Davamiyyət İcmalı</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'rules'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>YTP Qiymətləndirmə Qaydaları</span>
          </button>
        </div>
      </div>

      {/* 4. Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Fərdi Peşə və Tədris Məlumatları Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 text-[#5300b7] flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {student.specialty}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5300b7] text-xs font-bold">
                  {student.group}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Lənkəran Dövlət Peşə Təhsil Mərkəzi • Yüksək Texniki Peşə (Subbakalavr)
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                <span>Tələbə ID: <strong className="font-mono text-[#5300b7]">{student.studentId || student.finCode}</strong></span>
                {student.email && !student.email.includes('@eldptm.edu.az') && <span>E-poçt: <strong className="text-slate-800">{student.email}</strong></span>}
                {student.phone && <span>Əlaqə: <strong className="text-slate-800">{student.phone}</strong></span>}
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: SEMESTER GRADES & ACTIVITY */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Cari Semestr Modulları və Qiymətləndirmə Nəticələri
                </h2>
              </div>
              <div className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-xl">
                YTP Standartı: 50 Bal Giriş (Qayıb: 10, Sem: 10, Kol: 30) + 50 Bal İmtahan (Min: 17)
              </div>
            </div>

            {studentCoursesWithGrades.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-600" />
                <h3 className="text-base font-bold text-slate-700">
                  Hazırda heç bir fənn üzrə qiymətləndirmə jurnalı daxil edilməyib
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Müəllimlər fənn ballarını daxil etdikdə burada dərhal əks olunacaq.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {studentCoursesWithGrades.map(({ course, grade }) => {
                  const att = grade?.attendance ?? null;
                  const sem = grade?.seminar ?? null;
                  const col1 = grade?.colloquium1 ?? null;
                  const col2 = grade?.colloquium2 ?? null;
                  const exam = grade?.examScore ?? null;

                  const entryTotal = grade ? calculateEntryScore(grade) : 0;
                  const finalTotal = grade ? calculateTotalScore(grade) : 0;
                  const evalStatus = grade ? getEvaluationStatus(grade) : null;

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs hover:border-purple-300 transition-all space-y-4"
                    >
                      {/* Course Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 gap-2.5 sm:gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-50 text-[#5300b7] rounded-lg text-xs font-mono font-bold">
                              {course.subjectCode}
                            </span>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900">
                              {course.subject}
                            </h3>
                          </div>
                          <span className="text-xs text-slate-500 mt-1 block">
                            Qrup: <strong className="text-slate-700">{course.group}</strong> • İxtisas: {course.specialty} • Semestr: {course.semester}
                          </span>
                        </div>

                        {/* Status badge */}
                        {evalStatus && (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${evalStatus.color}`}
                            >
                              {evalStatus.status}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 100-Point YTP Breakdown Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                        {/* 1. Qayıblar */}
                        <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-center">
                          <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block mb-0.5">
                            Qayıblar (Max 10)
                          </span>
                          <span className="text-base sm:text-lg font-bold text-slate-800 font-mono">
                            {att !== null ? `${att} bal` : '-'}
                          </span>
                        </div>

                        {/* 2. Seminar */}
                        <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-center">
                          <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block mb-0.5">
                            Seminar (Max 10)
                          </span>
                          <span className="text-base sm:text-lg font-bold text-slate-800 font-mono">
                            {sem !== null ? `${sem} bal` : '-'}
                          </span>
                        </div>

                        {/* 3. Kollokvium 1 */}
                        <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-center">
                          <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block mb-0.5">
                            Kollokvium 1 (Max 15)
                          </span>
                          <span className="text-base sm:text-lg font-bold text-slate-800 font-mono">
                            {col1 !== null ? `${col1} bal` : '-'}
                          </span>
                        </div>

                        {/* 4. Kollokvium 2 */}
                        <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-center">
                          <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block mb-0.5">
                            Kollokvium 2 (Max 15)
                          </span>
                          <span className="text-base sm:text-lg font-bold text-slate-800 font-mono">
                            {col2 !== null ? `${col2} bal` : '-'}
                          </span>
                        </div>

                        {/* 5. Giriş Balı (Max 50) */}
                        <div className="p-2.5 sm:p-3 bg-purple-50/70 rounded-xl sm:rounded-2xl border border-purple-200 text-center">
                          <span className="text-[10px] sm:text-[11px] text-purple-700 font-extrabold uppercase block mb-0.5">
                            Giriş Balı (Max 50)
                          </span>
                          <span className="text-base sm:text-lg font-black text-[#5300b7] font-mono">
                            {entryTotal} bal
                          </span>
                          <span className="text-[9px] text-purple-600 block">Min: 17 bal</span>
                        </div>

                        {/* 6. İmtahan Balı (Max 50 / Min 17) */}
                        <div className="p-2.5 sm:p-3 bg-amber-50/70 rounded-xl sm:rounded-2xl border border-amber-200 text-center">
                          <span className="text-[10px] sm:text-[11px] text-amber-800 font-extrabold uppercase block mb-0.5">
                            İmtahan (Max 50)
                          </span>
                          <span className={`text-base sm:text-lg font-black font-mono ${
                            exam !== null && exam < 17 ? 'text-rose-600' : 'text-amber-900'
                          }`}>
                            {exam !== null ? `${exam} bal` : '-'}
                          </span>
                          <span className="text-[9px] text-amber-700 block">Min: 17 bal</span>
                        </div>

                        {/* 7. Yekun Bal (Max 100 / Keçid > 50) */}
                        <div className="p-2.5 sm:p-3 bg-purple-100/70 rounded-xl sm:rounded-2xl border border-purple-300 text-center col-span-2 sm:col-span-4 lg:col-span-1">
                          <span className="text-[10px] sm:text-[11px] text-purple-900 font-black uppercase block mb-0.5">
                            Yekun Bal (100)
                          </span>
                          <span className={`text-lg sm:text-xl font-black font-mono ${
                            exam !== null && (exam < 17 || finalTotal <= 50)
                              ? 'text-rose-600'
                              : 'text-[#5300b7]'
                          }`}>
                            {exam !== null ? `${finalTotal} bal` : `${entryTotal} (Giriş)`}
                          </span>
                          <span className="text-[9px] text-purple-800 block">Keçid: &gt; 50</span>
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

                        {evalStatus && (
                          <div className="flex items-center gap-2">
                            <span>Status:</span>
                            <span className="font-bold text-slate-800">{evalStatus.status}</span>
                            <span className="text-slate-400">•</span>
                            <span>{evalStatus.subtext}</span>
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

        {/* TAB 1.5: MODULES & SYLLABUSES (NEW) */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {student.specialty} — Tədris Modulları və Sillabuslar
                </h2>
                <p className="text-xs text-slate-500">
                  Semestrlər üzrə tədris planı, fənn saatları, kreditlər və mühazirə mövzuları
                </p>
              </div>

              {/* Semester filter pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSemesterForModules('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSemesterForModules === 'all'
                      ? 'bg-[#5300b7] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Bütün Semestrlər
                </button>
                {SEMESTERS_LIST.map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemesterForModules(sem)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSemesterForModules === sem
                        ? 'bg-[#5300b7] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>

            {mySpecialtyModules.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-600" />
                <h3 className="text-base font-bold text-slate-700">
                  İxtisasınız üzrə modullar hələ admin tərəfindən daxil edilməyib
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Admin panelindən modullar və sillabuslar yerləşdirildikdə burada görünəcək.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySpecialtyModules
                  .filter(
                    (m) =>
                      selectedSemesterForModules === 'all' ||
                      m.semester === selectedSemesterForModules
                  )
                  .map((m) => {
                    const isExpanded = expandedSyllabusId === m.id;
                    return (
                      <div
                        key={m.id}
                        className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-[#5300b7] transition-all shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-1 bg-purple-50 text-[#5300b7] rounded-lg font-mono font-bold text-xs">
                            {m.code}
                          </span>
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {m.semester}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900">{m.name}</h3>

                        {m.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {m.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{m.creditHours || 60} saat ({m.credits || 5} kredit)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="truncate">{m.instructor || 'Müəllim təyin olunmayıb'}</span>
                          </div>
                        </div>

                        {m.syllabusTopics && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setExpandedSyllabusId(isExpanded ? null : m.id)}
                              className="w-full flex items-center justify-between px-3 py-2 bg-purple-50/70 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#5300b7]" />
                                <span>Sillabus Planı və Mövzularını Gör</span>
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                                {m.syllabusTopics}
                              </div>
                            )}
                          </div>
                        )}
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
              <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200 text-slate-400 text-xs">
                Qrupunuz üçün hazırda heç bir imtahan sessiyası təyin edilməyib.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3"
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
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-semibold block mb-1">
                  Ümumi İştirak Payı
                </span>
                <span className="text-3xl font-black text-emerald-600">100%</span>
                <p className="text-[11px] text-slate-400 mt-2">
                  Qayıb limiti aşılmayıb
                </p>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-semibold block mb-1">
                  İcazə Verilən Maksimum Qayıb
                </span>
                <span className="text-3xl font-black text-slate-800">25%</span>
                <p className="text-[11px] text-slate-400 mt-2">
                  25%-dən çox qayıb imtahandan məhrumiyyətdir
                </p>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs text-center">
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

        {/* TAB 5: YTP RULES */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900">
                Yüksək Texniki Peşə (YTP) 100 Ballıq Qiymətləndirmə Təlimatı
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Peşə Təhsili YTP Subbakalavr təhsil pilləsi üzrə rəsmi imtahan və qiymətləndirmə qaydaları
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>50 Ballıq İmtahanöncəsi Giriş Balı</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Semestr ərzində toplanan maksimum 50 giriş balının bölgüsü:
                  <br />• <strong>Qayıblar (Davamiyyət):</strong> 10 bal
                  <br />• <strong>Seminar (Məşğələ / Cari fəallıq):</strong> 10 bal
                  <br />• <strong>Kollokvium 1 və Kollokvium 2:</strong> Birlikdə 30 bal (hərəsi 15 bal)
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>50 Ballıq İmtahan (Çıxış) Balı — Min 17 Bal</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  İmtahan balı maksimum 50 baldır. Peşədəki YTP İmtahan sisteminə əsasən, <strong>imtahandan çıxış balı 17 baldan aşağı olmamalıdır</strong>. 17 baldan az toplandıqda tələbə birbaşa kəsilir (akademik borc yaranır).
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>Yekun Keçid Balı (50-dən yuxarı)</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tələbənin modulu uğurla tamamlaması üçün <strong>ümumi balı 50-dən yuxarı (ən azı 51 bal) olmalıdır</strong>. 50 və ya daha az bal toplandıqda yekun qiymət F (Qeyri-müvəffəq) sayılır.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>Yekun Hərf Qiymətləri Şkalası</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>A (91 - 100):</strong> Əla
                  <br />• <strong>B (81 - 90):</strong> Çox yaxşı
                  <br />• <strong>C (71 - 80):</strong> Yaxşı
                  <br />• <strong>D (61 - 70):</strong> Kafi
                  <br />• <strong>E (51 - 60):</strong> Qənaətbəxş
                  <br />• <strong>F (≤ 50 və ya İmtahan &lt; 17):</strong> Qeyri-müvəffəq (Kəsr)
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>Lənkəran Dövlət Peşə Təhsil Mərkəzi — Yüksək Texniki Peşə (YTP) Şəxsi Kabineti © 2026</span>
          {onNavigateToAdmin && (
            <>
              <span className="hidden sm:inline">•</span>
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>İnzibatçı Paneli (/admin)</span>
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};
