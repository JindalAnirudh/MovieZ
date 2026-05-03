import dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';

// Load environment variables
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error('❌ TMDB_API_KEY is not set in .env file');
  process.exit(1);
}

console.log('🔑 Found TMDB API Key:', TMDB_API_KEY.substring(0, 10) + '...');

const testTMDBConnection = async () => {
  const url = 'https://api.themoviedb.org/3/movie/now_playing';
  const params = {
    api_key: TMDB_API_KEY,
    language: 'en-US',
    page: 1,
    region: 'IN'
  };

  const httpsAgent = new https.Agent({ 
    rejectUnauthorized: false, // Only for testing
    keepAlive: false,
    family: 4 // Force IPv4
  });

  const options = {
    method: 'GET',
    url,
    params,
    httpsAgent,
    timeout: 10000, // 10 seconds
    headers: {
      'Accept': 'application/json',
    },
  };

  try {
    console.log('🌐 Testing TMDB API connection...');
    const response = await axios(options);
    
    if (response.data && response.data.results) {
      console.log('✅ Success! Found', response.data.results.length, 'movies');
      console.log('📽️  First movie:', response.data.results[0]?.title || 'N/A');
      return true;
    }
    
    console.log('⚠️  Unexpected response format:', response.data);
    return false;
    
  } catch (error) {
    console.error('❌ TMDB API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response) {
      console.error('Response headers:', error.response.headers);
    }
    
    return false;
  }
};

// Run the test
testTMDBConnection()
  .then(success => {
    if (success) {
      console.log('✅ TMDB API test completed successfully');
    } else {
      console.error('❌ TMDB API test failed');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
