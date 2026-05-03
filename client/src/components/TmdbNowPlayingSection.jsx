import React from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const TmdbNowPlayingSection = () => {
  const { nowPlaying, image_base_url } = useAppContext()
  const navigate = useNavigate()
  
  const placeholderImage = '/placeholder-movie.svg'
  
  // Always render the section, even if no movies, to show it's working
  const displayMovies = nowPlaying && nowPlaying.length > 0 ? nowPlaying.slice(0,8) : [];
  
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
      <div className='flex items-center justify-between pt-12 pb-6'>
        <p className='text-gray-300 font-medium text-lg'>Now Playing</p>
        <button onClick={()=>navigate('/movies')} className='text-sm text-gray-300 cursor-pointer'>View All</button>
      </div>
      <div className='flex flex-wrap max-sm:justify-center gap-8 mt-2'>
        {displayMovies.length === 0 ? (
          <div className='w-full text-center py-8'>
            <p className='text-gray-400'>No movies currently available</p>
            <p className='text-gray-500 text-sm mt-2'>Check back later for new releases</p>
          </div>
        ) : (
          displayMovies.map((m, index) => {
            const imageUrl = m.backdrop_path ? image_base_url + m.backdrop_path : placeholderImage;
            
            return (
            <div key={m.id} className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66'>
              <img 
                onClick={()=>{navigate(`/movies`); scrollTo(0,0)}} 
                src={imageUrl} 
                alt={m.title} 
                className='rounded-lg h-52 w-full object-cover object-center cursor-pointer'
                onError={(e) => {
                  e.target.src = placeholderImage
                }}
              />
              <p className='font-semibold mt-2 truncate'>{m.title || 'Unknown Movie'}</p>
              <p className='text-sm text-gray-400 mt-2'>{m.release_date ? new Date(m.release_date).getFullYear() : 'Unknown Year'}</p>
              <div className='flex items-center justify-between mt-4 pb-3'>
                <button onClick={()=>{navigate('/movies'); scrollTo(0,0)}} className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>View</button>
                <p className='text-sm text-gray-400 mt-1 pr-1'>{m.vote_average ? `Rating: ${m.vote_average.toFixed(1)}` : 'No rating'}</p>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  )
}

export default TmdbNowPlayingSection
