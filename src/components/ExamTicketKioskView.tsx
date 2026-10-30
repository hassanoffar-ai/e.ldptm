import React, { useState, useEffect } from 'react';
import {
  FileText,
  BadgeAlert,
  ArrowLeft,
  Printer,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Home,
  Lock,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { Student, ExamSession, GradeBookCourse } from '../types';

interface ExamTicketKioskViewProps {
  students: Student[];
  sessions: ExamSession[];
  courses?: GradeBookCourse[];
  initialStudentId?: string;
  onClearInitialStudentId?: () => void;
  onNavigateHome?: () => void;
}

interface TicketRecord {
  studentName: string;
  studentId: string;
  finCode: string;
  specialty: string;
  courseLevel: string; // e.g. "1-ci kurs", "2-ci kurs"
  group: string;
  subject: string;
  date: string;
  time: string;
  ticketNumber: number;
  questions: string[];
  academicYear: string;
  semester: string;
  isToday: boolean;
}

// Comprehensive Academic Question Bank tailored to E-LDPTM specialties and subjects
const QUESTION_BANK: Record<string, string[]> = {
  programming: [
    'Dəyişənlər, sabitlər və əsas verilənlər tiplərinin (int, float, string, boolean) xüsusiyyətlərini izah edin.',
    'Şərt operatorları (if, else if, switch/case) və onların proqramlaşdırmada tətbiq sahələrini müqayisə edin.',
    'Dövr operatorları (for, while, do-while) arasındakı fərqləri qeyd edin və sonsuz dövr anlayışını izah edin.',
    'Funksiyalar (metodlar), parametr və arqument anlayışları, qiymət qaytarma (return) mexanizmini şərh edin.',
    'Birölçülü və ikiölçülü massivlər (array) nədir? Massiv elementlərinin indekslənməsi və müraciət qaydalarını yazın.',
    'Obyekt Yönümlü Proqramlaşdırmanın (OOP) əsas prinsipləri: İnkapsulyasiya və Varislik (Inheritance) anlayışlarını izah edin.',
    'Polimorfizm və Abstraksiya anlayışlarının mahiyyətini və kod nümunələrindəki əhəmiyyətini göstərin.',
    'Xətaların idarə olunması: Try-Catch bloklarının iş prinsipi və xüsusi istisna (exception) halları.',
    'Alqoritmin əsas xassələri (müəyyənlik, kütləvilik, nəticəvilik, diskretlik) haqqında məlumat verin.',
    'Veb tərtibatında HTML struktur teqləri və CSS seçicilərinin (selectors) növləri və istifadəsi.',
    'DOM (Document Object Model) nədir və JavaScript ilə veb elementlərin dinamik idarə olunması prinsipləri.',
    'Verilənlər bazası (SQL) sorğuları: SELECT, INSERT, UPDATE, DELETE əmrlərinin sintaksisi və rolu.',
    'Əsas çeşidləmə (sorting) və axtarış (search) alqoritmlərinin iş prinsipləri.',
    'Git versiya nəzarət sistemi: commit, branch, merge və push əmrlərinin mahiyyəti.',
    'Müştəri-server (Client-Server) arxitekturası və HTTP/HTTPS sorğularının iş prinsipi.',
  ],
  cybersecurity: [
    'İnformasiya təhlükəsizliyinin CIA üçbucağı (Məxfilik, Bütövlük, Əlçatanlıq) prinsiplərini izah edin.',
    'OSI modelinin 7 səviyyəsi və hər bir səviyyənin yerinə yetirdiyi əsas funksiyalar.',
    'TCP və UDP nəqliyyat protokolları arasındakı əsas fərqlər və onların tətbiq sahələri.',
    'IP ünvanlaşdırma (IPv4 vs IPv6), şəbəkə maskası (subnet mask) və şlüz (gateway) anlayışları.',
    'Marşrutlaşdırma (Routing) və kommutasiya (Switching) arasındakı fərqləri izah edin.',
    'Zərərli proqram təminatının növləri: Virus, Qurd (Worm), Troyan və Fidyə (Ransomware) proqramları.',
    'Fişinq (Phishing), Brute-Force və Sosial Mühəndislik hücumlarının qarşısının alınması yolları.',
    'Simmetrik və Asimmetrik şifrələmə alqoritmləri (RSA, AES) arasındakı fərqləri izah edin.',
    'Şəbəkə təhlükəsizlik divarı (Firewall) və İntruziyanın Qarşısının Alınması Sistemi (IPS/IDS) haqqında məlumat verin.',
    'VPN (Virtual Private Network) texnologiyası və onun təhlükəsiz məlumat mübadiləsindəki rolu.',
    'DNS (Domain Name System) və DHCP xidmətlərinin şəbəkədəki iş prinsipləri.',
    'Kriptoqrafik açarlar, rəqəmsal imza və SSL/TLS sertifikatlarının iş mexanizmi.',
    'Şəbəkə topologiyaları (Ulduz, Şin, Həlqə, Ağvarı) və onların üstünlük/çatışmazlıqları.',
    'Linux əməliyyat sistemində icazələrin (chmod, chown) və proseslərin idarə olunması.',
    'Ehtiyat nüsxələmə (Backup) strategiyaları və insidentlərə reaksiya planı (Incident Response).',
  ],
  accounting: [
    'Mühasibat balansının mahiyyəti, aktiv və passiv maddələrin qarşılıqlı əlaqəsi.',
    'İkili yazılış üsulu və mühasibat hesablarında debet/kredit anlayışları.',
    'İlkin uçot sənədləri və onların qeydiyyatı, arxivləşdirilməsi qaydaları.',
    'Əsas vəsaitlər nədir və onların köhnəlməsi (amortizasiyası) hansı üsullarla hesablanır?',
    'Əmək haqqının hesablanması, gəlir vergisi və məcburi dövlət sosial sığorta ayırmaları.',
    'Gəlir və xərclərin tanınması prinsipləri və maliyyə nəticələrinin (mənfəət/zərər) formalaşması.',
    'Əlavə Dəyər Vergisi (ƏDV) anlayışı, dərəcələri və hesablanma qaydası.',
    'Kassa əməliyyatları, kassa mədaxil/məxaric orderlərinin tərtibatı və bank hesablaşmaları.',
    'Məhsulun maya dəyərinin hesablanması (kalkulyasiyası) və onun tərkib hissələri.',
    'Maliyyə hesabatlarının beynəlxalq standartları (MHBS) haqqında ümumi məlumat.',
    'Dövriyyə vəsaitləri və onların müəssisə fəaliyyətində dövranı.',
    'İnventarizasiya prosesinin mahiyyəti və aparılma mərhələləri.',
  ],
  hotel: [
    'Mehmanxana təsərrüfatında qonaqların qəbulu və yerləşdirilməsi (Front Office) xidmətinin təşkili.',
    'Rezervasiya (bronlaşdırma) sistemləri və otaq kateqoriyalarının təsnifatı.',
    'Mehmanxanada Təsərrüfat (Housekeeping) xidmətinin vəzifələri və gigiyena standartları.',
    'Restoran xidmətində menyu tərtibatının əsas prinsipləri və masa tərtibatı qaydaları.',
    'Qonaq məmnuniyyətinin təmin edilməsi, şikayətlərin idarə olunması və xidmət etikası.',
    'Mehmanxana və restoranlarda təhlükəsizlik və yanğından mühafizə qaydaları.',
    'Turizm məhsulu və onun təşviqi, turizm marşrutlarının planlaşdırılması.',
    'Qida təhlükəsizliyi və sanitar-gigiyenik normaların tətbiqi qaydaları.',
    'Mehmanxanada otaq qiymətlərinin müəyyənləşdirilməsi və mövsümi tarif siyasəti.',
    'Xarici qonaqlarla ünsiyyət etikası və beynəlxalq qonaqpərvərlik normaları.',
  ],
  general: [
    'Fənnin əsas anlayışları, predmeti və tədqiqat metodları haqqında ətraflı məlumat verin.',
    'Tədris olunmuş nəzəri mövzuların praktiki tətbiq sahələrini izah edin.',
    'Sahə üzrə meydana çıxan əsas problemləri və onların aradan qaldırılması yollarını şərh edin.',
    'Fənn çərçivəsində öyrənilmiş standartlar, qaydalar və normativ tələblər haqqında danışın.',
    'Mövzu üzrə konkret nümunə və ya praktiki tapşırığın həlli ardıcıllığını təsvir edin.',
    'Müasir texnologiyaların bu sahədəki rolu və inkişaf perspektivlərini qiymətləndirin.',
    'Fənn üzrə əsas terminologiyanı və onların mənasını şərh edin.',
  ],
};

function get5ExamQuestions(subjectName: string, specialtyName: string, ticketNum: number): string[] {
  const text = `${subjectName} ${specialtyName}`.toLowerCase();
  let pool = QUESTION_BANK.general;

  if (
    text.includes('kiber') ||
    text.includes('şəbəkə') ||
    text.includes('sebeke') ||
    text.includes('inzibat') ||
    text.includes('təhlükəsizlik')
  ) {
    pool = QUESTION_BANK.cybersecurity;
  } else if (
    text.includes('proqram') ||
    text.includes('veb') ||
    text.includes('dizayn') ||
    text.includes('alqoritm') ||
    text.includes('kod') ||
    text.includes('kompüter')
  ) {
    pool = QUESTION_BANK.programming;
  } else if (
    text.includes('mühasibat') ||
    text.includes('muhasibat') ||
    text.includes('uçot') ||
    text.includes('iqtisad') ||
    text.includes('maliyyə')
  ) {
    pool = QUESTION_BANK.accounting;
  } else if (
    text.includes('mehmanxana') ||
    text.includes('restoran') ||
    text.includes('turizm') ||
    text.includes('otel') ||
    text.includes('servis')
  ) {
    pool = QUESTION_BANK.hotel;
  }

  // Deterministically draw 5 questions based on ticket number so it is stable
  const questions: string[] = [];
  const poolLen = pool.length;
  const startIdx = ((ticketNum - 1) * 3) % poolLen;

  for (let i = 0; i < 5; i++) {
    const qIndex = (startIdx + i * 2) % poolLen;
    const candidate = pool[qIndex] || pool[i % poolLen];
    if (!questions.includes(candidate)) {
      questions.push(candidate);
    } else {
      // Find an unused question
      const unused = pool.find((q) => !questions.includes(q)) || candidate;
      questions.push(unused);
    }
  }

  return questions.slice(0, 5);
}

function extractCourseLevel(student: Student | undefined): string {
  if (!student) return '1-ci kurs';
  const grp = (student.group || '').trim();
  const sem = (student.semester || '').trim();

  if (grp.toLowerCase().includes('kurs')) {
    return grp;
  }
  if (sem.toLowerCase().includes('kurs')) {
    const parts = sem.split(' ');
    const kursPart = parts.slice(0, 2).join(' ');
    if (kursPart.toLowerCase().includes('kurs')) {
      return kursPart;
    }
  }
  return grp || '1-ci kurs';
}

export const ExamTicketKioskView: React.FC<ExamTicketKioskViewProps> = ({
  students = [],
  sessions = [],
  courses = [],
  initialStudentId,
  onClearInitialStudentId,
  onNavigateHome,
}) => {
  const [studentIdInput, setStudentIdInput] = useState(initialStudentId || '');
  const [phase, setPhase] = useState<'input' | 'ticket'>(
    initialStudentId ? 'ticket' : 'input'
  );

  const [availableTickets, setAvailableTickets] = useState<TicketRecord[]>([]);
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Sync if initial student ID changes from outside
  useEffect(() => {
    if (initialStudentId) {
      setStudentIdInput(initialStudentId);
      generateTicketsForId(initialStudentId);
    }
  }, [initialStudentId]);

  const generateTicketsForId = (idToSearch: string) => {
    const rawTerm = (idToSearch || '').trim();
    if (!rawTerm) {
      setErrorMessage('Zəhmət olmasa tələbə ID-sini daxil edin.');
      return;
    }

    const cleanTerm = rawTerm.toLowerCase().replace(/[\s\-_]+/g, '');

    // 1. Find matching student in student registry
    let matchedStudent = (students || []).find((s) => {
      if (!s) return false;
      const sId = (s.studentId || '').toLowerCase().replace(/[\s\-_]+/g, '');
      const sFin = (s.finCode || '').toLowerCase().replace(/[\s\-_]+/g, '');
      const sDbId = (s.id || '').toLowerCase().replace(/[\s\-_]+/g, '');
      const sName = (s.name || '').toLowerCase().trim();
      const rawLower = rawTerm.toLowerCase().trim();
      return (
        sId === cleanTerm ||
        sFin === cleanTerm ||
        sDbId === cleanTerm ||
        sName === rawLower ||
        (rawLower.length >= 3 && sName.includes(rawLower))
      );
    });

    // 1b. If not in students array, check inside sessions protocol items
    if (!matchedStudent) {
      for (const sess of (sessions || [])) {
        const foundItem = (sess.items || []).find((item) => {
          const itemStudentId = (item?.studentId || '').toLowerCase().replace(/[\s\-_]+/g, '');
          const itemStudentName = (item?.studentName || '').toLowerCase().trim();
          return itemStudentId === cleanTerm || (rawTerm.length >= 3 && itemStudentName.includes(rawTerm.toLowerCase()));
        });
        if (foundItem) {
          matchedStudent = {
            id: foundItem.studentId,
            studentId: foundItem.studentId,
            finCode: foundItem.studentId,
            name: foundItem.studentName,
            group: foundItem.group || sess.group || '1-ci kurs',
            specialty: sess.specialty || 'Yüksək Texniki Peşə',
            semester: sess.semester || '1-ci kurs 1-ci semestr',
            status: 'active',
          };
          break;
        }
      }
    }

    // 1c. If still not found, check inside gradebook course grades
    if (!matchedStudent) {
      for (const crs of (courses || [])) {
        const foundGrade = (crs.grades || []).find((g) => {
          const gId = (g.studentId || '').toLowerCase().replace(/[\s\-_]+/g, '');
          const gNum = (g.idNumber || '').toLowerCase().replace(/[\s\-_]+/g, '');
          const gName = (g.studentName || '').toLowerCase().trim();
          return gId === cleanTerm || gNum === cleanTerm || (rawTerm.length >= 3 && gName.includes(rawTerm.toLowerCase()));
        });
        if (foundGrade) {
          matchedStudent = {
            id: foundGrade.studentId || rawTerm,
            studentId: foundGrade.studentId || rawTerm,
            finCode: foundGrade.idNumber || foundGrade.studentId || rawTerm,
            name: foundGrade.studentName || 'Tələbə',
            group: crs.group || '1-ci kurs',
            specialty: crs.specialty || 'Yüksək Texniki Peşə',
            semester: crs.semester || '1-ci kurs 1-ci semestr',
            status: 'active',
          };
          break;
        }
      }
    }

    if (!matchedStudent) {
      setErrorMessage(
        `"${rawTerm}" nömrəli Tələbə ID sistemdə tapılmadı. Zəhmət olmasa tələbə ID-nizi (məsələn: 828391) dəqiqləşdirib yenidən daxil edin.`
      );
      return;
    }

    const studentIdentifier = matchedStudent.studentId || matchedStudent.finCode || rawTerm.toUpperCase();
    const studentGroup = (matchedStudent.group || '').trim().toLowerCase();
    const studentSpecialty = (matchedStudent.specialty || '').trim().toLowerCase();
    const studentSemester = (matchedStudent.semester || '').trim().toLowerCase();
    const todayStr = new Date().toISOString().split('T')[0];

    // Stable base ticket number derived from student ID
    const hashVal = studentIdentifier
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const baseTicketNum = (Math.abs(hashVal) % 25) + 1;

    const ticketsList: TicketRecord[] = [];
    const addedSubjectKeys = new Set<string>();

    // 2. Find sessions matching student
    const matchedSessions: Array<{ session: ExamSession; isToday: boolean }> = [];
    for (const sess of (sessions || [])) {
      if (!sess) continue;
      const sessDate = sess.date || '';
      const isToday = sessDate === todayStr;

      const hasItem = (sess.items || []).some((item) => {
        const itemStudentId = (item?.studentId || '').toLowerCase().replace(/[\s\-_]+/g, '');
        const itemStudentName = (item?.studentName || '').toLowerCase().trim();
        return (
          itemStudentId === cleanTerm ||
          (matchedStudent &&
            (itemStudentId === (matchedStudent.studentId || '').toLowerCase().replace(/[\s\-_]+/g, '') ||
              itemStudentName === (matchedStudent.name || '').toLowerCase().trim()))
        );
      });

      const sessGroup = (sess.group || '').trim().toLowerCase();
      const sessSpec = (sess.specialty || '').trim().toLowerCase();

      const groupMatch = studentGroup && sessGroup && (
        sessGroup === studentGroup ||
        sessGroup.includes(studentGroup) ||
        studentGroup.includes(sessGroup)
      );

      const specMatch = studentSpecialty && sessSpec && (
        sessSpec === studentSpecialty ||
        sessSpec.includes(studentSpecialty) ||
        studentSpecialty.includes(sessSpec)
      );

      if (hasItem || (groupMatch && specMatch) || (specMatch && !sessGroup) || (groupMatch && !sessSpec)) {
        matchedSessions.push({ session: sess, isToday });
      }
    }

    // Sort matching sessions: today first
    matchedSessions.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return 0;
    });

    matchedSessions.forEach(({ session, isToday }, idx) => {
      const subject = session.subject || 'İxtisas İmtahanı';
      const key = `${subject.toLowerCase()}`;
      if (addedSubjectKeys.has(key)) return;
      addedSubjectKeys.add(key);

      const ticketNum = ((baseTicketNum + idx - 1) % 25) + 1;
      const specialty = session.specialty || matchedStudent?.specialty || 'Yüksək Texniki Peşə';
      const courseLevel = extractCourseLevel(matchedStudent);
      const questions = get5ExamQuestions(subject, specialty, ticketNum);

      ticketsList.push({
        studentName: matchedStudent?.name || 'Tələbə',
        studentId: studentIdentifier,
        finCode: matchedStudent?.finCode || '-',
        specialty,
        courseLevel,
        group: session.group || matchedStudent?.group || courseLevel,
        subject,
        date: session.date || todayStr,
        time: session.time || '10:00',
        ticketNumber: ticketNum,
        questions,
        academicYear: session.academicYear || '2024/2025 Tədris İli',
        semester: session.semester || matchedStudent?.semester || 'Yaz Semestri',
        isToday,
      });
    });

    // 3. Supplement with student's active Courses (Gradebook / Curriculum Subjects)
    const matchedCourses = (courses || []).filter((c) => {
      if (!c || !c.subject) return false;
      const cGroup = (c.group || '').trim().toLowerCase();
      const cSpec = (c.specialty || '').trim().toLowerCase();
      const cSem = (c.semester || '').trim().toLowerCase();

      // Check if student has grades in course
      const inGrades = (c.grades || []).some((g) => {
        const gId = (g.studentId || '').toLowerCase().replace(/[\s\-_]+/g, '');
        const gNum = (g.idNumber || '').toLowerCase().replace(/[\s\-_]+/g, '');
        const gName = (g.studentName || '').toLowerCase().trim();
        return (
          gId === cleanTerm ||
          gNum === cleanTerm ||
          (matchedStudent &&
            (gId === (matchedStudent.studentId || '').toLowerCase().replace(/[\s\-_]+/g, '') ||
              gName === (matchedStudent.name || '').toLowerCase().trim()))
        );
      });

      if (inGrades) return true;

      const specMatch = studentSpecialty && cSpec && (
        cSpec === studentSpecialty ||
        cSpec.includes(studentSpecialty) ||
        studentSpecialty.includes(cSpec)
      );

      const groupMatch = studentGroup && cGroup && (
        cGroup === studentGroup ||
        cGroup.includes(studentGroup) ||
        studentGroup.includes(cGroup)
      );

      const semMatch = studentSemester && cSem && (
        cSem === studentSemester ||
        cSem.includes(studentSemester) ||
        studentSemester.includes(cSem)
      );

      if (specMatch && (groupMatch || semMatch)) return true;
      if (specMatch) return true;
      if (groupMatch && !cSpec) return true;

      return false;
    });

    matchedCourses.forEach((c, idx) => {
      const subject = c.subject.trim();
      const key = `${subject.toLowerCase()}`;
      if (addedSubjectKeys.has(key)) return;
      addedSubjectKeys.add(key);

      const ticketNum = ((baseTicketNum + ticketsList.length) % 25) + 1;
      const specialty = c.specialty || matchedStudent?.specialty || 'Yüksək Texniki Peşə';
      const courseLevel = extractCourseLevel(matchedStudent);
      const questions = get5ExamQuestions(subject, specialty, ticketNum);

      ticketsList.push({
        studentName: matchedStudent?.name || 'Tələbə',
        studentId: studentIdentifier,
        finCode: matchedStudent?.finCode || '-',
        specialty,
        courseLevel,
        group: c.group || matchedStudent?.group || courseLevel,
        subject,
        date: todayStr,
        time: '10:00',
        ticketNumber: ticketNum,
        questions,
        academicYear: '2024/2025 Tədris İli',
        semester: c.semester || matchedStudent?.semester || 'Yaz Semestri',
        isToday: true,
      });
    });

    // 4. If still no tickets created, generate a tailored default exam ticket
    if (ticketsList.length === 0) {
      const courseLevel = extractCourseLevel(matchedStudent);
      const subject = `${matchedStudent.specialty || 'İxtisas'} üzrə İmtahan`;
      const specialty = matchedStudent.specialty || 'Yüksək Texniki Peşə';
      const questions = get5ExamQuestions(subject, specialty, baseTicketNum);

      ticketsList.push({
        studentName: matchedStudent.name,
        studentId: studentIdentifier,
        finCode: matchedStudent.finCode || '-',
        specialty,
        courseLevel,
        group: matchedStudent.group || courseLevel,
        subject,
        date: todayStr,
        time: '10:00',
        ticketNumber: baseTicketNum,
        questions,
        academicYear: '2024/2025 Tədris İli',
        semester: matchedStudent.semester || 'Yaz Semestri',
        isToday: true,
      });
    }

    setAvailableTickets(ticketsList);
    setSelectedTicketIndex(0);
    setErrorMessage(null);
    setPhase('ticket');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateTicketsForId(studentIdInput);
  };

  const handleBackToSearch = () => {
    setPhase('input');
    setStudentIdInput('');
    setErrorMessage(null);
    setAvailableTickets([]);
    if (onClearInitialStudentId) {
      onClearInitialStudentId();
    }
  };

  const handleDrawAnotherTicket = () => {
    if (!currentTicket) return;
    const newTicketNum = Math.floor(Math.random() * 25) + 1;
    const newQuestions = get5ExamQuestions(
      currentTicket.subject,
      currentTicket.specialty,
      newTicketNum
    );

    setAvailableTickets((prev) =>
      prev.map((t, idx) =>
        idx === selectedTicketIndex
          ? { ...t, ticketNumber: newTicketNum, questions: newQuestions }
          : t
      )
    );
  };

  const handlePrintTicket = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 250);
  };

  const currentTicket = availableTickets[selectedTicketIndex] || null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-between relative overflow-hidden antialiased selection:bg-[#6d28d9] selection:text-white">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0 no-print">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#6d28d9]/25 blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#1e1b4b]/60 blur-[150px]" />
      </div>

      {/* Top Navigation Bar (Hidden during print) */}
      <header className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between relative z-10 max-w-6xl mx-auto border-b border-slate-800/80 no-print">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#6d28d9] to-[#9333ea] flex items-center justify-center text-white shadow-lg shadow-purple-900/40 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight">
                E-LDPTM
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                İmtahan Bileti
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-purple-300 font-medium tracking-wide">
              Fərdi İmtahan Sualları Bileti
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
            title="Sessiyanı bitir və giriş səhifəsinə qayıt"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıxış</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* PHASE 1: ID INPUT / SEARCH SCREEN */}
      {/* ========================================================================= */}
      {phase === 'input' && (
        <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-4 no-print">
          <div className="w-full max-w-lg bg-slate-900/85 backdrop-blur-2xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/50">
            {/* Header Icon & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3 shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                İmtahan Biletini Çək
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                İmtahan suallarınızı və rəsmi biletinizi ekrana çıxarmaq üçün Tələbə ID nömrənizi daxil edin.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="studentIdInput"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Tələbə ID nömrəsi
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    id="studentIdInput"
                    type="text"
                    autoFocus
                    required
                    value={studentIdInput}
                    onChange={(e) => {
                      setStudentIdInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Məsələn: 828391 və ya TL-001"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/70 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono uppercase"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
                  <BadgeAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                id="search-ticket-btn"
                className="w-full py-4 bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] hover:from-[#5b21b6] hover:to-[#7c3aed] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-purple-950 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                <span>Bileti Çək və Göstər</span>
              </button>
            </form>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: TICKET DISPLAY & PRINT SCREEN */}
      {/* ========================================================================= */}
      {phase === 'ticket' && currentTicket && (
        <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 relative z-10 w-full max-w-3xl mx-auto my-2">
          {/* Top Control Bar (Hidden on print) */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 no-print">
            <button
              onClick={handleBackToSearch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span>Yeni Axtarış / Başqa ID</span>
            </button>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Optional draw another ticket number */}
              <button
                onClick={handleDrawAnotherTicket}
                title="Təsadüfi başqa bilet çək"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                <span>Yeni Bilet Çək (№)</span>
              </button>

              {/* Main Print Action Button */}
              <button
                onClick={handlePrintTicket}
                disabled={isPrinting}
                id="print-action-btn"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isPrinting ? 'Printerə Göndərilir...' : 'Çapa Ver (Printer)'}</span>
              </button>
            </div>
          </div>

          {/* If multiple exams found for this student, show tabs */}
          {availableTickets.length > 1 && (
            <div className="w-full flex items-center gap-2 overflow-x-auto pb-3 mb-2 no-print">
              <span className="text-xs text-slate-400 font-semibold shrink-0">
                Fənlər üzrə imtahanlar ({availableTickets.length}):
              </span>
              {availableTickets.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTicketIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTicketIndex === idx
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span>{t.subject}</span>
                  {t.isToday && (
                    <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 rounded text-[10px]">
                      Bugün
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* THE OFFICIAL PRINTABLE EXAM QUESTION TICKET SHEET */}
          {/* ========================================================================= */}
          <div className="w-full bg-white text-slate-900 rounded-2xl shadow-2xl border-2 border-slate-300 p-6 sm:p-10 font-sans relative print-container">
            {/* 1. Official Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-5">
              <div className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider leading-tight">
                Azərbaycan Respublikası Elm və Təhsil Nazirliyi
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight mt-0.5">
                LƏNKƏRAN DÖVLƏT PEŞƏ TƏHSİL MƏRKƏZİ
              </h1>
              <div className="text-[11px] sm:text-xs font-bold text-[#5300b7] uppercase tracking-wide mt-0.5">
                Yüksək Texniki Peşə (YTP) Təhsili
              </div>

              <div className="inline-block mt-3 px-4 py-1 border-2 border-slate-900 rounded-md font-mono text-sm sm:text-base font-black text-slate-900 tracking-wider">
                İMTAHAN BİLETİ № {currentTicket.ticketNumber}
              </div>
            </div>

            {/* 2. Student and Exam Core Details (Specialty, Course, Subject, Date) */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs sm:text-sm space-y-2 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span className="text-slate-500 font-semibold">Tələbə (S.A.A.): </span>
                  <strong className="text-slate-900 font-extrabold">{currentTicket.studentName}</strong>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold">Tələbə ID: </span>
                  <span className="font-mono font-bold text-[#5300b7]">{currentTicket.studentId}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold">İxtisas: </span>
                  <strong className="text-slate-900 font-bold">{currentTicket.specialty}</strong>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold">Kurs / Qrup: </span>
                  <strong className="text-slate-900 font-bold">{currentTicket.courseLevel}</strong>
                  {currentTicket.group && currentTicket.group !== currentTicket.courseLevel && (
                    <span className="text-slate-600 font-medium"> ({currentTicket.group})</span>
                  )}
                </div>

                <div className="sm:col-span-2 pt-1 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-slate-500 font-semibold">İmtahan Fənni: </span>
                    <strong className="text-[#5300b7] font-extrabold text-sm sm:text-base">{currentTicket.subject}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Tarix: </span>
                    <strong className="text-slate-900 font-bold">{currentTicket.date}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Centered Header: İMTAHAN SUALLARI */}
            <div className="text-center my-6">
              <div className="inline-block relative">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-widest px-6 py-1.5 border-b-2 border-t-2 border-slate-900">
                  İMTAHAN SUALLARI
                </h2>
              </div>
            </div>

            {/* 4. The 5 Exam Questions (1-dən 5-ə kimi) */}
            <div className="space-y-4 my-6 text-slate-900 text-sm sm:text-base leading-relaxed pl-1 sm:pl-3">
              {currentTicket.questions.map((questionText, qIdx) => (
                <div key={qIdx} className="flex items-start gap-3">
                  <span className="font-extrabold text-slate-900 shrink-0 w-6">
                    {qIdx + 1}.
                  </span>
                  <p className="font-medium text-slate-900 flex-1">
                    {questionText}
                  </p>
                </div>
              ))}
            </div>

            {/* 5. Bottom Signatures & Grading Block */}
            <div className="mt-10 pt-6 border-t-2 border-slate-300 text-xs sm:text-sm text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 items-end">
                <div>
                  <span className="block text-[11px] text-slate-500 mb-6 font-semibold">
                    Tələbənin İmzası:
                  </span>
                  <div className="border-b-2 border-slate-800" />
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-6 font-semibold">
                    Fənn Müəlliminin İmzası:
                  </span>
                  <div className="border-b-2 border-slate-800" />
                </div>

                <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                  <div className="p-2 border border-slate-300 rounded-lg inline-block text-center min-w-[120px]">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Yekun Bal</span>
                    <span className="text-sm font-bold text-slate-400">____ / 50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer (Hidden on print) */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 relative z-10 no-print border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Lənkəran Dövlət Peşə Təhsil Mərkəzi — İmtahan İdarəetmə Sistemi © 2026</span>
          <div className="flex items-center gap-4">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer"
              >
                Əsas Portal
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
