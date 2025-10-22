import { useState } from "react";
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import HomeHeader from "../components/HomeHeader";

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
    <>
    <HomeHeader/>
    <div className="font-sans bg-white text-gray-800">
      {/* Main content - matching homepage container style */}
      <section className="bg-white py-40" style={{paddingTop: '120px'}}>
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
                            <span className="font-medium">08 0425 16699</span>
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
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-gray-50 text-gray-700 placeholder-gray-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@domain.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-gray-50 text-gray-700 placeholder-gray-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Enter your subject"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-gray-50 text-gray-700 placeholder-gray-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Message</label>
                      <textarea
                        rows="4"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Type your message here..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-gray-50 text-gray-700 placeholder-gray-500 transition resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 rounded-lg shadow-md font-semibold text-lg transition-all duration-200 ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-[#2490eb] hover:bg-[#14457b]'
                      } text-white`}
                    >
                      {isLoading ? 'Sending...' : 'Send Message'}
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
