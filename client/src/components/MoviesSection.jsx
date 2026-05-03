import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Calendar, MapPin, Star } from 'lucide-react'

const MoviesSection = () => {
  const { shows, image_base_url } = useAppContext()
  const navigate = useNavigate()
  const [filteredMovies, setFilteredMovies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedCity, setSelectedCity] = useState('all')

  // Extract unique movies from shows
  const getAllMovies = () => {
    const movieMap = new Map()
    shows.forEach(show => {
      if (show.movie && show.movie._id) {
        const existingMovie = movieMap.get(show.movie._id)
        if (!existingMovie) {
          movieMap.set(show.movie._id, {
            ...show.movie,
            shows: [show],
            cities: [show.city],
            genres: show.movie.genres || [],
            rating: show.movie.rating || show.movie.vote_average || 0
          })
        } else {
          existingMovie.shows.push(show)
          if (!existingMovie.cities.includes(show.city)) {
            existingMovie.cities.push(show.city)
          }
        }
      }
    })
    return Array.from(movieMap.values())
  }

  useEffect(() => {
    const movies = getAllMovies()
    let filtered = movies

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(movie => 
        movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genres?.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(movie => 
        movie.genres?.includes(selectedGenre)
      )
    }

    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter(movie => 
        movie.cities.includes(selectedCity)
      )
    }

    setFilteredMovies(filtered)
  }, [shows, searchTerm, selectedGenre, selectedCity])

  const getAllGenres = () => {
    const genres = new Set()
    shows.forEach(show => {
      if (show.movie?.genres) {
        show.movie.genres.forEach(genre => genres.add(genre))
      }
    })
    return Array.from(genres)
  }

  const getAllCities = () => {
    const cities = new Set()
    shows.forEach(show => {
      if (show.city) cities.add(show.city)
    })
    return Array.from(cities)
  }

  const handleMovieClick = (movie) => {
    // Navigate to movie details with the first available show
    if (movie.shows && movie.shows.length > 0) {
      const firstShow = movie.shows[0]
      navigate(`/movies/${movie._id}`, { 
        state: { 
          movie, 
          selectedShow: firstShow 
        } 
      })
    }
  }

  const getNextShowTime = (movie) => {
    if (!movie.shows || movie.shows.length === 0) return 'No shows'
    
    const futureShows = movie.shows.filter(show => 
      new Date(show.showDateTime) > new Date()
    )
    
    if (futureShows.length === 0) return 'No upcoming shows'
    
    const nextShow = futureShows.sort((a, b) => 
      new Date(a.showDateTime) - new Date(b.showDateTime)
    )[0]
    
    const date = new Date(nextShow.showDateTime)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getLowestPrice = (movie) => {
    if (!movie.shows || movie.shows.length === 0) return 'N/A'
    
    const prices = movie.shows.map(show => show.price).filter(price => price)
    return prices.length > 0 ? `₹${Math.min(...prices)}` : 'N/A'
  }

  const placeholderImage = '/placeholder-movie.svg'

  if (shows.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] px-6'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>🎬</div>
          <h2 className='text-2xl font-bold text-gray-300 mb-2'>No Movies Available</h2>
          <p className='text-gray-400 mb-4'>
            Currently there are no movies showing. Please check back later!
          </p>
          <button 
            onClick={() => window.location.reload()}
            className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition'
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>Now Showing</h1>
        <p className='text-gray-400'>Book tickets for the latest movies in your city</p>
      </div>

      {/* Filters */}
      <div className='bg-gray-800 rounded-xl p-6 mb-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Search movies...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          {/* Genre Filter */}
          <div className='relative'>
            <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className='w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none'
            >
              <option value='all'>All Genres</option>
              {getAllGenres().map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className='relative'>
            <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className='w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none'
            >
              <option value='all'>All Cities</option>
              {getAllCities().map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-4xl mb-4'>🔍</div>
          <h3 className='text-xl font-semibold text-gray-300 mb-2'>No movies found</h3>
          <p className='text-gray-400'>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredMovies.map(movie => (
            <div 
              key={movie._id}
              onClick={() => handleMovieClick(movie)}
              className='bg-gray-800 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
            >
              {/* Movie Poster */}
              <div className='relative h-64 overflow-hidden'>
                {movie.poster_path || movie.backdrop_path ? (
                  <img
                    src={`${image_base_url}${movie.poster_path || movie.backdrop_path}`}
                    alt={movie.title}
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      e.target.src = placeholderImage
                    }}
                  />
                ) : (
                  <div className='w-full h-full bg-gradient-to-br from-primary to-primary-dull flex items-center justify-center'>
                    <div className='text-center text-white'>
                      <div className='text-4xl mb-2'>🎬</div>
                      <p className='text-sm'>No Poster</p>
                    </div>
                  </div>
                )}
                
                {/* Rating Badge */}
                {movie.rating > 0 && (
                  <div className='absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded-full flex items-center gap-1'>
                    <Star className='w-4 h-4 text-yellow-400 fill-current' />
                    <span className='text-white text-sm font-medium'>{movie.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Movie Details */}
              <div className='p-4'>
                <h3 className='text-lg font-semibold text-white mb-2 truncate'>{movie.title}</h3>
                
                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {movie.genres.slice(0, 2).map(genre => (
                      <span key={genre} className='px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full'>
                        {genre}
                      </span>
                    ))}
                    {movie.genres.length > 2 && (
                      <span className='px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full'>
                        +{movie.genres.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Cities */}
                <div className='flex items-center gap-2 mb-3 text-gray-400 text-sm'>
                  <MapPin className='w-4 h-4' />
                  <span>{movie.cities.slice(0, 2).join(', ')}</span>
                  {movie.cities.length > 2 && (
                    <span>+{movie.cities.length - 2} more</span>
                  )}
                </div>

                {/* Show Info */}
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-1 text-gray-400'>
                    <Calendar className='w-4 h-4' />
                    <span>{getNextShowTime(movie)}</span>
                  </div>
                  <div className='text-primary font-semibold'>
                    {getLowestPrice(movie)}
                  </div>
                </div>

                {/* Book Button */}
                <button className='w-full mt-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition font-medium'>
                  Book Tickets
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MoviesSection
