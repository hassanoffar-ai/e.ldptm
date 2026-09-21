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

export const SpecialtyModulesAccordion: React.FC<SpecialtyModulesAccordionProps> = ({
  student,
  modules = [],
  studentCourseYear,
}) => {
  // Determine current active course year for this student
  const activeCourseYear = studentCourseYear ?? extractStudentCourseYear(student.group);

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

  // Group the 8 standard semesters
  const semesterBlocks = useMemo(() => {
    return SEMESTERS_LIST.map((semName, index) => {
      // Determine which course year this semester belongs to
      // 0, 1 -> 1-ci kurs; 2, 3 -> 2-ci kurs; 4, 5 -> 3-cü kurs; 6, 7 -> 4-cü kurs
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
  }, [specialtyModules, activeCourseYear]);

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
                  Bütün semestrlər üzrə Tədris Planı və Modullar
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#5300b7] border border-purple-200">
                  {student.specialty}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Cari statusunuz: <strong className="text-purple-700 font-bold">{activeCourseYear}-ci kurs tələbəsi</strong> ({student.group})</span>
                <span>•</span>
                <span>YTP 8 Semestr Tədris Proqramı</span>
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
            {/* Semestr Seçim Formu (Optgroup Dropdown - Screenshot dizaynı) */}
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
                  <option value="all">Bütün semestrlər üzrə (1-4-cü kurslar)</option>
                  <optgroup label="1-ci kurs">
                    <option value="1-ci kurs 1-ci semestr">1-ci kurs 1-ci semestr</option>
                    <option value="1-ci kurs 2-ci semestr">1-ci kurs 2-ci semestr</option>
                  </optgroup>
                  <optgroup label="2-ci kurs">
                    <option value="2-ci kurs 1-ci semestr">2-ci kurs 1-ci semestr</option>
                    <option value="2-ci kurs 2-ci semestr">2-ci kurs 2-ci semestr</option>
                  </optgroup>
                  <optgroup label="3-cü kurs">
                    <option value="3-cü kurs 1-ci semestr">3-cü kurs 1-ci semestr</option>
                    <option value="3-cü kurs 2-ci semestr">3-cü kurs 2-ci semestr</option>
                  </optgroup>
                  <optgroup label="4-cü kurs">
                    <option value="4-cü kurs 1-ci semestr">4-cü kurs 1-ci semestr</option>
                    <option value="4-cü kurs 2-ci semestr">4-cü kurs 2-ci semestr</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* 8 Semester Blocks */}
            <div className="space-y-6">
              {semesterBlocks
                .filter((block) => {
                  if (selectedSemesterFilter === 'all') return true;
                  return block.semesterName.toLowerCase() === selectedSemesterFilter.toLowerCase();
                })
                .map((block) => {
                  return (
                    <div
                      key={block.semesterName}
                      className={`rounded-2xl sm:rounded-3xl border transition-all overflow-hidden ${
                        block.isLocked
                          ? 'bg-slate-50/70 border-slate-200'
                          : block.isCurrentCourse
                          ? 'bg-white border-purple-200 ring-2 ring-purple-500/10 shadow-sm'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Block Header */}
                      <div
                        className={`px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b ${
                          block.isLocked
                            ? 'bg-slate-100/70 border-slate-200 text-slate-500'
                            : block.isCurrentCourse
                            ? 'bg-purple-50/80 border-purple-100 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
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
                              <span>Kilidlidir (Yalnız {block.courseYear}-ci kursda açılacaq)</span>
                            </span>
                          ) : block.isCurrentCourse ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Cari Aktiv Tədris Semestri</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Keçmiş Semestr</span>
                            </span>
                          )}

                          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {block.modules.length} modul
                          </span>
                        </div>
                      </div>

                      {/* Block Body: Modules List */}
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
                              Siz hazırda {activeCourseYear}-ci kursda təhsil alırsınız. {block.courseYear}-ci kursun tədris modulları və sillabusları növbəti tədris ilinə keçdikdə aktivləşəcəkdir.
                            </p>
                          </div>
                        ) : block.modules.length === 0 ? (
                          /* Empty State Display for active semester */
                          <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 space-y-1.5">
                            <BookOpen className="w-8 h-8 mx-auto opacity-40 text-purple-600" />
                            <p className="text-xs font-bold text-slate-600">
                              Bu semestr üzrə hələ modul daxil edilməyib
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Admin tərəfindən modullar yükləndikdə burada əks olunacaq.
                            </p>
                          </div>
                        ) : (
                          /* Modules Grid for Unlocked Semester */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {block.modules.map((m) => (
                              <div
                                key={m.id}
                                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-[#5300b7] transition-all shadow-xs space-y-3 flex flex-col justify-between"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-mono font-bold text-[#5300b7] bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                                      {m.code || 'YTP-MODUL'}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500">
                                      {m.credits ? `${m.credits} kredit` : 'YTP Modulu'}
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
                            ))}
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
