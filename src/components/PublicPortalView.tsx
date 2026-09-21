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
  BarChart3,
  Shield,
  Building2,
  Sparkles,
  Percent,
  FileText,
  ExternalLink,
  Download,
} from 'lucide-react';
import { ExamSession, GradeBookCourse, SpecialtyModule, StudentGrade, StudentUser } from '../types';
import { getStoredModules, SEMESTERS_LIST } from '../data/mockData';
import { fetchModulesFromDb } from '../lib/supabase';
import { SpecialtyModulesAccordion } from './SpecialtyModulesAccordion';

interface PublicPortalViewProps {
  student: StudentUser;
  courses: GradeBookCourse[];
  sessions: ExamSession[];
  onLogout: () => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  student,
  courses = [],
  sessions = [],
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'rules'>('subjects');
  const [selectedSemesterForModules, setSelectedSemesterForModules] = useState<string>('all');

  // Safe student strings
  const studentSpecialty = (student?.specialty || '').trim();
  const studentGroup = (student?.group || '').trim();
  const studentId = (student?.studentId || '').trim();
  const studentFin = (student?.finCode || '').trim();
  const studentName = (student?.name || '').trim();

  // Load modules list from localStorage and Supabase
  const [allModules, setAllModules] = useState<SpecialtyModule[]>(() => getStoredModules() || []);

  React.useEffect(() => {
    fetchModulesFromDb().then((dbMods) => {
      if (dbMods && dbMods.length > 0) {
        setAllModules(dbMods);
      }
    });
  }, []);

  // Filter modules for this student's specialty
  const mySpecialtyModules = React.useMemo(() => {
    if (!studentSpecialty) return allModules;
    const specLower = studentSpecialty.toLowerCase();
    return allModules.filter((m) => {
      const mSpec = (m.specialtyName || '').toLowerCase().trim();
      return (
        mSpec === specLower ||
        specLower.includes(mSpec) ||
        mSpec.includes(specLower)
      );
    });
  }, [allModules, studentSpecialty]);

  // Filter courses for this student (either by group + specialty or explicit student grade record)
  const studentCoursesWithGrades = (courses || [])
    .map((course) => {
      if (!course) return null;
      const grades = course.grades || [];
      const studentGrade = grades.find((g) => {
        if (!g) return false;
        const gId = (g.idNumber || '').toLowerCase();
        const gName = (g.studentName || '').toLowerCase();
        return (
          g.studentId === student?.id ||
          (studentId && gId === studentId.toLowerCase()) ||
          (studentFin && gId === studentFin.toLowerCase()) ||
          (studentName && gName.includes(studentName.toLowerCase()))
        );
      });

      const courseGroup = (course.group || '').toLowerCase().trim();
      const courseSpec = (course.specialty || '').toLowerCase().trim();
      const sGroupLower = studentGroup.toLowerCase();
      const sSpecLower = studentSpecialty.toLowerCase();

      const isForMyCohort =
        courseGroup === sGroupLower &&
        (!courseSpec || !sSpecLower || courseSpec === sSpecLower);

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
  const studentSessions = (sessions || []).filter((s) => {
    if (!s) return false;
    const sGroup = (s.group || '').toLowerCase().trim();
    const sSpec = (s.specialty || '').toLowerCase().trim();
    const isCohortMatch =
      sGroup === studentGroup.toLowerCase() &&
      (!sSpec || !studentSpecialty || sSpec === studentSpecialty.toLowerCase());

    const items = s.items || [];
    const hasStudentItem = items.some((item) => {
      if (!item) return false;
      const itemId = (item.studentId || '').toLowerCase();
      const itemName = (item.studentName || '').toLowerCase();
      return (
        (studentId && itemId === studentId.toLowerCase()) ||
        (studentFin && itemId === studentFin.toLowerCase()) ||
        (studentName && itemName.includes(studentName.toLowerCase()))
      );
    });

    return isCohortMatch || hasStudentItem;
  });

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
      return null;
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

          {/* Logout Button */}
          <div className="flex items-center">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Kabinetdən Çıxış"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Çıxış</span>
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
                İxtisas: <strong className="text-white">{student.specialty}</strong> • YTP (Yüksək Texniki Peşə)
              </p>
            </div>
          </div>

          {/* Education level badge */}
          <div className="flex items-center">
            <div className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-left">
              <span className="text-[10px] sm:text-[11px] text-purple-200 uppercase font-semibold block">
                Təhsil Pilləsi
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-300 block mt-0.5">
                YTP (Yüksək Texniki Peşə)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex space-x-1.5 sm:space-x-3 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'subjects'
                ? 'bg-[#5300b7] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Fənlər, İmtahan və Qiymətlər</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
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
                Lənkəran Dövlət Peşə Təhsil Mərkəzi • YTP (Yüksək Texniki Peşə)
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                <span>Tələbə ID: <strong className="font-mono text-[#5300b7]">{student.studentId || student.finCode}</strong></span>
                {student.email && !student.email.includes('@eldptm.edu.az') && <span>E-poçt: <strong className="text-slate-800">{student.email}</strong></span>}
                {student.phone && <span>Əlaqə: <strong className="text-slate-800">{student.phone}</strong></span>}
              </div>
            </div>
          </div>
        </div>

        {/* TAB 2: FƏNLƏR VƏ İMTAHAN (8 SEMESTERS ACCORDION + EXAM SCHEDULE) */}
        {activeTab === 'subjects' && (
          <SpecialtyModulesAccordion student={student} modules={allModules} />
        )}

        {/* TAB 4: YTP RULES */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900">
                Yüksək Texniki Peşə (YTP) 100 Ballıq Qiymətləndirmə Təlimatı
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Peşə Təhsili YTP (Yüksək Texniki Peşə) təhsil pilləsi üzrə rəsmi imtahan və qiymətləndirmə qaydaları
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
        </div>
      </footer>
    </div>
  );
};
