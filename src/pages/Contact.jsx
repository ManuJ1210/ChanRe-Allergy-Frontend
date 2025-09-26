import HomeHeader from "../components/HomeHeader";

const Contact = () => {
  return (
    <>
    <HomeHeader/>
    <div className="font-sans bg-white text-gray-800">
      {/* Top Header Section - matching homepage theme */}
      <div className="bg-[#2490eb] text-white py-2 fixed top-0 left-0 right-0 z-[60]" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
        <div className="w-4/5 mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Contact Info Section */}
            <div className="flex space-x-6 text-sm">
              <a href="tel:+1800001658" className="hover:text-blue-200 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span> +1800-001-658</span>
              </a>
              <a href="mailto:info@chanreallergyclinic.com" className="hover:text-blue-200 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>info@chanreallergyclinic.com</span>
              </a>
            </div>
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-200 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="hover:text-blue-200 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
      </div>

      {/* Main content - matching homepage container style */}
      <section className="bg-white py-40">
        <div className="w-4/5 mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-[#2490eb] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider">
                CONTACT US
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information Card */}
            <div className="flex flex-col h-[600px]">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
                <div className="p-8 flex flex-col justify-between h-full">
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
                      
                      <div className="bg-[#2490eb] text-white p-6 rounded-lg shadow-md">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                            </div>
                            <span className="font-medium">+91 9611768775</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </div>
                            <span className="font-medium text-sm">corporaterelation@chanrerier.com</span>
                          </div>
                          <div className="flex items-start space-x-3 pt-2">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium text-sm leading-relaxed">
                              65, Metro station, 414, 20th Main Rd, near Rajajinagar, West of Chord Road 2nd Stage,<br />Rajajinagar, Bengaluru, Karnataka 560010
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5717687197616!2d77.54771567585745!3d12.99921901427056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3dbc8be6ee1f%3A0x99d77f3579e9ed2e!2sChanRe%20Rheumatology%20And%20Immunology%20Center%20And%20Research!5e0!3m2!1sen!2sin!4v1758876122679!5m2!1sen!2sin"
                      className="rounded-xl w-full h-48 border border-gray-200 shadow-md"
                      allowFullScreen=""
                      loading="lazy"
                      title="ChanRe Location"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="flex flex-col h-[600px]">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
                <div className="p-8 flex flex-col justify-center h-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                  
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-gray-50 text-gray-700 placeholder-gray-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
                      <input
                        type="email"
                        placeholder="example@domain.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-gray-50 text-gray-700 placeholder-gray-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Subject</label>
                      <input
                        type="text"
                        placeholder="Enter your subject"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-gray-50 text-gray-700 placeholder-gray-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Message</label>
                      <textarea
                        rows="4"
                        placeholder="Type your message here..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-gray-50 text-gray-700 placeholder-gray-500 transition resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#2490eb] hover:bg-[#14457b] text-white py-3 rounded-lg shadow-md font-semibold text-lg transition-all duration-200"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Contact;
