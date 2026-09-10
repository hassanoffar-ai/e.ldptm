/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, AdminPermissions, AdminUser, ExamSession, GradeBookCourse, Student } from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_EXAM_SESSIONS,
  INITIAL_GRADE_COURSES,
} from './data/mockData';
import {
  getStoredPermissions,
  getStoredSession,
  saveStoredSession,
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
import { NewStudentModal } from './components/NewStudentModal';
import { NewExamSessionModal } from './components/NewExamSessionModal';
import { NewGradeCourseModal } from './components/NewGradeCourseModal';
import { ShieldAlert } from 'lucide-react';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const getInitialRoute = (): 'public' | 'admin' => {
  if (typeof window === 'undefined') return 'public';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.startsWith('/admin') || hash.includes('admin')) {
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

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent real data states
  const [students, setStudents] = useState<Student[]>(() =>
    loadFromStorage('eldptm_students', INITIAL_STUDENTS)
  );
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
  const [courses, setCourses] = useState<GradeBookCourse[]>(() =>
    loadFromStorage('eldptm_courses', INITIAL_GRADE_COURSES)
  );

  // Sync route with URL navigation and history
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash.includes('admin')) {
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

  // Quick ticket kiosk student selection
  const [kioskStudentId, setKioskStudentId] = useState<string | undefined>(
    undefined
  );

  // Modals
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);

  const handleUpdateSession = (updated: ExamSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleCreateSession = (newSession: ExamSession) => {
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (selectedSessionId === id) {
        setSelectedSessionId(remaining[0]?.id || '');
      }
      return remaining;
    });
  };

  const handleCreateCourse = (newCourse: GradeBookCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);

    // Also optionally append to gradebook of their group if course exists
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.group === newStudent.group) {
          const initials = newStudent.name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('');
          return {
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
        }
        return c;
      })
    );
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleOpenTicketKioskForStudent = (studentId: string) => {
    setKioskStudentId(studentId);
    setActiveTab('tickets');
  };

  // Check tab accessibility based on role and permissions
  const isTabAllowed = (tab: ActiveTab): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (tab === 'users') return false;
    if (tab === 'students' && !permissions.canManageStudents) return false;
    if (tab === 'exams' && !permissions.canManageExams) return false;
    if (tab === 'grades' && !permissions.canManageGrades) return false;
    if (tab === 'tickets' && !permissions.canAccessTickets) return false;
    if (tab === 'rooms' && !permissions.canAccessRooms) return false;
    if (tab === 'reports' && !permissions.canViewReports) return false;
    if (tab === 'journal' && !permissions.canAccessJournal) return false;
    return true;
  };

  // 1. PUBLIC SITE ROUTE (/)
  if (currentRoute === 'public') {
    return (
      <PublicPortalView
        students={students}
        sessions={sessions}
        courses={courses}
        onNavigateToAdmin={() => navigateTo('admin')}
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
        onOpenNewStudentModal={() => setIsNewStudentModalOpen(true)}
        currentUser={currentUser}
        permissions={permissions}
        onLogout={handleLogout}
        onNavigateToPublic={() => navigateTo('public')}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
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

              {/* SCREEN 2: İMTAHAN ZALI EKRANI (BİLET ÇAPI KİOSKU) */}
              {activeTab === 'tickets' && (
                <ExamTicketKioskView
                  students={students}
                  sessions={sessions}
                  initialStudentId={kioskStudentId}
                  onClearInitialStudentId={() => setKioskStudentId(undefined)}
                />
              )}

              {/* SCREEN 3: QİYMƏT DAXİLETMƏ */}
              {activeTab === 'grades' && (
                <GradeEntryView
                  courses={courses}
                  onUpdateCourses={setCourses}
                  onOpenNewCourseModal={() => setIsNewCourseModalOpen(true)}
                  onDeleteCourse={handleDeleteCourse}
                />
              )}

              {/* Tələbələr Database View */}
              {activeTab === 'students' && (
                <StudentsView
                  students={students}
                  onOpenTicketKioskForStudent={handleOpenTicketKioskForStudent}
                  onOpenNewStudentModal={() => setIsNewStudentModalOpen(true)}
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
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* New Student Registration Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => setIsNewStudentModalOpen(false)}
        onAddStudent={handleAddStudent}
      />

      {/* New Exam Session Modal */}
      <NewExamSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onAddSession={handleCreateSession}
        students={students}
      />

      {/* New Grade Course Modal */}
      <NewGradeCourseModal
        isOpen={isNewCourseModalOpen}
        onClose={() => setIsNewCourseModalOpen(false)}
        onAddCourse={handleCreateCourse}
        students={students}
      />
    </div>
  );
}
