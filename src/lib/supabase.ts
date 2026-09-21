import { createClient } from '@supabase/supabase-js';
import { ExamSession, GradeBookCourse, SpecialtyItem, SpecialtyModule, Student } from '../types';

const getEnvVar = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || fallback;
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || fallback;
    }
  } catch {}
  return fallback;
};

export const SUPABASE_URL = getEnvVar(
  'VITE_SUPABASE_URL',
  'https://laeunpfmlxmmhnjbxdxy.supabase.co'
);
export const SUPABASE_ANON_KEY = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  'sb_publishable_XAzn1lg6cr2iIM6sSJMAEw_D1ZerJ2a'
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== STUDENTS ====================

export const mapDbToStudent = (row: any): Student => ({
  id: row.id,
  studentId: row.student_id,
  finCode: row.fin_code,
  name: row.name,
  group: row.group_name,
  specialty: row.specialty,
  avatar: row.avatar || undefined,
  email: row.email || undefined,
  phone: row.phone || undefined,
  passwordHash: row.password_hash || undefined,
  status: row.status || 'active',
  isRegistered: row.is_registered || false,
});

export const mapStudentToDb = (s: Student) => ({
  id: s.id,
  student_id: s.studentId,
  fin_code: s.finCode || '',
  name: s.name,
  group_name: s.group,
  specialty: s.specialty,
  avatar: s.avatar || null,
  email: s.email || null,
  phone: s.phone || null,
  password_hash: s.passwordHash || '123456',
  status: s.status || 'active',
  is_registered: s.isRegistered ?? false,
});

export async function fetchStudentsFromDb(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students from Supabase:', error);
    return [];
  }
  return (data || []).map(mapDbToStudent);
}

export async function upsertStudentToDb(student: Student): Promise<void> {
  const dbPayload = mapStudentToDb(student);
  const { error } = await supabase.from('students').upsert(dbPayload, { onConflict: 'id' });
  if (error) {
    console.error('Error saving student to Supabase:', error);
  }
}

export async function deleteStudentFromDb(id: string, studentId?: string): Promise<void> {
  try {
    let query = supabase.from('students').delete();
    if (studentId && studentId !== id) {
      query = query.or(`id.eq.${id},student_id.eq.${studentId},student_id.eq.${id}`);
    } else {
      query = query.or(`id.eq.${id},student_id.eq.${id}`);
    }
    const { error } = await query;
    if (error) {
      console.error('Error deleting student from Supabase directly:', error);
    }
    // Also mark status as deleted in case DB RLS blocks hard deletes
    await supabase
      .from('students')
      .update({ status: 'deleted' })
      .or(studentId ? `id.eq.${id},student_id.eq.${studentId}` : `id.eq.${id},student_id.eq.${id}`);
  } catch (e) {
    console.error('Error in deleteStudentFromDb:', e);
  }
}

// ==================== EXAM SESSIONS ====================

export const mapDbToSession = (row: any): ExamSession => ({
  id: row.id,
  subject: row.subject,
  subjectCode: row.subject_code || '',
  group: row.group_name,
  specialty: row.specialty || '',
  date: row.date || '',
  time: row.time || '',
  room: row.room || '',
  supervisor: row.supervisor || '',
  academicYear: row.academic_year || '',
  semester: row.semester || '',
  status: row.status || 'upcoming',
  items: Array.isArray(row.items) ? row.items : [],
});

export const mapSessionToDb = (s: ExamSession) => ({
  id: s.id,
  subject: s.subject,
  subject_code: s.subjectCode || '',
  group_name: s.group,
  specialty: s.specialty || '',
  date: s.date || '',
  time: s.time || '',
  room: s.room || '',
  supervisor: s.supervisor || '',
  academic_year: s.academicYear || '',
  semester: s.semester || '',
  status: s.status || 'upcoming',
  items: s.items || [],
});

export async function fetchSessionsFromDb(): Promise<ExamSession[]> {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching exam sessions from Supabase:', error);
    return [];
  }
  return (data || []).map(mapDbToSession);
}

export async function upsertSessionToDb(session: ExamSession): Promise<void> {
  const dbPayload = mapSessionToDb(session);
  const { error } = await supabase.from('exam_sessions').upsert(dbPayload, { onConflict: 'id' });
  if (error) {
    console.error('Error saving session to Supabase:', error);
  }
}

export async function deleteSessionFromDb(id: string): Promise<void> {
  const { error } = await supabase.from('exam_sessions').delete().eq('id', id);
  if (error) {
    console.error('Error deleting session from Supabase:', error);
  }
}

// ==================== GRADEBOOK COURSES ====================

export const mapDbToCourse = (row: any): GradeBookCourse => ({
  id: row.id,
  group: row.group_name,
  specialty: row.specialty || '',
  subject: row.subject,
  subjectCode: row.subject_code || '',
  semester: row.semester || '',
  maxScore: Number(row.max_score) || 50,
  lastSaved: row.last_saved || '',
  isPublished: row.is_published ?? false,
  grades: Array.isArray(row.grades) ? row.grades : [],
});

export const mapCourseToDb = (c: GradeBookCourse) => ({
  id: c.id,
  group_name: c.group,
  specialty: c.specialty || '',
  subject: c.subject,
  subject_code: c.subjectCode || '',
  semester: c.semester || '',
  max_score: c.maxScore,
  last_saved: c.lastSaved || '',
  is_published: c.isPublished ?? false,
  grades: c.grades || [],
});

export async function fetchCoursesFromDb(): Promise<GradeBookCourse[]> {
  const { data, error } = await supabase
    .from('gradebook_courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses from Supabase:', error);
    return [];
  }
  return (data || []).map(mapDbToCourse);
}

export async function upsertCourseToDb(course: GradeBookCourse): Promise<void> {
  const dbPayload = mapCourseToDb(course);
  const { error } = await supabase.from('gradebook_courses').upsert(dbPayload, { onConflict: 'id' });
  if (error) {
    console.error('Error saving course to Supabase:', error);
  }
}

export async function deleteCourseFromDb(id: string): Promise<void> {
  const { error } = await supabase.from('gradebook_courses').delete().eq('id', id);
  if (error) {
    console.error('Error deleting course from Supabase:', error);
  }
}

// ==================== SPECIALTIES ====================

export const mapDbToSpecialty = (row: any): SpecialtyItem => ({
  id: row.id,
  name: row.name || '',
  code: row.code || '',
  direction: row.direction || row.department || 'YTP (Yüksək Texniki Peşə)',
  duration: row.duration || '3 illik',
  educationType: (row.education_type || row.educationType || 'Əyani') as 'Əyani' | 'Qiyabi',
  description: row.description || '',
  createdAt: row.created_at || row.createdAt,
});

export const mapSpecialtyToDb = (s: SpecialtyItem) => ({
  id: s.id,
  name: s.name,
  code: s.code || '',
  direction: s.direction || 'YTP (Yüksək Texniki Peşə)',
  duration: s.duration || '3 illik',
  department: s.direction || 'Texniki',
  status: 'active',
});

export async function fetchSpecialtiesFromDb(): Promise<SpecialtyItem[]> {
  const { data, error } = await supabase
    .from('specialties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching specialties from Supabase:', error);
    return [];
  }
  return (data || []).map(mapDbToSpecialty);
}

export async function upsertSpecialtyToDb(specialty: SpecialtyItem): Promise<void> {
  const dbPayload = mapSpecialtyToDb(specialty);
  const { error } = await supabase.from('specialties').upsert(dbPayload, { onConflict: 'id' });
  if (error) {
    console.error('Error saving specialty to Supabase:', error);
  }
}

export async function deleteSpecialtyFromDb(id: string): Promise<void> {
  const { error } = await supabase.from('specialties').delete().eq('id', id);
  if (error) {
    console.error('Error deleting specialty from Supabase:', error);
  }
}

// ==================== STORAGE: SYLLABUSES ====================

export const BUCKET_SYLLABUSES = 'syllabuses';

export async function uploadSyllabusFile(file: File): Promise<{
  url: string | null;
  fileName: string;
  error: any;
}> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_SYLLABUSES)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return { url: null, fileName: file.name, error };
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_SYLLABUSES)
      .getPublicUrl(data.path);

    return { url: publicData.publicUrl, fileName: file.name, error: null };
  } catch (err) {
    console.error('Exception during syllabus upload:', err);
    return { url: null, fileName: file.name, error: err };
  }
}

export async function deleteSyllabusFile(fileUrlOrPath: string): Promise<void> {
  try {
    let filePath = fileUrlOrPath;
    if (fileUrlOrPath.includes(`/${BUCKET_SYLLABUSES}/`)) {
      filePath = fileUrlOrPath.split(`/${BUCKET_SYLLABUSES}/`).pop()?.split('?')[0] || fileUrlOrPath;
    }
    const { error } = await supabase.storage.from(BUCKET_SYLLABUSES).remove([filePath]);
    if (error) {
      console.error('Supabase storage delete error:', error);
    }
  } catch (err) {
    console.error('Exception during syllabus delete:', err);
  }
}

// ==================== SPECIALTY MODULES ====================

export const mapDbToModule = (row: any): SpecialtyModule => ({
  id: row.id,
  specialtyId: row.specialty_id || undefined,
  specialtyName: row.specialty_name || row.specialty || '',
  semester: row.semester || '',
  code: row.code || undefined,
  name: row.name || '',
  creditHours: row.credit_hours ? Number(row.credit_hours) : undefined,
  credits: row.credits ? Number(row.credits) : undefined,
  instructor: row.instructor || undefined,
  syllabusTopics: row.syllabus_topics || undefined,
  syllabusUrl: row.syllabus_url || undefined,
  syllabusFileName: row.syllabus_file_name || undefined,
  description: row.description || undefined,
  createdAt: row.created_at || undefined,
});

export const mapModuleToDb = (m: SpecialtyModule) => ({
  id: m.id,
  specialty_name: m.specialtyName,
  semester: m.semester,
  code: m.code || null,
  name: m.name,
  credit_hours: m.creditHours || null,
  credits: m.credits || null,
  instructor: m.instructor || null,
  syllabus_topics: m.syllabusTopics || null,
  syllabus_url: m.syllabusUrl || null,
  syllabus_file_name: m.syllabusFileName || null,
  description: m.description || null,
});

export async function fetchModulesFromDb(): Promise<SpecialtyModule[]> {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }
    return (data || []).map(mapDbToModule);
  } catch {
    return [];
  }
}

export async function upsertModuleToDb(m: SpecialtyModule): Promise<void> {
  try {
    const dbPayload = mapModuleToDb(m);
    await supabase.from('modules').upsert(dbPayload, { onConflict: 'id' });
  } catch (err) {
    console.error('Error saving module to Supabase:', err);
  }
}

export async function deleteModuleFromDb(id: string): Promise<void> {
  try {
    await supabase.from('modules').delete().eq('id', id);
  } catch (err) {
    console.error('Error deleting module from Supabase:', err);
  }
}

