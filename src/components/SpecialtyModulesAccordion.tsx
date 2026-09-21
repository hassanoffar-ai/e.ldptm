import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
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
 * Examples: "KSP-23" -> 1st/2nd course, "1-ci kurs", "101", "2-ci kurs" -> 2, etc.
 */
export const extractStudentCourseYear = (groupStr?: string): number => {
  if (!groupStr) return 1;
  const clean = groupStr.toLowerCase();

  if (clean.includes('4-c') || clean.includes('4.') || clean.includes('4-k') || clean.includes('40')) return 4;
  if (clean.includes('3-c') || clean.includes('3.') || clean.includes('3-k') || clean.includes('30')) return 3;
  if (clean.includes('2-c') || clean.includes('2.') || clean.includes('2-k') || clean.includes('20')) return 2;
  if (clean.includes('1-c') || clean.includes('1.') || clean.includes('1-k') || clean.includes('10')) return 1;

  // If group has year like -24 (2024 intake), -23 (2023 intake), etc.
  if (clean.includes('-24') || clean.includes('24-')) return 1;
  if (clean.includes('-23') || clean.includes('23-')) return 2;
  if (clean.includes('-22') || clean.includes('22-')) return 3;
  if (clean.includes('-21') || clean.includes('21-')) return 4;

  return 1; // Default to 1-ci kurs
};

/**
 * Helper to determine how many course years a specialty has based on its duration (e.g. "3 illik" -> 3 years).
 */
export const findSpecialtyDurationYears = (specialtyName?: string): number => {
  if (!specialtyName) return 3;
  let specList: any[] = [];
  try {
    const saved = localStorage.getItem('eldptm_specialties');
    if (saved) specList = JSON.parse(saved);
  } catch {}

  const target = specialtyName.toLowerCase().trim();
  const matched = specList.find((s) => {
    const sName = (s.name || '').toLowerCase().trim();
    return sName === target || sName.includes(target) || target.includes(sName);
  });

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
  const activeCourseYear = studentCourseYear ?? extractStudentCourseYear(student.group);

  // Determine total valid course years for student's specialty (1, 2, 3, or 4)
  const totalSpecialtyYears = useMemo(() => {
    return findSpecialtyDurationYears(student?.specialty);
  }, [student?.specialty]);

  // Accordion open/collapse state (expanded by default)
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  // Filter state inside the accordion: 'all' or specific semester
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');

  // Filter modules for this student's specialty
  const specialtyModules = useMemo(() => {
    if (!student?.specialty) return modules;
    const specLower = student.specialty.toLowerCase().trim();
    return modules.filter((m) => {
      const mSpec = (m.specialtyName || '').toLowerCase().trim();
      return mSpec === specLower || specLower.includes(mSpec) || mSpec.includes(specLower);
    });
  }, [modules, student?.specialty]);

  // Only take semesters up to the specialty's exact duration (e.g. 3 years = 6 semesters, no 4th year!)
  const semesterBlocks = useMemo(() => {
    const validSemestersCount = totalSpecialtyYears * 2;
    const relevantSemesters = SEMESTERS_LIST.slice(0, validSemestersCount);

    return relevantSemesters.map((semName, index) => {
      const courseYear = Math.floor(index / 2) + 1;
      const semesterNumInYear = (index % 2) + 1;
      const isLocked = courseYear > activeCourseYear;
      const isCurrentCourse = courseYear === activeCourseYear;

      const semModules = specialtyModules.filter((m) => {
        if (!m.semester) return false;
        const mSem = m.semester.toLowerCase();
        const sSem = semName.toLowerCase();
        return mSem === sSem || mSem.includes(sSem) || sSem.includes(mSem);
      });

      return {
        semesterName: semName,
        courseYear,
        semesterNumInYear,
        isLocked,
        isCurrentCourse,
        modules: semModules,
      };
    });
  }, [specialtyModules, activeCourseYear, totalSpecialtyYears]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Accordion Trigger */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="p-5 sm:p-6 bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-purple-50/90 transition-colors select-none"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#5300b7] text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-900/15">
              <BookOpen className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Bütün semestrlər üzrə Tədris Planı, Fənlər və İmtahan Cədvəli
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#5300b7] border border-purple-200">
                  {student.specialty} ({totalSpecialtyYears} illik)
                </span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Cari statusunuz: <strong className="text-purple-700 font-bold">{activeCourseYear}-ci kurs tələbəsi</strong> ({student.group})</span>
                <span>•</span>
                <span>YTP {totalSpecialtyYears} İllik Tədris Proqramı</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="text-xs font-bold text-slate-600 hidden sm:inline-block">
              {isAccordionOpen ? 'Bağla' : 'Aç və Göstər'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#5300b7] hover:border-[#5300b7] transition-all">
              {isAccordionOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* 2. Accordion Expanded Content */}
        {isAccordionOpen && (
          <div className="p-4 sm:p-6 border-t border-slate-200 space-y-6 animate-in fade-in-50 duration-200">
            {/* Semestr Seçim Formu (Yalnız ixtisasın illəri üzrə dinamik) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ccc3d7] shadow-xs space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Semestr Seçin *
              </label>
              <div className="relative">
                <select
                  value={selectedSemesterFilter}
                  onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                  className="w-full bg-[#f8f9ff] border-2 border-[#5300b7] rounded-xl px-4 py-3 text-sm font-semibold text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer shadow-xs"
                >
                  <option value="all">Bütün semestrlər üzrə (1-{totalSpecialtyYears}-ci kurslar)</option>
                  {Array.from({ length: totalSpecialtyYears }).map((_, i) => {
                    const year = i + 1;
                    const sem1 = `${year}-ci kurs 1-ci semestr`;
                    const sem2 = `${year}-ci kurs 2-ci semestr`;
                    return (
                      <optgroup key={year} label={`${year}-ci kurs`}>
                        <option value={sem1}>{sem1}</option>
                        <option value={sem2}>{sem2}</option>
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Semester Blocks for Specialty Duration */}
            <div className="space-y-5">
              {semesterBlocks
                .filter((block) => {
                  if (selectedSemesterFilter === 'all') return true;
                  return block.semesterName === selectedSemesterFilter;
                })
                .map((block) => {
                  return (
                    <div
                      key={block.semesterName}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        block.isLocked
                          ? 'border-slate-200 bg-slate-50/50 opacity-90'
                          : 'border-purple-300 bg-white shadow-xs'
                      }`}
                    >
                      {/* Block Header */}
                      <div
                        className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                          block.isLocked
                            ? 'bg-slate-100/70 border-slate-200 text-slate-500'
                            : 'bg-purple-50/80 border-purple-100 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {block.isLocked ? (
                            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center">
                              <Lock className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#5300b7] flex items-center justify-center">
                              <Unlock className="w-4 h-4" />
                            </div>
                          )}

                          <h3 className="font-bold text-sm sm:text-base">
                            {block.semesterName}
                          </h3>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {block.isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200/80 text-slate-600 border border-slate-300">
                              <Lock className="w-3 h-3" />
                              <span>Kilidlidir ({block.courseYear}-ci kursda açılacaq)</span>
                            </span>
                          ) : null}

                          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {block.modules.length} fənn
                          </span>
                        </div>
                      </div>

                      {/* Block Body: Fənlər List */}
                      <div className="p-4 sm:p-6">
                        {block.isLocked ? (
                          /* Locked State Display */
                          <div className="p-6 text-center rounded-2xl bg-white/60 border border-dashed border-slate-300 space-y-2">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                              <Lock className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-700">
                              Bu semestr hazırda sizin üçün bağlıdır
                            </h4>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                              Siz hazırda {activeCourseYear}-ci kursda təhsil alırsınız. Bu fənlər və imtahanlar {block.courseYear}-ci kursa keçdikdə aktivləşəcəkdir.
                            </p>
                          </div>
                        ) : block.modules.length === 0 ? (
                          /* Empty State Display for active semester */
                          <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 space-y-1.5">
                            <BookOpen className="w-8 h-8 mx-auto opacity-40 text-purple-600" />
                            <p className="text-xs font-bold text-slate-600">
                              Bu semestr üzrə hələ fənn daxil edilməyib
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Admin tərəfindən fənlər və imtahan cədvəli əlavə edildikdə burada əks olunacaq.
                            </p>
                          </div>
                        ) : (
                          /* Modules Grid for Unlocked Semester */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {block.modules.map((m) => {
                              const hasExamInfo = m.examDate || m.examTime || m.examRoom;
                              return (
                                <div
                                  key={m.id}
                                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-[#5300b7] transition-all shadow-xs space-y-3.5 flex flex-col justify-between"
                                >
                                  <div className="space-y-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[11px] font-mono font-bold text-[#5300b7] bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                                        {m.code || 'YTP-FƏNN'}
                                      </span>
                                      <span className="text-xs font-bold text-slate-500">
                                        {m.credits ? `${m.credits} kredit` : 'YTP Fənni'}
                                      </span>
                                    </div>

                                    <h4 className="font-bold text-base text-slate-900 leading-snug">
                                      {m.name}
                                    </h4>

                                    {m.description && (
                                      <p className="text-xs text-slate-600 line-clamp-2">
                                        {m.description}
                                      </p>
                                    )}

                                    {/* Colloquiums and Exam Schedule Card Inside Fənn */}
                                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-white border border-purple-100 space-y-2.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#5300b7]">
                                          <Calendar className="w-3.5 h-3.5" />
                                          <span>İmtahan və Kollokvium Cədvəli</span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-purple-100/60 text-xs">
                                        {/* 1-ci Kollokvium */}
                                        <div className="p-2 bg-white/80 rounded-lg border border-purple-100">
                                          <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                                            1-ci Kollokvium
                                          </div>
                                          {m.colloquium1Date || m.colloquium1Time || m.colloquium1Room ? (
                                            <div className="text-[11px] text-slate-800 space-y-0.5 mt-1">
                                              {m.colloquium1Date && <div><strong>Tarix:</strong> {m.colloquium1Date}</div>}
                                              {m.colloquium1Time && <div><strong>Saat:</strong> {m.colloquium1Time}</div>}
                                              {m.colloquium1Room && <div><strong>Otaq:</strong> {m.colloquium1Room}</div>}
                                            </div>
                                          ) : (
                                            <div className="text-[10px] text-slate-400 italic mt-1">Təyin edilməyib</div>
                                          )}
                                        </div>

                                        {/* 2-ci Kollokvium */}
                                        <div className="p-2 bg-white/80 rounded-lg border border-purple-100">
                                          <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                                            2-ci Kollokvium
                                          </div>
                                          {m.colloquium2Date || m.colloquium2Time || m.colloquium2Room ? (
                                            <div className="text-[11px] text-slate-800 space-y-0.5 mt-1">
                                              {m.colloquium2Date && <div><strong>Tarix:</strong> {m.colloquium2Date}</div>}
                                              {m.colloquium2Time && <div><strong>Saat:</strong> {m.colloquium2Time}</div>}
                                              {m.colloquium2Room && <div><strong>Otaq:</strong> {m.colloquium2Room}</div>}
                                            </div>
                                          ) : (
                                            <div className="text-[10px] text-slate-400 italic mt-1">Təyin edilməyib</div>
                                          )}
                                        </div>

                                        {/* Yekun İmtahan */}
                                        <div className="p-2 bg-purple-100/50 rounded-lg border border-purple-200">
                                          <div className="text-[10px] font-bold text-[#5300b7] uppercase tracking-wide">
                                            Yekun İmtahan
                                          </div>
                                          {m.examDate || m.examTime || m.examRoom ? (
                                            <div className="text-[11px] text-slate-900 space-y-0.5 mt-1 font-medium">
                                              {m.examDate && <div><strong>Tarix:</strong> {m.examDate}</div>}
                                              {m.examTime && <div><strong>Saat:</strong> {m.examTime}</div>}
                                              {m.examRoom && <div><strong>Otaq:</strong> {m.examRoom}</div>}
                                            </div>
                                          ) : (
                                            <div className="text-[10px] text-slate-400 italic mt-1">Təyin edilməyib</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Student Grade in this Subject (if exists in Gradebook) */}
                                    {(() => {
                                      let allCourses: any[] = [];
                                      try {
                                        const saved = localStorage.getItem('eldptm_courses');
                                        if (saved) allCourses = JSON.parse(saved);
                                      } catch (e) {}

                                      // Match course by subject name
                                      const matchedCourse = allCourses.find((c: any) => {
                                        const cSub = (c.subject || '').toLowerCase().trim();
                                        const mSub = (m.name || '').toLowerCase().trim();
                                        return cSub && mSub && (cSub === mSub || cSub.includes(mSub) || mSub.includes(cSub));
                                      });

                                      if (!matchedCourse || !matchedCourse.students) return null;

                                      const myStudentId = (student.studentId || student.id || student.finCode || '').toLowerCase();
                                      const myStudentName = (student.name || '').toLowerCase();
                                      const myGrade = matchedCourse.students.find((gs: any) => {
                                        const gsId = (gs.studentId || gs.idNumber || '').toLowerCase();
                                        const gsName = (gs.studentName || '').toLowerCase();
                                        return (myStudentId && gsId === myStudentId) || (myStudentName && gsName.includes(myStudentName));
                                      });

                                      if (!myGrade) return null;

                                      const entryTotal = (myGrade.attendance || 0) + (myGrade.seminar || 0) + (myGrade.colloquium1 || 0) + (myGrade.colloquium2 || 0);
                                      const hasAnyGrade = myGrade.attendance !== null || myGrade.seminar !== null || myGrade.colloquium1 !== null || myGrade.colloquium2 !== null || myGrade.examScore !== null;

                                      if (!hasAnyGrade) return null;

                                      const finalScore = myGrade.examScore !== null && myGrade.examScore !== undefined ? entryTotal + myGrade.examScore : null;
                                      const isPassed = finalScore !== null && myGrade.examScore >= 17 && finalScore > 50;

                                      const gradeEval = getGradeEvaluation(finalScore, myGrade.examScore);

                                      return (
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-700">
                                              📊 Sizin Cari Qiymət Göstəriciləriniz:
                                            </span>
                                            {gradeEval ? (
                                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${gradeEval.badgeClass}`}>
                                                {gradeEval.letter} — {gradeEval.label} ({finalScore} bal)
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-md">
                                                Giriş Balı: {entryTotal} / 50
                                              </span>
                                            )}
                                          </div>

                                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center text-[10px]">
                                            <div className="bg-white p-1 rounded border border-slate-200">
                                              <span className="text-slate-400 block">Davamiyyət</span>
                                              <strong className="text-slate-800">{myGrade.attendance ?? '-'}</strong>
                                            </div>
                                            <div className="bg-white p-1 rounded border border-slate-200">
                                              <span className="text-slate-400 block">Seminar</span>
                                              <strong className="text-slate-800">{myGrade.seminar ?? '-'}</strong>
                                            </div>
                                            <div className="bg-white p-1 rounded border border-slate-200">
                                              <span className="text-slate-400 block">Kol 1</span>
                                              <strong className="text-slate-800">{myGrade.colloquium1 ?? '-'}</strong>
                                            </div>
                                            <div className="bg-white p-1 rounded border border-slate-200">
                                              <span className="text-slate-400 block">Kol 2</span>
                                              <strong className="text-slate-800">{myGrade.colloquium2 ?? '-'}</strong>
                                            </div>
                                            <div className="bg-purple-50 p-1 rounded border border-purple-200 font-bold text-[#5300b7]">
                                              <span className="text-purple-600 block">Giriş</span>
                                              <strong>{entryTotal}</strong>
                                            </div>
                                            <div className="bg-amber-50 p-1 rounded border border-amber-200 font-bold text-amber-900">
                                              <span className="text-amber-700 block">İmtahan</span>
                                              <strong>{myGrade.examScore ?? '-'}</strong>
                                            </div>
                                            <div className="bg-purple-100/70 p-1 rounded border border-purple-300 font-bold text-purple-950">
                                              <span className="text-purple-800 block">Yekun</span>
                                              <strong>{finalScore ?? entryTotal}</strong>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  {/* Syllabus Action Button */}
                                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <span className="text-xs text-slate-500 font-medium">
                                      Fənn Sillabusu:
                                    </span>
                                    {m.syllabusUrl ? (
                                      <a
                                        href={m.syllabusUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5300b7] hover:bg-[#430093] text-white rounded-xl text-xs font-bold transition-all shadow-xs group cursor-pointer"
                                        title="Sillabus faylını aç və ya yüklə"
                                      >
                                        <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                        <span className="truncate max-w-[150px]">
                                          {m.syllabusFileName || 'Sillabusu Yüklə (PDF)'}
                                        </span>
                                        <ExternalLink className="w-3 h-3 opacity-80" />
                                      </a>
                                    ) : (
                                      <span className="text-xs text-slate-400 italic">
                                        Sillabus yüklənməyib
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
