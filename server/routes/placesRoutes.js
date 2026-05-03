import express from 'express'
import axios from 'axios'

const router = express.Router()

// GET /api/places/theatres?city=Bathinda
// Returns a list of cinemas for the given city using Google Places Text Search
router.get('/theatres', async (req, res) => {
  try {
    const city = (req.query.city || '').trim()
    if (!city) return res.json({ success: true, theatres: [] })

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) return res.json({ success: false, message: 'Missing GOOGLE_MAPS_API_KEY on server' })

    const http = axios.create({ timeout: 20000 })
    const keyword = (req.query.q || '').toString().trim()
    const debug = req.query.debug === '1'
    const lat = req.query.lat ? Number(req.query.lat) : undefined
    const lng = req.query.lng ? Number(req.query.lng) : undefined
    const radius = req.query.radius ? Number(req.query.radius) : 50000

    // 0) If lat/lng provided, do a direct Nearby Search (most reliable)
    if(Number.isFinite(lat) && Number.isFinite(lng)){
      try{
        const nearUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
        const nearParams = {
          location: `${lat},${lng}`,
          radius: Math.max(1000, Math.min(120000, radius)),
          type: 'movie_theater',
          keyword: keyword || 'cinema|movie|multiplex|pvr|inox',
          language: 'en-IN',
          key: apiKey
        }
        const { data: nearData } = await http.get(nearUrl, { params: nearParams })
        const results = Array.isArray(nearData?.results) ? nearData.results : []
        const theatres = results.map(p => ({
          name: p.name,
          place_id: p.place_id,
          address: p.vicinity || '',
          location: p.geometry?.location || null,
          rating: p.rating || null
        }))
        if(debug){
          return res.json({ success: true, theatres, meta: { source: 'nearby_coords', city, count: theatres.length } })
        }
        return res.json({ success: true, theatres })
      }catch(err){ /* fall through to other strategies */ }
    }

    // 1) Try Text Search with explicit country, multiple query variants
    const textUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    const queries = [
      keyword ? `${keyword} cinema in ${city}, India` : '',
      `movie theater in ${city}, India`,
      `cinema in ${city}, India`,
      `multiplex in ${city}, India`,
      `PVR in ${city}, India`,
      `INOX in ${city}, India`
    ].filter(Boolean)
    let theatres = []
    for(const q of queries){
      try{
        const params = { query: q, region: 'in', language: 'en-IN', key: apiKey }
        const { data: textData } = await http.get(textUrl, { params })
        const results = Array.isArray(textData?.results) ? textData.results : []
        if(results.length){
          theatres = results.map(p => ({
            name: p.name,
            place_id: p.place_id,
            address: p.formatted_address,
            location: p.geometry?.location || null,
            rating: p.rating || null
          }))
          if(debug){
            return res.json({ success: true, theatres, meta: { source: 'textsearch', query: q, count: theatres.length } })
          }
          break
        }
      }catch{}
    }

    // 2) If none, resolve city location then do Nearby Search
    if(theatres.length === 0){
      try{
        // Find city center
        const findUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
        const findParams = {
          input: `${city}, India`,
          inputtype: 'textquery',
          fields: 'geometry',
          language: 'en-IN',
          key: apiKey
        }
        const { data: findData } = await http.get(findUrl, { params: findParams })
        const loc = findData?.candidates?.[0]?.geometry?.location
        if(loc && typeof loc.lat === 'number' && typeof loc.lng === 'number'){
          const nearUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
          const nearParams = {
            location: `${loc.lat},${loc.lng}`,
            radius: 50000,
            type: 'movie_theater',
            keyword: keyword || 'cinema|movie|multiplex|pvr|inox',
            language: 'en-IN',
            key: apiKey
          }
          const { data: nearData } = await http.get(nearUrl, { params: nearParams })
          const results = Array.isArray(nearData?.results) ? nearData.results : []
          theatres = results.map(p => ({
            name: p.name,
            place_id: p.place_id,
            address: p.vicinity || '',
            location: p.geometry?.location || null,
            rating: p.rating || null
          }))
          if(debug){
            return res.json({ success: true, theatres, meta: { source: 'nearby', city, count: theatres.length } })
          }
        }
      }catch{}
    }

    return res.json({ success: true, theatres })
  } catch (err) {
    console.error('Places theatres error:', err?.message)
    return res.json({ success: false, message: 'Failed to fetch theatres' })
  }
})

export default router
