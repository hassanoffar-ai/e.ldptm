import React, { useState } from 'react';
import { Search, Bell, Menu, Monitor, Globe, LogOut, CheckCircle2, AlertCircle, Clock, ShieldCheck, User } from 'lucide-react';
import { ActiveTab, AdminUser } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: AdminUser;
  onLogout: () => void;
  onNavigateToPublic: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onNavigateToPublic,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const isSuperAdmin = currentUser.role === 'super_admin';

  const notifications: Array<{
    id: number;
    title: string;
    desc: string;
    time: string;
    type: string;
  }> = [];

  const initials = currentUser.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : currentUser.username.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 w-full flex justify-between items-center px-4 md:px-8 h-16 bg-[#f8f9ff]/90 backdrop-blur-md z-40 border-b border-[#e2e8f0] no-print">
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          id="mobile-sidebar-toggle"
          onClick={onToggleSidebar}
          className="p-2 text-[#4a4455] hover:bg-[#eff4ff] rounded-full transition-colors cursor-pointer"
          aria-label="Menyu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-[#5300b7]">E-LDPTM Admin</h1>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7486]" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Tələbə, imtahan və ya fənn axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#eff4ff]/60 border border-transparent rounded-full text-xs text-[#121c2a] placeholder-[#7b7486] focus:bg-white focus:border-[#5300b7] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Switch to Public Site Button */}
        <button
          onClick={onNavigateToPublic}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#5300b7] border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          title="Prodakşn / Tələbə Saytına Bax"
        >
          <Globe className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden sm:inline">Əsas Sayt</span>
        </button>

        {/* Quick Kiosk switch */}
        <button
          onClick={() => setActiveTab('tickets')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-[#5300b7] text-xs font-semibold border border-purple-200 transition-colors cursor-pointer"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Kiosk Rejimi</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#4a4455] hover:bg-[#eff4ff] rounded-full transition-colors relative cursor-pointer"
            aria-label="Bildirişlər"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-[#f8f9ff]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800">Bildirişlər ({notifications.length})</span>
              </div>
              <div className="py-6 text-center text-xs text-slate-400">
                Heç bir yeni bildiriş yoxdur
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#e2e8f0]">
          <div
            className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${
              isSuperAdmin ? 'bg-[#5300b7]' : 'bg-blue-600'
            }`}
          >
            {initials}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-[#121c2a] leading-tight">
              {currentUser.username}
            </div>
            <div className="text-[10px] font-semibold text-purple-700">
              {isSuperAdmin ? 'Super Administrator' : 'Köməkçi Admin'}
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sessiyanı Bitir və Çıxış Et"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
