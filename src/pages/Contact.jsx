import HomeHeader from "../components/HomeHeader";

const Contact = () => {
  return (
    <>
    <HomeHeader/>
    <div className="px-4 md:px-16 py-12 bg-white text-gray-800">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow-lg mb-12 tracking-tight mt-8">Contact Us</h2>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-white shadow-xl border border-blue-100 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-green-600 text-xl">📞</span>
              <span className="text-blue-700 font-semibold text-sm">+91 9611768775</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-500 text-xl">✉️</span>
              <span className="text-blue-700 font-semibold text-sm">corporaterelation@chanrerier.com</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-xl">📍</span>
              <span className="text-blue-700 font-semibold text-base">
                65, Metro station, 414, 20th Main Rd, near Rajajinagar, West of Chord Road 2nd Stage,<br />Rajajinagar, Bengaluru, Karnataka 560010
              </span>
            </div>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12..."
            className="rounded-2xl w-full h-72 border border-blue-100 shadow"
            allowFullScreen=""
            loading="lazy"
            title="ChanRe Location"
          ></iframe>
        </div>
        <div className="bg-white shadow-2xl border border-blue-100 rounded-3xl p-8">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-700">Full Name</label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50 text-blue-700 placeholder-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-700">Email Address</label>
              <input
                type="email"
                placeholder="example@domain.com"
                className="w-full p-3 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50 text-blue-700 placeholder-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-700">Subject</label>
              <input
                type="text"
                placeholder="Enter your subject"
                className="w-full p-3 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50 text-blue-700 placeholder-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-700">Message</label>
              <textarea
                rows="4"
                placeholder="Type your message"
                className="w-full p-3 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50 text-blue-700 placeholder-blue-400 transition"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white py-3 rounded-xl shadow-lg font-semibold text-sm transition-all duration-200"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default Contact;
