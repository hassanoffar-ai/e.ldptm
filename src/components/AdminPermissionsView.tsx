import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  User,
  KeyRound,
  CheckCircle2,
  Lock,
  Settings,
  Users,
  AlertTriangle,
  Save,
  Check
} from 'lucide-react';
import { AdminPermissions, AdminUser } from '../types';
import {
  AccountCredentials,
  getStoredAccounts,
  saveStoredAccounts,
  getStoredPermissions,
  saveStoredPermissions
} from '../data/auth';

interface AdminPermissionsViewProps {
  currentUser: AdminUser;
}

export const AdminPermissionsView: React.FC<AdminPermissionsViewProps> = ({
  currentUser,
}) => {
  const [accounts, setAccounts] = useState<AccountCredentials[]>(getStoredAccounts);
  const [permissions, setPermissions] = useState<AdminPermissions>(getStoredPermissions);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password edit states
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTogglePermission = (key: keyof AdminPermissions) => {
    if (currentUser.role !== 'super_admin') {
      alert('Yalnız Super Admin icazələri dəyişə bilər!');
      return;
    }

    const updated = {
      ...permissions,
      [key]: !permissions[key],
    };
    setPermissions(updated);
    saveStoredPermissions(updated);
    showToast('İcazə tənzimləməsi yadda saxlanıldı.');
  };

  const handleUpdatePassword = (targetRole: 'super_admin' | 'admin', newPass: string) => {
    if (!newPass.trim()) return;
    const updatedAccounts = accounts.map((acc) =>
      acc.role === targetRole ? { ...acc, passwordHash: newPass.trim() } : acc
    );
    setAccounts(updatedAccounts);
    saveStoredAccounts(updatedAccounts);
    if (targetRole === 'super_admin') {
      setSuperAdminPassword('');
      showToast('Super Admin şifrəsi uğurla yeniləndi.');
    } else {
      setAdminPassword('');
      showToast('Admin şifrəsi uğurla yeniləndi.');
    }
  };

  return (
    <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#121c2a] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-bounce duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#5300b7]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#121c2a]">
            İstifadəçilər və Səlahiyyət İdarəetməsi
          </h2>
        </div>
        <p className="text-sm text-[#64748b]">
          Super Admin və Admin hesablarının idarə olunması, şifrələrin və icazələrin təyini
        </p>
      </div>

      {/* Super Admin Status Banner */}
      <div className="bg-gradient-to-r from-[#5300b7] via-[#6d28d9] to-[#7c3aed] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>SUPER ADMIN TƏHLÜKƏSİZLİK MƏRKƏZİ</span>
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Mütləq Səlahiyyət Rejimi
            </h3>
            <p className="text-white/80 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              Bütün admin icazələri və sistem giriş şifrələri yalnız Super Admin tərəfindən tənzimlənir.
              Admin hesabı verilən icazələr çərçivəsində fəaliyyət göstərir.
            </p>
          </div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-mono">
            Aktiv Hesab: <strong className="text-white">{currentUser.username} ({currentUser.role})</strong>
          </div>
        </div>
      </div>

      {/* Two Accounts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account 1: Super Admin */}
        <div className="bg-white p-6 rounded-2xl border-2 border-purple-300 shadow-sm relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#5300b7] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#121c2a]">
                  Baş Administrator
                </h4>
                <span className="text-xs text-[#64748b] font-mono">
                  superadmin
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-[#5300b7] rounded-full text-xs font-bold uppercase tracking-wider">
              Super Admin
            </span>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Səlahiyyət dərəcəsi:</span>
              <strong className="text-purple-700">100% (Məhdudiyyətsiz)</strong>
            </div>
            <div className="flex justify-between">
              <span>İcazələri dəyişmə hüququ:</span>
              <strong className="text-emerald-600 font-bold">Bəli (Yalnız Super Admin)</strong>
            </div>
            <div className="flex justify-between">
              <span>Cari Şifrə:</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                {accounts.find((a) => a.role === 'super_admin')?.passwordHash}
              </span>
            </div>
          </div>

          {/* Change Super Admin Password */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Super Admin Şifrəsini Yenilə
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Yeni güclü şifrə..."
                value={superAdminPassword}
                onChange={(e) => setSuperAdminPassword(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5300b7]"
              />
              <button
                type="button"
                onClick={() => handleUpdatePassword('super_admin', superAdminPassword)}
                className="px-3.5 py-2 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Yenilə
              </button>
            </div>
          </div>
        </div>

        {/* Account 2: Admin */}
        <div className="bg-white p-6 rounded-2xl border border-[#ccc3d7] shadow-sm relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#121c2a]">
                  Köməkçi İnzibatçı
                </h4>
                <span className="text-xs text-[#64748b] font-mono">
                  admin
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
              Admin
            </span>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Səlahiyyət dərəcəsi:</span>
              <strong className="text-blue-700">Super Admin tərəfindən təyin edilir</strong>
            </div>
            <div className="flex justify-between">
              <span>İcazələri dəyişmə hüququ:</span>
              <strong className="text-rose-600 font-medium">Yoxdur</strong>
            </div>
            <div className="flex justify-between">
              <span>Cari Şifrə:</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                {accounts.find((a) => a.role === 'admin')?.passwordHash}
              </span>
            </div>
          </div>

          {/* Change Admin Password */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Şifrəsini Yenilə
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Yeni şifrə..."
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => handleUpdatePassword('admin', adminPassword)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Yenilə
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Matrix for Regular Admin */}
      <div className="bg-white rounded-2xl border border-[#ccc3d7] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-base font-bold text-[#121c2a]">
              Admin Hesabı üçün İcazələr Matrisi
            </h3>
            <p className="text-xs text-[#64748b]">
              Super Admin bu icazələri yandıraraq və ya söndürərək Adminin paneldə nələri edə biləcəyini müəyyənləşdirir
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-purple-50 text-[#5300b7] border border-purple-200 rounded-full font-semibold">
            Yalnız Super Admin tərəfindən redaktə edilir
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Permission 1: Students */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Tələbələri İdarəetmə
              </h4>
              <p className="text-xs text-slate-500">
                Yeni tələbə qeydiyyatdan keçirmək və bazadan silmək hüququ
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canManageStudents')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canManageStudents ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canManageStudents ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 2: Exams */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                İmtahan Protokollarını İdarəetmə
              </h4>
              <p className="text-xs text-slate-500">
                Yeni imtahan protokolu yaratmaq, silmək və biletləri paylamaq hüququ
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canManageExams')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canManageExams ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canManageExams ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 3: Grades */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Qiymət Daxiletmə və Dərc Etmə
              </h4>
              <p className="text-xs text-slate-500">
                Seminar, laboratoriya və kollokvium ballarını daxil etmək və dərc etmək
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canManageGrades')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canManageGrades ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canManageGrades ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 4: Journal */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Jurnal və Fənn Qeydiyyatı
              </h4>
              <p className="text-xs text-slate-500">
                Fənn jurnallarının açılması və semestr jurnallarına giriş
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canAccessJournal')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canAccessJournal ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canAccessJournal ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 5: Groups */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Qrupların İdarə Edilməsi
              </h4>
              <p className="text-xs text-slate-500">
                Akademik qrupların siyahısı və qrup tələbələrinin idarəsi
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canManageGroups')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canManageGroups ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canManageGroups ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 6: Specialties */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                İxtisasların İdarə Edilməsi
              </h4>
              <p className="text-xs text-slate-500">
                YTP tədris ixtisasları və plan göstəriciləri
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canManageSpecialties')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canManageSpecialties ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canManageSpecialties ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 7: Subjects */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Fənlər Bazası
              </h4>
              <p className="text-xs text-slate-500">
                Tədris fənlərinin kataloqu və fənn kodları
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canManageSubjects')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canManageSubjects ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canManageSubjects ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 8: Attendance */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Davamiyyət Monitorinqi
              </h4>
              <p className="text-xs text-slate-500">
                Qayıb limitləri və dərsdə iştirak cədvəllərinin idarəsi
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canManageAttendance')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canManageAttendance ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canManageAttendance ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 9: Tickets */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Zal Biletləri Kiosku
              </h4>
              <p className="text-xs text-slate-500">
                Admin paneldə zal bilet kioskunun açılması və çap edilməsi
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canAccessTickets')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canAccessTickets ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canAccessTickets ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 10: Rooms */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Otaqlar və Laboratoriyalar
              </h4>
              <p className="text-xs text-slate-500">
                Kompüter otaqlarının vəziyyətini və tutumunu izləmək
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canAccessRooms')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canAccessRooms ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canAccessRooms ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Permission 11: Reports */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Hesabatlar və Analitika
              </h4>
              <p className="text-xs text-slate-500">
                Statistika, semestr analitikası və hesabatlara giriş
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePermission('canViewReports')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                permissions.canViewReports ? 'bg-[#5300b7]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  permissions.canViewReports ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
