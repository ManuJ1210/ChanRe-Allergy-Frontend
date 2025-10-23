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
         
       <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100 fixed left-0 right-0 z-50 m-0 p-0 transition-all duration-300" style={{top: '0px', marginTop: '0', borderTop: 'none'}}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 lg:py-6 flex justify-between items-center">
          <Link to="/" className="group">
            <img src="logo.png" alt="ChanRe Allergy Clinic" className="h-4 sm:h-5 md:h-6 lg:h-8 xl:h-10 object-contain transition-transform duration-300 group-hover:scale-105" />
          </Link>
          {/* Desktop Navigation */}
          <nav className="space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 text-xs sm:text-sm md:text-base font-semibold text-slate-700 hidden md:block">
            <Link to="/" className="hover:text-[#2490eb] transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>
            <Link to="/About" className="hover:text-[#2490eb] transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>
            <Link to="/Contact" className="hover:text-[#2490eb] transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>
            <Link to="/book-appointment" className="hover:text-[#2490eb] transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Book Appointment</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>
            <Link to="/check-appointment" className="hover:text-[#2490eb] transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Check Status</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>
            <Link to="/login">
              <button className="inline-block bg-gradient-to-r from-[#2490eb] to-[#14457b] hover:from-[#14457b] hover:to-[#2490eb] text-white font-semibold px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 transform">
                Login
              </button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 sm:p-2.5 text-[#2490eb] hover:text-white hover:bg-[#2490eb] transition-all duration-300 bg-white rounded-lg shadow-md border-2 border-[#2490eb] hover:border-[#14457b] flex items-center space-x-1 sm:space-x-2 hover:scale-105 transform"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span className="text-xs sm:text-sm font-medium hidden sm:block">Menu</span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-blue-100 shadow-lg relative z-50 animate-in slide-in-from-top duration-300">
            <nav className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 space-y-2 sm:space-y-3 md:space-y-4">
              <Link 
                to="/" 
                className="block text-[#2490eb] hover:text-white hover:bg-gradient-to-r hover:from-[#2490eb] hover:to-[#14457b] transition-all duration-300 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg px-2 hover:scale-105 transform"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/About" 
                className="block text-[#2490eb] hover:text-white hover:bg-gradient-to-r hover:from-[#2490eb] hover:to-[#14457b] transition-all duration-300 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg px-2 hover:scale-105 transform"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/Contact" 
                className="block text-[#2490eb] hover:text-white hover:bg-gradient-to-r hover:from-[#2490eb] hover:to-[#14457b] transition-all duration-300 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg px-2 hover:scale-105 transform"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/book-appointment" 
                className="block text-[#2490eb] hover:text-white hover:bg-gradient-to-r hover:from-[#2490eb] hover:to-[#14457b] transition-all duration-300 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg px-2 hover:scale-105 transform"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Appointment
              </Link>
              <Link 
                to="/check-appointment" 
                className="block text-[#2490eb] hover:text-white hover:bg-gradient-to-r hover:from-[#2490eb] hover:to-[#14457b] transition-all duration-300 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg px-2 hover:scale-105 transform"
                onClick={() => setIsMenuOpen(false)}
              >
                Check Status
              </Link>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="inline-block bg-gradient-to-r from-[#2490eb] to-[#14457b] hover:from-[#14457b] hover:to-[#2490eb] text-white font-semibold uppercase px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg transition-all duration-300 text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 transform w-full">
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
