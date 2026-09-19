import React, { useState, useEffect } from 'react';
import { X, UserPlus, GraduationCap, Users, Mail, Phone, AlertCircle } from 'lucide-react';
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
    specialties.length > 0
      ? specialties
      : SPECIALTIES_LIST.map((name, idx) => ({
          id: `spec-default-${idx}`,
          name,
          code: `YTP-${idx + 1}`,
        }));

  const [name, setName] = useState('');
  const [finCode, setFinCode] = useState('');
  const [group, setGroup] = useState(defaultGroup || GROUPS_LIST[0] || '2-ci kurs');
  const [specialty, setSpecialty] = useState(defaultSpecialty || effectiveSpecialties[0]?.name || '');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('123456');
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

    const cleanFin = finCode.trim().toUpperCase();

    if (!name.trim()) {
      setError('Tələbənin ad, soyad və ata adını daxil edin.');
      return;
    }

    if (cleanFin.length !== 7) {
      setError('FİN kod mütləq şəxsiyyət vəsiqəsindən 7 simvol olmalıdır.');
      return;
    }

    // Check uniqueness by FIN code
    const duplicateFin = existingStudents.find(
      (s) =>
        (s.finCode && s.finCode.toUpperCase() === cleanFin) ||
        (s.studentId && s.studentId.toUpperCase() === cleanFin)
    );
    if (duplicateFin) {
      setError(`Bu FİN kod artıq başqa bir tələbəyə (${duplicateFin.name}) aiddir.`);
      return;
    }

    const resolvedSpecialty =
      specialty === '__custom__' || !specialty
        ? customSpecialty.trim() || 'İnformasiya Texnologiyaları'
        : specialty;

    const student: Student = {
      id: `std-${Date.now()}`,
      studentId: cleanFin,
      finCode: cleanFin,
      name: name.trim(),
      group,
      specialty: resolvedSpecialty,
      email: email || `${cleanFin.toLowerCase()}@eldptm.edu.az`,
      phone: phone || '+994 50 000 00 00',
      passwordHash: password.trim() || '123456',
      status: 'active',
      isRegistered: false,
    };

    onAddStudent(student);
    setName('');
    setFinCode('');
    setEmail('');
    setPhone('');
    setPassword('123456');
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
                Yeni Tələbə Qeydiyyatı
              </h3>
              <p className="text-xs text-[#64748b]">
                Sistemə yeni tələbə məlumatlarını əlavə edin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Ad, Soyad, Ata adı
            </label>
            <input
              type="text"
              required
              placeholder="Məs: Əliyev Tural İlqar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              FİN Kod (Şəxsiyyət vəsiqəsi)
            </label>
            <input
              type="text"
              required
              maxLength={7}
              placeholder="7 simvol (məs: 5ABC123)"
              value={finCode}
              onChange={(e) => {
                setFinCode(e.target.value.toUpperCase());
                setError(null);
              }}
              className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5300b7] uppercase"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Tələbə portala yalnız bu 7 simvollu FİN kod ilə qeydiyyatdan keçə biləcək
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Qrup
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
                İxtisas / Peşə İstiqaməti
              </label>
              {effectiveSpecialties.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                  >
                    {effectiveSpecialties.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                    <option value="__custom__">+ Digər / Fərdi İxtisas Daxil Et</option>
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
                  placeholder="məs: Kompüter sistemlərində proqram təminatı"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                E-poçt
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#7b7486]" />
                <input
                  type="email"
                  placeholder="telebe@eldptm.edu.az"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Əlaqə Nömrəsi
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-[#7b7486]" />
                <input
                  type="text"
                  placeholder="+994 50 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Portal üçün Şifrə
            </label>
            <input
              type="text"
              placeholder="Standart: 123456"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5300b7]"
            />
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
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#6d28d9] hover:bg-[#581c87] text-white text-sm font-semibold shadow-[0_2px_8px_rgba(109,40,217,0.25)] transition-all"
            >
              Təsdiqlə və Əlavə Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
