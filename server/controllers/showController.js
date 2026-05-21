import axios from "axios"
import https from 'https'
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// No custom https agent; rely on Node/axios defaults to prevent platform-specific issues

// Minimal local fallback data to keep admin UX functional if TMDB is unreachable
const FALLBACK_MOVIES = [
  { id: 603692, title: 'John Wick: Chapter 4', poster_path: '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg', release_date: '2023-03-22' },
  { id: 346698, title: 'Barbie', poster_path: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', release_date: '2023-07-19' },
  { id: 872585, title: 'Oppenheimer', poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', release_date: '2023-07-19' },
  { id: 667538, title: 'Transformers: Rise of the Beasts', poster_path: '/gPbM0MK8CP8A174rmUwGsADNYKD.jpg', release_date: '2023-06-06' },
  { id: 447362, title: 'Life in a Year', poster_path: '/7m0fDqA2KsbOZbS9i4cN8QpMw6R.jpg', release_date: '2020-11-27' },
  { id: 299534, title: 'Avengers: Endgame', poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg', release_date: '2019-04-24' },
  { id: 497, title: 'The Green Mile', poster_path: '/velWPhVMQeQKcxggNEU8YmIo52R.jpg', release_date: '1999-12-10' },
  { id: 862, title: 'Toy Story', poster_path: '/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg', release_date: '1995-10-30' },
  { id: 238, title: 'The Godfather', poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', release_date: '1972-03-14' },
  { id: 155, title: 'The Dark Knight', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', release_date: '2008-07-16' },
  { id: 680, title: 'Pulp Fiction', poster_path: '/dRZpdpKLgN9nk57zggJCs1TjJb4.jpg', release_date: '1994-09-10' },
  { id: 11, title: 'Star Wars', poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg', release_date: '1977-05-25' }
];
// API: list movies for a given theatre in a city (upcoming shows only)
export const getMoviesByTheatre = async (req, res) => {
  try{
    const city = (req.query.city||'').trim()
    const theatre = (req.query.theatre||'').trim()
    if(!theatre){ return res.json({ success:true, movies: [] }) }
    const baseQuery = { showDateTime: { $gte: new Date() } }
    const query = city ? { ...baseQuery, $or:[ { city }, { city: 'ALL_CITIES' } ] } : baseQuery
    // match theatre string in shows.theatres
    const shows = await Show.find({ ...query, theatres: theatre }).populate('movie').sort({ showDateTime: 1 })
    const byId = new Map()
    for(const s of shows){
      const id = String(s.movie?._id || s.movie?.id || '')
      if(id && !byId.has(id)) byId.set(id, s.movie)
    }
    return res.json({ success:true, movies: Array.from(byId.values()) })
  }catch(err){
    console.error(err)
    return res.json({ success:false, message: err.message })
  }
}

// Circuit breaker to avoid hammering TMDB when network is down
const CIRCUIT = {
  openUntil: 0,
  failCount: 0,
  lastLogAt: 0,
}

// API to get distinct theatres for a city (upcoming shows only)
export const getTheatresForCity = async (req, res) => {
    try{
        const city = (req.query.city||'').trim()
        if(!city) return res.json({ success:true, theatres: [] })
        
        let theatres = []
        
        // Try to get theatres from MongoDB first
        try {
            const shows = await Show.find({ city, showDateTime: { $gte: new Date() } }, { theatres: 1 }).lean()
            const set = new Set()
            for(const s of shows){
                const arr = Array.isArray(s?.theatres) ? s.theatres : []
                for(const t of arr){ if(typeof t==='string' && t.trim()) set.add(t.trim()) }
            }
            theatres = Array.from(set)
        } catch (dbError) {
            console.log('MongoDB error in getTheatresForCity, using fallback theatres:', dbError.message);
            // Use fallback theatres when MongoDB is not available
            theatres = [
                'PVR Cinemas',
                'INOX Cinemas',
                'Cinepolis',
                'Carnival Cinemas'
            ]
        }
        
        return res.json({ success:true, theatres })
    }catch(err){
        console.error(err)
        res.json({ success:false, message: err.message })
    }
}

// Public API to get now playing movies from TMDB for homepage (no admin protection)
export const getNowPlayingPublic = async (req, res) => {
  try {
    let data;
    try {
      data = await tmdbRequest('/movie/now_playing')
    } catch (err) {
      warnOncePer(10000, 'TMDB now_playing failed (public), falling back to popular:', err?.code || err?.message || err)
    }
    let movies = Array.isArray(data?.results) ? data.results : []
    if (movies.length === 0) {
      try {
        const pop = await tmdbRequest('/movie/popular')
        movies = Array.isArray(pop?.results) ? pop.results : []
      } catch (e) {
        warnOncePer(10000, 'TMDB popular also failed (public), using local FALLBACK_MOVIES')
        movies = FALLBACK_MOVIES
      }
    }

    // Map to match frontend MovieCard expectations
    const mapped = movies.map(m => ({
      _id: m.id,
      id: m.id,
      title: m.title,
      poster_path: m.poster_path || '',
      backdrop_path: m.backdrop_path || m.poster_path || '',
      release_date: m.release_date || '1970-01-01',
      vote_average: typeof m.vote_average === 'number' ? m.vote_average : 0,
      genres: Array.isArray(m.genres) ? m.genres : [],
      runtime: typeof m.runtime === 'number' ? m.runtime : 0,
      overview: m.overview || ''
    }))

    return res.json({ success: true, movies: mapped })
  } catch (error) {
    console.error('TMDB public fallback error:', error?.code || '', error?.message);
    const mapped = FALLBACK_MOVIES.map(m => ({
      _id: m.id,
      id: m.id,
      title: m.title,
      poster_path: m.poster_path || '',
      backdrop_path: m.backdrop_path || m.poster_path || '',
      release_date: m.release_date || '1970-01-01',
      vote_average: 0,
      genres: [],
      runtime: 0,
      overview: ''
    }))
    return res.json({ success: true, movies: mapped })
  }
}

function warnOncePer(ms, ...args){
  const now = Date.now();
  if(now - CIRCUIT.lastLogAt > ms){
    CIRCUIT.lastLogAt = now;
    console.warn(...args);
  }
}

async function tmdbRequest(path, params = {}){
  // Short-circuit if breaker is open
  if(Date.now() < CIRCUIT.openUntil){
    const err = new Error('CIRCUIT_OPEN');
    err.code = 'CIRCUIT_OPEN';
    throw err;
  }
  const cfg = {
    baseURL: 'https://api.themoviedb.org/3',
    url: path,
    method: 'GET',
    params: { language: 'en-US', page: 1, ...params },
    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
    timeout: 30000,
    proxy: false,
    validateStatus: s => s >= 200 && s < 500,
  }
  let lastErr;
  for(let attempt=1; attempt<=3; attempt++){
    try{
      const { data, status } = await axios(cfg)
      if(status>=200 && status<300) return data
      lastErr = new Error(`TMDB status ${status}`)
    }catch(err){
      lastErr = err
      const transient = ['ETIMEDOUT','ECONNRESET','ENETUNREACH','EAI_AGAIN'].includes(err?.code)
      if(transient && attempt < 3){
        const delay = attempt === 1 ? 500 : attempt === 2 ? 1500 : 0
        if(delay) await new Promise(r=>setTimeout(r, delay))
        continue
      }
    }
  }
  // Trip circuit for 5 minutes on repeated failures
  CIRCUIT.failCount++
  if(CIRCUIT.failCount >= 2){
    CIRCUIT.openUntil = Date.now() + 5 * 60 * 1000
    warnOncePer(15000, 'TMDB circuit opened for 5 minutes due to failures:', lastErr?.code || lastErr?.message)
  }
  throw lastErr || new Error('TMDB request failed')
}

//API to get now playing movies from TMDB API
export const getNowPlayingMovies=async(req,res)=>{
  try{
    const region = (req.query.region || 'IN').toUpperCase()
    const ol = (req.query.ol || '').toLowerCase() // with_original_language e.g. 'hi','pa','en'
    let data;
    try{
      data = await tmdbRequest('/movie/now_playing', { region })
    }catch(err){
      warnOncePer(10000, 'TMDB now_playing failed, falling back to popular:', err?.code || err?.message || err)
    }
    let movies = Array.isArray(data?.results) ? data.results : []
        // If a specific original language is requested, fetch via discover to better filter
        if(ol){
          try{
            const disc = await tmdbRequest('/discover/movie', { with_original_language: ol, region, sort_by:'popularity.desc' })
            if(Array.isArray(disc?.results) && disc.results.length) movies = disc.results
          }catch{/* ignore */}
        }
        if(movies.length===0){
          try{
            const pop = await tmdbRequest('/movie/popular', { region })
            movies = Array.isArray(pop?.results) ? pop.results : []
          }catch(e){
            warnOncePer(10000, 'TMDB popular also failed, using local FALLBACK_MOVIES')
            movies = FALLBACK_MOVIES
          }
        }
        return res.json({success:true,movies})
    }catch(error){
        console.error('TMDB fallback error:', error?.code || '', error?.message);
        return res.json({success:true,movies:FALLBACK_MOVIES})
    }
}

// API to search movies on TMDB
export const searchMovies = async (req, res) => {
    try{
        const query = (req.query.q || '').trim();
        if(!query){
            return res.json({success:true, movies: FALLBACK_MOVIES});
        }
        try{
          const data = await tmdbRequest('/search/movie', { query, include_adult: false })
          return res.json({success:true, movies: data?.results || []});
        }catch(e){
          // fallback: filter local list by title
          const q = query.toLowerCase();
          const filtered = FALLBACK_MOVIES.filter(m=>m.title.toLowerCase().includes(q))
          return res.json({success:true, movies: filtered});
        }
    }catch(error){
        console.error('TMDB search error:', error?.code || '', error?.message);
        const q = (req.query.q||'').toLowerCase();
        const filtered = q ? FALLBACK_MOVIES.filter(m=>m.title.toLowerCase().includes(q)) : FALLBACK_MOVIES
        return res.json({success:true, movies: filtered});
    }
}

// // API to add a new show to the database 
export const addShow=async(req,res)=>{
    try{
        const{movieId,showsInput,showPrice,showPrices, city:cityInput, theatres:theatresInput}=req.body
        let movie=await Movie.findById(movieId)

        if(!movie){
            //Fetch movie details and credits from TMDB API; if it fails, use minimal data from client
            try{
              const reqCfg = { headers:{Authorization:`Bearer ${process.env.TMDB_API_KEY}`}, timeout: 20000, proxy: false }
              const [movieDetailsResponse,movieCreditsResponse]=await Promise.all([
                  axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, reqCfg),
                  axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, reqCfg)
              ]);

              const movieApiData=movieDetailsResponse.data;
              const movieCreditsData=movieCreditsResponse.data;
              const movieDetails={
                  _id:movieId,
                  title:movieApiData.title,
                  overview:movieApiData.overview,
                  poster_path:movieApiData.poster_path,
                  backdrop_path:movieApiData.backdrop_path,
                  genres:movieApiData.genres,
                  casts:movieApiData.casts,
                  release_date:movieApiData.release_date,
                  original_language:movieApiData.original_language,
                  tagline:movieApiData.tagline || "",
                  vote_average:movieApiData.vote_average,
                  runtime:movieApiData.runtime,
              }
              movie=await Movie.create(movieDetails);
            }catch(fetchErr){
              // Minimal creation path with client-provided fields
              const { movieTitle, poster_path, backdrop_path, release_date } = req.body || {}
              if(!movieTitle || !poster_path || !release_date){
                return res.json({
                  success:false,
                  message:'Unable to fetch movie from TMDB. Please provide title, poster and release date.'
                })
              }
              movie = await Movie.create({
                _id: String(movieId),
                title: movieTitle,
                overview: 'Not available',
                poster_path,
                backdrop_path: backdrop_path || poster_path,
                genres: [],
                casts: [],
                release_date,
                original_language: '',
                tagline: '',
                vote_average: 0,
                runtime: 0,
              })
            }
        }
        const showsToCreate=[];
        showsInput.forEach(show=>{
            const showDate=show.date;
            show.time.forEach((time)=>{
                const dateTimeString=`${showDate}T${time}`;
                // Parse the datetime string - JS will treat it as UTC by default
                let showDateTime = new Date(dateTimeString);
                
                // If timezone offset was provided, adjust to get the correct UTC time
                // The offset tells us how many minutes local time is ahead/behind UTC
                // We need to subtract it to get the actual UTC time the user meant
                if(req.body.tzOffsetMinutes !== undefined){
                  const offsetMs = req.body.tzOffsetMinutes * 60 * 1000;
                  showDateTime = new Date(showDateTime.getTime() - offsetMs);
                }
                
                const prices = showPrices && typeof showPrices === 'object' ? {
                  vip: Number(showPrices.vip) || undefined,
                  premium: Number(showPrices.premium) || undefined,
                  normal: Number(showPrices.normal) || undefined,
                } : undefined
                showsToCreate.push({
                  movie: movieId,
                  showDateTime,
                  // Backward compatibility: if prices not provided, keep flat showPrice
                  showPrice,
                  prices,
                  occupiedSeats: {},
                  city: typeof cityInput === 'string' ? cityInput : '',
                  theatres: Array.isArray(theatresInput) ? theatresInput : (typeof theatresInput==='string' ? [theatresInput] : [])
                })
            })
        });

        if(showsToCreate.length>0){
            await Show.insertMany(showsToCreate);   
        }
        res.json({success:true,message:'Show Added successfully.'})    
    }
    catch(error){
        console.error(error);
        res.json({success:false,message:error.message});
    }
}


//API to get all shows from the database 
export const getShows=async(req,res)=>{
    try{
        const city = (req.query.city||'').trim()
        const q = (req.query.q||'').toString().trim().toLowerCase()
        const baseQuery = { showDateTime: { $gte: new Date() } }
        const query = city ? { ...baseQuery, $or:[ { city }, { city: 'ALL_CITIES' } ] } : baseQuery
        const shows=await Show.find(query).populate('movie').sort({showDateTime:1});
        // Optional text filter on movie title
        const filtered = q ? shows.filter(s=> (s.movie?.title||'').toLowerCase().includes(q)) : shows
        // Unique by movie ID
        const byId = new Map()
        for(const s of filtered){
          const id = String(s.movie?._id || s.movie?.id || '')
          if(id && !byId.has(id)) byId.set(id, s.movie)
        }
        res.json({success:true,shows:Array.from(byId.values())})
    }
    catch(error){
        console.error(error)
        res.json({success:false,message:error.message});
    }
}

// API to get movie trailers
export const getMovieTrailers = async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.json({ success: false, message: 'Movie title is required' });
    }

    console.log('Backend - Fetching trailers for title:', title);
    
    // For now, return empty trailers since TMDB is having connection issues
    // In a real implementation, you would search TMDB for the movie by title
    // and then fetch its trailers
    
    console.log('Backend - Returning empty trailers due to TMDB connection issues');
    
    return res.json({
      success: true,
      trailers: [],
      message: 'Trailers temporarily unavailable'
    });
    
  } catch (error) {
    console.error('Backend - Error fetching trailers:', error);
    return res.json({
      success: false,
      trailers: [],
      message: 'Failed to fetch trailers'
    });
  }
};

//API to get the single show from the database 
export const getShow=async(req,res)=>{
    try{
        const{movieId}=req.params;
        const city = (req.query.city||'').trim()
        // get all upcoming shows for the movie (filtered by city if provided)
        const baseQuery = { movie:movieId, showDateTime: { $gte:new Date() } }
        const query = city ? { ...baseQuery, $or:[ { city }, { city:'ALL_CITIES' } ] } : baseQuery
        const shows=await Show.find(query)
        const movie=await Movie.findById(movieId);

        // Build theatre list and per-theatre dateTime maps
        const theatresSet = new Set()
        const theatreDateTime = {} // { [theatre]: { [date]: [ {time, showId, showPrice, prices} ] } }
        shows.forEach((show)=>{
            const theatres = Array.isArray(show.theatres) && show.theatres.length ? show.theatres : ['General']
            const date = show.showDateTime.toISOString().split('T')[0]
            // Include tier prices with fallback to flat showPrice
            const tierPrices = show.prices && (show.prices.vip || show.prices.premium || show.prices.normal) ? show.prices : {
              vip: show.showPrice,
              premium: show.showPrice,
              normal: show.showPrice,
            }
            theatres.forEach(th => {
              theatresSet.add(th)
              if(!theatreDateTime[th]) theatreDateTime[th] = {}
              if(!theatreDateTime[th][date]) theatreDateTime[th][date] = []
              theatreDateTime[th][date].push({ time: show.showDateTime, showId: show._id, showPrice: show.showPrice, prices: tierPrices })
            })
        })
        const theatres = Array.from(theatresSet)
        res.json({success:true,movie,theatres,theatreDateTime})
    }
    catch(error){
        console.error(error)
        res.json({success:false,message:error.message});
    }
}