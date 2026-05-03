import express from "express";
import { addShow, getNowPlayingMovies, getNowPlayingPublic, getShow, getShows, searchMovies, getTheatresForCity, getMoviesByTheatre, getMovieTrailers } from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js"; 
const showRouter=express.Router();
showRouter.get('/now-playing',protectAdmin,getNowPlayingMovies)
// Public discovery route for homepage Now Showing
showRouter.get('/discover/now-playing', getNowPlayingPublic)
showRouter.get('/search',protectAdmin,searchMovies)
showRouter.post('/add',protectAdmin,addShow) 
showRouter.get('/all',getShows);
showRouter.get('/theatres', getTheatresForCity);
showRouter.get('/by-theatre', getMoviesByTheatre);
showRouter.get('/trailers', getMovieTrailers);
showRouter.get('/:movieId',getShow);
export default showRouter;