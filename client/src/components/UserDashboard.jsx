import React, { useState, useEffect } from 'react';
import { BookOpen, Bookmark, User, Calendar, MapPin, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import CourseCard from './CourseCard';

export default function UserDashboard({ token, user, lang, onSelectCourse, navigate }) {
  const [activeTab, setActiveTab] = useState('registered');
  const [registrations, setRegistrations] = useState([]);
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const isBm = lang === 'bm';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [rRes, sRes] = await Promise.all([
        fetch('/api/user/registrations', { headers }),
        fetch('/api/user/saved', { headers })
      ]);

      if (rRes.ok) setRegistrations((await rRes.json()).registrations || []);
      if (sRes.ok) setSavedCourses((await sRes.json()).saved_courses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (courseId) => {
    if (!window.confirm(isBm ? 'Adakah anda pasti mahu membatalkan pendaftaran kursus ini?' : 'Are you sure you want to cancel this registration?')) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/register`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchUserData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveSaved = async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/save`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchUserData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0">
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">{user?.full_name}</h1>
            <span className="px-3 py-0.5 bg-sky-100 text-sky-800 rounded-full text-xs font-bold uppercase">
              {isBm ? 'Komuniti / Pelajar' : 'Student / Community'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1">✉️ {user?.email} • 📞 {user?.phone || 'Papar, Sabah'}</p>

          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start text-xs font-semibold text-slate-600">
            <span className="px-3 py-1 bg-slate-100 rounded-xl">
              📚 {registrations.length} {isBm ? 'Kursus Berdaftar' : 'Registered'}
            </span>
            <span className="px-3 py-1 bg-slate-100 rounded-xl">
              🔖 {savedCourses.length} {isBm ? 'Kursus Tersimpan' : 'Saved'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('registered')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 ${
            activeTab === 'registered'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <BookOpen size={18} />
          <span>{isBm ? 'Kursus Berdaftar Saya' : 'My Registrations'}</span>
          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-xs rounded-full">{registrations.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 ${
            activeTab === 'saved'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Bookmark size={18} />
          <span>{isBm ? 'Kursus Tersimpan' : 'Saved Courses'}</span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">{savedCourses.length}</span>
        </button>
      </div>

      {/* TAB 1: REGISTERED COURSES */}
      {activeTab === 'registered' && (
        <div>
          {registrations.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 space-y-3">
              <BookOpen size={48} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">{isBm ? 'Anda belum mendaftar sebarang kursus.' : 'You have not registered for any courses yet.'}</p>
              <button
                onClick={() => navigate('courses')}
                className="px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isBm ? 'Terokai Kursus Sekarang' : 'Explore Courses Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registrations.map((reg) => (
                <div key={reg.reg_id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> {isBm ? 'Pendaftaran Sah' : 'Confirmed'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(reg.registered_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 line-clamp-1">{reg.title}</h3>
                    <p className="text-xs font-bold text-sky-600 mt-0.5">{reg.provider_name}</p>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{reg.course_date} ({reg.course_time || '09:00 AM'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="truncate">{reg.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onSelectCourse(reg)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <span>{isBm ? 'Lihat Details' : 'View Details'}</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => handleCancelRegistration(reg.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span>{isBm ? 'Batal' : 'Cancel'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED COURSES */}
      {activeTab === 'saved' && (
        <div>
          {savedCourses.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 space-y-3">
              <Bookmark size={48} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">{isBm ? 'Tiada kursus tersimpan.' : 'No saved courses.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCourses.map((c) => (
                <CourseCard
                  key={c.id}
                  course={c}
                  lang={lang}
                  onSelect={onSelectCourse}
                  onSave={handleRemoveSaved}
                  isSaved={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
