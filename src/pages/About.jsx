
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import HomeHeader from '../components/HomeHeader';

const About = () => {
  return (
    <>
    <HomeHeader/>
    <div className="font-sans bg-white text-gray-800">
      {/* Main content - matching homepage container style */}
      <section className="bg-white py-40" style={{paddingTop: '120px'}}>
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
                            <span className="font-medium">08 0425 16699</span>
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