import React from 'react';
import { Calendar, MapPin, Users, CheckCircle2, Bookmark, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export default function CourseCard({ course, lang, onSelect, onSave, isSaved }) {
  const isBm = lang === 'bm';

  const isFull = course.available_seats <= 0;
  const isFree = course.fee === 0;

  // Determine status badge
  let statusBadge = {
    label: isBm ? 'Pendaftaran Dibuka' : 'Registration Open',
    bgColor: 'bg-emerald-500 text-white'
  };

  if (isFull) {
    statusBadge = {
      label: isBm ? 'Kursus Penuh' : 'Course Full',
      bgColor: 'bg-red-500 text-white'
    };
  } else if (course.available_seats <= 5) {
    statusBadge = {
      label: isBm ? 'Hampir Ditutup' : 'Closing Soon',
      bgColor: 'bg-amber-500 text-white'
    };
  }

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Course Poster Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onSelect(course)}>
        <img
          src={course.poster_url || '/posters/sample_bakery.jpg'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
          onError={(e) => {
            e.target.src = '/posters/sample_bakery.jpg';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase shadow-sm ${statusBadge.bgColor}`}>
            {statusBadge.label}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(course.id);
            }}
            title={isSaved ? (isBm ? 'Keluarkan daripada Simpanan' : 'Remove Bookmark') : (isBm ? 'Simpan Kursus' : 'Save Course')}
            className={`p-2 rounded-full backdrop-blur-md transition ${
              isSaved ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-900/60 text-white hover:bg-slate-900/90'
            }`}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3">
          <span className={`px-3.5 py-1.5 rounded-xl font-black text-xs shadow-lg backdrop-blur-md ${
            isFree ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 border border-slate-100'
          }`}>
            {isFree ? (isBm ? 'PERCUMA' : 'FREE') : `RM ${course.fee.toFixed(2)}`}
          </span>
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-slate-900/80 text-white text-[10px] font-extrabold rounded-lg uppercase tracking-wider backdrop-blur-sm">
            {course.category}
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Provider Name */}
          <div className="flex items-center gap-1.5 text-xs text-sky-700 font-bold mb-1.5">
            <span className="truncate">{course.provider_name || 'Kolej Komuniti Papar'}</span>
            {course.provider_verified === 1 && (
              <ShieldCheck size={14} className="text-sky-600 shrink-0" title={isBm ? 'Penyedia Disahkan' : 'Verified Provider'} />
            )}
          </div>

          {/* Course Title */}
          <h3 
            onClick={() => onSelect(course)}
            className="text-base font-black text-slate-900 hover:text-sky-600 transition line-clamp-2 cursor-pointer leading-snug"
          >
            {course.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Meta Details */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <span>{course.course_date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock size={14} className="text-slate-400" />
              <span>{course.duration || '1 Hari'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[140px]">{course.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-slate-400" />
              <span className={isFull ? 'text-red-600 font-bold' : 'text-slate-700'}>
                {course.available_seats} {isBm ? 'tempat' : 'left'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(course)}
          className="w-full py-3 bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:bg-sky-600"
        >
          <span>{isBm ? 'Lihat Butiran' : 'View Details'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}
