import React, { useState, useEffect } from 'react';
import {
  X,
  Edit2,
  Users,
  AlertCircle,
  KeyRound,
  GraduationCap,
} from 'lucide-react';
import { SpecialtyItem, Student } from '../types';
import { GROUPS_LIST, SPECIALTIES_LIST } from '../data/mockData';

interface EditStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
  specialties?: SpecialtyItem[];
  existingStudents?: Student[];
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onSave,
  specialties = [],
  existingStudents = [],
}) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [group, setGroup] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | 'graduated'>('active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setStudentId(student.studentId || student.finCode || '');
      setGroup(student.group || GROUPS_LIST[0] || '');

      const specList =
        specialties.length > 0 ? specialties.map((s) => s.name) : SPECIALTIES_LIST;

      if (specList.includes(student.specialty)) {
        setSpecialty(student.specialty);
        setCustomSpecialty('');
      } else {
        setSpecialty('__custom__');
        setCustomSpecialty(student.specialty || '');
      }

      setStatus(student.status || 'active');
      setError(null);
    }
  }, [student, specialties, isOpen]);

  if (!isOpen || !student) return null;

  const availableSpecialties =
    specialties.length > 0 ? specialties.map((s) => s.name) : SPECIALTIES_LIST;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanId = studentId.trim();

    if (!cleanName) {
      setError('Zəhmət olmasa tələbənin ad və soyadını daxil edin.');
      return;
    }

    if (!cleanId) {
      setError('Zəhmət olmasa Tələbə ID-ni daxil edin.');
      return;
    }

    // Check if new studentId is duplicated by ANOTHER student
    const duplicate = existingStudents.find(
      (s) =>
        s.id !== student.id &&
        ((s.studentId && s.studentId.trim().toLowerCase() === cleanId.toLowerCase()) ||
          (s.finCode && s.finCode.trim().toLowerCase() === cleanId.toLowerCase()))
    );

    if (duplicate) {
      setError(`Bu Tələbə ID (${cleanId}) artıq başqa bir tələbəyə (${duplicate.name}) aiddir.`);
      return;
    }

    const resolvedSpecialty =
      specialty === '__custom__' || !specialty
        ? customSpecialty.trim() || student.specialty || 'İnformasiya Texnologiyaları'
        : specialty;

    const updatedStudent: Student = {
      ...student,
      name: cleanName,
      studentId: cleanId,
      finCode: cleanId,
      group: group || student.group,
      specialty: resolvedSpecialty,
      status,
      // Əlaqə nömrəsi, gmail və şifrə tələbənin portaldakı öz qeydiyyatı ilə idarə olunur
      phone: student.phone || '',
      email: student.email || '',
      passwordHash: student.passwordHash || '123456',
    };

    onSave(updatedStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#f8f9ff] border-b border-[#e2e8f0] flex items-center justify-between sticky top-0 bg-[#f8f9ff] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6d28d9] text-white flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#121c2a]">
                Tələbə Məlumatlarını Redaktə Et
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                ID: {student.studentId || student.finCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Ad, Soyad */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Ad, Soyad <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Məs: Əli Əliyev"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>
          </div>

          {/* Tələbə ID */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Tələbə ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>
          </div>

          {/* Qrup və Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Kurs <span className="text-rose-500">*</span>
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              >
                {GROUPS_LIST.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              >
                <option value="active">Aktiv</option>
                <option value="suspended">Dayandırılıb / Akademik məzuniyyət</option>
                <option value="graduated">Məzun</option>
              </select>
            </div>
          </div>

          {/* İxtisas */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1 flex items-center justify-between">
              <span>İxtisas</span>
            </label>
            {availableSpecialties.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                >
                  {availableSpecialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                  <option value="__custom__">+ Digər ixtisas daxil et</option>
                </select>
                {specialty === '__custom__' && (
                  <input
                    type="text"
                    placeholder="İxtisas adını qeyd edin..."
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5300b7]"
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder="İxtisas adı"
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#6d28d9] hover:bg-[#581c87] text-white text-sm font-semibold shadow-[0_2px_8px_rgba(109,40,217,0.25)] transition-all cursor-pointer flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Dəyişiklikləri Yadda Saxla</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
