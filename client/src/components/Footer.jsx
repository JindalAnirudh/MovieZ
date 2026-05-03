import React, { useState } from 'react'
import { assets } from '../assets/assets'
import ContactModal from './ContactModal'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleContactClick = (e) => {
    e.preventDefault()
    setIsContactModalOpen(true)
  }

  const handleHomeClick = (e) => {
    e.preventDefault()
    navigate('/')
    window.scrollTo(0, 0)
  }

  const handleAboutClick = (e) => {
    e.preventDefault()
    navigate('/about')
    window.scrollTo(0, 0)
  }

  const handlePrivacyClick = (e) => {
    e.preventDefault()
    navigate('/privacy')
    window.scrollTo(0, 0)
  }

  return (
    <footer className="px-6 md:px-16 lg:px-36 mt-40 w-full text-gray-300">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
                <div className="md:max-w-96">
                    <img alt="" className="h-16 md:h-20 w-auto" src={assets.logo} />
                    <p className="mt-6 text-sm">
                        MovieZ is your ultimate destination for discovering and booking the latest movies. Experience seamless ticket booking, exclusive offers, and the magic of cinema all in one place. Join millions of movie lovers who trust MovieZ for their entertainment needs.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <img src={assets.googlePlay} alt="google play" className="h-9 w-auto" />
                        <img src={assets.appStore} alt="app store" className="h-10 w-auto" />
                    </div>
                </div>
                <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
                    <div>
                        <h2 className="font-semibold mb-5">Company</h2>
                        <ul className="text-sm space-y-2">
                            <li><a href="#" onClick={handleHomeClick} className="hover:text-primary transition-colors cursor-pointer">Home</a></li>
                            <li><a href="#" onClick={handleAboutClick} className="hover:text-primary transition-colors cursor-pointer">About us</a></li>
                            <li><a href="#" onClick={handleContactClick} className="hover:text-primary transition-colors cursor-pointer">Contact us</a></li>
                            <li><a href="#" onClick={handlePrivacyClick} className="hover:text-primary transition-colors cursor-pointer">Privacy policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5">Get in touch</h2>
                        <div className="text-sm space-y-2">
                            <p>+91-9877422551</p>
                            <p>garggagan243@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-sm pb-5">
                Copyright {new Date().getFullYear()} © <a href="https://prebuiltui.com">QuickShow.</a>. All Right Reserved.
            </p>

            {/* Contact Modal */}
            <ContactModal 
              isOpen={isContactModalOpen} 
              onClose={() => setIsContactModalOpen(false)} 
            />
        </footer>
  )
}

export default Footer
