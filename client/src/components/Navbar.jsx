import React,{useEffect, useState} from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, MapPin, SearchIcon, TicketPlus, User, XIcon } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import HelpChat from './HelpChat'

const Navbar = () => {

    const [isMobileMenuOpen,setIsMobileMenuOpen]=useState(false) 
    const [isUserMenuOpen,setIsUserMenuOpen]=useState(false)
    const [showHelp,setShowHelp]=useState(false)
    const {user} = useAppContext()

    const navigate=useNavigate()
    const {favoriteMovies, setUser}=useAppContext()
    const location = useLocation()
    const [cityName, setCityName] = useState(() => {
      try{ return JSON.parse(localStorage.getItem('selectedCity')||'null')?.name || '' }catch{ return '' }
    })
    useEffect(()=>{
      try{ setCityName(JSON.parse(localStorage.getItem('selectedCity')||'null')?.name || '') }catch{}
      // also listen to cross-tab updates
      const onStorage = (e)=>{ if(e.key==='selectedCity'){ try{ setCityName(JSON.parse(e.newValue||'null')?.name || '') }catch{} } }
      window.addEventListener('storage', onStorage)
      return ()=> window.removeEventListener('storage', onStorage)
    },[location.pathname])
    const handleLogout = () => {
      try{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
      }catch{}
    }

  return (
    <div className='fixed top-2 md:top-3 left-0 z-50 w-full h-16 flex items-center justify-between px-6 md:px-16 lg:px-36'>
       <div className='flex items-center gap-4 max-md:flex-1'>
         <Link to='/'>
          <img src={assets.logo} alt="" className='block w-36 h-auto'/>
        </Link>
         <div className='hidden sm:block w-px h-8 md:h-10 lg:h-12 bg-white/20 mx-1'></div>
         <button onClick={()=>navigate('/cities')} className='inline-flex items-center gap-2 text-base md:text-lg font-semibold text-white/90 hover:text-white cursor-pointer'>
           <MapPin className='w-4 h-4 text-primary'/>
           <span>{cityName || 'Cities'}</span>
         </button>
       </div>

       <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-40 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isMobileMenuOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>

        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={()=>setIsMobileMenuOpen(v=>!v)} />
        <Link onClick={()=>{scrollTo(0,0);setIsMobileMenuOpen(false)}} to='/'>Home</Link>
        <Link onClick={()=>{scrollTo(0,0);setIsMobileMenuOpen(false)}} to='/movies'>Movies</Link>
        <Link onClick={()=>{scrollTo(0,0);setIsMobileMenuOpen(false)}} to='/theatres'>Theatres</Link>
        <Link onClick={()=>{scrollTo(0,0);setIsMobileMenuOpen(false)}} to='/my-bookings'>Bookings</Link>
      { favoriteMovies.length>0 && <Link onClick={()=>{scrollTo(0,0);setIsMobileMenuOpen(false)}}  to='/favorite'>Favorites</Link>}
       </div>

       <div className='flex items-center gap-8'>
        <div className='relative max-md:hidden'>
          <input
            type='text'
            placeholder='Search for movies'
            className='w-64 lg:w-80 pl-10 pr-4 py-2 rounded-full bg-white/10 border border-gray-300/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-primary/60'
            onFocus={()=>{
              navigate('/search')
            }}
            onKeyDown={(e)=>{
              if(e.key==='Enter'){
                const term = e.currentTarget.value.trim()
                if(term){ navigate(`/search?q=${encodeURIComponent(term)}`) }
                else { navigate('/search') }
              }
            }}
          />
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80' />
        </div>
        {
          !user ? (
            <button onClick={()=>navigate('/login')} className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>Login</button>
          ) : (
            <div className='relative'>
              {(()=>{
                const initial = (user?.name || user?.email || 'U').trim().charAt(0).toUpperCase()
                return (
                  <button onClick={()=>setIsUserMenuOpen(v=>!v)} aria-label='User menu' className='w-9 h-9 rounded-full bg-white/10 border border-gray-300/20 flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-white/20'>
                    {initial}
                  </button>
                )
              })()}
              {isUserMenuOpen && (
                <div className='absolute right-0 mt-2 w-44 rounded-md border border-white/10 bg-black/80 backdrop-blur p-1 shadow-lg'>
                  {user?.role === 'admin' && (
                    <button onClick={()=>{setIsUserMenuOpen(false); navigate('/admin')}} className='w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10 cursor-pointer'>Dashboard</button>
                  )}
                  <button onClick={()=>{setIsUserMenuOpen(false); setShowHelp(true)}} className='w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10 cursor-pointer'>Help</button>
                  <div className='h-px bg-white/10 my-1' />
                  <button onClick={()=>{setIsUserMenuOpen(false); handleLogout()}} className='w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10 cursor-pointer'>Logout</button>
                </div>
              )}
            </div>
          )
        }

      </div>
    
       <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer' onClick={()=>setIsMobileMenuOpen(v=>!v)}/>
       {showHelp && <HelpChat onClose={()=>setShowHelp(false)} />}

     
    </div>
  )
}

export default Navbar
