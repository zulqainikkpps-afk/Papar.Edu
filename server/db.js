const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');

const usePostgres = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);

let dbWrapper;

if (usePostgres) {
  console.log('Connecting to Papar.Edu PostgreSQL database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
  });

  const convertQuery = (sql, params = []) => {
    let paramIndex = 1;
    let convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    // Convert DATETIME/AUTOINCREMENT syntax if present in dynamic queries
    convertedSql = convertedSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
    convertedSql = convertedSql.replace(/DATETIME/gi, 'TIMESTAMP');

    const isInsert = /^\s*INSERT\s+INTO/i.test(convertedSql);
    if (isInsert && !/RETURNING/i.test(convertedSql)) {
      convertedSql += ' RETURNING id';
    }
    return { sql: convertedSql, params };
  };

  dbWrapper = {
    isPostgres: true,
    serialize: (fn) => {
      if (fn) fn();
    },
    run: function (sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const { sql: convertedSql, params: convertedParams } = convertQuery(sql, params);
      pool.query(convertedSql, convertedParams, (err, res) => {
        if (err) {
          if (callback) callback.call({ lastID: null, changes: 0 }, err);
          return;
        }
        const lastID = (res.rows && res.rows.length > 0 && res.rows[0].id) ? res.rows[0].id : null;
        const changes = res.rowCount || 0;
        if (callback) callback.call({ lastID, changes }, null);
      });
    },
    get: function (sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const { sql: convertedSql, params: convertedParams } = convertQuery(sql, params);
      pool.query(convertedSql, convertedParams, (err, res) => {
        if (err) {
          if (callback) callback(err, null);
          return;
        }
        if (callback) callback(null, res.rows[0] || null);
      });
    },
    all: function (sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const { sql: convertedSql, params: convertedParams } = convertQuery(sql, params);
      pool.query(convertedSql, convertedParams, (err, res) => {
        if (err) {
          if (callback) callback(err, []);
          return;
        }
        if (callback) callback(null, res.rows || []);
      });
    }
  };
} else {
  const dbPath = path.join(__dirname, 'papar_edu.db');
  console.log('Connecting to Papar.Edu SQLite database at:', dbPath);
  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err);
    } else {
      console.log('Connected to Papar.Edu SQLite database.');
    }
  });

  dbWrapper = {
    isPostgres: false,
    serialize: (fn) => sqliteDb.serialize(fn),
    run: (sql, params, callback) => sqliteDb.run(sql, params, callback),
    get: (sql, params, callback) => sqliteDb.get(sql, params, callback),
    all: (sql, params, callback) => sqliteDb.all(sql, params, callback)
  };
}

// Initialize tables and seed default data
dbWrapper.serialize(() => {
  if (!usePostgres) {
    dbWrapper.run('PRAGMA foreign_keys = ON');
  }

  // 1. Users Table
  dbWrapper.run(`
    CREATE TABLE IF NOT EXISTS users (
      id ${usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'provider', 'admin')) NOT NULL DEFAULT 'student',
      created_at ${usePostgres ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Training Providers Table
  dbWrapper.run(`
    CREATE TABLE IF NOT EXISTS providers (
      id ${usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
      user_id INTEGER UNIQUE NOT NULL,
      org_name TEXT NOT NULL,
      org_type TEXT,
      contact_person TEXT,
      phone TEXT,
      official_email TEXT,
      address TEXT,
      website TEXT,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
      verified_badge INTEGER DEFAULT 0,
      created_at ${usePostgres ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 3. Courses Table
  dbWrapper.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id ${usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
      provider_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      course_date TEXT NOT NULL,
      course_time TEXT,
      duration TEXT,
      location TEXT NOT NULL,
      fee ${usePostgres ? 'DOUBLE PRECISION' : 'REAL'} DEFAULT 0,
      max_seats INTEGER DEFAULT 30,
      available_seats INTEGER DEFAULT 30,
      registration_deadline TEXT,
      contact_phone TEXT,
      registration_link TEXT,
      poster_url TEXT,
      status TEXT CHECK(status IN ('draft', 'pending', 'approved', 'published', 'rejected', 'expired', 'cancelled')) NOT NULL DEFAULT 'pending',
      is_sample INTEGER DEFAULT 0,
      what_you_will_learn TEXT,
      created_at ${usePostgres ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE CASCADE
    )
  `);

  // 4. Course Registrations Table
  dbWrapper.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id ${usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('registered', 'cancelled', 'attended')) DEFAULT 'registered',
      registered_at ${usePostgres ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    )
  `);

  // 5. Saved/Bookmarked Courses Table
  dbWrapper.run(`
    CREATE TABLE IF NOT EXISTS saved_courses (
      id ${usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      created_at ${usePostgres ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    )
  `);

  // 6. System Notifications Table
  dbWrapper.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id ${usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
      user_id INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at ${usePostgres ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 7. Contact Admin Messages Table
  dbWrapper.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id ${usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT DEFAULT 'General Inquiry',
      message TEXT NOT NULL,
      status TEXT CHECK(status IN ('unread', 'replied')) DEFAULT 'unread',
      admin_reply TEXT,
      created_at ${usePostgres ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
      replied_at ${usePostgres ? 'TIMESTAMP' : 'DATETIME'}
    )
  `);

  // 8. Activity Logs Table
  dbWrapper.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id ${usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
      user_name TEXT,
      action TEXT NOT NULL,
      details TEXT,
      created_at ${usePostgres ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP
    )
  `);

  seedInitialData();
});

function seedInitialData() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@papar.edu';
  const adminPasswordRaw = process.env.ADMIN_PASSWORD || 'admin123';
  const adminPassword = bcrypt.hashSync(adminPasswordRaw, 10);
  const providerPassword = bcrypt.hashSync('provider123', 10);
  const studentPassword = bcrypt.hashSync('student123', 10);

  dbWrapper.get("SELECT COUNT(*) AS count FROM users", [], (err, row) => {
    if (err) return;
    const count = row ? parseInt(row.count, 10) : 0;
    if (count === 0) {
      console.log('Seeding initial Papar.Edu accounts and course data...');

      // 1. Owner Administrator Account
      dbWrapper.run(
        `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
        ['Pentadbir Papar.Edu', adminEmail, '088-912345', adminPassword, 'admin'],
        function (err) {
          if (err) return;

          // 2. Training Provider Accounts
          dbWrapper.run(
            `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
            ['Kolej Komuniti Papar', 'kolej.komuniti@papar.edu', '088-911223', providerPassword, 'provider'],
            function () {
              const kolejkId = this.lastID;
              dbWrapper.run(
                `INSERT INTO providers (user_id, org_name, org_type, contact_person, phone, official_email, address, status, verified_badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [kolejkId, 'Kolej Komuniti Papar', 'IPTA / Kolej Komuniti', 'Pn. Noraini Hassan', '088-911223', 'kolej.komuniti@papar.edu', 'Pekan Papar, 89600 Papar, Sabah', 'approved', 1],
                function () {
                  const providerObjId1 = this.lastID;
                  insertSampleCourses(providerObjId1);
                }
              );
            }
          );

          dbWrapper.run(
            `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
            ['Pusat GiatMARA Papar', 'giatmara.papar@papar.edu', '088-914455', providerPassword, 'provider'],
            function () {
              const giatId = this.lastID;
              dbWrapper.run(
                `INSERT INTO providers (user_id, org_name, org_type, contact_person, phone, official_email, address, status, verified_badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [giatId, 'Pusat GiatMARA Papar', 'Pusat Latihan Kemahiran', 'En. Azman Rosli', '088-914455', 'giatmara.papar@papar.edu', 'Jalan Kinarut, 89600 Papar, Sabah', 'approved', 1]
              );
            }
          );

          dbWrapper.run(
            `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
            ['Akademi Usahawan Papar', 'info@akademi-papar.com', '013-8899776', providerPassword, 'provider'],
            function () {
              const pendingId = this.lastID;
              dbWrapper.run(
                `INSERT INTO providers (user_id, org_name, org_type, contact_person, phone, official_email, address, status, verified_badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [pendingId, 'Akademi Usahawan Papar', 'IPTS / Swasta', 'En. Haziq Haiqal', '013-8899776', 'info@akademi-papar.com', 'Bandar Sabindo Papar, Sabah', 'pending', 0]
              );
            }
          );

          // 3. Demo Student Account
          dbWrapper.run(
            `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
            ['Muhammad Zulqaini', 'zulqainikkpps@gmail.com', '012-3456789', studentPassword, 'student'],
            function () {
              const studentId = this.lastID;
              dbWrapper.run(
                `INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)`,
                [studentId, 'Selamat Datang ke Papar.Edu!', 'Akaun anda telah berjaya didaftarkan. Terokai pelbagai kursus kemahiran komuniti Papar hari ini.', 'success', 0]
              );
            }
          );

          // Broadcast Notifications
          dbWrapper.run(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (NULL, ?, ?, ?)`,
            ['Kursus Baharu Diterbitkan!', 'Kursus Asas Pembuatan Kek & Roti oleh Kolej Komuniti Papar kini dibuka untuk pendaftaran.', 'info']
          );
          dbWrapper.run(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (NULL, ?, ?, ?)`,
            ['Papar.Edu Dilancarkan', 'Selamat datang ke portal latihan kemahiran komuniti Papar, Sabah.', 'success']
          );

          // Initial Contact Messages
          dbWrapper.run(
            `INSERT INTO contact_messages (full_name, email, subject, category, message, status) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Haziq Haiqal', 'mhaziqhaiqal94@gmail.com', 'Pertanyaan Pendaftaran Penyedia Latihan', 'Training Provider Support', 'Bagaimana cara mendaftar akademi kami sebagai penyedia latihan rasmi di Papar.Edu?', 'unread']
          );

          // Initial Activity Logs
          dbWrapper.run(
            `INSERT INTO activity_logs (user_name, action, details) VALUES (?, ?, ?)`,
            ['Sistem Papar.Edu', 'Sistem Diaktifkan', 'Pangkalan data Papar.Edu dan data awal berjaya diwujudkan.']
          );
        }
      );
    }
  });
}

function insertSampleCourses(providerId) {
  const sampleCourses = [
    {
      title: 'ASAS PEMBUATAN KEK & ROTI',
      description: 'Belajar teknik asas mengadun, membakar, dan menghias kek span, bun lembut, serta roti sarang lebah secara praktikal. Sesuai untuk pemula dan individu yang berminat memulakan perniagaan bakeri rumah.',
      category: 'Bakery',
      course_date: '2026-10-25',
      course_time: '08:30 AM - 04:30 PM',
      duration: '1 Hari',
      location: 'Bengkel Bakeri Kolej Komuniti Papar',
      fee: 30.00,
      max_seats: 20,
      available_seats: 12,
      registration_deadline: '2026-10-20',
      contact_phone: '088-911223',
      registration_link: '',
      poster_url: '/posters/sample_bakery.jpg',
      status: 'published',
      is_sample: 1,
      what_you_will_learn: '• Teknik sukatan bahan bakeri yang tepat\n• Cara pembuatan doh roti sarang lebah & bun coklat\n• Kaedah pembakaran kek span span vanila & coklat\n• Asas hiasan buttercream dan pembungkusan produk'
    },
    {
      title: 'KURSUS ASAS JAHITAN',
      description: 'Pelajari kemahiran asas mengendali mesin jahit, mengukur badan, memotong pola, dan menjahit pakaian wanita tradisional (Baju Kurung Moden). Modul lengkap dengan panduan tenaga pengajar berpengalaman.',
      category: 'Sewing',
      course_date: '2026-11-02',
      course_time: '09:00 AM - 04:00 PM',
      duration: '2 Hari',
      location: 'Studio Jahitan Pekan Papar',
      fee: 40.00,
      max_seats: 15,
      available_seats: 5,
      registration_deadline: '2026-10-28',
      contact_phone: '088-911223',
      registration_link: '',
      poster_url: '/posters/sample_sewing.jpg',
      status: 'published',
      is_sample: 1,
      what_you_will_learn: '• Pengenalan jenis kain dan alatan jahitan\n• Cara mengambil ukuran badan dengan tepat\n• Melukis dan memotong pola Baju Kurung Moden\n• Teknik kemasan jahitan leher dan tepi'
    },
    {
      title: 'BASIC DIGITAL MARKETING FOR MICRO-BUSINESS',
      description: 'Tingkatkan jualan perniagaan tempatan anda menerusi strategi pemasaran media sosial (Facebook Ads, Instagram Reels, dan WhatsApp Business). Sesuai untuk usahawan kecil di daerah Papar.',
      category: 'Digital Skills',
      course_date: '2026-11-10',
      course_time: '09:00 AM - 01:00 PM',
      duration: '1 Hari',
      location: 'Makmal Komputer Dewan Masyarakat Papar',
      fee: 0.00,
      max_seats: 30,
      available_seats: 18,
      registration_deadline: '2026-11-05',
      contact_phone: '013-8899776',
      registration_link: '',
      poster_url: '/posters/sample_digital.jpg',
      status: 'published',
      is_sample: 1,
      what_you_will_learn: '• Bina Profil WhatsApp Business & Katalog Produk\n• Teknik sasaran pelanggan tempatan Papar di FB Ads\n• Pengenalan kepada copywriting jualan berkesan\n• Strategi pemasaran tanpa kos tinggi'
    },
    {
      title: 'ASAS CANVA UNTUK PERNIAGAAN & MEDIA SOSIAL',
      description: 'Kuasai aplikasi Canva untuk menghasilkan poster promosi perniagaan, kad perniagaan, dan video Reels yang memikat pelanggan tanpa mengupah pereka grafik mahal.',
      category: 'ICT',
      course_date: '2026-11-15',
      course_time: '08:30 AM - 12:30 PM',
      duration: '1 Hari',
      location: 'Dewan Perpustakaan Awam Papar',
      fee: 20.00,
      max_seats: 25,
      available_seats: 8,
      registration_deadline: '2026-11-12',
      contact_phone: '088-911223',
      registration_link: '',
      poster_url: '/posters/sample_canva.jpg',
      status: 'published',
      is_sample: 1,
      what_you_will_learn: '• Asas hierarki reka bentuk & padanan warna\n• Mencipta poster promosi produk profesional\n• Membina templat siaran media sosial berkualiti\n• Eksport fail bersaiz cetakan & digital'
    },
    {
      title: 'KURSUS ASAS KEUSAHAWANAN & PENGURUSAN KEWANGAN',
      description: 'Bimbingan khusus buat komuniti Papar yang mahu memulakan perniagaan mikro, mengurus pendaftaran SSM, akaun perniagaan ringkas, serta permohonan dana keusahawanan kerajaan.',
      category: 'Entrepreneurship',
      course_date: '2026-11-20',
      course_time: '09:00 AM - 03:00 PM',
      duration: '1 Hari',
      location: 'Bilik Seminar Kolej Komuniti Papar',
      fee: 0.00,
      max_seats: 40,
      available_seats: 24,
      registration_deadline: '2026-11-18',
      contact_phone: '088-911223',
      registration_link: '',
      poster_url: '/posters/sample_entrepreneurship.jpg',
      status: 'published',
      is_sample: 1,
      what_you_will_learn: '• Pendaftaran SSM & Lesen Perniagaan PBT\n• Asas Aliran Tunai & Buku Akaun Perniagaan\n• Peluang Geran & Pembiayaan Keusahawanan\n• Pengurusan Modal Runcit'
    }
  ];

  sampleCourses.forEach((c) => {
    dbWrapper.run(
      `INSERT INTO courses 
      (provider_id, title, description, category, course_date, course_time, duration, location, fee, max_seats, available_seats, registration_deadline, contact_phone, registration_link, poster_url, status, is_sample, what_you_will_learn) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        providerId,
        c.title,
        c.description,
        c.category,
        c.course_date,
        c.course_time,
        c.duration,
        c.location,
        c.fee,
        c.max_seats,
        c.available_seats,
        c.registration_deadline,
        c.contact_phone,
        c.registration_link,
        c.poster_url,
        c.status,
        c.is_sample,
        c.what_you_will_learn
      ]
    );
  });
}

module.exports = dbWrapper;
