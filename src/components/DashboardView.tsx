import React from 'react';
import {
  FileText,
  Award,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ActiveTab, ExamSession, GradeBookCourse, Student } from '../types';

interface DashboardViewProps {
  sessions: ExamSession[];
  courses: GradeBookCourse[];
  students: Student[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenTicketKioskForStudent: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  courses,
  students,
  setActiveTab,
  onOpenTicketKioskForStudent,
}) => {
  return (
    <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#5300b7] via-[#6d28d9] to-[#7331df] rounded-3xl p-6 md:p-8 text-white shadow-[0_10px_25px_-5px_rgba(83,0,183,0.3)] relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Mərkəzi İmtahan Sistemi — YTP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            İmtahan İdarəetmə Paneli
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm leading-relaxed max-w-xl">
            Lənkəran Dövlət Peşə Təhsil Mərkəzi Yüksək Texniki Peşə (YTP) ixtisasları üzrə imtahan sessiyalarının təşkili, bilet təyinatı və tələbə ballarının qeydiyyat sistemi.
          </p>
        </div>

        {/* Decorative Circle pattern */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main 3 Core Screens Jump Grid */}
      <div>
        <h2 className="text-lg font-bold text-[#121c2a] mb-4">
          Əsas İmtahan və Tədris Ekranları
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: İmtahan Protokolu */}
          <div
            onClick={() => setActiveTab('exams')}
            className="group bg-white p-6 rounded-2xl border border-[#ccc3d7] hover:border-[#6d28d9] shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#5300b7] flex items-center justify-center mb-4 group-hover:bg-[#6d28d9] group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#121c2a] mb-2">
                1. İmtahan Protokolu
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed mb-4">
                Qruplar üzrə rəsmi imtahan cədvəli, bilet təyinatları, PC nömrələri və çap/ixrac imkanı.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#5300b7] group-hover:translate-x-1 transition-transform">
              <span>Protokola Bax</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Qiymət Daxiletmə */}
          <div
            onClick={() => setActiveTab('grades')}
            className="group bg-white p-6 rounded-2xl border border-[#ccc3d7] hover:border-[#6d28d9] shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#5300b7] flex items-center justify-center mb-4 group-hover:bg-[#6d28d9] group-hover:text-white transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#121c2a] mb-2">
                2. Qiymət Daxiletmə
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed mb-4">
                Fənlər üzrə Seminar, Laboratoriya, Sərbəst İş və Kollokvium ballarının canlı hesablanması və dərc edilməsi.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#5300b7] group-hover:translate-x-1 transition-transform">
              <span>Qiymətləri Daxil Et</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exam Protocols List */}
      <div className="bg-white rounded-2xl border border-[#ccc3d7] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-[#121c2a]">
              Aktiv İmtahan Sessiyaları
            </h3>
            <p className="text-xs text-[#64748b]">
              Cari semestrdə keçirilən və təyin olunan imtahanlar
            </p>
          </div>
          <button
            onClick={() => setActiveTab('exams')}
            className="text-xs font-semibold text-[#5300b7] hover:underline cursor-pointer"
          >
            Hamısını göstər ({sessions.length})
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Hələ ki, heç bir aktiv imtahan sessiyası yoxdur. İmtahan protokolu bölməsindən yeni sessiya əlavə edə bilərsiniz.
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-[#5300b7] flex items-center justify-center font-bold text-xs">
                    {sess.group}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#121c2a]">
                      {sess.subject}
                    </h4>
                    <p className="text-xs text-[#64748b]">
                      {sess.date} • {sess.time} • Otaq: {sess.room} • Nəzarətçi:{' '}
                      {sess.supervisor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 bg-purple-50 text-[#5300b7] rounded-full font-medium">
                    {sess.items.length} Tələbə
                  </span>
                  <button
                    onClick={() => setActiveTab('exams')}
                    className="p-1.5 text-slate-400 hover:text-[#5300b7] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
