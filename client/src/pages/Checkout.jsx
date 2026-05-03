import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import isoTimeFormat from '../lib/isoTimeFormat'

const Checkout = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { axios, getToken } = useAppContext()
  const [quote, setQuote] = useState({ subtotal: 0, fees: 0, total: 0, ticketCount: 0 })
  const [loading, setLoading] = useState(true)

  if(!state){
    navigate('/')
    return null
  }

  const { showId, selectedSeats, time, movie, date, theatre } = state
  useEffect(()=>{
    (async()=>{
      try{
        const { data } = await axios.post('/api/booking/quote', { showId, selectedSeats }, { headers:{ Authorization:`Bearer ${await getToken()}` } })
        if(data?.success){
          setQuote({ subtotal: data.subtotal, fees: data.fees, total: data.total, ticketCount: data.ticketCount })
        }
      }catch{}
      setLoading(false)
    })()
  },[axios, getToken, showId, selectedSeats])

  const proceedToPay = async () => {
    try{
      const { data } = await axios.post('/api/booking/create', { showId, selectedSeats }, { headers:{ Authorization:`Bearer ${await getToken()}` } })
      if(data.success){
        window.location.href = data.url
      }
    }catch(err){
      // noop
    }
  }

  return (
    <div className='px-6 md:px-16 lg:px-40 py-28'>
      <h1 className='text-2xl font-semibold mb-6'>Review your booking</h1>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-4'>
          <div className='border border-white/10 rounded-lg p-4'>
            <div className='flex items-center gap-4'>
              <img src={`https://image.tmdb.org/t/p/w154${movie?.poster_path}`} alt='' className='w-14 h-20 object-cover rounded' />
              <div>
                <p className='font-semibold'>{movie?.title}</p>
                <p className='text-sm text-gray-400'>{new Date(date).toDateString()} · {isoTimeFormat(time)}</p>
                {theatre && (
                  <p className='text-sm text-gray-300 mt-1'>Theatre: <span className='text-white font-medium'>{theatre}</span></p>
                )}
              </div>
            </div>
            <div className='mt-4 text-sm text-gray-300'>
              <p>{selectedSeats.length} {selectedSeats.length>1?'tickets':'ticket'} · Seats: {selectedSeats.join(', ')}</p>
            </div>
          </div>

          <div className='border border-yellow-400/20 rounded-lg p-4 bg-yellow-400/5'>
            <p className='text-sm'>This theatre may not allow cancellations.</p>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='border border-white/10 rounded-lg p-4'>
            <p className='font-semibold mb-3'>Payment summary</p>
            <div className='flex items-center justify-between text-sm py-1'>
              <span>Tickets ({quote.ticketCount || selectedSeats.length})</span>
              <span>₹ {loading ? '-' : quote.subtotal}</span>
            </div>
            <div className='flex items-center justify-between text-sm py-1'>
              <span>Convenience fee</span>
              <span>₹ {loading ? '-' : quote.fees}</span>
            </div>
            <div className='h-px bg-white/10 my-2'></div>
            <div className='flex items-center justify-between font-semibold py-1'>
              <span>Total to be paid</span>
              <span>₹ {loading ? '-' : quote.total}</span>
            </div>
            <button onClick={proceedToPay} className='w-full mt-4 bg-primary hover:bg-primary-dull transition rounded-full text-white text-sm font-medium py-3 cursor-pointer'>Proceed to Pay</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
