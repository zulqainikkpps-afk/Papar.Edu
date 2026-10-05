import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CategoriesSection({ lang, onSelectCategory }) {
  const isBm = lang === 'bm';

  const categories = [
    {
      id: 'Bakery',
      icon: '🍰',
      title: 'Bakery & Pastry',
      titleBm: 'Bakeri & Pastri',
      desc: isBm ? 'Pembuatan kek, roti, biskut & hiasan' : 'Cake making, bread, pastries & decorating',
      gradient: 'from-amber-500 to-orange-600',
      count: '5+ Kursus'
    },
    {
      id: 'Sewing',
      icon: '🧵',
      title: 'Sewing & Fashion',
      titleBm: 'Jahitan & Fesyen',
      desc: isBm ? 'Pola pakaian, jahit baju kurung & kraf' : 'Garment patterns, traditional wear & craft',
      gradient: 'from-pink-500 to-rose-600',
      count: '3+ Kursus'
    },
    {
      id: 'ICT',
      icon: '💻',
      title: 'ICT & Digital Skills',
      titleBm: 'ICT & Kemahiran Digital',
      desc: isBm ? 'Canva, komputer, pengaturcaraan & AI' : 'Canva design, computer skills, coding & AI',
      gradient: 'from-sky-500 to-indigo-600',
      count: '8+ Kursus'
    },
    {
      id: 'Business',
      icon: '📊',
      title: 'Business & Finance',
      titleBm: 'Perniagaan & Kewangan',
      desc: isBm ? 'Akaun perniagaan, lesen SSM & cukai' : 'Business accounts, SSM licensing & tax',
      gradient: 'from-emerald-500 to-teal-600',
      count: '4+ Kursus'
    },
    {
      id: 'Entrepreneurship',
      icon: '🛍',
      title: 'Entrepreneurship',
      titleBm: 'Keusahawanan',
      desc: isBm ? 'Perniagaan mikro, modal & pemasaran' : 'Micro-business, grants & strategy',
      gradient: 'from-purple-500 to-violet-600',
      count: '6+ Kursus'
    },
    {
      id: 'Cooking',
      icon: '🍳',
      title: 'Culinary & Cooking',
      titleBm: 'Masakan & Kulinari',
      desc: isBm ? 'Masakan tradisional Sabah, katering & sos' : 'Sabah traditional dishes, catering & sauces',
      gradient: 'from-red-500 to-orange-600',
      count: '4+ Kursus'
    },
    {
      id: 'Photography',
      icon: '📷',
      title: 'Photography & Video',
      titleBm: 'Fotografi & Videografi',
      desc: isBm ? 'Gambar produk, TikTok Reels & kamera' : 'Product photography, TikTok Reels & editing',
      gradient: 'from-cyan-500 to-blue-600',
      count: '3+ Kursus'
    },
    {
      id: 'Beauty',
      icon: '💄',
      title: 'Beauty & Wellness',
      titleBm: 'Solekan & Kecantikan',
      desc: isBm ? 'Asas solekan, spa, dandanan & kuku' : 'Makeup basics, spa therapy & grooming',
      gradient: 'from-fuchsia-500 to-pink-600',
      count: '3+ Kursus'
    },
    {
      id: 'Automotive',
      icon: '🚗',
      title: 'Automotive & Repair',
      titleBm: 'Automotif & Penyelenggaraan',
      desc: isBm ? 'Penyelenggaraan enjin & kenderaan' : 'Basic engine maintenance & servicing',
      gradient: 'from-slate-700 to-slate-900',
      count: '2+ Kursus'
    },
    {
      id: 'Agriculture',
      icon: '🌱',
      title: 'Agriculture & Farming',
      titleBm: 'Pertanian & Aquaponik',
      desc: isBm ? 'Tanaman hidroponik, cili & kebun' : 'Hydroponics, chili farming & urban agriculture',
      gradient: 'from-green-600 to-emerald-700',
      count: '3+ Kursus'
    },
    {
      id: 'Language',
      icon: '🗣',
      title: 'Language & Communication',
      titleBm: 'Bahasa & Komunikasi',
      desc: isBm ? 'Bahasa Inggeris komunikasi & Jepun' : 'Communicative English, Mandarin & speech',
      gradient: 'from-blue-600 to-indigo-700',
      count: '2+ Kursus'
    },
    {
      id: 'Creative Skills',
      icon: '🎨',
      title: 'Creative Arts & Crafts',
      titleBm: 'Kraf & Seni Kreatif',
      desc: isBm ? 'Batik, kraf tangan & hiasan dalaman' : 'Batik painting, handicrafts & interior decor',
      gradient: 'from-amber-600 to-yellow-600',
      count: '4+ Kursus'
    }
  ];

  return (
    <section className="py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-3">
              <Sparkles size={14} />
              {isBm ? 'Bidang Latihan Komuniti' : 'Community Training Fields'}
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isBm ? 'Terokai Mengikut Kategori' : 'Explore by Category'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isBm ? 'Pilih bidang kemahiran yang anda berminat untuk pelajari di Papar' : 'Choose a skill domain you are interested to learn in Papar'}
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-tr ${cat.gradient} opacity-10 group-hover:opacity-20 transition duration-300 pointer-events-none`} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${cat.gradient} flex items-center justify-center text-2xl shadow-md text-white group-hover:scale-110 transition duration-300`}>
                    <span>{cat.icon}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {cat.count}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition">
                  {isBm ? cat.titleBm : cat.title}
                </h3>
                
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
                <span>{isBm ? 'Lihat Kursus' : 'Browse Courses'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
