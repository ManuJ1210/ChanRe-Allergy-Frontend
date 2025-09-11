// src/pages/Home.jsx
import { useState } from "react";
import { MdExpandMore } from "react-icons/md";
import HomeHeader from "../components/HomeHeader";

const services = [
  {
    title: "Allergy Testing",
    desc: "Accurate allergy testing to identify substances that trigger allergic reactions."
  },
  {
    title: "Customized Treatment Plans",
    desc: "Tailored plans based on test results and symptoms for better relief."
  },
  {
    title: "Allergy Immunotherapy",
    desc: "Desensitization therapy to reduce allergic symptoms long-term."
  },
  {
    title: "Asthma Management",
    desc: "Comprehensive asthma evaluation, treatment & prevention strategies."
  },
  {
    title: "Allergic Rhinitis",
    desc: "Personalized care for seasonal & perennial rhinitis."
  },
  {
    title: "Angioedema Treatment",
    desc: "Expert care for swelling-related allergic reactions."
  }
];

const Accordion = ({ title, desc }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg mb-2 shadow-sm transition duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-blue-700 hover:bg-blue-50"
      >
        {title}
        <MdExpandMore className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-4 pb-4 text-gray-600 transition-opacity duration-300 ease-in-out">{desc}</p>}
    </div>
  );
};

export default function Home() {
  return (
    <div className="font-sans bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800">
     <HomeHeader/>

      {/* Hero */}
      <section id="home" className="relative pt-24 bg-gradient-to-r from-blue-100 via-blue-50 to-white overflow-hidden">
        {/* Animated SVG blob background */}
        <svg className="absolute -top-20 -left-32 w-[500px] h-[500px] opacity-30 blur-2xl z-0" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="heroBlobGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <path fill="url(#heroBlobGradient)" d="M421,307Q393,364,334,386Q275,408,217,393Q159,378,120,329Q81,280,98,210Q115,140,176,110Q237,80,299,97Q361,114,410,157Q459,200,421,307Z" />
        </svg>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 text-center flex flex-col items-center">
          <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow-lg mb-8 mt-8 tracking-tight">
            Unlocking the Relief from Allergy
          </h2>
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 max-w-2xl mx-auto p-8 mb-6">
            <p className="text-gray-600 text-lg">
              Personalized care, advanced diagnostics, and compassionate specialists at your service.
            </p>
          </div>
          <button className="mt-4 px-10 py-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-2xl shadow-lg font-bold text-xl flex items-center gap-3 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 active:scale-95">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            Book an Appointment
          </button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-20 px-6 max-w-7xl mx-auto" id="about">
        <h3 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow-lg mb-10 mt-8 tracking-tight">Why Choose Us?</h3>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 flex flex-col gap-6">
            <p className="text-gray-700 text-lg">
              We specialize in comprehensive allergy care—accurate diagnosis, personalized treatment,
              and the latest medical advancements for a better life.
            </p>
            <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Mission</h4>
                <p>Empowering healthy lives through accessible, personalized allergy care.</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Vision</h4>
                <p>To pioneer compassionate allergy care with clinical excellence.</p>
              </div>
            </div>
          </div>
          <img
            src="/1.jpg"
            alt="Doctor"
            className="rounded-2xl shadow-xl w-full max-h-[400px] object-cover border border-blue-100"
          />
        </div>
      </section>

      {/* Clinic Near You */}
      <section className="bg-blue-50 py-20 px-6" id="clinics">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <img
            src="2.jpg"
            alt="Clinic Near You"
            className="rounded-2xl shadow-xl w-full max-h-[400px] object-cover border border-blue-100"
          />
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 flex flex-col gap-6">
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow mb-4">ChanRe Near You</h3>
            <p className="text-gray-700 text-lg">
              We are establishing franchise allergy clinics to bring expert care closer to your community.
              Say goodbye to long commutes and hello to local allergy relief.
            </p>
            <button className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white py-3 rounded-xl shadow-lg font-semibold text-lg transition-all duration-200">Learn More</button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white py-20 px-6" id="services">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow-lg mb-10 mt-8 tracking-tight">Our Services</h3>
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8">
            {services.map((item, index) => (
              <Accordion key={index} title={item.title} desc={item.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* Allergy Info */}
      <section className="bg-gradient-to-br from-blue-100 via-blue-50 to-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <img
            src="3.jpg"
            alt="Immunology"
            className="rounded-2xl shadow-xl w-full max-h-[400px] object-cover border border-blue-100"
          />
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 flex flex-col gap-4">
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow mb-4">Allergy & Clinical Immunology</h3>
            <ul className="list-disc list-inside text-gray-700 text-base leading-relaxed">
              <li>Eyes: Itchy, watering</li>
              <li>Nose: Sneezing, block</li>
              <li>Throat: Irritation, soreness</li>
              <li>Skin: Rashes, itching</li>
              <li>GI Tract: Bloating, diarrhea</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Who Should Visit Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow mb-8 mt-8">Who Should Visit?</h3>
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-gray-700 text-base">
              <li>1. Complex allergic diseases like asthma or eczema</li>
              <li>2. Severe allergies (e.g., food, drug, insect)</li>
              <li>3. Life-threatening allergic reactions (anaphylaxis)</li>
              <li>4. Suspected occupational/environmental allergies</li>
              <li>5. Food allergy requiring medically supervised challenge</li>
              <li>6. Allergic rhinitis needing immunotherapy</li>
              <li>7. Poor control of asthma despite regular meds</li>
              <li>8. Suspected chronic urticaria or angioedema</li>
              <li>9. Suspected immunodeficiencies</li>
              <li>10. Suspected autoimmune disorders</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-100 text-sm py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          &copy; 2025 ChanRe Allergy Clinic. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
