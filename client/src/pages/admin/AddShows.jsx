import React, { useEffect, useState, useRef, useMemo } from 'react'
import { dummyShowsData } from '../../assets/assets';
import citiesData from '../../assets/data/indiaCities.json'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { CheckIcon, DeleteIcon, StarIcon } from 'lucide-react';
import { kConverter } from '../../lib/kConverter';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

// Horizontal slider component for movies
const Slider = ({ nowPlayingMovies, selectedMovie, setSelectedMovie, image_base_url }) => {
  const listRef = useRef(null);
  const scroll = (dir) => {
    const el = listRef.current; if(!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };
  return (
    <div className='mt-6'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-semibold'>Movies</h3>
        <div className='space-x-2'>
          <button onClick={()=>scroll(-1)} className='px-3 py-1 rounded border border-white/20 hover:bg-white/10 cursor-pointer'>◀</button>
          <button onClick={()=>scroll(1)} className='px-3 py-1 rounded border border-white/20 hover:bg-white/10 cursor-pointer'>▶</button>
        </div>
      </div>
      <div ref={listRef} className='flex gap-4 overflow-x-auto pb-2 no-scrollbar'>
        {nowPlayingMovies.map(movie => {
          const checked = selectedMovie === movie.id;
          return (
            <label key={movie.id} onClick={()=>setSelectedMovie(movie.id)} className={`min-w-[220px] max-w-[220px] border rounded-lg overflow-hidden cursor-pointer shrink-0 ${checked ? 'border-primary ring-2 ring-primary/40' : 'border-white/10 hover:border-white/20'}`}>
              <img src={image_base_url + movie.poster_path} alt='' className='w-full h-40 object-cover' />
              <div className='p-2'>
                <p className='font-medium truncate'>{movie.title}</p>
                <p className='text-gray-400 text-xs'>{movie.release_date}</p>
              </div>
              <input
                type='radio'
                name='movieSelect'
                className='absolute top-2 left-2 h-5 w-5 accent-primary'
                checked={checked}
                onChange={() => setSelectedMovie(movie.id)}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

const AddShows = () => {

  const {axios,getToken,user,image_base_url}=useAppContext()

  const currency=import.meta.env.VITE_CURRENCY
  const [nowPlayingMovies,setNowPlayingMovies]=useState([]);
  const [searchQuery,setSearchQuery]=useState("");
  const [isSearching,setIsSearching]=useState(false);
  const [selectedMovie,setSelectedMovie]=useState(null);
  const [dateTimeSelection,setDateTimeSelection]=useState({});
  const [dateTimeInput,setDateTimeInput]=useState("");
  const [showPrice,setShowPrice]=useState("")
  const [priceVip,setPriceVip]=useState("")
  const [pricePremium,setPricePremium]=useState("")
  const [priceNormal,setPriceNormal]=useState("")

  const[addingShow,setAddingShow]=useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [applyAllCities, setApplyAllCities] = useState(false)
  const [selectedTheatres, setSelectedTheatres] = useState([])
  const [theatreOptions, setTheatreOptions] = useState([])
  const [loadingTheatres, setLoadingTheatres] = useState(false)
  const uniqueCities = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const c of (Array.isArray(citiesData) ? citiesData : [])) {
      const t = (c ?? '').toString().trim()
      const key = t.toLowerCase()
      if (t && !seen.has(key)) { seen.add(key); out.push(t) }
    }
    return out
  }, [])
  const theatresForCity = (city) => {
    if(!city) return []
    const base = [
      `${city} Central Cinema`,
      `${city} Cityplex Mall`,
      `${city} Grand Theatre`,
      `${city} Inox`,
      `${city} PVR`
    ]
    return base
  }

  // Load real theatres for selected city via server -> Google Places
  useEffect(()=>{
    let cancelled = false
    const load = async () => {
      if(!selectedCity || applyAllCities){ setTheatreOptions([]); return }
      try{
        setLoadingTheatres(true)
        const { data } = await axios.get('/api/places/theatres', { params: { city: selectedCity } })
        if(!cancelled){
          const list = Array.isArray(data?.theatres) ? data.theatres : []
          setTheatreOptions(list.map(t => ({ name: t.name, place_id: t.place_id })))
        }
      }catch(err){
        if(!cancelled){ setTheatreOptions([]) }
      }finally{
        if(!cancelled){ setLoadingTheatres(false) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedCity, applyAllCities, axios])

  const fetchNowPlayingMovies=async()=>{
    try{
      const {data}=await axios.get('/api/show/now-playing',{headers:{Authorization:`Bearer ${await getToken()}`}})  
      if(data.success){
        setNowPlayingMovies(data.movies)
      }

    }
    catch(error){ 
      console.error('Error fetching movies:',error)
    }
  };

  const fetchSearchMovies = async(q) => {
    if(!q) return fetchNowPlayingMovies();
    try{
      setIsSearching(true)
      const {data} = await axios.get(`/api/show/search`,{
        params:{ q },
        headers:{ Authorization:`Bearer ${await getToken()}` }
      })
      if(data.success){ setNowPlayingMovies(data.movies || []) }
    }catch(err){ console.error('Search error:', err) }
    finally{ setIsSearching(false) }
  }


  const handleDateTimeAdd=()=>{
    if(!dateTimeInput) return;
    const [date,time]=dateTimeInput.split("T");
    if(!date || !time) return;
    setDateTimeSelection((prev)=>{
      const times=prev[date] || [];
      if(!times.includes(time)) {
        return {...prev,[date]:[...times,time]};

      }
      return prev;
    });
  };

  const handleRemoveTime=(date,time)=>{
    setDateTimeSelection((prev)=>{
      const filteredTimes=prev[date].filter((t)=>t!==time);
      if(filteredTimes.length===0){
        const {[date]:_,...rest}=prev;
        return rest;
      }
      return{
        ...prev,
        [date]:filteredTimes,
      };
    });
  }; 


  const handleSubmit=async()=>{
    try{
      setAddingShow(true)
      if(!selectedMovie || Object.keys(dateTimeSelection).length===0 || (!showPrice && !(priceVip||pricePremium||priceNormal)) ){
        toast('Missing required fields')
        setAddingShow(false)
        return
      }
      const showsInput=Object.entries(dateTimeSelection).map(([date,time])=>({date,time}));
      const payload={
        movieId:selectedMovie,
        showsInput,
        showPrice: showPrice ? Number(showPrice) : undefined,
        showPrices: (priceVip||pricePremium||priceNormal) ? {
          vip: priceVip ? Number(priceVip) : undefined,
          premium: pricePremium ? Number(pricePremium) : undefined,
          normal: priceNormal ? Number(priceNormal) : undefined,
        } : undefined,
        movieTitle: selectedMovieData?.title,
        poster_path: selectedMovieData?.poster_path,
        backdrop_path: selectedMovieData?.backdrop_path || selectedMovieData?.poster_path,
        release_date: selectedMovieData?.release_date,
        city: applyAllCities ? 'ALL_CITIES' : selectedCity || undefined,
        theatres: applyAllCities ? 'ALL_THEATRES' : selectedTheatres
      }
      const {data} =await axios.post('/api/show/add',payload,{headers:{Authorization:`Bearer ${await getToken()}`}})
      if(data.success){
        toast.success(data.message)
        setSelectedMovie(null)
        setDateTimeSelection({})
        setShowPrice("")
        setPriceVip("")
        setPricePremium("")
        setPriceNormal("")
        setSelectedCity('')
        setApplyAllCities(false)
        setSelectedTheatres([])
      }else{
        toast.error(data.message)
      }
    }
    catch(error){
      console.error("Submission error:",error);
      toast.error('An error occured. Please try again. ')
    }
    setAddingShow(false)
  }

    useEffect(()=>{
    if(user){
      fetchNowPlayingMovies();
    } 
  },[user]);

  const selectedMovieData = nowPlayingMovies.find(m=>m.id===selectedMovie)

  return (
    <>
    <Title text1="Add" text2="Shows"/>
    {/* Now Playing Slider (replaces search bar) */}
    <Slider nowPlayingMovies={nowPlayingMovies} selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie} image_base_url={image_base_url} />
    <div className='mt-8'>
      {/* Left-side form panel */}
      <div className='border border-white/10 rounded-lg p-4 max-w-xl'>
        <p className='text-sm text-gray-400 mb-2'>Selected Movie</p>
        {selectedMovieData ? (
          <div className='flex items-center gap-3 mb-4'>
            <img src={image_base_url + selectedMovieData.poster_path} alt='' className='w-12 h-16 object-cover rounded'/>
            <div className='min-w-0'>
              <p className='font-medium truncate max-w-[180px]'>{selectedMovieData.title}</p>
              <p className='text-gray-400 text-xs'>{selectedMovieData.release_date}</p>
            </div>
          </div>
        ) : (
          <p className='text-gray-500 mb-4'>No movie selected</p>
        )}

        <label className='block text-sm font-medium mb-2'>Location</label>
        <div className='space-y-3 mb-4'>
          <div className='flex items-center gap-3'>
            <input id='allCities' type='checkbox' className='accent-primary' checked={applyAllCities} onChange={(e)=>{ setApplyAllCities(e.target.checked); if(e.target.checked){ setSelectedCity(''); setSelectedTheatres([]) } }} />
            <label htmlFor='allCities' className='text-sm'>Apply to all cities</label>
          </div>
          {!applyAllCities && (
            <>
              <div className='relative'>
                <select
                  value={selectedCity}
                  onChange={(e)=>{ setSelectedCity(e.target.value); setSelectedTheatres([]) }}
                  className='w-full appearance-none bg-black/40 hover:bg-black/50 text-white border border-white/15 rounded-lg px-3 py-2 pr-9 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition'
                >
                  <option value='' disabled>Select a city</option>
                  {uniqueCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
                  <path fillRule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clipRule='evenodd' />
                </svg>
              </div>
              {selectedCity && (
                <div>
                  <p className='text-xs text-gray-400 mb-1'>Select theatres in {selectedCity}</p>
                  <div className='flex flex-wrap gap-2'>
                    {(theatreOptions.length ? theatreOptions.map(t=>t.name) : theatresForCity(selectedCity)).map(name => {
                      const checked = selectedTheatres.includes(name)
                      return (
                        <label key={name} className={`px-3 py-1 rounded-full border cursor-pointer text-xs ${checked? 'border-primary bg-primary/10' : 'border-white/20 hover:bg-white/10'}`}> 
                          <input type='checkbox' className='hidden' checked={checked} onChange={(e)=>{
                            setSelectedTheatres(prev => e.target.checked ? [...prev, name] : prev.filter(n=>n!==name))
                          }} />
                          {name}
                        </label>
                      )
                    })}
                    {loadingTheatres && (
                      <span className='text-xs text-gray-400'>Loading theatres…</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <label className='block text-sm font-medium mb-2'>Show Prices</label>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4'>
          <div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
            <span className='text-xs text-gray-400'>VIP</span>
            <p className='text-gray-400 text-sm'>{currency}</p>
            <input min={0} type='number' value={priceVip} onChange={(e)=>setPriceVip(e.target.value)} placeholder='0' className='outline-none bg-transparent w-20' />
          </div>
          <div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
            <span className='text-xs text-gray-400'>Premium</span>
            <p className='text-gray-400 text-sm'>{currency}</p>
            <input min={0} type='number' value={pricePremium} onChange={(e)=>setPricePremium(e.target.value)} placeholder='0' className='outline-none bg-transparent w-20' />
          </div>
          <div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
            <span className='text-xs text-gray-400'>Normal</span>
            <p className='text-gray-400 text-sm'>{currency}</p>
            <input min={0} type='number' value={priceNormal} onChange={(e)=>setPriceNormal(e.target.value)} placeholder='0' className='outline-none bg-transparent w-20' />
          </div>
        </div>
        <p className='text-xs text-gray-500 mb-2'>Tip: You can fill either the three tier prices or a single fallback price below.</p>
        <div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md mb-4'>
          <span className='text-xs text-gray-400'>Fallback</span>
          <p className='text-gray-400 text-sm'>{currency}</p>
          <input min={0} type='number' value={showPrice} onChange={(e)=>setShowPrice(e.target.value)} placeholder='Enter one price for all' className='outline-none bg-transparent' />
        </div>

        <label className='block text-sm font-medium mb-2'>Select Date and Time</label>
        <div className='inline-flex gap-3 border border-gray-600 p-1 pl-3 rounded-lg w-full'>
          <input type='datetime-local' value={dateTimeInput} onChange={(e)=>setDateTimeInput(e.target.value)} className='outline-none rounded-md bg-transparent' />
          <button onClick={handleDateTimeAdd} className='bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer'>Add</button>
        </div>

        {Object.keys(dateTimeSelection).length>0 && (
          <div className='mt-4'>
            <p className='mb-2 text-sm text-gray-400'>Selected Date-time</p>
            <ul className='space-y-3'>
              {Object.entries(dateTimeSelection).map(([date,times])=> (
                <li key={date}>
                  <div className='font-medium text-sm'>{date}</div>
                  <div className='flex flex-wrap gap-2 mt-1 text-xs'>
                    {times.map((time)=> (
                      <div key={time} className='border border-primary px-2 py-1 flex items-center rounded'>
                        <span>{time}</span>
                        <DeleteIcon onClick={()=>handleRemoveTime(date,time)} width={14} className='ml-2 text-red-500 hover:text-red-700 cursor-pointer'/>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={handleSubmit} disabled={addingShow || !selectedMovie} className='w-full bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-60'>Add Show</button>
      </div>

      {/* Movies grid beneath the form */}
      <div className='mt-8'>
        <div className='overflow-x-auto pb-4 w-full'>
          {nowPlayingMovies.length === 0 ? (
            <div className='mt-6 text-gray-400'>
              <p>No movies loaded. Try Search above or refresh Now Playing.</p>
              <button onClick={fetchNowPlayingMovies} className='mt-3 bg-white/10 border border-gray-300/20 hover:bg-white/20 transition rounded-full text-sm font-medium cursor-pointer px-4 py-2'>Reload Now Playing</button>
            </div>
          ) : (
            <div className='mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
              {nowPlayingMovies.map((movie)=>{
                const checked = selectedMovie === movie.id;
                return (
                  <label key={movie.id} onClick={()=>setSelectedMovie(movie.id)} className={`relative border rounded-lg overflow-hidden cursor-pointer transition ${checked ? 'border-primary ring-2 ring-primary/50' : 'border-white/10 hover:border-white/20'}`}>
                    <img src={image_base_url + movie.poster_path} alt='' className='w-full h-48 object-cover' />
                    <div className='p-2'>
                      <p className='font-medium truncate'>{movie.title}</p>
                      <p className='text-gray-400 text-xs'>{movie.release_date}</p>
                    </div>
                    <input
                      type='radio'
                      name='movieSelect'
                      className='absolute top-2 left-2 h-5 w-5 accent-primary'
                      checked={checked}
                      onChange={() => setSelectedMovie(movie.id)}
                    />
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default AddShows
