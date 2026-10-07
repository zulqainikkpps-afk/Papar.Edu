import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, PlusCircle, Users, Bell, User, Settings, 
  LogOut, ShieldAlert, ShieldCheck, CheckCircle2, Clock, Trash2, Edit3, Eye, Sparkles, FileText, Upload 
} from 'lucide-react';
import PosterUploader from './PosterUploader';

export default function ProviderDashboard({ token, user, lang, onLogout, navigate, onSelectCourse }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBm = lang === 'bm';

  // Add Course Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Bakery',
    course_date: '',
    course_time: '09:00 AM - 04:00 PM',
    duration: '1 Hari',
    location: 'Papar, Sabah',
    fee: 0,
    max_seats: 30,
    registration_deadline: '',
    contact_phone: user?.phone || '088-911223',
    registration_link: '',
    poster_url: '',
    what_you_will_learn: ''
  });

  const [editingCourseId, setEditingCourseId] = useState(null);

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      // Fetch provider courses with authorization token
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const providerId = user?.provider?.id;
      const url = providerId ? `/api/courses?provider_id=${providerId}&status=all` : '/api/courses';
      const cRes = await fetch(url, { headers });
      const cData = await cRes.json();

      if (cRes.ok && providerId) {
        setCourses(cData.courses || []);
      }

      // Fetch participants list
      const pRes = await fetch('/api/provider/registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pData = await pRes.json();
      if (pRes.ok) {
        setParticipants(pData.participants || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsSubmitting(true);

    try {
      const url = editingCourseId ? `/api/courses/${editingCourseId}` : '/api/courses';
      const method = editingCourseId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setMsg(data.message || (isBm ? 'Kursus berjaya disimpan!' : 'Course saved successfully!'));
        setFormData({
          title: '',
          description: '',
          category: 'Bakery',
          course_date: '',
          course_time: '09:00 AM - 04:00 PM',
          duration: '1 Hari',
          location: 'Papar, Sabah',
          fee: 0,
          max_seats: 30,
          registration_deadline: '',
          contact_phone: user?.phone || '088-911223',
          registration_link: '',
          poster_url: '',
          what_you_will_learn: ''
        });
        setEditingCourseId(null);
        fetchProviderData();
        setActiveTab('my-courses');
      } else {
        setMsg(data.message || (isBm ? 'Ralat menyimpan kursus.' : 'Error saving course.'));
      }
    } catch (err) {
      setMsg(isBm ? 'Ralat sambungan ke pelayan.' : 'Server connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm(isBm ? 'Adakah anda pasti mahu memadam kursus ini?' : 'Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProviderData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (c) => {
    setEditingCourseId(c.id);
    setFormData({
      title: c.title || '',
      description: c.description || '',
      category: c.category || 'Bakery',
      course_date: c.course_date || '',
      course_time: c.course_time || '09:00 AM - 04:00 PM',
      duration: c.duration || '1 Hari',
      location: c.location || 'Papar, Sabah',
      fee: c.fee || 0,
      max_seats: c.max_seats || 30,
      registration_deadline: c.registration_deadline || '',
      contact_phone: c.contact_phone || '',
      registration_link: c.registration_link || '',
      poster_url: c.poster_url || '',
      what_you_will_learn: c.what_you_will_learn || ''
    });
    setActiveTab('add-course');
  };

  const providerObj = user?.provider || { org_name: user?.full_name, status: 'approved' };
  const isPendingVerification = providerObj.status === 'pending';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 p-6 flex flex-col justify-between">
        <div>
          {/* Provider Brand Badge */}
          <div className="pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 font-black text-lg flex items-center justify-center text-white shadow-md">
                {providerObj.org_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{providerObj.org_name}</p>
                <p className="text-[11px] text-indigo-400 font-semibold">{isBm ? 'Penyedia Latihan' : 'Training Provider'}</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="mt-6 space-y-1.5">
            {[
              { id: 'dashboard', label: isBm ? 'Papan Pemuka' : 'Dashboard', icon: LayoutDashboard },
              { id: 'my-courses', label: isBm ? 'Kursus Saya' : 'My Courses', icon: BookOpen },
              { id: 'add-course', label: isBm ? 'Tambah Kursus' : 'Add Course', icon: PlusCircle },
              { id: 'registrations', label: isBm ? 'Senarai Peserta' : 'Registrations', icon: Users },
              { id: 'notifications', label: isBm ? 'Notifikasi' : 'Notifications', icon: Bell }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition flex items-center gap-3"
          >
            <LogOut size={18} />
            <span>{isBm ? 'Log Keluar' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto w-full">
        
        {/* Verification Status Banner */}
        {isPendingVerification && (
          <div className="mb-8 p-5 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-start gap-4 text-amber-900 shadow-sm">
            <ShieldAlert size={28} className="text-amber-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-900">
                {isBm ? 'Akaun Dalam Pengesahan Pentadbir' : 'Account Pending Admin Verification'}
              </h3>
              <p className="text-xs mt-1 text-amber-800 leading-relaxed">
                {isBm
                  ? 'Akaun Penyedia Latihan anda sedang diteliti oleh pentadbir Papar.Edu. Selepas diluluskan, anda boleh menerbitkan kursus kepada komuniti.'
                  : 'Your Training Provider account is being reviewed by the Papar.Edu admin. Once approved, you will be able to publish courses to the community.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {isBm ? 'Papan Pemuka Penyedia Latihan' : 'Provider Dashboard'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isBm ? 'Pengurusan kursus, peserta & aktiviti latihan anda di daerah Papar.' : 'Manage your courses, participants & training activities in Papar.'}
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isBm ? 'Jumlah Kursus' : 'Total Courses'}</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{courses.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isBm ? 'Kursus Aktif' : 'Active Courses'}</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {courses.filter(c => c.status === 'published').length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isBm ? 'Jumlah Peserta' : 'Registrations'}</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{participants.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isBm ? 'Menunggu Kelulusan' : 'Pending Review'}</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {courses.filter(c => c.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black">{isBm ? 'Mahu Menawarkan Kursus Baharu?' : 'Want to Offer a New Course?'}</h3>
                <p className="text-xs text-sky-100 mt-1 max-w-lg">
                  {isBm ? 'Gunakan borang mudah dan muat naik poster drag-and-drop untuk menyiarkan kursus kepada komuniti Papar.' : 'Use our simple form with drag-and-drop poster upload to publish courses to the Papar community.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCourseId(null);
                  setFormData({
                    title: '',
                    description: '',
                    category: 'Bakery',
                    course_date: '',
                    course_time: '09:00 AM - 04:00 PM',
                    duration: '1 Hari',
                    location: 'Papar, Sabah',
                    fee: 0,
                    max_seats: 30,
                    registration_deadline: '',
                    contact_phone: user?.phone || '088-911223',
                    registration_link: '',
                    poster_url: '',
                    what_you_will_learn: ''
                  });
                  setActiveTab('add-course');
                }}
                className="px-6 py-3 bg-white text-slate-900 font-extrabold text-xs rounded-2xl shadow-md hover:bg-slate-100 transition shrink-0 flex items-center gap-2"
              >
                <PlusCircle size={18} /> {isBm ? 'Bina Kursus Baharu' : 'Create New Course'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MY COURSES */}
        {activeTab === 'my-courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{isBm ? 'Kursus Saya' : 'My Courses'}</h1>
                <p className="text-xs text-slate-500 mt-0.5">{isBm ? 'Senarai semua kursus yang telah anda cipta' : 'List of all courses created by you'}</p>
              </div>
              <button
                onClick={() => {
                  setEditingCourseId(null);
                  setActiveTab('add-course');
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md hover:bg-indigo-700"
              >
                <PlusCircle size={16} /> {isBm ? 'Tambah Kursus' : 'Add Course'}
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-700">{isBm ? 'Tiada kursus dicipta lagi.' : 'No courses created yet.'}</p>
                <button
                  onClick={() => setActiveTab('add-course')}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                >
                  {isBm ? 'Cipta Kursus Pertama' : 'Create First Course'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                      <tr>
                        <th className="p-4">{isBm ? 'Tajuk Kursus' : 'Course Title'}</th>
                        <th className="p-4">{isBm ? 'Kategori' : 'Category'}</th>
                        <th className="p-4">{isBm ? 'Tarikh' : 'Date'}</th>
                        <th className="p-4">{isBm ? 'Yuran' : 'Fee'}</th>
                        <th className="p-4">{isBm ? 'Tempat' : 'Seats'}</th>
                        <th className="p-4">{isBm ? 'Status' : 'Status'}</th>
                        <th className="p-4 text-right">{isBm ? 'Tindakan' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {courses.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <img src={c.poster_url} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                              <span className="line-clamp-1">{c.title}</span>
                            </div>
                          </td>
                          <td className="p-4">{c.category}</td>
                          <td className="p-4">{c.course_date}</td>
                          <td className="p-4">{c.fee === 0 ? 'FREE' : `RM ${c.fee}`}</td>
                          <td className="p-4">{c.available_seats} / {c.max_seats}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              c.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditClick(c)}
                              title={isBm ? 'Sunting' : 'Edit'}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id)}
                              title={isBm ? 'Padam' : 'Delete'}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD / EDIT COURSE FORM */}
        {activeTab === 'add-course' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-md max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {editingCourseId ? (isBm ? 'Kemaskini Kursus' : 'Edit Course') : (isBm ? 'Tambah Kursus Baharu' : 'Add New Course')}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isBm ? 'Sila isi maklumat kursus dan muat naik poster.' : 'Please enter course details and upload course poster.'}
              </p>
            </div>

            {msg && (
              <div className="p-4 rounded-2xl text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                {msg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Drag & Drop Poster Upload Section */}
              <PosterUploader
                value={formData.poster_url}
                onChange={(url) => setFormData({ ...formData, poster_url: url })}
                token={token}
                lang={lang}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Tajuk Kursus' : 'Course Title'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={isBm ? 'Contoh: ASAS PEMBUATAN KEK & ROTI' : 'e.g. BASIC BAKERY & PASTRY'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Kategori' : 'Category'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  >
                    {['Bakery', 'Sewing', 'ICT', 'Digital Skills', 'Entrepreneurship', 'Business', 'Cooking', 'Photography', 'Beauty', 'Automotive', 'Agriculture', 'Language'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Tarikh Kursus' : 'Course Date'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.course_date}
                    onChange={(e) => setFormData({ ...formData, course_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Masa' : 'Time'}
                  </label>
                  <input
                    type="text"
                    value={formData.course_time}
                    onChange={(e) => setFormData({ ...formData, course_time: e.target.value })}
                    placeholder="08:30 AM - 04:30 PM"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Tempoh' : 'Duration'}
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="1 Hari / 2 Hari"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Lokasi' : 'Location'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Pekan Papar, Sabah"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Yuran (RM)' : 'Fee (RM)'} (0 = {isBm ? 'PERCUMA' : 'FREE'})
                  </label>
                  <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Jumlah Tempat (Kapasiti)' : 'Max Seats'}
                  </label>
                  <input
                    type="number"
                    value={formData.max_seats}
                    onChange={(e) => setFormData({ ...formData, max_seats: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Tarikh Tutup Pendaftaran' : 'Registration Deadline'}
                  </label>
                  <input
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Penerangan Kursus' : 'Course Description'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={isBm ? 'Penerangan ringkas mengenai objektif kursus...' : 'Brief description of course objectives...'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Apa Yang Akan Dipelajari (Setiap baris satu tajuk)' : 'What You Will Learn (One item per line)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.what_you_will_learn}
                    onChange={(e) => setFormData({ ...formData, what_you_will_learn: e.target.value })}
                    placeholder="• Teknik sukatan bahan bakeri&#10;• Cara pembakaran kek span&#10;• Hiasan buttercream"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('my-courses')}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  {isBm ? 'Batal' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-sky-700 hover:to-indigo-700 transition"
                >
                  {isSubmitting ? (isBm ? 'Menyimpan...' : 'Saving...') : (isBm ? 'Hantar & Terbitkan Kursus' : 'Submit & Publish Course')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: PARTICIPANTS REGISTRATION LIST */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{isBm ? 'Senarai Peserta Mendaftar' : 'Registered Participants'}</h1>
              <p className="text-xs text-slate-500 mt-1">{isBm ? 'Senarai maklumat komuniti yang telah mendaftar kursus anda' : 'List of registered participants for your courses'}</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                    <tr>
                      <th className="p-4">{isBm ? 'Nama Peserta' : 'Participant Name'}</th>
                      <th className="p-4">{isBm ? 'Tajuk Kursus' : 'Course Title'}</th>
                      <th className="p-4">{isBm ? 'E-mel' : 'Email'}</th>
                      <th className="p-4">{isBm ? 'Telefon' : 'Phone'}</th>
                      <th className="p-4">{isBm ? 'Tarikh Daftar' : 'Registered Date'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          {isBm ? 'Belum ada pendaftaran peserta.' : 'No participant registrations yet.'}
                        </td>
                      </tr>
                    ) : (
                      participants.map((p) => (
                        <tr key={p.reg_id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-slate-900">{p.student_name}</td>
                          <td className="p-4 text-sky-700 font-bold">{p.course_title}</td>
                          <td className="p-4">{p.student_email}</td>
                          <td className="p-4">{p.student_phone || '-'}</td>
                          <td className="p-4 text-slate-400">{new Date(p.registered_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
