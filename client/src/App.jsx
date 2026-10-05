import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroVideo from './components/HeroVideo';
import SearchSection from './components/SearchSection';
import CourseCard from './components/CourseCard';
import CourseDetailsModal from './components/CourseDetailsModal';
import CategoriesSection from './components/CategoriesSection';
import ProvidersDirectory from './components/ProvidersDirectory';
import ProviderDashboard from './components/ProviderDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import ContactSection from './components/ContactSection';
import AboutSection from './components/AboutSection';
import NotificationsPage from './components/NotificationsPage';
import UserDashboard from './components/UserDashboard';
import Footer from './components/Footer';

import { 
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Search, BookOpen, 
  Users, Building2, Layers, Heart, X, AlertCircle 
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('papar_lang') || 'bm');
  const [token, setToken] = useState(() => localStorage.getItem('papar_token') || '');
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');

  const [courses, setCourses] = useState([]);
  const [providers, setProviders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [savedCourseIds, setSavedCourseIds] = useState(new Set());
  const [registeredCourseIds, setRegisteredCourseIds] = useState(new Set());

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const isBm = lang === 'bm';

  // Persist language
  useEffect(() => {
    localStorage.setItem('papar_lang', lang);
  }, [lang]);

  // Initial Authentication Check
  useEffect(() => {
    if (token) {
      fetchUserMe();
    }
  }, [token]);

  // Fetch Public Data
  useEffect(() => {
    fetchCourses();
    fetchProviders();
    fetchNotifications();
  }, [token]);

  const fetchUserMe = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCourses = async (filters = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/courses?${query}`, { headers });
      const data = await res.json();

      if (res.ok) {
        const fetched = data.courses || [];
        setCourses(fetched);

        const savedSet = new Set(fetched.filter(c => c.is_saved).map(c => c.id));
        const regSet = new Set(fetched.filter(c => c.is_registered).map(c => c.id));
        setSavedCourseIds(savedSet);
        setRegisteredCourseIds(regSet);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      if (res.ok) setProviders(data.providers || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/notifications', { headers });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('papar_token', newToken);
    setToken(newToken);
    setUser(newUser);
    showToast(isBm ? `Selamat datang, ${newUser.full_name}!` : `Welcome, ${newUser.full_name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('papar_token');
    setToken('');
    setUser(null);
    setCurrentView('home');
    showToast(isBm ? 'Anda telah log keluar.' : 'You have logged out.');
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  };

  const handleCourseRegistration = async (courseId) => {
    if (!token) {
      setCurrentView('login');
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message);
        fetchCourses();
        fetchNotifications();
      } else {
        showToast(data.message);
      }
    } catch (e) {
      showToast(isBm ? 'Ralat pendaftaran.' : 'Registration error.');
    }
  };

  const handleSaveCourse = async (courseId) => {
    if (!token) {
      setCurrentView('login');
      return;
    }

    const isCurrentlySaved = savedCourseIds.has(courseId);
    const method = isCurrentlySaved ? 'DELETE' : 'POST';

    try {
      const res = await fetch(`/api/courses/${courseId}/save`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        fetchCourses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotificationRead = async (notifId) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Toast Floating Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Sticky Navigation Bar */}
      {currentView !== 'admin-dashboard' && (
        <Navbar
          lang={lang}
          setLang={setLang}
          user={user}
          onLogout={handleLogout}
          navigate={setCurrentView}
          currentView={currentView}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkNotificationRead={handleMarkNotificationRead}
          onOpenSearch={() => setShowSearchModal(true)}
        />
      )}

      {/* VIEW ROUTING */}
      <div className="flex-1">

        {/* 1. HOMEPAGE VIEW */}
        {currentView === 'home' && (
          <div>
            {/* HERO SECTION WITH DYNAMIC VIDEO BACKGROUND */}
            <section className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center text-white overflow-hidden py-24">
              <HeroVideo />

              <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
                
                {/* Papar Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-amber-400 text-xs font-bold backdrop-blur-md">
                  <Sparkles size={16} />
                  <span>{isBm ? 'Portal Pembelajaran & Kemahiran Daerah Papar, Sabah' : 'Papar Sabah Community Education Portal'}</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white drop-shadow-lg">
                  {isBm ? 'Terokai. Belajar. Berkembang.' : 'Discover. Learn. Grow.'}
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow">
                  {isBm
                    ? 'Temui kursus pendek dan peluang latihan kemahiran di sekitar Papar.'
                    : 'Discover short courses and skills training opportunities around Papar.'}
                </p>

                {/* Hero CTA Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      const el = document.getElementById('featured-courses-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else setCurrentView('courses');
                    }}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-sky-500/30 hover:scale-105 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{isBm ? 'Terokai Kursus' : 'Explore Courses'}</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => {
                      if (user?.role === 'provider') setCurrentView('provider-dashboard');
                      else setCurrentView('signup');
                    }}
                    className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-sm rounded-2xl backdrop-blur-md border border-slate-700 hover:scale-105 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Building2 size={18} />
                    <span>{isBm ? 'Jadi Penyedia Latihan' : 'Become a Training Provider'}</span>
                  </button>
                </div>

              </div>
            </section>

            {/* SEARCH SECTION DIRECTLY BELOW HERO */}
            <SearchSection
              lang={lang}
              onSearch={(filters) => {
                fetchCourses(filters);
                const el = document.getElementById('featured-courses-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              providers={providers}
            />

            {/* FEATURED COURSES SECTION */}
            <section id="featured-courses-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    {isBm ? 'Kursus Pilihan' : 'Featured Courses'}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
                    {isBm ? 'Kursus Pilihan Komuniti' : 'Featured Community Courses'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {isBm ? 'Pilihan kursus kemahiran terkini yang ditawarkan di sekitar Papar' : 'Top featured short courses offered around Papar'}
                  </p>
                </div>

                <button
                  onClick={() => setCurrentView('courses')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition flex items-center gap-2"
                >
                  <span>{isBm ? 'Lihat Semua Kursus' : 'View All Courses'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {loading ? (
                <div className="p-16 text-center text-slate-400 font-bold text-sm">
                  {isBm ? 'Memuatkan kursus...' : 'Loading courses...'}
                </div>
              ) : courses.length === 0 ? (
                <div className="p-16 bg-white rounded-3xl text-center border border-slate-100">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-base font-bold text-slate-700">
                    {isBm ? 'Tiada kursus dijumpai padanan carian.' : 'No courses found matching criteria.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.slice(0, 6).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      lang={lang}
                      onSelect={(c) => setSelectedCourse(c)}
                      onSave={handleSaveCourse}
                      isSaved={savedCourseIds.has(course.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* VISUAL CATEGORIES GRID */}
            <CategoriesSection
              lang={lang}
              onSelectCategory={(catName) => {
                fetchCourses({ category: catName });
                setCurrentView('courses');
              }}
            />

            {/* ABOUT PAPAR.EDU & WHY PAPAR.EDU */}
            <AboutSection lang={lang} navigate={setCurrentView} />

            {/* CONTACT ADMIN SECTION */}
            <ContactSection lang={lang} user={user} />
          </div>
        )}

        {/* 2. COURSES CATALOG VIEW */}
        {currentView === 'courses' && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <span className="px-3.5 py-1.5 bg-sky-100 text-sky-800 rounded-full text-xs font-bold uppercase tracking-wider">
                {isBm ? 'Katalog Kemahiran' : 'Skills Catalog'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
                {isBm ? 'Semua Kursus Pendek Papar' : 'All Short Courses in Papar'}
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                {isBm ? 'Cari dan daftar pelbagai kursus kemahiran, bengkel, dan program komuniti.' : 'Browse and register for various skills courses, workshops, and community programs.'}
              </p>
            </div>

            <SearchSection
              lang={lang}
              onSearch={(filters) => fetchCourses(filters)}
              providers={providers}
            />

            <div className="mt-12">
              {loading ? (
                <div className="p-16 text-center text-slate-400 font-bold text-sm">
                  {isBm ? 'Memuatkan kursus...' : 'Loading courses...'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      lang={lang}
                      onSelect={(c) => setSelectedCourse(c)}
                      onSave={handleSaveCourse}
                      isSaved={savedCourseIds.has(course.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. CATEGORIES PAGE */}
        {currentView === 'categories' && (
          <div className="py-12">
            <CategoriesSection
              lang={lang}
              onSelectCategory={(catName) => {
                fetchCourses({ category: catName });
                setCurrentView('courses');
              }}
            />
          </div>
        )}

        {/* 4. TRAINING PROVIDERS DIRECTORY */}
        {currentView === 'providers' && (
          <ProvidersDirectory
            providers={providers}
            lang={lang}
            onSelectCourse={(c) => setSelectedCourse(c)}
            onSaveCourse={handleSaveCourse}
            savedCourseIds={savedCourseIds}
          />
        )}

        {/* 5. ABOUT US PAGE */}
        {currentView === 'about' && (
          <div className="py-12">
            <AboutSection lang={lang} navigate={setCurrentView} />
          </div>
        )}

        {/* 6. CONTACT PAGE */}
        {currentView === 'contact' && (
          <div className="py-12">
            <ContactSection lang={lang} user={user} />
          </div>
        )}

        {/* 7. AUTHENTICATION PAGES (LOGIN / SIGNUP) */}
        {(currentView === 'login' || currentView === 'signup') && (
          <AuthModal
            initialMode={currentView}
            lang={lang}
            onAuthSuccess={handleAuthSuccess}
            navigate={setCurrentView}
          />
        )}

        {/* 8. PROVIDER DASHBOARD */}
        {currentView === 'provider-dashboard' && (
          <ProviderDashboard
            token={token}
            user={user}
            lang={lang}
            onLogout={handleLogout}
            navigate={setCurrentView}
            onSelectCourse={(c) => setSelectedCourse(c)}
          />
        )}

        {/* 9. ADMIN DASHBOARD */}
        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            token={token}
            lang={lang}
            onLogout={handleLogout}
            navigate={setCurrentView}
          />
        )}

        {/* 10. USER DASHBOARD (REGISTERED & SAVED COURSES) */}
        {(currentView === 'my-registrations' || currentView === 'saved-courses') && (
          <UserDashboard
            token={token}
            user={user}
            lang={lang}
            onSelectCourse={(c) => setSelectedCourse(c)}
            navigate={setCurrentView}
          />
        )}

        {/* 11. NOTIFICATIONS PAGE */}
        {currentView === 'notifications' && (
          <NotificationsPage
            notifications={notifications}
            lang={lang}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllNotificationsRead}
            navigate={setCurrentView}
          />
        )}

      </div>

      {/* COURSE DETAILS MODAL */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          lang={lang}
          onClose={() => setSelectedCourse(null)}
          onRegister={handleCourseRegistration}
          onSave={handleSaveCourse}
          isRegistered={registeredCourseIds.has(selectedCourse.id)}
          isSaved={savedCourseIds.has(selectedCourse.id)}
          user={user}
        />
      )}

      {/* GLOBAL SEARCH MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-start justify-center p-4 pt-20">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 w-full max-w-2xl shadow-2xl relative">
            <button
              onClick={() => setShowSearchModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Search size={18} className="text-sky-600" />
              {isBm ? 'Cari Kursus Papar.Edu' : 'Search Papar.Edu Courses'}
            </h3>

            <SearchSection
              lang={lang}
              onSearch={(filters) => {
                fetchCourses(filters);
                setShowSearchModal(false);
                setCurrentView('courses');
              }}
              providers={providers}
            />
          </div>
        </div>
      )}

      {/* FOOTER */}
      {currentView !== 'admin-dashboard' && (
        <Footer lang={lang} navigate={setCurrentView} />
      )}

    </div>
  );
}
