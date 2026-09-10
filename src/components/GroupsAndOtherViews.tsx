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
  Award
} from 'lucide-react';
import { ActiveTab, ExamSession, GradeBookCourse, Student } from '../types';
import { GROUPS_LIST, ROOMS_LIST, SPECIALTIES_LIST, SUBJECTS_LIST } from '../data/mockData';

interface GroupsAndOtherViewsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  students: Student[];
  sessions: ExamSession[];
  courses: GradeBookCourse[];
}

export const GroupsAndOtherViews: React.FC<GroupsAndOtherViewsProps> = ({
  activeTab,
  setActiveTab,
  students,
  sessions,
  courses,
}) => {
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
    return (
      <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
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
            Tədris mərkəzində akkreditə olunmuş ixtisaslar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPECIALTIES_LIST.map((spec, i) => (
            <div
              key={spec}
              className="bg-white p-5 rounded-2xl border border-[#ccc3d7] flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#5300b7] font-bold text-sm flex items-center justify-center">
                  0{i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#121c2a]">{spec}</h4>
                  <p className="text-xs text-[#64748b]">
                    Təhsil müddəti: 2-3 il • Əyani / Qiyabi
                  </p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-purple-50 text-[#5300b7] rounded-lg font-mono font-semibold">
                KOD: IT-0{i + 1}
              </span>
            </div>
          ))}
        </div>
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
