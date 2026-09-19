import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  GraduationCap,
  Users,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { SpecialtyItem, Student } from '../types';
import { GROUPS_LIST, SPECIALTIES_LIST } from '../data/mockData';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (newStudent: Student) => void;
  specialties?: SpecialtyItem[];
  existingStudents?: Student[];
  defaultGroup?: string;
  defaultSpecialty?: string;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
  specialties = [],
  existingStudents = [],
  defaultGroup,
  defaultSpecialty,
}) => {
  const effectiveSpecialties: Array<{ id: string; name: string; code: string }> =
    (specialties.length > 0
      ? specialties
      : SPECIALTIES_LIST.map((name, idx) => ({
          id: `spec-default-${idx}`,
          name,
          code: `YTP-${idx + 1}`,
        }))
    ).slice().sort((a, b) => a.name.localeCompare(b.name, 'az'));

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [group, setGroup] = useState(defaultGroup || GROUPS_LIST[0] || '1-ci kurs');
  const [specialty, setSpecialty] = useState(
    defaultSpecialty || effectiveSpecialties[0]?.name || ''
  );
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultGroup) setGroup(defaultGroup);
      if (defaultSpecialty) {
        setSpecialty(defaultSpecialty);
      } else if (!specialty && effectiveSpecialties.length > 0) {
        setSpecialty(effectiveSpecialties[0].name);
      }
    }
  }, [isOpen, defaultGroup, defaultSpecialty, effectiveSpecialties]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = studentId.trim();

    if (!name.trim()) {
      setError('Tələbənin ad, soyad və ata adını daxil edin.');
      return;
    }

    if (!cleanId) {
      setError('Tələbə üçün unikal Tələbə ID daxil edin və ya avtomatik təyin edin.');
      return;
    }

    // Check uniqueness by Student ID
    const duplicateStudent = existingStudents.find(
      (s) =>
        (s.studentId && s.studentId.trim().toLowerCase() === cleanId.toLowerCase()) ||
        (s.id && s.id.trim().toLowerCase() === cleanId.toLowerCase()) ||
        (s.finCode && s.finCode.trim().toLowerCase() === cleanId.toLowerCase())
    );
    if (duplicateStudent) {
      setError(`Bu Tələbə ID (${cleanId}) artıq başqa bir tələbəyə (${duplicateStudent.name}) aiddir.`);
      return;
    }

    const resolvedSpecialty =
      specialty === '__custom__' || !specialty
        ? customSpecialty.trim() || 'İnformasiya Texnologiyaları'
        : specialty;

    const student: Student = {
      id: `std-${Date.now()}`,
      studentId: cleanId,
      finCode: cleanId,
      name: name.trim(),
      group,
      specialty: resolvedSpecialty,
      email: '',
      phone: '',
      passwordHash: '123456',
      status: 'active',
      isRegistered: false,
    };

    onAddStudent(student);
    setName('');
    setStudentId('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#f8f9ff] border-b border-[#e2e8f0] flex items-center justify-between sticky top-0 bg-[#f8f9ff] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6d28d9] text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#121c2a]">
                {defaultSpecialty ? `${defaultSpecialty} — Tələbə Qeydiyyatı` : 'Yeni Tələbə Qeydiyyatı'}
              </h3>
              <p className="text-xs text-[#64748b]">
                {defaultSpecialty
                  ? `Bu ixtisasa tələbənin ad, soyadı və Tələbə ID-sini təyin edin`
                  : 'Tələbənin ad, soyadını və təyin olunmuş Tələbə ID-sini daxil edin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ad, Soyad Input */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Ad, Soyad, Ata adı
            </label>
            <input
              type="text"
              required
              placeholder="Məs: Əliyev Tural İlqar"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
            />
          </div>

          {/* Tələbə ID Input */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Tələbə ID
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder=" "
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>
          </div>

          {/* Qrup və İxtisas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Kurs / Qrup
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
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
                İxtisas / Peşə İstiqaməti
              </label>
              {effectiveSpecialties.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7] cursor-pointer"
                  >
                    {effectiveSpecialties.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                    <option value="__custom__">+ Digər İxtisas Daxil Et</option>
                  </select>
                  {specialty === '__custom__' && (
                    <input
                      type="text"
                      placeholder="İxtisasın adını yazın..."
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5300b7]"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="məs: Kompüter sistemlərində proqramlaşdırma"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                />
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Footer */}
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
              className="px-5 py-2.5 rounded-xl bg-[#6d28d9] hover:bg-[#581c87] text-white text-sm font-semibold shadow-[0_2px_8px_rgba(109,40,217,0.25)] transition-all cursor-pointer"
            >
              Təsdiqlə və Əlavə Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
