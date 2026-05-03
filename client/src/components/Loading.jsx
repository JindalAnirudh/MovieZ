import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const Loading = () => {
  const {nextUrl}=useParams()
  const navigate=useNavigate()
  const [paid,setPaid]=useState(false)
  const sessionId = useMemo(()=>{
    try{
      const sp = new URLSearchParams(window.location.search)
      return sp.get('session_id')
    }catch{ return null }
  },[])
  useEffect(()=>{
    const run = async()=>{
      try{
        if(sessionId){
          const API_BASE = import.meta.env.VITE_BASE_URL || ''
          const {data} = await axios.get(`${API_BASE}/api/booking/verify/${sessionId}`)
          if(data?.success && data?.paid){ setPaid(true) }
        }
      }catch{ /* ignore */ }
      finally{
        if(nextUrl){
          const timer = setTimeout(()=>{ navigate('/'+nextUrl) }, 1200)
          return () => clearTimeout(timer)
        }
      }
    }
    run()
  },[])
  // If we have a Stripe session, show payment confirmation UI
  if(sessionId){
    return (
      <div className='flex flex-col justify-center items-center h-[80vh] gap-4'>
        <div className='flex items-center justify-center w-20 h-20 rounded-full bg-green-500/15 border border-green-500/40'>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className='text-xl font-semibold text-green-500'>{paid ? 'Payment successful' : 'Confirming payment...'}</h2>
        {nextUrl && <p className='text-gray-400'>Redirecting to <span className='text-white font-medium'>/{nextUrl}</span> ...</p>}
      </div>
    )
  }
  // Otherwise show a neutral spinner (used across app e.g. admin guard)
  return (
    <div className='flex justify-center items-center h-[80vh]'>
      <div className='animate-spin rounded-full h-14 w-14 border-2 border-t-primary'></div>
    </div>
  )
}

export default Loading
