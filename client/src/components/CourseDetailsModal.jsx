import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, DollarSign, Users, Phone, Mail, 
  ShieldCheck, CheckCircle2, Bookmark, Share2, Sparkles, AlertCircle, Building2 
} from 'lucide-react';

export default function CourseDetailsModal({ course, lang, onClose, onRegister, onSave, isRegistered, isSaved, user }) {
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState('');

  if (!course) return null;
  const isBm = lang === 'bm';
  const isFull = course.available_seats <= 0;
  const isFree = course.fee === 0;

  const handleRegisterClick = async () => {
    if (!user) {
      setMsg(isBm ? 'Sila log masuk untuk mendaftar kursus.' : 'Please log in to register for courses.');
      return;
    }
    setRegistering(true);
    setMsg('');
    await onRegister(course.id);
    setRegistering(false);
  };

  const handleShareClick = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatYouWillLearnList = course.what_you_will_learn
    ? course.what_you_will_learn.split('\n').filter(Boolean)
    : [
        isBm ? '• Kemahiran praktikal hands-on daripada modul rasmi' : '• Hands-on practical skills from certified syllabus',
        isBm ? '• Sijil penyertaan disediakan oleh penyedia latihan' : '• Certificate of participation provided by training provider',
        isBm ? '• Bimbingan terus daripada penceramah & instruktor profesional' : '• Direct guidance from professional instructors & trainers',
        isBm ? '• Peluang jaringan usahawan & komuniti Papar' : '• Networking opportunity with Papar community'
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-5xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Sticky Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-bold uppercase tracking-wider">
              {course.category}
            </span>
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              Papar.Edu • ID #{course.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Top Grid: Poster Left, Main Info Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Large Poster */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 group">
                <img
                  src={course.poster_url || '/posters/sample_bakery.jpg'}
                  alt={course.title}
                  className="w-full h-80 lg:h-96 object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.target.src = '/posters/sample_bakery.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                  <span className="px-3 py-1 bg-slate-900/80 rounded-xl backdrop-blur-md">
                    🖼️ Poster Rasmi Kursus
                  </span>
                  {course.is_sample === 1 && (
                    <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-md uppercase">
                      Sample Poster Demo
                    </span>
                  )}
                </div>
              </div>

              {/* Action Secondary Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSave(course.id)}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                    isSaved
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  <span>{isSaved ? (isBm ? 'Disimpan dalam Profil' : 'Saved') : (isBm ? 'Simpan Kursus' : 'Save Course')}</span>
                </button>

                <button
                  onClick={handleShareClick}
                  className="py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  <span>{copied ? (isBm ? 'Disalin!' : 'Copied!') : (isBm ? 'Kongsi' : 'Share')}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Key Details & Register Action */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                {/* Provider Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-extrabold text-sky-600 bg-sky-50 px-3 py-1 rounded-xl flex items-center gap-1">
                    <Building2 size={14} />
                    {course.provider_name || 'Kolej Komuniti Papar'}
                  </span>
                  {course.provider_verified === 1 && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-xl">
                      <ShieldCheck size={14} /> {isBm ? 'Disahkan' : 'Verified'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {course.title}
                </h1>

                {/* Short Description */}
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <DollarSign size={12} /> {isBm ? 'Yuran Kursus' : 'Course Fee'}
                  </span>
                  <span className="text-lg font-black text-slate-900 mt-0.5">
                    {isFree ? (isBm ? 'PERCUMA' : 'FREE') : `RM ${course.fee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Users size={12} /> {isBm ? 'Kapasiti Tempat' : 'Available Seats'}
                  </span>
                  <span className={`text-lg font-black mt-0.5 ${isFull ? 'text-red-600' : 'text-slate-900'}`}>
                    {course.available_seats} / {course.max_seats}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> {isBm ? 'Tarikh Kursus' : 'Course Date'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-1">
                    {course.course_date}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {isBm ? 'Masa & Tempoh' : 'Time & Duration'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1">
                    {course.course_time || '09:00 AM - 04:00 PM'} ({course.duration || '1 Hari'})
                  </span>
                </div>

                <div className="flex flex-col col-span-2 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <MapPin size={12} /> {isBm ? 'Lokasi Kursus' : 'Location'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1 truncate">
                    {course.location}
                  </span>
                </div>
              </div>

              {/* Primary CTA Register Button */}
              <div>
                {isRegistered ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                    <div>
                      <p>{isBm ? 'Anda Telah Berjaya Mendaftar Kursus Ini!' : 'You Are Registered for This Course!'}</p>
                      <p className="text-xs font-medium text-emerald-600">
                        {isBm ? 'Sila semak notifikasi dan profil anda untuk kemas kini selanjutnya.' : 'Check your notifications and profile for further updates.'}
                      </p>
                    </div>
                  </div>
                ) : isFull ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                    <p className="text-red-700 font-bold text-sm">
                      ⚠️ {isBm ? 'Kursus Penuh / Tempat Telah Habis' : 'Course Full / Seats Sold Out'}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      {isBm ? 'Pendaftaran bagi kursus ini telah ditutup kerana kapasiti penuh.' : 'Registration is closed as all seats are taken.'}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleRegisterClick}
                    disabled={registering}
                    className="w-full py-4 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-xl shadow-sky-500/25 transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={20} />
                    <span>{registering ? (isBm ? 'Memproses...' : 'Processing...') : (isBm ? 'Daftar Sekarang' : 'Register Now')}</span>
                  </button>
                )}

                {msg && (
                  <p className="mt-2 text-xs font-semibold text-center text-amber-700 bg-amber-50 p-2 rounded-xl">
                    {msg}
                  </p>
                )}
              </div>

            </div>

          </div>

          {/* Bottom Tabs & Additional Details */}
          <div className="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* What You Will Learn */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-sky-600" />
                {isBm ? 'Apa Yang Anda Akan Pelajari' : 'What You Will Learn'}
              </h3>
              <ul className="space-y-3">
                {whatYouWillLearnList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Provider & Contact Info */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                {isBm ? 'Maklumat Penyedia Latihan & Hubungi' : 'Training Provider & Contact'}
              </h3>

              <div className="space-y-3 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <span>{course.provider_name || 'Kolej Komuniti Papar'}</span>
                  {course.provider_verified === 1 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">
                      {isBm ? 'Disahkan' : 'Verified'}
                    </span>
                  )}
                </div>

                <p className="text-slate-500">
                  {course.provider_type || 'Agensi Pendidikan & Latihan Kemahiran Komuniti Papar'}
                </p>

                <div className="pt-2 space-y-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-sky-600" />
                    <span>{course.contact_phone || course.provider_phone || '088-911223'}</span>
                  </div>

                  {course.provider_email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-sky-600" />
                      <span>{course.provider_email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-sky-600" />
                    <span>{course.provider_address || course.location}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Close */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Papar.Edu • {isBm ? 'Portal Kemahiran Papar' : 'Papar Skills Portal'}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            {isBm ? 'Tutup' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
