import React, { useState } from 'react';
import {
  Printer,
  Download,
  Plus,
  Shuffle,
  Check,
  Edit2,
  Calendar,
  User,
  Users as UsersIcon,
  BookOpen,
  CheckCircle,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { ExamSession, ExamProtocolItem, Student } from '../types';

interface ExamProtocolViewProps {
  sessions: ExamSession[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  onUpdateSession: (updated: ExamSession) => void;
  onOpenNewSessionModal: () => void;
  onDeleteSession: (id: string) => void;
  onOpenTicketKioskForStudent?: (studentId: string) => void;
  students?: Student[];
}

export const ExamProtocolView: React.FC<ExamProtocolViewProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  onUpdateSession,
  onOpenNewSessionModal,
  onDeleteSession,
  onOpenTicketKioskForStudent,
  students = [],
}) => {
  const currentSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editedMeta, setEditedMeta] = useState({
    subject: currentSession?.subject || '',
    group: currentSession?.group || '',
    date: currentSession?.date || '',
    supervisor: currentSession?.supervisor || '',
    room: currentSession?.room || '',
    time: currentSession?.time || '',
  });

  // Sync editedMeta when currentSession changes
  React.useEffect(() => {
    if (currentSession) {
      setEditedMeta({
        subject: currentSession.subject,
        group: currentSession.group,
        date: currentSession.date,
        supervisor: currentSession.supervisor,
        room: currentSession.room,
        time: currentSession.time,
      });
    }
  }, [currentSession?.id]);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Tələbə',
      'Tələbə ID',
      'Qrup',
      'Saat',
      'Otaq',
      'Kompüter №',
      'Bilet №',
      'Biletin vaxtı',
      'İmza Vəziyyəti',
    ];
    const rows = currentSession.items.map((item) => [
      item.studentName,
      item.studentId,
      item.group,
      item.time,
      item.room,
      item.computerNo,
      item.ticketNo,
      item.ticketTime,
      item.hasSigned ? 'İmzalanıb' : 'İmzalanmayıb',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Imtahan_Protokolu_${currentSession.group}_${currentSession.subject.replace(
        /\s+/g,
        '_'
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Protokol CSV formatında ixrac edildi.');
  };

  const handleToggleSignature = (itemId: string) => {
    const updatedItems = currentSession.items.map((item) =>
      item.id === itemId ? { ...item, hasSigned: !item.hasSigned } : item
    );
    onUpdateSession({ ...currentSession, items: updatedItems });
    showToast('İmza statusu yeniləndi.');
  };

  const handleRandomizeTickets = () => {
    const ticketNumbers = [
      'B-05',
      'B-12',
      'B-19',
      'B-28',
      'B-45',
      'B-03',
      'B-16',
      'B-22',
      'B-37',
      'B-41',
      'B-50',
    ].sort(() => Math.random() - 0.5);

    const updatedItems = currentSession.items.map((item, idx) => ({
      ...item,
      ticketNo: ticketNumbers[idx % ticketNumbers.length],
      ticketTime: `10:${(5 + idx * 2).toString().padStart(2, '0')}`,
    }));

    onUpdateSession({ ...currentSession, items: updatedItems });
    showToast('Bilet nömrələri təsadüfi qaydada yenidən paylandı.');
  };

  const handleSaveMeta = () => {
    onUpdateSession({
      ...currentSession,
      subject: editedMeta.subject,
      group: editedMeta.group,
      date: editedMeta.date,
      supervisor: editedMeta.supervisor,
      room: editedMeta.room,
      time: editedMeta.time,
    });
    setIsEditingMeta(false);
    showToast('Protokol məlumatları yeniləndi.');
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentId) return;

    const newItem: ExamProtocolItem = {
      id: `p-${Date.now()}`,
      studentId: newStudentId,
      studentName: newStudentName,
      group: currentSession.group,
      time: currentSession.time || '10:00',
      room: currentSession.room || 'Lab-3',
      computerNo: `PC-${(currentSession.items.length + 1)
        .toString()
        .padStart(2, '0')}`,
      ticketNo: `B-${Math.floor(Math.random() * 50 + 1)
        .toString()
        .padStart(2, '0')}`,
      ticketTime: `10:${(10 + currentSession.items.length * 2)
        .toString()
        .padStart(2, '0')}`,
      hasSigned: false,
    };

    onUpdateSession({
      ...currentSession,
      items: [...currentSession.items, newItem],
    });

    setNewStudentName('');
    setNewStudentId('');
    setShowAddStudent(false);
    showToast('Yeni tələbə protokola əlavə edildi.');
  };

  const handleDeleteStudentItem = (itemId: string) => {
    if (!currentSession) return;
    const updatedItems = currentSession.items.filter((i) => i.id !== itemId);
    onUpdateSession({ ...currentSession, items: updatedItems });
    showToast('Tələbə protokoldan çıxarıldı.');
  };

  if (!currentSession) {
    return (
      <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#ccc3d7] text-center max-w-lg shadow-sm">
          <div className="w-16 h-16 bg-purple-100 text-[#5300b7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#121c2a] mb-2">
            Heç bir imtahan protokolu yoxdur
          </h3>
          <p className="text-sm text-[#64748b] leading-relaxed mb-6">
            Sistemdə aktiv imtahan protokolu mövcud deyil. Real imtahan sessiyası, bilet bölgüsü və rəsmi protokol üçün yeni imtahan əlavə edin.
          </p>
          <button
            onClick={onOpenNewSessionModal}
            className="px-6 py-3 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl font-semibold text-sm shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İmtahan Protokolu Yarat</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#121c2a] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-bounce duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
              İmtahan Protokolu
            </h2>
            {/* Session Selector */}
            {sessions.length > 0 && (
              <select
                value={selectedSessionId}
                onChange={(e) => onSelectSession(e.target.value)}
                className="text-xs bg-white border border-[#ccc3d7] rounded-lg px-2.5 py-1.5 text-purple-900 font-medium outline-none focus:ring-2 focus:ring-[#6d28d9] no-print"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.group} - {s.subject}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onOpenNewSessionModal}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#5300b7] hover:bg-[#430094] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer no-print"
              title="Yeni Protokol Yarat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Protokol</span>
            </button>

            {currentSession && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `"${currentSession.group} - ${currentSession.subject}" protokolunu silmək istədiyinizdən əminsiniz?`
                    )
                  ) {
                    onDeleteSession(currentSession.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer no-print"
                title="Bu Protokolu Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm md:text-base text-[#4a4455] mt-1">
            {currentSession.academicYear} Tədris ili - {currentSession.semester}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto no-print">
          <button
            id="protocol-randomize-btn"
            onClick={handleRandomizeTickets}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-white border border-[#ccc3d7] text-[#121c2a] hover:bg-[#eff4ff] transition-colors text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            title="Bilet nömrələrini təsadüfi payla"
          >
            <Shuffle className="w-4 h-4 text-[#5300b7]" />
            <span className="hidden sm:inline">Biletləri Payla</span>
          </button>

          <button
            id="protocol-print-btn"
            onClick={handlePrint}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-[#ccc3d7] text-[#121c2a] hover:bg-[#eff4ff] transition-colors text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Çap et</span>
          </button>

          <button
            id="protocol-export-btn"
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5300b7] hover:bg-[#430094] text-white transition-all text-sm font-medium shadow-[0_4px_6px_rgba(109,40,217,0.15)] active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>İxrac et</span>
          </button>
        </div>
      </div>

      {/* Filters/Meta Card */}
      <div className="bg-white border border-[#ccc3d7] rounded-xl p-4 md:p-5 mb-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative">
        {!isEditingMeta ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#5300b7]" />
                Fənn / Modul
              </label>
              <div className="text-base font-semibold text-[#121c2a]">
                {currentSession.subject}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1 flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5 text-[#5300b7]" />
                Qrup
              </label>
              <div className="text-base font-semibold text-[#121c2a]">
                {currentSession.group}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5300b7]" />
                Tarix
              </label>
              <div className="text-base font-semibold text-[#121c2a]">
                {currentSession.date}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#5300b7]" />
                Nəzarətçi
              </label>
              <div className="text-base font-semibold text-[#121c2a]">
                {currentSession.supervisor}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1">
                Fənn / Modul
              </label>
              <input
                type="text"
                value={editedMeta.subject}
                onChange={(e) =>
                  setEditedMeta({ ...editedMeta, subject: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-[#ccc3d7] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1">
                Qrup
              </label>
              <input
                type="text"
                value={editedMeta.group}
                onChange={(e) =>
                  setEditedMeta({ ...editedMeta, group: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-[#ccc3d7] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1">
                Tarix
              </label>
              <input
                type="text"
                value={editedMeta.date}
                onChange={(e) =>
                  setEditedMeta({ ...editedMeta, date: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-[#ccc3d7] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1">
                Nəzarətçi
              </label>
              <input
                type="text"
                value={editedMeta.supervisor}
                onChange={(e) =>
                  setEditedMeta({ ...editedMeta, supervisor: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-[#ccc3d7] rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {/* Edit Meta Toggle Button */}
        <div className="absolute top-3 right-3 no-print">
          {!isEditingMeta ? (
            <button
              onClick={() => {
                setEditedMeta({
                  subject: currentSession.subject,
                  group: currentSession.group,
                  date: currentSession.date,
                  supervisor: currentSession.supervisor,
                  room: currentSession.room,
                  time: currentSession.time,
                });
                setIsEditingMeta(true);
              }}
              className="p-1.5 text-slate-400 hover:text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
              title="Məlumatları redaktə et"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveMeta}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
              >
                Yadda saxla
              </button>
              <button
                onClick={() => setIsEditingMeta(false)}
                className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300"
              >
                Ləğv et
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white border border-[#ccc3d7] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ccc3d7] bg-[#ffffff]">
                <th className="p-4 text-xs font-semibold text-[#4a4455] whitespace-nowrap">
                  Tələbə
                </th>
                <th className="p-4 text-xs font-semibold text-[#4a4455] whitespace-nowrap">
                  Tələbə ID
                </th>
                <th className="p-4 text-xs font-semibold text-[#4a4455] whitespace-nowrap">
                  Qrup
                </th>
                <th className="p-4 text-xs font-semibold text-[#4a4455] whitespace-nowrap">
                  Saat
                </th>
                <th className="p-4 text-xs font-semibold text-[#4a4455] whitespace-nowrap">
                  Otaq
                </th>
                <th className="p-4 text-xs font-semibold text-[#4a4455] whitespace-nowrap">
                  Kompüter №
                </th>
                <th className="p-4 text-xs font-semibold text-[#4a4455] whitespace-nowrap">
                  Bilet №
                </th>
                <th className="p-4 text-xs font-semibold text-[#4a4455] whitespace-nowrap">
                  Biletin vaxtı
                </th>
                <th className="p-4 text-xs font-semibold text-[#4a4455] whitespace-nowrap">
                  İmza
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#121c2a]">
              {currentSession.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-sm">
                    Bu protokolda hələ heç bir tələbə qeydiyyatda deyil. Aşağıdakı "+ Bu protokola tələbə əlavə et" düyməsi ilə tələbələri əlavə edə bilərsiniz.
                  </td>
                </tr>
              ) : (
                currentSession.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[#e2e8f0] hover:bg-[#f8f9ff] transition-colors group ${
                      index % 2 === 1 ? 'bg-[#eff4ff]/30' : 'bg-white'
                    }`}
                  >
                    <td className="p-4 whitespace-nowrap font-medium text-[#121c2a]">
                      <div className="flex items-center gap-2">
                        <span>{item.studentName}</span>
                        {onOpenTicketKioskForStudent && (
                          <button
                            onClick={() =>
                              onOpenTicketKioskForStudent(item.studentId)
                            }
                            className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-xs text-purple-600 hover:underline no-print px-1.5 py-0.5 bg-purple-50 rounded"
                            title="Biletini Aç"
                          >
                            Bilet
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStudentItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-xs text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-all no-print"
                          title="Protokoldan sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-[#4a4455] whitespace-nowrap font-mono text-xs">
                      {item.studentId}
                    </td>
                    <td className="p-4 whitespace-nowrap">{item.group}</td>
                    <td className="p-4 whitespace-nowrap">{item.time}</td>
                    <td className="p-4 whitespace-nowrap">{item.room}</td>
                    <td className="p-4 whitespace-nowrap font-medium">
                      {item.computerNo}
                    </td>
                    <td className="p-4 whitespace-nowrap font-bold text-[#5300b7]">
                      {item.ticketNo}
                    </td>
                    <td className="p-4 text-[#4a4455] whitespace-nowrap">
                      {item.ticketTime}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div
                        onClick={() => handleToggleSignature(item.id)}
                        className="cursor-pointer group flex items-center"
                        title="İmza statusunu dəyişmək üçün klikləyin"
                      >
                        {item.hasSigned ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-serif italic text-sm">
                            <Check className="w-4 h-4" />
                            <span className="underline decoration-wavy">
                              {item.studentName.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <div className="w-20 h-6 border-b-2 border-dashed border-[#ccc3d7] group-hover:border-purple-500 transition-colors flex items-center justify-center">
                            <span className="text-[10px] text-slate-300 group-hover:text-purple-400 transition-colors">
                              İmza
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Student row button */}
        <div className="p-3 bg-[#fafcff] border-t border-[#e2e8f0] flex justify-between items-center no-print">
          {!showAddStudent ? (
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-1.5 text-xs text-[#5300b7] hover:text-[#3e008b] font-medium px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Bu protokola tələbə əlavə et</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddStudent}
              className="flex flex-wrap items-center gap-2 w-full animate-in fade-in"
            >
              <input
                type="text"
                placeholder="Tələbə Adı Soyadı"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="px-3 py-1.5 border border-[#ccc3d7] rounded-lg text-xs flex-1 min-w-[160px]"
                required
              />
              <input
                type="text"
                placeholder="Tələbə ID (Məs: STD-10040)"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                className="px-3 py-1.5 border border-[#ccc3d7] rounded-lg text-xs w-36"
                required
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#6d28d9] text-white rounded-lg text-xs font-medium hover:bg-[#581c87]"
              >
                Əlavə et
              </button>
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300"
              >
                Ləğv
              </button>
            </form>
          )}
          <span className="text-xs text-slate-500">
            Cəmi tələbə: {currentSession.items.length}
          </span>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-end text-[#4a4455] text-sm gap-6 border-t border-slate-200/70 pt-6">
        <div>
          <span className="font-semibold">Səhifə 1 / 1</span>
          <br />
          <span className="text-xs text-[#64748b]">
            Yaradılma tarixi: 15 May 2024, 09:45
          </span>
        </div>

        <div className="flex flex-wrap gap-8 sm:gap-12 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col items-center">
            <div className="w-44 border-b-2 border-[#ccc3d7] mb-1.5 h-6 flex items-end justify-center">
              <span className="font-serif italic text-xs text-purple-900">
                Əliyev Həsən
              </span>
            </div>
            <span className="text-xs font-medium text-[#121c2a]">
              Nəzarətçi İmzası
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-44 border-b-2 border-[#ccc3d7] mb-1.5 h-6 flex items-end justify-center">
              <span className="font-serif italic text-xs text-slate-400">
                [İmza və Möhür]
              </span>
            </div>
            <span className="text-xs font-medium text-[#121c2a]">
              Tədris Hissə Müdiri
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
