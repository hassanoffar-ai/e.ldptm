export interface Student {
  id: string;
  studentId: string;
  finCode?: string;
  name: string;
  group: string;
  specialty: string;
  avatar?: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  status: 'active' | 'suspended' | 'graduated';
  isRegistered?: boolean;
}

export interface StudentUser {
  id: string;
  studentId: string;
  finCode: string;
  name: string;
  group: string;
  specialty: string;
  email?: string;
  phone?: string;
}

export interface ExamProtocolItem {
  id: string;
  studentId: string;
  studentName: string;
  group: string;
  time: string;
  room: string;
  computerNo: string;
  ticketNo: string;
  ticketTime: string;
  hasSigned: boolean;
}

export interface ExamSession {
  id: string;
  subject: string;
  subjectCode: string;
  group: string;
  specialty: string;
  date: string;
  time: string;
  room: string;
  supervisor: string;
  academicYear: string;
  semester: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  items: ExamProtocolItem[];
}

export interface StudentGrade {
  studentId: string;
  studentName: string;
  idNumber: string;
  avatarInitial: string;
  attendance?: number | null; // Qayıblar / Davamiyyət: Max 10
  seminar: number | null; // Seminar / Məşğələ: Max 10
  colloquium1?: number | null; // Kollokvium 1: Max 15
  colloquium2?: number | null; // Kollokvium 2: Max 15
  examScore?: number | null; // İmtahandan çıxış balı: Max 50 (Minimum keçid: 17)
  // Əvvəlki versiyalarla uyğunluq üçün:
  laboratory?: number | null;
  independentWork?: number | null;
  colloquium?: number | null;
}

export interface SpecialtyModule {
  id: string;
  specialtyId?: string;
  specialtyName: string;
  semester: string; // e.g. "I Semestr", "II Semestr", "III Semestr", "IV Semestr"
  code: string;
  name: string;
  creditHours?: number; // e.g. 60 saat
  credits?: number; // e.g. 4 kredit
  instructor?: string; // Tədris edən müəllim
  syllabusTopics?: string; // Sillabus mövzuları və planı
  syllabusUrl?: string; // Sənəd / Link
  description?: string;
  createdAt?: string;
}

export interface GradeBookCourse {
  id: string;
  group: string;
  specialty: string;
  subject: string;
  subjectCode: string;
  semester: string;
  maxScore: number;
  lastSaved?: string;
  isPublished?: boolean;
  grades: StudentGrade[];
}

export interface ExamHallTicket {
  ticketCode: string;
  studentId: string;
  studentName: string;
  specialty: string;
  group: string;
  subject: string;
  date: string;
  time: string;
  room: string;
  computerNo: string;
  academicYear: string;
  semester: string;
  docNumber: string;
  qrCodeValue: string;
}

export interface SpecialtyItem {
  id: string;
  name: string;
  code: string;
  direction: string; // Peşə İstiqaməti (məs: Yüksək Texniki Peşə (YTP), Texniki Peşə, İlk Peşə)
  duration?: string; // Təhsil müddəti (məs: 2 il)
  educationType?: 'Əyani' | 'Qiyabi';
  description?: string;
  createdAt?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'groups'
  | 'specialties'
  | 'subjects'
  | 'journal'
  | 'grades'
  | 'attendance'
  | 'exams'
  | 'tickets'
  | 'rooms'
  | 'reports'
  | 'users'
  | 'settings';

export type UserRole = 'super_admin' | 'admin';

export interface AdminPermissions {
  canManageStudents: boolean;
  canManageExams: boolean;
  canManageGrades: boolean;
  canAccessRooms: boolean;
  canAccessJournal: boolean;
  canViewReports: boolean;
  canAccessTickets: boolean;
  canManageGroups: boolean;
  canManageSpecialties: boolean;
  canManageSubjects: boolean;
  canManageAttendance: boolean;
}

export interface AdminUser {
  username: string;
  fullName: string;
  role: UserRole;
}

