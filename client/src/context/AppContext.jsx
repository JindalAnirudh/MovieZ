import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL
export const AppContext=createContext()
export const AppProvider=({children})=>{

    const [isAdmin,setIsAdmin]=useState(false)
    const [shows,setShows]=useState([])
    const [favoriteMovies,setFavoriteMovies]=useState([])
    const [nowPlaying, setNowPlaying] = useState([])
    const image_base_url=import.meta.env.VITE_TMDB_IMAGE_BASE_URL
    const [user,setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    })
    const getToken = async () => localStorage.getItem('token') || ''
    const location=useLocation()
    const navigate=useNavigate()

    const fetchIsAdmin=async()=>{
        try{
            const token = await getToken();
            if (!token) {
                setIsAdmin(false)
                if(location.pathname.startsWith('/admin')){
                    navigate('/')
                    toast.error('You are not authorized to access admin dashboard')
                }
                return
            }
            const {data}=await axios.get('/api/admin/is-admin',{headers:{Authorization:`Bearer ${token}`}}) 
            setIsAdmin(!!data.isAdmin)
            try{ localStorage.setItem('isAdmin', data.isAdmin ? 'true' : 'false') }catch{}

            if(!data.isAdmin && location.pathname.startsWith('/admin')){
                navigate('/')
                toast.error('You are not authorized to access admin dashboard')
            }
        }
        catch(error){
            // Handle admin check gracefully - don't block app functionality
            console.log('Admin check failed, user is not admin:', error?.response?.status || error.message);
            setIsAdmin(false);
            try{ localStorage.setItem('isAdmin','false') }catch{}
        }
    }

    const fetchShows=async()=>{
        try{
            let city = ''
            try{ city = JSON.parse(localStorage.getItem('selectedCity')||'null')?.name || '' }catch{}
            const {data}=await axios.get('/api/show/all', { params: city ? { city } : {} })
            if(data.success){
                setShows(data.shows)
            }
            else{
                toast.error(data.message)
            }
        }
        catch(error){
            console.error(error);   
        }
    }

    const fetchFavoriteMovies=async()=>{
        try{
            const token = await getToken();
            if(!token){
                setFavoriteMovies([])
                return
            }
            const {data}=await axios.get('/api/user/favorites',{headers:{Authorization:`Bearer ${token}`}})
            if(data.success){
                setFavoriteMovies(data.movies)
            }
            else{
                toast.error(data.message)
            }
        }
        catch(error){
            console.error(error);
        }
    }

    // TMDB: Now Playing (resilient public endpoint with cache/fallback)
    const fetchNowPlaying = async(page=1)=>{
        try{
            console.log('Fetching now playing movies...');
            const { data } = await axios.get('/api/show/discover/now-playing', { params: { page, region: 'IN' } })
            
            console.log('Movies API response:', data);
            
            if(data?.success && Array.isArray(data.movies)){
                console.log('Setting movies:', data.movies.length, 'movies found');
                setNowPlaying(data.movies)
            } else {
                console.log('No movies found in response');
                setNowPlaying([])
            }
        }catch(err){
            console.log('Movie fetch error:', err?.response?.status || err.message);
            setNowPlaying([])
        }
    }

    useEffect(()=>{
        fetchShows()
        fetchNowPlaying(1)
    },[])


    useEffect(()=>{
        if(user){
            fetchIsAdmin()
            fetchFavoriteMovies()
        }
        
    },[user])

    // Refresh shows when route changes (captures newly selected city persisted in localStorage)
    useEffect(()=>{
        fetchShows()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[location.pathname])

    // Keep user in sync when route changes (after login/signup navigations)
    useEffect(()=>{
        try{
            const stored = localStorage.getItem('user');
            const parsed = stored ? JSON.parse(stored) : null;
            if((parsed?.email||'') !== (user?.email||'')){
                setUser(parsed)
            }
        }catch{}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[location.pathname])
    const value={
        axios,
        fetchIsAdmin, 
        user,setUser,getToken,navigate,isAdmin,shows,
        favoriteMovies,fetchFavoriteMovies,image_base_url,
        nowPlaying, fetchNowPlaying
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext=()=>useContext(AppContext)