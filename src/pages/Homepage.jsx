// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { MdExpandMore } from "react-icons/md";
import HomeHeader from "../components/HomeHeader";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTeamSlide, setCurrentTeamSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const teamData = [
    { name: "Dr.Chandrashekara S.", specialization: "Rheumatology & Autoimmune Diseases", image: "1.png" },
    { name: "Dr.Sushma Shree B.C", specialization: "Paediatric Rheumatologist", image: "2.png" },
    { name: "Dr.Smitha J N Singh", specialization: "Allergy & Clinical Immunology", image: "3.png" },
    { name: "Dr.Chaitra S Niranthara", specialization: "Reproductive immunology & High risk pregnancy", image: "4.png" },
    { name: "Dr. Meera Iyengar", specialization: "CLINICAL IMMUNOLOGY", image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&h=300&fit=crop&crop=face" },
    { name: "Dr. Arun Reddy", specialization: "FOOD ALLERGY SPECIALIST", image: "https://images.unsplash.com/photo-1614594895303-fe863a4a0d22?w=300&h=300&fit=crop&crop=face" }
  ];

  const testimonialsData = [
    { 
      quote: "Dr. Sharma helped me manage my severe pollen allergies. The treatment was excellent and I can now enjoy spring without constant sneezing.", 
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic (e.g., Axios post, fetch, etc.)
    console.log('Form submitted!');
  };

  return (
    <div className="font-sans bg-white text-gray-800">
      {/* Top Header Section */}
      <div className="bg-[#2490eb]  text-white py-2 fixed top-0 left-0 right-0 z-[60]" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
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

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-200 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="hover:text-blue-200 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a href="#" className="hover:text-blue-200 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.988-5.367 11.988-11.987C24.005 5.367 18.638.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z" />
                </svg>
              </a>
              <a href="#" className="hover:text-blue-200 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.17 0C5.662 0 0.348 5.314 0.348 11.821c0 5.264 3.414 9.715 8.134 11.297a.665.665 0 0 0.348-1.047C7.027 18.051 5.526 15.903 5.526 12.829c0-1.535.123-3.052.362-4.507.6-3.772 4.358-6.996 8.274-6.996 4.918 0 8.274 3.99 8.274 8.996 0 5.474-4.466 9.914-11.726 9.914-1.726 0-2.343-1.047-2.343-2.343 0-.873.174-1.535.6-2.138.475-1.205 2.286-1.535 3.481-1.535 4.359 0 7.284 3.052 7.284 7.284 0 3.743-2.862 6.227-6.923 6.227z" />
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

                  {/* CTA Button */}
                  <div className="pt-4">
                    <a
                      href="/about-us"
                      className="inline-block bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold uppercase px-8 py-4 rounded-md transition-all duration-300"
                      style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', fontWeight: '600' }}
                    >
                      READ MORE
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
                <span className="text-2xl font-bold">987 654 321</span>
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
                  <span>8:00 - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>6:00 - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>9:00 - 4:00 PM</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Emergency:</span>
                  <span>24HRS 7Days</span>
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
              <button className="bg-[#2490eb] text-white px-6 py-3 rounded-lg font-semibold mt-6 hover:bg-[#14457b] transition-colors">
                READ MORE +
              </button>
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
              <form action="#" className="mt-8" noValidate onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Name Field */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      name="your-name"
                      id="first-name"
                      className="w-full bg-[#c8d8f3] text-black placeholder-gray-600 rounded-lg border-0 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="col-span-1">
                    <input
                      type="email"
                      name="your-email"
                      id="e-mail"
                      className="w-full bg-[#c8d8f3] text-black placeholder-gray-600 rounded-lg border-0 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Your Email"
                      required
                    />
                  </div>

                  {/* Doctor Name Field */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      name="your-doctor-name"
                      id="doctor-name"
                      className="w-full bg-[#c8d8f3] text-black placeholder-gray-600 rounded-lg border-0 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Your Doctor Name"
                      required
                    />
                  </div>

                  {/* Disease Name Field */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      name="your-disease"
                      id="disease-name"
                      className="w-full bg-[#c8d8f3] text-black placeholder-gray-600 rounded-lg border-0 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Your Disease Name"
                      required
                    />
                  </div>

                  {/* Message Textarea */}
                  <div className="col-span-full">
                    {/* Corrected name and id for message textarea for better practice */}
                    <textarea
                      name="your-message"
                      id="your-message"
                      rows="4"
                      className="w-full bg-white text-black placeholder-gray-500 rounded-lg border shadow-md focus:outline-none resize-none py-3 px-4 mt-4"
                      placeholder="Write your message here ..."
                      required
                    ></textarea>
                  </div>

                  {/* Button */}
                  <div className="col-span-full mt-4 mb-4">
                    <button
                      type="submit"
                      className="bg-white text-black font-bold py-3 px-6 rounded-lg inline-flex items-center justify-center uppercase tracking-wider hover:bg-gray-100 transition duration-300 w-full md:w-auto"
                    >
                      <span className="me-0">SEND MESSAGE</span>
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
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
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
      <footer className="bg-gray-800 py-16">
        <div className="w-4/5 mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Column 1 */}
            <div>
              <p className="text-gray-300 mb-6">
                It helps designers plan out where the content will sit, the content to be written and approved.
              </p>
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map((index) => (
                  <a key={index} href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Important Links</h3>
              <ul className="space-y-2 text-gray-300">
                {['About Us', 'Our Services', 'Doctors 1', 'Doctors 2', 'Events', 'Contact Us'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {[
                  { image: "https://images.unsplash.com/photo-1610958900018-7a5ffaa8f80a?w=60&h=60&fit=crop&crop=face", title: "Get The Exercise Limited Mobility", date: "DECEMBER 12, 2021" },
                  { image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=60&h=60&fit=crop&crop=face", title: "Transfusion Strategy And Heart Surgery", date: "DECEMBER 12, 2021" }
                ].map((post, index) => (
                  <div key={index} className="flex">
                    <img src={post.image} alt={post.title} className="w-12 h-12 object-cover rounded mr-3" />
                    <div>
                      <p className="text-sm text-gray-300">{post.date}</p>
                      <p className="text-white text-sm">{post.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-3 text-gray-300">
                <p>+1800-001-658</p>
                <p>info@chanreallergyclinic.com</p>
                <p>Themeforest, Envato HQ 24 Fifth st, Los Angeles, USA</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700">
          <div className="w-4/5 mx-auto px-4 py-4">
            <p className="text-gray-400 text-center text-sm">
              Copyright 2004 ChanRe Allergy Clinic - All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}