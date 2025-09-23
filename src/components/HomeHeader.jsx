import { Link } from "react-router-dom"
import { useState } from "react"

export default function HomeHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return(
        <>
        <div className="font-sans bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
       <header className="bg-gradient-to-br from-slate-50 to-blue-50 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-lg md:text-lg font-extrabold bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow tracking-tight">ChanRe Allergy Clinic</h1>
          
          {/* Desktop Navigation */}
          <nav className="space-x-6 text-sm text-blue-700 hidden md:block">
            <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
            <Link to="/About" className="hover:text-blue-500 transition-colors">About</Link>
            <Link to="/Contact" className="hover:text-blue-500 transition-colors">Contact</Link>
            <Link to="/login">
              <button className="ml-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-1 rounded-xl hover:from-blue-500 hover:to-blue-700 text-sm font-semibold shadow transition-all duration-150">
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
                <button className="w-full mt-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-blue-700 text-sm font-semibold shadow transition-all duration-150">
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
