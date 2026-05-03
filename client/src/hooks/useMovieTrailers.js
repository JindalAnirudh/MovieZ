import { useState, useEffect } from 'react'
import axios from 'axios'

const useMovieTrailers = (movieId, movieTitle) => {
  const [trailers, setTrailers] = useState([])
  const [loading, setLoading] = useState(false)
  const [mainTrailer, setMainTrailer] = useState(null)

  useEffect(() => {
    const fetchTrailers = async () => {
      // Don't fetch if we don't have a movie title or ID
      if (!movieTitle && !movieId) return

      setLoading(true)
      try {
        // Try to fetch trailers from backend
        let response
        if (movieId) {
          response = await axios.get(`/api/show/${movieId}/trailers`)
        } else if (movieTitle) {
          response = await axios.get(`/api/show/trailers`, {
            params: { title: movieTitle }
          })
        }

        if (response.data?.success && Array.isArray(response.data.trailers)) {
          const fetchedTrailers = response.data.trailers
          setTrailers(fetchedTrailers)

          // Set main trailer (prefer official trailer, otherwise first available)
          const officialTrailer = fetchedTrailers.find(t => t.type === 'Trailer' && t.official)
          const firstTrailer = fetchedTrailers[0]
          setMainTrailer(officialTrailer || firstTrailer)
        } else {
          setTrailers([])
          setMainTrailer(null)
        }
      } catch (error) {
        console.error('Error fetching trailers:', error)
        setTrailers([])
        setMainTrailer(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTrailers()
  }, [movieId, movieTitle])

  return { trailers, loading, mainTrailer }
}

export default useMovieTrailers
