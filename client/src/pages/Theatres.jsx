import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Theatres = () => {
  const [city, setCity] = useState('')
  const [theatres, setTheatres] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    try{ setCity(JSON.parse(localStorage.getItem('selectedCity')||'null')?.name || '') }catch{}
  },[])

  useEffect(()=>{
    let cancelled = false
    const fetchTheatres = async()=>{
      if(!city) { setTheatres([]); return }
      try{
        setLoading(true)
        const { data } = await axios.get('/api/show/theatres', { params: { city } })
        if(!cancelled){ setTheatres(Array.isArray(data?.theatres) ? data.theatres : []) }
      }catch{ if(!cancelled){ setTheatres([]) } }
      finally{ if(!cancelled){ setLoading(false) } }
    }
    fetchTheatres()
    return ()=>{ cancelled = true }
  },[city])

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-28 pb-20'>
      <h1 className='text-2xl font-semibold mb-6'>Theatres {city ? `in ${city}` : ''}</h1>
      {!city && (
        <p className='text-sm text-gray-400 mb-4'>Please select a city from the top-left Cities option.</p>
      )}
      {loading && <p className='text-sm text-gray-400'>Loading theatres…</p>}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3'>
        {theatres.map((t)=> (
          <button
            key={t}
            onClick={()=>{ navigate(`/theatres/${encodeURIComponent(t)}`); scrollTo(0,0) }}
            className='text-left py-2 border-b border-white/10 hover:bg-white/5 rounded cursor-pointer'
          >{t}</button>
        ))}
        {city && !loading && theatres.length===0 && (
          <p className='text-sm text-gray-400'>No theatres found for this city.</p>
        )}
      </div>
    </div>
  )
}

export default Theatres
