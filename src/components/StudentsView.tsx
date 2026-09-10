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
  Trash2
} from 'lucide-react';
import { Student } from '../types';
import { GROUPS_LIST } from '../data/mockData';

interface StudentsViewProps {
  students: Student[];
  onOpenTicketKioskForStudent: (studentId: string) => void;
  onOpenNewStudentModal: () => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onOpenTicketKioskForStudent,
  onOpenNewStudentModal,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || s.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

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
            E-LDPTM tələbə bazası və imtahan iştirakçıları
          </p>
        </div>

        <button
          onClick={onOpenNewStudentModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6d28d9] hover:bg-[#581c87] text-white rounded-xl text-sm font-semibold shadow-[0_2px_8px_rgba(109,40,217,0.25)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Tələbə Əlavə Et</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ccc3d7] flex flex-col sm:flex-row gap-3 items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7486]" />
          <input
            type="text"
            placeholder="Ad, ID və ya ixtisas üzrə axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#7b7486]" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl px-3 py-2 text-sm text-[#121c2a] outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
          >
            <option value="all">Bütün Qruplar ({students.length})</option>
            {GROUPS_LIST.map((g) => (
              <option key={g} value={g}>
                Qrup {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-[#ccc3d7] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-white text-xs font-semibold text-[#4a4455]">
                <th className="p-4">Tələbə</th>
                <th className="p-4">Tələbə ID</th>
                <th className="p-4">Qrup</th>
                <th className="p-4">İxtisas</th>
                <th className="p-4">Əlaqə</th>
                <th className="p-4">Status</th>
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
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-[#5300b7] font-bold">
                      {student.studentId}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800">
                        {student.group}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#4a4455]">
                      {student.specialty}
                    </td>
                    <td className="p-4 text-xs text-[#64748b]">
                      <div>{student.email}</div>
                      <div className="text-[11px] text-slate-400">
                        {student.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Aktiv
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            onOpenTicketKioskForStudent(student.studentId)
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5300b7] rounded-xl text-xs font-semibold border border-purple-200 transition-colors cursor-pointer"
                          title="İmtahan Biletini Aç / Çap Et"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Bilet</span>
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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
                          onClick={onOpenNewStudentModal}
                          className="px-4 py-2 bg-[#6d28d9] hover:bg-[#581c87] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          + Yeni Tələbə Əlavə Et
                        </button>
                      </div>
                    ) : (
                      'Axtarışa uyğun tələbə tapılmadı.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
