import React from 'react';
import {
  FileText,
  Ticket,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  DoorClosed,
  ChevronRight
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
  const totalStudents = students.length;
  const activeExams = sessions.length;
  const totalGradesSubmitted = courses.reduce(
    (acc, c) => acc + c.grades.filter((g) => g.seminar !== null).length,
    0
  );

  return (
    <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#5300b7] via-[#6d28d9] to-[#7331df] rounded-3xl p-6 md:p-8 text-white shadow-[0_10px_25px_-5px_rgba(83,0,183,0.3)] relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>2023/2024 Tədris İli • Yaz Semestri İmtahan Sessiyası</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
            E-LDPTM Tədris və İmtahan Portalı
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6">
            Elektron İmtahan Protokolları, İmtahan Zalı Bilet Çapı Kiosku və
            Semestr Qiymət Daxiletmə sistemi mərkəzləşdirilmiş şəkildə fəaliyyət
            göstərir.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('exams')}
              className="px-4 py-2.5 bg-white text-[#5300b7] rounded-xl text-sm font-bold shadow-md hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>İmtahan Protokolu</span>
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Zal Bilet Kiosku</span>
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Qiymət Daxiletmə</span>
            </button>
          </div>
        </div>

        {/* Decorative Circle pattern */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748b] block mb-1">
              Qeydiyyatda Olan Tələbələr
            </span>
            <div className="text-2xl font-extrabold text-[#121c2a]">
              {totalStudents}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> 100% aktiv status
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5300b7] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748b] block mb-1">
              İmtahan Protokolları
            </span>
            <div className="text-2xl font-extrabold text-[#121c2a]">
              {activeExams}
            </div>
            <span className="text-[11px] text-[#6d28d9] font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Bütün laboratoriyalar aktiv
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5300b7] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748b] block mb-1">
              Qiymətləndirilmiş Tələbə
            </span>
            <div className="text-2xl font-extrabold text-[#121c2a]">
              {totalGradesSubmitted}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Aralıq ballar daxil edilib
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5300b7] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748b] block mb-1">
              İmtahan Zalları
            </span>
            <div className="text-2xl font-extrabold text-[#121c2a]">4 Lab</div>
            <span className="text-[11px] text-[#64748b] font-medium flex items-center gap-1 mt-1">
              <DoorClosed className="w-3 h-3" /> Lab-1, Lab-2, Lab-3, Lab-4
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5300b7] flex items-center justify-center">
            <DoorClosed className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main 3 Core Screens Jump Grid */}
      <div>
        <h2 className="text-lg font-bold text-[#121c2a] mb-4">
          Əsas İmtahan və Tədris Ekranları
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Card 2: İmtahan Zalı Ekranı (Kiosk) */}
          <div
            onClick={() => setActiveTab('tickets')}
            className="group bg-white p-6 rounded-2xl border border-[#ccc3d7] hover:border-[#6d28d9] shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#5300b7] flex items-center justify-center mb-4 group-hover:bg-[#6d28d9] group-hover:text-white transition-colors">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#121c2a] mb-2">
                2. İmtahan Zalı Paneli
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed mb-4">
                Tələbə ID-si ilə axtarış, rəsmi imtahan bileti kartı, QR kod, otaq/kompüter bölgüsü və operativ çap.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#5300b7] group-hover:translate-x-1 transition-transform">
              <span>Zal Kioskunu Aç</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Qiymət Daxiletmə */}
          <div
            onClick={() => setActiveTab('grades')}
            className="group bg-white p-6 rounded-2xl border border-[#ccc3d7] hover:border-[#6d28d9] shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#5300b7] flex items-center justify-center mb-4 group-hover:bg-[#6d28d9] group-hover:text-white transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#121c2a] mb-2">
                3. Qiymət Daxiletmə
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
