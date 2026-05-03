import React, { useEffect } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircle, StarIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import TrailerModal from '../components/TrailerModal'
import { useAppContext } from '../context/AppContext'
import useMovieTrailers from '../hooks/useMovieTrailers'
import toast from 'react-hot-toast'

const MovieDetails = () => {
  const {shows,axios,getToken,user,fetchFavoriteMovies,favoriteMovies,image_base_url}=useAppContext()
  const navigate=useNavigate()
  const location = useLocation()
  const {id}=useParams()
  const [show,setShow]=useState(null)
  const [selectedTheatre, setSelectedTheatre] = useState('')
  const [autoHideTheatre, setAutoHideTheatre] = useState(false)
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false)
  const [lastToastTime, setLastToastTime] = useState(0)
  
  // Get trailers for the movie
  const movieTitle = show?.movie?.title
  const { trailers, loading: trailersLoading, mainTrailer } = useMovieTrailers(null, movieTitle)
  const getShow=async()=>{
    try{
      let city = ''
      try{ city = JSON.parse(localStorage.getItem('selectedCity')||'null')?.name || '' }catch{}
      const {data}=await axios.get(`/api/show/${id}`, { params: city ? { city } : {} })
      if(data.success){
        setShow(data)
        const theatres = Array.isArray(data.theatres) ? data.theatres : []
        const pre = location.state?.theatre || ''
        setAutoHideTheatre(!!location.state?.autoHideTheatre)
        const chosen = pre && theatres.includes(pre) ? pre : (theatres[0] || '')
        setSelectedTheatre(prev => prev || chosen)
      }
      
    }
    catch(error){
      console.log(error);
    }
  }

  const handleFavorite=async()=>{
    try{
      if(!user) return toast.error("Please Login to proceed");
      const {data}=await axios.post('/api/user/update-favorite',{movieId:id},{headers:{Authorization:`Bearer ${await getToken()}`}})
      if(data.success){
        await fetchFavoriteMovies()
        toast.success(data.message)
      }
    }
    catch(error){
      console.log(error);
    }
  }

  const handleTrailerClick=()=>{
    if(trailersLoading){
      // Don't show anything while loading
      return;
    }
    
    if(mainTrailer){
      setIsTrailerModalOpen(true)
    } else {
      // Only show toast if we've finished loading and there's definitely no trailer
      // Add debounce to prevent multiple toasts
      const now = Date.now();
      if(!trailersLoading && trailers.length === 0 && now - lastToastTime > 2000){
        toast.error('No trailer available for this movie');
        setLastToastTime(now);
      }
    }
  }
  useEffect(()=>{
    getShow()
  },[id])


  return show ?  (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img src={image_base_url + show.movie.poster_path} alt="" className='max-md:mx-auto
        rounded-xl h-104 max-w-70 object-cover' />
        <div className='relative flex flex-col gap-3'>
          <BlurCircle top="-100px" left="-100px"/>
          <p className='text-primary'>ENGLISH</p>
          <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-primary fill-primary'/>
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>
          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>
          <p>
            {timeFormat(show.movie.runtime)} ·  {show.movie.genres.map(genre=>
              genre.name
            ).join(", ")} · {show.movie.release_date.split("-")[0]}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button 
              onClick={handleTrailerClick}
              disabled={trailersLoading}
              className='flex items-center gap-2 px-7 py-3 text-sm
            bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium
            cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {trailersLoading ? (
                <>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Checking...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5"/>
                  {mainTrailer ? 'Watch Trailer' : 'No Trailer'}
                </>
              )}
            </button>
            <a href="#dateSelect" className='px-10 py-3 text-sm bg-primary
            hover:bg-primary-dull transition rounded-md font-medium cursor-pointer
            active:scale-95'>Buy Tickets</a>
            <button onClick={handleFavorite} className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
              <Heart className={`w-5 h-5 ${favoriteMovies.find(movie=>movie._id===id )? 'fill-primary text-primary': ""}`}/>
            </button>
          </div>
        </div>
      </div>


      
      {/* Theatre selection before date selection */}
      {autoHideTheatre && selectedTheatre ? (
        <div className='mt-16'>
          <p className='text-lg font-medium mb-3'>Theatre</p>
          <div className='inline-flex items-center px-3 py-1 rounded-full border border-primary bg-primary text-white text-sm'>{selectedTheatre}</div>
        </div>
      ) : (
        <div className='mt-16 relative z-20'>
          <p className='text-lg font-medium mb-3'>Choose Theatre</p>
          <div className='flex flex-wrap gap-2'>
            {(show.theatres||[]).map(th => (
              <label key={th} onClick={()=>setSelectedTheatre(th)} className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition-colors ${selectedTheatre===th ? 'border-primary bg-primary text-white' : 'border-white/20 hover:bg-white/10'}`}>
                <input type='radio' name='theatre' className='hidden' checked={selectedTheatre===th} onChange={()=>setSelectedTheatre(th)} />
                {th}
              </label>
            ))}
            {(!show.theatres || show.theatres.length===0) && (
              <p className='text-sm text-gray-400'>No theatres available for this city.</p>
            )}
          </div>
        </div>
      )}

      <DateSelect dateTime={(show.theatreDateTime||{})[selectedTheatre] || {}} id={id} selectedTheatre={selectedTheatre}/>

      <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {shows.slice(0,4).map((movie,index)=>(
          <MovieCard key={index} movie={movie} />
        ))}
      </div>
      <div className='flex justify-center mt-20'>
        <button onClick={()=>{navigate('/movies'); scrollTo(0,0)} } className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer '>Show more</button>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        trailerUrl={mainTrailer?.url}
        movieTitle={show?.movie?.title}
      />
    </div>
  ) : <Loading/>
}

export default MovieDetails
