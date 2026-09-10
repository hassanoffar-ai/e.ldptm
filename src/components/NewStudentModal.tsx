import React, { useState } from 'react';
import { X, UserPlus, GraduationCap, Users, Mail, Phone, Hash } from 'lucide-react';
import { Student } from '../types';
import { GROUPS_LIST, SPECIALTIES_LIST } from '../data/mockData';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (newStudent: Student) => void;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [finCode, setFinCode] = useState('');
  const [group, setGroup] = useState(GROUPS_LIST[0]);
  const [specialty, setSpecialty] = useState(SPECIALTIES_LIST[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('123456');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentId) return;

    const student: Student = {
      id: `std-${Date.now()}`,
      studentId: studentId.trim(),
      finCode: finCode.trim().toUpperCase() || undefined,
      name: name.trim(),
      group,
      specialty,
      email: email || `${studentId.toLowerCase()}@eldptm.edu.az`,
      phone: phone || '+994 50 000 00 00',
      passwordHash: password.trim() || '123456',
      status: 'active',
    };

    onAddStudent(student);
    setName('');
    setStudentId('');
    setFinCode('');
    setEmail('');
    setPhone('');
    setPassword('123456');
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
              Ad, Soyad, Ata adı *
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Tələbə ID *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-3 text-[#7b7486]" />
                <input
                  type="text"
                  required
                  placeholder="Məs: YTP-2024-001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5300b7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                FİN Kod (Şəxsiyyət vəsiqəsi)
              </label>
              <input
                type="text"
                maxLength={7}
                placeholder="7 simvol (məs: 5ABC123)"
                value={finCode}
                onChange={(e) => setFinCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Qrup *
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
                İxtisas (YTP)
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              >
                {SPECIALTIES_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
