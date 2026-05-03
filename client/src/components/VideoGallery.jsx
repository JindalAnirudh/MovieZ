import React, { useEffect, useMemo, useState } from 'react'
import ReactPlayer from 'react-player'

/**
 * VideoGallery component
 * - Shows a main video player at the top
 * - Renders horizontal thumbnails below
 * - Clicking a thumbnail updates the main player and auto-plays immediately
 *
 * Props:
 * - videos: Array<{ url: string, thumbnail: string, title?: string }>
 * - initialIndex?: number (default 0)
 * - className?: string
 */
const VideoGallery = ({ videos = [], initialIndex = 0, className = '' }) => {
  const safeIndex = Math.min(Math.max(initialIndex, 0), Math.max(videos.length - 1, 0))
  const [currentIndex, setCurrentIndex] = useState(safeIndex)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true) // start muted to satisfy browser autoplay policies

  const current = videos[currentIndex]

  // Normalize a YouTube URL (watch?v=..., youtu.be/..., shorts) to an embeddable URL
  const toYouTubeEmbedUrl = (url) => {
    if (!url) return ''
    try {
      if (url.includes('/embed/')) return url
      const watchMatch = url.match(/[?&]v=([^&#]+)/)
      if (watchMatch && watchMatch[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`
      const shortMatch = url.match(/youtu\.be\/([^?&#]+)/)
      if (shortMatch && shortMatch[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`
      const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&#]+)/)
      if (shortsMatch && shortsMatch[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`
      return url
    } catch {
      return url
    }
  }

  const playerUrl = useMemo(() => toYouTubeEmbedUrl(current?.url), [current])

  // Auto-start whenever the current video changes
  useEffect(() => {
    if (current) {
      setPlaying(true)
      setMuted(true) // keep muted on switch; user can unmute
    }
  }, [current])

  if (!current) {
    return <div className={className}>No videos</div>
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Main Player */}
      <div className="relative mt-4">
        <ReactPlayer
          key={playerUrl}
          url={playerUrl}
          width="100%"
          height="56.25vw" // responsive fallback when container is narrow
          style={{ maxWidth: 960, maxHeight: 540, margin: '0 auto' }}
          playing={playing}
          muted={muted}
          controls
          config={{
            youtube: {
              playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
            },
          }}
          onReady={() => setPlaying(true)}
          onError={(e) => console.warn('Video failed to load:', playerUrl, e)}
        />
      </div>

      {/* Thumbnails row */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {videos.map((v, idx) => (
          <button
            key={v.thumbnail + idx}
            type="button"
            onClick={() => {
              if (idx !== currentIndex) setCurrentIndex(idx)
              setPlaying(true)
              setMuted(true)
            }}
            className={`relative rounded-lg overflow-hidden border transition duration-200 hover:-translate-y-0.5 ${
              idx === currentIndex ? 'border-primary' : 'border-transparent'
            }`}
            aria-label={v.title || `Video ${idx + 1}`}
          >
            <img
              src={v.thumbnail}
              alt={v.title || `Video ${idx + 1}`}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
            {v.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 line-clamp-1">
                {v.title}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default VideoGallery
