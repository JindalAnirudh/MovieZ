import axios from 'axios'
import https from 'https'

const TMDB_BASE = 'https://api.themoviedb.org/3'

let CIRCUIT_OPEN_UNTIL = 0
let LAST_CACHE = { at: 0, data: null }
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

const buildClient = () => {
  const key = (process.env.TMDB_API_KEY || '').trim()
  const isV4 = key && key.startsWith('eyJ')
  const headers = isV4 ? { Authorization: `Bearer ${key}` } : {}
  const httpsAgent = new https.Agent({ keepAlive: false, family: 4 })
  const timeout = 25000
  return { key, isV4, headers, httpsAgent, timeout }
}

export const nowPlaying = async (req, res) => {

    console.log("TMDB KEY CHECK:", process.env.TMDB_API_KEY)



  const { key, isV4, headers, httpsAgent, timeout } = buildClient()
  if(!key) {
    console.error('TMDB_API_KEY is missing. Please set TMDB_API_KEY in your environment variables.')
    return res.status(500).json({ 
      success: false, 
      message: 'TMDB API key is not configured. Please contact support if the issue persists.',
      fallback: 'error'
    })
  }
  if(String(process.env.TMDB_DISABLE || '').toLowerCase() === 'true'){
    return res.json(LAST_CACHE?.data || cachedFallback)
  }
  if(Date.now() < CIRCUIT_OPEN_UNTIL){
    return res.json(LAST_CACHE?.data || cachedFallback)
  }
  const region = (req.query.region || 'IN').toUpperCase()
  const page = Number(req.query.page || 1)

  const doRequestOnce = async (path) => {
    const url = `${TMDB_BASE}${path}`
    const params = { language: 'en-US', page, region }
    if(!isV4) params.api_key = key
    return axios.get(url, { headers, params, httpsAgent, timeout, proxy:false, validateStatus:(s)=>s>=200 && s<500 })
  }
  const shouldRetry = (err) => {
    const code = err?.code || ''
    const status = err?.response?.status || 0
    return [ 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND' ].includes(code) || status >= 500 || status === 429
  }
  const wait = (ms) => new Promise(r=>setTimeout(r, ms))
  const doRequest = async (path) => {
    const delays = [800, 1600, 3000]
    let lastErr
    for (let i=0; i<delays.length; i++){
      try { return await doRequestOnce(path) } catch (e){
        lastErr = e
        if(!shouldRetry(e) || i === delays.length - 1) throw e
        await wait(delays[i])
      }
    }
    throw lastErr
  }

  const cachedFallback = {
    success: true,
    results: [
      { id: 346698, title: 'Barbie', release_date: '2023-07-21', vote_average: 7.2, poster_path: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', backdrop_path: '/ctMserH8g2SeOAnCw5gFjdQF8mo.jpg' },
      { id: 615656, title: 'Meg 2: The Trench', release_date: '2023-08-02', vote_average: 6.6, poster_path: '/FQHtuf2zc8suMFE28RyvFt3FJN.jpg', backdrop_path: '/8pjWz2lt29KyVGoq1mXYu6Br7dE.jpg' },
      { id: 447365, title: 'Guardians of the Galaxy Vol. 3', release_date: '2023-05-03', vote_average: 8.0, poster_path: '/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg', backdrop_path: '/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg' }
    ],
    page: 1,
    total_pages: 1,
    fallback: 'cached'
  }

  try {
    const { data } = await doRequest('/movie/now_playing')

      console.log("TMDB RESPONSE SAMPLE:", data.results[0])

      
    const payload = { success: true, results: data?.results || [], page: data?.page, total_pages: data?.total_pages }
    LAST_CACHE = { at: Date.now(), data: payload }
    return res.json(payload)
  } catch (err1) {
    const code = err1?.code || ''
    const errorMessage = err1?.response?.data?.status_message || err1?.message || code
    
    console.error('TMDB now_playing failed:', {
      error: errorMessage,
      code,
      status: err1?.response?.status,
      url: err1?.config?.url
    })
    
    if(['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'].includes(code)) {
      const cooldown = 10 * 60 * 1000 // 10 minutes
      CIRCUIT_OPEN_UNTIL = Date.now() + cooldown
      console.warn(`TMDB API circuit breaker opened until ${new Date(CIRCUIT_OPEN_UNTIL).toISOString()}`)
    }
    try {
      const { data } = await doRequest('/movie/popular')
      const payload = { success: true, results: data?.results || [], page: data?.page, total_pages: data?.total_pages, fallback: 'popular' }
      LAST_CACHE = { at: Date.now(), data: payload }
      return res.json(payload)
    } catch (err2) {
      const code2 = err2?.code || ''
      if(code2 === 'ETIMEDOUT'){
        CIRCUIT_OPEN_UNTIL = Date.now() + 10 * 60 * 1000
      }
      console.warn('TMDB popular also failed:', err2?.response?.data?.status_message || err2?.message || code2)
      // Serve fresh cache if not stale
      if(LAST_CACHE?.data && (Date.now() - LAST_CACHE.at) < CACHE_TTL_MS){
        return res.json({ ...LAST_CACHE.data, fallback: 'cache' })
      }
      return res.json(cachedFallback)
    }
  }
}
