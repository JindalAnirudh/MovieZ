import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Search = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const q = useMemo(()=>{
    try{ return new URLSearchParams(location.search).get('q') || '' }catch{ return '' }
  },[location.search])
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
      try{
        setLoading(true)
        const params = {}
        if(cityName) params.city = cityName
        if(q) params.q = q
        const { data } = await axios.get('/api/show/all', { params })
        if(!cancelled){ setMovies(Array.isArray(data?.shows) ? data.shows : []) }
      }catch{ if(!cancelled){ setMovies([]) } }
      finally{ if(!cancelled){ setLoading(false) } }
    }
    fetchMovies()
    return ()=>{ cancelled = true }
  },[cityName, q])

  return (
    <div className='mt-24 px-4 sm:px-6 md:px-10 lg:px-24'>
      <div className='max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-5 md:p-6 backdrop-blur'>
        <input
          type='text'
          placeholder={q ? q : "Search for movies"}
          defaultValue={q}
          onKeyDown={(e)=>{
            if(e.key==='Enter'){
              const term = e.currentTarget.value.trim()
              const base = '/search'
              navigate(term ? `${base}?q=${encodeURIComponent(term)}` : base)
            }
          }}
          className='w-full mb-4 sm:mb-6 px-4 py-3 rounded-xl bg-black/30 border border-white/15 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-primary/60'
        />

        <h2 className='text-lg font-semibold mb-4'>Trending{cityName ? ` in ${cityName}` : ''}</h2>

        {loading && (
          <div className='text-gray-400'>Loading…</div>
        )}

        {!loading && movies.length === 0 && (
          <div className='text-gray-400'>No movies found{cityName ? ` in ${cityName}` : ''}{q ? ` for "${q}"` : ''}.</div>
        )}

        {!loading && movies.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8'>
            {movies.map(m => (
              <button
                key={m._id || m.id}
                onClick={()=> navigate(`/movies/${m._id || m.id}`)}
                className='flex items-center gap-4 text-left hover:bg-white/5 rounded-xl p-2 transition'
              >
                <img
                  src={m.poster_path ? `https://image.tmdb.org/t/p/w154${m.poster_path}` : 'https://via.placeholder.com/80x80?text=No+Image'}
                  alt={m.title}
                  className='w-16 h-16 rounded-md object-cover'
                />
                <div>
                  <p className='font-medium text-white'>{m.title}</p>
                  <p className='text-sm text-gray-400'>Movie</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
