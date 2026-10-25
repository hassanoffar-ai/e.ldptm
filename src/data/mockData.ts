import { ExamSession, GradeBookCourse, SpecialtyItem, SpecialtyModule, Student } from '../types';

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_EXAM_SESSIONS: ExamSession[] = [];

export const INITIAL_GRADE_COURSES: GradeBookCourse[] = [];

export const GROUPS_LIST = [
  '1-ci kurs',
  '2-ci kurs',
  '3-cü kurs',
  '4-cü kurs',
];

export const INITIAL_SPECIALTIES: SpecialtyItem[] = [];

export const SPECIALTIES_LIST: string[] = [];

export const SEMESTERS_LIST = [
  '1-ci kurs 1-ci semestr',
  '1-ci kurs 2-ci semestr',
  '2-ci kurs 1-ci semestr',
  '2-ci kurs 2-ci semestr',
  '3-cü kurs 1-ci semestr',
  '3-cü kurs 2-ci semestr',
  '4-cü kurs 1-ci semestr',
  '4-cü kurs 2-ci semestr',
];

export const BASE_SEMESTERS_LIST = [
  'I Semestr',
  'II Semestr',
];

export const INITIAL_SPECIALTY_MODULES: SpecialtyModule[] = [];

export const ROOMS_LIST = ['Lab-1', 'Lab-2', 'Lab-3', 'Lab-4', 'Mühazirə-101', 'Mühazirə-204'];

export const SUBJECTS_LIST: string[] = [];

/**
 * Loads stored modules from localStorage and automatically purges any legacy mock/fake modules.
 */
export const getStoredModules = (): SpecialtyModule[] => {
  try {
    const saved = localStorage.getItem('eldptm_modules');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out any legacy mock data (IDs like mod-kt-*, mod-ksp-*, mod-kss-*, mod-mri-*, mod-mu-*)
        const filtered = parsed.filter(
          (m: SpecialtyModule) =>
            m &&
            m.id &&
            !m.id.startsWith('mod-kt-') &&
            !m.id.startsWith('mod-ksp-') &&
            !m.id.startsWith('mod-kss-') &&
            !m.id.startsWith('mod-mri-') &&
            !m.id.startsWith('mod-mu-')
        );
        if (filtered.length !== parsed.length) {
          localStorage.setItem('eldptm_modules', JSON.stringify(filtered));
        }
        return filtered;
      }
    }
  } catch {}
  return [];
};


