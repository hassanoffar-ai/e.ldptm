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
} from 'lucide-react';
import { ActiveTab, ExamSession, GradeBookCourse, SpecialtyItem, SpecialtyModule, Student } from '../types';
import { GROUPS_LIST, ROOMS_LIST, SUBJECTS_LIST, INITIAL_SPECIALTIES, getStoredModules, SEMESTERS_LIST } from '../data/mockData';

interface GroupsAndOtherViewsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  students: Student[];
  sessions: ExamSession[];
  courses: GradeBookCourse[];
  specialties?: SpecialtyItem[];
  onAddSpecialty?: (specialty: SpecialtyItem) => void;
  onUpdateSpecialty?: (specialty: SpecialtyItem) => void;
  onDeleteSpecialty?: (id: string) => void;
  onOpenNewStudentModal?: (defaultGroup?: string, defaultSpecialty?: string) => void;
}

export const GroupsAndOtherViews: React.FC<GroupsAndOtherViewsProps> = ({
  activeTab,
  setActiveTab,
  students,
  sessions,
  courses,
  specialties = [],
  onAddSpecialty,
  onUpdateSpecialty,
  onDeleteSpecialty,
  onOpenNewStudentModal,
}) => {
  // Specialty management states
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<SpecialtyItem | null>(null);

  // Form states for Add/Edit Specialty
  const [specName, setSpecName] = useState('');
  const [specCode, setSpecCode] = useState('');
  const [specDirection, setSpecDirection] = useState('Yüksək Texniki Peşə (YTP)');
  const [specDuration, setSpecDuration] = useState('3 illik');
  const [specEducationType, setSpecEducationType] = useState<'Əyani' | 'Qiyabi'>('Əyani');
  const [specDescription, setSpecDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Modules and Syllabuses Management States
  const [modulesList, setModulesList] = useState<SpecialtyModule[]>(() => getStoredModules());

  const [selectedModuleSpecialty, setSelectedModuleSpecialty] = useState<string>(
    specialties[0]?.name || 'Kompüter sistemlərində proqramlaşdırma'
  );
  const [selectedModuleSemester, setSelectedModuleSemester] = useState<string>('all');
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<SpecialtyModule | null>(null);

  // Form states for Add/Edit Module
  const [modSpecialty, setModSpecialty] = useState(
    specialties[0]?.name || 'Kompüter sistemlərində proqramlaşdırma'
  );
  const [modSemester, setModSemester] = useState('I Semestr');
  const [modName, setModName] = useState('');
  const [modHours, setModHours] = useState(60);
  const [modCredits, setModCredits] = useState(5);
  const [modInstructor, setModInstructor] = useState('');
  const [modSyllabusTopics, setModSyllabusTopics] = useState('');
  const [modDescription, setModDescription] = useState('');
  const [modError, setModError] = useState<string | null>(null);
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);

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
    setModSemester(selectedModuleSemester !== 'all' ? selectedModuleSemester : 'I Semestr');
    setModName('');
    setModHours(60);
    setModCredits(5);
    setModInstructor('');
    setModSyllabusTopics('');
    setModDescription('');
    setModError(null);
    setIsModuleModalOpen(true);
  };

  const openEditModuleModal = (m: SpecialtyModule) => {
    setEditingModule(m);
    setModSpecialty(m.specialtyName);
    setModSemester(m.semester);
    setModName(m.name);
    setModHours(m.creditHours || 60);
    setModCredits(m.credits || 5);
    setModInstructor(m.instructor || '');
    setModSyllabusTopics(m.syllabusTopics || '');
    setModDescription(m.description || '');
    setModError(null);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modName.trim()) {
      setModError('Modulun adı mütləq daxil edilməlidir.');
      return;
    }

    if (editingModule) {
      const updated = modulesList.map((m) =>
        m.id === editingModule.id
          ? {
              ...m,
              specialtyName: modSpecialty,
              semester: modSemester,
              name: modName.trim(),
              creditHours: Number(modHours) || 60,
              credits: Number(modCredits) || 5,
              instructor: modInstructor.trim(),
              syllabusTopics: modSyllabusTopics.trim(),
              description: modDescription.trim(),
            }
          : m
      );
      saveModules(updated);
    } else {
      const newMod: SpecialtyModule = {
        id: `mod-${Date.now()}`,
        specialtyName: modSpecialty,
        semester: modSemester,
        name: modName.trim(),
        creditHours: Number(modHours) || 60,
        credits: Number(modCredits) || 5,
        instructor: modInstructor.trim(),
        syllabusTopics: modSyllabusTopics.trim(),
        description: modDescription.trim(),
        createdAt: new Date().toISOString(),
      };
      saveModules([newMod, ...modulesList]);
    }

    setIsModuleModalOpen(false);
  };

  const handleDeleteModule = (id: string, name: string) => {
    if (window.confirm(`"${name}" modulunu və tədris sillabusunu silmək istədiyinizdən əminsiniz?`)) {
      const updated = modulesList.filter((m) => m.id !== id);
      saveModules(updated);
    }
  };

  const openAddSpecialtyModal = () => {
    setEditingSpecialty(null);
    setSpecName('');
    setSpecCode('');
    setSpecDirection('Yüksək Texniki Peşə (YTP)');
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
    setSpecDirection('Yüksək Texniki Peşə (YTP)');
    setSpecDuration(item.duration === '4 illik' ? '4 illik' : '3 illik');
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

    const finalDirection = 'Yüksək Texniki Peşə (YTP)';
    const finalCode = specCode.trim() || 'YTP';

    if (editingSpecialty) {
      const updated: SpecialtyItem = {
        ...editingSpecialty,
        name: specName.trim(),
        code: finalCode,
        direction: finalDirection,
        duration: specDuration,
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
        duration: specDuration,
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
    const rawList = specialties && specialties.length > 0 ? specialties : INITIAL_SPECIALTIES;
    const safeSpecialties = rawList.map((spec, idx) => ({
      ...spec,
      id: spec.id || `spec-${idx}`,
      name: spec.name || 'İxtisas',
      code: spec.code || '',
      direction: spec.direction || 'Yüksək Texniki Peşə (YTP)',
      duration: spec.duration || '3 illik',
      educationType: spec.educationType || 'Əyani',
      description: spec.description || '',
    }));

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

    const uniqueDirections = Array.from(new Set(safeSpecialties.map((s) => s.direction || 'Yüksək Texniki Peşə (YTP)')));

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
                        {spec.direction || 'Yüksək Texniki Peşə (YTP)'}
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
                      Peşə İstiqaməti / Təhsil Səviyyəsi *
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Yüksək Texniki Peşə (YTP)"
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
                  <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                    Təhsil Müddəti *
                  </label>
                  <select
                    value={specDuration}
                    onChange={(e) => setSpecDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                  >
                    <option value="3 illik">3 illik</option>
                    <option value="4 illik">4 illik</option>
                  </select>
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

  // Fənlər / Modullar və Sillabuslar View
  if (activeTab === 'subjects') {
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
                Modullar və Sillabuslar
              </h2>
            </div>
            <p className="text-sm text-[#64748b]">
              İxtisaslar və semestrlər üzrə tədris modulları, saatlar və tədris planı
            </p>
          </div>

          <button
            onClick={openAddModuleModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Modul və Sillabus Əlavə Et</span>
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
                <option value="all">Bütün İxtisaslar ({modulesList.length} modul)</option>
                {specialties.map((s) => (
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
              Bu seçim üzrə heç bir modul tapılmadı
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Seçilmiş ixtisas və ya semestr üçün yeni modul və sillabus əlavə edə bilərsiniz.
            </p>
            <button
              onClick={openAddModuleModal}
              className="mt-4 px-4 py-2 bg-[#5300b7] hover:bg-[#430094] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              + Modul Əlavə Et
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((m) => {
              const isExpanded = expandedSyllabusId === m.id;
              return (
                <div
                  key={m.id}
                  className="bg-white p-5 rounded-2xl border border-[#ccc3d7] hover:border-[#6d28d9] transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {m.semester}
                      </span>
                    </div>

                    {/* Specialty label */}
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight line-clamp-1">
                      {m.specialtyName}
                    </p>

                    {/* Title */}
                    <h3 className="font-bold text-base text-[#121c2a] leading-snug">
                      {m.name}
                    </h3>

                    {m.description && (
                      <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
                        {m.description}
                      </p>
                    )}

                    {/* Metadata chips */}
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

                    {/* Syllabus Accordion / Topics */}
                    {m.syllabusTopics && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setExpandedSyllabusId(isExpanded ? null : m.id)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-[#5300b7] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-purple-600" />
                            <span>Sillabus Planı və Mövzuları</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                            {m.syllabusTopics}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setActiveTab('grades')}
                      className="text-[#5300b7] font-bold hover:underline cursor-pointer"
                    >
                      Qiymət Jurnalı →
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModuleModal(m)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Redaktə Et"
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

        {/* Modal: Add/Edit Module */}
        {isModuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#ccc3d7] w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 bg-[#f8f9ff] border-b border-[#ccc3d7] flex items-center justify-between sticky top-0 bg-[#f8f9ff] z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#5300b7] text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-[#121c2a]">
                    {editingModule ? 'Modulu Redaktə Et' : 'Yeni Modul və Sillabus Əlavə Et'}
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
                    İxtisas
                  </label>
                  <select
                    value={modSpecialty}
                    onChange={(e) => setModSpecialty(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
                  >
                    {specialties.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semestr
                  </label>
                  <select
                    value={modSemester}
                    onChange={(e) => setModSemester(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
                  >
                    {SEMESTERS_LIST.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Modulun Adı
                  </label>
                  <input
                    type="text"
                    placeholder="Məs: Proqramlaşdırmanın Əsasları"
                    value={modName}
                    onChange={(e) => setModName(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7]"
                  />
                </div>

                {/* Hours, Credits, Teacher */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tədris Saatı
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={modHours}
                      onChange={(e) => setModHours(Number(e.target.value))}
                      className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kredit Sayı
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={modCredits}
                      onChange={(e) => setModCredits(Number(e.target.value))}
                      className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tədris Edən Müəllim
                    </label>
                    <input
                      type="text"
                      placeholder="Məs: Əliyev V."
                      value={modInstructor}
                      onChange={(e) => setModInstructor(e.target.value)}
                      className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7]"
                    />
                  </div>
                </div>

                {/* Syllabus Topics */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sillabus Mövzuları və Tədris Planı
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Hər mövzunu yeni sətirdən daxil edin (məs: 1. Giriş və anlayışlar&#10;2. Şərt operatorları&#10;3. Funksiyalar...)"
                    value={modSyllabusTopics}
                    onChange={(e) => setModSyllabusTopics(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl p-3 text-xs font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qısa Təsvir / Qeydlər
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Modul haqqında qısa izahat..."
                    value={modDescription}
                    onChange={(e) => setModDescription(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl p-3 text-xs font-medium text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7]"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModuleModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Ləğv Et
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#5300b7] hover:bg-[#430094] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {editingModule ? 'Yadda Saxla' : 'Modulu Əlavə Et'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otaqlar (Lab-1, Lab-2, Lab-3, Lab-4) View
  if (activeTab === 'rooms') {
    return (
      <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#5300b7]">
              <DoorClosed className="w-5 h-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
              İmtahan və Kompüter Otaqları
            </h2>
          </div>
          <p className="text-sm text-[#64748b]">
            Laboratoriyalar, PC nömrələri və otaq təchizatı
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ROOMS_LIST.slice(0, 4).map((room) => {
            const activeSession = sessions.find((s) => s.room === room);
            const occupiedCount = activeSession ? activeSession.items.length : 0;

            return (
              <div
                key={room}
                className="bg-white p-6 rounded-2xl border border-[#ccc3d7] shadow-xs"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#121c2a]">{room}</h3>
                    <p className="text-xs text-[#64748b]">
                      Tutum: 20 Kompüter • Onlayn İmtahan Sistemi
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      activeSession
                        ? 'bg-purple-50 text-[#5300b7] border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {activeSession ? 'İmtahan Gedir' : 'Boş / Hazır'}
                  </span>
                </div>

                {/* PC visual grid */}
                <div className="grid grid-cols-5 gap-2 py-3">
                  {Array.from({ length: 10 }).map((_, pcIdx) => {
                    const pcNum = `PC-${(pcIdx + 1).toString().padStart(2, '0')}`;
                    const isOccupied = pcIdx < occupiedCount;
                    return (
                      <div
                        key={pcNum}
                        className={`p-2 rounded-xl border text-center text-xs transition-colors ${
                          isOccupied
                            ? 'bg-purple-50 border-purple-300 text-[#5300b7] font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <Monitor className="w-4 h-4 mx-auto mb-1 opacity-70" />
                        <span>{pcNum}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    {activeSession
                      ? `Cari İmtahan: ${activeSession.subject} (${activeSession.group})`
                      : 'Hazırda bu otaqda imtahan təyin edilməyib'}
                  </span>
                  <button
                    onClick={() => setActiveTab('exams')}
                    className="text-[#5300b7] font-semibold hover:underline cursor-pointer"
                  >
                    Protokola bax →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
