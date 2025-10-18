// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { MdExpandMore } from "react-icons/md";
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import HomeHeader from "../components/HomeHeader";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTeamSlide, setCurrentTeamSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Contact form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // EmailJS configuration - same as Contact page
  const EMAILJS_SERVICE_ID = 'service_hdhh07g';
  const EMAILJS_TEMPLATE_ID = 'template_rawsov2';
  const EMAILJS_PUBLIC_KEY = 'LNyTnmDabZbcns92G';

  const teamData = [
    { name: "Dr.Chandrashekara S.", specialization: "Rheumatology & Autoimmune Diseases", image: "1.png" },
    { name: "Dr.Smitha J N Singh", specialization: "Allergy & Clinical Immunology", image: "3.png" },
  ];

  const testimonialsData = [
    { 
      quote: "Dr.Chandrashekara S. helped me manage my severe pollen allergies. The treatment was excellent and I can now enjoy spring without constant sneezing.", 
      name: "Priya Patel", 
      designation: "ALLERGY PATIENT",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=60&h=60&fit=crop&crop=face"
    },
    { 
      quote: "The allergy testing was thorough and the staff was very caring. My food allergies are now under control thanks to their treatment plan.", 
      name: "Rajesh Kumar", 
      designation: "FOOD ALLERGY PATIENT",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=60&h=60&fit=crop&crop=face"
    },
    { 
      quote: "My daughter's asthma attacks reduced significantly after visiting Dr. Iyengar. The inhaler technique they taught us works perfectly.", 
      name: "Anita Singh", 
      designation: "PARENT OF ASTHMA PATIENT",
      image: "https://images.unsplash.com/photo-1594824681912-c1ec82c5b32e?w=60&h=60&fit=crop&crop=face"
    },
    { 
      quote: "Excellent service and professional approach. The immunotherapy treatment has been very effective for my year-round allergies.", 
      name: "Vikram Sharma", 
      designation: "IMMUNOTHERAPY PATIENT",
      image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=60&h=60&fit=crop&crop=face"
    },
    { 
      quote: "The clinic's follow-up care is outstanding. They always remember my specific allergy triggers and provide personalized advice.", 
      name: "Meera Reddy", 
      designation: "LONG-TERM PATIENT",
      image: "https://images.unsplash.com/photo-1614594895303-fe863a4a0d22?w=60&h=60&fit=crop&crop=face"
    }
  ];

  const moveTeamSlider = (direction) => {
    const totalSlides = Math.ceil(teamData.length / 4);
    if (direction === -1) {
      setCurrentTeamSlide(prev => prev > 0 ? prev - 1 : totalSlides - 1);
    } else {
      setCurrentTeamSlide(prev => prev < totalSlides - 1 ? prev + 1 : 0);
    }
  };

  // Automatic testimonials cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => {
        // Move to next set of testimonials (showing 2 at a time)
        const maxPosition = testimonialsData.length - 2;
        return prev >= maxPosition ? 0 : prev + 2;
      });
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonialsData.length]);

  const getVisibleDoctors = () => {
    const slideCount = 3; // Show 3 doctors per slide
    const startIndex = currentTeamSlide * slideCount;
    return teamData.slice(startIndex, startIndex + slideCount);
  };

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

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('EmailJS Response:', response);
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
      
      // More specific error handling
      if (error.status === 400) {
        toast.error('Invalid email configuration. Please check your EmailJS settings.');
      } else if (error.status === 401) {
        toast.error('EmailJS authentication failed. Please check your public key.');
      } else if (error.status === 404) {
        toast.error('EmailJS service or template not found. Please check your configuration.');
      } else {
        toast.error('Failed to send message. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans bg-white text-gray-800">
      {/* Top Header Section */}
      <div className="bg-[#2490eb]  text-white py-2 fixed top-0 left-0 right-0 z-[60]" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
        <div className="w-4/5 mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Contact Info Section */}
            <div className="flex space-x-6 text-sm">
              <a href="tel:08042516699" className="hover:text-blue-200 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span> 08 0425 16699</span>
              </a>
              <a href="tel:9632533122" className="hover:text-blue-200 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span> 96325 33122</span>
              </a>
              <a href="mailto:info@chanreallergyclinic.com" className="hover:text-blue-200 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>info@chanreallergyclinic.com</span>
              </a>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/ChanRericr/" className="hover:text-blue-200 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://x.com/ChanRecricr2002" className="hover:text-blue-200 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/chanre-rheumatology-and-immunology-center-and-research-928728111/" className="hover:text-blue-200 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <HomeHeader />

      {/* Hero Slider */}
      <section id="home" className="relative pt-32">
        <div className="w-full">
          <div className="relative">
            <img
              src="banner.jpg"
              alt="Indian Doctor with Patient"
              className="w-full h-[600px] md:h-[700px] object-cover"
            />

            {/* Full Width Overlay with Content on Left */}
            <div className="absolute left-0 top-0 w-full h-full bg-white/80 flex items-start">
              <div className="px-38 py-52">
                <div className="space-y-6">
                  {/* Clinic Badge */}
                  <div className="inline-block">
                    <div
                      className="bg-[#e0f2fe] text-[#2490eb] px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider"
                      style={{ fontFamily: 'Quicksand, sans-serif' }}
                    >
                      CHANRE ALLERGY CLINIC
                    </div>
                  </div>

                  {/* Main Heading */}
                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#18100f]"
                    style={{ fontFamily: 'Quicksand, sans-serif', textTransform: 'capitalize' }}
                  >
                    Unlocking Relief,<br />
                    Embracing Life
                  </h1>

                  {/* Description */}
                  <p
                    className="text-[#666666] text-lg leading-relaxed max-w-md"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}
                  >
                    It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                  </p>

                  {/* CTA Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <a
                      href="/about"
                      className="inline-block bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold uppercase px-8 py-4 rounded-md transition-all duration-300"
                      style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', fontWeight: '600' }}
                    >
                      READ MORE
                    </a>
                    <a
                      href="/book-appointment"
                      className="inline-block bg-white hover:bg-gray-100 text-[#2490eb] font-semibold uppercase px-8 py-4 rounded-md border-2 border-[#2490eb] transition-all duration-300"
                      style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', fontWeight: '600' }}
                    >
                      BOOK APPOINTMENT
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Doctor Image - positioned within full overlay */}
              <div className="absolute right-0 top-20 w-2/5 h-full flex items-center justify-center hidden md:flex">
                <div className="relative w-80 h-96 rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src="banner.jpg"
                    alt="Indian Doctor with Patient"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Blocks */}
      <section className="bg-white py-16">
        <div className="w-4/5 mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Emergency Cases */}
            <div className="bg-[#2490eb] text-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Emergency Cases</h3>
              <p className="text-gray-200 mb-6">Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text.</p>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-2xl font-bold">08 0425 16699
                </span>
              </div>
            </div>

            {/* Doctors Timetable */}
            <div className="bg-[#14457b] text-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v1.382l-.894 1.788A2 2 0 000 8a2 2 0 102.382-.894L3 7.118V6a1 1 0 011-1h10a1 1 0 011 1v1.382l.894 1.788A2 2 0 0017 8a2 2 0 10-2.382-.894L14 7.118V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Doctors Timetable</h3>
              <p className="text-gray-200 mb-6">Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text.</p>
              <button className="bg-[#2490eb] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2490eb]/80 transition-colors">
                TIMETABLE +
              </button>
            </div>

            {/* Opening Hours */}
            <div className="bg-[#2490eb] text-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Opening Hours</h3>
              <div className="space-y-2 text-gray-200">
                <div className="flex justify-between">
                  <span>Monday-Friday:</span>
                  <span>9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-300">
                  <span>Ph:</span>
                  <span>08 0425 16699</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Allergy & Clinical Immunology */}
      <section className="bg-white py-20">
        <div className="w-4/5 mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="banner2.jpg"
                alt="Indian Doctor"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <div className="inline-block mb-4">
                <span className="bg-[#2490eb] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider">
                  ALLERGY & CLINICAL IMMUNOLOGY
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-6">Allergy & Clinical Immunology</h2>
              <p className="text-gray-700 mb-6">
                An hypersensitive disorder of the immune system it happens when your body encounters allergen either by
              </p>
              <div className="space-y-3">
                {['Inhalation', 'Injection', 'Ingestion', 'Skin Contact'].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-[#2490eb] mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <a 
                href="/about"
                className="inline-block bg-[#2490eb] text-white px-6 py-3 rounded-lg font-semibold mt-6 hover:bg-[#14457b] transition-colors"
              >
                READ MORE +
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="bg-white py-20">
        <div className="w-4/5 mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-[#2490eb] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider">
                OUR TEAM
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Meet Our Allergy Specialists</h2>
          </div>

          {/* Slider Container with Side Navigation */}
          <div className="flex items-center gap-4">
            {/* Left Navigation Button */}
            <button
              className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors flex-shrink-0"
              onClick={() => moveTeamSlider(-1)}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Slider Container - Shows 3 doctors at a time */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentTeamSlide * 100}%)` }}
              >
                {/* Generate slides based on 4 doctors per slide */}
                {Array.from({ length: Math.ceil(teamData.length / 4) }, (_, slideIndex) => (
                  <div key={slideIndex} className="flex flex-shrink-0 w-full justify-center gap-6">
                    {teamData.slice(slideIndex * 4, (slideIndex + 1) * 4).map((doctor, index) => (
                      <div key={`${slideIndex}-${index}`}>
                        {/* Card Container with smaller dimensions 280x420 */}
                        <div 
                          className="bg-white overflow-hidden transition-all duration-300 group shadow-lg"
                          style={{width: '280px', height: '420px'}}
                        >
                          {/* Main container with image and social bar */}
                          <div className="relative">
                            {/* Image section with reduced dimensions 280x320 */}
                            <div className="relative overflow-hidden" style={{width: '280px', height: '320px'}}>
                              <img
                                src={doctor.image}
                                alt={doctor.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />

                              {/* Social Media Icons Bar - smaller width */}
                              <div className="absolute right-0 top-0 h-full w-12 bg-[#2490eb] flex flex-col items-center justify-center space-y-3 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300">
                                <button className="w-7 h-7 bg-white text-[#2490eb] rounded flex items-center justify-center hover:bg-gray-100 transition-colors">
                                  <span className="font-bold text-sm">f</span>
                                </button>
                                <button className="w-7 h-7 bg-white text-[#2490eb] rounded flex items-center justify-center hover:bg-gray-100 transition-colors">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                  </svg>
                                </button>
                                <button className="w-7 h-7 bg-white text-[#2490eb] rounded flex items-center justify-center hover:bg-gray-100 transition-colors">
                                  <span className="font-bold text-xs">G+</span>
                                </button>
                              </div>
                            </div>
                            
                            {/* Name section with smaller dimensions 250x80 */}
                            <div className="flex items-center justify-center" style={{width: '250px', height: '80px', margin: 'auto'}}>
                              <div className="text-center">
                                <h3 className="text-base font-bold text-gray-900 mb-1" style={{fontSize: '16px', fontWeight: 'bold'}}>{doctor.name}</h3>
                                <p className="text-[#2490eb] text-xs uppercase font-medium leading-tight" style={{fontSize: '12px', fontWeight: '500'}}>{doctor.specialization}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Navigation Button */}
            <button
              className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors flex-shrink-0"
              onClick={() => moveTeamSlider(1)}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(teamData.length / 4) }, (_, slideIndex) => (
              <div
                key={slideIndex}
                className={`w-3 h-3 rounded-full ${currentTeamSlide === slideIndex ? 'bg-blue-600' : 'bg-gray-300'} cursor-pointer hover:bg-blue-500 transition-colors`}
                onClick={() => setCurrentTeamSlide(slideIndex)}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pq-form py-20">
        <div className="w-4/5 mx-auto px-4">
          {/* Main container with indigo background, reversed for mobile, then side-by-side for desktop */}
          <div className="flex flex-col-reverse lg:flex-row items-center bg-[#2490eb]">

            {/* Image Column */}
            <div className="lg:w-1/3 text-center">
              {/* Note: class is className, and the img tag is self-closing with a slash */}
              <img
                src="cc.png"
                className="img-fluid w-full h-auto object-cover lg:translate-y-[-15%] max-lg:pt-5"
                alt="Contact illustration"
              />
            </div>

            {/* Form Column */}
            <div className="lg:w-2/3 mt-5 pt-4 lg:mt-0 p-8 lg:p-12 relative">

              {/* Header */}
              <div className="text-left mb-6">
                <span className="inline-block bg-[#86bffc] text-white px-4 py-2 text-sm uppercase tracking-wider font-semibold rounded">CONTACT</span>
                <h2 className="text-2xl font-bold text-white mt-4">Feel Free To Contact Us</h2>
              </div>

              {/* Form */}
              <form className="mt-8" noValidate onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Full Name Field */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-[#c8d8f3] text-black placeholder-gray-600 rounded-lg border-0 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Full Name"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="col-span-1">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#c8d8f3] text-black placeholder-gray-600 rounded-lg border-0 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Email Address"
                      required
                    />
                  </div>

                  {/* Subject Field */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-[#c8d8f3] text-black placeholder-gray-600 rounded-lg border-0 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Subject"
                      required
                    />
                  </div>

                  {/* Message Field */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full bg-[#c8d8f3] text-black placeholder-gray-600 rounded-lg border-0 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Message"
                      required
                    />
                  </div>

                  {/* Button */}
                  <div className="col-span-full mt-4 mb-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`bg-white text-black font-bold py-3 px-6 rounded-lg inline-flex items-center justify-center uppercase tracking-wider transition duration-300 w-full md:w-auto ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className="me-0">{isLoading ? 'SENDING...' : 'SEND MESSAGE'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="w-4/5 mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-[#2490eb] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider">
                OUR PATIENTS
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Patients Feedback</h2>
          </div>
          
          {/* Testimonials Slider with Auto Scroll */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 50}%)` }}
            >
              {testimonialsData.map((testimonial, index) => (
                <div key={index} className="w-1/2 flex-shrink-0 px-4">
                  <div className="bg-white border rounded-lg p-8 shadow-lg relative">
                    <div className="absolute top-6 left-6 text-6xl text-[#2490eb] opacity-20">"</div>
                    <div className="pt-8">
                      <p className="text-gray-700 mb-6">{testimonial.quote}</p>
                      <div className="flex items-center">
                        
                        <div>
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-gray-600 text-sm">{testimonial.designation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(testimonialsData.length / 2) }, (_, index) => (
              <div 
                key={index} 
                className={`w-3 h-3 rounded-full cursor-pointer transition-colors duration-300 ${currentTestimonial === index * 2 ? 'bg-[#2490eb]' : 'bg-gray-300'}`}
                onClick={() => setCurrentTestimonial(index * 2)}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 md:py-16">
        <div className="w-4/5 mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Column 1 - About Clinic */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-white text-xl font-bold mb-4">ChanRe Allergy Clinic</h3>
              <p className="text-gray-300 mb-6 leading-relaxed text-sm md:text-base">
                Your trusted partner in allergy care and clinical immunology. We provide comprehensive diagnosis, 
                treatment, and management of allergic conditions with state-of-the-art facilities and expert medical care.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/ChanRericr/" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="https://x.com/ChanRecricr2002" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/chanre-rheumatology-and-immunology-center-and-research-928728111/" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a href="/" className="hover:text-white transition-colors">Home</a>
                </li>
                <li>
                  <a href="/about" className="hover:text-white transition-colors">About Us</a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition-colors">Contact Us</a>
                </li>
                <li>
                  <a href="/login" className="hover:text-white transition-colors">Patient Login</a>
                </li>
                <li>
                  <a href="/register" className="hover:text-white transition-colors">Register</a>
                </li>
                <li>
                  <a href="/forgot-password" className="hover:text-white transition-colors">Forgot Password</a>
                </li>
              </ul>
            </div>

            {/* Column 3 - Contact Information */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-4 text-gray-300 text-sm">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-[#2490eb] mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M8 8.883V14a2 2 0 002 2h4a2 2 0 002-2v-6a1 1 0 00-1.414-.907L10 9.882l-2.586-2.586A1 1 0 006 8.883V10a1 1 0 102 0V8.883z" />
                  </svg>
                  <div>
                    <a href="mailto:info@chanreallergyclinic.com" className="hover:text-white transition-colors">
                      info@chanreallergyclinic.com
                    </a>
                    <br />
                    <a href="mailto:appointments@chanreallergyclinic.com" className="hover:text-white transition-colors">
                      appointments@chanreallergyclinic.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[#2490eb] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <div>
                    <a href="tel:08042516699" className="hover:text-white transition-colors block">
                      08 0425 16699
                    </a>
                    <a href="tel:9632533122" className="hover:text-white transition-colors block">
                      96325 33122
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-[#2490eb] mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p>65, Metro Station</p>
                    <p>414, 20th Main Rd, near Rajajinagar</p>
                    <p>West of Chord Road 2nd Stage</p>
                    <p>Bengaluru, Karnataka - 560010</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4 - Working Hours */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Working Hours</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Mon - Fri:</span>
                  <span className="text-white">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Saturday:</span>
                  <span className="text-white">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Sunday:</span>
                  <span className="text-red-400">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Border */}
        <div className="border-t border-gray-700">
          <div className="w-4/5 mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <p className="text-gray-400 text-xs md:text-sm text-center sm:text-left">
                © 2024 ChanRe Allergy Clinic. All Rights Reserved.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-end space-x-4 md:space-x-6 text-gray-400 text-xs md:text-sm">
                <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="/patient-info" className="hover:text-white transition-colors">Patient Information</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}