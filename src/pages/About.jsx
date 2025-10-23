
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import HomeHeader from '../components/HomeHeader';
import TopHeader from '../components/TopHeader';

const About = () => {
  return (
    <div className="min-h-screen">
       
        <TopHeader />
        <HomeHeader />
        <div className="font-sans bg-gray-50 text-slate-800">
          {/* Hero Section */}
          <section className="relative pt-20 sm:pt-24">
          <div className="w-4/5 mx-auto px-2 sm:px-4">
            <div className="text-center mb-6 sm:mb-8">
              {/* Clinic Badge */}
              <div className="inline-block mb-3 sm:mb-4">
                <div
                  className="bg-[#e0f2fe] text-[#2490eb] px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: 'Quicksand, sans-serif' }}
                >
                  ABOUT US
                </div>
              </div>

              {/* Main Heading */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#18100f] mb-3 sm:mb-4"
                style={{ fontFamily: 'Quicksand, sans-serif', textTransform: 'capitalize' }}
              >
                Join Our<br />
                <span className="text-[#2490eb]">Allergy Clinic Team</span>
              </h1>

              {/* Description */}
              <p
                className="text-[#666666] text-sm sm:text-base leading-relaxed max-w-xl mx-auto px-2"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Are you a passionate healthcare professional looking to make a difference in the field of allergy care? We invite you to join our esteemed team.
              </p>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Image Card */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <img
                  src="about us.png"
                  alt="Doctors discussing"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              
              {/* Content Card */}
              <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#e0f2fe] rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2490eb]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Join Our Team</h2>
                </div>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    Are you a passionate healthcare professional looking to make a difference in the field of allergy care? We invite you to join our esteemed team at ChanRe Allergy Clinic, where we provide exceptional allergy services to our community.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    At ChanRe Allergy Clinic we understand the importance of having a team of highly skilled and compassionate doctors. We are actively seeking experienced Physicians to join us in our mission to improve the lives of individuals suffering from allergic conditions.
                  </p>
                </div>

                <div className="bg-[#e0f2fe] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-[#2490eb] mb-2 sm:mb-3">How to Apply?</h3>
                  <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4">
                    If you're interested in joining our team, please submit your resume and cover letter to the following contact details:
                  </p>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#2490eb] rounded-full flex items-center justify-center">
                        <FaWhatsapp className="text-white text-xs sm:text-sm" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">08 0425 16699</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#2490eb] rounded-full flex items-center justify-center">
                        <FaEnvelope className="text-white text-xs sm:text-sm" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 break-all">corporaterelation@chanrerier.com</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
                    We welcome dedicated professionals who share our commitment to excellence in allergy care. Together, we can make a meaningful difference in the lives of individuals living with allergies.
                  </p>
                  <p className="text-red-600 font-semibold text-xs sm:text-sm">
                    *Terms and Conditions apply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;