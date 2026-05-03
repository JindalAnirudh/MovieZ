import express from 'express';
import { getMovieTrailers, getTrailerById, searchTrailers } from '../controllers/trailerController.js';

const router = express.Router();

// Search trailers
router.get('/search', searchTrailers);

// Get movie trailers by movie ID
router.get('/movie/:movieId/trailers', getMovieTrailers);

// Get trailer by trailer ID
router.get('/trailer/:trailerId', getTrailerById);

export default router;
