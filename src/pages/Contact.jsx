import { useState } from "react";
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import HomeHeader from "../components/HomeHeader";
import TopHeader from '../components/TopHeader';
const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // EmailJS configuration - you'll need to replace these with your actual values
  const EMAILJS_SERVICE_ID = 'service_hdhh07g';
  const EMAILJS_TEMPLATE_ID = 'template_rawsov2';
  const EMAILJS_PUBLIC_KEY = 'LNyTnmDabZbcns92G';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Send email using EmailJS
      const templateParams = {
        from_name: formData.fullName,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: 'corporaterelation@chanrerier.com' // Your receiving email
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen">
       
      <TopHeader />
      <HomeHeader />
      <div className="font-sans bg-gray-50 text-slate-800 mt-10">
        {/* Hero Section */}
        <section className="relative pt-20 sm:pt-32 pb-8 sm:pb-12">
          <div className="w-4/5 mx-auto px-2 sm:px-4">
            <div className="text-center mb-6 sm:mb-8">
              {/* Clinic Badge */}
              <div className="inline-block mb-3 sm:mb-4">
                <div
                  className="bg-[#e0f2fe] text-[#2490eb] px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: 'Quicksand, sans-serif' }}
                >
                  CONTACT US
                </div>
              </div>

              {/* Main Heading */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#18100f] mb-3 sm:mb-4"
                style={{ fontFamily: 'Quicksand, sans-serif', textTransform: 'capitalize' }}
              >
                Get in<br />
                <span className="text-[#2490eb]">Touch With Us</span>
              </h1>

              {/* Description */}
              <p
                className="text-[#666666] text-sm sm:text-base leading-relaxed max-w-xl mx-auto px-2"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Have questions or need assistance? We're here to help. Reach out to us through any of the channels below.
              </p>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Contact Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#e0f2fe] rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2490eb]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Contact Information</h2>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#e0f2fe] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#2490eb]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Phone Numbers</p>
                      <p className="text-sm text-gray-600">08 0425 16699 | 96325 33122</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#e0f2fe] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#2490eb]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Email</p>
                      <p className="text-sm text-gray-600">corporaterelation@chanrerier.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#e0f2fe] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-[#2490eb]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Address</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        65, Metro station, 414, 20th Main Rd, near Rajajinagar, West of Chord Road 2nd Stage, Rajajinagar, Bengaluru, Karnataka 560010
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5717687197616!2d77.54771567585745!3d12.99921901427056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3dbc8be6ee1f%3A0x99d77f3579e9ed2e!2sChanRe%20Rheumatology%20And%20Immunology%20Center%20And%20Research!5e0!3m2!1sen!2sin!4v1758876122679!5m2!1sen!2sin"
                    className="rounded-lg w-full h-48 border border-gray-200"
                    allowFullScreen=""
                    loading="lazy"
                    title="ChanRe Location"
                  />
                </div>
              </div>

              {/* Contact Form Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#e0f2fe] rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2490eb]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Send us a Message</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter your subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
                    <textarea
                      rows="4"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Type your message here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold uppercase py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', fontWeight: '600' }}
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
