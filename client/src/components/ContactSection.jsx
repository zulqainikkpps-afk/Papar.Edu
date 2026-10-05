import React, { useState } from 'react';
import { Send, Mail, MapPin, Clock, Phone, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactSection({ lang, user }) {
  const isBm = lang === 'bm';

  const [fullName, setFullName] = useState(user ? user.full_name : 'Haziq Haiqal & Muhammad Zulqaini');
  const [email, setEmail] = useState(user ? user.email : 'zulqainikkpps@gmail.com');
  const [subject, setSubject] = useState(isBm ? 'Pertanyaan Am' : 'General Inquiry');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'General Inquiry', labelBm: 'Pertanyaan Am', labelEn: 'General Inquiry' },
    { value: 'Account Problem', labelBm: 'Masalah Akaun', labelEn: 'Account Problem' },
    { value: 'Course Information', labelBm: 'Maklumat Kursus', labelEn: 'Course Information' },
    { value: 'Registration Problem', labelBm: 'Masalah Pendaftaran', labelEn: 'Registration Problem' },
    { value: 'Training Provider Support', labelBm: 'Sokongan Penyedia Latihan', labelEn: 'Training Provider Support' },
    { value: 'Technical Problem', labelBm: 'Masalah Teknikal', labelEn: 'Technical Problem' },
    { value: 'Report an Issue', labelBm: 'Laporkan Isu', labelEn: 'Report an Issue' },
    { value: 'Others', labelBm: 'Lain-lain', labelEn: 'Others' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, subject, category, message })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg(
          isBm
            ? 'Mesej anda telah berjaya dihantar. Admin kami akan membalas secepat mungkin.'
            : 'Your message has been sent successfully. Our admin will respond as soon as possible.'
        );
        setMessage('');
      } else {
        setStatusMsg(data.message || (isBm ? 'Ralat menghantar mesej.' : 'Error sending message.'));
      }
    } catch (e) {
      setStatusMsg(isBm ? 'Ralat sambungan pelayan.' : 'Server connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="px-3.5 py-1.5 bg-sky-100 text-sky-800 rounded-full text-xs font-bold uppercase tracking-wider">
            {isBm ? 'Hubungi Admin Papar.Edu' : 'Contact Papar.Edu Support'}
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">
            {isBm ? 'Perlukan Bantuan Menggunakan Papar.Edu?' : 'Need Help Using Papar.Edu?'}
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            {isBm
              ? 'Jika anda mempunyai soalan, mengalami masalah teknikal, mendapati maklumat kursus tidak betul, atau memerlukan bantuan akaun, sila hubungi pentadbir.'
              : 'If you have questions, experience technical problems, find incorrect course info, or need help with your account, please contact the administrator.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Form Left */}
          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-sky-600" />
              {isBm ? 'Hantar Mesej Kepada Admin' : 'Send a Message'}
            </h3>

            {statusMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-start gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{statusMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBm ? 'Nama Penuh' : 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Haziq Haiqal & Muhammad Zulqaini"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBm ? 'Alamat E-mel' : 'Email Address'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="zulqainikkpps@gmail.com or mhaziqhaiqal94@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Kategori Pertanyaan' : 'Inquiry Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {isBm ? c.labelBm : c.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBm ? 'Subjek' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="General Inquiry"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBm ? 'Mesej Anda' : 'Message'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isBm ? 'Huraikan soalan atau masalah anda di sini...' : 'Describe your question or problem here...'}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:from-sky-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Send size={16} />
                <span>{submitting ? (isBm ? 'Menghantar...' : 'Sending...') : (isBm ? 'Hantar Mesej' : 'Send Message')}</span>
              </button>
            </form>
          </div>

          {/* Official Contact Info Right */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-xl font-black">{isBm ? 'Maklumat Hubungan' : 'Contact Information'}</h3>

              <div className="space-y-4 text-xs font-medium">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Papar.Edu Support</p>
                    <p className="text-slate-400 mt-0.5">Papar, Sabah, Malaysia</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Email Support</p>
                    <p className="text-sky-300 mt-0.5">admin@papar.edu</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      zulqainikkpps@gmail.com / mhaziqhaiqal94@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{isBm ? 'Waktu Sokongan' : 'Support Hours'}</p>
                    <p className="text-slate-400 mt-0.5">{isBm ? 'Isnin – Jumaat' : 'Monday – Friday'}</p>
                    <p className="text-slate-400">8:00 AM – 5:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                {isBm
                  ? 'Pentadbir kami sedia membantu memberikan bimbingan kepada komuniti Papar dan penyedia latihan.'
                  : 'Our administrators are ready to provide assistance to the Papar community and training providers.'}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
