import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  ExternalLink,
  Download,
  GraduationCap,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  MapPin,
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

    const isEntryComplete =
      myGrade.attendance !== null && myGrade.attendance !== undefined &&
      myGrade.seminar !== null && myGrade.seminar !== undefined &&
      myGrade.colloquium1 !== null && myGrade.colloquium1 !== undefined &&
      myGrade.colloquium2 !== null && myGrade.colloquium2 !== undefined;

    const entryTotal = isEntryComplete
      ? Number(myGrade.attendance) + Number(myGrade.seminar) + Number(myGrade.colloquium1) + Number(myGrade.colloquium2)
      : null;

    const hasExam = myGrade.examScore !== null && myGrade.examScore !== undefined;
    const finalScore = isEntryComplete && hasExam ? (entryTotal! + Number(myGrade.examScore)) : null;
    const gradeEval = getGradeEvaluation(finalScore, myGrade.examScore);

    return {
      myGrade,
      entryTotal,
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
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-[#5300b7] via-[#6415c4] to-[#7c3aed] text-white font-bold text-[11px] sm:text-xs">
                    <th rowSpan={2} className="py-3 px-2.5 text-center border-r border-white/20 w-10">
                      №
                    </th>
                    <th rowSpan={2} className="py-3 px-3 text-center border-r border-white/20 whitespace-nowrap">
                      <div>Tədris İli</div>
                      <div className="text-[10px] text-purple-200 font-normal">Semestr</div>
                    </th>
                    <th rowSpan={2} className="py-3 px-3 text-center border-r border-white/20 whitespace-nowrap min-w-[120px]">
                      Tarix
                    </th>
                    <th rowSpan={2} className="py-3 px-4 border-r border-white/20 min-w-[260px]">
                      Fənn və Sillabus
                    </th>
                    <th colSpan={7} className="py-1.5 px-2 text-center border-b border-white/20 bg-white/10 uppercase tracking-wider text-[10px]">
                      Qiymətləndirmə Göstəriciləri
                    </th>
                  </tr>
                  <tr className="bg-[#48009e] text-white font-bold text-[11px] sm:text-xs text-center border-t border-white/15">
                    <th className="py-2 px-2.5 border-r border-white/15 w-14" title="Davamiyyət">Dav.</th>
                    <th className="py-2 px-2.5 border-r border-white/15 w-14" title="Seminar">Sem.</th>
                    <th className="py-2 px-2.5 border-r border-white/15 w-14 bg-white/10 text-amber-200" title="1-ci Kollokvium">K1</th>
                    <th className="py-2 px-2.5 border-r border-white/15 w-14 bg-white/10 text-amber-200" title="2-ci Kollokvium">K2</th>
                    <th className="py-2 px-2.5 border-r border-white/15 w-14 text-emerald-200" title="Giriş Balı (Cəmi 50 baldan)">Giriş</th>
                    <th className="py-2 px-2.5 border-r border-white/15 w-14 text-sky-200" title="İmtahan Balı (50 baldan)">İmtahan</th>
                    <th className="py-2 px-3.5 min-w-[150px] text-white" title="Yekun Qiymət (100 baldan)">Yekun</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {tableRows.map((row) => {
                    const m = row.module;
                    const g = row.gradeInfo?.myGrade;
                    const gradeEval = row.gradeInfo?.gradeEval;
                    const entryTotal = row.gradeInfo?.entryTotal;
                    const finalScore = row.gradeInfo?.finalScore;

                    // Display exam or colloquium date in Tarix column
                    const displayDate = m.examDate
                      ? `${m.examDate} ${m.examTime || ''}`
                      : m.colloquium1Date
                      ? `${m.colloquium1Date} ${m.colloquium1Time || ''}`
                      : m.colloquium2Date
                      ? `${m.colloquium2Date} ${m.colloquium2Time || ''}`
                      : '';

                    return (
                      <tr
                        key={m.id}
                        className={`transition-colors hover:bg-purple-50/40 ${
                          row.index % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'
                        }`}
                      >
                        {/* 1. № */}
                        <td className="py-3 px-2.5 text-center border-r border-slate-200 text-slate-500 font-semibold">
                          {row.index}
                        </td>

                        {/* 2. Tədris ili / Semestr */}
                        <td className="py-3 px-3 text-center border-r border-slate-200 whitespace-nowrap">
                          <span className="font-mono text-xs text-slate-700 font-medium">{row.academicYear}</span>
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-[#5300b7] rounded-md font-bold text-xs">
                            {row.semesterNum}-ci sem.
                          </span>
                        </td>

                        {/* 3. Tarix */}
                        <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-700 whitespace-nowrap font-mono text-[11px]">
                          {displayDate ? (
                            <span className="inline-flex items-center gap-1 text-slate-800 font-semibold">
                              <Calendar className="w-3 h-3 text-[#5300b7]" />
                              {displayDate}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* 4. Fənn (Title + Code + Sub-schedule + Syllabus link) */}
                        <td className="py-3 px-4 border-r border-slate-200 text-left">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {m.name}
                            </span>
                            {m.code && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-mono font-semibold">
                                {m.code}
                              </span>
                            )}
                          </div>

                          {/* Sub-text: Colloquium / Exam schedule */}
                          {(m.colloquium1Date || m.colloquium2Date || m.examDate) && (
                            <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                              {m.colloquium1Date && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-medium">
                                  <span>K1:</span> <strong>{m.colloquium1Date} {m.colloquium1Time || ''} {m.colloquium1Room ? `(${m.colloquium1Room})` : ''}</strong>
                                </span>
                              )}
                              {m.colloquium2Date && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-medium">
                                  <span>K2:</span> <strong>{m.colloquium2Date} {m.colloquium2Time || ''} {m.colloquium2Room ? `(${m.colloquium2Room})` : ''}</strong>
                                </span>
                              )}
                              {m.examDate && (
                                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-900 px-2 py-0.5 rounded border border-purple-200 text-[10px] font-medium">
                                  <span>İmtahan:</span> <strong>{m.examDate} {m.examTime || ''} {m.examRoom ? `(${m.examRoom})` : ''}</strong>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Syllabus Link */}
                          {m.syllabusUrl ? (
                            <div className="mt-1.5">
                              <a
                                href={m.syllabusUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5300b7] hover:bg-[#430094] text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs group cursor-pointer"
                                title="Fənn sillabusunu aç və ya yüklə"
                              >
                                <FileText className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                <span>Sillabus ({m.syllabusFileName || 'PDF'})</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                              </a>
                            </div>
                          ) : null}
                        </td>

                        {/* 5. Davamiyyət */}
                        <td className="py-3 px-2.5 text-center border-r border-slate-200 text-slate-800 font-mono text-xs">
                          {g?.attendance !== null && g?.attendance !== undefined ? (
                            <span className="font-semibold text-slate-900">{g.attendance}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 6. Seminar */}
                        <td className="py-3 px-2.5 text-center border-r border-slate-200 text-slate-800 font-mono text-xs">
                          {g?.seminar !== null && g?.seminar !== undefined ? (
                            <span className="font-semibold text-slate-900">{g.seminar}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 7. K1 (1-ci Kollokvium) */}
                        <td className="py-3 px-2.5 text-center border-r border-slate-200 font-mono text-xs bg-amber-50/30">
                          {g?.colloquium1 !== null && g?.colloquium1 !== undefined ? (
                            <span className="font-bold text-amber-900">{g.colloquium1}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 8. K2 (2-ci Kollokvium) */}
                        <td className="py-3 px-2.5 text-center border-r border-slate-200 font-mono text-xs bg-amber-50/30">
                          {g?.colloquium2 !== null && g?.colloquium2 !== undefined ? (
                            <span className="font-bold text-amber-900">{g.colloquium2}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 9. Giriş Balı (Cəmi 50 baldan) */}
                        <td className="py-3 px-2.5 text-center border-r border-slate-200 font-mono text-xs bg-purple-50/40">
                          {entryTotal !== null && entryTotal !== undefined ? (
                            <span className="font-extrabold text-[#5300b7]">{entryTotal}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 10. İmtahan Balı (50 baldan) */}
                        <td className="py-3 px-2.5 text-center border-r border-slate-200 font-mono text-xs bg-sky-50/40">
                          {g?.examScore !== null && g?.examScore !== undefined ? (
                            <span className="font-extrabold text-sky-950">{g.examScore}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 11. Yekun Nəticə */}
                        <td className="py-3 px-3.5 text-center text-xs whitespace-nowrap">
                          {gradeEval && finalScore !== null ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${gradeEval.badgeClass}`}>
                              {finalScore} bal ({gradeEval.letter} — {gradeEval.label})
                            </span>
                          ) : entryTotal !== null ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 text-[#5300b7] text-[11px] font-bold">
                              Giriş: {entryTotal} bal
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Gözlənilir</span>
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
    </div>
  );
};
