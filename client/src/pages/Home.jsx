import React from 'react'
import HeroSection from '../components/HeroSection'
import FeaturedSection from '../components/FeaturedSection'
import TrailerSection from '../components/TrailersSection'
import TmdbNowPlayingSection from '../components/TmdbNowPlayingSection'

const Home = () => {
  return (
    <>
     <HeroSection /> 
     <FeaturedSection/>
     <TrailerSection/>
     <TmdbNowPlayingSection/>
    </>
  )
}

export default Home
