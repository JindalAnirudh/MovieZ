import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const TheatreDetails = () => {
  const { theatre: theatreParam } = useParams()
  const theatre = useMemo(()=> decodeURIComponent(theatreParam || ''), [theatreParam])
  const navigate = useNavigate()
  const location = useLocation()
  const [cityName, setCityName] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('selectedCity')||'null')?.name || '' }catch{ return '' }
  })
  const [loading, setLoading] = useState(false)
  const [movies, setMovies] = useState([])

  useEffect(()=>{
    try{ setCityName(JSON.parse(localStorage.getItem('selectedCity')||'null')?.name || '') }catch{}
  },[location.pathname])

  useEffect(()=>{
    let cancelled = false
    const fetchMovies = async()=>{
      if(!theatre){ setMovies([]); return }
      try{
        setLoading(true)
        const params = { theatre }
        if(cityName) params.city = cityName
        const { data } = await axios.get('/api/show/by-theatre', { params })
        if(!cancelled){ setMovies(Array.isArray(data?.movies) ? data.movies : []) }
      }catch{ if(!cancelled){ setMovies([]) } }
      finally{ if(!cancelled){ setLoading(false) } }
    }
    fetchMovies()
    return ()=>{ cancelled = true }
  },[cityName, theatre])

  return (
    <div className='mt-24 px-4 sm:px-6 md:px-10 lg:px-24'>
      <div className='max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-5 md:p-6 backdrop-blur'>
        <h2 className='text-lg font-semibold mb-1'>{theatre}</h2>
        <p className='text-sm text-gray-400 mb-4'>Movies{cityName ? ` in ${cityName}` : ''}</p>

        {loading && (
          <div className='text-gray-400'>Loading…</div>
        )}

        {!loading && movies.length === 0 && (
          <div className='text-gray-400'>No movies scheduled here{cityName ? ` in ${cityName}` : ''}.</div>
        )}

        {!loading && movies.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8'>
            {movies.map(m => (
              <button
                key={m._id || m.id}
                onClick={()=> navigate(`/movies/${m._id || m.id}`, { state:{ theatre, fromTheatres:true, autoHideTheatre:true } })}
                className='flex items-center gap-4 text-left hover:bg-white/5 rounded-xl p-2 transition'
              >
                <img
                  src={m.poster_path ? `https://image.tmdb.org/t/p/w154${m.poster_path}` : 'https://via.placeholder.com/80x80?text=No+Image'}
                  alt={m.title}
                  className='w-16 h-16 rounded-md object-cover'
                />
                <div>
                  <p className='font-medium text-white'>{m.title}</p>
                  <p className='text-sm text-gray-400'>Book now</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TheatreDetails
