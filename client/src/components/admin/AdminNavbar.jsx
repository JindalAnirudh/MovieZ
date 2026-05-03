import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const AdminNavbar = () => {
  return (
    <div className='flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30'>
      <Link to="/">
        <img src={assets.logo} alt="logo" className='w-36 h-auto'/>
      </Link>
      <div className='flex items-center gap-3'>
        <Link
          to="/"
          className='px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition'
        >
          Back to Website
        </Link>
      </div>
    </div>
  )
}

export default AdminNavbar
