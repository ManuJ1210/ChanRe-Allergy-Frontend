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
       <header className="bg-gradient-to-br from-slate-50 to-blue-50 shadow-md fixed left-0 right-0 z-40 m-0 p-0" style={{top: '40px', marginTop: '0', borderTop: 'none'}}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link to="/"><img src="logo.png" alt="ChanRe Allergy Clinic" className="h-6 lg:h-10 object-contain" /></Link>
          {/* Desktop Navigation */}
          <nav className="space-x-6 text-md font-semibold text-black-700 hidden md:block">
            <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
            <Link to="/About" className="hover:text-blue-500 transition-colors">About</Link>
            <Link to="/Contact" className="hover:text-blue-500 transition-colors">Contact</Link>
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
