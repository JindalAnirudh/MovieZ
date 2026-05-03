import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'


const SeatLayout = () => {
  const {axios,getToken,user}=useAppContext()
  const groupRows=[["A","B"],["C","D"],["E","F"],["G","H"],["I","J"]]
  const{id,date}=useParams()
  const location = useLocation()
  const selectedTheatre = location.state?.theatre || ''
  const [selectedSeats,setSelectedSeats]=useState([])
  const [selectedTime,setSelectedTime]=useState(null)
  const [show,setShow]=useState(null)
  const [occupiedSeats,setOccupiedSeats]=useState([])
  const navigate=useNavigate()

  const getShow=async()=>{
    try{
      let city = ''
      try{ city = JSON.parse(localStorage.getItem('selectedCity')||'null')?.name || '' }catch{}
      const {data}=await axios.get(`/api/show/${id}`, { params: city ? { city } : {} })
      if(data.success){
        setShow(data)
      }
    }
    catch(error){
      console.log(error);
    }
  }

  const handleSeatClick=(seatId)=>{
    if(!selectedTime){
      return toast("Please select time first")
    }
     if(!selectedSeats.includes(seatId) && selectedSeats.length>4){
      return toast("You can only select 5 seats")
     }
     if(occupiedSeats.includes(seatId)){
      return toast('This seat is already occupied')
     }
     setSelectedSeats(prev=>prev.includes(seatId) ? prev.filter(seat=>seat!==seatId): [...prev,seatId] )
  }
  const renderSeats =(row,count=9)=>(
    <div key={row} className='flex gap-2 mt-2' >
      <div className='flex flex-wrap items-center justify-center gap-2'>
        {Array.from({length:count},(_, i)=>{
          const seatId=`${row}${i+1}`;
          return(
            <button key={seatId} onClick={()=>handleSeatClick
              (seatId)} className={`h-8 w-8 rounded border border-primary/
                60 cursor-pointer 
                ${selectedSeats.includes(seatId) && 
                  "bg-primary text-white"
                } 
                ${occupiedSeats.includes(seatId) && "opacity-50"}`}>{seatId}</button>
          );
        })}
      </div>
    </div>
  )

  const getOccupiedSeats=async()=>{
    try{
      const {data}=await axios.get(`/api/booking/seats/${selectedTime.showId}`)
      if(data.success){
        setOccupiedSeats(data.occupiedSeats)
      }
      else{
        toast.error(data.message)
      }
    }
    catch(error){
      console.log(error);
    }
  }

  const bookTickets=async()=>{
    try{
      if(!user) return toast.error("Please Login to proceed")
      if(!selectedTime || !selectedSeats.length) return toast.error("Please select time and seats")
      navigate('/checkout', {
        state: {
          showId: selectedTime.showId,
          selectedSeats,
          time: selectedTime.time,
          movie: show.movie,
          date,
          theatre: selectedTheatre,
        }
      })
    }catch(error){
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    getShow()
  },[])

  useEffect(()=>{
    if(selectedTime){
      getOccupiedSeats()
    }
  },[selectedTime])
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const showPriceValue = selectedTime?.showPrice ?? ''
  const tierPrices = selectedTime?.prices || {}
  const priceVip = tierPrices.vip ?? showPriceValue
  const pricePremium = tierPrices.premium ?? showPriceValue
  const priceNormal = tierPrices.normal ?? showPriceValue

  const timesForDate = useMemo(()=>{
    if(!show) return []
    const map = show.theatreDateTime || {}
    const perTheatre = selectedTheatre ? (map[selectedTheatre] || {}) : {}
    return perTheatre[date] || []
  },[show, selectedTheatre, date])

  return  show ? (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30
    md:pt-50'>
      <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10
      h-max md:sticky md:top-30'>
        <p className='text-lg font-semibold px-6'>Available Timings</p>
        <div className='mt-5 space-y-1'>
          {timesForDate.length ? timesForDate.map((item)=>(
            <div key={item.time} onClick={()=>setSelectedTime(item)} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md
            cursor-pointer transition ${selectedTime?.time===item.time ? 
              "bg-primary text-white" : "hover:bg-primary/20"
            }`}>
              <ClockIcon className='w-4 h-4'/>
              <p className='text-sm'>{isoTimeFormat(item.time)}</p>
            </div>
          )) : (
            <div className='px-6 text-xs text-gray-400'>No timings for the selected theatre/date</div>
          )}
        </div>
      </div>
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0"/>

        <h1 className='text-2xl font-semibold mb-4'>Select your seat</h1>
        < img src={assets.screenImage} alt="screen" />
        <p className='text-gray-400 text-sm mb-4'>SCREEN SIDE</p>
        <div className='flex flex-col items-center mt-6 text-xs text-gray-300'>
          <p className='text-sm font-semibold mb-1'>VIP : {currency}{priceVip}</p>
          <div className='grid grid-cols-2 md:grid-cols-1 gap-6 md:gap-2 mb-4'>
            {groupRows[0].map(row=>renderSeats(row))}
          </div>

          <div className='grid grid-cols-2 gap-5'>
            <div className='col-span-2 text-center text-sm font-semibold mb-1'>PREMIUM : {currency}{pricePremium}</div>
            <div>
              {groupRows[1].map(row=>renderSeats(row))}
            </div>
            <div>
              {groupRows[2].map(row=>renderSeats(row))}
            </div>
            <div className='col-span-2 text-center text-sm font-semibold my-1'>NORMAL : {currency}{priceNormal}</div>
            <div>
              {groupRows[3].map(row=>renderSeats(row))}
            </div>
            <div>
              {groupRows[4].map(row=>renderSeats(row))}
            </div>
          </div>
        </div>
        <button onClick={bookTickets} className='flex items-center gap-1 mt-10 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className='w-4 h-4'/>
        </button>
      </div>
      
    </div>
  ) : (
    <Loading/>
  )
}

export default SeatLayout
