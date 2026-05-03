import jwt from 'jsonwebtoken';

// Temporary no-op auth while migrating away from Clerk
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        // Fallback to token provided via query string (useful for SSE/EventSource)
        if (!token && req.query && typeof req.query.token === 'string') {
            token = req.query.token;
        }
        if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

        const secret = process.env.JWT_SECRET || 'your_jwt_secret';
        const payload = jwt.verify(token, secret);
        req.user = { userId: payload.userId || payload.id, role: payload.role };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export const protectAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'not authorized' });
        }
        next();
    });
};