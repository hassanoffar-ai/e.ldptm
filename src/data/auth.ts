import { AdminPermissions, AdminUser, StudentUser, UserRole } from '../types';

export interface AccountCredentials {
  username: string;
  passwordHash: string; // Stored in localStorage
  fullName: string;
  role: UserRole;
}

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissions = {
  canManageStudents: true,
  canManageExams: true,
  canManageGrades: true,
  canAccessRooms: true,
  canAccessJournal: true,
  canViewReports: false,
  canAccessTickets: true,
  canManageGroups: true,
  canManageSpecialties: true,
  canManageSubjects: true,
  canManageAttendance: true,
};

const DEFAULT_ACCOUNTS: AccountCredentials[] = [
  {
    username: 'superadmin',
    passwordHash: 'super123',
    fullName: 'Baş Administrator (Super Admin)',
    role: 'super_admin',
  },
  {
    username: 'admin',
    passwordHash: 'admin123',
    fullName: 'Köməkçi İnzibatçı (Admin)',
    role: 'admin',
  },
];

export const getStoredAccounts = (): AccountCredentials[] => {
  try {
    const raw = localStorage.getItem('eldptm_admin_accounts');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_ACCOUNTS;
};

export const saveStoredAccounts = (accounts: AccountCredentials[]) => {
  try {
    localStorage.setItem('eldptm_admin_accounts', JSON.stringify(accounts));
  } catch (e) {
    console.error(e);
  }
};

export const getStoredPermissions = (): AdminPermissions => {
  try {
    const raw = localStorage.getItem('eldptm_admin_permissions');
    if (raw) {
      return { ...DEFAULT_ADMIN_PERMISSIONS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_ADMIN_PERMISSIONS;
};

export const saveStoredPermissions = (permissions: AdminPermissions) => {
  try {
    localStorage.setItem(
      'eldptm_admin_permissions',
      JSON.stringify(permissions)
    );
  } catch (e) {
    console.error(e);
  }
};

export const getStoredSession = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem('eldptm_auth_session');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const saveStoredSession = (user: AdminUser | null) => {
  try {
    if (user) {
      localStorage.setItem('eldptm_auth_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('eldptm_auth_session');
    }
  } catch (e) {
    console.error(e);
  }
};

export const getStoredStudentSession = (): StudentUser | null => {
  try {
    const raw = localStorage.getItem('eldptm_student_session');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const saveStoredStudentSession = (user: StudentUser | null) => {
  try {
    if (user) {
      localStorage.setItem('eldptm_student_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('eldptm_student_session');
    }
  } catch (e) {
    console.error(e);
  }
};

