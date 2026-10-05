import React from 'react';
import { Search, MapPin, Building2, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutSection({ lang, navigate }) {
  const isBm = lang === 'bm';

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main About Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden mb-16">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="px-3.5 py-1.5 bg-sky-500/20 text-sky-400 text-xs font-extrabold rounded-full uppercase tracking-wider">
              {isBm ? 'Mengenai Inisiatif Komuniti' : 'About Community Initiative'}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Papar<span className="text-sky-400">.Edu</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
              {isBm
                ? 'Papar.Edu merupakan platform berpusat yang menghubungkan komuniti Papar dengan kursus pendek, latihan kemahiran dan peluang pembelajaran sepanjang hayat yang ditawarkan oleh institusi pendidikan dan penyedia latihan.'
                : 'Papar.Edu is a centralized platform that connects the Papar community with short courses, skills training and lifelong learning opportunities provided by educational institutions and training providers.'}
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('courses')}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
              >
                {isBm ? 'Terokai Kursus Papar' : 'Explore Papar Courses'}
              </button>
              <button
                onClick={() => navigate('contact')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700"
              >
                {isBm ? 'Hubungi Pentadbir' : 'Contact Support'}
              </button>
            </div>
          </div>
        </div>

        {/* Why Papar.Edu Grid */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-3.5 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
            {isBm ? 'Kelebihan Platform' : 'Why Papar.Edu?'}
          </span>
          <h3 className="text-3xl font-black text-slate-900 mt-3">
            {isBm ? 'Mengapa Memilih Papar.Edu?' : 'Why Choose Papar.Edu?'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <Search size={24} />
            </div>
            <h4 className="text-base font-black text-slate-900">
              {isBm ? 'Terokai Kursus' : 'Discover Courses'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isBm ? 'Cari peluang latihan kemahiran dengan mudah dalam satu platform berpusat.' : 'Find training opportunities easily in one centralized platform.'}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin size={24} />
            </div>
            <h4 className="text-base font-black text-slate-900">
              {isBm ? 'Peluang Tempatan' : 'Local Opportunities'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isBm ? 'Temui program pembelajaran yang ditawarkan sekitar daerah Papar, Sabah.' : 'Discover learning programmes available right around Papar district.'}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 size={24} />
            </div>
            <h4 className="text-base font-black text-slate-900">
              {isBm ? 'Penyedia Dipercayai' : 'Trusted Providers'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isBm ? 'Berhubung dengan institusi pendidikan, Kolej Komuniti, IPTA, IPTS & agensi bertauliah.' : 'Connect with reputable educational institutions and certified providers.'}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-base font-black text-slate-900">
              {isBm ? 'Bina Kemahiran Baharu' : 'Build New Skills'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isBm ? 'Tingkatkan kemahiran untuk kerjaya, perniagaan & pembangunan kendiri.' : 'Improve skills for career, business and personal development.'}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
