import React, { useState } from 'react';
import { GraduationCap, User, Building2, Lock, Mail, Phone, MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ initialMode = 'login', lang, onAuthSuccess, navigate }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [role, setRole] = useState('student'); // 'student' or 'provider'
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Provider Specific Fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('IPTA / Kolej Komuniti');
  const [contactPerson, setContactPerson] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isBm = lang === 'bm';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.token, data.user);
        if (data.user.role === 'admin') navigate('admin-dashboard');
        else if (data.user.role === 'provider') navigate('provider-dashboard');
        else navigate('home');
      } else {
        setError(data.message || (isBm ? 'Log masuk gagal.' : 'Login failed.'));
      }
    } catch (err) {
      setError(isBm ? 'Ralat sambungan pelayan.' : 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (signupPassword !== confirmPassword) {
      setError(isBm ? 'Kata laluan dan pengesahan kata laluan tidak sepadan.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        full_name: role === 'provider' ? (contactPerson || orgName) : fullName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
        role,
        org_name: orgName,
        org_type: orgType,
        contact_person: contactPerson,
        address
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.token, data.user);
        if (role === 'provider') navigate('provider-dashboard');
        else navigate('home');
      } else {
        setError(data.message || (isBm ? 'Pendaftaran gagal.' : 'Registration failed.'));
      }
    } catch (err) {
      setError(isBm ? 'Ralat sambungan pelayan.' : 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Autofill helpers for seamless demonstration during presentation
  const handleQuickFill = (demoType) => {
    if (demoType === 'admin') {
      setLoginEmail('admin@papar.edu');
      setLoginPassword('admin123');
    } else if (demoType === 'provider') {
      setLoginEmail('kolej.komuniti@papar.edu');
      setLoginPassword('provider123');
    } else if (demoType === 'student') {
      setLoginEmail('zulqainikkpps@gmail.com');
      setLoginPassword('student123');
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md sm:max-w-xl mx-auto">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl space-y-6">
        
        {/* Logo Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/25 mb-3">
            <GraduationCap size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {mode === 'login' ? (isBm ? 'Selamat Datang Semula' : 'Welcome Back') : (isBm ? 'Daftar Akaun Papar.Edu' : 'Create Papar.Edu Account')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? (isBm ? 'Log masuk ke portal kemahiran komuniti Papar' : 'Log in to Papar community learning portal')
              : (isBm ? 'Sertai platform pembelajaran daerah Papar' : 'Join Papar district learning platform')}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Quick Demo Login Preset Buttons */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                ⚡ {isBm ? 'Akses Pantas Demo Presentation:' : 'Demo Quick Fill Preset:'}
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => handleQuickFill('student')}
                  className="py-1.5 bg-sky-100 text-sky-800 rounded-lg hover:bg-sky-200 transition"
                >
                  Komuniti
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('provider')}
                  className="py-1.5 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition"
                >
                  Provider
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="py-1.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition"
                >
                  Admin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBm ? 'Alamat E-mel' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBm ? 'Kata Laluan' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/25 hover:from-sky-700 hover:to-indigo-700 transition"
            >
              {loading ? (isBm ? 'Memproses...' : 'Processing...') : (isBm ? 'Log Masuk' : 'Login')}
            </button>

            <div className="pt-2 text-center text-xs text-slate-500 font-medium">
              {isBm ? 'Belum mempunyai akaun?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className="font-bold text-sky-600 hover:underline"
              >
                {isBm ? 'Daftar Sekarang' : 'Sign Up'}
              </button>
            </div>
          </form>
        ) : (

          /* SIGN UP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {isBm ? 'Saya ingin mendaftar sebagai:' : 'I want to register as:'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    role === 'student'
                      ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User size={16} />
                  <span>{isBm ? 'Komuniti / Pelajar' : 'Community / Student'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    role === 'provider'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 size={16} />
                  <span>{isBm ? 'Penyedia Latihan' : 'Training Provider'}</span>
                </button>
              </div>
            </div>

            {/* Provider Notice */}
            {role === 'provider' && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 font-semibold">
                ℹ️ {isBm ? 'Pendaftaran Penyedia Latihan memerlukan kelulusan pengesahan pentadbir Papar.Edu.' : 'Training Provider registration requires Papar.Edu admin verification.'}
              </div>
            )}

            {/* Student Fields */}
            {role === 'student' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBm ? 'Nama Penuh' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muhammad Zulqaini"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </>
            ) : (

              /* Provider Fields */
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBm ? 'Nama Organisasi / Pusat Latihan' : 'Organization Name'}</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Kolej Komuniti Papar"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBm ? 'Jenis Organisasi' : 'Organization Type'}</label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="IPTA / Kolej Komuniti">IPTA / Kolej Komuniti</option>
                    <option value="IPTS / Swasta">IPTS / Swasta</option>
                    <option value="Pusat Latihan Kemahiran">Pusat Latihan Kemahiran</option>
                    <option value="Persatuan Komuniti">Persatuan Komuniti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBm ? 'Nama Pegawai Hubungan' : 'Contact Person'}</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Pn. Noraini Hassan"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBm ? 'Alamat Organisasi' : 'Address'}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Pekan Papar, 89600 Papar, Sabah"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{isBm ? 'Alamat E-mel' : 'Email Address'}</label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="zulqainikkpps@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{isBm ? 'Nombor Telefon' : 'Phone Number'}</label>
              <input
                type="text"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                placeholder="012-3456789"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isBm ? 'Kata Laluan' : 'Password'}</label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isBm ? 'Sahkan Kata Laluan' : 'Confirm Password'}</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/25 hover:from-sky-700 hover:to-indigo-700 transition"
            >
              {loading ? (isBm ? 'Memproses...' : 'Processing...') : (isBm ? 'Daftar Akaun' : 'Register Account')}
            </button>

            <div className="pt-2 text-center text-xs text-slate-500 font-medium">
              {isBm ? 'Sudah mempunyai akaun?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="font-bold text-sky-600 hover:underline"
              >
                {isBm ? 'Log Masuk' : 'Login'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
