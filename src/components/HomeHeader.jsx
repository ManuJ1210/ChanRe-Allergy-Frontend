import { Link } from "react-router-dom"
import { useState } from "react"

export default function HomeHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return(
        <>
        <div className="font-sans bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800" style={{marginBlock: '0'}}>
          {/* Contact Information Header */}
          <div className="bg-[#2490eb] text-white py-2 px-4 fixed left-0 right-0 z-50" style={{top: '0'}}>
            <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="font-semibold">08 0425 16699</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="font-semibold">96325 33122</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="font-semibold">info@chanreallergyclinic.com</span>
                </div>
              </div>
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-200 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-blue-200 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-blue-200 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
       <header className="bg-gradient-to-br from-slate-50 to-blue-50 shadow-md fixed left-0 right-0 z-40 m-0 p-0" style={{top: '40px', marginTop: '0', borderTop: 'none'}}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link to="/"><img src="logo.png" alt="ChanRe Allergy Clinic" className="h-6 lg:h-10 object-contain" /></Link>
          {/* Desktop Navigation */}
          <nav className="space-x-6 text-md font-semibold text-black-700 hidden md:block">
            <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
            <Link to="/About" className="hover:text-blue-500 transition-colors">About</Link>
            <Link to="/Contact" className="hover:text-blue-500 transition-colors">Contact</Link>
            <Link to="/book-appointment" className="hover:text-blue-500 transition-colors">Book Appointment</Link>
            <Link to="/check-appointment" className="hover:text-blue-500 transition-colors">Check Status</Link>
            <Link to="/login">
              <button className="inline-block bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold  px-5 py-1 rounded-md transition-all duration-300">
                Login
              </button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-blue-700 hover:text-blue-500 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-blue-100 shadow-lg">
            <nav className="px-6 py-4 space-y-4">
              <Link 
                to="/" 
                className="block text-blue-700 hover:text-blue-500 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/About" 
                className="block text-blue-700 hover:text-blue-500 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/Contact" 
                className="block text-blue-700 hover:text-blue-500 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/book-appointment" 
                className="block text-blue-700 hover:text-blue-500 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Appointment
              </Link>
              <Link 
                to="/check-appointment" 
                className="block text-blue-700 hover:text-blue-500 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Check Status
              </Link>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="inline-block bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold uppercase px-8 py-4 rounded-md transition-all duration-300">
                  Login
                </button>
              </Link>
            </nav>
          </div>
        )}
      </header>
      </div>
      </>
    )
};
