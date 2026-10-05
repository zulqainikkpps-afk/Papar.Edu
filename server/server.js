const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'papar_edu_secret_key_2026_sabah';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, 'public/uploads'),
  path.join(__dirname, '../client/public/uploads')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static assets (uploads & posters)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/posters', express.static(path.join(__dirname, 'public/posters')));

// Multer Storage Configuration for Drag & Drop Poster Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, 'poster-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg/;
    const extName = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowed.test(file.mimetype);
    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya fail imej (JPG, JPEG, PNG, WEBP, SVG) dibenarkan.'));
    }
  }
});

// Helper JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Akses tidak dibenarkan. Sila log masuk.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Sesi anda telah tamat. Sila log masuk semula.' });
    req.user = user;
    next();
  });
}

// Optional Auth Middleware
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) req.user = null;
    else req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses terhad untuk Pentadbir sahaja.' });
  }
  next();
}

function requireProvider(req, res, next) {
  if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Akses terhad untuk Penyedia Latihan sahaja.' });
  }
  next();
}

function logActivity(userName, action, details) {
  db.run(
    'INSERT INTO activity_logs (user_name, action, details) VALUES (?, ?, ?)',
    [userName || 'Pelawat', action, details || '']
  );
}

// ==========================================
// 1. AUTHENTICATION API
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  const { full_name, email, phone, password, role, org_name, org_type, contact_person, address, website } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Sila lengkapkan maklumat wajib.' });
  }

  const selectedRole = role === 'provider' ? 'provider' : 'student';
  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
    [full_name, email, phone || '', passwordHash, selectedRole],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ message: 'E-mel ini telah digunakan. Sila log masuk.' });
        }
        return res.status(500).json({ message: 'Ralat mendaftar akaun.' });
      }

      const userId = this.lastID;

      if (selectedRole === 'provider') {
        db.run(
          `INSERT INTO providers (user_id, org_name, org_type, contact_person, phone, official_email, address, website, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [userId, org_name || full_name, org_type || 'Agensi Latihan', contact_person || full_name, phone || '', email, address || 'Papar, Sabah', website || ''],
          function (err2) {
            if (err2) console.error('Provider create error:', err2);
            // Admin notification
            db.run(
              `INSERT INTO notifications (user_id, title, message, type) VALUES (NULL, ?, ?, ?)`,
              ['Penyedia Latihan Baharu Mendaftar', `Permohonan pengesahan daripada ${org_name || full_name} sedang menunggu kelulusan admin.`, 'warning']
            );
          }
        );
      }

      // Welcome Notification for user
      db.run(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
        [userId, 'Selamat Datang ke Papar.Edu!', selectedRole === 'provider' ? 'Akaun Penyedia Latihan anda telah didaftarkan dan sedang menunggu pengesahan pentadbir.' : 'Akaun komuniti anda telah berjaya dicipta. Terokai pelbagai kursus kemahiran hari ini!', 'success']
      );

      logActivity(full_name, 'Pendaftaran Akaun', `Pengguna baharu mendaftar sebagai ${selectedRole}`);

      const token = jwt.sign({ id: userId, email, role: selectedRole, name: full_name }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        token,
        user: { id: userId, full_name, email, role: selectedRole, phone }
      });
    }
  );
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Sila masukkan e-mel dan kata laluan.' });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'E-mel atau kata laluan tidak sah.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'E-mel atau kata laluan tidak sah.' });
    }

    if (user.role === 'provider') {
      db.get(`SELECT * FROM providers WHERE user_id = ?`, [user.id], (pErr, provider) => {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.full_name }, JWT_SECRET, { expiresIn: '7d' });
        logActivity(user.full_name, 'Log Masuk', 'Pengguna berjaya log masuk');
        return res.json({
          token,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            provider: provider || null
          }
        });
      });
    } else {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.full_name }, JWT_SECRET, { expiresIn: '7d' });
      logActivity(user.full_name, 'Log Masuk', 'Pengguna berjaya log masuk');
      return res.json({
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    }
  });
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get(`SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ message: 'Pengguna tidak dijumpai.' });

    if (user.role === 'provider') {
      db.get(`SELECT * FROM providers WHERE user_id = ?`, [user.id], (pErr, provider) => {
        res.json({ user: { ...user, provider: provider || null } });
      });
    } else {
      res.json({ user });
    }
  });
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { full_name, phone } = req.body;
  db.run(
    `UPDATE users SET full_name = ?, phone = ? WHERE id = ?`,
    [full_name, phone, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Ralat mengemas kini profil.' });
      res.json({ message: 'Profil berjaya dikemas kini.' });
    }
  );
});

// ==========================================
// 2. UPLOAD API
// ==========================================

app.post('/api/upload/poster', authenticateToken, upload.single('poster'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tiada fail imej dimuat naik.' });
  }

  // Copy to client public upload directory as well for immediate dev server hot serve
  const clientDest = path.join(__dirname, '../client/public/uploads', req.file.filename);
  try {
    fs.copyFileSync(req.file.path, clientDest);
  } catch (e) {
    console.error('Failed copying to client public folder:', e);
  }

  const posterUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'Poster berjaya dimuat naik.',
    poster_url: posterUrl
  });
});

// ==========================================
// 3. COURSES API
// ==========================================

// Get Courses (Public / Filtered)
app.get('/api/courses', optionalAuth, (req, res) => {
  const { search, category, location, price, provider_id, status } = req.query;

  let sql = `
    SELECT c.*, p.org_name AS provider_name, p.verified_badge AS provider_verified, p.official_email AS provider_email
    FROM courses c
    JOIN providers p ON c.provider_id = p.id
    WHERE 1=1
  `;
  const params = [];

  // Non-admin or public users default to published courses
  if (!req.user || req.user.role === 'student') {
    sql += ` AND c.status = 'published'`;
  } else if (status) {
    sql += ` AND c.status = ?`;
    params.push(status);
  }

  if (category && category !== 'All') {
    sql += ` AND c.category = ?`;
    params.push(category);
  }

  if (provider_id) {
    sql += ` AND c.provider_id = ?`;
    params.push(provider_id);
  }

  if (location && location !== 'All') {
    sql += ` AND c.location LIKE ?`;
    params.push(`%${location}%`);
  }

  if (price === 'free') {
    sql += ` AND c.fee = 0`;
  } else if (price === 'paid') {
    sql += ` AND c.fee > 0`;
  }

  if (search) {
    sql += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.category LIKE ? OR p.org_name LIKE ?)`;
    const sTerm = `%${search}%`;
    params.push(sTerm, sTerm, sTerm, sTerm);
  }

  sql += ` ORDER BY c.id DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Ralat mengambil senarai kursus.' });
    }

    // Attach registration & saved status if logged in user
    if (req.user) {
      const courseIds = rows.map(r => r.id);
      if (courseIds.length === 0) return res.json({ courses: [] });

      const placeholders = courseIds.map(() => '?').join(',');
      db.all(
        `SELECT course_id FROM registrations WHERE user_id = ? AND course_id IN (${placeholders})`,
        [req.user.id, ...courseIds],
        (regErr, regRows) => {
          const registeredSet = new Set((regRows || []).map(r => r.course_id));

          db.all(
            `SELECT course_id FROM saved_courses WHERE user_id = ? AND course_id IN (${placeholders})`,
            [req.user.id, ...courseIds],
            (saveErr, saveRows) => {
              const savedSet = new Set((saveRows || []).map(r => r.course_id));

              const enriched = rows.map(c => ({
                ...c,
                is_registered: registeredSet.has(c.id),
                is_saved: savedSet.has(c.id)
              }));

              res.json({ courses: enriched });
            }
          );
        }
      );
    } else {
      res.json({ courses: rows });
    }
  });
});

// Get Single Course Details
app.get('/api/courses/:id', optionalAuth, (req, res) => {
  const courseId = req.params.id;

  db.get(
    `SELECT c.*, p.org_name AS provider_name, p.org_type AS provider_type, p.verified_badge AS provider_verified, p.phone AS provider_phone, p.official_email AS provider_email, p.address AS provider_address, p.website AS provider_website
     FROM courses c
     JOIN providers p ON c.provider_id = p.id
     WHERE c.id = ?`,
    [courseId],
    (err, course) => {
      if (err || !course) return res.status(404).json({ message: 'Kursus tidak dijumpai.' });

      if (req.user) {
        db.get(
          `SELECT id FROM registrations WHERE user_id = ? AND course_id = ?`,
          [req.user.id, courseId],
          (rErr, reg) => {
            db.get(
              `SELECT id FROM saved_courses WHERE user_id = ? AND course_id = ?`,
              [req.user.id, courseId],
              (sErr, saved) => {
                res.json({
                  course: {
                    ...course,
                    is_registered: !!reg,
                    is_saved: !!saved
                  }
                });
              }
            );
          }
        );
      } else {
        res.json({ course: { ...course, is_registered: false, is_saved: false } });
      }
    }
  );
});

// Create Course (Provider)
app.post('/api/courses', authenticateToken, requireProvider, (req, res) => {
  const {
    title, description, category, course_date, course_time, duration,
    location, fee, max_seats, registration_deadline, contact_phone,
    registration_link, poster_url, what_you_will_learn
  } = req.body;

  if (!title || !category || !course_date || !location) {
    return res.status(400).json({ message: 'Sila isikan tajuk, kategori, tarikh, dan lokasi kursus.' });
  }

  // Get provider record
  db.get(`SELECT * FROM providers WHERE user_id = ?`, [req.user.id], (pErr, provider) => {
    if (pErr || !provider) {
      return res.status(400).json({ message: 'Profil Penyedia Latihan anda tidak dijumpai.' });
    }

    if (provider.status !== 'approved' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akaun Penyedia Latihan anda masih dalam pengesahan admin. Anda belum dibenarkan menerbitkan kursus.' });
    }

    const seats = parseInt(max_seats) || 30;
    const feeVal = parseFloat(fee) || 0;
    const initialStatus = req.user.role === 'admin' ? 'published' : 'pending';

    db.run(
      `INSERT INTO courses 
      (provider_id, title, description, category, course_date, course_time, duration, location, fee, max_seats, available_seats, registration_deadline, contact_phone, registration_link, poster_url, status, what_you_will_learn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        provider.id,
        title,
        description || '',
        category,
        course_date,
        course_time || '09:00 AM - 04:00 PM',
        duration || '1 Hari',
        location,
        feeVal,
        seats,
        seats,
        registration_deadline || course_date,
        contact_phone || provider.phone,
        registration_link || '',
        poster_url || '/posters/sample_bakery.jpg',
        initialStatus,
        what_you_will_learn || ''
      ],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Ralat mencipta kursus.' });
        }

        const newCourseId = this.lastID;

        // Notify Admin if pending
        if (initialStatus === 'pending') {
          db.run(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (NULL, ?, ?, ?)`,
            ['Permohonan Kursus Baharu', `Kursus "${title}" oleh ${provider.org_name} memerlukan kelulusan pentadbir.`, 'warning']
          );
        }

        logActivity(req.user.name, 'Bina Kursus', `Kursus baharu: ${title}`);
        res.json({
          message: initialStatus === 'published' ? 'Kursus berjaya diterbitkan!' : 'Kursus telah dihantar dan sedang menunggu kelulusan admin.',
          course_id: newCourseId,
          status: initialStatus
        });
      }
    );
  });
});

// Update Course
app.put('/api/courses/:id', authenticateToken, requireProvider, (req, res) => {
  const courseId = req.params.id;
  const {
    title, description, category, course_date, course_time, duration,
    location, fee, max_seats, registration_deadline, contact_phone,
    registration_link, poster_url, what_you_will_learn, status
  } = req.body;

  db.run(
    `UPDATE courses SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      course_date = COALESCE(?, course_date),
      course_time = COALESCE(?, course_time),
      duration = COALESCE(?, duration),
      location = COALESCE(?, location),
      fee = COALESCE(?, fee),
      max_seats = COALESCE(?, max_seats),
      registration_deadline = COALESCE(?, registration_deadline),
      contact_phone = COALESCE(?, contact_phone),
      registration_link = COALESCE(?, registration_link),
      poster_url = COALESCE(?, poster_url),
      what_you_will_learn = COALESCE(?, what_you_will_learn),
      status = COALESCE(?, status)
     WHERE id = ?`,
    [
      title, description, category, course_date, course_time, duration,
      location, fee, max_seats, registration_deadline, contact_phone,
      registration_link, poster_url, what_you_will_learn, status, courseId
    ],
    function (err) {
      if (err) return res.status(500).json({ message: 'Ralat kemas kini kursus.' });
      logActivity(req.user.name, 'Kemas Kini Kursus', `Kemas kini kursus ID: ${courseId}`);
      res.json({ message: 'Kursus berjaya dikemas kini.' });
    }
  );
});

// Delete Course
app.delete('/api/courses/:id', authenticateToken, requireProvider, (req, res) => {
  const courseId = req.params.id;
  db.run(`DELETE FROM courses WHERE id = ?`, [courseId], function (err) {
    if (err) return res.status(500).json({ message: 'Ralat memadam kursus.' });
    logActivity(req.user.name, 'Padam Kursus', `Padam kursus ID: ${courseId}`);
    res.json({ message: 'Kursus berjaya dipadam.' });
  });
});

// ==========================================
// 4. REGISTRATIONS & SAVED COURSES API
// ==========================================

// Register for a Course
app.post('/api/courses/:id/register', authenticateToken, (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  db.get(`SELECT * FROM courses WHERE id = ?`, [courseId], (err, course) => {
    if (err || !course) return res.status(404).json({ message: 'Kursus tidak dijumpai.' });

    if (course.available_seats <= 0) {
      return res.status(400).json({ message: 'Maaf, tempat bagi kursus ini telah penuh (Kursus Penuh).' });
    }

    db.run(
      `INSERT INTO registrations (user_id, course_id, status) VALUES (?, ?, 'registered')`,
      [userId, courseId],
      function (regErr) {
        if (regErr) {
          if (regErr.message.includes('UNIQUE')) {
            return res.status(400).json({ message: 'Anda telah pun mendaftar untuk kursus ini.' });
          }
          return res.status(500).json({ message: 'Ralat semasa mendaftar kursus.' });
        }

        // Deduct 1 available seat
        db.run(`UPDATE courses SET available_seats = available_seats - 1 WHERE id = ?`, [courseId]);

        // User Notification
        db.run(
          `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
          [userId, 'Pendaftaran Kursus Berjaya!', `Pendaftaran anda untuk kursus "${course.title}" telah diterima.`, 'success']
        );

        // Notify Provider
        db.get(`SELECT user_id FROM providers WHERE id = ?`, [course.provider_id], (pErr, pRow) => {
          if (pRow) {
            db.run(
              `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
              [pRow.user_id, 'Pendaftaran Baharu Received', `Seorang pesertabaharu mendaftar untuk "${course.title}".`, 'info']
            );
          }
        });

        logActivity(req.user.name, 'Daftar Kursus', `Mendaftar kursus: ${course.title}`);
        res.json({ message: 'Pendaftaran anda berjaya disahkan!' });
      }
    );
  });
});

// Cancel Registration
app.delete('/api/courses/:id/register', authenticateToken, (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  db.run(
    `DELETE FROM registrations WHERE user_id = ? AND course_id = ?`,
    [userId, courseId],
    function (err) {
      if (err || this.changes === 0) {
        return res.status(400).json({ message: 'Pendaftaran tidak dijumpai.' });
      }

      // Restore 1 seat
      db.run(`UPDATE courses SET available_seats = available_seats + 1 WHERE id = ?`, [courseId]);

      logActivity(req.user.name, 'Batal Pendaftaran', `Membatalkan pendaftaran kursus ID: ${courseId}`);
      res.json({ message: 'Pendaftaran anda telah dibatalkan.' });
    }
  );
});

// Get My Registered Courses
app.get('/api/user/registrations', authenticateToken, (req, res) => {
  db.all(
    `SELECT r.id AS reg_id, r.registered_at, r.status AS reg_status, c.*, p.org_name AS provider_name
     FROM registrations r
     JOIN courses c ON r.course_id = c.id
     JOIN providers p ON c.provider_id = p.id
     WHERE r.user_id = ?
     ORDER BY r.registered_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Ralat mengambil pendaftaran.' });
      res.json({ registrations: rows });
    }
  );
});

// Save / Bookmark Course
app.post('/api/courses/:id/save', authenticateToken, (req, res) => {
  const courseId = req.params.id;
  db.run(
    `INSERT INTO saved_courses (user_id, course_id) VALUES (?, ?)`,
    [req.user.id, courseId],
    function (err) {
      if (err) return res.status(400).json({ message: 'Kursus ini sudah ada dalam senarai simpanan anda.' });
      res.json({ message: 'Kursus berjaya disimpan.' });
    }
  );
});

// Unsave Course
app.delete('/api/courses/:id/save', authenticateToken, (req, res) => {
  const courseId = req.params.id;
  db.run(
    `DELETE FROM saved_courses WHERE user_id = ? AND course_id = ?`,
    [req.user.id, courseId],
    function (err) {
      res.json({ message: 'Kursus telah dikeluarkan daripada simpanan.' });
    }
  );
});

// Get Saved Courses
app.get('/api/user/saved', authenticateToken, (req, res) => {
  db.all(
    `SELECT s.id AS save_id, c.*, p.org_name AS provider_name
     FROM saved_courses s
     JOIN courses c ON s.course_id = c.id
     JOIN providers p ON c.provider_id = p.id
     WHERE s.user_id = ?
     ORDER BY s.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Ralat mengambil kursus tersimpan.' });
      res.json({ saved_courses: rows });
    }
  );
});

// Provider View Participants List
app.get('/api/provider/registrations', authenticateToken, requireProvider, (req, res) => {
  db.get(`SELECT id FROM providers WHERE user_id = ?`, [req.user.id], (pErr, provider) => {
    if (pErr || !provider) return res.status(400).json({ message: 'Profil provider tidak wujud.' });

    db.all(
      `SELECT r.id AS reg_id, r.registered_at, r.status AS reg_status, u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone, c.title AS course_title, c.id AS course_id
       FROM registrations r
       JOIN courses c ON r.course_id = c.id
       JOIN users u ON r.user_id = u.id
       WHERE c.provider_id = ?
       ORDER BY r.registered_at DESC`,
      [provider.id],
      (err, rows) => {
        if (err) return res.status(500).json({ message: 'Ralat mengambil senarai peserta.' });
        res.json({ participants: rows });
      }
    );
  });
});

// ==========================================
// 5. PROVIDERS DIRECTORY API
// ==========================================

app.get('/api/providers', (req, res) => {
  db.all(
    `SELECT p.*, COUNT(c.id) AS course_count
     FROM providers p
     LEFT JOIN courses c ON p.id = c.provider_id AND c.status = 'published'
     WHERE p.status = 'approved'
     GROUP BY p.id
     ORDER BY p.org_name ASC`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Ralat mengambil senarai penyedia.' });
      res.json({ providers: rows });
    }
  );
});

app.get('/api/providers/:id', (req, res) => {
  const providerId = req.params.id;
  db.get(`SELECT * FROM providers WHERE id = ?`, [providerId], (err, provider) => {
    if (err || !provider) return res.status(404).json({ message: 'Penyedia latihan tidak dijumpai.' });

    db.all(`SELECT * FROM courses WHERE provider_id = ? AND status = 'published'`, [providerId], (cErr, courses) => {
      res.json({ provider, courses });
    });
  });
});

// ==========================================
// 6. NOTIFICATIONS API
// ==========================================

app.get('/api/notifications', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : null;
  let sql = `SELECT * FROM notifications WHERE user_id IS NULL`;
  const params = [];

  if (userId) {
    sql += ` OR user_id = ?`;
    params.push(userId);
  }

  sql += ` ORDER BY created_at DESC LIMIT 30`;

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Ralat mengambil notifikasi.' });

    const unreadCount = rows.filter(n => !n.is_read).length;
    res.json({ notifications: rows, unreadCount });
  });
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  db.run(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [req.params.id], (err) => {
    res.json({ message: 'Notifikasi ditanda dibaca.' });
  });
});

app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL`, [req.user.id], (err) => {
    res.json({ message: 'Semua notifikasi ditanda dibaca.' });
  });
});

// ==========================================
// 7. CONTACT ADMIN API
// ==========================================

app.post('/api/contact', (req, res) => {
  const { full_name, email, subject, category, message } = req.body;

  if (!full_name || !email || !message) {
    return res.status(400).json({ message: 'Sila lengkapkan maklumat wajib dalam borang.' });
  }

  db.run(
    `INSERT INTO contact_messages (full_name, email, subject, category, message, status) VALUES (?, ?, ?, ?, ?, 'unread')`,
    [full_name, email, subject || 'General Inquiry', category || 'General Inquiry', message],
    function (err) {
      if (err) return res.status(500).json({ message: 'Ralat menghantar mesej sokongan.' });

      // Notify Admin
      db.run(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (NULL, ?, ?, ?)`,
        ['Mesej Hubungi Kami Baharu', `Mesej daripada ${full_name} (${subject}): ${message.substring(0, 50)}...`, 'info']
      );

      logActivity(full_name, 'Mesej Sokongan', `Mesej daripada ${email}`);
      res.json({ message: 'Mesej anda telah berjaya dihantar! Pentadbir Papar.Edu akan maklum balas secepat mungkin.' });
    }
  );
});

// Admin Get Messages
app.get('/api/admin/contact-messages', authenticateToken, requireAdmin, (req, res) => {
  db.all(`SELECT * FROM contact_messages ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Ralat mengambil mesej sokongan.' });
    res.json({ messages: rows });
  });
});

// Admin Reply to Message
app.post('/api/admin/contact-messages/:id/reply', authenticateToken, requireAdmin, (req, res) => {
  const messageId = req.params.id;
  const { admin_reply } = req.body;

  if (!admin_reply) return res.status(400).json({ message: 'Sila tulis balasan mesej.' });

  db.get(`SELECT * FROM contact_messages WHERE id = ?`, [messageId], (err, msg) => {
    if (err || !msg) return res.status(404).json({ message: 'Mesej tidak dijumpai.' });

    db.run(
      `UPDATE contact_messages SET status = 'replied', admin_reply = ?, replied_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [admin_reply, messageId],
      function (uErr) {
        if (uErr) return res.status(500).json({ message: 'Ralat mengemas kini balasan.' });

        // Notify User if user exists with matching email
        db.get(`SELECT id FROM users WHERE email = ?`, [msg.email], (usrErr, user) => {
          if (user) {
            db.run(
              `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
              [user.id, 'Balasan Daripada Admin Papar.Edu', `Mengenai: "${msg.subject}" - ${admin_reply}`, 'success']
            );
          }
        });

        logActivity(req.user.name, 'Balas Mesej', `Membalas mesej daripada ${msg.email}`);
        res.json({ message: 'Balasan telah berjaya dihantar kepada pengguna.' });
      }
    );
  });
});

// ==========================================
// 8. ADMIN DASHBOARD & CONTROL API
// ==========================================

// Dashboard Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  db.get(`SELECT COUNT(*) AS total_users FROM users WHERE role = 'student'`, (e1, uRow) => {
    db.get(`SELECT COUNT(*) AS total_providers FROM providers WHERE status = 'approved'`, (e2, pRow) => {
      db.get(`SELECT COUNT(*) AS pending_providers FROM providers WHERE status = 'pending'`, (e3, ppRow) => {
        db.get(`SELECT COUNT(*) AS total_courses FROM courses`, (e4, cRow) => {
          db.get(`SELECT COUNT(*) AS active_courses FROM courses WHERE status = 'published'`, (e5, acRow) => {
            db.get(`SELECT COUNT(*) AS pending_courses FROM courses WHERE status = 'pending'`, (e6, pcRow) => {
              db.get(`SELECT COUNT(*) AS total_registrations FROM registrations`, (e7, rRow) => {
                db.get(`SELECT COUNT(*) AS unread_messages FROM contact_messages WHERE status = 'unread'`, (e8, mRow) => {
                  res.json({
                    stats: {
                      total_users: uRow ? uRow.total_users : 0,
                      total_providers: pRow ? pRow.total_providers : 0,
                      pending_providers: ppRow ? ppRow.pending_providers : 0,
                      total_courses: cRow ? cRow.total_courses : 0,
                      active_courses: acRow ? acRow.active_courses : 0,
                      pending_courses: pcRow ? pcRow.pending_courses : 0,
                      total_registrations: rRow ? rRow.total_registrations : 0,
                      unread_messages: mRow ? mRow.unread_messages : 0
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// Users List
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  db.all(`SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY id DESC`, (err, rows) => {
    res.json({ users: rows });
  });
});

// Providers List & Verification Queue
app.get('/api/admin/providers', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    `SELECT p.*, u.full_name AS user_name, u.email AS user_email
     FROM providers p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.id DESC`,
    (err, rows) => {
      res.json({ providers: rows });
    }
  );
});

// Approve/Reject Provider Verification
app.put('/api/admin/providers/:id/verify', authenticateToken, requireAdmin, (req, res) => {
  const providerId = req.params.id;
  const { status, verified_badge } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status tidak sah.' });
  }

  const isVerified = status === 'approved' ? (verified_badge !== undefined ? verified_badge : 1) : 0;

  db.run(
    `UPDATE providers SET status = ?, verified_badge = ? WHERE id = ?`,
    [status, isVerified, providerId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Ralat pengesahan penyedia.' });

      db.get(`SELECT user_id, org_name FROM providers WHERE id = ?`, [providerId], (pErr, pRow) => {
        if (pRow) {
          const msg = status === 'approved'
            ? `Tahniah! Permohonan Penyedia Latihan untuk "${pRow.org_name}" telah DILULUSKAN. Anda kini boleh menerbitkan kursus di Papar.Edu.`
            : `Maaf, permohonan Penyedia Latihan untuk "${pRow.org_name}" telah DITOLAK. Sila hubungi pentadbir untuk maklumat lanjut.`;

          db.run(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
            [pRow.user_id, 'Status Pengesahan Penyedia Latihan', msg, status === 'approved' ? 'success' : 'error']
          );
        }
      });

      logActivity(req.user.name, 'Pengesahan Provider', `Provider ID ${providerId} status ditukar ke ${status}`);
      res.json({ message: `Status Penyedia Latihan berjaya dikemas kini kepada ${status.toUpperCase()}.` });
    }
  );
});

// Courses List for Admin Approval
app.get('/api/admin/courses', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    `SELECT c.*, p.org_name AS provider_name
     FROM courses c
     JOIN providers p ON c.provider_id = p.id
     ORDER BY c.id DESC`,
    (err, rows) => {
      res.json({ courses: rows });
    }
  );
});

// Approve/Reject Course
app.put('/api/admin/courses/:id/approve', authenticateToken, requireAdmin, (req, res) => {
  const courseId = req.params.id;
  const { status } = req.body; // 'published' or 'rejected'

  if (!['published', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status tidak sah.' });
  }

  db.run(
    `UPDATE courses SET status = ? WHERE id = ?`,
    [status, courseId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Ralat kelulusan kursus.' });

      db.get(
        `SELECT c.title, p.user_id, p.org_name FROM courses c JOIN providers p ON c.provider_id = p.id WHERE c.id = ?`,
        [courseId],
        (cErr, cRow) => {
          if (cRow) {
            const msg = status === 'published'
              ? `Kursus anda "${cRow.title}" telah DILULUSKAN dan kini disiarkan di Papar.Edu!`
              : `Kursus anda "${cRow.title}" telah DITOLAK oleh pentadbir. Sila semak kandungan kursus anda.`;

            db.run(
              `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
              [cRow.user_id, 'Status Permohonan Kursus', msg, status === 'published' ? 'success' : 'error']
            );

            if (status === 'published') {
              // Broadcast to all students
              db.run(
                `INSERT INTO notifications (user_id, title, message, type) VALUES (NULL, ?, ?, ?)`,
                ['Kursus Baharu Tersedia!', `Kursus "${cRow.title}" oleh ${cRow.org_name} kini dibuka untuk pendaftaran!`, 'info']
              );
            }
          }
        }
      );

      logActivity(req.user.name, 'Kelulusan Kursus', `Kursus ID ${courseId} ditukar status ke ${status}`);
      res.json({ message: `Kursus berjaya ditukar status kepada ${status.toUpperCase()}.` });
    }
  );
});

// Broadcast System Notification
app.post('/api/admin/notifications/broadcast', authenticateToken, requireAdmin, (req, res) => {
  const { title, message, type } = req.body;
  if (!title || !message) return res.status(400).json({ message: 'Sila lengkapkan tajuk dan mesej notifikasi.' });

  db.run(
    `INSERT INTO notifications (user_id, title, message, type) VALUES (NULL, ?, ?, ?)`,
    [title, message, type || 'info'],
    function (err) {
      if (err) return res.status(500).json({ message: 'Ralat menyiarkan notifikasi.' });
      logActivity(req.user.name, 'Notifikasi Awam', `Siaran notifikasi: ${title}`);
      res.json({ message: 'Notifikasi sistem telah berjaya disiarkan kepada semua pengguna!' });
    }
  );
});

// Activity Logs
app.get('/api/admin/activity-logs', authenticateToken, requireAdmin, (req, res) => {
  db.all(`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50`, (err, rows) => {
    res.json({ logs: rows });
  });
});

// ==========================================
// 9. CATCH-ALL ROUTE & START SERVER
// ==========================================

app.use(express.static(path.join(__dirname, '../client/dist')));

app.use((req, res) => {
  if (fs.existsSync(path.join(__dirname, '../client/dist/index.html'))) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  } else {
    res.send('Papar.Edu API backend component running live on port ' + PORT);
  }
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`Papar.Edu API Server is running on http://localhost:${PORT}`);
  console.log(`===================================================`);
});
