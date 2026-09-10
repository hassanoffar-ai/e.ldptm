import React, { useState, useEffect } from 'react';
import { X, Award, BookOpen, Grid, Users } from 'lucide-react';
import { GradeBookCourse, SpecialtyItem, Student, StudentGrade } from '../types';
import { GROUPS_LIST, SUBJECTS_LIST } from '../data/mockData';

interface NewGradeCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (newCourse: GradeBookCourse) => void;
  students: Student[];
  specialties?: SpecialtyItem[];
}

export const NewGradeCourseModal: React.FC<NewGradeCourseModalProps> = ({
  isOpen,
  onClose,
  onAddCourse,
  students,
  specialties = [],
}) => {
  const [group, setGroup] = useState(GROUPS_LIST[0] || '');
  const [subject, setSubject] = useState(SUBJECTS_LIST[0] || '');
  const [specialty, setSpecialty] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [semester, setSemester] = useState('Yaz Semestri (2024/2025)');
  const [maxScore] = useState(50);

  useEffect(() => {
    if (specialties.length > 0 && !specialty) {
      setSpecialty(specialties[0].name);
    }
  }, [specialties, specialty]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !subject) return;

    // Filter students from this group to initialize grade entries
    const groupStudents = students.filter((s) => s.group === group);

    const initialGrades: StudentGrade[] = groupStudents.map((s) => {
      const initials = s.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('');
      return {
        studentId: s.id,
        studentName: s.name,
        idNumber: s.studentId,
        avatarInitial: initials || 'TL',
        seminar: null,
        laboratory: null,
        independentWork: null,
        colloquium: null,
      };
    });

    const resolvedSpecialty =
      specialty === '__custom__' || !specialty
        ? customSpecialty.trim() || 'İnformasiya Texnologiyaları'
        : specialty;

    const newCourse: GradeBookCourse = {
      id: `course-${Date.now()}`,
      group,
      specialty: resolvedSpecialty,
      subject: subject.trim(),
      subjectCode: subjectCode.trim() || `${group}-CS`,
      semester,
      maxScore,
      lastSaved: new Date().toLocaleDateString('az-AZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isPublished: false,
      grades: initialGrades,
    };

    onAddCourse(newCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 sm:px-6 py-4 bg-[#f8f9ff] border-b border-[#e2e8f0] flex items-center justify-between sticky top-0 bg-[#f8f9ff] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5300b7] text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#121c2a]">
                Yeni Qiymətləndirmə Jurnalı Aç
              </h3>
              <p className="text-xs text-[#64748b]">
                Qrup və fənn üzrə cari semestr qiymət cədvəli təyin edin
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              Fənn Adı *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Məs: Veb Proqramlaşdırma əsasları"
              className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                İxtisas
              </label>
              {specialties.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
                  >
                    {specialties.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                    <option value="__custom__">+ Digər / Fərdi İxtisas</option>
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

            <div>
              <label className="block text-xs font-semibold text-[#4a4455] mb-1">
                Fənn Kodu
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="Məs: CS-301"
                className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4455] mb-1">
              Semestr / Tədris İli
            </label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="Yaz Semestri (2024/2025)"
              className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5300b7]"
            />
          </div>

          <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900">
            <span>
              ℹ️ "{group}" qrupunda qeydiyyatda olan tələbələr ({students.filter((s) => s.group === group).length} nəfər) avtomatik bu jurnal cədvəlinə daxil ediləcək.
            </span>
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
              Jurnalı Yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
