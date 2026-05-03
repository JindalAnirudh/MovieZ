import React from 'react'
import { Play, Users, Award, Globe } from 'lucide-react'

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Hero Section */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-primary">MovieZ</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Your ultimate destination for discovering, booking, and experiencing the magic of cinema. 
            We're passionate about bringing you closer to the stories that move you.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-16 bg-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                At MovieZ, we believe that every movie experience should be seamless, enjoyable, and memorable. 
                Our mission is to revolutionize how you discover and book movie tickets, making entertainment 
                accessible to everyone, everywhere.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                We're not just a ticketing platform – we're your gateway to unforgettable cinematic experiences, 
                connecting movie lovers with the stories they crave.
              </p>
            </div>
            <div className="relative">
              <div className="bg-primary/10 rounded-2xl p-8 border border-primary/20">
                <Play className="w-16 h-16 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Entertainment Redefined</h3>
                <p className="text-gray-300">
                  From the latest blockbusters to indie gems, we bring you closer to the movies you love 
                  with just a few clicks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">MovieZ by Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-zinc-800 rounded-xl p-8 border border-gray-700">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-primary mb-2">1M+</h3>
                <p className="text-gray-300">Happy Customers</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-zinc-800 rounded-xl p-8 border border-gray-700">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-primary mb-2">500+</h3>
                <p className="text-gray-300">Partner Theaters</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-zinc-800 rounded-xl p-8 border border-gray-700">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-primary mb-2">10M+</h3>
                <p className="text-gray-300">Tickets Booked</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-16 bg-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-primary">Innovation</h3>
              <p className="text-gray-300">
                We continuously evolve our platform with cutting-edge technology to enhance your movie-going experience.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-primary">Accessibility</h3>
              <p className="text-gray-300">
                Making movies accessible to everyone, regardless of location, device, or preference.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-primary">Quality</h3>
              <p className="text-gray-300">
                We partner only with the best theaters to ensure you get the premium movie experience you deserve.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-primary">Community</h3>
              <p className="text-gray-300">
                Building a community of movie lovers who share their passion for great storytelling.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-primary">Trust</h3>
              <p className="text-gray-300">
                Your security and privacy are our top priorities. We ensure safe and secure transactions always.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-primary">Excellence</h3>
              <p className="text-gray-300">
                We strive for excellence in every aspect of our service, from booking to customer support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
          <p className="text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto mb-8">
            Founded with a simple vision – to make movie booking effortless and enjoyable. What started as a 
            small team of movie enthusiasts has grown into a platform trusted by millions of users worldwide. 
            We're proud to be at the forefront of digital entertainment, constantly innovating to bring you 
            the best possible movie experience.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto">
            Today, MovieZ continues to evolve, embracing new technologies and partnerships to ensure that 
            your next movie night is just a click away. Join us on this incredible journey as we redefine 
            entertainment for the digital age.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-16 bg-gradient-to-r from-primary/10 to-primary/5 border-t border-primary/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience MovieZ?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Join millions of movie lovers who trust MovieZ for their entertainment needs.
          </p>
          <button 
            onClick={() => {
              window.location.href = '/movies'
              window.scrollTo(0, 0)
            }}
            className="bg-primary hover:bg-primary-dull text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Browse Movies
          </button>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
