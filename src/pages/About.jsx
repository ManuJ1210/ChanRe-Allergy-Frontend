
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import HomeHeader from '../components/HomeHeader';

const About = () => {
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
                ABOUT US
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Join Our Allergy Clinic Franchise</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Image Card with same height */}
            <div className="flex flex-col h-[600px]">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full">
                <div className="h-full">
                  <img
                    src="about us.png"
                    alt="Doctors discussing"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </div>
            
            {/* Content Card with same height */}
            <div className="flex flex-col h-[600px]">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
                <div className="p-8 flex flex-col justify-between h-full">
                  <div className="space-y-6">
                    <div className="space-y-4 text-gray-700">
                      <p className="text-gray-600 leading-relaxed">
                        Are you a passionate healthcare professional looking to make a difference in the field of allergy care? We invite you to join our esteemed team at ChanRe Allergy Clinic, where we provide exceptional allergy services to our community.
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        At ChanRe Allergy Clinic we understand the importance of having a team of highly skilled and compassionate doctors. We are actively seeking experienced Physicians to join us in our mission to improve the lives of individuals suffering from allergic conditions.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Apply?</h3>
                      <p className="text-gray-600 mb-6">
                        If you're interested in joining our team, please submit your resume and cover letter to the following contact details:
                      </p>
                      
                      <div className="bg-[#2490eb] text-white p-6 rounded-lg shadow-md">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <FaWhatsapp className="text-white text-lg" />
                            </div>
                            <span className="font-medium">+91 9611768775</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <FaEnvelope className="text-white text-lg" />
                            </div>
                            <span className="font-medium">corporaterelation@chanrerier.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      We welcome dedicated professionals who share our commitment to excellence in allergy care. Together, we can make a meaningful difference in the lives of individuals living with allergies.
                    </p>
                    <p className="text-red-600 font-semibold">
                      *Terms and Conditions apply.
                    </p>
                  </div>
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

export default About;