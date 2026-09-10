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
  Briefcase
} from 'lucide-react';
import { ActiveTab, ExamSession, GradeBookCourse, SpecialtyItem, Student } from '../types';
import { GROUPS_LIST, ROOMS_LIST, SUBJECTS_LIST } from '../data/mockData';

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
}) => {
  // Specialty management states
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<SpecialtyItem | null>(null);

  // Form states for Add/Edit Specialty
  const [specName, setSpecName] = useState('');
  const [specCode, setSpecCode] = useState('');
  const [specDirection, setSpecDirection] = useState('Yüksək Texniki Peşə (YTP) Subbakalavr');
  const [specCustomDirection, setSpecCustomDirection] = useState('');
  const [specDuration, setSpecDuration] = useState('2 il (4 semestr)');
  const [specEducationType, setSpecEducationType] = useState<'Əyani' | 'Qiyabi'>('Əyani');
  const [specDescription, setSpecDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openAddSpecialtyModal = () => {
    setEditingSpecialty(null);
    setSpecName('');
    setSpecCode('');
    setSpecDirection('Yüksək Texniki Peşə (YTP) Subbakalavr');
    setSpecCustomDirection('');
    setSpecDuration('2 il (4 semestr)');
    setSpecEducationType('Əyani');
    setSpecDescription('');
    setFormError(null);
    setIsSpecialtyModalOpen(true);
  };

  const openEditSpecialtyModal = (item: SpecialtyItem) => {
    setEditingSpecialty(item);
    setSpecName(item.name);
    setSpecCode(item.code);
    const standardDirections = [
      'Yüksək Texniki Peşə (YTP) Subbakalavr',
      'Texniki Peşə',
      'İlk Peşə',
      'Qısamüddətli Peşə Təlimi',
    ];
    if (standardDirections.includes(item.direction)) {
      setSpecDirection(item.direction);
      setSpecCustomDirection('');
    } else {
      setSpecDirection('Digər');
      setSpecCustomDirection(item.direction);
    }
    setSpecDuration(item.duration || '2 il (4 semestr)');
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
    if (!specCode.trim()) {
      setFormError('İxtisas kodunu qeyd edin');
      return;
    }

    const finalDirection =
      specDirection === 'Digər'
        ? specCustomDirection.trim() || 'Xüsusi Peşə İstiqaməti'
        : specDirection;

    if (editingSpecialty) {
      const updated: SpecialtyItem = {
        ...editingSpecialty,
        name: specName.trim(),
        code: specCode.trim(),
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
        code: specCode.trim(),
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

  // Qruplar View
  if (activeTab === 'groups') {
    return (
      <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#5300b7]">
                <Grid className="w-5 h-5" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
                Akademik Qruplar
              </h2>
            </div>
            <p className="text-sm text-[#64748b]">
              E-LDPTM üzrə tədris olunan bütün qrupların siyahısı
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {GROUPS_LIST.map((group) => {
            const groupStudents = students.filter((s) => s.group === group);
            const groupExams = sessions.filter((e) => e.group === group);

            return (
              <div
                key={group}
                className="bg-white p-5 rounded-2xl border border-[#ccc3d7] shadow-xs hover:border-[#6d28d9] transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5300b7] font-bold text-base flex items-center justify-center border border-purple-100">
                    {group}
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                    Aktiv Qrup
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#121c2a] mb-1">
                  Qrup {group}
                </h3>
                <p className="text-xs text-[#64748b] mb-4">
                  İnformasiya Texnologiyaları Şöbəsi
                </p>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tələbə sayı:</span>
                    <strong className="text-slate-900">
                      {groupStudents.length} nəfər
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Təyin olunmuş imtahanlar:</span>
                    <strong className="text-[#5300b7]">
                      {groupExams.length} fənn
                    </strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex gap-2">
                  <button
                    onClick={() => setActiveTab('exams')}
                    className="flex-1 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5300b7] rounded-lg text-xs font-semibold transition-colors"
                  >
                    Protokola Keç
                  </button>
                  <button
                    onClick={() => setActiveTab('grades')}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Jurnal / Ballar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // İxtisaslar View
  if (activeTab === 'specialties') {
    const filteredSpecialties = specialties.filter((spec) => {
      const matchesSearch =
        spec.name.toLowerCase().includes(specialtySearch.toLowerCase()) ||
        spec.code.toLowerCase().includes(specialtySearch.toLowerCase()) ||
        spec.direction.toLowerCase().includes(specialtySearch.toLowerCase());

      if (directionFilter === 'all') return matchesSearch;
      return matchesSearch && spec.direction === directionFilter;
    });

    const ytpCount = specialties.filter((s) => s.direction.includes('YTP') || s.direction.includes('Yüksək')).length;
    const vocationalCount = specialties.length - ytpCount;
    const uniqueDirections = Array.from(new Set(specialties.map((s) => s.direction)));

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
              E-LDPTM Tədris Mərkəzi üzrə rəsmi ixtisaslar və peşə təhsili istiqamətlərinin idarə edilməsi
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7] shadow-xs">
            <div className="flex items-center gap-2 text-[#64748b] text-xs mb-1">
              <Briefcase className="w-4 h-4 text-[#5300b7]" />
              <span>Ümumi İxtisaslar</span>
            </div>
            <div className="text-2xl font-bold text-[#121c2a]">{specialties.length}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7] shadow-xs">
            <div className="flex items-center gap-2 text-[#64748b] text-xs mb-1">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>YTP Subbakalavr</span>
            </div>
            <div className="text-2xl font-bold text-[#5300b7]">{ytpCount}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7] shadow-xs">
            <div className="flex items-center gap-2 text-[#64748b] text-xs mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Texniki / İlk Peşə</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{vocationalCount}</div>
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
              <option value="all">Bütün İstiqamətlər ({specialties.length})</option>
              {uniqueDirections.map((dir) => (
                <option key={dir} value={dir}>
                  {dir}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty State when no specialties exist */}
        {specialties.length === 0 ? (
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
              const isYtp = spec.direction.includes('YTP') || spec.direction.includes('Yüksək');

              return (
                <div
                  key={spec.id}
                  className="bg-white p-5 rounded-2xl border border-[#ccc3d7] hover:border-purple-300 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span className="text-xs px-2.5 py-1 bg-purple-50 text-[#5300b7] rounded-lg font-mono font-bold border border-purple-100">
                        KOD: {spec.code}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                          isYtp
                            ? 'bg-purple-100/60 text-purple-900 border-purple-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {spec.direction}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-[#121c2a] mb-1">
                      {spec.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748b] mt-2 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {spec.duration || '2 il'}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                        {spec.educationType || 'Əyani'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
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

                  {/* Card Actions */}
                  <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditSpecialtyModal(spec)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Düzəliş et</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSpecialtyClick(spec.id, spec.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sil</span>
                    </button>
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
                      İxtisas Kodu *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="məs: 040501 və ya IT-01"
                      value={specCode}
                      onChange={(e) => setSpecCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7]"
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
                    Peşə İstiqaməti / Təhsil Səviyyəsi *
                  </label>
                  <select
                    value={specDirection}
                    onChange={(e) => setSpecDirection(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                  >
                    <option value="Yüksək Texniki Peşə (YTP) Subbakalavr">
                      Yüksək Texniki Peşə (YTP) Subbakalavr
                    </option>
                    <option value="Texniki Peşə">Texniki Peşə</option>
                    <option value="İlk Peşə">İlk Peşə</option>
                    <option value="Qısamüddətli Peşə Təlimi">Qısamüddətli Peşə Təlimi</option>
                    <option value="Digər">Digər (Fərdi İstiqamət)</option>
                  </select>
                </div>

                {specDirection === 'Digər' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                      İstiqamətin Adını Qeyd Edin
                    </label>
                    <input
                      type="text"
                      placeholder="məs: İxtisasartırma kursu"
                      value={specCustomDirection}
                      onChange={(e) => setSpecCustomDirection(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                    Təhsil Müddəti
                  </label>
                  <select
                    value={specDuration}
                    onChange={(e) => setSpecDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                  >
                    <option value="2 il (4 semestr)">2 il (4 semestr)</option>
                    <option value="1.5 il (3 semestr)">1.5 il (3 semestr)</option>
                    <option value="3 il (6 semestr)">3 il (6 semestr)</option>
                    <option value="1 il (2 semestr)">1 il (2 semestr)</option>
                    <option value="6 ay">6 ay</option>
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

  // Fənlər / Modullar View
  if (activeTab === 'subjects') {
    return (
      <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#5300b7]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
              Tədris Fənləri və Modullar
            </h2>
          </div>
          <p className="text-sm text-[#64748b]">
            Semestr imtahan və qiymətləndirmə fənləri
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS_LIST.map((sub, i) => (
            <div
              key={sub}
              className="bg-white p-5 rounded-2xl border border-[#ccc3d7] hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mb-2 inline-block">
                  Modul #{i + 101}
                </span>
                <h4 className="font-bold text-base text-[#121c2a] mb-2">
                  {sub}
                </h4>
                <p className="text-xs text-[#64748b]">
                  60 Saat Mühazirə + 30 Saat Laboratoriya təcrübəsi
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Maksimum Bal: 50 + 50</span>
                <button
                  onClick={() => setActiveTab('grades')}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Ballara Bax →
                </button>
              </div>
            </div>
          ))}
        </div>
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
            Laboratoriyalar, PC nömrələri və zal təchizatı
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
                      : 'Hazırda bu zalda imtahan təyin edilməyib'}
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

  // Davamiyyət & Jurnal View
  if (activeTab === 'attendance' || activeTab === 'journal') {
    return (
      <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#5300b7]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
              {activeTab === 'attendance' ? 'Davamiyyət Jurnalı' : 'Elektron Jurnal'}
            </h2>
          </div>
          <p className="text-sm text-[#64748b]">
            Dərslərdə iştirak və cari qiymətləndirmə monitorinqi
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#ccc3d7] p-6 shadow-xs">
          {students.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Jurnalda göstərmək üçün sistemdə hələ heç bir tələbə qeydiyyatda deyil. Əvvəlcə tələbələr əlavə edin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="p-3">Tələbə</th>
                    <th className="p-3">Qrup</th>
                    <th className="p-3">İxtisas</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">İştirak Payı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-800">
                        {s.name} ({s.studentId})
                      </td>
                      <td className="p-3 text-slate-600 font-medium">
                        {s.group}
                      </td>
                      <td className="p-3 text-slate-500">
                        {s.specialty}
                      </td>
                      <td className="p-3 text-center text-emerald-600 font-bold">
                        Aktiv
                      </td>
                      <td className="p-3 text-center font-semibold text-purple-700">
                        100%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
            onClick={() => setActiveTab('tickets')}
            className="p-4 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 text-left transition-colors"
          >
            <h4 className="font-bold text-sm text-slate-800 mb-1">
              Bilet Çap Kiosku
            </h4>
            <p className="text-xs text-slate-500">
              Tələbə biletlərinin generasiyası
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
              50 ballıq aralıq qiymətləndirmə
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
