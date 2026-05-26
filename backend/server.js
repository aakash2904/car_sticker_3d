const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');
const dotenv = require('dotenv');

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
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('userid', userid)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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

    let query = supabase.from('vw_stickers_details').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`plate_number.ilike.%${search}%,owner_name.ilike.%${search}%,sticker_number.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      stickers: data,
      total: count,
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
    
    const { data, error } = await supabase
      .from('stickers')
      .insert([{
        vehicle_id, sticker_number, issue_date, expiry_date, 
        status: status || 'active', notes, created_by: req.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/stickers/:id', authMiddleware, async (req, res) => {
  try {
    const { sticker_number, issue_date, expiry_date, status, notes } = req.body;
    
    const { data, error } = await supabase
      .from('stickers')
      .update({ sticker_number, issue_date, expiry_date, status, notes })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/stickers/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('stickers').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Vehicles Routes ──────────────────────────────────────────────────────────
app.get('/api/vehicles', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = supabase.from('vw_vehicles_details').select('*');
    
    if (search) {
      query = query.or(`plate_number.ilike.%${search}%,owner_name.ilike.%${search}%`);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', authMiddleware, async (req, res) => {
  try {
    const { plate_number, make, model, color, year, owner_id } = req.body;
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{ plate_number, make, model, color, year, owner_id }])
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Owners Routes ────────────────────────────────────────────────────────────
app.get('/api/owners', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('owners').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/owners', authMiddleware, async (req, res) => {
  try {
    const { name, contact, address, email } = req.body;
    
    const { data, error } = await supabase
      .from('owners')
      .insert([{ name, contact, address, email }])
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const [
      { count: totalStickers },
      { count: activeStickers },
      { count: expiredStickers },
      { count: totalVehicles },
      { count: totalOwners }
    ] = await Promise.all([
      supabase.from('stickers').select('*', { count: 'exact', head: true }),
      supabase.from('stickers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('stickers').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('owners').select('*', { count: 'exact', head: true })
    ]);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const dateStr = thirtyDaysFromNow.toISOString().split('T')[0];

    const { count: expiringSoon } = await supabase
      .from('stickers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .lte('expiry_date', dateStr);

    res.json({
      total_stickers: totalStickers,
      active_stickers: activeStickers,
      expired_stickers: expiredStickers,
      expiring_soon: expiringSoon,
      total_vehicles: totalVehicles,
      total_owners: totalOwners
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Reports ──────────────────────────────────────────────────────────────────
app.get('/api/reports/monthly', authMiddleware, async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const { data, error } = await supabase
      .from('stickers')
      .select('issue_date')
      .gte('issue_date', oneYearAgo.toISOString().split('T')[0]);
      
    if (error) throw error;
    
    const grouped = data.reduce((acc, curr) => {
      if (!curr.issue_date) return acc;
      const month = curr.issue_date.substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    
    const result = Object.keys(grouped).sort().map(month => ({
      month,
      count: grouped[month]
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Users (Admin) ────────────────────────────────────────────────────────────
app.get('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const { data, error } = await supabase.from('users').select('id, userid, name, role, created_at');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const { userid, password, name, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ userid, password: hashed, name, role: role || 'user' }])
      .select('id, userid, name, role, created_at')
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
