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

export const SEMESTERS_LIST = [
  'I Semestr',
  'II Semestr',
  'III Semestr',
  'IV Semestr',
];

export const INITIAL_SPECIALTY_MODULES: SpecialtyModule[] = [
  // --- Kibertəhlükəsizlik ---
  {
    id: 'mod-kt-101',
    specialtyName: 'Kibertəhlükəsizlik',
    semester: 'I Semestr',
    code: 'KT-101',
    name: 'İnformasiya Təhlükəsizliyinə Giriş',
    creditHours: 60,
    credits: 5,
    instructor: 'Əliyev Vüqar',
    syllabusTopics: '1. İnformasiya təhlükəsizliyi anlayışı və CIA triadası\n2. Təhlükə modelləri və risklərin qiymətləndirilməsi\n3. Parol siyasəti və autentifikasiya mexanizmləri\n4. İctimai şəbəkələrdə təhlükəsiz davranış qaydaları',
    description: 'Kibertəhlükəsizliyin təməl prinsipləri, məxfilik, bütövlük və əlçatanlıq anlayışları.',
  },
  {
    id: 'mod-kt-102',
    specialtyName: 'Kibertəhlükəsizlik',
    semester: 'I Semestr',
    code: 'KT-102',
    name: 'Əməliyyat Sistemləri və Təhlükəsizlik',
    creditHours: 60,
    credits: 5,
    instructor: 'Rəhimov Elmir',
    syllabusTopics: '1. Windows və Linux arxitekturası\n2. İcazələrin idarə edilməsi (Permissions, ACL)\n3. Proseslər və xidmətlərin təhlükəsizliyi\n4. Kernel səviyyəli mühafizə sistemləri',
    description: 'Əməliyyat sistemlərinin daxili strukturu və təhlükəsiz konfiqurasiyası.',
  },
  {
    id: 'mod-kt-201',
    specialtyName: 'Kibertəhlükəsizlik',
    semester: 'II Semestr',
    code: 'KT-201',
    name: 'Kriptoqrafiyanın Əsasları',
    creditHours: 60,
    credits: 5,
    instructor: 'Məmmədov Samir',
    syllabusTopics: '1. Simmetrik və asimmetrik şifrələmə (AES, RSA)\n2. Həş funksiyaları (SHA-256, MD5)\n3. Rəqəmsal imza və PKI infrastrukturu\n4. SSL/TLS protokollarının tətbiqi',
    description: 'Məlumatların şifrələnməsi və rəqəmsal imza sistemləri.',
  },
  {
    id: 'mod-kt-202',
    specialtyName: 'Kibertəhlükəsizlik',
    semester: 'II Semestr',
    code: 'KT-202',
    name: 'Şəbəkə Təhlükəsizliyi və Firewall',
    creditHours: 60,
    credits: 5,
    instructor: 'Cəfərov Nicat',
    syllabusTopics: '1. TCP/IP modelində zəifliklər\n2. Firewall və IDS/IPS konfiqurasiyası\n3. Şəbəkə skanlaması (Nmap, Wireshark analizi)\n4. DDoS hücumları və müdafiə üsulları',
    description: 'Şəbəkə paketlərinin təhlili və təhlükəsizlik divarlarının qurulması.',
  },

  // --- Kompüter sistemlərində proqramlaşdırma ---
  {
    id: 'mod-ksp-101',
    specialtyName: 'Kompüter sistemlərində proqramlaşdırma',
    semester: 'I Semestr',
    code: 'KSP-101',
    name: 'Proqramlaşdırmanın Əsasları (Python)',
    creditHours: 75,
    credits: 6,
    instructor: 'Quliyev Rəşad',
    syllabusTopics: '1. Dəyişənlər, məlumat tipləri və operatorlar\n2. Şərt və dövr operatorları\n3. Funksiyalar və modullarla iş\n4. Fayl əməliyyatları və xətaların idarəsi',
    description: 'Python dili ilə alqoritmik düşüncə və təməl proqramlaşdırma vərdişləri.',
  },
  {
    id: 'mod-ksp-102',
    specialtyName: 'Kompüter sistemlərində proqramlaşdırma',
    semester: 'I Semestr',
    code: 'KSP-102',
    name: 'Alqoritmlər və Verilənlər Strukturları',
    creditHours: 60,
    credits: 5,
    instructor: 'Həsənov Fərid',
    syllabusTopics: '1. Massivlər, Siyahılar, Stek və Növbə\n2. Axtarış və çeşidləmə alqoritmləri (QuickSort, Binary Search)\n3. Qraflar və ağac strukturları\n4. Asimptotik analiz (Big-O notasiyası)',
    description: 'Effektiv alqoritmlərin qurulması və optimizasiyası.',
  },
  {
    id: 'mod-ksp-201',
    specialtyName: 'Kompüter sistemlərində proqramlaşdırma',
    semester: 'II Semestr',
    code: 'KSP-201',
    name: 'Obyektyönlü Proqramlaşdırma (C#)',
    creditHours: 75,
    credits: 6,
    instructor: 'Quliyev Rəşad',
    syllabusTopics: '1. OOP prinsipləri: Kapsullama, İrsiyyət, Polimorfizm, Abstraksiya\n2. İnterfeyslər və mücərrəd siniflər\n3. Hadisələr və nümayəndələr (Events & Delegates)\n4. LINQ və kolleksiyalar',
    description: 'C# dili ilə siniflərin qurulması və böyük layihə memarlığı.',
  },
  {
    id: 'mod-ksp-202',
    specialtyName: 'Kompüter sistemlərində proqramlaşdırma',
    semester: 'II Semestr',
    code: 'KSP-202',
    name: 'Verilənlər Bazasının İdarəedilməsi (SQL)',
    creditHours: 60,
    credits: 5,
    instructor: 'Həsənov Fərid',
    syllabusTopics: '1. Relyasiyalı verilənlər bazası nəzəriyyəsi və ERD\n2. SQL sorğuları: SELECT, JOIN, GROUP BY, HAVING\n3. Tranzaksiyalar və indekslər\n4. Prosedurlar və triqqerlər',
    description: 'PostgreSQL və MS SQL serverlərində verilənlər bazası dizaynı və sorğular.',
  },

  // --- Kompüter şəbəkələri və şəbəkə inzibatçılığı ---
  {
    id: 'mod-kss-101',
    specialtyName: 'Kompüter şəbəkələri və şəbəkə inzibatçılığı',
    semester: 'I Semestr',
    code: 'KŞŞİ-101',
    name: 'Kompüter Aparat Təminatı və Periferiya',
    creditHours: 60,
    credits: 5,
    instructor: 'Babayev Elşən',
    syllabusTopics: '1. Ana plata, prosessor, RAM və yaddaş qurğuları\n2. BIOS/UEFI sazlamaları\n3. Diaqnostika və nasazlıqların aradan qaldırılması\n4. Şəbəkə kartları və kabelləşmə',
    description: 'PC yığımı, aparat hissələrinin sazlanması və nasazlıqların diaqnostikası.',
  },
  {
    id: 'mod-kss-102',
    specialtyName: 'Kompüter şəbəkələri və şəbəkə inzibatçılığı',
    semester: 'I Semestr',
    code: 'KŞŞİ-102',
    name: 'Şəbəkə Texnologiyalarının Əsasları (CCNA-1)',
    creditHours: 75,
    credits: 6,
    instructor: 'İsmayılov Kamran',
    syllabusTopics: '1. OSI və TCP/IP modelləri\n2. IPv4 və IPv6 ünvanlaşdırma, subnetting\n3. Ethernet texnologiyası və kommutasiya\n4. Router və Switch ilkin sazlamaları',
    description: 'Lokal şəbəkələrin qurulması və şəbəkə avadanlıqlarının konfiqurasiyası.',
  },
  {
    id: 'mod-kss-201',
    specialtyName: 'Kompüter şəbəkələri və şəbəkə inzibatçılığı',
    semester: 'II Semestr',
    code: 'KŞŞİ-201',
    name: 'Windows Server İnzibatçılığı (Active Directory)',
    creditHours: 75,
    credits: 6,
    instructor: 'Babayev Elşən',
    syllabusTopics: '1. Windows Server quraşdırılması\n2. Active Directory Domain Services (AD DS)\n3. Group Policy Objects (GPO)\n4. DNS və DHCP server rollarının təyini',
    description: 'Korporativ şəbəkələrdə istifadəçi və resursların mərkəzləşdirilmiş idarəsi.',
  },

  // --- Mehmanxana və restoran işinin təşkili və idarə edilməsi ---
  {
    id: 'mod-mri-101',
    specialtyName: 'Mehmanxana və restoran işinin təşkili və idarə edilməsi',
    semester: 'I Semestr',
    code: 'MRİ-101',
    name: 'Qonaqpərvərlik Sənayesinə Giriş',
    creditHours: 60,
    credits: 5,
    instructor: 'Hüseynova Aytən',
    syllabusTopics: '1. Qonaqpərvərlik sənayesinin strukturu\n2. Mehmanxana təsnifatı və kateqoriyalar\n3. Qonaq qarşılama və qeydiyyat standartları\n4. Peşəkar etika və ünsiyyət',
    description: 'Turizm və mehmanxana sektorunun təşkili prinsipləri.',
  },
  {
    id: 'mod-mri-201',
    specialtyName: 'Mehmanxana və restoran işinin təşkili və idarə edilməsi',
    semester: 'II Semestr',
    code: 'MRİ-201',
    name: 'Qida və İçki Xidmətinin Təşkili (F&B)',
    creditHours: 60,
    credits: 5,
    instructor: 'Hüseynova Aytən',
    syllabusTopics: '1. Restoran xidmət növləri və masa düzülüşü\n2. Menyu tərtibatı prinsipləri\n3. Qida təhlükəsizliyi və HACCP standartları\n4. Müştəri məmnuniyyətinin idarəsi',
    description: 'Restoran təsərrüfatı və qida servisinin beynəlxalq standartlarla idarəsi.',
  },

  // --- Mühasibat uçotu ---
  {
    id: 'mod-mu-101',
    specialtyName: 'Mühasibat uçotu',
    semester: 'I Semestr',
    code: 'MU-101',
    name: 'Mühasibat Uçotunun Nəzəri Əsasları',
    creditHours: 60,
    credits: 5,
    instructor: 'Nəzərov Vüsal',
    syllabusTopics: '1. Mühasibat uçotunun predmeti və metodu\n2. Mühasibat balansı və hesablar planı\n3. İkili yazılış sistemi\n4. İlkin uçot sənədlərinin tərtibi',
    description: 'Mühasibat uçotunun əsas prinsipləri və ikili yazılış sistemi.',
  },
  {
    id: 'mod-mu-201',
    specialtyName: 'Mühasibat uçotu',
    semester: 'II Semestr',
    code: 'MU-201',
    name: 'Maliyyə Uçotu və 1C Proqramı',
    creditHours: 75,
    credits: 6,
    instructor: 'Nəzərov Vüsal',
    syllabusTopics: '1. Əsas vəsaitlərin və materialların uçotu\n2. Əməkhaqqı və sosial ayırmaların hesablanması\n3. 1C: Mühasibatlıq proqramında əməliyyatların aparılması\n4. Vergi bəyannamələrinin formalaşdırılması',
    description: 'Maliyyə əməliyyatlarının uçotu və 1C sistemində praktiki tətbiq.',
  },
];

export const ROOMS_LIST = ['Lab-1', 'Lab-2', 'Lab-3', 'Lab-4', 'Mühazirə-101', 'Mühazirə-204'];

export const SUBJECTS_LIST: string[] = Array.from(
  new Set(INITIAL_SPECIALTY_MODULES.map((m) => m.name))
);

