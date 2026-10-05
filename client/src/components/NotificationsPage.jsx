import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, CheckCheck } from 'lucide-react';

export default function NotificationsPage({ notifications = [], lang, onMarkRead, onMarkAllRead, navigate }) {
  const isBm = lang === 'bm';

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-bold uppercase tracking-wider">
            {isBm ? 'Pusat Notifikasi' : 'Notification Centre'}
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">
            {isBm ? 'Notifikasi & Pengumuman' : 'Notifications & Announcements'}
          </h1>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onMarkAllRead}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <CheckCheck size={16} />
            <span>{isBm ? 'Tanda Semua Dibaca' : 'Mark All as Read'}</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Bell size={40} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">{isBm ? 'Tiada notifikasi setakat ini.' : 'No notifications yet.'}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onMarkRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`p-6 transition cursor-pointer flex items-start gap-4 hover:bg-slate-50 ${
                !n.is_read ? 'bg-sky-50/40' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold ${
                n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
              }`}>
                {n.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">{n.title}</h3>
                  <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : 'Terkini'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                {!n.is_read && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md text-[10px] font-extrabold uppercase">
                    {isBm ? 'Baharu' : 'New'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
