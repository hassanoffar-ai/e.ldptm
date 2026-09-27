import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Calendar,
  Download,
  X,
  Eye,
  Loader2,
  Globe,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { SpecialtyModule, StudentUser } from '../types';
import { SEMESTERS_LIST } from '../data/mockData';

interface SpecialtyModulesAccordionProps {
  student: StudentUser;
  modules: SpecialtyModule[];
  // Optional override for student course year (1, 2, 3, or 4). Defaults to auto-detect from group.
  studentCourseYear?: number;
}

/**
 * Extracts the student's current course year (1, 2, 3, or 4) from their group string or data.
 */
export const extractStudentCourseYear = (groupStr?: string): number => {
  if (!groupStr) return 1;
  const clean = groupStr.toLowerCase();

  if (clean.includes('4-c') || clean.includes('4.') || clean.includes('4-k') || clean.includes('40')) return 4;
  if (clean.includes('3-c') || clean.includes('3.') || clean.includes('3-k') || clean.includes('30')) return 3;
  if (clean.includes('2-c') || clean.includes('2.') || clean.includes('2-k') || clean.includes('20')) return 2;
  if (clean.includes('1-c') || clean.includes('1.') || clean.includes('1-k') || clean.includes('10')) return 1;

  if (clean.includes('-24') || clean.includes('24-')) return 1;
  if (clean.includes('-23') || clean.includes('23-')) return 2;
  if (clean.includes('-22') || clean.includes('22-')) return 3;
  if (clean.includes('-21') || clean.includes('21-')) return 4;

  return 1; // Default to 1-ci kurs
};

/**
 * Extracts the student's active semester index (0 to 7) in SEMESTERS_LIST.
 * For example:
 * "1-ci kurs 1-ci semestr" -> 0
 * "1-ci kurs 2-ci semestr" -> 1
 * "2-ci kurs 1-ci semestr" -> 2
 * etc.
 */
export const extractStudentSemesterIndex = (semesterStr?: string, groupStr?: string): number => {
  if (semesterStr) {
    const sClean = semesterStr.toLowerCase().trim();
    const foundIdx = SEMESTERS_LIST.findIndex(
      (sem) =>
        sem.toLowerCase().trim() === sClean ||
        sClean.includes(sem.toLowerCase().trim()) ||
        sem.toLowerCase().trim().includes(sClean)
    );
    if (foundIdx !== -1) return foundIdx;
  }

  if (groupStr) {
    const gClean = groupStr.toLowerCase().trim();
    if (gClean.includes('4-c') || gClean.includes('4.') || gClean.includes('4-k') || gClean.includes('40') || gClean.includes('4-cü kurs')) {
      return gClean.includes('2-ci sem') || gClean.includes('2. sem') ? 7 : 6;
    }
    if (gClean.includes('3-c') || gClean.includes('3.') || gClean.includes('3-k') || gClean.includes('30') || gClean.includes('3-cü kurs')) {
      return gClean.includes('2-ci sem') || gClean.includes('2. sem') ? 5 : 4;
    }
    if (gClean.includes('2-c') || gClean.includes('2.') || gClean.includes('2-k') || gClean.includes('20') || gClean.includes('2-ci kurs')) {
      return gClean.includes('2-ci sem') || gClean.includes('2. sem') ? 3 : 2;
    }
    if (gClean.includes('1-c') || gClean.includes('1.') || gClean.includes('1-k') || gClean.includes('10') || gClean.includes('1-ci kurs')) {
      return gClean.includes('2-ci sem') || gClean.includes('2. sem') ? 1 : 0;
    }
  }

  return 0; // Default to 1-ci kurs 1-ci semestr (0)
};

/**
 * Helper to determine how many course years a specialty has based on its duration (e.g. "3 illik" -> 3 years).
 */
export const findSpecialtyDurationYears = (specialtyName?: string): number => {
  if (!specialtyName) return 3;
  let specList: any[] = [];
  try {
    const saved = localStorage.getItem('eldptm_specialties');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) specList = parsed;
    }
  } catch {}

  const target = specialtyName.toLowerCase().trim();
  const matched = Array.isArray(specList)
    ? specList.find((s) => {
        if (!s) return false;
        const sName = (s.name || '').toLowerCase().trim();
        return sName === target || sName.includes(target) || target.includes(sName);
      })
    : null;

  const durStr = (matched?.duration || '').toLowerCase();
  if (durStr.includes('4')) return 4;
  if (durStr.includes('3')) return 3;
  if (durStr.includes('2')) return 2;
  if (durStr.includes('1')) return 1;

  return 3; // default to 3-year YTP
};

/**
 * Returns letter grade and verbal label (A - Əla, B - Çox yaxşı, etc.)
 */
export const getGradeEvaluation = (finalScore: number | null, examScore: number | null) => {
  if (finalScore === null || examScore === null || examScore === undefined) return null;
  if (examScore < 17 || finalScore <= 50) {
    return { letter: 'F', label: 'Kəsildi', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
  }
  if (finalScore >= 91) {
    return { letter: 'A', label: 'Əla', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  }
  if (finalScore >= 81) {
    return { letter: 'B', label: 'Çox yaxşı', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' };
  }
  if (finalScore >= 71) {
    return { letter: 'C', label: 'Yaxşı', badgeClass: 'bg-purple-100 text-purple-900 border-purple-300' };
  }
  if (finalScore >= 61) {
    return { letter: 'D', label: 'Kafi', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' };
  }
  return { letter: 'E', label: 'Qənaətbəxş', badgeClass: 'bg-teal-100 text-teal-900 border-teal-300' };
};

export const SpecialtyModulesAccordion: React.FC<SpecialtyModulesAccordionProps> = ({
  student,
  modules = [],
  studentCourseYear,
}) => {
  // Determine current active course year for this student
  const activeCourseYear = studentCourseYear ?? extractStudentCourseYear(student?.group);

  // Determine active semester index (0 to 7) for this student
  const activeSemesterIndex = useMemo(() => {
    return extractStudentSemesterIndex(student?.semester, student?.group);
  }, [student?.semester, student?.group]);

  const activeSemesterName = SEMESTERS_LIST[activeSemesterIndex] || `${activeCourseYear}-ci kurs 1-ci semestr`;

  // Determine total valid course years for student's specialty (1, 2, 3, or 4)
  const totalSpecialtyYears = useMemo(() => {
    return findSpecialtyDurationYears(student?.specialty);
  }, [student?.specialty]);

  // Filter state: 'all' or specific semester
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');

  // Syllabus in-app preview and download state
  const [viewingSyllabus, setViewingSyllabus] = useState<{
    url: string;
    subjectName: string;
    fileName?: string;
  } | null>(null);
  const [syllabusViewTab, setSyllabusViewTab] = useState<'info' | 'online'>('info');
  const [isDownloading, setIsDownloading] = useState(false);

  const openSyllabusModal = (syllabus: { url: string; subjectName: string; fileName?: string }) => {
    const fn = (syllabus.fileName || syllabus.url).toLowerCase();
    const isPdf = fn.endsWith('.pdf') || syllabus.url.toLowerCase().includes('.pdf');
    setSyllabusViewTab(isPdf ? 'online' : 'info');
    setViewingSyllabus(syllabus);
  };

  // Clean in-memory Blob download (masks Supabase URL completely)
  const handleDownloadBlob = async (url: string, subjectName: string, customFileName?: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      const rawExt = url.split('?')[0].split('.').pop() || 'docx';
      link.download = customFileName || `${subjectName} - Sillabus.${rawExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 2000);
    } catch {
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Filter modules for this student's specialty
  const specialtyModules = useMemo(() => {
    if (!student?.specialty) return modules || [];
    const specLower = (student.specialty || '').toLowerCase().trim();
    return (modules || []).filter((m) => {
      if (!m) return false;
      const mSpec = (m.specialtyName || '').toLowerCase().trim();
      return mSpec === specLower || specLower.includes(mSpec) || mSpec.includes(specLower);
    });
  }, [modules, student?.specialty]);

  // STRICTURE: Student can ONLY see semesters up to their current active semester (cannot see future semesters!)
  const semesterBlocks = useMemo(() => {
    const maxSpecialtySemesters = (totalSpecialtyYears || 3) * 2;
    const allowedSemestersCount = Math.min(activeSemesterIndex + 1, maxSpecialtySemesters);
    const relevantSemesters = (SEMESTERS_LIST || []).slice(0, allowedSemestersCount);

    return relevantSemesters.map((semName, index) => {
      const courseYear = Math.floor(index / 2) + 1;
      const semesterNumInYear = (index % 2) + 1;
      const isCurrentSemester = index === activeSemesterIndex;

      const semModules = (specialtyModules || []).filter((m) => {
        if (!m || !m.semester) return false;
        const mSem = m.semester.toLowerCase();
        const sSem = semName.toLowerCase();
        return mSem === sSem || mSem.includes(sSem) || sSem.includes(mSem);
      });

      return {
        semesterName: semName,
        courseYear,
        semesterNumInYear,
        isCurrentSemester,
        modules: semModules,
      };
    });
  }, [specialtyModules, activeSemesterIndex, totalSpecialtyYears]);

  // Load courses from localStorage for matching grades
  const allCourses = useMemo(() => {
    try {
      const saved = localStorage.getItem('eldptm_courses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }, []);

  const getModuleGradeInfo = (m: SpecialtyModule) => {
    if (!student) return null;
    const cSub = (m.name || '').toLowerCase().trim();
    const matchedCourse = allCourses.find((c: any) => {
      if (!c) return false;
      const sub = (c.subject || '').toLowerCase().trim();
      return sub && cSub && (sub === cSub || sub.includes(cSub) || cSub.includes(sub));
    });

    if (!matchedCourse || !Array.isArray(matchedCourse.grades || matchedCourse.students)) return null;
    const gradesList = matchedCourse.grades || matchedCourse.students || [];

    const myStudentId = (student.studentId || student.id || student.finCode || '').toLowerCase().trim();
    const myStudentName = (student.name || '').toLowerCase().trim();

    const myGrade = gradesList.find((g: any) => {
      if (!g) return false;
      const gId = (g.studentId || g.idNumber || '').toLowerCase().trim();
      const gName = (g.studentName || '').toLowerCase().trim();
      return (myStudentId && gId === myStudentId) || (myStudentName && gName.includes(myStudentName));
    });

    if (!myGrade) return null;

    const hasAnyEntry =
      (myGrade.attendance !== null && myGrade.attendance !== undefined) ||
      (myGrade.seminar !== null && myGrade.seminar !== undefined) ||
      (myGrade.colloquium1 !== null && myGrade.colloquium1 !== undefined) ||
      (myGrade.colloquium2 !== null && myGrade.colloquium2 !== undefined);

    const entryTotal = hasAnyEntry
      ? Number(myGrade.attendance || 0) +
        Number(myGrade.seminar || 0) +
        Number(myGrade.colloquium1 || 0) +
        Number(myGrade.colloquium2 || 0)
      : null;

    const hasExam =
      myGrade.examScore !== null &&
      myGrade.examScore !== undefined &&
      myGrade.examScore !== '';

    // Only compute final score when exam score is entered
    const finalScore =
      hasExam && entryTotal !== null
        ? entryTotal + Number(myGrade.examScore)
        : null;

    const gradeEval =
      hasExam && finalScore !== null
        ? getGradeEvaluation(finalScore, Number(myGrade.examScore))
        : null;

    return {
      myGrade,
      entryTotal,
      hasExam,
      finalScore,
      gradeEval,
    };
  };

  // Flatten active modules to display in table
  const tableRows = useMemo(() => {
    const selectedBlocks = semesterBlocks.filter((block) => {
      if (selectedSemesterFilter === 'all') return true;
      return block.semesterName === selectedSemesterFilter;
    });

    const rows: Array<{
      index: number;
      module: SpecialtyModule;
      academicYear: string;
      semesterNum: number;
      semesterName: string;
      isCurrentSemester: boolean;
      gradeInfo: ReturnType<typeof getModuleGradeInfo>;
    }> = [];

    let count = 1;
    selectedBlocks.forEach((block) => {
      const currentYear = 2026;
      const courseStartYear = currentYear - (activeCourseYear - block.courseYear);
      const academicYear = `${courseStartYear}/${courseStartYear + 1}`;

      block.modules.forEach((m) => {
        rows.push({
          index: count++,
          module: m,
          academicYear,
          semesterNum: block.semesterNumInYear,
          semesterName: block.semesterName,
          isCurrentSemester: block.isCurrentSemester,
          gradeInfo: getModuleGradeInfo(m),
        });
      });
    });

    return rows;
  }, [semesterBlocks, selectedSemesterFilter, allCourses, student]);

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden transition-all">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50/90 via-indigo-50/50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#5300b7] to-[#7c3aed] text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-950/20">
              <BookOpen className="w-5 h-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Tədris Planı, Fənlər və Qiymətləndirmə Cədvəli
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#5300b7] border border-purple-200">
                  {student?.specialty || 'İxtisas'} ({totalSpecialtyYears} illik)
                </span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>Cari statusunuz: <strong className="text-purple-700 font-bold">{student?.semester || activeSemesterName}</strong> ({student?.group || 'Qrup'})</span>
                <span>•</span>
                <span>YTP {totalSpecialtyYears} İllik Tədris Proqramı</span>
              </p>
            </div>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSemesterFilter}
              onChange={(e) => setSelectedSemesterFilter(e.target.value)}
              className="bg-[#f8f9ff] border-2 border-[#5300b7] rounded-xl px-3 py-2 text-xs font-bold text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer shadow-2xs"
            >
              <option value="all">
                {semesterBlocks.length === 1
                  ? `${semesterBlocks[0]?.semesterName} (Cari Semestr)`
                  : `Bütün semestrlər (1 - ${semesterBlocks.length}-ci semestr)`}
              </option>
              {semesterBlocks.length > 1 &&
                semesterBlocks.map((block) => (
                  <option key={block.semesterName} value={block.semesterName}>
                    {block.semesterName} {block.isCurrentSemester ? '★ (Cari)' : '✓ (Keçmiş)'}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* 2. Modern Academic Portal Table */}
        <div className="p-3 sm:p-5 border-t border-slate-200 space-y-3">
          {tableRows.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 space-y-1.5">
              <BookOpen className="w-8 h-8 mx-auto opacity-40 text-purple-600" />
              <p className="text-xs font-bold text-slate-600">
                Bu semestr üzrə hələ fənn daxil edilməyib
              </p>
              <p className="text-[11px] text-slate-400">
                Admin tərəfindən fənlər və imtahan cədvəli əlavə edildikdə burada əks olunacaq.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-gradient-to-r from-[#5300b7] via-[#6415c4] to-[#7c3aed] text-white font-bold text-xs">
                    <th rowSpan={2} className="py-3 px-2.5 text-center border-r border-white/20 w-10">
                      №
                    </th>
                    <th rowSpan={2} className="py-3 px-3 text-center border-r border-white/20 whitespace-nowrap min-w-[110px]">
                      <div>Tədris İli</div>
                      <div className="text-[10px] text-purple-200 font-normal">Semestr</div>
                    </th>
                    <th rowSpan={2} className="py-3 px-4 border-r border-white/20 min-w-[240px]">
                      Fənn və Sillabus
                    </th>
                    <th colSpan={7} className="py-1.5 px-2 text-center border-b border-white/20 bg-white/10 uppercase tracking-wider text-[10px]">
                      Qiymətləndirmə Göstəriciləri
                    </th>
                  </tr>
                  <tr className="bg-[#48009e] text-white font-bold text-xs text-center border-t border-white/15">
                    <th className="py-2 px-2 border-r border-white/15 w-12" title="Davamiyyət">Dav.</th>
                    <th className="py-2 px-2 border-r border-white/15 w-12" title="Seminar">Sem.</th>
                    <th className="py-2 px-2 border-r border-white/15 w-12 bg-white/10 text-amber-200" title="1-ci Kollokvium">K1</th>
                    <th className="py-2 px-2 border-r border-white/15 w-12 bg-white/10 text-amber-200" title="2-ci Kollokvium">K2</th>
                    <th className="py-2 px-2 border-r border-white/15 w-14 text-emerald-200" title="Giriş Balı (Cəmi 50 baldan)">Giriş</th>
                    <th className="py-2 px-2 border-r border-white/15 w-14 text-sky-200" title="İmtahan Balı (50 baldan)">İmt.</th>
                    <th className="py-2 px-3 min-w-[130px] text-white" title="Yekun Qiymət (100 baldan)">Yekun</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {tableRows.map((row) => {
                    const m = row.module;
                    const g = row.gradeInfo?.myGrade;
                    const gradeEval = row.gradeInfo?.gradeEval;
                    const entryTotal = row.gradeInfo?.entryTotal;
                    const finalScore = row.gradeInfo?.finalScore;
                    const hasExam = row.gradeInfo?.hasExam;

                    return (
                      <tr
                        key={m.id}
                        className={`transition-colors hover:bg-purple-50/40 ${
                          row.index % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'
                        }`}
                      >
                        {/* 1. № */}
                        <td className="py-2 sm:py-3 px-1 sm:px-2 text-center border-r border-slate-200 text-slate-500 font-semibold text-[10px] sm:text-xs">
                          {row.index}
                        </td>

                        {/* 2. Tədris ili / Semestr (Stacked for mobile, horizontal on larger screens) */}
                        <td className="py-2 sm:py-3 px-1.5 sm:px-3 text-center border-r border-slate-200">
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <span className="font-mono text-[10px] sm:text-xs text-slate-700 font-medium leading-tight">
                              {row.academicYear}
                            </span>
                            <span className="px-1 sm:px-1.5 py-0.5 bg-purple-100 text-[#5300b7] rounded font-bold text-[9px] sm:text-xs whitespace-nowrap leading-none">
                              {row.semesterNum}-ci sem.
                            </span>
                          </div>
                        </td>

                        {/* 3. Fənn (Title + Code + Dates underneath + Syllabus link) */}
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-r border-slate-200 text-left min-w-0">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-bold text-slate-900 text-[11px] sm:text-sm break-words leading-tight">
                              {m.name}
                            </span>
                            {m.code && (
                              <span className="px-1 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] sm:text-[10px] font-mono font-semibold">
                                {m.code}
                              </span>
                            )}
                          </div>

                          {/* Sub-text: Colloquium & Exam Schedule */}
                          {(m.colloquium1Date || m.colloquium2Date || m.examDate) && (
                            <div className="text-[10px] sm:text-[11px] text-slate-600 mt-1.5 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-1">
                              {m.colloquium1Date && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-1.5 sm:px-2 py-0.5 rounded border border-amber-200 text-[9.5px] sm:text-[10.5px] font-medium leading-tight">
                                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 shrink-0" />
                                  <span>K1:</span>
                                  <strong className="font-semibold text-amber-950">{m.colloquium1Date} {m.colloquium1Time || ''} {m.colloquium1Room ? `(${m.colloquium1Room})` : ''}</strong>
                                </span>
                              )}
                              {m.colloquium2Date && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-1.5 sm:px-2 py-0.5 rounded border border-amber-200 text-[9.5px] sm:text-[10.5px] font-medium leading-tight">
                                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 shrink-0" />
                                  <span>K2:</span>
                                  <strong className="font-semibold text-amber-950">{m.colloquium2Date} {m.colloquium2Time || ''} {m.colloquium2Room ? `(${m.colloquium2Room})` : ''}</strong>
                                </span>
                              )}
                              {m.examDate && (
                                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-900 px-1.5 sm:px-2 py-0.5 rounded border border-purple-200 text-[9.5px] sm:text-[10.5px] font-medium leading-tight">
                                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#5300b7] shrink-0" />
                                  <span>İmtahan:</span>
                                  <strong className="font-semibold text-purple-950">{m.examDate} {m.examTime || ''} {m.examRoom ? `(${m.examRoom})` : ''}</strong>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Syllabus Action Button (Opens In-App Viewer, completely hides Supabase link) */}
                          {m.syllabusUrl ? (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  openSyllabusModal({
                                    url: m.syllabusUrl!,
                                    subjectName: m.name,
                                    fileName: m.syllabusFileName,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#5300b7] hover:bg-[#430094] text-white rounded-md sm:rounded-lg text-[10.5px] sm:text-[11px] font-bold transition-all shadow-2xs group cursor-pointer"
                                title="Fənn sillabusuna bax və ya yüklə"
                              >
                                <FileText className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                <span>Sillabus ({m.syllabusFileName || 'PDF'})</span>
                                <Eye className="w-2.5 h-2.5 opacity-80" />
                              </button>
                            </div>
                          ) : null}
                        </td>

                        {/* 4. Davamiyyət */}
                        <td className="py-2 sm:py-3 px-0.5 sm:px-2 text-center border-r border-slate-200 text-slate-800 font-mono text-[10px] sm:text-xs">
                          {g?.attendance !== null && g?.attendance !== undefined ? (
                            <span className="font-semibold text-slate-900">{g.attendance}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 5. Seminar */}
                        <td className="py-2 sm:py-3 px-0.5 sm:px-2 text-center border-r border-slate-200 text-slate-800 font-mono text-[10px] sm:text-xs">
                          {g?.seminar !== null && g?.seminar !== undefined ? (
                            <span className="font-semibold text-slate-900">{g.seminar}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 6. K1 (1-ci Kollokvium) */}
                        <td className="py-2 sm:py-3 px-0.5 sm:px-2 text-center border-r border-slate-200 font-mono text-[10px] sm:text-xs bg-amber-50/30">
                          {g?.colloquium1 !== null && g?.colloquium1 !== undefined ? (
                            <span className="font-bold text-amber-900">{g.colloquium1}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 7. K2 (2-ci Kollokvium) */}
                        <td className="py-2 sm:py-3 px-0.5 sm:px-2 text-center border-r border-slate-200 font-mono text-[10px] sm:text-xs bg-amber-50/30">
                          {g?.colloquium2 !== null && g?.colloquium2 !== undefined ? (
                            <span className="font-bold text-amber-900">{g.colloquium2}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 8. Giriş Balı (Cəmi 50 baldan) */}
                        <td className="py-2 sm:py-3 px-0.5 sm:px-2 text-center border-r border-slate-200 font-mono text-[10px] sm:text-xs bg-purple-50/40">
                          {entryTotal !== null && entryTotal !== undefined ? (
                            <span className="font-extrabold text-[#5300b7]">{entryTotal}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 9. İmtahan Balı (50 baldan) */}
                        <td className="py-2 sm:py-3 px-0.5 sm:px-2 text-center border-r border-slate-200 font-mono text-[10px] sm:text-xs bg-sky-50/40">
                          {g?.examScore !== null && g?.examScore !== undefined ? (
                            <span className="font-extrabold text-sky-950">{g.examScore}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 10. Yekun Nəticə (Yalnız imtahan balı yazıldıqdan sonra yekun göstərilir, giriş balı yekun yerinə yazılmır) */}
                        <td className="py-2 sm:py-3 px-1 sm:px-2.5 text-center text-[9px] sm:text-xs">
                          {hasExam && gradeEval && finalScore !== null ? (
                            <span className={`inline-flex flex-col sm:flex-row items-center justify-center px-1 sm:px-2 py-0.5 rounded font-bold border text-[9px] sm:text-[11px] leading-tight ${gradeEval.badgeClass}`}>
                              <span>{finalScore} bal</span>
                              <span className="text-[8px] sm:text-[10px] sm:ml-1 opacity-80">({gradeEval.letter})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[9px] sm:text-[11px] italic">Gözlənilir</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* IN-APP SYLLABUS VIEWER & DOWNLOAD MODAL (Masks Supabase URL completely) */}
      {viewingSyllabus && (() => {
        const rawFileName = viewingSyllabus.fileName || viewingSyllabus.url.split('?')[0].split('/').pop() || 'sillabus.docx';
        const lowerName = rawFileName.toLowerCase();
        const isPdf = lowerName.endsWith('.pdf') || viewingSyllabus.url.toLowerCase().includes('.pdf');
        const isDocx = /\.(docx|doc)$/i.test(lowerName) || /\.(docx|doc)/i.test(viewingSyllabus.url);
        const isExcel = /\.(xlsx|xls|csv)$/i.test(lowerName);
        const isPpt = /\.(pptx|ppt)$/i.test(lowerName);
        const isImage = /\.(png|jpe?g|webp|gif|svg)$/i.test(lowerName);

        const fileTypeLabel = isPdf
          ? 'PDF Sənədi'
          : isDocx
          ? 'Microsoft Word Sənədi (.docx)'
          : isExcel
          ? 'Microsoft Excel Cədvəli'
          : isPpt
          ? 'PowerPoint Təqdimatı'
          : isImage
          ? 'Təsvir Faylı'
          : 'Tədris Faylı';

        const fileTypeColor = isPdf
          ? 'from-rose-500 to-red-600'
          : isDocx
          ? 'from-blue-600 to-indigo-600'
          : isExcel
          ? 'from-emerald-600 to-teal-700'
          : isPpt
          ? 'from-amber-500 to-orange-600'
          : 'from-[#5300b7] to-[#7c3aed]';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50/90 via-indigo-50/50 to-white border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${fileTypeColor} text-white flex items-center justify-center shrink-0 shadow-md`}>
                    {isExcel ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {viewingSyllabus.subjectName} — Tədris Sillabusu
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-[#5300b7]">
                        {fileTypeLabel}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                        • {rawFileName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadBlob(
                        viewingSyllabus.url,
                        viewingSyllabus.subjectName,
                        viewingSyllabus.fileName
                      )
                    }
                    disabled={isDownloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
                    title="Faylı birbaşa cihazınıza endirin"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Sillabusu Yüklə</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingSyllabus(null)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                    title="Bağla"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-bar / Mode Tabs for Non-PDF Office Documents */}
              {(!isPdf || isDocx || isExcel || isPpt) && (
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSyllabusViewTab('info')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        syllabusViewTab === 'info'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📄 Sənəd Məlumatı & Yükləmə
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyllabusViewTab('online')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                        syllabusViewTab === 'online'
                          ? 'bg-white text-[#5300b7] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Onlayn Baxış (Google Docs)</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 hidden md:inline">
                    Lənkəran Dövlət Peşə Təhsil Mərkəzi
                  </span>
                </div>
              )}

              {/* Modal Body */}
              <div className="flex-1 min-h-[360px] max-h-[68vh] bg-slate-50 relative overflow-y-auto flex flex-col justify-center">
                {/* 1. PDF View */}
                {isPdf && syllabusViewTab === 'online' && (
                  <iframe
                    src={`${viewingSyllabus.url}#toolbar=0&navpanes=0`}
                    className="w-full h-full min-h-[480px] border-none"
                    title={`${viewingSyllabus.subjectName} Sillabus`}
                  />
                )}

                {/* 2. Image View */}
                {!isPdf && isImage && (
                  <div className="w-full h-full flex items-center justify-center p-4 bg-slate-900/10">
                    <img
                      src={viewingSyllabus.url}
                      alt={viewingSyllabus.subjectName}
                      className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-lg"
                    />
                  </div>
                )}

                {/* 3. Non-PDF / Office Document (Word DOCX, Excel, PPTX): Google Docs Viewer Mode */}
                {(!isPdf || isDocx || isExcel || isPpt) && syllabusViewTab === 'online' && !isImage && (
                  <div className="w-full h-full min-h-[480px] relative bg-white">
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingSyllabus.url)}&embedded=true`}
                      className="w-full h-full min-h-[480px] border-none"
                      title={`${viewingSyllabus.subjectName} Sillabus Viewer`}
                    />
                  </div>
                )}

                {/* 4. Non-PDF / Office Document (Word DOCX, Excel, PPTX): Rich Document Card Mode */}
                {syllabusViewTab === 'info' && (
                  <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center my-auto">
                    {/* Glowing Icon Banner */}
                    <div className="relative mb-5">
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${fileTypeColor} text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 ring-8 ring-white transform hover:scale-105 transition-transform`}>
                        {isExcel ? <FileSpreadsheet className="w-10 h-10 sm:w-12 sm:h-12" /> : <FileText className="w-10 h-10 sm:w-12 sm:h-12" />}
                      </div>
                      <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded-full border-2 border-white uppercase shadow">
                        {rawFileName.split('.').pop() || 'DOCX'}
                      </div>
                    </div>

                    {/* Titles */}
                    <h4 className="text-base sm:text-xl font-bold text-slate-900 max-w-lg">
                      {viewingSyllabus.subjectName}
                    </h4>
                    <p className="text-xs sm:text-sm font-mono text-slate-500 mt-1 max-w-md break-all">
                      {rawFileName}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-lg">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Təsdiq Olunmuş Sillabus
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Lənkəran Dövlət Peşə Təhsil Mərkəzi
                      </span>
                    </div>

                    {/* Informative text */}
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-4 leading-relaxed bg-white/90 border border-slate-200 p-3.5 rounded-2xl shadow-xs">
                      Bu fənn üçün rəsmi tədris sillabusu <strong>{fileTypeLabel}</strong> formatında yerləşdirilmişdir. Faylı telefonunuza və ya kompüterinizə endirərək Microsoft Word / WPS Office proqramında aça və ya Google Docs vasitəsilə onlayn oxuya bilərsiniz.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-md">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadBlob(
                            viewingSyllabus.url,
                            viewingSyllabus.subjectName,
                            viewingSyllabus.fileName
                          )
                        }
                        disabled={isDownloading}
                        className="w-full flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#5300b7] to-[#7c3aed] hover:from-[#430094] hover:to-[#6d28d9] text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Sillabusu Cihazına Yüklə</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSyllabusViewTab('online')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
                      >
                        <Globe className="w-4 h-4 text-[#5300b7]" />
                        <span>Google Docs ilə Oxu</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                  Tələbə Şəxsi Kabineti • Tədris Sillabusu Sistemi
                </span>
                <button
                  type="button"
                  onClick={() => setViewingSyllabus(null)}
                  className="ml-auto text-slate-600 hover:text-slate-900 font-bold px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Pəncərəni Bağla
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
