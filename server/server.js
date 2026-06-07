const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'budgetflow_secret_2024';
const IS_PROD = process.env.NODE_ENV === 'production';

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,          // e.g. https://budgetflow.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow no-origin (mobile apps, curl) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ─── Database — try MongoDB first, fall back to JSON file ─────────────────────
let useMongoose = false;
let mongoose, User, Transaction, Goal;

async function initDB() {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      mongoose = require('mongoose');
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected');

      User = mongoose.model('User', new mongoose.Schema({
        email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
        password:  String,
        name:      { type: String, default: 'User' },
        isGuest:   { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      }));

      Transaction = mongoose.model('Transaction', new mongoose.Schema({
        userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title:    String,
        amount:   Number,
        category: String,
        type:     { type: String, enum: ['income', 'expense'], default: 'expense' },
        notes:    String,
        date:     { type: Date, default: Date.now },
      }));

      Goal = mongoose.model('Goal', new mongoose.Schema({
        userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title:     String,
        target:    Number,
        saved:     { type: Number, default: 0 },
        targetDate:String,
        createdAt: { type: Date, default: Date.now },
      }));

      useMongoose = true;
    } catch (err) {
      console.warn('⚠️  MongoDB failed, falling back to JSON file:', err.message);
    }
  }

  if (!useMongoose) {
    console.log('📁 Using local JSON file database');
  }
}

// ─── JSON-file DB helpers ─────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'db.json');
function readDB()  {
  try {
    if (!fs.existsSync(DB_PATH))
      fs.writeFileSync(DB_PATH, JSON.stringify({ users:[], transactions:[], goals:[] }, null, 2));
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch { return { users:[], transactions:[], goals:[] }; }
}
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ─── Auth middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.userId = jwt.verify(h.split(' ')[1], JWT_SECRET).userId;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ─── AUTH ROUTES ───────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const hashed = await bcrypt.hash(password, 10);

    if (useMongoose) {
      if (await User.findOne({ email: email.toLowerCase() }))
        return res.status(409).json({ error: 'Email already registered' });
      const u = await new User({ email, password: hashed, name: name || email.split('@')[0] }).save();
      const token = jwt.sign({ userId: u._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user: { id: u._id, email: u.email, name: u.name } });
    }

    const db = readDB();
    if (db.users.find(u => u.email === email.toLowerCase()))
      return res.status(409).json({ error: 'Email already registered' });
    const user = { id: uid(), email: email.toLowerCase(), password: hashed, name: name || email.split('@')[0], isGuest: false, createdAt: new Date().toISOString() };
    db.users.push(user); writeDB(db);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { res.status(500).json({ error: 'Registration failed', detail: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (useMongoose) {
      const u = await User.findOne({ email: email?.toLowerCase() });
      if (!u || u.isGuest || !(await bcrypt.compare(password, u.password)))
        return res.status(401).json({ error: 'Invalid email or password' });
      const token = jwt.sign({ userId: u._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: u._id, email: u.email, name: u.name } });
    }
    const db = readDB();
    const u = db.users.find(u => u.email === email?.toLowerCase());
    if (!u || u.isGuest || !(await bcrypt.compare(password, u.password)))
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ userId: u.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: u.id, email: u.email, name: u.name } });
  } catch (err) { res.status(500).json({ error: 'Login failed', detail: err.message }); }
});

app.post('/api/auth/guest', async (req, res) => {
  try {
    const guestEmail = `guest_${Date.now()}@budgetflow.local`;
    if (useMongoose) {
      const u = await new User({ email: guestEmail, name: 'Guest User', isGuest: true }).save();
      const token = jwt.sign({ userId: u._id }, JWT_SECRET, { expiresIn: '1d' });
      return res.status(201).json({ token, user: { id: u._id, email: guestEmail, name: 'Guest User', isGuest: true } });
    }
    const db = readDB();
    const user = { id: uid(), email: guestEmail, name: 'Guest User', isGuest: true, createdAt: new Date().toISOString() };
    db.users.push(user); writeDB(db);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user.id, email: guestEmail, name: 'Guest User', isGuest: true } });
  } catch (err) { res.status(500).json({ error: 'Guest login failed', detail: err.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    if (useMongoose) {
      const u = await User.findById(req.userId).select('-password');
      if (!u) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: { id: u._id, email: u.email, name: u.name, isGuest: u.isGuest } });
    }
    const u = readDB().users.find(u => u.id === req.userId);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: u.id, email: u.email, name: u.name, isGuest: u.isGuest } });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// ─── TRANSACTION ROUTES ────────────────────────────────────────────────────────
app.get('/api/transactions', auth, async (req, res) => {
  if (useMongoose) {
    const txs = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    return res.json(txs);
  }
  const db = readDB();
  res.json(db.transactions.filter(t => t.userId === req.userId).sort((a, b) => new Date(b.date) - new Date(a.date)));
});

app.post('/api/transactions', auth, async (req, res) => {
  try {
    const payload = { title: req.body.title || 'Transaction', amount: Number(req.body.amount), category: req.body.category || 'Others', type: req.body.type || 'expense', notes: req.body.notes || '', date: req.body.date || new Date().toISOString() };
    if (useMongoose) {
      const tx = await new Transaction({ ...payload, userId: req.userId }).save();
      return res.status(201).json({ message: 'Saved!', data: tx });
    }
    const db = readDB();
    const tx = { id: uid(), userId: req.userId, ...payload };
    db.transactions.push(tx); writeDB(db);
    res.status(201).json({ message: 'Saved!', data: tx });
  } catch (err) { res.status(500).json({ error: 'Failed', detail: err.message }); }
});

app.delete('/api/transactions/:id', auth, async (req, res) => {
  if (useMongoose) {
    await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    return res.json({ message: 'Deleted!' });
  }
  const db = readDB();
  db.transactions = db.transactions.filter(t => !(t.id === req.params.id && t.userId === req.userId));
  writeDB(db);
  res.json({ message: 'Deleted!' });
});

// ─── GOAL ROUTES ───────────────────────────────────────────────────────────────
app.get('/api/goals', auth, async (req, res) => {
  if (useMongoose) {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json(goals);
  }
  const db = readDB();
  res.json(db.goals.filter(g => g.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/api/goals', auth, async (req, res) => {
  try {
    const payload = { title: req.body.title, target: Number(req.body.target) || 0, saved: 0, targetDate: req.body.targetDate || '' };
    if (useMongoose) {
      const g = await new Goal({ ...payload, userId: req.userId }).save();
      return res.status(201).json({ message: 'Saved!', data: g });
    }
    const db = readDB();
    const g = { id: uid(), userId: req.userId, createdAt: new Date().toISOString(), ...payload };
    db.goals.push(g); writeDB(db);
    res.status(201).json({ message: 'Saved!', data: g });
  } catch (err) { res.status(500).json({ error: 'Failed', detail: err.message }); }
});

app.delete('/api/goals/:id', auth, async (req, res) => {
  if (useMongoose) {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    return res.json({ message: 'Deleted!' });
  }
  const db = readDB();
  db.goals = db.goals.filter(g => !(g.id === req.params.id && g.userId === req.userId));
  writeDB(db); res.json({ message: 'Deleted!' });
});

app.patch('/api/goals/:id/contribute', auth, async (req, res) => {
  const amount = Number(req.body.amount);
  if (useMongoose) {
    const g = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { $inc: { saved: amount } }, { new: true });
    return res.json({ message: 'Done!', data: g });
  }
  const db = readDB();
  const g = db.goals.find(g => g.id === req.params.id && g.userId === req.userId);
  if (!g) return res.status(404).json({ error: 'Goal not found' });
  g.saved = Number(g.saved) + amount; writeDB(db);
  res.json({ message: 'Done!', data: g });
});

// ─── Serve React build in production ──────────────────────────────────────────
if (IS_PROD) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api'))
      res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', db: useMongoose ? 'mongodb' : 'json-file' }));

// ─── Start ─────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BudgetFlow running on port ${PORT} (${IS_PROD ? 'production' : 'development'})`);
    if (!IS_PROD) console.log(`   Frontend dev server: http://localhost:3000`);
  });
});
