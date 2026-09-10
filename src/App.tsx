/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveTab, ExamSession, GradeBookCourse, Student } from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_EXAM_SESSIONS,
  INITIAL_GRADE_COURSES,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ExamProtocolView } from './components/ExamProtocolView';
import { ExamTicketKioskView } from './components/ExamTicketKioskView';
import { GradeEntryView } from './components/GradeEntryView';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { GroupsAndOtherViews } from './components/GroupsAndOtherViews';
import { NewStudentModal } from './components/NewStudentModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('exams');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent / dynamic mock data states
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [sessions, setSessions] =
    useState<ExamSession[]>(INITIAL_EXAM_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    INITIAL_EXAM_SESSIONS[0].id
  );
  const [courses, setCourses] =
    useState<GradeBookCourse[]>(INITIAL_GRADE_COURSES);

  // Quick ticket kiosk student selection
  const [kioskStudentId, setKioskStudentId] = useState<string | undefined>(
    undefined
  );

  // New Student modal
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);

  const handleUpdateSession = (updated: ExamSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);

    // Also optionally append to gradebook of their group
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
                avatarInitial: initials,
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
        />

        {/* View Routing */}
        <div className="flex-1 flex flex-col">
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
              onOpenTicketKioskForStudent={handleOpenTicketKioskForStudent}
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
            'users',
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
        </div>
      </main>

      {/* New Student Registration Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => setIsNewStudentModalOpen(false)}
        onAddStudent={handleAddStudent}
      />
    </div>
  );
}
