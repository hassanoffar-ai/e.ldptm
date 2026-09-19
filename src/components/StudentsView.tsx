import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Ticket,
  Mail,
  Phone,
  GraduationCap,
  Grid,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  BookOpen,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { SpecialtyItem, Student } from '../types';
import { GROUPS_LIST, SPECIALTIES_LIST } from '../data/mockData';
import { EditStudentModal } from './EditStudentModal';

interface StudentsViewProps {
  students: Student[];
  specialties?: SpecialtyItem[];
  onOpenTicketKioskForStudent: (studentId: string) => void;
  onOpenNewStudentModal: (defaultGroup?: string, defaultSpecialty?: string) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  specialties = [],
  onOpenTicketKioskForStudent,
  onOpenNewStudentModal,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'registered' | 'pending'>('all');

  // Build combined unique specialties sorted alphabetically
  const allSpecialtyNames = Array.from(
    new Set([
      ...specialties.map((s) => s.name),
      ...SPECIALTIES_LIST,
      ...students.map((s) => s.specialty).filter(Boolean),
    ])
  ).sort((a, b) => a.localeCompare(b, 'az'));

  // Only 1-ci, 2-ci, 3-cü, 4-cü kurs
  const allGroupNames = GROUPS_LIST;

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.finCode && s.finCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || s.group === selectedGroup;
    const matchesSpecialty = selectedSpecialty === 'all' || s.specialty === selectedSpecialty;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'registered' && s.isRegistered) ||
      (selectedStatus === 'pending' && !s.isRegistered);

    return matchesSearch && matchesGroup && matchesSpecialty && matchesStatus;
  });

  const registeredCount = filteredStudents.filter((s) => s.isRegistered).length;
  const pendingCount = filteredStudents.length - registeredCount;

  const handleOpenAddStudentModalWithCohort = () => {
    const defaultGroup = selectedGroup !== 'all' ? selectedGroup : undefined;
    const defaultSpecialty = selectedSpecialty !== 'all' ? selectedSpecialty : undefined;
    onOpenNewStudentModal(defaultGroup, defaultSpecialty);
  };

  return (
    <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#5300b7]">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
              Tələbələr Siyahısı
            </h2>
          </div>
          <p className="text-sm text-[#64748b]">
            E-LDPTM tələbə bazası, ixtisas qrupları və portala qeydiyyat nəzarəti
          </p>
        </div>

        <button
          onClick={handleOpenAddStudentModalWithCohort}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6d28d9] hover:bg-[#581c87] text-white rounded-xl text-sm font-semibold shadow-[0_2px_8px_rgba(109,40,217,0.25)] transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Tələbə Əlavə Et</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7] flex flex-col lg:flex-row gap-3 items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7486]" />
          <input
            type="text"
            placeholder="Ad, Tələbə ID və ya ixtisas ilə axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Specialty Filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <GraduationCap className="w-4 h-4 text-[#7b7486] hidden sm:inline" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full sm:w-auto bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
            >
              <option value="all">Bütün İxtisaslar ({allSpecialtyNames.length})</option>
              {allSpecialtyNames.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Group / Course Filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-[#7b7486] hidden sm:inline" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full sm:w-auto bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
            >
              <option value="all">Bütün Kurslar ({allGroupNames.length})</option>
              {allGroupNames.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full sm:w-auto bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
            >
              <option value="all">Bütün Statuslar</option>
              <option value="registered">Qeydiyyatdan Keçib</option>
              <option value="pending">Gözləmədə</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cohort Active Banner (e.g. Kompüter sistemlərində proqramlaşdırma 2-ci kurslar üçün siyahı) */}
      {(selectedSpecialty !== 'all' || selectedGroup !== 'all' || selectedStatus !== 'all') && (
        <div className="p-4 bg-gradient-to-r from-purple-50 via-purple-100/50 to-indigo-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#5300b7] text-white text-[11px] font-bold uppercase tracking-wide">
                Seçilmiş Siyahı
              </span>
              <h3 className="font-bold text-sm sm:text-base text-[#121c2a]">
                {selectedSpecialty !== 'all' ? selectedSpecialty : 'Bütün İxtisaslar'}{' '}
                {selectedGroup !== 'all' ? `• ${selectedGroup}` : ''}
              </h3>
            </div>
            <p className="text-xs text-[#64748b]">
              Bu qrup/ixtisas üzrə göstərilən tələbələr: <strong className="text-[#5300b7]">{filteredStudents.length} nəfər</strong>{' '}
              ({registeredCount} qeydiyyatdan keçib, {pendingCount} gözləmədə)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setSelectedSpecialty('all');
                setSelectedGroup('all');
                setSelectedStatus('all');
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl font-medium cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
            <button
              onClick={handleOpenAddStudentModalWithCohort}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bu Qrupa Tələbə Əlavə Et</span>
            </button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white border border-[#ccc3d7] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-white text-xs font-semibold text-[#4a4455]">
                <th className="p-4">Tələbə</th>
                <th className="p-4">Tələbə ID</th>
                <th className="p-4">Kurs</th>
                <th className="p-4">İxtisas</th>
                <th className="p-4">Əlaqə</th>
                <th className="p-4">Portal Statusu</th>
                <th className="p-4 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#121c2a] divide-y divide-[#e2e8f0]">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-[#f8f9ff] transition-colors"
                  >
                    <td className="p-4 font-semibold text-[#121c2a]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-[#5300b7] font-bold text-xs flex items-center justify-center shrink-0">
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <span>{student.name}</span>
                          <div className="text-[10px] text-slate-400 font-normal">
                            YTP Subbakalavr
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      <span className="font-bold text-[#5300b7] tracking-wider px-2.5 py-1 bg-purple-50 border border-purple-100 rounded-md inline-block">
                        {student.studentId || student.finCode}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800">
                        {student.group}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#4a4455] max-w-xs font-medium">
                      {student.specialty}
                    </td>
                    <td className="p-4 text-xs text-[#64748b]">
                      {student.email && !student.email.includes('@eldptm.edu.az') ? (
                        <div>{student.email}</div>
                      ) : null}
                      {student.phone ? (
                        <div className="text-[11px] text-slate-400">
                          {student.phone}
                        </div>
                      ) : null}
                      {!student.phone && (!student.email || student.email.includes('@eldptm.edu.az')) && (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {student.isRegistered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Qeydiyyatdan keçib
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                          title="Tələbə mərkəz tərəfindən daxil edilib, hələ portala qeydiyyatdan keçməyib"
                        >
                          Gözləmədə
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-[#5300b7] rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Redaktə et"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-sm">
                    {students.length === 0 ? (
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-[#5300b7] flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="text-base font-bold text-slate-800">
                          Hələ heç bir tələbə qeydiyyatdan keçirilməyib
                        </div>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Real tələbə bazanızı formalaşdırmaq üçün aşağıdakı düymə ilə ilk tələbənizi əlavə edin.
                        </p>
                        <button
                          onClick={handleOpenAddStudentModalWithCohort}
                          className="px-4 py-2 bg-[#6d28d9] hover:bg-[#581c87] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          + Yeni Tələbə Əlavə Et
                        </button>
                      </div>
                    ) : (
                      'Axtarışa və ya seçilmiş filtrlərə uyğun tələbə tapılmadı.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={!!editingStudent}
        student={editingStudent}
        specialties={specialties}
        existingStudents={students}
        onClose={() => setEditingStudent(null)}
        onSave={(updated) => {
          onUpdateStudent?.(updated);
          setEditingStudent(null);
        }}
      />
    </div>
  );
};
