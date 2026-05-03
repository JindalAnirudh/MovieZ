import React from 'react'
import Navbar from './components/Navbar'
import {Routes,Route,useLocation} from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings' 
import Favorite from './pages/Favorite'
import {Toaster} from 'react-hot-toast'
import Cities from './pages/Cities'
import Theatres from './pages/Theatres'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout' 
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import ContactManagementPage from './pages/admin/ContactManagement'
import AdminHelp from './pages/admin/Help'
import { useAppContext } from './context/AppContext'
import Loading from './components/Loading'
import AdminLogin from './pages/AdminLogin'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import Signup from './pages/Signup'
import Search from './pages/Search'
import TheatreDetails from './pages/TheatreDetails'
import AboutUs from './pages/AboutUs'
import PrivacyPolicy from './pages/PrivacyPolicy'
const App = () => {
  const isAdminRoute=useLocation().pathname.startsWith('/admin')


  const {user}=useAppContext()
  return (
   <>
   <Toaster />
   { !isAdminRoute &&   <Navbar/>}
   <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/theatres' element={<Theatres/>}/>
    <Route path='/theatres/:theatre' element={<TheatreDetails/>}/>
    <Route path='/cities' element={<Cities/>}/>
    <Route path='/movies' element={<Movies/>}/>
    <Route path='/search' element={<Search/>}/>
    <Route path='/about' element={<AboutUs/>}/>
    <Route path='/privacy' element={<PrivacyPolicy/>}/>
    <Route path='/movies/:id' element={<MovieDetails/>}/>
    <Route path='/movies/:id/:date' element={<SeatLayout/>}/>
    <Route path='/checkout' element={<Checkout/>}/>
    <Route path='/my-bookings' element={<MyBookings/>}/>
    <Route path='/my-bookings' element={<MyBookings/>}/>
    <Route path='/favorite' element={<Favorite/>}/>
    <Route path='/admin-login' element={<AdminLogin/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path='/signup' element={<Signup/>}/>

    <Route path='/loading/:nextUrl' element={<Loading/>}/>
    <Route path='/admin/*' element={
      (user && user.role === 'admin') || (typeof window !== 'undefined' && (()=>{
        try { return (JSON.parse(localStorage.getItem('user')||'null')?.role === 'admin'); } catch { return false; }
      })())
      ? <Layout/> : <AdminLogin/>
    }>
    < Route index element={<Dashboard/>}/>
    <Route path="add-shows" element={<AddShows/> }/>
    <Route path="list-shows" element={<ListShows/> }/>
    <Route path="list-bookings" element={<ListBookings/> }/>
    <Route path="contacts" element={<ContactManagementPage/> }/>
    <Route path="help" element={<AdminHelp/> }/>
    </Route>
   </Routes>
    { !isAdminRoute &&   <Footer/>}
   </>
  )
}

export default App
