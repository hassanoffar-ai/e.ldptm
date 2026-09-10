import React, { useState } from 'react';
import { Search, Bell, Menu, Monitor, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications: Array<{
    id: number;
    title: string;
    desc: string;
    time: string;
    type: string;
  }> = [];

  return (
    <header className="sticky top-0 w-full flex justify-between items-center px-4 md:px-8 h-16 bg-[#f8f9ff]/90 backdrop-blur-md z-40 border-b border-[#e2e8f0] no-print">
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          id="mobile-sidebar-toggle"
          onClick={onToggleSidebar}
          className="p-2 text-[#4a4455] hover:bg-[#eff4ff] rounded-full transition-colors"
          aria-label="Menyu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-[#5300b7]">E-LDPTM</h1>
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
        {/* Quick Kiosk switch */}
        <button
          onClick={() => setActiveTab('tickets')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-[#5300b7] text-xs font-semibold border border-purple-200 transition-colors"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Kiosk Rejimi</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#4a4455] hover:bg-[#eff4ff] rounded-full transition-colors relative"
            aria-label="Bildirişlər"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border-2 border-[#f8f9ff]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800">Bildirişlər ({notifications.length})</span>
                {notifications.length > 0 && (
                  <span className="text-[11px] text-purple-600 cursor-pointer hover:underline">
                    Hamısını oxunmuş et
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Heç bir yeni bildiriş yoxdur
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50/50 transition-colors text-left text-xs"
                    >
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 mb-0.5">
                        {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {n.type === 'info' && <Clock className="w-3.5 h-3.5 text-purple-600" />}
                        {n.type === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                        {n.title}
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#e2e8f0]">
          <div className="w-9 h-9 rounded-full bg-[#5300b7] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            AD
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-[#121c2a]">Administrator</div>
            <div className="text-[11px] text-[#64748b]">Sistem İdarəçisi</div>
          </div>
        </div>
      </div>
    </header>
  );
};
