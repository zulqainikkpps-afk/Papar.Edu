import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, Bell, Search, Globe, User, LogOut, LayoutDashboard, 
  BookOpen, PlusCircle, CheckCircle, ChevronDown, Menu, X, Shield 
} from 'lucide-react';

export default function Navbar({ 
  lang, 
  setLang, 
  user, 
  onLogout, 
  navigate, 
  currentView, 
  notifications = [], 
  unreadCount = 0,
  onMarkNotificationRead,
  onOpenSearch
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const isBm = lang === 'bm';

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (viewName) => {
    navigate(viewName);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition transform">
              <GraduationCap size={26} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-sky-600 transition">
                  Papar<span className="text-sky-600">.Edu</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                  Sabah
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                {isBm ? 'Portal Kemahiran Komuniti Papar' : 'Papar Community Learning Portal'}
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'home', label: isBm ? 'Utama' : 'Home' },
              { id: 'courses', label: isBm ? 'Kursus' : 'Courses' },
              { id: 'categories', label: isBm ? 'Kategori' : 'Categories' },
              { id: 'providers', label: isBm ? 'Penyedia Latihan' : 'Training Providers' },
              { id: 'about', label: isBm ? 'Tentang Kami' : 'About Us' },
              { id: 'contact', label: isBm ? 'Contact' : 'Contact' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  currentView === link.id
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Trigger Icon */}
            <button
              onClick={onOpenSearch}
              title={isBm ? 'Cari Kursus' : 'Search Courses'}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition relative"
            >
              <Search size={20} />
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition relative"
                title={isBm ? 'Notifikasi' : 'Notifications'}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{isBm ? 'Notifikasi' : 'Notifications'}</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">
                          {unreadCount} {isBm ? 'baharu' : 'new'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('notifications');
                      }}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                    >
                      {isBm ? 'Lihat Semua' : 'View All'}
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        {isBm ? 'Tiada notifikasi baharu' : 'No new notifications'}
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationRead(n.id);
                            setShowNotifications(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex gap-3 ${
                            !n.is_read ? 'bg-sky-50/50' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                            n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                          }`}>
                            <CheckCircle size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Terkini'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 px-3 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('notifications');
                      }}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition"
                    >
                      {isBm ? 'Lihat Semua Notifikasi' : 'View All Notifications'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector BM | EN */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
              <button
                onClick={() => setLang('bm')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  lang === 'bm'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🇲🇾 BM
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  lang === 'en'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Auth Buttons or User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition border border-slate-200"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                    user.role === 'admin' ? 'bg-amber-600' : user.role === 'provider' ? 'bg-indigo-600' : 'bg-sky-600'
                  }`}>
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-slate-500" />
                </button>

                {/* User Avatar Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className={`mt-1.5 inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-amber-100 text-amber-800' 
                          : user.role === 'provider' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {user.role === 'admin' ? 'Pentadbir' : user.role === 'provider' ? 'Penyedia Latihan' : 'Komuniti / Pelajar'}
                      </span>
                    </div>

                    <div className="p-1 space-y-0.5">
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('admin-dashboard');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-50 flex items-center gap-2"
                        >
                          <Shield size={16} /> {isBm ? 'Panel Pentadbir' : 'Admin Panel'}
                        </button>
                      )}

                      {(user.role === 'provider' || user.role === 'admin') && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('provider-dashboard');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                        >
                          <LayoutDashboard size={16} /> {isBm ? 'Papan Pemuka Provider' : 'Provider Dashboard'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('my-registrations');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <BookOpen size={16} /> {isBm ? 'Kursus Berdaftar' : 'My Registrations'}
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('saved-courses');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User size={16} /> {isBm ? 'Kursus Tersimpan' : 'Saved Courses'}
                      </button>
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-100 p-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={16} /> {isBm ? 'Log Keluar' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('login')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  {isBm ? 'Log Masuk' : 'Login'}
                </button>
                <button
                  onClick={() => navigate('signup')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-500/20 transition"
                >
                  {isBm ? 'Daftar' : 'Sign Up'}
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-1">
            {[
              { id: 'home', label: isBm ? 'Utama' : 'Home' },
              { id: 'courses', label: isBm ? 'Kursus' : 'Courses' },
              { id: 'categories', label: isBm ? 'Kategori' : 'Categories' },
              { id: 'providers', label: isBm ? 'Penyedia Latihan' : 'Training Providers' },
              { id: 'about', label: isBm ? 'Tentang Kami' : 'About Us' },
              { id: 'contact', label: isBm ? 'Hubungi Kami' : 'Contact Us' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  currentView === link.id
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
