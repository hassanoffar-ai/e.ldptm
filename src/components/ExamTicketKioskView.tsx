import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  BadgeAlert,
  ArrowLeft,
  Printer,
  Calendar,
  Clock,
  DoorOpen,
  Monitor,
  User,
  CheckCircle,
  Sparkles,
  QrCode,
  Search,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Student, ExamSession } from '../types';

interface ExamTicketKioskViewProps {
  students: Student[];
  sessions: ExamSession[];
  initialStudentId?: string;
  onClearInitialStudentId?: () => void;
}

export const ExamTicketKioskView: React.FC<ExamTicketKioskViewProps> = ({
  students,
  sessions,
  initialStudentId,
  onClearInitialStudentId,
}) => {
  const [studentIdInput, setStudentIdInput] = useState(initialStudentId || '');
  const [phase, setPhase] = useState<'input' | 'ticket'>(
    initialStudentId ? 'ticket' : 'input'
  );
  const [ticketData, setTicketData] = useState<{
    studentName: string;
    studentId: string;
    specialty: string;
    group: string;
    subject: string;
    date: string;
    time: string;
    room: string;
    computerNo: string;
    ticketNo: string;
    academicYear: string;
    semester: string;
    docNumber: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync if initial student ID changes from outside
  useEffect(() => {
    if (initialStudentId) {
      setStudentIdInput(initialStudentId);
      generateTicket(initialStudentId);
    }
  }, [initialStudentId]);

  const generateTicket = (idToSearch: string) => {
    const trimmedId = idToSearch.trim();
    if (!trimmedId) {
      setErrorMessage('Zəhmət olmasa tələbə ID-sini daxil edin.');
      return;
    }

    // Search across sessions or student registry
    let foundItem: any = null;
    let foundSession: any = null;

    for (const session of sessions) {
      const match = session.items.find(
        (i) => i.studentId.toLowerCase() === trimmedId.toLowerCase()
      );
      if (match) {
        foundItem = match;
        foundSession = session;
        break;
      }
    }

    const foundStudent = students.find(
      (s) => s.studentId.toLowerCase() === trimmedId.toLowerCase()
    );

    if (!foundItem && !foundStudent) {
      setErrorMessage(
        `"${trimmedId}" nömrəli tələbə ID-si üzrə sistemdə tələbə və ya aktiv imtahan tapılmadı. Zəhmət olmasa ID-ni dəqiqləşdirin və ya administratora müraciət edin.`
      );
      return;
    }

    const studentName =
      foundItem?.studentName || foundStudent?.name || 'Tələbə';
    const group = foundItem?.group || foundStudent?.group || '-';
    const specialty =
      foundStudent?.specialty ||
      foundSession?.specialty ||
      '-';
    const subject =
      foundSession?.subject || 'Təyin olunmuş imtahan';
    const date = foundSession?.date || new Date().toISOString().split('T')[0];
    const time = foundSession?.time || foundItem?.time || '10:00';
    const room = foundItem?.room || foundSession?.room || 'Təyin olunmayıb';
    const computerNo = foundItem?.computerNo || 'PC-01';
    const ticketNo = foundItem?.ticketNo
      ? (foundItem.ticketNo.startsWith('#') ? foundItem.ticketNo : `#EX-${foundItem.ticketNo}`)
      : `#EX-${Math.floor(Math.random() * 89999 + 10000)}`;

    setTicketData({
      studentName,
      studentId: trimmedId,
      specialty,
      group,
      subject,
      date,
      time,
      room,
      computerNo,
      ticketNo,
      academicYear: foundSession?.academicYear || '2024/2025 Tədris İli',
      semester: foundSession?.semester || 'Semestr İmtahanı',
      docNumber: `EX-${Math.floor(Math.random() * 89999 + 10000)}`,
    });
    setErrorMessage(null);
    setPhase('ticket');

    setErrorMessage(null);
    setPhase('ticket');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateTicket(studentIdInput);
  };

  const handleQuickSelect = (id: string) => {
    setStudentIdInput(id);
    generateTicket(id);
  };

  const handleBackToSearch = () => {
    setPhase('input');
    setStudentIdInput('');
    setErrorMessage(null);
    if (onClearInitialStudentId) {
      onClearInitialStudentId();
    }
  };

  const handlePrintTicket = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 400);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center relative overflow-hidden p-4 md:p-8 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#f8f9ff]' : ''
      }`}
    >
      {/* Ambient Blurred Circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-[#6d28d9]/10 blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#d9e3f6]/40 blur-[120px]" />
      </div>

      {/* Top right Fullscreen Mode Toggle */}
      <div className="absolute top-4 right-4 no-print flex items-center gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white/80 backdrop-blur-xs border border-[#ccc3d7] rounded-full text-[#4a4455] hover:text-[#5300b7] transition-all shadow-xs"
          title={isFullscreen ? 'Tam ekrandan çıx' : 'Kiosk tam ekran rejimi'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PHASE 1: ID INPUT SCREEN */}
      {/* ========================================================================= */}
      {phase === 'input' && (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Main Logo & Title */}
          <div className="mb-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#6d28d9]/10 border border-[#6d28d9]/20 flex items-center justify-center mx-auto mb-3 text-[#5300b7] shadow-inner">
              <FileCheck className="w-9 h-9" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#121c2a] tracking-tight mb-2">
              E-LDPTM
            </h1>
            <p className="text-lg md:text-xl font-semibold text-[#4a4455]">
              İmtahan Zalı Paneli
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] border border-[#ccc3d7] w-full">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 text-left">
                <label
                  htmlFor="studentIdInput"
                  className="text-sm font-semibold text-[#4a4455]"
                >
                  Tələbə ID-sini daxil edin
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b7486]">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="studentIdInput"
                    type="text"
                    autoFocus
                    autoComplete="off"
                    value={studentIdInput}
                    onChange={(e) => {
                      setStudentIdInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Məs: ST-2023-4012"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#f8f9ff] border border-[#ccc3d7] rounded-xl focus:ring-2 focus:ring-[#5300b7] focus:border-[#5300b7] text-base md:text-lg font-medium text-[#121c2a] transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                id="kiosk-print-ticket-btn"
                type="submit"
                className="w-full py-4 bg-[#6d28d9] hover:bg-[#581c87] text-white font-semibold text-base md:text-lg rounded-xl shadow-[0_4px_12px_rgba(109,40,217,0.25)] transition-all flex items-center justify-center gap-2.5 active:scale-[0.99]"
              >
                <Printer className="w-5 h-5" />
                <span>İmtahan Biletini Çap Et</span>
              </button>
            </form>

            {/* Real registered students quick selection if any exist */}
            {students.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Qeydiyyatdakı Tələbələr:
                </span>
                <div className="flex flex-wrap gap-2">
                  {students.slice(0, 6).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleQuickSelect(s.studentId)}
                      className="px-2.5 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-[#5300b7] rounded-lg border border-purple-200/60 font-mono transition-colors cursor-pointer"
                    >
                      {s.studentId} <span className="text-slate-500 font-sans">({s.name})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-sm text-[#7b7486] text-center">
            Problem yaranarsa nəzarətçiyə müraciət edin.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: TICKET CARD SCREEN */}
      {/* ========================================================================= */}
      {phase === 'ticket' && ticketData && (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-in fade-in duration-300">
          {/* Back Button */}
          <button
            id="ticket-back-btn"
            onClick={handleBackToSearch}
            className="self-start mb-4 flex items-center gap-1.5 text-sm font-semibold text-[#4a4455] hover:text-[#5300b7] transition-colors no-print px-2 py-1 rounded-lg hover:bg-purple-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Yeni Axtarış</span>
          </button>

          {/* Ticket Card Component */}
          <div className="bg-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] border border-[#ccc3d7] w-full overflow-hidden flex flex-col md:flex-row relative print-container">
            {/* Top decorative stripe for mobile, Left stripe for desktop */}
            <div className="h-2 w-full md:w-2.5 md:h-auto bg-[#5300b7] md:absolute md:top-0 md:left-0" />

            {/* Main Info Left Section */}
            <div className="flex-1 p-6 md:p-8 md:pl-10 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-[#e2e8f0] pb-4 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a] leading-tight">
                      İmtahan Bileti
                    </h2>
                    <p className="text-sm text-[#64748b] mt-0.5">
                      {ticketData.academicYear} - {ticketData.semester}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-[#eff4ff] text-[#5300b7] font-semibold text-xs rounded-full mb-1 border border-[#d9e3f6]">
                      Rəsmi Sənəd
                    </span>
                    <p className="text-xs text-[#7b7486] font-mono">
                      Bilet No: {ticketData.ticketNo}
                    </p>
                  </div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Student Highlight */}
                  <div className="col-span-1 md:col-span-2 flex items-center gap-4 p-4 bg-[#f8f9ff] rounded-xl border border-[#d9e3f6]">
                    <div className="w-14 h-14 rounded-full bg-[#eff4ff] border border-[#ccc3d7] flex items-center justify-center shrink-0 text-[#5300b7]">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#121c2a]">
                        {ticketData.studentName}
                      </h3>
                      <p className="text-sm font-semibold text-[#5300b7] font-mono">
                        ID: {ticketData.studentId}
                      </p>
                    </div>
                  </div>

                  {/* Specialty */}
                  <div className="flex flex-col gap-1 p-3.5 bg-white rounded-xl border border-[#e2e8f0]">
                    <span className="text-[11px] font-semibold text-[#7b7486] uppercase tracking-wider">
                      İxtisas
                    </span>
                    <span className="text-sm font-semibold text-[#121c2a]">
                      {ticketData.specialty}
                    </span>
                  </div>

                  {/* Group */}
                  <div className="flex flex-col gap-1 p-3.5 bg-white rounded-xl border border-[#e2e8f0]">
                    <span className="text-[11px] font-semibold text-[#7b7486] uppercase tracking-wider">
                      Qrup
                    </span>
                    <span className="text-sm font-semibold text-[#121c2a]">
                      {ticketData.group}
                    </span>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1 p-3.5 bg-white rounded-xl border border-[#e2e8f0] col-span-1 md:col-span-2">
                    <span className="text-[11px] font-semibold text-[#7b7486] uppercase tracking-wider">
                      Fənn / Modul
                    </span>
                    <span className="text-base font-bold text-[#121c2a]">
                      {ticketData.subject}
                    </span>
                  </div>

                  {/* 4 Logistics Boxes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 col-span-1 md:col-span-2 gap-2.5 pt-1">
                    <div className="flex flex-col gap-1 p-3 bg-[#f8f9ff] rounded-xl border border-[#d9e3f6]">
                      <div className="flex items-center gap-1 text-[#7b7486]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold uppercase">
                          Tarix
                        </span>
                      </div>
                      <span className="text-xs md:text-sm font-semibold text-[#121c2a]">
                        {ticketData.date}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 p-3 bg-[#f8f9ff] rounded-xl border border-[#d9e3f6]">
                      <div className="flex items-center gap-1 text-[#7b7486]">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold uppercase">
                          Saat
                        </span>
                      </div>
                      <span className="text-xs md:text-sm font-semibold text-[#121c2a]">
                        {ticketData.time}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-1 text-[#5300b7]">
                        <DoorOpen className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold uppercase">
                          Otaq
                        </span>
                      </div>
                      <span className="text-base md:text-lg font-extrabold text-[#5300b7]">
                        {ticketData.room}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-1 text-[#5300b7]">
                        <Monitor className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold uppercase">
                          Kompüter
                        </span>
                      </div>
                      <span className="text-base md:text-lg font-extrabold text-[#5300b7]">
                        {ticketData.computerNo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom security note */}
              <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex justify-between items-center text-[11px] text-[#7b7486]">
                <span>E-LDPTM İmtahan Mərkəzi Tərəfindən Təsdiqlənmişdir</span>
                <span className="font-mono">Tarix: {new Date().toLocaleDateString('az-AZ')}</span>
              </div>
            </div>

            {/* Right Column: QR & Print Action */}
            <div className="w-full md:w-64 bg-[#f8f9ff] border-t md:border-t-0 md:border-l border-[#e2e8f0] p-6 flex flex-col items-center justify-between">
              <div className="w-full flex flex-col items-center gap-3">
                {/* QR Code Block */}
                <div className="w-40 h-40 bg-white border-2 border-[#ccc3d7] rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs">
                  <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                    <QrCode className="w-full h-full text-white" />
                  </div>
                </div>
                <p className="text-xs text-center font-medium text-[#4a4455]">
                  Nəzarətçi yoxlanışı üçün
                </p>
                <span className="text-[10px] font-mono text-[#7b7486]">
                  {ticketData.docNumber}
                </span>
              </div>

              <div className="w-full mt-6 no-print">
                <button
                  id="final-print-ticket-btn"
                  onClick={handlePrintTicket}
                  disabled={isPrinting}
                  className="w-full py-3.5 bg-[#5300b7] hover:bg-[#430094] text-white font-semibold text-base rounded-xl shadow-[0_4px_10px_rgba(83,0,183,0.25)] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Printer className="w-5 h-5" />
                  <span>{isPrinting ? 'Çap edilir...' : 'Çap Et'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
