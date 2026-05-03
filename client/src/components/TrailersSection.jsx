import React, { useEffect, useState } from 'react'
import { dummyTrailers } from '../assets/assets'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { PlayCircleIcon } from 'lucide-react'
const TrailersSection = () => {

    const [currentTrailer,setCurrentTrailer]=useState(dummyTrailers[0])
    const [playing, setPlaying] = useState(true)
    const [muted, setMuted] = useState(true)

    // Normalize a YouTube URL (watch?v=..., youtu.be/...) to an embeddable URL
    const toYouTubeEmbedUrl = (url) => {
      if(!url) return ''
      try{
        // Already an embed url
        if(url.includes('/embed/')) return url
        // watch URLs
        const watchMatch = url.match(/[?&]v=([^&#]+)/)
        if(watchMatch && watchMatch[1]){
          return `https://www.youtube.com/embed/${watchMatch[1]}`
        }
        // youtu.be short links
        const shortMatch = url.match(/youtu\.be\/([^?&#]+)/)
        if(shortMatch && shortMatch[1]){
          return `https://www.youtube.com/embed/${shortMatch[1]}`
        }
        // shorts
        const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&#]+)/)
        if(shortsMatch && shortsMatch[1]){
          return `https://www.youtube.com/embed/${shortsMatch[1]}`
        }
        return url
      }catch{
        return url
      }
    }

    // Auto start when trailer changes
    useEffect(() => {
      if(currentTrailer){
        setPlaying(true)
      }
    }, [currentTrailer])
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
      <p className='text-gray-300 font-medium text-lg max-w-[960px]
      mx-auto'>Trailers</p>
      <div className='relative mt-6'>
        <BlurCircle top='-100px' right='-100px'/>
        {
          // Use native iframe for maximum reliability with YouTube
        }
        <div className='mx-auto' style={{maxWidth: 960}}>
          <div style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12}}>
            <iframe
              key={currentTrailer.videoUrl + (muted ? '-muted' : '-unmuted')}
              src={`${toYouTubeEmbedUrl(currentTrailer.videoUrl)}?autoplay=1&mute=${muted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`}
              title="Trailer player"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0}}
            />
          </div>
        </div>
      </div>

      <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
        {dummyTrailers.map((trailer)=>(
          <button
            type='button'
            key={trailer.image}
            className={`relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer rounded-lg overflow-hidden border ${currentTrailer.videoUrl === trailer.videoUrl ? 'border-primary' : 'border-transparent'}`}
            onClick={() => {
              if(currentTrailer.videoUrl !== trailer.videoUrl){
                setCurrentTrailer(trailer);
              }
              setPlaying(true);
              // Start muted to satisfy autoplay policies; user can unmute via controls
              setMuted(true);
            }}
          >
            <img src={trailer.image} alt="trailer" className='w-full h-full object-cover brightness-75'/>
            <PlayCircleIcon strokeWidth={1.6} className='absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2'/>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TrailersSection
