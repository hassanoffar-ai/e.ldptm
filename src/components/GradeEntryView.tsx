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
import { GradeBookCourse, StudentGrade } from '../types';
import { GROUPS_LIST, SPECIALTIES_LIST, SUBJECTS_LIST } from '../data/mockData';

interface GradeEntryViewProps {
  courses: GradeBookCourse[];
  onUpdateCourses: (updated: GradeBookCourse[]) => void;
  onOpenNewCourseModal?: () => void;
  onDeleteCourse?: (id: string) => void;
}

export const GradeEntryView: React.FC<GradeEntryViewProps> = ({
  courses,
  onUpdateCourses,
  onOpenNewCourseModal,
  onDeleteCourse,
}) => {
  const currentCourse =
    courses.find(
      (c) => c.group === selectedGroupId && c.subject === selectedSubject
    ) || courses[0] || null;

  const [selectedGroupId, setSelectedGroupId] = useState(
    currentCourse?.group || GROUPS_LIST[0] || 'İT-21'
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    currentCourse?.specialty || SPECIALTIES_LIST[0] || 'İnformasiya Texnologiyaları'
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
    field: 'seminar' | 'laboratory' | 'independentWork' | 'colloquium',
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
      const maxLimit = field === 'colloquium' ? 20 : 10;
      if (num > maxLimit) num = maxLimit;

      newGrades[index][field] = num;
    }
    setGradesList(newGrades);
  };

  const calculateTotal = (grade: StudentGrade) => {
    const sem = grade.seminar || 0;
    const lab = grade.laboratory || 0;
    const ind = grade.independentWork || 0;
    const col = grade.colloquium || 0;
    return sem + lab + ind + col;
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
      'Seminar (Max 10)',
      'Laboratoriya (Max 10)',
      'Sərbəst İş (Max 10)',
      'Kollokvium (Max 20)',
      'Yekun Bal (Cəmi 50)',
    ];
    const rows = gradesList.map((g, idx) => [
      idx + 1,
      g.studentName,
      g.idNumber,
      g.seminar ?? '-',
      g.laboratory ?? '-',
      g.independentWork ?? '-',
      g.colloquium ?? '-',
      calculateTotal(g),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Qiymet_Cedveli_${selectedGroupId}_${selectedSubject.replace(
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
                {SPECIALTIES_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
                {SUBJECTS_LIST.map((sub) => (
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
                <option value="II Semestr (2023/2024)">
                  II Semestr (2023/2024)
                </option>
                <option value="I Semestr (2023/2024)">
                  I Semestr (2023/2024)
                </option>
                <option value="Yaz Semestri (2023/2024)">
                  Yaz Semestri (2023/2024)
                </option>
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
            <span>Maksimum 50 bal (Seminar: 10, Lab: 10, Sərbəst: 10, Kollokvium: 20)</span>
          </div>
        </div>

        {/* The Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-white text-xs font-semibold text-[#4a4455]">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 min-w-[220px]">Tələbə</th>
                <th className="p-4 text-center min-w-[120px]">
                  <div>Seminar</div>
                  <div className="text-[10px] text-[#7b7486] font-normal">
                    (Max 10)
                  </div>
                </th>
                <th className="p-4 text-center min-w-[120px]">
                  <div>Laboratoriya</div>
                  <div className="text-[10px] text-[#7b7486] font-normal">
                    (Max 10)
                  </div>
                </th>
                <th className="p-4 text-center min-w-[120px]">
                  <div>Sərbəst İş</div>
                  <div className="text-[10px] text-[#7b7486] font-normal">
                    (Max 10)
                  </div>
                </th>
                <th className="p-4 text-center min-w-[120px]">
                  <div>Kollokvium</div>
                  <div className="text-[10px] text-[#7b7486] font-normal">
                    (Max 20)
                  </div>
                </th>
                <th className="p-4 text-center min-w-[130px] bg-[#eff4ff]/60 border-l border-[#e2e8f0]">
                  <div className="text-[#5300b7] font-bold">Yekun Bal</div>
                  <div className="text-[10px] text-[#6d28d9] font-medium">
                    (Cəmi 50)
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#121c2a] divide-y divide-[#e2e8f0]">
              {gradesList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                    Bu qrup üzrə jurnalda hələ heç bir tələbə qeydiyyatda deyil. Tələbələr bölməsindən bu qrupa tələbə əlavə edildikdə avtomatik burada əks olunacaq.
                  </td>
                </tr>
              ) : (
                gradesList.map((grade, index) => {
                  const total = calculateTotal(grade);
                  const isPassing = total >= 17; // General admission threshold

                  return (
                    <tr
                      key={grade.studentId || index}
                      className="hover:bg-[#f8f9ff] transition-colors"
                    >
                    {/* Index */}
                    <td className="p-4 text-center text-xs text-[#7b7486] font-medium">
                      {index + 1}
                    </td>

                    {/* Student Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar initials circle */}
                        <div className="w-10 h-10 rounded-full bg-[#eff4ff] text-[#5300b7] font-bold text-xs flex items-center justify-center shrink-0 border border-[#d9e3f6]">
                          {grade.avatarInitial}
                        </div>
                        <div>
                          <div className="font-semibold text-[#121c2a]">
                            {grade.studentName}
                          </div>
                          <div className="text-xs text-[#7b7486] font-mono">
                            ID: {grade.idNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Seminar Input (Max 10) */}
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        value={grade.seminar !== null ? grade.seminar : ''}
                        placeholder="-"
                        onChange={(e) =>
                          handleScoreChange(index, 'seminar', e.target.value)
                        }
                        className="w-16 h-10 text-center font-medium bg-white border border-[#ccc3d7] rounded-lg focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] outline-none mx-auto text-sm transition-all"
                      />
                    </td>

                    {/* Laboratory Input (Max 10) */}
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        value={grade.laboratory !== null ? grade.laboratory : ''}
                        placeholder="-"
                        onChange={(e) =>
                          handleScoreChange(index, 'laboratory', e.target.value)
                        }
                        className="w-16 h-10 text-center font-medium bg-white border border-[#ccc3d7] rounded-lg focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] outline-none mx-auto text-sm transition-all"
                      />
                    </td>

                    {/* Sərbəst İş Input (Max 10) */}
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        value={
                          grade.independentWork !== null
                            ? grade.independentWork
                            : ''
                        }
                        placeholder="-"
                        onChange={(e) =>
                          handleScoreChange(
                            index,
                            'independentWork',
                            e.target.value
                          )
                        }
                        className="w-16 h-10 text-center font-medium bg-white border border-[#ccc3d7] rounded-lg focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] outline-none mx-auto text-sm transition-all"
                      />
                    </td>

                    {/* Kollokvium Input (Max 20) */}
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="1"
                        value={grade.colloquium !== null ? grade.colloquium : ''}
                        placeholder="-"
                        onChange={(e) =>
                          handleScoreChange(index, 'colloquium', e.target.value)
                        }
                        className="w-16 h-10 text-center font-medium bg-white border border-[#ccc3d7] rounded-lg focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] outline-none mx-auto text-sm transition-all"
                      />
                    </td>

                    {/* Yekun Bal (Max 50) */}
                    <td className="p-4 text-center bg-[#eff4ff]/60 border-l border-[#e2e8f0]">
                      <span className="text-lg font-extrabold text-[#5300b7] block">
                        {total}
                      </span>
                    </td>
                  </tr>
                );
              }))}
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
