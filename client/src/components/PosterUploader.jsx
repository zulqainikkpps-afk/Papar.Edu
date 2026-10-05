import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function PosterUploader({ value, onChange, token, lang = 'bm' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isBm = lang === 'bm';

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setError('');
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError(isBm ? 'Hanya fail imej JPG, JPEG, PNG, dan WEBP dibenarkan.' : 'Only JPG, JPEG, PNG, and WEBP images are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(isBm ? 'Saiz fail melebihi had 10MB.' : 'File size exceeds 10MB limit.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('poster', file);

    try {
      const res = await fetch('/api/upload/poster', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        onChange(data.poster_url);
      } else {
        setError(data.message || (isBm ? 'Gagal memuat naik imej.' : 'Failed to upload image.'));
      }
    } catch (err) {
      setError(isBm ? 'Ralat sambungan rangkaian semasa memuat naik.' : 'Network error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        {isBm ? 'Poster / Flyer Kursus' : 'Course Poster / Flyer'} <span className="text-red-500">*</span>
      </label>

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-md">
          <img
            src={value}
            alt="Poster Preview"
            className="w-full h-72 object-cover transition duration-300 group-hover:opacity-90"
            onError={(e) => {
              e.target.src = '/posters/sample_bakery.jpg';
            }}
          />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-3">
            <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 size={14} /> {isBm ? 'Poster Dimuat Naik' : 'Poster Uploaded'}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-slate-900 rounded-xl font-medium text-sm hover:bg-slate-100 flex items-center gap-2 shadow"
            >
              <RefreshCw size={16} /> {isBm ? 'Tukar Poster' : 'Change Poster'}
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] ${
            isDragging
              ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
              : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 text-sky-600">
              <RefreshCw size={36} className="animate-spin" />
              <p className="font-semibold text-sm">
                {isBm ? 'Memuat naik poster...' : 'Uploading poster...'}
              </p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3 shadow-sm">
                <UploadCloud size={32} />
              </div>
              <p className="text-base font-bold text-slate-800 mb-1">
                {isBm ? 'Drag & Drop Course Poster Here' : 'Drag & Drop Course Poster Here'}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                {isBm ? 'Format imej disokong: JPG, JPEG, PNG, WEBP (Maks 10MB)' : 'Supported image formats: JPG, JPEG, PNG, WEBP (Max 10MB)'}
              </p>
              <button
                type="button"
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md hover:from-sky-700 hover:to-indigo-700 transition flex items-center gap-2"
              >
                <ImageIcon size={18} /> {isBm ? 'Browse Image' : 'Browse Image'}
              </button>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}
