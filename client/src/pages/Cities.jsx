import React, { useEffect, useMemo, useState } from 'react'
import citiesData from '../assets/data/indiaCities.json'
import { useNavigate } from 'react-router-dom'

const popular = ['Ahmedabad','Bengaluru','Delhi/NCR','Hyderabad','Jaipur','Kolkata','Lucknow','Mumbai','Pune','Vijayawada','Chennai','Vizag']
const allCities = citiesData

const Cities = () => {
  const [query,setQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState('')
  const [activeLetter, setActiveLetter] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    if(!q) return allCities
    return allCities.filter(c=>c.toLowerCase().includes(q))
  },[query])

  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const grouped = useMemo(()=>{
    const g = Object.fromEntries(alpha.map(ch => [ch, []]))
    for(const c of allCities){
      const ch = (c[0]||'').toUpperCase()
      if(g[ch]) g[ch].push(c)
    }
    return g
  },[])

  const pick = (name) => {
    try{ localStorage.setItem('selectedCity', JSON.stringify({ name })) }catch{}
    navigate(-1)
  }

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-28 pb-20'>
      <h1 className='text-xl font-semibold mb-4'>Select Location</h1>

      <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder='Search city, area or locality' className='w-full bg-white/10 border border-white/20 rounded px-4 py-3 outline-none' />

      <h2 className='mt-8 mb-3 text-gray-300'>Popular Cities</h2>
      <div className='flex flex-wrap gap-2'>
        {popular.map(c => (
          <button key={c} onClick={()=>pick(c)} className='px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 cursor-pointer'>{c}</button>
        ))}
      </div>

      <h2 className='mt-8 mb-3 text-gray-300'>All Cities</h2>
      <div className='flex flex-wrap gap-3 text-sm text-gray-400 sticky top-24 z-10 bg-black/40 backdrop-blur px-2 py-2 rounded'>
        {alpha.map(ch=> (
          <button
            key={ch}
            onClick={()=> setSelectedLetter(l => l===ch ? '' : ch)}
            className={`px-2 py-0.5 rounded hover:text-white ${ (selectedLetter||activeLetter)===ch ? 'bg-white/10 text-white border border-white/10' : ''}`}
          >{ch}</button>
        ))}
        {selectedLetter && (
          <button onClick={()=>setSelectedLetter('')} className='ml-2 px-2 py-0.5 text-xs rounded border border-white/10 hover:bg-white/10'>Clear</button>
        )}
      </div>

      {query.trim() ? (
        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2'>
          {filtered.length ? filtered.map(c => (
            <button key={c} onClick={()=>pick(c)} className='text-left hover:text-white cursor-pointer'>{c}</button>
          )) : (
            <p className='text-gray-400'>No results</p>
          )}
        </div>
      ) : selectedLetter ? (
        <div className='mt-4'>
          <div className='mb-2 text-sm text-gray-400'>Showing cities starting with <span className='text-white font-medium'>{selectedLetter}</span></div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2'>
            {(grouped[selectedLetter]||[]).map(c => (
              <button key={c} onClick={()=>pick(c)} className='text-left hover:text-white cursor-pointer'>{c}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className='mt-4'>
          {alpha.map(ch => (
            grouped[ch].length ? (
              <div key={ch} id={`c-${ch}`} className='mb-6'>
                <h3 className='text-sm text-gray-400 mb-2'>{ch}</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2'>
                  {grouped[ch].map(c => (
                    <button key={c} onClick={()=>pick(c)} className='text-left hover:text-white cursor-pointer'>{c}</button>
                  ))}
                </div>
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  )
}

export default Cities
