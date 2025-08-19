
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import HomeHeader from '../components/HomeHeader';

const About = () => {
  return (
    <>
    <HomeHeader/>
    <div className="bg-white py-16 px-4 sm:px-8 md:px-20 lg:px-32">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow-lg mb-12 tracking-tight mt-8">
        Join Our Allergy Clinic Franchise
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <img
          src="/3.jpg"
          alt="Doctors discussing"
          className="w-full rounded-2xl shadow-xl object-cover h-96 border border-blue-100"
        />
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 flex flex-col gap-4">
          <p className="text-gray-700 text-sm mb-2">
            Are you a passionate healthcare professional looking to make a difference in the field of allergy care? We invite you to join our esteemed team at ChanRe Allergy Clinic, where we provide exceptional allergy services to our community.
          </p>
          <p className="text-gray-700 text-sm mb-2">
            At ChanRe Allergy Clinic we understand the importance of having a team of highly skilled and compassionate doctors. We are actively seeking experienced Physicians to join us in our mission to improve the lives of individuals suffering from allergic conditions.
          </p>
          <h3 className="text-lg font-semibold text-blue-700 mt-4 mb-2">How to Apply?</h3>
          <p className="text-gray-700 mb-2">
            If you're interested in joining our team, please submit your resume and cover letter to the following contact details:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl shadow p-4 mb-2 space-y-3">
            <div className="flex items-center space-x-3">
              <FaWhatsapp className="text-green-600 text-lg" />
              <span className="text-blue-800 font-medium">+91 9611768775</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-blue-600 text-lg" />
              <span className="text-blue-800 font-medium">corporaterelation@chanrerier.com</span>
            </div>
          </div>
          <p className="text-gray-700">
            We welcome dedicated professionals who share our commitment to excellence in allergy care. Together, we can make a meaningful difference in the lives of individuals living with allergies.
          </p>
          <p className="text-red-600 font-semibold mt-4">
            *Terms and Conditions apply.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default About;