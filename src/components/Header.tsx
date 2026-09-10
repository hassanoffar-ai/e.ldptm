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

  const notifications = [
    {
      id: 1,
      title: 'İmtahan Protokolu təsdiqləndi',
      desc: 'İT-21 qrupu üzrə Veb Proqramlaşdırma protokolu hazırdır.',
      time: '10 dəq əvvəl',
      type: 'success',
    },
    {
      id: 2,
      title: 'Qiymətlər dərc edildi',
      desc: 'IT-201 qrupunun aralıq balları tələbə kabinetinə göndərildi.',
      time: '45 dəq əvvəl',
      type: 'info',
    },
    {
      id: 3,
      title: 'Zal Biletləri generasiya olundu',
      desc: 'Lab-4 üçün 24 ədəd bilet nömrəsi təyin edildi.',
      time: '2 saat əvvəl',
      type: 'warning',
    },
  ];

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

      {/* Desktop Search */}
      <div className="hidden md:flex items-center bg-[#eff4ff] rounded-full px-4 py-2 border border-[#d9e3f6] w-96 focus-within:border-[#6d28d9] focus-within:ring-2 focus-within:ring-[#6d28d9]/20 transition-all">
        <Search className="w-4 h-4 text-[#7b7486] mr-2.5 shrink-0" />
        <input
          id="global-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-[#121c2a] w-full placeholder:text-[#7b7486]"
          placeholder="Axtarış (Tələbə, Qrup, Fənn, Bilet)..."
          type="text"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Kiosk Mode Quick Switcher */}
        <button
          id="header-kiosk-mode-btn"
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            activeTab === 'tickets'
              ? 'bg-[#6d28d9] text-white border-[#6d28d9] shadow-sm'
              : 'bg-white text-[#5300b7] border-[#d9e3f6] hover:bg-[#eff4ff]'
          }`}
          title="Tələbə İmtahan Zalı Ekranını açın"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">İmtahan Zalı Ekranı</span>
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
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border-2 border-[#f8f9ff]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800">Bildirişlər (3)</span>
                <span className="text-[11px] text-purple-600 cursor-pointer hover:underline">
                  Hamısını oxunmuş et
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
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
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#e2e8f0]">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#ccc3d7] shrink-0 bg-slate-200">
            <img
              alt="İstifadəçi profili"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-[#121c2a]">Əliyev Həsən</div>
            <div className="text-[11px] text-[#64748b]">Nəzarətçi / Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
