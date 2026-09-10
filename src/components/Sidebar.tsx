import React from 'react';
import {
  LayoutDashboard,
  Users,
  Grid,
  GraduationCap,
  BookOpen,
  BookMarked,
  Award,
  CheckSquare,
  FileText,
  Ticket,
  DoorClosed,
  BarChart3,
  UserCheck,
  Settings,
  LogOut,
  Plus,
  Shield,
  ShieldCheck,
  Globe,
  X,
  User
} from 'lucide-react';
import { ActiveTab, AdminPermissions, AdminUser } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenNewStudentModal: () => void;
  currentUser: AdminUser;
  permissions: AdminPermissions;
  onLogout: () => void;
  onNavigateToPublic: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenNewStudentModal,
  currentUser,
  permissions,
  onLogout,
  onNavigateToPublic,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';

  const allMenuItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard, requiredPerm: null },
    { id: 'students', label: 'Tələbələr', icon: Users, requiredPerm: 'canManageStudents' as const },
    { id: 'groups', label: 'Qruplar', icon: Grid, requiredPerm: null },
    { id: 'specialties', label: 'İxtisaslar', icon: GraduationCap, requiredPerm: null },
    { id: 'subjects', label: 'Fənlər', icon: BookOpen, requiredPerm: null },
    { id: 'journal', label: 'Jurnal', icon: BookMarked, requiredPerm: 'canAccessJournal' as const },
    { id: 'grades', label: 'Qiymətlər', icon: Award, requiredPerm: 'canManageGrades' as const },
    { id: 'attendance', label: 'Davamiyyət', icon: CheckSquare, requiredPerm: null },
    { id: 'exams', label: 'İmtahanlar', icon: FileText, requiredPerm: 'canManageExams' as const },
    { id: 'tickets', label: 'Biletlər', icon: Ticket, requiredPerm: 'canAccessTickets' as const },
    { id: 'rooms', label: 'Otaqlar', icon: DoorClosed, requiredPerm: 'canAccessRooms' as const },
    { id: 'reports', label: 'Hesabatlar', icon: BarChart3, requiredPerm: 'canViewReports' as const },
    { id: 'users', label: 'Səlahiyyətlər', icon: UserCheck, superAdminOnly: true },
    { id: 'settings', label: 'Ayarlar', icon: Settings, requiredPerm: null },
  ];

  // Filter items based on role & permissions
  const visibleMenuItems = allMenuItems.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.superAdminOnly) return false;
    if (item.requiredPerm && !permissions[item.requiredPerm]) return false;
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-[#e2e8f0] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#f1f5f9]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#5300b7] flex items-center justify-center text-white shadow-sm shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#5300b7] leading-tight">Admin Paneli</h2>
                <p className="text-[11px] text-[#64748b]">E-LDPTM İdarəetmə</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current User Badge */}
          <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isSuperAdmin
                    ? 'bg-purple-100 text-[#5300b7]'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isSuperAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.username}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isSuperAdmin ? 'Baş İdarəçi' : 'Köməkçi İnzibatçı'}
                </div>
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isSuperAdmin
                  ? 'bg-purple-100 text-[#5300b7]'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isSuperAdmin ? 'Super' : 'Admin'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#5300b7] text-white shadow-[0_2px_8px_rgba(83,0,183,0.25)]'
                    : 'text-[#4a4455] hover:bg-[#eff4ff] hover:text-[#5300b7] hover:translate-x-0.5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-[#64748b]'
                  }`}
                />
                <span>{item.label}</span>
                {item.id === 'users' && (
                  <span className="ml-auto text-[9px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-md font-bold uppercase">
                    Root
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#e2e8f0] space-y-2 bg-[#fcfdff]">
          {(isSuperAdmin || permissions.canManageStudents) && (
            <button
              id="sidebar-new-student-btn"
              onClick={onOpenNewStudentModal}
              className="w-full py-2.5 px-4 bg-[#5300b7] hover:bg-[#430094] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Tələbə Əlavə Et</span>
            </button>
          )}

          {/* Return to Public Site */}
          <button
            id="sidebar-to-public-btn"
            onClick={onNavigateToPublic}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#5300b7] hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#5300b7]" />
            <span>Əsas Sayta Keçid (/)</span>
          </button>

          {/* Logout */}
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Çıxış Et (Sessiyanı Bitir)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
