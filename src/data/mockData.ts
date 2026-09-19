import { ExamSession, GradeBookCourse, SpecialtyItem, Student } from '../types';

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_EXAM_SESSIONS: ExamSession[] = [];

export const INITIAL_GRADE_COURSES: GradeBookCourse[] = [];

export const GROUPS_LIST = [
  '1-ci kurs',
  '2-ci kurs',
  '3-cü kurs',
  '4-cü kurs',
];

export const INITIAL_SPECIALTIES: SpecialtyItem[] = [
  {
    id: 'spec-1',
    name: 'Kibertəhlükəsizlik',
    code: 'KT',
    direction: 'Yüksək Texniki Peşə (YTP)',
    duration: '3 illik',
    educationType: 'Əyani',
    description: 'Yüksək Texniki Peşə (Subbakalavr) təhsil pilləsi',
  },
  {
    id: 'spec-2',
    name: 'Kompüter sistemlərində proqramlaşdırma',
    code: 'KSP',
    direction: 'Yüksək Texniki Peşə (YTP)',
    duration: '3 illik',
    educationType: 'Əyani',
    description: 'Yüksək Texniki Peşə (Subbakalavr) təhsil pilləsi',
  },
  {
    id: 'spec-3',
    name: 'Kompüter şəbəkələri və şəbəkə inzibatçılığı',
    code: 'KŞŞİ',
    direction: 'Yüksək Texniki Peşə (YTP)',
    duration: '3 illik',
    educationType: 'Əyani',
    description: 'Yüksək Texniki Peşə (Subbakalavr) təhsil pilləsi',
  },
  {
    id: 'spec-4',
    name: 'Mehmanxana və restoran işinin təşkili və idarə edilməsi',
    code: 'MRİTİE',
    direction: 'Yüksək Texniki Peşə (YTP)',
    duration: '3 illik',
    educationType: 'Əyani',
    description: 'Yüksək Texniki Peşə (Subbakalavr) təhsil pilləsi',
  },
  {
    id: 'spec-5',
    name: 'Mühasibat uçotu',
    code: 'MU',
    direction: 'Yüksək Texniki Peşə (YTP)',
    duration: '3 illik',
    educationType: 'Əyani',
    description: 'Yüksək Texniki Peşə (Subbakalavr) təhsil pilləsi',
  },
];

export const SPECIALTIES_LIST: string[] = [
  'Kibertəhlükəsizlik',
  'Kompüter sistemlərində proqramlaşdırma',
  'Kompüter şəbəkələri və şəbəkə inzibatçılığı',
  'Mehmanxana və restoran işinin təşkili və idarə edilməsi',
  'Mühasibat uçotu',
];

export const SUBJECTS_LIST = [
  'Proqramlaşdırma Əsasları',
  'Veb Proqramlaşdırma əsasları',
  'Verilənlər Bazasının İdarəedilməsi Sistemləri',
  'Kompüter Şəbəkələri',
  'Alqoritmlər və Verilənlər Strukturları',
  'Kibertəhlükəsizlik Əsasları',
];

export const ROOMS_LIST = ['Lab-1', 'Lab-2', 'Lab-3', 'Lab-4', 'Mühazirə-101', 'Mühazirə-204'];
