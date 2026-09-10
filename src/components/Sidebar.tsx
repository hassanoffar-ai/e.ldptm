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
  X
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenNewStudentModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenNewStudentModal,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'students', label: 'Tələbələr', icon: Users },
    { id: 'groups', label: 'Qruplar', icon: Grid },
    { id: 'specialties', label: 'İxtisaslar', icon: GraduationCap },
    { id: 'subjects', label: 'Fənlər', icon: BookOpen },
    { id: 'journal', label: 'Jurnal', icon: BookMarked },
    { id: 'grades', label: 'Qiymətlər', icon: Award },
    { id: 'attendance', label: 'Davamiyyət', icon: CheckSquare },
    { id: 'exams', label: 'İmtahanlar', icon: FileText },
    { id: 'tickets', label: 'Biletlər', icon: Ticket },
    { id: 'rooms', label: 'Otaqlar', icon: DoorClosed },
    { id: 'reports', label: 'Hesabatlar', icon: BarChart3 },
    { id: 'users', label: 'İstifadəçilər', icon: UserCheck },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

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
        <div className="p-4 border-b border-[#f1f5f9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6d28d9] flex items-center justify-center text-white shadow-sm shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#5300b7] leading-tight">Admin Paneli</h2>
              <p className="text-xs text-[#64748b]">E-LDPTM İdarəetmə</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {menuItems.map((item) => {
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
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#6d28d9] text-white shadow-[0_2px_8px_rgba(109,40,217,0.25)] font-semibold'
                    : 'text-[#4a4455] hover:bg-[#eff4ff] hover:text-[#5300b7] hover:translate-x-0.5'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-[#64748b]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#e2e8f0] space-y-2 bg-[#fcfdff]">
          <button
            id="sidebar-new-student-btn"
            onClick={onOpenNewStudentModal}
            className="w-full py-2.5 px-4 bg-[#6d28d9] hover:bg-[#581c87] text-white rounded-xl text-sm font-medium transition-all shadow-[0_2px_6px_rgba(109,40,217,0.2)] flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Tələbə</span>
          </button>

          <button
            id="sidebar-logout-btn"
            onClick={() => {
              setActiveTab('tickets');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-[#64748b] hover:bg-[#fee2e2] hover:text-[#b91c1c] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>İmtahan Zalına Keçid / Çıxış</span>
          </button>
        </div>
      </aside>
    </>
  );
};
