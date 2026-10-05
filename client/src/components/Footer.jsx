import React from 'react';
import { GraduationCap, Video, Heart, Globe, Share2 } from 'lucide-react';

export default function Footer({ lang, navigate }) {
  const isBm = lang === 'bm';

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => navigate('home')}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <GraduationCap size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Papar<span className="text-sky-500">.Edu</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {isBm
                ? 'Papar.Edu merupakan platform berpusat yang menghubungkan komuniti Papar dengan kursus pendek, latihan kemahiran dan peluang pembelajaran sepanjang hayat.'
                : 'Papar.Edu is a centralized platform connecting the Papar community with short courses, skills training and lifelong learning opportunities.'}
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" title="Facebook" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-sky-600 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs transition">
                FB
              </a>
              <a href="#" title="Instagram" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-pink-600 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs transition">
                IG
              </a>
              <a href="#" title="TikTok" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs transition">
                TT
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 mb-4">
              {isBm ? 'Pautan Pantas' : 'Quick Links'}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><button onClick={() => navigate('home')} className="hover:text-white transition">{isBm ? 'Utama' : 'Home'}</button></li>
              <li><button onClick={() => navigate('courses')} className="hover:text-white transition">{isBm ? 'Kursus' : 'Courses'}</button></li>
              <li><button onClick={() => navigate('providers')} className="hover:text-white transition">{isBm ? 'Penyedia Latihan' : 'Training Providers'}</button></li>
              <li><button onClick={() => navigate('about')} className="hover:text-white transition">{isBm ? 'Tentang Kami' : 'About Us'}</button></li>
              <li><button onClick={() => navigate('contact')} className="hover:text-white transition">{isBm ? 'Hubungi Kami' : 'Contact Us'}</button></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 mb-4">
              {isBm ? 'Kategori Kursus' : 'Categories'}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><button onClick={() => navigate('courses')} className="hover:text-white transition">🍰 Bakery & Pastry</button></li>
              <li><button onClick={() => navigate('courses')} className="hover:text-white transition">🧵 Jahitan & Fesyen</button></li>
              <li><button onClick={() => navigate('courses')} className="hover:text-white transition">💻 ICT & Digital Skills</button></li>
              <li><button onClick={() => navigate('courses')} className="hover:text-white transition">🛍 Keusahawanan</button></li>
              <li><button onClick={() => navigate('courses')} className="hover:text-white transition">📊 Perniagaan & Akaun</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 mb-4">
              {isBm ? 'Sokongan & Bantuan' : 'Support'}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><button onClick={() => navigate('contact')} className="hover:text-white transition">Soalan Lazim (FAQ)</button></li>
              <li><button onClick={() => navigate('contact')} className="hover:text-white transition">{isBm ? 'Hubungi Admin' : 'Contact Admin'}</button></li>
              <li><a href="#" className="hover:text-white transition">{isBm ? 'Dasar Privasi' : 'Privacy Policy'}</a></li>
              <li><a href="#" className="hover:text-white transition">{isBm ? 'Terma & Syarat' : 'Terms & Conditions'}</a></li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Papar.Edu. {isBm ? 'Hak Cipta Terpelihara.' : 'All Rights Reserved.'}</p>
          <p className="flex items-center gap-1">
            <span>Papar, Sabah, Malaysia</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
