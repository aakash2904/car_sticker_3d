const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./mysqlClient');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Auth Middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { userid, password } = req.body;
    const [rows] = await pool.execute('SELECT * FROM Users WHERE userid = ?', [userid]);

    if (!rows.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, userid: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, userid: user.userid, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Stickers Routes ──────────────────────────────────────────────────────────
app.get('/api/stickers', authMiddleware, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = ` WHERE 1=1`;
    const params = [];

    if (search) {
      whereClause += ` AND (v.plate_number LIKE ? OR o.name LIKE ? OR s.sticker_number LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    if (status) {
      whereClause += ` AND s.status = ?`;
      params.push(status);
    }

    const countQuery = `SELECT COUNT(*) as total FROM Stickers s LEFT JOIN Vehicles v ON s.vehicle_id = v.id LEFT JOIN Owners o ON v.owner_id = o.id` + whereClause;
    const [countResult] = await pool.execute(countQuery, params);

    // Provide limit and offset as numbers
    const dataQuery = `SELECT s.*, v.plate_number, v.make, v.model, v.color, v.year, o.name AS owner_name, o.contact 
                 FROM Stickers s
                 LEFT JOIN Vehicles v ON s.vehicle_id = v.id
                 LEFT JOIN Owners o ON v.owner_id = o.id` + whereClause + ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    
    const [result] = await pool.execute(dataQuery, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    res.json({
      stickers: result,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stickers', authMiddleware, async (req, res) => {
  try {
    const { vehicle_id, sticker_number, issue_date, expiry_date, status, notes } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO Stickers (vehicle_id, sticker_number, issue_date, expiry_date, status, notes, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
       [vehicle_id, sticker_number, issue_date, expiry_date, status || 'active', notes, req.user.id]
    );
    const [inserted] = await pool.execute('SELECT * FROM Stickers WHERE id = ?', [result.insertId]);
    res.json(inserted[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/stickers/:id', authMiddleware, async (req, res) => {
  try {
    const { sticker_number, issue_date, expiry_date, status, notes } = req.body;
    await pool.execute(
      `UPDATE Stickers SET sticker_number=?, issue_date=?, expiry_date=?, status=?, notes=? WHERE id=?`,
      [sticker_number, issue_date, expiry_date, status, notes, req.params.id]
    );
    const [updated] = await pool.execute('SELECT * FROM Stickers WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/stickers/:id', authMiddleware, async (req, res) => {
  try {
    await pool.execute('DELETE FROM Stickers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Vehicles Routes ──────────────────────────────────────────────────────────
app.get('/api/vehicles', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = ` WHERE 1=1`;
    const params = [];
    if (search) {
      whereClause += ` AND (v.plate_number LIKE ? OR o.name LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }
    const query = `SELECT v.*, o.name AS owner_name, o.contact FROM Vehicles v LEFT JOIN Owners o ON v.owner_id = o.id` + whereClause + ` ORDER BY v.created_at DESC`;
    const [result] = await pool.execute(query, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', authMiddleware, async (req, res) => {
  try {
    const { plate_number, make, model, color, year, owner_id } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO Vehicles (plate_number, make, model, color, year, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
       [plate_number, make, model, color, year, owner_id]
    );
    const [inserted] = await pool.execute('SELECT * FROM Vehicles WHERE id = ?', [result.insertId]);
    res.json(inserted[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Owners Routes ────────────────────────────────────────────────────────────
app.get('/api/owners', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT * FROM Owners ORDER BY name');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/owners', authMiddleware, async (req, res) => {
  try {
    const { name, contact, address, email } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO Owners (name, contact, address, email, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
       [name, contact, address, email]
    );
    const [inserted] = await pool.execute('SELECT * FROM Owners WHERE id = ?', [result.insertId]);
    res.json(inserted[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM Stickers) AS total_stickers,
        (SELECT COUNT(*) FROM Stickers WHERE status = 'active') AS active_stickers,
        (SELECT COUNT(*) FROM Stickers WHERE status = 'expired') AS expired_stickers,
        (SELECT COUNT(*) FROM Stickers WHERE expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY) AND status = 'active') AS expiring_soon,
        (SELECT COUNT(*) FROM Vehicles) AS total_vehicles,
        (SELECT COUNT(*) FROM Owners) AS total_owners
    `);
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Reports ──────────────────────────────────────────────────────────────────
app.get('/api/reports/monthly', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(`
      SELECT DATE_FORMAT(issue_date, '%Y-%m') AS month, COUNT(*) AS count
      FROM Stickers
      WHERE issue_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
      ORDER BY month
    `);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Users (Admin) ────────────────────────────────────────────────────────────
app.get('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const [result] = await pool.execute('SELECT id, userid, name, role, created_at FROM Users');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const { userid, password, name, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO Users (userid, password, name, role, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
       [userid, hashed, name, role || 'user']
    );
    const [inserted] = await pool.execute('SELECT id, userid, name, role, created_at FROM Users WHERE id = ?', [result.insertId]);
    res.json(inserted[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
