import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
import dns from 'dns';
dns.setDefaultResultOrder?.('ipv4first');
import connectDB from './configs/db.js';
import {connectMySQL} from './configs/mysql.js';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import { protectAdmin, verifyToken } from './middleware/auth.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';
import { ensureSeedAdmin, ADMIN_EMAIL } from './utils/seedAdmin.js';
import { initSSE } from './utils/realtime.js';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import tmdbRouter from './routes/tmdbRoutes.js';
import placesRouter from './routes/placesRoutes.js';
import emailTestRouter from './routes/emailTestRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contactRouter from './routes/contactRoutes.js';
import AuthUser from './models/AuthUser.js';
import jwt from 'jsonwebtoken';

const app=express();
const port=process.env.PORT || 5000;
const server = http.createServer(app);

// Handle server errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please try a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

await connectDB()
try { 
  await ensureSeedAdmin(); 
} catch(e){ 
  console.error('Admin seed failed', e?.message) 
}
app.use('/api/stripe/webhook',express.raw({type:'application/json'}),stripeWebhooks)

app.use(express.json())
app.use(cors())


app.get('/',(req,res)=>res.send('Server is Live!'))
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/show',showRouter) 
app.use('/api/booking',bookingRouter)   
app.use('/api/admin',adminRouter)
app.use('/api', authRoutes)
app.use('/api/user',userRouter)
app.use('/api/tmdb', tmdbRouter)
app.use('/api/places', placesRouter)
app.use('/api/contact', contactRouter)
app.use('/api/admin', emailTestRouter)
// app.use('/api', trailerRouter) // Temporarily commented out
// SSE stream for admin realtime dashboard
app.get('/api/admin/stream', protectAdmin, (req, res) => initSSE(req, res))

// --- WebSocket: Help chat between users and admin ---

// In-memory chat storage: userId -> { userId, name, email, messages: [] }
const helpChats = new Map();

// Track connections
const userSockets = new Map(); // userId -> Set(ws)
const adminSockets = new Set();

const wss = new WebSocketServer({ 
  server, 
  path: '/ws/help',
  // Add error handling
  perMessageDeflate: false,
  maxPayload: 1024 * 1024, // 1MB
});

wss.on('error', (err) => {
  console.error('WebSocket server error:', err);
});

const getTokenFromUrl = (url) => {
  try {
    const u = new URL(url, 'http://localhost');
    return u.searchParams.get('token') || '';
  } catch {
    return '';
  }
};

const verifyWsToken = (token) => {
  if (!token) return null;
  const secret = process.env.JWT_SECRET || 'your_jwt_secret';
  try {
    const payload = jwt.verify(token, secret);
    return {
      userId: payload.userId || payload.id,
      role: payload.role,
      // name/email will be fetched from DB for non-admin users
    };
  } catch {
    return null;
  }
};

const broadcastToAdmins = (data) => {
  const msg = JSON.stringify(data);
  for (const ws of adminSockets) {
    if (ws.readyState === ws.OPEN) {
      try { ws.send(msg); } catch {}
    }
  }
};

const sendToUser = (userId, data) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  const msg = JSON.stringify(data);
  for (const ws of sockets) {
    if (ws.readyState === ws.OPEN) {
      try { ws.send(msg); } catch {}
    }
  }
};

const pushMessage = ({ userId, name, email, from, text }) => {
  if (!helpChats.has(userId)) {
    helpChats.set(userId, { userId, name, email, messages: [] });
  }
  const chat = helpChats.get(userId);
  const msg = { userId, name, email, from, text, createdAt: Date.now() };
  chat.messages.push(msg);
  return msg;
};

const sendUsersSnapshot = () => {
  const users = Array.from(helpChats.values()).map((chat) => ({
    userId: chat.userId,
    name: chat.name,
    email: chat.email,
    lastMessage: chat.messages[chat.messages.length - 1] || null,
  }));
  broadcastToAdmins({ type: 'chat:users', users });
};

wss.on('connection', (ws, req) => {
  const token = getTokenFromUrl(req.url || '');
  const auth = verifyWsToken(token);
  if (!auth) {
    try { ws.close(); } catch {}
    return;
  }
  const { userId, role } = auth;

  if (role === 'admin') {
    ws._meta = { role: 'admin' };
    adminSockets.add(ws);
    // Send initial snapshot
    sendUsersSnapshot();
  } else {
    // For normal users, fetch their name/email once and cache in ws._meta
    (async () => {
      let name = 'User';
      let email = '';
      try {
        const userDoc = await AuthUser.findById(userId).select('name email');
        if (userDoc) {
          name = userDoc.name || userDoc.email || 'User';
          email = userDoc.email || '';
        }
      } catch {}

      ws._meta = { userId, role: 'user', name, email };

      if (!helpChats.has(userId)) {
        helpChats.set(userId, { userId, name, email, messages: [] });
      } else {
        // ensure latest name/email are stored
        const chat = helpChats.get(userId);
        chat.name = name;
        chat.email = email;
      }

      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId).add(ws);

      // Send existing history to user on connect
      const chat = helpChats.get(userId);
      if (chat) {
        for (const m of chat.messages) {
          try { ws.send(JSON.stringify({ type: 'chat:message', message: m })); } catch {}
        }
      }
    })();
  }

  ws.on('message', (data) => {
    let payload;
    try { payload = JSON.parse(data.toString()); } catch { return; }
    if (!payload || !payload.type) return;

    if (payload.type === 'user:message' && role !== 'admin') {
      const text = (payload.text || '').toString().trim();
      if (!text) return;
      const metaName = ws._meta?.name || 'User';
      const metaEmail = ws._meta?.email || '';
      const msg = pushMessage({ userId, name: metaName, email: metaEmail, from: 'user', text });
      // Send to this user and all admins
      sendToUser(userId, { type: 'chat:message', message: msg });
      broadcastToAdmins({ type: 'chat:message', message: msg });
      sendUsersSnapshot();
    }

    if (payload.type === 'admin:message' && role === 'admin') {
      const targetId = payload.userId;
      const text = (payload.text || '').toString().trim();
      if (!targetId || !text) return;

      if (!helpChats.has(targetId)) {
        helpChats.set(targetId, { userId: targetId, name: payload.name || 'User', email: '', messages: [] });
      }
      const chat = helpChats.get(targetId);
      const msg = pushMessage({
        userId: targetId,
        name: chat.name,
        email: chat.email,
        from: 'admin',
        text,
      });
      // Send to that user and all admins
      sendToUser(targetId, { type: 'chat:message', message: msg });
      broadcastToAdmins({ type: 'chat:message', message: msg });
      sendUsersSnapshot();
    }
  });

  ws.on('close', () => {
    if (ws._meta?.role === 'admin') {
      adminSockets.delete(ws);
    } else {
      const set = userSockets.get(ws._meta?.userId);
      if (set) {
        set.delete(ws);
        if (set.size === 0) userSockets.delete(ws._meta?.userId);
      }
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`server listening at http://localhost:${port}`)
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Trying port ${port + 1}...`)
    server.listen(port + 1, '0.0.0.0', () => {
      console.log(`server listening at http://localhost:${port + 1}`)
    })
  } else {
    console.error('Server error:', err)
  }
});