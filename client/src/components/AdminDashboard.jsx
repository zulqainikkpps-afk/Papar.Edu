import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Building2, BookOpen, CheckCircle2, Clock, AlertCircle, 
  Send, MessageSquare, Activity, RefreshCw, X, ShieldCheck, ThumbsUp, ThumbsDown, UserCheck 
} from 'lucide-react';

export default function AdminDashboard({ token, lang, onLogout, navigate }) {
  const [stats, setStats] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [providersList, setProvidersList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Reply Modal state
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  // Broadcast Notification form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const isBm = lang === 'bm';

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [sRes, uRes, pRes, cRes, mRes, aRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/providers', { headers }),
        fetch('/api/admin/courses', { headers }),
        fetch('/api/admin/contact-messages', { headers }),
        fetch('/api/admin/activity-logs', { headers })
      ]);

      if (sRes.ok) setStats((await sRes.json()).stats || {});
      if (uRes.ok) setUsersList((await uRes.json()).users || []);
      if (pRes.ok) setProvidersList((await pRes.json()).providers || []);
      if (cRes.ok) setCoursesList((await cRes.json()).courses || []);
      if (mRes.ok) setMessagesList((await mRes.json()).messages || []);
      if (aRes.ok) setActivityLogs((await aRes.json()).logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProvider = async (providerId, status) => {
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, verified_badge: status === 'approved' ? 1 : 0 })
      });
      const data = await res.json();
      setMsg(data.message);
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveCourse = async (courseId, status) => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      setMsg(data.message);
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage, type: 'info' })
      });
      const data = await res.json();
      setMsg(data.message);
      setBroadcastTitle('');
      setBroadcastMessage('');
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedMsg || !replyText) return;
    setReplying(true);

    try {
      const res = await fetch(`/api/admin/contact-messages/${selectedMsg.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ admin_reply: replyText })
      });
      const data = await res.json();
      setMsg(data.message);
      setSelectedMsg(null);
      setReplyText('');
      fetchAdminData();
    } catch (e) {
      console.error(e);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 p-6 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500 font-black text-slate-950 flex items-center justify-center text-lg">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Papar.Edu Admin</h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full uppercase">
                Panel Kawalan
              </span>
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {[
              { id: 'overview', label: isBm ? 'Ringkasan Stats' : 'Overview & Stats', icon: Activity },
              { id: 'providers-queue', label: isBm ? 'Kelulusan Provider' : 'Provider Verifications', icon: ShieldCheck, badge: stats.pending_providers },
              { id: 'courses-queue', label: isBm ? 'Kelulusan Kursus' : 'Course Approvals', icon: BookOpen, badge: stats.pending_courses },
              { id: 'messages', label: isBm ? 'Mesej Hubungi Kami' : 'Contact Messages', icon: MessageSquare, badge: stats.unread_messages },
              { id: 'users-mgr', label: isBm ? 'Pengurusan Pengguna' : 'User Management', icon: Users },
              { id: 'broadcast', label: isBm ? 'Hantar Notifikasi' : 'Broadcast Notification', icon: Send },
              { id: 'logs', label: isBm ? 'Log Aktiviti' : 'Activity Logs', icon: Clock }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === item.id
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-black animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button
            onClick={() => navigate('home')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            ← {isBm ? 'Kembali ke Laman Utama' : 'Back to Website'}
          </button>

          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
          >
            {isBm ? 'Log Keluar Admin' : 'Admin Logout'}
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        
        {msg && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-between">
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-amber-300 hover:text-white">✕</button>
          </div>
        )}

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{isBm ? 'Papan Pemuka Pentadbir' : 'Admin Dashboard'}</h1>
                <p className="text-xs text-slate-400 mt-1">{isBm ? 'Prestasi keseluruhan portal Papar.Edu' : 'Overall performance of Papar.Edu portal'}</p>
              </div>

              <button
                onClick={fetchAdminData}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>{isBm ? 'Kemas Kini Data' : 'Refresh Data'}</span>
              </button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">{isBm ? 'Jumlah Pengguna' : 'Total Users'}</span>
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    <Users size={20} />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">{stats.total_users || 0}</p>
                <p className="text-[11px] text-slate-400 mt-1">{isBm ? 'Pelajar & Komuniti Papar' : 'Students & Community'}</p>
              </div>

              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">{isBm ? 'Penyedia Latihan' : 'Training Providers'}</span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Building2 size={20} />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">{stats.total_providers || 0}</p>
                <p className="text-[11px] text-amber-400 font-bold mt-1">
                  {stats.pending_providers || 0} {isBm ? 'permohonan menunggu' : 'pending verifications'}
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">{isBm ? 'Jumlah Kursus' : 'Total Courses'}</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <BookOpen size={20} />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">{stats.total_courses || 0}</p>
                <p className="text-[11px] text-emerald-400 font-bold mt-1">
                  {stats.active_courses || 0} {isBm ? 'kursus aktif diterbitkan' : 'published active courses'}
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">{isBm ? 'Pendaftaran Peserta' : 'Total Registrations'}</span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">{stats.total_registrations || 0}</p>
                <p className="text-[11px] text-slate-400 mt-1">{isBm ? 'Permohonan menyertai kursus' : 'Successful course signups'}</p>
              </div>
            </div>

            {/* Custom Interactive Charts Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Course Breakdown Bar Chart */}
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-amber-400" />
                  {isBm ? 'Pecahan Status Kursus Papar.Edu' : 'Course Status Breakdown'}
                </h3>

                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1 text-emerald-400">
                      <span>{isBm ? 'Kursus Diterbitkan (Published)' : 'Published Courses'}</span>
                      <span>{stats.active_courses || 0}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((stats.active_courses || 0) / (stats.total_courses || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1 text-amber-400">
                      <span>{isBm ? 'Menunggu Kelulusan (Pending Review)' : 'Pending Review'}</span>
                      <span>{stats.pending_courses || 0}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((stats.pending_courses || 0) / (stats.total_courses || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 2: System Health */}
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  {isBm ? 'Status Pengesahan Penyedia Latihan' : 'Provider Verification Status'}
                </h3>

                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1 text-indigo-400">
                      <span>{isBm ? 'Penyedia Disahkan (Approved)' : 'Approved Providers'}</span>
                      <span>{stats.total_providers || 0}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((stats.total_providers || 0) / ((stats.total_providers || 0) + (stats.pending_providers || 0) || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1 text-red-400">
                      <span>{isBm ? 'Permohonan Menunggu (Pending Verifications)' : 'Pending Verifications'}</span>
                      <span>{stats.pending_providers || 0}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((stats.pending_providers || 0) / ((stats.total_providers || 0) + (stats.pending_providers || 0) || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PROVIDER VERIFICATION QUEUE */}
        {activeTab === 'providers-queue' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">{isBm ? 'Kelulusan Penyedia Latihan' : 'Provider Verifications'}</h1>
              <p className="text-xs text-slate-400 mt-1">{isBm ? 'Semak dan sahkan permohonan pendaftaran penyedia latihan' : 'Review and verify training provider applications'}</p>
            </div>

            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="p-4">{isBm ? 'Nama Organisasi' : 'Organization Name'}</th>
                      <th className="p-4">{isBm ? 'Jenis' : 'Type'}</th>
                      <th className="p-4">{isBm ? 'Hubungi' : 'Contact'}</th>
                      <th className="p-4">{isBm ? 'Status' : 'Status'}</th>
                      <th className="p-4 text-right">{isBm ? 'Tindakan' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-semibold">
                    {providersList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-700/40 transition">
                        <td className="p-4 font-bold text-white">
                          {p.org_name}
                          <p className="text-[10px] text-slate-400 font-normal">{p.address}</p>
                        </td>
                        <td className="p-4">{p.org_type || 'Agensi Latihan'}</td>
                        <td className="p-4">
                          <p className="text-white">{p.official_email}</p>
                          <p className="text-[10px] text-slate-400">{p.phone}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {p.status !== 'approved' && (
                            <button
                              onClick={() => handleVerifyProvider(p.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                            >
                              ✓ {isBm ? 'Luluskan' : 'Approve'}
                            </button>
                          )}
                          {p.status !== 'rejected' && (
                            <button
                              onClick={() => handleVerifyProvider(p.id, 'rejected')}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
                            >
                              ✕ {isBm ? 'Tolak' : 'Reject'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COURSE APPROVAL QUEUE */}
        {activeTab === 'courses-queue' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">{isBm ? 'Kelulusan Kursus Baharu' : 'Course Approval Queue'}</h1>
              <p className="text-xs text-slate-400 mt-1">{isBm ? 'Semak kursus yang dihantar oleh penyedia latihan sebelum diterbitkan' : 'Review courses submitted by providers before publishing'}</p>
            </div>

            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="p-4">{isBm ? 'Kursus & Provider' : 'Course & Provider'}</th>
                      <th className="p-4">{isBm ? 'Kategori' : 'Category'}</th>
                      <th className="p-4">{isBm ? 'Tarikh & Yuran' : 'Date & Fee'}</th>
                      <th className="p-4">{isBm ? 'Status' : 'Status'}</th>
                      <th className="p-4 text-right">{isBm ? 'Tindakan' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-semibold">
                    {coursesList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-700/40 transition">
                        <td className="p-4 font-bold text-white">
                          <p className="text-sm font-extrabold text-white">{c.title}</p>
                          <p className="text-[11px] text-sky-400">{c.provider_name}</p>
                        </td>
                        <td className="p-4">{c.category}</td>
                        <td className="p-4">
                          <p>{c.course_date}</p>
                          <p className="text-[10px] text-slate-400">{c.fee === 0 ? 'FREE' : `RM ${c.fee}`}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            c.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {c.status !== 'published' && (
                            <button
                              onClick={() => handleApproveCourse(c.id, 'published')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                            >
                              ✓ {isBm ? 'Terbitkan' : 'Publish'}
                            </button>
                          )}
                          {c.status !== 'rejected' && (
                            <button
                              onClick={() => handleApproveCourse(c.id, 'rejected')}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
                            >
                              ✕ {isBm ? 'Tolak' : 'Reject'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT MESSAGES MANAGER & DIRECT REPLY */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">{isBm ? 'Mesej Hubungi Kami' : 'Contact Support Messages'}</h1>
              <p className="text-xs text-slate-400 mt-1">{isBm ? 'Mesej daripada pengguna komuniti Papar dan balasan admin' : 'Inquiries submitted by users and admin replies'}</p>
            </div>

            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/60 overflow-hidden">
              <div className="divide-y divide-slate-700/60">
                {messagesList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    {isBm ? 'Tiada mesej sokongan.' : 'No contact messages.'}
                  </div>
                ) : (
                  messagesList.map((m) => (
                    <div key={m.id} className="p-6 space-y-3 hover:bg-slate-700/20 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{m.full_name}</span>
                          <span className="text-xs text-slate-400">({m.email})</span>
                          <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 text-[10px] font-bold rounded-full">
                            {m.category}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          m.status === 'replied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {m.status}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-amber-400">Subjek: {m.subject}</p>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                        "{m.message}"
                      </p>

                      {m.admin_reply && (
                        <div className="pl-4 border-l-2 border-emerald-500 text-xs text-emerald-300 font-medium">
                          <p className="font-bold">{isBm ? 'Balasan Admin:' : 'Admin Reply:'}</p>
                          <p>{m.admin_reply}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.created_at).toLocaleString()}
                        </span>

                        <button
                          onClick={() => setSelectedMsg(m)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
                        >
                          <Send size={14} />
                          <span>{isBm ? 'Balas Mesej' : 'Reply Message'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: USERS MANAGEMENT */}
        {activeTab === 'users-mgr' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">{isBm ? 'Pengurusan Pengguna' : 'User Management'}</h1>
              <p className="text-xs text-slate-400 mt-1">{isBm ? 'Senarai semua akaun berdaftar dalam pangkalan data Papar.Edu' : 'List of all registered accounts in Papar.Edu database'}</p>
            </div>

            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">{isBm ? 'Nama' : 'Name'}</th>
                      <th className="p-4">{isBm ? 'E-mel' : 'Email'}</th>
                      <th className="p-4">{isBm ? 'Peranan' : 'Role'}</th>
                      <th className="p-4">{isBm ? 'Tarikh Daftar' : 'Created Date'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-semibold">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-700/40">
                        <td className="p-4 text-slate-400">#{u.id}</td>
                        <td className="p-4 font-bold text-white">{u.full_name}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : u.role === 'provider' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-sky-500/20 text-sky-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BROADCAST SYSTEM NOTIFICATION */}
        {activeTab === 'broadcast' && (
          <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/60 max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">{isBm ? 'Siarkan Notifikasi Sistem' : 'Broadcast System Notification'}</h1>
              <p className="text-xs text-slate-400 mt-1">{isBm ? 'Hantar pengumuman penting kepada semua pengguna Papar.Edu' : 'Send announcements to all Papar.Edu users'}</p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBm ? 'Tajuk Pengumuman' : 'Announcement Title'}
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Contoh: Kursus Kemahiran Baharu Dibuka!"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBm ? 'Kandungan Mesej' : 'Message Content'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Tulis maklumat pengumuman di sini..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
              >
                🚀 {isBm ? 'Siarkan Notifikasi Sekarang' : 'Broadcast Notification Now'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">{isBm ? 'Log Aktiviti Sistem' : 'System Activity Logs'}</h1>
              <p className="text-xs text-slate-400 mt-1">{isBm ? 'Jejak rekod tindakan pengguna dan peristiwa sistem' : 'Track user actions and system events'}</p>
            </div>

            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/60 overflow-hidden">
              <div className="divide-y divide-slate-700/60">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{log.user_name || 'Pelawat'}</span>
                      <span className="mx-2 text-slate-500">•</span>
                      <span className="font-bold text-amber-400">{log.action}</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Admin Direct Reply Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">
                {isBm ? 'Balas Mesej Sokongan' : 'Reply Support Message'}
              </h3>
              <button onClick={() => setSelectedMsg(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <p className="text-slate-400">{isBm ? 'Daripada:' : 'From:'} <span className="text-white font-bold">{selectedMsg.full_name} ({selectedMsg.email})</span></p>
              <p className="text-slate-300 font-semibold mt-1">"{selectedMsg.message}"</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBm ? 'Tulis Balasan Admin' : 'Admin Reply Message'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isBm ? 'Tulis jawapan atau bantuan admin di sini...' : 'Type admin response here...'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMsg(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  {isBm ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={replying}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl"
                >
                  {replying ? 'Memproses...' : (isBm ? 'Hantar Balasan' : 'Send Reply')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
