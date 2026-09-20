/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, AdminPermissions, AdminUser, ExamSession, GradeBookCourse, SpecialtyItem, Student, StudentUser } from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_EXAM_SESSIONS,
  INITIAL_GRADE_COURSES,
  INITIAL_SPECIALTIES,
} from './data/mockData';
import {
  getStoredPermissions,
  getStoredSession,
  getStoredStudentSession,
  saveStoredSession,
  saveStoredStudentSession,
} from './data/auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ExamProtocolView } from './components/ExamProtocolView';
import { ExamTicketKioskView } from './components/ExamTicketKioskView';
import { GradeEntryView } from './components/GradeEntryView';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { GroupsAndOtherViews } from './components/GroupsAndOtherViews';
import { AdminPermissionsView } from './components/AdminPermissionsView';
import { AdminLoginView } from './components/AdminLoginView';
import { PublicPortalView } from './components/PublicPortalView';
import { StudentAuthView } from './components/StudentAuthView';
import { NewStudentModal } from './components/NewStudentModal';
import { NewExamSessionModal } from './components/NewExamSessionModal';
import { NewGradeCourseModal } from './components/NewGradeCourseModal';
import { ShieldAlert } from 'lucide-react';
import {
  supabase,
  fetchStudentsFromDb,
  upsertStudentToDb,
  deleteStudentFromDb,
  fetchSessionsFromDb,
  upsertSessionToDb,
  deleteSessionFromDb,
  fetchCoursesFromDb,
  upsertCourseToDb,
  deleteCourseFromDb,
  fetchSpecialtiesFromDb,
  upsertSpecialtyToDb,
  deleteSpecialtyFromDb,
} from './lib/supabase';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const loadSpecialtiesFromStorage = (): SpecialtyItem[] => {
  try {
    const item = localStorage.getItem('eldptm_specialties');
    if (item) {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasLegacy = parsed.some((s: SpecialtyItem) =>
          [
            'Veb tərtibatı və dizaynı',
            'Kompüter sistemlərində proqram təminatı',
            'Kompüter şəbəkələrinin inzibatçılığı',
            'Kibertəhlükəsizlik sistemləri',
          ].includes(s.name)
        );
        if (hasLegacy) {
          const customOnes = parsed.filter(
            (s: SpecialtyItem) =>
              ![
                'Veb tərtibatı və dizaynı',
                'Kompüter sistemlərində proqram təminatı',
                'Kompüter şəbəkələrinin inzibatçılığı',
                'Kibertəhlükəsizlik sistemləri',
                'Kompüter sistemlərində proqramlaşdırma',
              ].includes(s.name)
          );
          const migrated = [...INITIAL_SPECIALTIES, ...customOnes].sort((a, b) =>
            (a.name || '').localeCompare(b.name || '', 'az')
          );
          localStorage.setItem('eldptm_specialties', JSON.stringify(migrated));
          return migrated;
        }
        const sorted = [...parsed].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'));
        return sorted;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return [...INITIAL_SPECIALTIES].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'));
};

const getInitialRoute = (): 'public' | 'admin' => {
  if (typeof window === 'undefined') return 'public';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.startsWith('/admin') || path.includes('admin') || hash.includes('admin')) {
    return 'admin';
  }
  return 'public';
};

export default function App() {
  // Top-level route: 'public' (Production site at /) vs 'admin' (Admin Panel at /admin)
  const [currentRoute, setCurrentRoute] = useState<'public' | 'admin'>(getInitialRoute);

  // Authentication & permissions
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(getStoredSession);
  const [permissions, setPermissions] = useState<AdminPermissions>(getStoredPermissions);

  // Student authentication for production / student portal
  const [currentStudentUser, setCurrentStudentUser] = useState<StudentUser | null>(
    getStoredStudentSession
  );

  const handleStudentLoginSuccess = (studentUser: StudentUser) => {
    setCurrentStudentUser(studentUser);
  };

  const handleStudentLogout = () => {
    saveStoredStudentSession(null);
    setCurrentStudentUser(null);
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent real data states
  const [students, setStudents] = useState<Student[]>(() => {
    const raw = loadFromStorage<Student[]>('eldptm_students', INITIAL_STUDENTS);
    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem('eldptm_deleted_students') || '[]');
      return raw.filter((s) => !deletedList.includes(s.id) && !deletedList.includes(s.studentId));
    } catch {
      return raw;
    }
  });
  const [sessions, setSessions] = useState<ExamSession[]>(() =>
    loadFromStorage('eldptm_sessions', INITIAL_EXAM_SESSIONS)
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => {
    const savedSessions = loadFromStorage<ExamSession[]>(
      'eldptm_sessions',
      INITIAL_EXAM_SESSIONS
    );
    return savedSessions[0]?.id || '';
  });
  const [courses, setCourses] = useState<GradeBookCourse[]>(() => {
    const raw = loadFromStorage<GradeBookCourse[]>('eldptm_courses', INITIAL_GRADE_COURSES);
    try {
      const deletedCourses: string[] = JSON.parse(localStorage.getItem('eldptm_deleted_courses') || '[]');
      return raw.filter((c) => !deletedCourses.includes(c.id));
    } catch {
      return raw;
    }
  });
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>(loadSpecialtiesFromStorage);

  // Sync route with URL navigation and history
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || path.includes('admin') || hash.includes('admin')) {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('public');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Sync cross-tab permissions or storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setPermissions(getStoredPermissions());
      setCurrentUser(getStoredSession());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const navigateTo = (route: 'public' | 'admin') => {
    setCurrentRoute(route);
    if (route === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  const handleLogout = () => {
    saveStoredSession(null);
    setCurrentUser(null);
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setPermissions(getStoredPermissions());
    setActiveTab('dashboard');
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('eldptm_students', JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('eldptm_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('eldptm_courses', JSON.stringify(courses));
    } catch (e) {
      console.error(e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem('eldptm_specialties', JSON.stringify(specialties));
    } catch (e) {
      console.error(e);
    }
  }, [specialties]);

  // Load from Supabase on start and subscribe to Realtime changes across devices
  useEffect(() => {
    let isMounted = true;

    async function loadDataFromSupabase() {
      try {
        const [dbStudents, dbSessions, dbCourses, dbSpecialties] = await Promise.all([
          fetchStudentsFromDb(),
          fetchSessionsFromDb(),
          fetchCoursesFromDb(),
          fetchSpecialtiesFromDb(),
        ]);

        if (!isMounted) return;

        if (dbStudents.length > 0) {
          const deletedList: string[] = JSON.parse(localStorage.getItem('eldptm_deleted_students') || '[]');
          const validStudents = dbStudents.filter(
            (s) => !deletedList.includes(s.id) && !deletedList.includes(s.studentId)
          );
          setStudents(validStudents);
        } else if (students.length > 0) {
          // Sync any existing local students to Supabase
          students.forEach((s) => upsertStudentToDb(s));
        }

        if (dbSessions.length > 0) {
          setSessions(dbSessions);
          setSelectedSessionId((prev) => prev || dbSessions[0]?.id || '');
        } else if (sessions.length > 0) {
          sessions.forEach((s) => upsertSessionToDb(s));
        }

        if (dbCourses.length > 0) {
          const deletedCourses: string[] = JSON.parse(localStorage.getItem('eldptm_deleted_courses') || '[]');
          const validCourses = dbCourses.filter((c) => !deletedCourses.includes(c.id));
          setCourses(validCourses);
        } else if (courses.length > 0) {
          courses.forEach((c) => upsertCourseToDb(c));
        }

        if (dbSpecialties.length > 0) {
          const hasDbLegacy = dbSpecialties.some((s) =>
            [
              'Veb tərtibatı və dizaynı',
              'Kompüter sistemlərində proqram təminatı',
              'Kompüter şəbəkələrinin inzibatçılığı',
              'Kibertəhlükəsizlik sistemləri',
            ].includes(s.name)
          );
          if (hasDbLegacy) {
            setSpecialties(INITIAL_SPECIALTIES);
            INITIAL_SPECIALTIES.forEach((s) => upsertSpecialtyToDb(s));
          } else {
            setSpecialties(
              [...dbSpecialties].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'))
            );
          }
        } else if (specialties.length > 0) {
          specialties.forEach((s) => upsertSpecialtyToDb(s));
        }
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      }
    }

    loadDataFromSupabase();

    // Live Realtime updates across devices
    const channel = supabase
      .channel('eldptm-db-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        async () => {
          const fresh = await fetchStudentsFromDb();
          const deletedList: string[] = JSON.parse(localStorage.getItem('eldptm_deleted_students') || '[]');
          const validStudents = fresh.filter(
            (s) => !deletedList.includes(s.id) && !deletedList.includes(s.studentId)
          );
          if (isMounted) setStudents(validStudents);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exam_sessions' },
        async () => {
          const fresh = await fetchSessionsFromDb();
          if (isMounted && fresh.length > 0) setSessions(fresh);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gradebook_courses' },
        async () => {
          const fresh = await fetchCoursesFromDb();
          if (isMounted && fresh.length > 0) setCourses(fresh);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'specialties' },
        async () => {
          const fresh = await fetchSpecialtiesFromDb();
          if (isMounted && fresh.length > 0) {
            setSpecialties(
              [...fresh].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'))
            );
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddSpecialty = (newSpecialty: SpecialtyItem) => {
    setSpecialties((prev) =>
      [...prev, newSpecialty].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'))
    );
    upsertSpecialtyToDb(newSpecialty);
  };

  const handleUpdateSpecialty = (updatedSpecialty: SpecialtyItem) => {
    setSpecialties((prev) =>
      prev
        .map((s) => (s.id === updatedSpecialty.id ? updatedSpecialty : s))
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'))
    );
    upsertSpecialtyToDb(updatedSpecialty);
  };

  const handleDeleteSpecialty = (id: string) => {
    setSpecialties((prev) => prev.filter((s) => s.id !== id));
    deleteSpecialtyFromDb(id);
  };

  // Quick ticket kiosk student selection
  const [kioskStudentId, setKioskStudentId] = useState<string | undefined>(
    undefined
  );

  // Modals
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [newStudentDefaults, setNewStudentDefaults] = useState<{
    group?: string;
    specialty?: string;
  }>({});
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);

  const handleUpdateSession = (updated: ExamSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    upsertSessionToDb(updated);
  };

  const handleCreateSession = (newSession: ExamSession) => {
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
    upsertSessionToDb(newSession);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (selectedSessionId === id) {
        setSelectedSessionId(remaining[0]?.id || '');
      }
      return remaining;
    });
    deleteSessionFromDb(id);
  };

  const handleCreateCourse = (newCourse: GradeBookCourse) => {
    try {
      const deletedCourses: string[] = JSON.parse(localStorage.getItem('eldptm_deleted_courses') || '[]');
      const filtered = deletedCourses.filter((x) => x !== newCourse.id);
      localStorage.setItem('eldptm_deleted_courses', JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
    setCourses((prev) => [newCourse, ...prev]);
    upsertCourseToDb(newCourse);
  };

  const handleDeleteCourse = (id: string) => {
    try {
      const deletedCourses: string[] = JSON.parse(localStorage.getItem('eldptm_deleted_courses') || '[]');
      if (!deletedCourses.includes(id)) deletedCourses.push(id);
      localStorage.setItem('eldptm_deleted_courses', JSON.stringify(deletedCourses));
    } catch (e) {
      console.error(e);
    }
    setCourses((prev) => prev.filter((c) => c.id !== id));
    deleteCourseFromDb(id);
  };

  const handleUpdateCourses = (updatedCourses: GradeBookCourse[]) => {
    setCourses(updatedCourses);
    updatedCourses.forEach((c) => upsertCourseToDb(c));
  };

  const handleAddStudent = (newStudent: Student) => {
    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem('eldptm_deleted_students') || '[]');
      const filtered = deletedList.filter((x) => x !== newStudent.id && x !== newStudent.studentId);
      localStorage.setItem('eldptm_deleted_students', JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }

    setStudents((prev) => {
      const existingIdx = prev.findIndex(
        (s) =>
          s.id === newStudent.id ||
          (s.studentId && newStudent.studentId && s.studentId.toUpperCase() === newStudent.studentId.toUpperCase()) ||
          (s.finCode && newStudent.finCode && s.finCode.toUpperCase() === newStudent.finCode.toUpperCase())
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], ...newStudent };
        return next;
      }
      return [newStudent, ...prev];
    });

    upsertStudentToDb(newStudent);

    // Also optionally append to gradebook of their group if course exists
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.group === newStudent.group) {
          const alreadyInCourse = c.grades.some(
            (g) => g.studentId === newStudent.id || g.idNumber === newStudent.studentId
          );
          if (alreadyInCourse) {
            return c;
          }
          const initials = newStudent.name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('');
          const updatedCourse = {
            ...c,
            grades: [
              ...c.grades,
              {
                studentId: newStudent.id,
                studentName: newStudent.name,
                idNumber: newStudent.studentId,
                avatarInitial: initials || 'TL',
                seminar: null,
                laboratory: null,
                independentWork: null,
                colloquium: null,
              },
            ],
          };
          upsertCourseToDb(updatedCourse);
          return updatedCourse;
        }
        return c;
      })
    );
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    upsertStudentToDb(updatedStudent);
  };

  const handleDeleteStudent = (id: string) => {
    const student = students.find((s) => s.id === id || s.studentId === id);
    const studentId = student?.studentId;

    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem('eldptm_deleted_students') || '[]');
      if (id && !deletedList.includes(id)) deletedList.push(id);
      if (studentId && !deletedList.includes(studentId)) deletedList.push(studentId);
      localStorage.setItem('eldptm_deleted_students', JSON.stringify(deletedList));
    } catch (e) {
      console.error(e);
    }

    setStudents((prev) =>
      prev.filter(
        (s) => s.id !== id && s.studentId !== id && (studentId ? s.studentId !== studentId : true)
      )
    );
    deleteStudentFromDb(id, studentId);
  };

  const handleOpenTicketKioskForStudent = (studentId: string) => {
    setKioskStudentId(studentId);
    setActiveTab('tickets');
  };

  // Check tab accessibility based on role and permissions
  const isTabAllowed = (tab: ActiveTab): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (tab === 'users' || tab === 'settings') return false;
    if (tab === 'students' && !permissions.canManageStudents) return false;
    if (tab === 'groups' && !permissions.canManageGroups) return false;
    if (tab === 'specialties' && !permissions.canManageSpecialties) return false;
    if (tab === 'subjects' && !permissions.canManageSubjects) return false;
    if (tab === 'exams' && !permissions.canManageExams) return false;
    if (tab === 'grades' && !permissions.canManageGrades) return false;
    if (tab === 'tickets' && !permissions.canAccessTickets) return false;
    if (tab === 'rooms' && !permissions.canAccessRooms) return false;
    if (tab === 'reports' && !permissions.canViewReports) return false;
    if (tab === 'journal' && !permissions.canAccessJournal) return false;
    if (tab === 'attendance' && !permissions.canManageAttendance) return false;
    return true;
  };

  // 1. PUBLIC SITE ROUTE (/) - YTP TƏLƏBƏ PORTALI VƏ ŞƏXSİ KABİNET
  if (currentRoute === 'public') {
    if (!currentStudentUser) {
      return (
        <StudentAuthView
          students={students}
          onRegisterStudent={handleAddStudent}
          onLoginSuccess={handleStudentLoginSuccess}
        />
      );
    }

    return (
      <PublicPortalView
        student={currentStudentUser}
        courses={courses}
        sessions={sessions}
        onLogout={handleStudentLogout}
      />
    );
  }

  // 2. ADMIN ROUTE (/admin) - NOT LOGGED IN
  if (!currentUser) {
    return (
      <AdminLoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigateHome={() => navigateTo('public')}
      />
    );
  }

  // 3. ADMIN ROUTE (/admin) - AUTHENTICATED
  return (
    <div className="bg-[#f8f9ff] text-[#121c2a] min-h-screen flex antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'tickets') {
            setKioskStudentId(undefined);
          }
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenNewStudentModal={() => {
          setNewStudentDefaults({});
          setIsNewStudentModalOpen(true);
        }}
        currentUser={currentUser}
        permissions={permissions}
        onLogout={handleLogout}
        onNavigateToPublic={() => navigateTo('public')}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigateToPublic={() => navigateTo('public')}
        />

        {/* View Routing with Permission Checks */}
        <div className="flex-1 flex flex-col">
          {!isTabAllowed(activeTab) ? (
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Giriş Məhdudlaşdırılıb
              </h2>
              <p className="text-xs text-slate-500 mt-2 max-w-md">
                Bu bölməyə daxil olmaq üçün hesabınıza səlahiyyət verilməyib.
                İcazələrin təyini yalnız <strong>Super Admin</strong> tərəfindən həyata keçirilir.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="mt-4 px-4 py-2 bg-[#5300b7] text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Əsas Panelə Qayıt
              </button>
            </div>
          ) : (
            <>
              {/* SUPER ADMIN CONTROL CENTER: Users & Permissions Matrix */}
              {activeTab === 'users' && currentUser.role === 'super_admin' && (
                <AdminPermissionsView currentUser={currentUser} />
              )}

              {/* DASHBOARD */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  sessions={sessions}
                  courses={courses}
                  students={students}
                  setActiveTab={setActiveTab}
                  onOpenTicketKioskForStudent={handleOpenTicketKioskForStudent}
                />
              )}

              {/* SCREEN 1: İMTAHAN PROTOKOLU */}
              {activeTab === 'exams' && (
                <ExamProtocolView
                  sessions={sessions}
                  selectedSessionId={selectedSessionId}
                  onSelectSession={setSelectedSessionId}
                  onUpdateSession={handleUpdateSession}
                  onOpenNewSessionModal={() => setIsNewSessionModalOpen(true)}
                  onDeleteSession={handleDeleteSession}
                  onOpenTicketKioskForStudent={handleOpenTicketKioskForStudent}
                  students={students}
                />
              )}


              {/* SCREEN 3: QİYMƏT DAXİLETMƏ */}
              {activeTab === 'grades' && (
                <GradeEntryView
                  courses={courses}
                  onUpdateCourses={handleUpdateCourses}
                  onOpenNewCourseModal={() => setIsNewCourseModalOpen(true)}
                  onDeleteCourse={handleDeleteCourse}
                  specialties={specialties}
                />
              )}

              {/* Tələbələr Database View */}
              {activeTab === 'students' && (
                <StudentsView
                  students={students}
                  specialties={specialties}
                  onOpenTicketKioskForStudent={handleOpenTicketKioskForStudent}
                  onOpenNewStudentModal={(defaultGroup, defaultSpecialty) => {
                    setNewStudentDefaults({
                      group: defaultGroup,
                      specialty: defaultSpecialty,
                    });
                    setIsNewStudentModalOpen(true);
                  }}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                />
              )}

              {/* Additional tab views (Qruplar, İxtisaslar, Fənlər, Otaqlar, Davamiyyət, Jurnal, Hesabatlar, Ayarlar) */}
              {[
                'groups',
                'specialties',
                'subjects',
                'journal',
                'attendance',
                'rooms',
                'reports',
                'settings',
              ].includes(activeTab) && (
                <GroupsAndOtherViews
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  students={students}
                  sessions={sessions}
                  courses={courses}
                  specialties={specialties}
                  onAddSpecialty={handleAddSpecialty}
                  onUpdateSpecialty={handleUpdateSpecialty}
                  onDeleteSpecialty={handleDeleteSpecialty}
                  onOpenNewStudentModal={(defaultGroup, defaultSpecialty) => {
                    setNewStudentDefaults({
                      group: defaultGroup,
                      specialty: defaultSpecialty,
                    });
                    setIsNewStudentModalOpen(true);
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* New Student Registration Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => {
          setIsNewStudentModalOpen(false);
          setNewStudentDefaults({});
        }}
        onAddStudent={handleAddStudent}
        specialties={specialties}
        existingStudents={students}
        defaultGroup={newStudentDefaults.group}
        defaultSpecialty={newStudentDefaults.specialty}
      />

      {/* New Exam Session Modal */}
      <NewExamSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onAddSession={handleCreateSession}
        students={students}
        specialties={specialties}
      />

      {/* New Grade Course Modal */}
      <NewGradeCourseModal
        isOpen={isNewCourseModalOpen}
        onClose={() => setIsNewCourseModalOpen(false)}
        onAddCourse={handleCreateCourse}
        students={students}
        specialties={specialties}
      />
    </div>
  );
}
