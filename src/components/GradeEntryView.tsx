import React, { useState } from 'react';
import {
  FileText,
  Filter,
  Save,
  Send,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Check,
  Award
} from 'lucide-react';
import { GradeBookCourse, SpecialtyItem, SpecialtyModule, StudentGrade } from '../types';
import { GROUPS_LIST, SUBJECTS_LIST, INITIAL_SPECIALTY_MODULES, SEMESTERS_LIST } from '../data/mockData';

interface GradeEntryViewProps {
  courses: GradeBookCourse[];
  onUpdateCourses: (updated: GradeBookCourse[]) => void;
  onOpenNewCourseModal?: () => void;
  onDeleteCourse?: (id: string) => void;
  specialties?: SpecialtyItem[];
}

export const GradeEntryView: React.FC<GradeEntryViewProps> = ({
  courses,
  onUpdateCourses,
  onOpenNewCourseModal,
  onDeleteCourse,
  specialties = [],
}) => {
  const currentCourse =
    courses.find(
      (c) => c.group === selectedGroupId && c.subject === selectedSubject
    ) || courses[0] || null;

  const [selectedGroupId, setSelectedGroupId] = useState(
    currentCourse?.group || GROUPS_LIST[0] || '1-ci kurs'
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    currentCourse?.specialty || specialties[0]?.name || 'Kibertəhlükəsizlik'
  );
  const [selectedSubject, setSelectedSubject] = useState(
    currentCourse?.subject || SUBJECTS_LIST[0] || 'Veb Proqramlaşdırma əsasları'
  );
  const [selectedSemester, setSelectedSemester] = useState(
    currentCourse?.semester || 'Yaz Semestri (2024/2025)'
  );

  const [gradesList, setGradesList] = useState<StudentGrade[]>(
    currentCourse?.grades || []
  );
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(
    currentCourse?.lastSaved || null
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    currentCourse?.isPublished || false
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load modules list from localStorage or fallback
  const specialtyModules: SpecialtyModule[] = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('eldptm_modules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SPECIALTY_MODULES;
  }, []);

  // Filter modules based on selected specialty and semester
  const availableSubjectsForFilter = React.useMemo(() => {
    const matched = specialtyModules
      .filter((m) => {
        const specMatch =
          !selectedSpecialty ||
          m.specialtyName.toLowerCase().trim() === selectedSpecialty.toLowerCase().trim();
        const semMatch =
          !selectedSemester ||
          selectedSemester.toLowerCase().includes(m.semester.toLowerCase()) ||
          m.semester.toLowerCase().includes(selectedSemester.toLowerCase());
        return specMatch && semMatch;
      })
      .map((m) => m.name);

    if (matched.length > 0) {
      return Array.from(new Set([...matched, ...(currentCourse ? [currentCourse.subject] : [])]));
    }
    return SUBJECTS_LIST;
  }, [specialtyModules, selectedSpecialty, selectedSemester, currentCourse]);

  // Sync state whenever currentCourse changes
  React.useEffect(() => {
    if (currentCourse) {
      setSelectedGroupId(currentCourse.group);
      setSelectedSpecialty(currentCourse.specialty);
      setSelectedSubject(currentCourse.subject);
      setSelectedSemester(currentCourse.semester);
      setGradesList(currentCourse.grades);
      setLastSavedTime(currentCourse.lastSaved || null);
      setIsPublished(currentCourse.isPublished || false);
    } else {
      setGradesList([]);
    }
  }, [currentCourse?.id]);

  // Sync if course changes
  const handleGroupChange = (group: string) => {
    setSelectedGroupId(group);
    const match = courses.find((c) => c.group === group);
    if (match) {
      setSelectedSubject(match.subject);
      setGradesList(match.grades);
      setLastSavedTime(match.lastSaved || null);
      setIsPublished(match.isPublished || false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleScoreChange = (
    index: number,
    field: 'attendance' | 'seminar' | 'colloquium1' | 'colloquium2' | 'examScore',
    valStr: string
  ) => {
    if (!currentCourse) return;
    const newGrades = [...gradesList];
    if (valStr === '' || valStr === '-') {
      newGrades[index][field] = null;
    } else {
      let num = parseFloat(valStr);
      if (isNaN(num)) num = 0;
      if (num < 0) num = 0;

      // Max validation
      let maxLimit = 10;
      if (field === 'colloquium1' || field === 'colloquium2') {
        maxLimit = 15;
      } else if (field === 'examScore') {
        maxLimit = 50;
      }
      if (num > maxLimit) num = maxLimit;

      newGrades[index][field] = num;
    }
    setGradesList(newGrades);
  };

  const calculateEntryTotal = (grade: StudentGrade) => {
    const att = grade.attendance ?? 0;
    const sem = grade.seminar ?? 0;
    const col1 = grade.colloquium1 ?? (grade.colloquium ? Math.min(grade.colloquium, 15) : 0);
    const col2 = grade.colloquium2 ?? (grade.laboratory ? Math.min(grade.laboratory, 15) : 0);
    return att + sem + col1 + col2;
  };

  const calculateTotal = (grade: StudentGrade) => {
    const entry = calculateEntryTotal(grade);
    const exam = grade.examScore ?? 0;
    return entry + exam;
  };

  const getEvaluationStatus = (grade: StudentGrade) => {
    const entry = calculateEntryTotal(grade);
    const exam = grade.examScore;

    if (exam === null || exam === undefined) {
      if (entry >= 17) {
        return {
          text: 'İmtahana buraxılır',
          subtext: `Giriş: ${entry}/50`,
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          passed: true,
        };
      }
      return {
        text: 'Buraxılmır',
        subtext: `Giriş < 17 (${entry} bal)`,
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        passed: false,
      };
    }

    if (exam < 17) {
      return {
        text: 'Kəsildi (F)',
        subtext: `İmtahan < 17 (${exam} bal)`,
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        passed: false,
      };
    }

    const total = entry + exam;
    if (total <= 50) {
      return {
        text: 'Kəsildi (F)',
        subtext: `Ümumi ≤ 50 (${total} bal)`,
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        passed: false,
      };
    }

    let letter = 'E';
    let word = 'Qənaətbəxş';
    if (total >= 91) {
      letter = 'A';
      word = 'Əla';
    } else if (total >= 81) {
      letter = 'B';
      word = 'Çox yaxşı';
    } else if (total >= 71) {
      letter = 'C';
      word = 'Yaxşı';
    } else if (total >= 61) {
      letter = 'D';
      word = 'Kafi';
    }

    return {
      text: `Keçdi (${letter})`,
      subtext: `${total} bal — ${word}`,
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      passed: true,
    };
  };

  const handleSaveDraft = () => {
    if (!currentCourse) return;
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('az-AZ', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const updatedCourses = courses.map((c) =>
      c.id === currentCourse.id
        ? { ...c, grades: gradesList, lastSaved: timeStr }
        : c
    );

    onUpdateCourses(updatedCourses);
    setLastSavedTime(timeStr);
    showToast('Qiymətlər qaralama olaraq saxlanıldı.');
  };

  const handlePublishGrades = () => {
    if (!currentCourse) return;
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('az-AZ', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const updatedCourses = courses.map((c) =>
      c.id === currentCourse.id
        ? { ...c, grades: gradesList, lastSaved: timeStr, isPublished: true }
        : c
    );

    onUpdateCourses(updatedCourses);
    setLastSavedTime(timeStr);
    setIsPublished(true);
    showToast('Ballar rəsmi olaraq dərc edildi.');
  };

  const handleExportGradesCSV = () => {
    if (!currentCourse) return;
    const headers = [
      '№',
      'Tələbə',
      'Tələbə ID',
      'Qayıblar (Max 10)',
      'Seminar (Max 10)',
      'Kollokvium 1 (Max 15)',
      'Kollokvium 2 (Max 15)',
      'Giriş Balı (Cəmi 50)',
      'İmtahan Balı (Max 50)',
      'Yekun Bal (Max 100)',
      'Nəticə',
    ];
    const rows = gradesList.map((g, idx) => {
      const entry = calculateEntryTotal(g);
      const exam = g.examScore ?? null;
      const total = calculateTotal(g);
      const evalStatus = getEvaluationStatus(g);

      return [
        idx + 1,
        `"${g.studentName}"`,
        g.idNumber,
        g.attendance ?? '-',
        g.seminar ?? '-',
        g.colloquium1 ?? '-',
        g.colloquium2 ?? '-',
        entry,
        exam !== null ? exam : '-',
        exam !== null ? total : `${entry} (Giriş)`,
        `"${evalStatus.text} - ${evalStatus.subtext}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `YTP_Qiymet_Cedveli_${selectedGroupId}_${selectedSubject.replace(
        /\s+/g,
        '_'
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Qiymət cədvəli ixrac edildi.');
  };

  const handleSave = handleSaveDraft;
  const handlePublish = handlePublishGrades;

  if (!currentCourse) {
    return (
      <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#ccc3d7] text-center max-w-lg shadow-sm">
          <div className="w-16 h-16 bg-purple-100 text-[#5300b7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#121c2a] mb-2">
            Heç bir qiymət jurnalı yoxdur
          </h3>
          <p className="text-sm text-[#64748b] leading-relaxed mb-6">
            Sistemdə hazırda aktiv qiymətləndirmə jurnalı mövcud deyil. Fənlər üzrə Seminar, Laboratoriya və Kollokvium ballarını daxil etmək üçün yeni jurnal açın.
          </p>
          {onOpenNewCourseModal && (
            <button
              onClick={onOpenNewCourseModal}
              className="px-6 py-3 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl font-semibold text-sm shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Qiymətləndirmə Jurnalı Aç</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 bg-[#121c2a] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-bounce duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#5300b7]">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
              Qiymət Daxiletmə
            </h2>
          </div>
          <p className="text-sm md:text-base text-[#4a4455]">
            Semestr üzrə tələbə ballarının qeydiyyatı
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenNewCourseModal && (
            <button
              onClick={onOpenNewCourseModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Jurnal Aç</span>
            </button>
          )}

          {currentCourse && onDeleteCourse && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `"${currentCourse.group} - ${currentCourse.subject}" jurnalını silmək istədiyinizdən əminsiniz?`
                  )
                ) {
                  onDeleteCourse(currentCourse.id);
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-[#ccc3d7] transition-colors cursor-pointer"
              title="Bu Jurnalı Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleExportGradesCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#ccc3d7] rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>Cədvəli İxrac Et</span>
          </button>
        </div>
      </div>

      {/* Seçim Filtri Card */}
      <div className="bg-white border border-[#ccc3d7] rounded-2xl p-5 md:p-6 mb-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-4 text-[#121c2a] font-bold text-base">
          <Filter className="w-4 h-4 text-[#5300b7]" />
          <span>Seçim Filtri</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Qrup */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1.5">
              Qrup
            </label>
            <div className="relative">
              <select
                id="filter-group-select"
                value={selectedGroupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] transition-all cursor-pointer"
              >
                {GROUPS_LIST.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* İxtisas */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1.5">
              İxtisas
            </label>
            <div className="relative">
              <select
                id="filter-specialty-select"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] transition-all cursor-pointer"
              >
                {specialties.length > 0 ? (
                  specialties.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))
                ) : (
                  <option value={selectedSpecialty}>{selectedSpecialty || 'İxtisas seçilməyib'}</option>
                )}
              </select>
            </div>
          </div>

          {/* Fənn / Modul */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1.5">
              Fənn / Modul
            </label>
            <div className="relative">
              <select
                id="filter-subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] transition-all cursor-pointer"
              >
                {availableSubjectsForFilter.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Semestr */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1.5">
              Semestr
            </label>
            <div className="relative">
              <select
                id="filter-semester-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] transition-all cursor-pointer"
              >
                {SEMESTERS_LIST.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
                <option value="Yaz Semestri (2024/2025)">Yaz Semestri (2024/2025)</option>
                <option value="Payız Semestri (2024/2025)">Payız Semestri (2024/2025)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grades Table Container */}
      <div className="bg-white border border-[#ccc3d7] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Table Subheader with badge */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] border border-[#d9e3f6] rounded-lg text-xs font-semibold text-[#5300b7]">
            <span>{selectedGroupId}</span>
            <span className="text-slate-400">•</span>
            <span>{selectedSubject}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <Info className="w-4 h-4 text-[#5300b7]" />
            <span>
              YTP Qaydası: 50 Bal Giriş (Qayıb: 10, Seminar: 10, Kol. 1 və 2: 30) • 50 Bal İmtahan (Min: 17) • Keçid: 50-dən yuxarı
            </span>
          </div>
        </div>

        {/* The Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#fafafa] text-xs font-semibold text-[#4a4455]">
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5 min-w-[200px]">Tələbə</th>
                <th className="p-3.5 text-center min-w-[100px]">
                  <div>Qayıblar</div>
                  <div className="text-[10px] text-[#7b7486] font-normal">
                    (Max 10)
                  </div>
                </th>
                <th className="p-3.5 text-center min-w-[100px]">
                  <div>Seminar</div>
                  <div className="text-[10px] text-[#7b7486] font-normal">
                    (Max 10)
                  </div>
                </th>
                <th className="p-3.5 text-center min-w-[105px]">
                  <div>Kollokvium 1</div>
                  <div className="text-[10px] text-[#7b7486] font-normal">
                    (Max 15)
                  </div>
                </th>
                <th className="p-3.5 text-center min-w-[105px]">
                  <div>Kollokvium 2</div>
                  <div className="text-[10px] text-[#7b7486] font-normal">
                    (Max 15)
                  </div>
                </th>
                <th className="p-3.5 text-center min-w-[115px] bg-[#eff4ff]/70 border-l border-r border-[#d9e3f6]">
                  <div className="text-[#5300b7] font-bold">Giriş Balı</div>
                  <div className="text-[10px] text-[#6d28d9] font-medium">
                    (Cəmi 50)
                  </div>
                </th>
                <th className="p-3.5 text-center min-w-[115px]">
                  <div className="text-amber-800 font-bold">İmtahan Balı</div>
                  <div className="text-[10px] text-amber-700 font-medium">
                    (Max 50 / Min 17)
                  </div>
                </th>
                <th className="p-3.5 text-center min-w-[120px] bg-purple-100/50 border-l border-r border-purple-200">
                  <div className="text-purple-900 font-black">Yekun Bal</div>
                  <div className="text-[10px] text-purple-700 font-medium">
                    (Max 100 / Keçid &gt;50)
                  </div>
                </th>
                <th className="p-3.5 text-center min-w-[140px]">Nəticə</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#121c2a] divide-y divide-[#e2e8f0]">
              {gradesList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 text-sm">
                    Bu qrup üzrə jurnalda hələ heç bir tələbə qeydiyyatda deyil. Tələbələr bölməsindən bu qrupa tələbə əlavə edildikdə avtomatik burada əks olunacaq.
                  </td>
                </tr>
              ) : (
                gradesList.map((grade, index) => {
                  const entryTotal = calculateEntryTotal(grade);
                  const examScore = grade.examScore;
                  const total = calculateTotal(grade);
                  const evalStatus = getEvaluationStatus(grade);

                  return (
                    <tr
                      key={grade.studentId || index}
                      className="hover:bg-[#f8f9ff] transition-colors"
                    >
                      {/* Index */}
                      <td className="p-3.5 text-center text-xs text-[#7b7486] font-medium">
                        {index + 1}
                      </td>

                      {/* Student Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#eff4ff] text-[#5300b7] font-bold text-xs flex items-center justify-center shrink-0 border border-[#d9e3f6]">
                            {grade.avatarInitial}
                          </div>
                          <div>
                            <div className="font-semibold text-xs sm:text-sm text-[#121c2a]">
                              {grade.studentName}
                            </div>
                            <div className="text-[11px] text-[#7b7486] font-mono">
                              ID: {grade.idNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Qayıblar (Max 10) */}
                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="1"
                          value={grade.attendance !== null && grade.attendance !== undefined ? grade.attendance : ''}
                          placeholder="-"
                          onChange={(e) =>
                            handleScoreChange(index, 'attendance', e.target.value)
                          }
                          className="w-14 h-9 text-center font-medium bg-white border border-[#ccc3d7] rounded-lg focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] outline-none mx-auto text-xs transition-all"
                        />
                      </td>

                      {/* Seminar (Max 10) */}
                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="1"
                          value={grade.seminar !== null && grade.seminar !== undefined ? grade.seminar : ''}
                          placeholder="-"
                          onChange={(e) =>
                            handleScoreChange(index, 'seminar', e.target.value)
                          }
                          className="w-14 h-9 text-center font-medium bg-white border border-[#ccc3d7] rounded-lg focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] outline-none mx-auto text-xs transition-all"
                        />
                      </td>

                      {/* Kollokvium 1 (Max 15) */}
                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="15"
                          step="1"
                          value={grade.colloquium1 !== null && grade.colloquium1 !== undefined ? grade.colloquium1 : ''}
                          placeholder="-"
                          onChange={(e) =>
                            handleScoreChange(index, 'colloquium1', e.target.value)
                          }
                          className="w-14 h-9 text-center font-medium bg-white border border-[#ccc3d7] rounded-lg focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] outline-none mx-auto text-xs transition-all"
                        />
                      </td>

                      {/* Kollokvium 2 (Max 15) */}
                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="15"
                          step="1"
                          value={grade.colloquium2 !== null && grade.colloquium2 !== undefined ? grade.colloquium2 : ''}
                          placeholder="-"
                          onChange={(e) =>
                            handleScoreChange(index, 'colloquium2', e.target.value)
                          }
                          className="w-14 h-9 text-center font-medium bg-white border border-[#ccc3d7] rounded-lg focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] outline-none mx-auto text-xs transition-all"
                        />
                      </td>

                      {/* Giriş Balı (Max 50) */}
                      <td className="p-3.5 text-center bg-[#eff4ff]/70 border-l border-r border-[#d9e3f6]">
                        <span className={`text-base font-black ${entryTotal >= 17 ? 'text-[#5300b7]' : 'text-amber-600'}`}>
                          {entryTotal}
                        </span>
                        <span className="text-[10px] text-slate-500 block">/ 50</span>
                      </td>

                      {/* İmtahan Balı (Max 50 / Min 17) */}
                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="1"
                          value={grade.examScore !== null && grade.examScore !== undefined ? grade.examScore : ''}
                          placeholder="-"
                          onChange={(e) =>
                            handleScoreChange(index, 'examScore', e.target.value)
                          }
                          className={`w-16 h-9 text-center font-bold border rounded-lg focus:ring-2 outline-none mx-auto text-xs transition-all ${
                            grade.examScore !== null && grade.examScore !== undefined && grade.examScore < 17
                              ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500'
                              : 'bg-white border-[#ccc3d7] text-[#121c2a] focus:ring-[#5300b7]'
                          }`}
                        />
                      </td>

                      {/* Yekun Bal (Max 100) */}
                      <td className="p-3.5 text-center bg-purple-100/50 border-l border-r border-purple-200">
                        <span className={`text-base font-black ${
                          examScore === null || examScore === undefined
                            ? 'text-slate-500'
                            : examScore < 17 || total <= 50
                            ? 'text-rose-600'
                            : 'text-[#5300b7]'
                        }`}>
                          {examScore !== null && examScore !== undefined ? total : '-'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {examScore !== null && examScore !== undefined ? '/ 100' : 'İmtahan gözlənilir'}
                        </span>
                      </td>

                      {/* Nəticə Status */}
                      <td className="p-3.5 text-center">
                        <div className={`inline-flex flex-col items-center px-2.5 py-1 rounded-xl border text-xs font-bold ${evalStatus.badge}`}>
                          <span>{evalStatus.text}</span>
                          <span className="text-[10px] font-normal opacity-80">{evalStatus.subtext}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bottom Bar (Matching Screen 3) */}
      <div className="fixed bottom-5 left-4 right-4 md:left-80 md:right-8 z-40">
        <div className="bg-white/95 backdrop-blur-md border border-[#ccc3d7] rounded-2xl shadow-xl p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status info */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-[#4a4455]">
            <div className="w-5 h-5 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>
              Son yadda saxlanma:{' '}
              <strong className="text-[#121c2a]">
                {lastSavedTime || 'Qeyd edilməyib'}
              </strong>
            </span>
            {isPublished && (
              <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-semibold">
                Dərc Edilib
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="grades-save-btn"
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#ccc3d7] text-[#121c2a] hover:bg-[#f8f9ff] text-sm font-semibold transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-700" />
              <span>Yadda Saxla</span>
            </button>

            <button
              id="grades-publish-btn"
              onClick={handlePublish}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5300b7] hover:bg-[#430094] text-white text-sm font-semibold shadow-[0_4px_12px_rgba(83,0,183,0.25)] transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Tələbə Kabinetində Dərc Et</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
