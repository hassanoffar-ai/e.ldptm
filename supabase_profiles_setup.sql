-- ==============================================================================
-- E-LDPTM: SUPABASE public.profiles CƏDVƏLİ VƏ AUTOZATOR (TOTP 2FA) STRUKTURU
-- Bu skripti Supabase Dashboard -> SQL Editor bölməsində icra (RUN) edin.
-- ==============================================================================

-- 1. Mövcud sonsuz rekursiya (infinite recursion) yaradan köhnə siyasətləri təmizləyirik:
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles;';
    END LOOP;
END $$;

-- 2. profiles cədvəlini yaradırıq və ya mövcud cədvələ lazım olan sütunları əlavə edirik:
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student', -- 'super_admin', 'admin', 'student'
    full_name TEXT,
    email TEXT,
    phone TEXT,
    student_id TEXT,
    totp_secret TEXT,                     -- Google Authenticator Base32 gizli açarı
    is_totp_enabled BOOLEAN DEFAULT FALSE,-- Superadmin və Admin üçün autozator aktivdirmi?
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Əgər cədvəl əvvəldən mövcud idisə, çatışmayan sütunları əlavə edirik:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_totp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- username sütununa unikal indeks təyin edirik:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- 3. Super Admin, Admin və Bilet hesablarının ilkin qeydiyyatı:
INSERT INTO public.profiles (username, full_name, role, password_hash, is_totp_enabled, status)
VALUES 
  ('superadmin', 'Baş Administrator (Super Admin)', 'super_admin', 'Subhanallah313', false, 'active'),
  ('admin', 'Köməkçi Admin', 'admin', 'LDPTM2026', false, 'active'),
  ('bilet', 'İmtahan Bilet Sistemi', 'admin', 'bilet123', false, 'active')
ON CONFLICT (username) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 4. Mövcud tələbələri "students" cədvəlindən "profiles" cədvəlinə sinxronlaşdırırıq:
INSERT INTO public.profiles (username, student_id, full_name, email, phone, role, password_hash, status)
SELECT 
  LOWER(COALESCE(NULLIF(student_id, ''), fin_code, id)) AS username,
  student_id,
  name AS full_name,
  email,
  phone,
  'student' AS role,
  COALESCE(password_hash, '123456') AS password_hash,
  COALESCE(status, 'active') AS status
FROM public.students
ON CONFLICT (username) DO NOTHING;

-- 5. Row Level Security (RLS) aktivləşdirilir və təmiz, rekursiyasız siyasətlər verilir:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (true);

CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE USING (true);

-- İndekslər (Sürətli axtarış və yoxlama üçün):
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles (student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

