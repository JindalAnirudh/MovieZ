import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthUser from '../models/AuthUser.js';
import { sendDashboardUpdate } from '../utils/realtime.js'

const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret';
  return jwt.sign(payload, secret, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await AuthUser.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    // Always create as a normal user. Admin is granted only on login when credentials match env.
    const user = await AuthUser.create({ name, email: email.toLowerCase(), password: hashed, role: 'user' });
    const token = signToken({ userId: user._id.toString(), role: user.role });
    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };
    try { sendDashboardUpdate() } catch {}
    res.status(201).json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const rawEmail = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    let user = await AuthUser.findOne({ email: rawEmail });

    // If admin credentials are used and user doesn't exist yet, auto-create admin user
    const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envAdminPass = (process.env.ADMIN_PASSWORD || '').trim();
    const isAdminCreds = (
      envAdminEmail && envAdminPass &&
      rawEmail === envAdminEmail &&
      password === envAdminPass
    );

    // Handle admin credentials first: always allow and enforce admin state
    if (isAdminCreds) {
      if (!user) {
        const hashed = await bcrypt.hash(password, 10);
        user = await AuthUser.create({ name: 'Administrator', email: rawEmail, password: hashed, role: 'admin' });
      } else {
        // Ensure user is admin and password matches the configured admin password
        const currentMatches = await bcrypt.compare(password, user.password);
        if (!currentMatches) {
          user.password = await bcrypt.hash(password, 10);
        }
        if (user.role !== 'admin') user.role = 'admin';
        await user.save();
      }
      const token = signToken({ userId: user._id.toString(), role: 'admin' });
      const safeUser = { _id: user._id, name: user.name, email: user.email, role: 'admin' };
      return res.json({ success: true, token, user: safeUser });
    }

    // Normal user login path
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = signToken({ userId: user._id.toString(), role: user.role });
    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };
    return res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const me = async (req, res) => {
  try {
    const user = await AuthUser.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
