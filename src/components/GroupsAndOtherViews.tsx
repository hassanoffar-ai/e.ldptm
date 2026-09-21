import React, { useState } from 'react';
import {
  Grid,
  GraduationCap,
  BookOpen,
  CheckSquare,
  DoorClosed,
  BarChart3,
  UserCheck,
  Settings,
  Plus,
  Calendar,
  Users,
  Monitor,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Award,
  Search,
  Pencil,
  Trash2,
  Layers,
  Filter,
  X,
  AlertCircle,
  Briefcase,
  UserPlus,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  UploadCloud,
  FileUp,
  Download,
  ExternalLink,
  Loader2,
  Paperclip,
} from 'lucide-react';
import { ActiveTab, ExamSession, GradeBookCourse, SpecialtyItem, SpecialtyModule, Student, StudentGrade } from '../types';
import { GROUPS_LIST, ROOMS_LIST, SUBJECTS_LIST, INITIAL_SPECIALTIES, getStoredModules, SEMESTERS_LIST } from '../data/mockData';
import {
  fetchModulesFromDb,
  upsertModuleToDb,
  deleteModuleFromDb,
  uploadSyllabusFile,
  deleteSyllabusFile,
  upsertCourseToDb,
} from '../lib/supabase';

interface GroupsAndOtherViewsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  courses: GradeBookCourse[];
  sessions: ExamSession[];
  students: Student[];
  specialties: SpecialtyItem[];
  onSaveSpecialties?: (specialties: SpecialtyItem[]) => void;
  onUpdateCourses?: (courses: GradeBookCourse[]) => void;
  onAddSpecialty?: (specialty: SpecialtyItem) => void;
  onUpdateSpecialty?: (specialty: SpecialtyItem) => void;
  onDeleteSpecialty?: (id: string) => void;
  onOpenNewStudentModal?: (defaultGroup?: string, defaultSpecialty?: string) => void;
}

export const GroupsAndOtherViews: React.FC<GroupsAndOtherViewsProps> = ({
  activeTab,
  setActiveTab,
  courses,
  sessions,
  students,
  specialties,
  onSaveSpecialties,
  onUpdateCourses,
  onAddSpecialty,
  onUpdateSpecialty,
  onDeleteSpecialty,
  onOpenNewStudentModal,
}) => {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('all');
  const [selectedCourseYearFilter, setSelectedCourseYearFilter] = useState<string>('all');
  const [specialtySearch, setSpecialtySearch] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [editingSpecialty, setEditingSpecialty] = useState<SpecialtyItem | null>(null);
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);

  // Form states for Add/Edit Specialty
  const [specName, setSpecName] = useState('');
  const [specCode, setSpecCode] = useState('');
  const [specDirection, setSpecDirection] = useState('YTP (Yüksək Texniki Peşə)');
  const [specDuration, setSpecDuration] = useState('3 illik');
  const [specEducationType, setSpecEducationType] = useState<'Əyani' | 'Qiyabi'>('Əyani');
  const [specDescription, setSpecDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Modules (Fənlər) management state
  const [modulesList, setModulesList] = useState<SpecialtyModule[]>(() => getStoredModules());
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState(false);
  const [modSyllabusUrl, setModSyllabusUrl] = useState('');
  const [modSyllabusFileName, setModSyllabusFileName] = useState('');
  const [uploadSyllabusError, setUploadSyllabusError] = useState<string | null>(null);

  // Subject Grades Modal State
  const [isSubjectGradesModalOpen, setIsSubjectGradesModalOpen] = useState(false);
  const [activeSubjectForGrades, setActiveSubjectForGrades] = useState<SpecialtyModule | null>(null);
  const [subjectGradesGroup, setSubjectGradesGroup] = useState<string>('all');
  const [subjectGradesMap, setSubjectGradesMap] = useState<Record<string, StudentGrade>>({});
  const [subjectGradesSuccessMsg, setSubjectGradesSuccessMsg] = useState<string | null>(null);

  // Sync modules from Supabase on mount
  React.useEffect(() => {
    fetchModulesFromDb().then((dbMods) => {
      if (dbMods && dbMods.length > 0) {
        setModulesList(dbMods);
        try {
          localStorage.setItem('eldptm_modules', JSON.stringify(dbMods));
        } catch {}
      }
    });
  }, []);

  const sortedSpecialties = React.useMemo(() => {
    return [...specialties].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'));
  }, [specialties]);

  const [selectedModuleSpecialty, setSelectedModuleSpecialty] = useState<string>(
    sortedSpecialties[0]?.name || 'Kompüter sistemlərində proqramlaşdırma'
  );
  const [selectedModuleSemester, setSelectedModuleSemester] = useState<string>('all');
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<SpecialtyModule | null>(null);

  // Form states for Add/Edit Module (Fənn)
  const [modSpecialty, setModSpecialty] = useState(
    sortedSpecialties[0]?.name || 'Kompüter sistemlərində proqramlaşdırma'
  );
  const [modSemester, setModSemester] = useState(SEMESTERS_LIST[0] || '1-ci kurs 1-ci semestr');
  const [modName, setModName] = useState('');
  const [modCode, setModCode] = useState('');
  const [modCredits, setModCredits] = useState<string>('');
  const [modExamDate, setModExamDate] = useState('');
  const [modExamTime, setModExamTime] = useState('');
  const [modExamRoom, setModExamRoom] = useState('');
  const [modColloquium1Date, setModColloquium1Date] = useState('');
  const [modColloquium1Time, setModColloquium1Time] = useState('');
  const [modColloquium1Room, setModColloquium1Room] = useState('');
  const [modColloquium2Date, setModColloquium2Date] = useState('');
  const [modColloquium2Time, setModColloquium2Time] = useState('');
  const [modColloquium2Room, setModColloquium2Room] = useState('');
  const [modError, setModError] = useState<string | null>(null);

  const saveModules = (updated: SpecialtyModule[]) => {
    setModulesList(updated);
    try {
      localStorage.setItem('eldptm_modules', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModuleModal = () => {
    setEditingModule(null);
    setModSpecialty(
      selectedModuleSpecialty !== 'all'
        ? selectedModuleSpecialty
        : specialties[0]?.name || 'Kompüter sistemlərində proqramlaşdırma'
    );
    setModSemester(selectedModuleSemester !== 'all' ? selectedModuleSemester : SEMESTERS_LIST[0] || '1-ci kurs 1-ci semestr');
    setModName('');
    setModCode('');
    setModCredits('');
    setModExamDate('');
    setModExamTime('');
    setModExamRoom('');
    setModColloquium1Date('');
    setModColloquium1Time('');
    setModColloquium1Room('');
    setModColloquium2Date('');
    setModColloquium2Time('');
    setModColloquium2Room('');
    setModSyllabusUrl('');
    setModSyllabusFileName('');
    setUploadSyllabusError(null);
    setModError(null);
    setIsModuleModalOpen(true);
  };

  const openEditModuleModal = (m: SpecialtyModule) => {
    setEditingModule(m);
    setModSpecialty(m.specialtyName);
    setModSemester(m.semester);
    setModName(m.name);
    setModCode(m.code || '');
    setModCredits(m.credits ? String(m.credits) : '');
    setModExamDate(m.examDate || '');
    setModExamTime(m.examTime || '');
    setModExamRoom(m.examRoom || '');
    setModColloquium1Date(m.colloquium1Date || '');
    setModColloquium1Time(m.colloquium1Time || '');
    setModColloquium1Room(m.colloquium1Room || '');
    setModColloquium2Date(m.colloquium2Date || '');
    setModColloquium2Time(m.colloquium2Time || '');
    setModColloquium2Room(m.colloquium2Room || '');
    setModSyllabusUrl(m.syllabusUrl || '');
    setModSyllabusFileName(m.syllabusFileName || '');
    setUploadSyllabusError(null);
    setModError(null);
    setIsModuleModalOpen(true);
  };

  // Open Subject Grades Modal
  const openSubjectGradesModal = (m: SpecialtyModule) => {
    setActiveSubjectForGrades(m);
    setSubjectGradesGroup('all');
    setSubjectGradesSuccessMsg(null);

    const matchedCourse = courses.find((c) => {
      return (
        (c.subject || '').toLowerCase().trim() === (m.name || '').toLowerCase().trim() &&
        (!m.specialtyName || (c.specialty || '').toLowerCase().trim() === (m.specialtyName || '').toLowerCase().trim())
      );
    });

    const gradesMap: Record<string, StudentGrade> = {};
    if (matchedCourse && matchedCourse.grades) {
      matchedCourse.grades.forEach((g) => {
        gradesMap[g.studentId || g.idNumber] = { ...g };
      });
    }

    const specStudents = students.filter((s) => {
      const sSpec = (s.specialty || '').toLowerCase().trim();
      const mSpec = (m.specialtyName || '').toLowerCase().trim();
      return !mSpec || sSpec === mSpec || sSpec.includes(mSpec) || mSpec.includes(sSpec);
    });

    specStudents.forEach((s) => {
      const key = s.studentId || s.id;
      if (!gradesMap[key]) {
        gradesMap[key] = {
          studentId: s.studentId || s.id,
          studentName: s.name,
          idNumber: s.studentId || s.finCode || '',
          avatarInitial: s.name.charAt(0).toUpperCase(),
          attendance: null,
          seminar: null,
          colloquium1: null,
          colloquium2: null,
          examScore: null,
        };
      }
    });

    setSubjectGradesMap(gradesMap);
    setIsSubjectGradesModalOpen(true);
  };

  const handleGradeCellChange = (
    studentKey: string,
    field: keyof StudentGrade,
    valStr: string
  ) => {
    const num = valStr === '' ? null : Number(valStr);
    setSubjectGradesMap((prev) => {
      const current = prev[studentKey] || {
        studentId: studentKey,
        studentName: '',
        idNumber: studentKey,
        avatarInitial: 'T',
        attendance: null,
        seminar: null,
        colloquium1: null,
        colloquium2: null,
        examScore: null,
      };
      return {
        ...prev,
        [studentKey]: {
          ...current,
          [field]: num,
        },
      };
    });
  };

  const handleSaveSubjectGrades = () => {
    if (!activeSubjectForGrades) return;

    const gradesArray = Object.values(subjectGradesMap);
    const courseId = `course-${activeSubjectForGrades.id || Date.now()}`;
    const defaultGroup = students.find(s => s.specialty === activeSubjectForGrades.specialtyName)?.group || '1-ci kurs';

    const updatedCourse: GradeBookCourse = {
      id: courseId,
      group: subjectGradesGroup !== 'all' ? subjectGradesGroup : defaultGroup,
      specialty: activeSubjectForGrades.specialtyName,
      subject: activeSubjectForGrades.name,
      subjectCode: activeSubjectForGrades.code || 'YTP-FƏNN',
      semester: activeSubjectForGrades.semester,
      maxScore: 100,
      lastSaved: new Date().toISOString(),
      isPublished: true,
      grades: gradesArray,
    };

    const otherCourses = courses.filter(
      (c) =>
        c.id !== courseId &&
        !(
          c.subject.toLowerCase().trim() === activeSubjectForGrades.name.toLowerCase().trim() &&
          c.specialty.toLowerCase().trim() === activeSubjectForGrades.specialtyName.toLowerCase().trim()
        )
    );

    const newCoursesList = [updatedCourse, ...otherCourses];
    if (onUpdateCourses) {
      onUpdateCourses(newCoursesList);
    }
    try {
      localStorage.setItem('eldptm_courses', JSON.stringify(newCoursesList));
    } catch {}
    upsertCourseToDb(updatedCourse);

    setSubjectGradesSuccessMsg('Ballar yadda saxlanıldı və tələbələrin şəxsi kabinetində dərc edildi!');
    setTimeout(() => setSubjectGradesSuccessMsg(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 30MB
    if (file.size > 30 * 1024 * 1024) {
      setUploadSyllabusError('Fayl ölçüsü maksimum 30MB ola bilər.');
      return;
    }

    setIsUploadingSyllabus(true);
    setUploadSyllabusError(null);

    const { url, fileName, error } = await uploadSyllabusFile(file);
    setIsUploadingSyllabus(false);

    if (error) {
      setUploadSyllabusError(
        `Fayl yüklənərkən xəta baş verdi: ${error.message || 'Storage xətası'}`
      );
    } else if (url) {
      setModSyllabusUrl(url);
      setModSyllabusFileName(fileName);
    }
  };

  const handleRemoveSyllabusFile = () => {
    setModSyllabusUrl('');
    setModSyllabusFileName('');
    setUploadSyllabusError(null);
  };

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modName.trim()) {
      setModError('Fənnin adı mütləq daxil edilməlidir.');
      return;
    }

    if (editingModule) {
      const updatedItem: SpecialtyModule = {
        ...editingModule,
        specialtyName: modSpecialty,
        semester: modSemester,
        name: modName.trim(),
        code: modCode.trim() || undefined,
        credits: modCredits.trim() ? Number(modCredits.trim()) : undefined,
        examDate: modExamDate.trim() || undefined,
        examTime: modExamTime.trim() || undefined,
        examRoom: modExamRoom.trim() || undefined,
        colloquium1Date: modColloquium1Date.trim() || undefined,
        colloquium1Time: modColloquium1Time.trim() || undefined,
        colloquium1Room: modColloquium1Room.trim() || undefined,
        colloquium2Date: modColloquium2Date.trim() || undefined,
        colloquium2Time: modColloquium2Time.trim() || undefined,
        colloquium2Room: modColloquium2Room.trim() || undefined,
        syllabusUrl: modSyllabusUrl.trim() || undefined,
        syllabusFileName: modSyllabusFileName.trim() || (modSyllabusUrl ? 'Sillabus Faylı' : undefined),
      };
      const updated = modulesList.map((m) => (m.id === editingModule.id ? updatedItem : m));
      saveModules(updated);
      upsertModuleToDb(updatedItem);
    } else {
      const newMod: SpecialtyModule = {
        id: `mod-${Date.now()}`,
        specialtyName: modSpecialty,
        semester: modSemester,
        name: modName.trim(),
        code: modCode.trim() || undefined,
        credits: modCredits.trim() ? Number(modCredits.trim()) : undefined,
        examDate: modExamDate.trim() || undefined,
        examTime: modExamTime.trim() || undefined,
        examRoom: modExamRoom.trim() || undefined,
        colloquium1Date: modColloquium1Date.trim() || undefined,
        colloquium1Time: modColloquium1Time.trim() || undefined,
        colloquium1Room: modColloquium1Room.trim() || undefined,
        colloquium2Date: modColloquium2Date.trim() || undefined,
        colloquium2Time: modColloquium2Time.trim() || undefined,
        colloquium2Room: modColloquium2Room.trim() || undefined,
        syllabusUrl: modSyllabusUrl.trim() || undefined,
        syllabusFileName: modSyllabusFileName.trim() || (modSyllabusUrl ? 'Sillabus Faylı' : undefined),
        createdAt: new Date().toISOString(),
      };
      saveModules([newMod, ...modulesList]);
      upsertModuleToDb(newMod);
    }

    setIsModuleModalOpen(false);
  };

  const handleDeleteModule = (id: string, name: string) => {
    if (window.confirm(`"${name}" fənnini silmək istədiyinizdən əminsiniz?`)) {
      const target = modulesList.find((m) => m.id === id);
      if (target?.syllabusUrl) {
        deleteSyllabusFile(target.syllabusUrl);
      }
      const updated = modulesList.filter((m) => m.id !== id);
      saveModules(updated);
      deleteModuleFromDb(id);
    }
  };

  const openAddSpecialtyModal = () => {
    setEditingSpecialty(null);
    setSpecName('');
    setSpecCode('');
    setSpecDirection('YTP (Yüksək Texniki Peşə)');
    setSpecDuration('3 illik');
    setSpecEducationType('Əyani');
    setSpecDescription('');
    setFormError(null);
    setIsSpecialtyModalOpen(true);
  };

  const openEditSpecialtyModal = (item: SpecialtyItem) => {
    setEditingSpecialty(item);
    setSpecName(item.name);
    setSpecCode(item.code || '');
    setSpecDirection(item.direction || 'YTP (Yüksək Texniki Peşə)');
    setSpecDuration(item.duration || '3 illik');
    setSpecEducationType(item.educationType || 'Əyani');
    setSpecDescription(item.description || '');
    setFormError(null);
    setIsSpecialtyModalOpen(true);
  };

  const handleSaveSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim()) {
      setFormError('İxtisasın adını qeyd edin');
      return;
    }
    if (!specDuration.trim()) {
      setFormError('İxtisasın təhsil müddətini (neçə il olduğunu) qeyd edin');
      return;
    }

    const finalDirection = 'YTP (Yüksək Texniki Peşə)';
    const finalCode = specCode.trim() || 'YTP';
    const finalDuration = specDuration.trim();

    if (editingSpecialty) {
      const updated: SpecialtyItem = {
        ...editingSpecialty,
        name: specName.trim(),
        code: finalCode,
        direction: finalDirection,
        duration: finalDuration,
        educationType: specEducationType,
        description: specDescription.trim() || undefined,
      };
      if (onUpdateSpecialty) onUpdateSpecialty(updated);
    } else {
      const newSpecialty: SpecialtyItem = {
        id: `spec-${Date.now()}`,
        name: specName.trim(),
        code: finalCode,
        direction: finalDirection,
        duration: finalDuration,
        educationType: specEducationType,
        description: specDescription.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      if (onAddSpecialty) onAddSpecialty(newSpecialty);
    }

    setIsSpecialtyModalOpen(false);
  };

  const handleDeleteSpecialtyClick = (id: string, name: string) => {
    if (window.confirm(`"${name}" ixtisasını silmək istədiyinizdən əminsiniz?`)) {
      if (onDeleteSpecialty) onDeleteSpecialty(id);
    }
  };

  // Qruplar və Davamiyyət ləğv edildiyi üçün fallback
  if (activeTab === 'groups' || activeTab === 'attendance' || activeTab === 'journal') {
    setActiveTab('specialties');
    return null;
  }

  // İxtisaslar View
  if (activeTab === 'specialties') {
    const rawList = sortedSpecialties.length > 0 ? sortedSpecialties : INITIAL_SPECIALTIES;
    const sanitizeDirection = (dir?: string) => {
      if (!dir || dir === 'Texniki' || dir === 'Qeyri-texniki' || !dir.trim()) {
        return 'YTP (Yüksək Texniki Peşə)';
      }
      return dir;
    };

    const safeSpecialties = rawList
      .map((spec, idx) => ({
        ...spec,
        id: spec.id || `spec-${idx}`,
        name: spec.name || 'İxtisas',
        code: spec.code || '',
        direction: sanitizeDirection(spec.direction),
        duration: spec.duration || '3 illik',
        educationType: spec.educationType || 'Əyani',
        description: spec.description || '',
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'));

    const filteredSpecialties = safeSpecialties
      .filter((spec) => {
        const query = (specialtySearch || '').toLowerCase().trim();
        const matchesSearch =
          !query ||
          (spec.name || '').toLowerCase().includes(query) ||
          (spec.code || '').toLowerCase().includes(query) ||
          (spec.direction || '').toLowerCase().includes(query);

        if (directionFilter === 'all') return matchesSearch;
        return matchesSearch && spec.direction === directionFilter;
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'));

    const uniqueDirections = Array.from(new Set(safeSpecialties.map((s) => s.direction || 'YTP (Yüksək Texniki Peşə)')));

    return (
      <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
        {/* Header with Title and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#5300b7]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
                İxtisaslar və Peşə İstiqamətləri
              </h2>
            </div>
            <p className="text-sm text-[#64748b]">
              E-LDPTM Tədris Mərkəzi üzrə rəsmi ixtisaslar və hər ixtisasa uyğun tələbə qeydiyyatı
            </p>
          </div>

          <button
            onClick={openAddSpecialtyModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5300b7] hover:bg-[#430093] text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-purple-900/10 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İxtisas Əlavə Et</span>
          </button>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7] shadow-xs">
            <div className="flex items-center gap-2 text-[#64748b] text-xs mb-1">
              <Briefcase className="w-4 h-4 text-[#5300b7]" />
              <span>Ümumi İxtisaslar</span>
            </div>
            <div className="text-2xl font-bold text-[#121c2a]">{safeSpecialties.length}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7] shadow-xs">
            <div className="flex items-center gap-2 text-[#64748b] text-xs mb-1">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Qeydiyyatlı Tələbələr</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">{students.length}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7] flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#7b7486]" />
            <input
              type="text"
              placeholder="İxtisas adı, kod və ya peşə istiqaməti ilə axtarın..."
              value={specialtySearch}
              onChange={(e) => setSpecialtySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] transition-all"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
            >
              <option value="all">Bütün İstiqamətlər ({safeSpecialties.length})</option>
              {uniqueDirections.map((dir) => (
                <option key={dir} value={dir}>
                  {dir}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty State when no specialties exist */}
        {safeSpecialties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-[#ccc3d7] p-8 md:p-12 text-center max-w-2xl mx-auto my-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#5300b7] flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-[#121c2a] mb-1">
                Heç bir ixtisas və ya peşə istiqaməti daxil edilməyib
              </h3>
              <p className="text-sm text-[#64748b] leading-relaxed max-w-md mx-auto">
                Köhnə sınaq məlumatları təmizlənib. İnzibatçı olaraq E-LDPTM tədris mərkəzində tədris olunan ixtisasları və peşə istiqamətlərini aşağıdakı düymə ilə birbaşa əlavə edə bilərsiniz.
              </p>
            </div>
            <button
              onClick={openAddSpecialtyModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5300b7] hover:bg-[#430093] text-white rounded-xl font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>İlk İxtisası Əlavə Et</span>
            </button>
          </div>
        ) : filteredSpecialties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ccc3d7] p-8 text-center text-sm text-[#64748b]">
            Axtarış sorğusuna uyğun heç bir ixtisas tapılmadı.
          </div>
        ) : (
          /* Specialties Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSpecialties.map((spec) => {
              const enrolledStudents = students.filter((s) => s.specialty === spec.name).length;

              return (
                <div
                  key={spec.id}
                  className="bg-white p-5 rounded-2xl border border-[#ccc3d7] hover:border-[#5300b7]/50 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-medium border bg-purple-100/60 text-purple-900 border-purple-200"
                      >
                        {spec.direction || 'YTP (Yüksək Texniki Peşə)'}
                      </span>
                      {spec.code && (
                        <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {spec.code}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-lg text-[#121c2a] mb-1.5 leading-snug">
                      {spec.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#64748b] mt-2 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {spec.duration || '3 illik'}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                        {spec.educationType || 'Əyani'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <Users className="w-3.5 h-3.5" />
                        {enrolledStudents} tələbə
                      </span>
                    </div>

                    {spec.description && (
                      <p className="text-xs text-[#7b7486] line-clamp-2 mb-3">
                        {spec.description}
                      </p>
                    )}
                  </div>

                  {/* Card Actions: Dedicated Student Registration & Management */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenNewStudentModal?.(undefined, spec.name)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Bu İxtisasa Tələbə Əlavə Et</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setActiveTab('students');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Tələbələr siyahısına bax"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Siyahı</span>
                      </button>

                      <button
                        onClick={() => openEditSpecialtyModal(spec)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Düzəliş et"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteSpecialtyClick(spec.id, spec.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Specialty Modal */}
        {isSpecialtyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#5300b7] flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-[#121c2a]">
                    {editingSpecialty ? 'İxtisasa Düzəliş Et' : 'Yeni İxtisas və Peşə İstiqaməti Daxil Et'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsSpecialtyModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSpecialty} className="p-6 space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                    İxtisasın Tam Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="məs: Kompüter sistemlərində proqram təminatı"
                    value={specName}
                    onChange={(e) => setSpecName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                      Təhsil pilləsi *
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="YTP (Yüksək Texniki Peşə)"
                      className="w-full px-3.5 py-2.5 bg-purple-50/60 border border-purple-200 text-[#5300b7] font-semibold rounded-xl text-sm outline-none cursor-default"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                      Təhsil Forması
                    </label>
                    <select
                      value={specEducationType}
                      onChange={(e) => setSpecEducationType(e.target.value as 'Əyani' | 'Qiyabi')}
                      className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                    >
                      <option value="Əyani">Əyani</option>
                      <option value="Qiyabi">Qiyabi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#4a4455]">
                      Təhsil Müddəti (İl sayı) *
                    </label>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                      Müddət: {specDuration || 'Seçilməyib'}
                    </span>
                  </div>

                  {/* 1-dən 4-ə qədər il sayı seçimi */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {['1 illik', '2 illik', '3 illik', '4 illik'].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setSpecDuration(dur)}
                        className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                          specDuration === dur
                            ? 'bg-[#5300b7] text-white border-[#5300b7] shadow-sm ring-2 ring-[#5300b7]/20'
                            : 'bg-[#f8f9ff] text-slate-700 border-[#ccc3d7] hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>

                  <select
                    value={specDuration}
                    onChange={(e) => setSpecDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7] font-medium"
                    required
                  >
                    <option value="1 illik">1 illik (1 il)</option>
                    <option value="2 illik">2 illik (2 il)</option>
                    <option value="3 illik">3 illik (3 il)</option>
                    <option value="4 illik">4 illik (4 il)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    İxtisas üzrə təhsil müddətini seçin (1-ci ildən 4-cü ilə qədər).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                    Qeyd və ya İxtisas Haqqında Əlavə Məlumat
                  </label>
                  <textarea
                    rows={2}
                    placeholder="İxtisas üzrə qısa xülasə və ya şərtlər..."
                    value={specDescription}
                    onChange={(e) => setSpecDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsSpecialtyModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#5300b7] hover:bg-[#430093] text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-purple-900/15 cursor-pointer"
                  >
                    {editingSpecialty ? 'Yadda Saxla' : 'İxtisası Daxil Et'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fənlər, İmtahan Cədvəli və Qiymətləndirmə View
  if (activeTab === 'subjects' || activeTab === 'grades') {
    const filteredModules = modulesList.filter((m) => {
      const matchesSpecialty =
        selectedModuleSpecialty === 'all' ||
        m.specialtyName.toLowerCase().trim() === selectedModuleSpecialty.toLowerCase().trim();
      const matchesSemester =
        selectedModuleSemester === 'all' || m.semester === selectedModuleSemester;
      return matchesSpecialty && matchesSemester;
    });

    return (
      <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#5300b7]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
                Fənlər, İmtahan Cədvəli və Qiymətləndirmə
              </h2>
            </div>
            <p className="text-sm text-[#64748b]">
              İxtisaslar və semestrlər üzrə fənlər, sillabuslar, kollokvium/imtahan cədvəli və tələbə qiymət jurnalı
            </p>
          </div>

          <button
            onClick={openAddModuleModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Fənn Əlavə Et</span>
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7] shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Specialty filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                İxtisas Seçin
              </label>
              <select
                value={selectedModuleSpecialty}
                onChange={(e) => setSelectedModuleSpecialty(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
              >
                <option value="all">Bütün İxtisaslar ({modulesList.length} fənn)</option>
                {sortedSpecialties.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Semestr Seçin
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedModuleSemester('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedModuleSemester === 'all'
                      ? 'bg-[#5300b7] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Bütün Semestrlər
                </button>
                {SEMESTERS_LIST.map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSelectedModuleSemester(sem)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedModuleSemester === sem
                        ? 'bg-[#5300b7] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        {filteredModules.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-600" />
            <h3 className="text-base font-bold text-slate-700">
              Bu seçim üzrə heç bir fənn tapılmadı
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Seçilmiş ixtisas və ya semestr üçün yeni fənn əlavə edə bilərsiniz.
            </p>
            <button
              onClick={openAddModuleModal}
              className="mt-4 px-4 py-2 bg-[#5300b7] hover:bg-[#430094] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              + Fənn Əlavə Et
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((m) => {
              const hasExamInfo = m.examDate || m.examTime || m.examRoom;
              return (
                <div
                  key={m.id}
                  className="bg-white p-5 rounded-2xl border border-[#ccc3d7] hover:border-[#6d28d9] transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {m.semester}
                      </span>
                      {m.code && (
                        <span className="text-[11px] font-mono font-bold text-[#5300b7] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {m.code}
                        </span>
                      )}
                    </div>

                    {/* Specialty label */}
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight line-clamp-1">
                      {m.specialtyName}
                    </p>

                    {/* Title & Credits */}
                    <div>
                      <h3 className="font-bold text-base text-[#121c2a] leading-snug">
                        {m.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-slate-500">
                          {m.credits ? `${m.credits} kredit` : 'YTP Fənni'}
                        </span>
                      </div>
                    </div>

                    {m.description && (
                      <p className="text-xs text-[#64748b] line-clamp-2">
                        {m.description}
                      </p>
                    )}

                    {/* Schedule Details Badge */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      {/* 1. Kollokvium 1 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>1-ci Kollokvium</span>
                          </div>
                          {(m.colloquium1Date || m.colloquium1Time || m.colloquium1Room) ? (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">Təyin edilib</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Təyin edilməyib</span>
                          )}
                        </div>
                        {(m.colloquium1Date || m.colloquium1Time || m.colloquium1Room) && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-700 pl-4">
                            {m.colloquium1Date && <span>Tarix: <strong>{m.colloquium1Date}</strong></span>}
                            {m.colloquium1Time && <span>Saat: <strong>{m.colloquium1Time}</strong></span>}
                            {m.colloquium1Room && <span>Otaq: <strong>{m.colloquium1Room}</strong></span>}
                          </div>
                        )}
                      </div>

                      {/* 2. Kollokvium 2 */}
                      <div className="space-y-1 pt-1.5 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-xs font-bold text-purple-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>2-ci Kollokvium</span>
                          </div>
                          {(m.colloquium2Date || m.colloquium2Time || m.colloquium2Room) ? (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">Təyin edilib</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Təyin edilməyib</span>
                          )}
                        </div>
                        {(m.colloquium2Date || m.colloquium2Time || m.colloquium2Room) && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-700 pl-4">
                            {m.colloquium2Date && <span>Tarix: <strong>{m.colloquium2Date}</strong></span>}
                            {m.colloquium2Time && <span>Saat: <strong>{m.colloquium2Time}</strong></span>}
                            {m.colloquium2Room && <span>Otaq: <strong>{m.colloquium2Room}</strong></span>}
                          </div>
                        )}
                      </div>

                      {/* 3. Yekun İmtahan */}
                      <div className="space-y-1 pt-1.5 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-xs font-bold text-[#5300b7]">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            <span>Yekun İmtahan</span>
                          </div>
                          {(m.examDate || m.examTime || m.examRoom) ? (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">Təyin edilib</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Təyin edilməyib</span>
                          )}
                        </div>
                        {(m.examDate || m.examTime || m.examRoom) && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-700 pl-4">
                            {m.examDate && <span>Tarix: <strong>{m.examDate}</strong></span>}
                            {m.examTime && <span>Saat: <strong>{m.examTime}</strong></span>}
                            {m.examRoom && <span>Otaq: <strong>{m.examRoom}</strong></span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Syllabus Badge / Download if available */}
                    {m.syllabusUrl ? (
                      <div className="pt-1">
                        <a
                          href={m.syllabusUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5300b7] border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs group"
                          title="Sillabus sənədini aç / yüklə"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#5300b7] group-hover:scale-110 transition-transform" />
                          <span className="truncate max-w-[180px]">
                            {m.syllabusFileName || 'Sillabusa Bax (PDF)'}
                          </span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">Sillabus faylı əlavə edilməyib</p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => openSubjectGradesModal(m)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] hover:bg-[#5300b7] text-[#5300b7] hover:text-white rounded-xl font-bold transition-all shadow-2xs cursor-pointer"
                      title="Bu fənn üzrə tələbələrin ballarını daxil et və ya redaktə et"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Tələbə Qiymət Cədvəli</span>
                    </button>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModuleModal(m)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Fənni və Cədvəli Redaktə Et"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteModule(m.id, m.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add/Edit Fənn & Kollokvium / İmtahan Schedule */}
        {isModuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#ccc3d7] w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 bg-[#f8f9ff] border-b border-[#ccc3d7] flex items-center justify-between sticky top-0 bg-[#f8f9ff] z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#5300b7] text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-[#121c2a]">
                    {editingModule ? 'Fənni və Cədvəlləri Redaktə Et' : 'Yeni Fənn və Cədvəllər Əlavə Et'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModuleModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveModule} className="p-6 space-y-4">
                {modError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modError}</span>
                  </div>
                )}

                {/* Specialty */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    İxtisas *
                  </label>
                  <select
                    value={modSpecialty}
                    onChange={(e) => setModSpecialty(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
                  >
                    {sortedSpecialties.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semestr *
                  </label>
                  <select
                    value={modSemester}
                    onChange={(e) => setModSemester(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
                  >
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

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fənnin Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: Proqramlaşdırmanın Əsasları"
                    value={modName}
                    onChange={(e) => setModName(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7]"
                  />
                </div>

                {/* Code & Credits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fənn Kodu (İstəyə bağlı)
                    </label>
                    <input
                      type="text"
                      placeholder="Məs: KSP-101"
                      value={modCode}
                      onChange={(e) => setModCode(e.target.value)}
                      className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kredit Sayı (İstəyə bağlı)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      placeholder="Məs: 4"
                      value={modCredits}
                      onChange={(e) => setModCredits(e.target.value)}
                      className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                    />
                  </div>
                </div>

                {/* 1-ci Kollokvium Block */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-700" />
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                      1-ci Kollokvium Cədvəli
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tarix</label>
                      <input
                        type="date"
                        value={modColloquium1Date}
                        onChange={(e) => setModColloquium1Date(e.target.value)}
                        className="w-full bg-white border border-[#ccc3d7] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Saat</label>
                      <input
                        type="text"
                        placeholder="Məs: 10:00"
                        value={modColloquium1Time}
                        onChange={(e) => setModColloquium1Time(e.target.value)}
                        className="w-full bg-white border border-[#ccc3d7] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Otaq / Zal</label>
                      <input
                        type="text"
                        placeholder="Məs: Otaq 102"
                        value={modColloquium1Room}
                        onChange={(e) => setModColloquium1Room(e.target.value)}
                        className="w-full bg-white border border-[#ccc3d7] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 2-ci Kollokvium Block */}
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                      2-ci Kollokvium Cədvəli
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tarix</label>
                      <input
                        type="date"
                        value={modColloquium2Date}
                        onChange={(e) => setModColloquium2Date(e.target.value)}
                        className="w-full bg-white border border-[#ccc3d7] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Saat</label>
                      <input
                        type="text"
                        placeholder="Məs: 14:00"
                        value={modColloquium2Time}
                        onChange={(e) => setModColloquium2Time(e.target.value)}
                        className="w-full bg-white border border-[#ccc3d7] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Otaq / Zal</label>
                      <input
                        type="text"
                        placeholder="Məs: Otaq 204"
                        value={modColloquium2Room}
                        onChange={(e) => setModColloquium2Room(e.target.value)}
                        className="w-full bg-white border border-[#ccc3d7] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Yekun İmtahan Block */}
                <div className="p-3.5 rounded-xl bg-violet-50/70 border border-[#5300b7]/30 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#5300b7]" />
                    <h4 className="text-xs font-bold text-[#5300b7] uppercase tracking-wide">
                      Yekun İmtahan Cədvəli
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">İmtahan Günü</label>
                      <input
                        type="date"
                        value={modExamDate}
                        onChange={(e) => setModExamDate(e.target.value)}
                        className="w-full bg-white border border-[#ccc3d7] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#5300b7]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">İmtahan Saatı</label>
                      <input
                        type="text"
                        placeholder="Məs: 10:00"
                        value={modExamTime}
                        onChange={(e) => setModExamTime(e.target.value)}
                        className="w-full bg-white border border-[#ccc3d7] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#5300b7]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">İmtahan Otağı</label>
                      <input
                        type="text"
                        placeholder="Məs: İmtahan Zalı 1"
                        value={modExamRoom}
                        onChange={(e) => setModExamRoom(e.target.value)}
                        className="w-full bg-white border border-[#ccc3d7] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#5300b7]"
                      />
                    </div>
                  </div>
                </div>

                {/* Syllabus Attachment (Supabase 'syllabuses' bucket) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sillabus Sənədi (Supabase Storage: <code className="text-[#5300b7]">syllabuses</code>)
                  </label>

                  {uploadSyllabusError && (
                    <div className="mb-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadSyllabusError}</span>
                    </div>
                  )}

                  {modSyllabusUrl ? (
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#5300b7] text-white flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {modSyllabusFileName || 'Sillabus Faylı'}
                          </p>
                          <a
                            href={modSyllabusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#5300b7] font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>Faylı Görüntülə</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveSyllabusFile}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Faylı çıxart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-[#ccc3d7] hover:border-[#5300b7] rounded-xl p-4 text-center transition-all bg-[#f8f9ff] hover:bg-purple-50/20 group">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                        onChange={handleFileUpload}
                        disabled={isUploadingSyllabus}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                      />
                      {isUploadingSyllabus ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#5300b7] py-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Supabase 'syllabuses' bucketinə yüklənir...</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 py-1">
                          <UploadCloud className="w-7 h-7 mx-auto text-[#5300b7] opacity-80 group-hover:scale-110 transition-transform" />
                          <p className="text-xs font-bold text-slate-700">
                            Sillabus faylını seçin və ya buraya sürükləyin
                          </p>
                          <p className="text-[11px] text-slate-500">
                            PDF, Word (.docx) • Maksimum 30 MB
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModuleModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingSyllabus}
                    className="flex-1 py-2.5 bg-[#5300b7] hover:bg-[#430093] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-purple-900/15 cursor-pointer"
                  >
                    {editingModule ? 'Yadda Saxla' : 'Fənni Əlavə Et'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Subject Student Grades Table (Interactive Evaluation) */}
        {isSubjectGradesModalOpen && activeSubjectForGrades && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#ccc3d7] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-5 py-4 bg-[#f8f9ff] border-b border-[#ccc3d7] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5300b7] text-white flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[#121c2a]">
                        {activeSubjectForGrades.name} — Qiymətləndirmə Cədvəli
                      </h3>
                      {activeSubjectForGrades.code && (
                        <span className="px-2 py-0.5 bg-purple-100 text-[#5300b7] font-mono font-bold text-xs rounded-md">
                          {activeSubjectForGrades.code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748b]">
                      İxtisas: <strong>{activeSubjectForGrades.specialtyName}</strong> • Semestr: <strong>{activeSubjectForGrades.semester}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSubjectGradesModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toolbar & Filter */}
              <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-700">Qrup Filtri:</span>
                  <select
                    value={subjectGradesGroup}
                    onChange={(e) => setSubjectGradesGroup(e.target.value)}
                    className="px-3 py-1.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="all">Bütün Qruplar ({students.filter(s => {
                      const sSpec = (s.specialty || '').toLowerCase().trim();
                      const mSpec = (activeSubjectForGrades.specialtyName || '').toLowerCase().trim();
                      return !mSpec || sSpec === mSpec || sSpec.includes(mSpec) || mSpec.includes(sSpec);
                    }).length} tələbə)</option>
                    {GROUPS_LIST.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-slate-700 mr-1">Qiymət Şkalası:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">A: Əla (91-100)</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">B: Çox yaxşı (81-90)</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">C: Yaxşı (71-80)</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">D: Kafi (61-70)</span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">E: Qənaətbəxş (51-60)</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">F: Kəsildi (&lt;51 və ya İmtahan &lt;17)</span>
                </div>
              </div>

              {subjectGradesSuccessMsg && (
                <div className="mx-5 my-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{subjectGradesSuccessMsg}</span>
                </div>
              )}

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {(() => {
                  const filteredStudents = students.filter((s) => {
                    const sSpec = (s.specialty || '').toLowerCase().trim();
                    const mSpec = (activeSubjectForGrades.specialtyName || '').toLowerCase().trim();
                    const matchSpec = !mSpec || sSpec === mSpec || sSpec.includes(mSpec) || mSpec.includes(sSpec);
                    const matchGroup = subjectGradesGroup === 'all' || s.group === subjectGradesGroup;
                    return matchSpec && matchGroup;
                  });

                  if (filteredStudents.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        Bu ixtisas və qrup üzrə tələbə tapılmadı. "Tələbələr" bölməsindən yeni tələbə əlavə edə bilərsiniz.
                      </div>
                    );
                  }

                  return (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                            <th className="py-3 px-3.5">Tələbə (Ad, Soyad)</th>
                            <th className="py-3 px-2 text-center w-24">Davamiyyət<br/><span className="text-[10px] text-slate-500 font-normal">(Max 10)</span></th>
                            <th className="py-3 px-2 text-center w-24">Seminar<br/><span className="text-[10px] text-slate-500 font-normal">(Max 10)</span></th>
                            <th className="py-3 px-2 text-center w-24">Kol 1<br/><span className="text-[10px] text-slate-500 font-normal">(Max 15)</span></th>
                            <th className="py-3 px-2 text-center w-24">Kol 2<br/><span className="text-[10px] text-slate-500 font-normal">(Max 15)</span></th>
                            <th className="py-3 px-2 text-center w-24 bg-purple-50 text-[#5300b7]">Giriş Balı<br/><span className="text-[10px] text-purple-600 font-normal">(Max 50)</span></th>
                            <th className="py-3 px-2 text-center w-24 bg-amber-50 text-amber-900">İmtahan<br/><span className="text-[10px] text-amber-700 font-normal">(Max 50 / Min 17)</span></th>
                            <th className="py-3 px-2 text-center w-24 bg-purple-100/60 text-purple-900">Yekun Bal<br/><span className="text-[10px] text-purple-700 font-normal">(Max 100)</span></th>
                            <th className="py-3 px-3 text-center">Nəticə və Hərf</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudents.map((s) => {
                            const key = s.studentId || s.id;
                            const g = subjectGradesMap[key] || {
                              studentId: key,
                              studentName: s.name,
                              idNumber: s.studentId || s.finCode || '',
                              avatarInitial: s.name.charAt(0).toUpperCase(),
                              attendance: null,
                              seminar: null,
                              colloquium1: null,
                              colloquium2: null,
                              examScore: null,
                            };

                            const entryTotal = (g.attendance || 0) + (g.seminar || 0) + (g.colloquium1 || 0) + (g.colloquium2 || 0);
                            const finalTotal = entryTotal + (g.examScore || 0);

                            let statusBadge = (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                Gözlənilir
                              </span>
                            );

                            if (g.examScore !== null && g.examScore !== undefined) {
                              if (g.examScore < 17 || finalTotal <= 50) {
                                statusBadge = (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    F — Kəsildi
                                  </span>
                                );
                              } else if (finalTotal >= 91) {
                                statusBadge = (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    A — Əla
                                  </span>
                                );
                              } else if (finalTotal >= 81) {
                                statusBadge = (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                    B — Çox yaxşı
                                  </span>
                                );
                              } else if (finalTotal >= 71) {
                                statusBadge = (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                    C — Yaxşı
                                  </span>
                                );
                              } else if (finalTotal >= 61) {
                                statusBadge = (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    D — Kafi
                                  </span>
                                );
                              } else {
                                statusBadge = (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-300">
                                    E — Qənaətbəxş
                                  </span>
                                );
                              }
                            } else if (entryTotal > 0) {
                              statusBadge = (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#5300b7] border border-purple-200">
                                  Giriş: {entryTotal}
                                </span>
                              );
                            }

                            return (
                              <tr key={key} className="hover:bg-purple-50/20 transition-colors">
                                <td className="py-2.5 px-3.5">
                                  <div className="font-bold text-slate-900">{s.name}</div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                    <span className="font-mono text-[#5300b7]">{s.studentId || s.finCode}</span>
                                    <span>•</span>
                                    <span>{s.group}</span>
                                  </div>
                                </td>

                                {/* Attendance */}
                                <td className="py-2 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={g.attendance ?? ''}
                                    onChange={(e) => handleGradeCellChange(key, 'attendance', e.target.value)}
                                    placeholder="-"
                                    className="w-14 text-center px-1.5 py-1 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#5300b7] outline-none"
                                  />
                                </td>

                                {/* Seminar */}
                                <td className="py-2 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={g.seminar ?? ''}
                                    onChange={(e) => handleGradeCellChange(key, 'seminar', e.target.value)}
                                    placeholder="-"
                                    className="w-14 text-center px-1.5 py-1 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#5300b7] outline-none"
                                  />
                                </td>

                                {/* Colloquium 1 */}
                                <td className="py-2 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="15"
                                    value={g.colloquium1 ?? ''}
                                    onChange={(e) => handleGradeCellChange(key, 'colloquium1', e.target.value)}
                                    placeholder="-"
                                    className="w-14 text-center px-1.5 py-1 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#5300b7] outline-none"
                                  />
                                </td>

                                {/* Colloquium 2 */}
                                <td className="py-2 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="15"
                                    value={g.colloquium2 ?? ''}
                                    onChange={(e) => handleGradeCellChange(key, 'colloquium2', e.target.value)}
                                    placeholder="-"
                                    className="w-14 text-center px-1.5 py-1 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#5300b7] outline-none"
                                  />
                                </td>

                                {/* Entry Total */}
                                <td className="py-2 px-2 text-center bg-purple-50/40">
                                  <span className="font-mono font-black text-[#5300b7] text-sm">
                                    {entryTotal}
                                  </span>
                                </td>

                                {/* Exam Score */}
                                <td className="py-2 px-2 text-center bg-amber-50/40">
                                  <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={g.examScore ?? ''}
                                    onChange={(e) => handleGradeCellChange(key, 'examScore', e.target.value)}
                                    placeholder="-"
                                    className={`w-14 text-center px-1.5 py-1 rounded-lg border border-amber-300 bg-white font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none ${
                                      g.examScore !== null && g.examScore < 17 ? 'text-rose-600 bg-rose-50' : 'text-amber-950'
                                    }`}
                                  />
                                </td>

                                {/* Final Total */}
                                <td className="py-2 px-2 text-center bg-purple-100/40">
                                  <span className={`font-mono font-black text-sm ${
                                    g.examScore !== null && (g.examScore < 17 || finalTotal <= 50) ? 'text-rose-600' : 'text-[#5300b7]'
                                  }`}>
                                    {g.examScore !== null ? finalTotal : `${entryTotal} (Giriş)`}
                                  </span>
                                </td>

                                {/* Status */}
                                <td className="py-2 px-3 text-center">
                                  {statusBadge}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-[#f8f9ff] border-t border-[#ccc3d7] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-slate-500">
                  Ballar yadda saxlanılan kimi tələbənin şəxsi kabinetində canlı görünəcək.
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsSubjectGradesModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Bağla
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSubjectGrades}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#5300b7] hover:bg-[#430093] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/15 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Balları Yadda Saxla və Dərc Et</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Hesabatlar, İstifadəçilər, Ayarlar Fallback Views
  return (
    <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a] capitalize">
          {activeTab === 'reports'
            ? 'Hesabatlar və Analitika'
            : activeTab === 'users'
            ? 'İstifadəçilər və İcazələr'
            : 'Sistem Ayarları'}
        </h2>
        <p className="text-sm text-[#64748b]">
          E-LDPTM Tədris Mərkəzi İdarəetmə Paneli Konfiqurasiyası
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#ccc3d7] space-y-4">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 leading-relaxed">
          <strong>Sistem Parametrləri:</strong> 2023/2024 Tədris ili aktivdir.
          Bütün İmtahan Protokolları, Bilet Çap Kiosku və Qiymət Daxiletmə
          modulları tam sinxronizasiyada çalışır.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => setActiveTab('exams')}
            className="p-4 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 text-left transition-colors"
          >
            <h4 className="font-bold text-sm text-slate-800 mb-1">
              İmtahan Protokolu
            </h4>
            <p className="text-xs text-slate-500">
              Cədvəl və iştirakçı imzaları
            </p>
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className="p-4 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 text-left transition-colors"
          >
            <h4 className="font-bold text-sm text-slate-800 mb-1">
              Qiymət Daxiletmə
            </h4>
            <p className="text-xs text-slate-500">
              Semestr qiymətləndirməsi
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
