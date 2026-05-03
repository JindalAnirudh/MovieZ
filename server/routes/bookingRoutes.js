import express from 'express';
import { createBooking, getOccupiedSeats, verifyCheckoutSession, getQuote } from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/auth.js';
const bookingRouter=express.Router();
bookingRouter.post('/create', verifyToken, createBooking);
bookingRouter.post('/quote', verifyToken, getQuote);
bookingRouter.get('/seats/:showId',getOccupiedSeats);
bookingRouter.get('/verify/:sessionId', verifyCheckoutSession);
export default bookingRouter;