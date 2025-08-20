import { Link } from "react-router-dom"
export default function HomeHeader() {
    return(
        <>
        <div className="font-sans bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
       <header className="bg-gradient-to-br from-slate-50 to-blue-50 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-lg md:text-lg font-extrabold bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow tracking-tight">ChanRe Allergy Clinic</h1>
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
        </div>
      </header>
      </div>
      </>
    )
};
