import React, { useState } from 'react';
import { Building2, ShieldCheck, MapPin, Phone, Mail, Globe, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import CourseCard from './CourseCard';

export default function ProvidersDirectory({ providers = [], lang, onSelectCourse, onSaveCourse, savedCourseIds = new Set() }) {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerCourses, setProviderCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const isBm = lang === 'bm';

  const handleViewProfile = async (provider) => {
    setSelectedProvider(provider);
    setLoading(true);
    try {
      const res = await fetch(`/api/providers/${provider.id}`);
      const data = await res.json();
      if (res.ok) {
        setProviderCourses(data.courses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <span className="px-3.5 py-1.5 bg-sky-100 text-sky-800 rounded-full text-xs font-bold uppercase tracking-wider">
          {isBm ? 'Institusi & Agensi Latihan' : 'Educational Institutions & Agencies'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
          {isBm ? 'Direktori Penyedia Latihan Papar' : 'Papar Training Provider Directory'}
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          {isBm
            ? 'Senarai institusi pendidikan, Kolej Komuniti, pusat latihan kemahiran, IPTA, dan IPTS bertauliah di daerah Papar, Sabah.'
            : 'List of certified educational institutions, Community Colleges, skills centres, IPTA, and IPTS in Papar district, Sabah.'}
        </p>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Organization Header & Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                  {p.org_name.charAt(0)}
                </div>

                {p.verified_badge === 1 ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1">
                    <ShieldCheck size={14} /> {isBm ? 'Disahkan' : 'Verified'}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
                    {isBm ? 'Menunggu' : 'Pending'}
                  </span>
                )}
              </div>

              {/* Title & Type */}
              <h2 className="text-xl font-black text-slate-900 leading-snug">
                {p.org_name}
              </h2>
              <p className="text-xs font-bold text-sky-600 mt-1">
                {p.org_type || 'Agensi Latihan Kemahiran'}
              </p>

              {/* Details List */}
              <div className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{p.address || 'Papar, Sabah'}</span>
                </div>
                {p.official_email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{p.official_email}</span>
                  </div>
                )}
                {p.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{p.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Stats & Profile Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <BookOpen size={14} className="text-sky-600" />
                {p.course_count || 0} {isBm ? 'kursus aktif' : 'active courses'}
              </span>

              <button
                onClick={() => handleViewProfile(p)}
                className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <span>{isBm ? 'Profil & Kursus' : 'Profile & Courses'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Provider Details Modal / Drawer */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedProvider(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
            >
              ✕
            </button>

            {/* Provider Info Banner */}
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-sky-500/25 shrink-0">
                {selectedProvider.org_name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900">
                    {selectedProvider.org_name}
                  </h2>
                  {selectedProvider.verified_badge === 1 && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                      <ShieldCheck size={14} /> {isBm ? 'Disahkan' : 'Verified'}
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-sky-600 mt-0.5">
                  {selectedProvider.org_type || 'Agensi Latihan Kemahiran Komuniti'}
                </p>

                <p className="text-xs text-slate-600 mt-2">
                  📍 {selectedProvider.address || 'Papar, Sabah'} • 📞 {selectedProvider.phone || '088-911223'} • ✉️ {selectedProvider.official_email}
                </p>
              </div>
            </div>

            {/* Published Courses Section */}
            <div className="mt-6">
              <h3 className="text-lg font-black text-slate-900 mb-4">
                {isBm ? `Kursus Ditawarkan oleh ${selectedProvider.org_name}` : `Courses Offered by ${selectedProvider.org_name}`}
              </h3>

              {loading ? (
                <div className="p-8 text-center text-slate-400 text-xs font-bold">
                  {isBm ? 'Memuatkan kursus...' : 'Loading courses...'}
                </div>
              ) : providerCourses.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs">
                  {isBm ? 'Tiada kursus aktif diterbitkan oleh penyedia ini buat masa ini.' : 'No active courses published by this provider yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {providerCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      lang={lang}
                      onSelect={(c) => {
                        setSelectedProvider(null);
                        onSelectCourse(c);
                      }}
                      onSave={onSaveCourse}
                      isSaved={savedCourseIds.has(course.id)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
