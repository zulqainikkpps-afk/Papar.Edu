import React, { useState } from 'react';
import { Search, Filter, MapPin, Calendar, DollarSign, Building2, Tag } from 'lucide-react';

export default function SearchSection({ lang, onSearch, providers = [] }) {
  const isBm = lang === 'bm';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedProvider, setSelectedProvider] = useState('All');

  const categories = [
    { name: 'Bakery', icon: '🍰' },
    { name: 'Sewing', icon: '🧵' },
    { name: 'ICT', icon: '💻' },
    { name: 'Digital Skills', icon: '📱' },
    { name: 'Entrepreneurship', icon: '🛍' },
    { name: 'Business', icon: '📊' },
    { name: 'Cooking', icon: '🍳' },
    { name: 'Photography', icon: '📷' },
    { name: 'Beauty', icon: '💄' },
    { name: 'Automotive', icon: '🚗' },
    { name: 'Agriculture', icon: '🌱' },
    { name: 'Language', icon: '🗣' }
  ];

  const locations = ['All', 'Papar', 'Kinarut', 'Bongawan', 'Benoni', 'Pekan Papar'];

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    onSearch({
      search: searchTerm,
      category: selectedCategory,
      location: selectedLocation,
      price: selectedPrice,
      provider_id: selectedProvider !== 'All' ? selectedProvider : ''
    });
  };

  const handleChipClick = (catName) => {
    const newCat = selectedCategory === catName ? 'All' : catName;
    setSelectedCategory(newCat);
    onSearch({
      search: searchTerm,
      category: newCat,
      location: selectedLocation,
      price: selectedPrice,
      provider_id: selectedProvider !== 'All' ? selectedProvider : ''
    });
  };

  return (
    <div className="relative -mt-16 z-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 backdrop-blur-xl">
        <form onSubmit={handleSearchSubmit} className="space-y-6">
          
          {/* Main Title & Input */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  isBm
                    ? 'Apa yang anda ingin pelajari? (contoh: Bakeri, Jahitan, Canva, Digital)'
                    : 'What do you want to learn? (e.g., Bakery, Sewing, Canva, Digital)'
                }
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              />
            </div>
            
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-sky-500/25 hover:shadow-xl hover:scale-[1.02] transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Search size={18} /> {isBm ? 'Cari Kursus' : 'Search Courses'}
            </button>
          </div>

          {/* Quick Category Chips */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Tag size={14} className="text-sky-500" />
              {isBm ? 'Carian Popular Komuniti Papar:' : 'Popular Community Searches:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => handleChipClick(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 border ${
                    selectedCategory === cat.name
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters Grid */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Tag size={14} /> {isBm ? 'Kategori' : 'Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="All">{isBm ? 'Semua Kategori' : 'All Categories'}</option>
                {categories.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <MapPin size={14} /> {isBm ? 'Lokasi' : 'Location'}
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>
                    {loc === 'All' ? (isBm ? 'Semua Lokasi Papar' : 'All Locations in Papar') : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <DollarSign size={14} /> {isBm ? 'Yuran Kursus' : 'Price / Fee'}
              </label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="All">{isBm ? 'Semua Yuran (Percuma & Berbayar)' : 'All Fees (Free & Paid)'}</option>
                <option value="free">{isBm ? 'PERCUMA Sahaja' : 'FREE Only'}</option>
                <option value="paid">{isBm ? 'Berbayar Sahaja' : 'Paid Only'}</option>
              </select>
            </div>

            {/* Provider Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Building2 size={14} /> {isBm ? 'Penyedia Latihan' : 'Training Provider'}
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="All">{isBm ? 'Semua Penyedia Latihan' : 'All Providers'}</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.org_name}</option>
                ))}
              </select>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}
