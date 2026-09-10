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
  seminar: number | null; // Max 10
  laboratory: number | null; // Max 10
  independentWork: number | null; // Max 10 (Sərbəst iş)
  colloquium: number | null; // Max 20
  examScore?: number | null; // Max 50 (if applicable)
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

