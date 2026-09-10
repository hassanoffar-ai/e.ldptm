import React, { useState } from 'react';
import { X, Calendar, Clock, DoorClosed, UserCheck, BookOpen, Grid, GraduationCap } from 'lucide-react';
import { ExamSession, ExamProtocolItem, Student } from '../types';
import { GROUPS_LIST, ROOMS_LIST, SPECIALTIES_LIST, SUBJECTS_LIST } from '../data/mockData';

interface NewExamSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession: (newSession: ExamSession) => void;
  students: Student[];
}

export const NewExamSessionModal: React.FC<NewExamSessionModalProps> = ({
  isOpen,
  onClose,
  onAddSession,
  students,
}) => {
  const [subject, setSubject] = useState(SUBJECTS_LIST[0] || '');
  const [subjectCode, setSubjectCode] = useState('');
  const [group, setGroup] = useState(GROUPS_LIST[0] || '');
  const [specialty, setSpecialty] = useState(SPECIALTIES_LIST[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 - 12:00');
  const [room, setRoom] = useState(ROOMS_LIST[0] || 'Lab-1');
  const [supervisor, setSupervisor] = useState('');
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [semester, setSemester] = useState('Yaz Semestri');
  const [autoIncludeGroupStudents, setAutoIncludeGroupStudents] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !group) return;

    // Filter students belonging to this group if checkbox is checked
    const groupStudents = autoIncludeGroupStudents
      ? students.filter((s) => s.group === group)
      : [];

    const items: ExamProtocolItem[] = groupStudents.map((s, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      studentId: s.studentId,
      studentName: s.name,
      group: s.group,
      time: time.split('-')[0].trim() || '10:00',
      room: room,
      computerNo: `PC-${(idx + 1).toString().padStart(2, '0')}`,
      ticketNo: `B-${(idx + 1).toString().padStart(2, '0')}`,
      ticketTime: '10:00',
      hasSigned: false,
    }));

    const newSession: ExamSession = {
      id: `exam-${Date.now()}`,
      subject: subject.trim(),
      subjectCode: subjectCode.trim() || `${group}-EX`,
      group,
      specialty,
      date,
      time,
      room,
      supervisor: supervisor.trim() || 'Nəzarətçi təyin edilməyib',
      academicYear,
      semester,
      status: 'upcoming',
      items,
    };

    onAddSession(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f8f9ff] border-b border-[#e2e8f0] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5300b7] text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#121c2a]">
                Yeni İmtahan Protokolu Yarat
              </h3>
              <p className="text-xs text-[#64748b]">
                Real imtahan cədvəli və sessiya məlumatlarını daxil edin
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Fənn Adı *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Məs: Proqramlaşdırma Əsasları"
                className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Fənn Kodu
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="Məs: CS-101"
                className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Qrup *
              </label>
              <input
                type="text"
                required
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Məs: İT-21"
                className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                İxtisas
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
                İmtahan Tarixi *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#7b7486]" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Saat Aralığı
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-[#7b7486]" />
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="10:00 - 12:00"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                İmtahan Zalı / Otaq
              </label>
              <div className="relative">
                <DoorClosed className="w-4 h-4 absolute left-3 top-3 text-[#7b7486]" />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Məs: Lab-1"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Nəzarətçi Müəllim
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-3 text-[#7b7486]" />
                <input
                  type="text"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  placeholder="Məs: Əliyev Həsən"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Tədris İli
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2024/2025"
                className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Semestr
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="Yaz Semestri"
                className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>
          </div>

          {/* Auto-include students checkbox */}
          <div className="p-3 bg-purple-50 border border-purple-200/60 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-purple-950">
              <input
                type="checkbox"
                checked={autoIncludeGroupStudents}
                onChange={(e) => setAutoIncludeGroupStudents(e.target.checked)}
                className="w-4 h-4 text-[#5300b7] rounded border-purple-300 focus:ring-[#5300b7]"
              />
              <span>
                "{group}" qrupunun sistemdəki bütün tələbələrini avtomatik bu protokola əlavə et
              </span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#4a4455] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#5300b7] hover:bg-[#430094] text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Protokolu Yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
