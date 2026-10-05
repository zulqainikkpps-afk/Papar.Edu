const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../client/public/posters'),
  path.join(__dirname, 'public/posters')
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const posters = [
  {
    filename: 'sample_bakery.jpg',
    title: 'ASAS PEMBUATAN KEK & ROTI',
    category: 'BAKERY & PASTRY',
    subtitle: 'Bengkel Praktikal 1 Hari • Papar, Sabah',
    bgGradient: 'linear-gradient(135deg, #f97316 0%, #b45309 100%)',
    badge: 'RM30 • YURAN KURSUS',
    icon: '🍰'
  },
  {
    filename: 'sample_sewing.jpg',
    title: 'KURSUS ASAS JAHITAN',
    category: 'JAHITAN & REKA FESYEN',
    subtitle: 'Baju Kurung Moden • 2 Hari Bengkel',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #831843 100%)',
    badge: 'RM40 • PENDAFTARAN DIBUKA',
    icon: '🧵'
  },
  {
    filename: 'sample_digital.jpg',
    title: 'DIGITAL MARKETING UNTUK PENIAGA',
    category: 'DIGITAL SKILLS & MEDIA SOSIAL',
    subtitle: 'FB Ads, Reels & WhatsApp Business',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    badge: 'PERCUMA (PERCUMA)',
    icon: '💻'
  },
  {
    filename: 'sample_canva.jpg',
    title: 'ASAS CANVA UNTUK PERNIAGAAN',
    category: 'ICT & GRAFIK',
    subtitle: 'Hasilkan Poster & Video Promosi',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)',
    badge: 'RM20 • TERHAD 25 TEMPAT',
    icon: '🎨'
  },
  {
    filename: 'sample_entrepreneurship.jpg',
    title: 'ASAS KEUSAHAWANAN & KEWANGAN',
    category: 'KEUSAHAWANAN & PENDAPATAN',
    subtitle: 'Pendaftaran SSM & Dana Kerajaan',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    badge: 'PERCUMA (PERCUMA)',
    icon: '📊'
  }
];

posters.forEach(p => {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
    <defs>
      <linearGradient id="grad_${p.filename.replace('.jpg','')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.bgGradient.match(/#([0-9a-fA-F]{6})/g)[0]}" />
        <stop offset="100%" stop-color="${p.bgGradient.match(/#([0-9a-fA-F]{6})/g)[1]}" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.3"/>
      </filter>
    </defs>
    <!-- Background -->
    <rect width="800" height="1000" fill="url(#grad_${p.filename.replace('.jpg','')})" />
    
    <!-- Decorative patterns -->
    <circle cx="700" cy="150" r="250" fill="#ffffff" opacity="0.08" />
    <circle cx="100" cy="850" r="300" fill="#ffffff" opacity="0.05" />
    <rect x="60" y="60" width="680" height="880" rx="24" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.25"/>

    <!-- Header Tag -->
    <rect x="100" y="110" width="280" height="44" rx="22" fill="#ffffff" opacity="0.9" />
    <text x="120" y="138" font-family="'Outfit', 'Inter', sans-serif" font-weight="700" font-size="16" fill="#0f172a" letter-spacing="1">${p.category}</text>

    <!-- Center Icon Circle -->
    <circle cx="400" cy="380" r="130" fill="#ffffff" opacity="0.95" filter="url(#shadow)"/>
    <text x="400" y="425" font-size="110" text-anchor="middle">${p.icon}</text>

    <!-- Course Title -->
    <text x="400" y="600" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="38" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">
      ${p.title.split(' ').slice(0, 3).join(' ')}
    </text>
    <text x="400" y="650" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="38" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">
      ${p.title.split(' ').slice(3).join(' ')}
    </text>

    <!-- Subtitle -->
    <text x="400" y="720" font-family="'Inter', sans-serif" font-weight="500" font-size="22" fill="#f8fafc" text-anchor="middle" opacity="0.9">
      ${p.subtitle}
    </text>

    <!-- Badge Banner -->
    <rect x="200" y="790" width="400" height="60" rx="30" fill="#0f172a" opacity="0.9" />
    <text x="400" y="828" font-family="'Inter', sans-serif" font-weight="800" font-size="20" fill="#fbbf24" text-anchor="middle" letter-spacing="1">
      ${p.badge}
    </text>

    <!-- Provider Footer -->
    <text x="400" y="900" font-family="'Inter', sans-serif" font-weight="600" font-size="18" fill="#ffffff" text-anchor="middle" opacity="0.8">
      Papar.Edu • Portal Kemahiran Komuniti Papar
    </text>
  </svg>`;

  targetDirs.forEach(dir => {
    fs.writeFileSync(path.join(dir, p.filename), svgContent);
    // Also save as .svg just in case
    fs.writeFileSync(path.join(dir, p.filename.replace('.jpg', '.svg')), svgContent);
  });
});

console.log('Sample course posters created successfully in public/posters!');
