// Trailer Controller - Handles trailer-related requests
// Since MongoDB is having connection issues, this will provide fallback responses

export const getMovieTrailers = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { title } = req.query;
    
    console.log('Trailer request for movie:', movieId || title);
    
    // Return empty trailers for now since TMDB connection is unreliable
    // In a real implementation, you would:
    // 1. Search TMDB for the movie by ID or title
    // 2. Fetch the video/trailer data
    // 3. Return the trailer URLs
    
    return res.json({
      success: true,
      trailers: [],
      message: 'Trailers temporarily unavailable due to connection issues'
    });
    
  } catch (error) {
    console.error('Trailer controller error:', error.message);
    return res.json({
      success: false,
      trailers: [],
      message: 'Failed to fetch trailers'
    });
  }
};

export const getTrailerById = async (req, res) => {
  try {
    const { trailerId } = req.params;
    
    console.log('Trailer request for ID:', trailerId);
    
    // Return empty response for now
    return res.json({
      success: false,
      message: 'Trailer not available'
    });
    
  } catch (error) {
    console.error('Get trailer by ID error:', error.message);
    return res.json({
      success: false,
      message: 'Failed to fetch trailer'
    });
  }
};

export const searchTrailers = async (req, res) => {
  try {
    const { query } = req.query;
    
    console.log('Trailer search for:', query);
    
    // Return empty results for now
    return res.json({
      success: true,
      trailers: [],
      message: 'No trailers found'
    });
    
  } catch (error) {
    console.error('Search trailers error:', error.message);
    return res.json({
      success: false,
      trailers: [],
      message: 'Failed to search trailers'
    });
  }
};
