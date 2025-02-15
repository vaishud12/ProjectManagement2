import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
// import Chatbot from './BotAnalysis/Chatbot';
import { motion } from 'framer-motion';

import img4 from "../imcit-imgs/img4.png"
import img5 from "../imcit-imgs/img5.png"
import img6 from "../imcit-imgs/img6.png"
import logo from "../imcit-imgs/logo.jpeg"
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ci from "../imcit-imgs/cyber-intelligence.png";
import pl from "../imcit-imgs/productlaunch.png";
import bd from "../imcit-imgs/business.png";
import sd from "../imcit-imgs/skills.png";
import im from "../imcit-imgs/incident-management.png";
import ma from "../imcit-imgs/market-analysis.png";
import p from "../imcit-imgs/policy.png";
import c from "../imcit-imgs/community.png";
import a from "../imcit-imgs/awareness.png";
import sus from "../imcit-imgs/sustainability.png";
import img from "../imcit-imgs/cyber-img.jpg";

const words = [
  "POSH - Prevention of Sexual Harassment",
  "SISP - Social Influence and Scam Prevention",
  "CIST - Cyber and Identity Support Threats",
  "OMFR - online Marketplace Fraud Risks",
  "CCFD - Charity and Crowdfunding Deception",
  "CRFT - Cryptocurrency Fraud and Threats",
  "CDST - Courier and delivery Scam Threats",
  "INTS - International Scam Scenarios",
];

const TypingText = () => {
  const [index, setIndex] = useState(0);  // Current word index
  const [subIndex, setSubIndex] = useState(0);  // Current letter index
  const [isDeleting, setIsDeleting] = useState(false);  // Typing or Deleting
  const [typingSpeed, setTypingSpeed] = useState(150);  // Speed of typing
  const { t } = useTranslation();
  
  useEffect(() => {
    if (subIndex === words[index].length + 1 && !isDeleting) {
      // Pause before deleting
      setTimeout(() => setIsDeleting(true), 1000);
    } else if (subIndex === 0 && isDeleting) {
      // Move to the next word
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) =>
        isDeleting ? prev - 1 : prev + 1
      );
      setTypingSpeed(isDeleting ? 50 : 150);
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, typingSpeed]);

  return (
    <h1 className="text-2xl md:text-4xl font-bold text-gray-800 leading-tight">
      <span className="text-gray-800">Revolutionizing Project Managament Framewok</span>{" "}
      <span className="inline-block text-red-600">
        {`${words[index].substring(0, subIndex)}`}
      </span>
    </h1>
  );
};

const Home = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const navigate = useNavigate(); // Get the navigate function
  const { t } = useTranslation();
  
  
  const toggleChatbot = () => {
    setChatbotOpen((prevState) => !prevState);
  };
  

  const handleJoinNowClick = () => {
    navigate('/login'); // Navigate to the login page
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 3,
        ease: "easeInOut",
      },
    },
  };
  
  
  return (
    <>
      <div className="relative min-h-screen">
        <Navbar />
        
        <section className="bg-gray-100 py-16 max-w-full">
      <div className="max-w-100vh mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Column */}
          <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <TypingText /> {/* Typing text effect */}
            <div className="mt-4">
              <button className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded mr-4 hover:bg-red-700">
              Get in touch
              </button>
              <button
                onClick={handleJoinNowClick}
                className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              >
                join now
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-1/2 flex justify-center">
            <motion.img
              src={img}  // Replace this with your image source
              alt="Person working on a laptop"
              className="max-w-full h-auto rounded-full"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ width: "30vw", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </section>

<section className="bg-white py-16">
  <div className="container mx-auto text-center px-8">
    <h2 className="text-3xl font-bold text-gray-800">
      The Passion <span className="text-red-600">Incident Framework</span>
    </h2>
    <div>
      <p className="text-gray-600">At PASSION PCOMBINATOR, we are committed to protecting individuals and organizations from the growing menace of cyber crimes. Our platform not only offers a robust incident management system for businesses but also serves as a critical resource for individuals, including senior citizens who are often targeted by cyber criminals.</p>
      <p className="mt-4">We offer:</p>
      <ul className="mt-2 text-gray-600 list-disc list-inside">
        <li>A comprehensive database of various cyber crimes, detailing how to recognize and avoid them.</li>
        <li>Tailored guidance for vulnerable populations, especially senior citizens, on securing their digital presence.</li>
        <li>Real-time incident reporting and resolution for cyber threats, ensuring timely action and mitigation.</li>
        <li>Educational resources that empower users to take proactive steps in safeguarding their online activities.</li>
        <li>Collaboration with global entities to create a more secure and aware digital community.</li>
      </ul>
    </div>
  </div>
</section>



        <section className="bg-gray-100 py-16">
      <div className="container mx-auto text-center px-10">
        <h2 className="text-3xl font-bold text-red-600">{t("content.strategicFocusAreas.title")}</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        <div className="scene" style={{ perspective: '1000px' }}>
        <motion.div
        className="card"
        style={{
          width: '250px',
          height: '300px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 1s',
          cursor: 'pointer',
        }}
        whileHover={{ rotateY: 180 }} // Flip effect on hover
      >
        {/* Front of the card */}
        <motion.div
          className="card__face card__face--front"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          
          <img src={ci} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />


          <h3 className="text-xl font-bold text-gray-800">
          Cyber Intelligence Research and Development
          </h3>
        </motion.div>

        {/* Back of the card */}
        <motion.div
          className="card__face card__face--back"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 className="text-xl font-bold text-gray-800">
          Cyber Intelligence Research and Development
          </h3>
          <p className="text-gray-800 text-center">
          Invest in innovative research to understand emerging cyber threats, develop cutting-edge tools, and enhance incident detection methodologies.
          </p>
        </motion.div>
      </motion.div>
    </div>


    <div className="scene" style={{ perspective: '1000px' }}>
    <motion.div
        className="card"
        style={{
          width: '250px',
          height: '300px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 1s',
          cursor: 'pointer',
        }}
        whileHover={{ rotateY: 180 }} // Flip effect on hover
      >
        {/* Front of the card */}
        <motion.div
          className="card__face card__face--front"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
            <img src={pl} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />
            <h3 className="text-xl font-bold text-gray-800">Product Launch and Innovation</h3>
            </motion.div>

{/* Back of the card */}
<motion.div
  className="card__face card__face--back"
  style={{
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
  }}
>
  <h3 className="text-xl font-bold text-gray-800">Product Launch and Innovation</h3>
  <p className="text-gray-800 text-center">
  Create and deploy new cybersecurity products and services that address current gaps in the market, focusing on user-friendly solutions for diverse users.
  </p>
</motion.div>
</motion.div>
</div>

<div className="scene" style={{ perspective: '1000px' }}>
<motion.div
        className="card"
        style={{
          width: '250px',
          height: '300px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 1s',
          cursor: 'pointer',
        }}
        whileHover={{ rotateY: 180 }} // Flip effect on hover
      >
        {/* Front of the card */}
        <motion.div
          className="card__face card__face--front"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
           <img src={bd} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />
            <h3 className="text-xl font-bold text-gray-800">Business Development and Partnerships</h3>
          </motion.div>
          <motion.div
  className="card__face card__face--back"
  style={{
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
  }}
>
  <h3 className="text-xl font-bold text-gray-800">Business Development and Partnerships</h3>
  <p className="text-gray-800 text-center">
  Forge strategic partnerships with businesses, NGOs, and government agencies to foster collaboration in cybersecurity efforts and expand service offerings.
  </p>
</motion.div>
</motion.div>
</div>


<div className="scene" style={{ perspective: '1000px' }}>
<motion.div
        className="card"
        style={{
          width: '250px',
          height: '300px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 1s',
          cursor: 'pointer',
        }}
        whileHover={{ rotateY: 180 }} // Flip effect on hover
      >
        {/* Front of the card */}
        <motion.div
          className="card__face card__face--front"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
           <img src={sd} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />
            <h3 className="text-xl font-bold text-gray-800">Skills Development and Training</h3>
          </motion.div>
          <motion.div
  className="card__face card__face--back"
  style={{
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
  }}
>
  <h3 className="text-lg font-bold text-gray-800 mb-4">Skills Development and Training</h3>
  <p className="text-gray-800 text-center">
  Implement comprehensive training programs to enhance cybersecurity skills among individuals and organizations, particularly for vulnerable populations.

  </p>
</motion.div>
</motion.div>
</div>
        </div>
      </div>
    </section>

                <section className="bg-white py-16">
                    <div className="container mx-auto flex flex-col md:flex-row items-center px-8">
                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-800">Eager to Explore the Future Landscape of <span className="text-red-600">Cyber Intelligence</span></h2>
                            <p className="mt-4 text-gray-600">{t("content.efficiency")}</p>
                            <button className="mt-8 bg-red-600 text-white px-6 py-3 rounded">Learn More</button>
                        </div>
                        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
                            <img src={img5} alt="People working in a startup environment" style={{ width: "50%", height: "auto" }}  className="rounded shadow"/>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-100 py-16">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold text-red-600">OUR VISION</h2>
                        <p className="mt-4 text-gray-600">To create a globally trusted and resilient digital environment where individuals and organizations can protect themselves against cyber threats, ensuring safety for all, including vulnerable populations like senior citizens.</p>
                    </div>
                </section>

                <section className="bg-white py-16">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold text-red-600">OUR MISSION</h2>
                        <div>
      <h2 className="text-xl font-bold">Our mission is to:</h2>
      <ul className="mt-4 text-gray-600">
        <li>Provide real-time, comprehensive solutions for detecting, mitigating, and resolving cyber incidents worldwide.</li>
        <li>Empower individuals, especially vulnerable populations such as senior citizens, and organizations with easy-to-understand tools and resources for cybersecurity.</li>
        <li>Build a global database of cyber crimes, offering practical guidance on how to prevent and respond to cyber threats.</li>
        <li>Collaborate with international communities to enhance cybersecurity awareness, education, and preparedness across all demographics.</li>
        <li>Ensure the security and privacy of digital assets while fostering trust and resilience in the ever-evolving digital landscape.</li>
      </ul>
    </div>
                    </div>
                </section>

                <section className="bg-gray-100 py-16">
  <div className="container mx-auto text-center px-8">
    <h2 className="text-3xl font-bold text-red-600">OUR SERVICES</h2>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

       {/* Card 1 */}
  <div style={{ perspective: '1000px', marginBottom: '1rem' }}>
    <div
       style={{
        width: '250px',
        height: '300px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 1s',
        cursor: 'pointer',
        transform: 'rotateY(0deg)', // Initial rotation
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(180deg)'} // Flip on mouse enter
      onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'} // Flip back on mouse leave
    >
      {/* Front Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: 'white',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
       <img src={im} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />


        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Incident Management and Response</h3>
      </div>

      {/* Back Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#f8f8f8',
          color: 'black',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
         <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Incident Management and Response</h3>
        <p style={{ fontSize: '1rem', fontWeight: '500', color: '#4a5568' }}>Develop effective frameworks and protocols for incident management, ensuring organizations can respond quickly and efficiently to cyber threats.</p>
      </div>
    </div>
  </div>

      {/* Card 2 */}
  <div style={{ perspective: '1000px', marginBottom: '1rem' }}>
    <div
       style={{
        width: '250px',
        height: '300px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 1s',
        cursor: 'pointer',
        transform: 'rotateY(0deg)', // Initial rotation
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(180deg)'} // Flip on mouse enter
      onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'} // Flip back on mouse leave
    >
      {/* Front Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: 'white',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
         <img src={a} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />

        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Awareness and Advocacy</h3>
      </div>

      {/* Back Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#f8f8f8',
          color: 'black',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Awareness and Advocacy</h3>
        <p style={{ fontSize: '1rem', fontWeight: '500', color: '#4a5568' }}>Promote awareness campaigns and educational initiatives to inform the public about cyber threats, best practices, and the importance of cybersecurity.</p>
      </div>
    </div>
  </div>

      {/* Card 3 */}
  <div style={{ perspective: '1000px', marginBottom: '1rem' }}>
    <div
       style={{
        width: '250px',
        height: '300px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 1s',
        cursor: 'pointer',
        transform: 'rotateY(0deg)', // Initial rotation
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(180deg)'} // Flip on mouse enter
      onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'} // Flip back on mouse leave
    >
      {/* Front Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: 'white',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
       <img src={p} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />

        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Policy Development and Compliance</h3>
      </div>

      {/* Back Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#f8f8f8',
          color: 'black',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Policy Development and Compliance</h3>
        <p style={{ fontSize: '1rem', fontWeight: '500', color: '#4a5568' }}>Work on creating policies and guidelines that ensure organizations comply with cybersecurity regulations and adopt best practices for protecting digital assets.</p>
      </div>
    </div>
  </div>

      {/* Card 4 */}
  <div style={{ perspective: '1000px', marginBottom: '1rem' }}>
    <div
       style={{
        width: '250px',
        height: '300px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 1s',
        cursor: 'pointer',
        transform: 'rotateY(0deg)', // Initial rotation
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(180deg)'} // Flip on mouse enter
      onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'} // Flip back on mouse leave
    >
      {/* Front Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: 'white',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <img src={ma} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />

        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Market Analysis and Strategy</h3>
      </div>

      {/* Back Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#f8f8f8',
          color: 'black',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
         <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Market Analysis and Strategy</h3>
        <p style={{ fontSize: '1rem', fontWeight: '500', color: '#4a5568' }}>Conduct in-depth market analysis to identify trends and opportunities in the cybersecurity landscape, helping organizations make informed decisions.</p>
      </div>
    </div>
  </div>
      {/* Card 5 */}
  <div style={{ perspective: '1000px', marginBottom: '1rem' }}>
    <div
       style={{
        width: '250px',
        height: '300px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 1s',
        cursor: 'pointer',
        transform: 'rotateY(0deg)', // Initial rotation
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(180deg)'} // Flip on mouse enter
      onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'} // Flip back on mouse leave
    >
      {/* Front Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: 'white',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
       <img src={c} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />

        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Community Engagement and Support</h3>
      </div>

      {/* Back Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#f8f8f8',
          color: 'black',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Community Engagement and Support</h3>
        <p style={{ fontSize: '1rem', fontWeight: '500', color: '#4a5568' }}>Foster community engagement through workshops, webinars, and resources to build a knowledgeable network focused on cybersecurity.</p>
      </div>
    </div>
  </div>

      {/* Card 6*/}
  <div style={{ perspective: '1000px', marginBottom: '1rem' }}>
    <div
       style={{
        width: '250px',
        height: '300px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 1s',
        cursor: 'pointer',
        transform: 'rotateY(0deg)', // Initial rotation
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(180deg)'} // Flip on mouse enter
      onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'} // Flip back on mouse leave
    >
      {/* Front Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: 'white',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <img src={sus} alt="logo" style={{ height: 'auto', width: '60%', maxWidth: '70px' }} />

        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Sustainability and Scalability</h3>
      </div>

      {/* Back Side */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#f8f8f8',
          color: 'black',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>Sustainability and Scalability</h3>
        <p style={{ fontSize: '1rem', fontWeight: '500', color: '#4a5568' }}>Develop sustainable and scalable cybersecurity solutions that can grow with the needs of organizations while maintaining effectiveness in combating threats.</p>
      </div>
    </div>
  </div>

    </div>
  </div>
</section>

                <section className="bg-white py-16">
                    <div className="container mx-auto flex flex-col md:flex-row items-center px-8">
                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-800">Explore our specialized domain <span className="text-red-600">PCombinator</span></h2>
                            <p className="mt-4 text-gray-600">A platform for young innovators to research, partner, and collaborate. We provide resources, mentorship, and networking opportunities to help startups succeed.</p>
                            <button className="mt-8 bg-red-600 text-white px-6 py-3 rounded">Learn More</button>
                            <button className="mt-8 bg-red-600 text-white px-6 py-3 rounded ml-4">Get Connected</button>
                        </div>
                        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
                            <img src={img6} alt="People collaborating in a workspace" style={{ width: "60%", height: "auto" }}className="rounded shadow"/>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-100 py-16">
                    <div className="container mx-auto text-center px-8">
                       
                        <div className="mt-8 flex flex-col md:flex-row items-center">
                            <div className="md:w-1/2 text-center md:text-left">
                                <img src={img5} alt="Member photo" style={{ width: "14%", height: "auto" }} className="rounded-full w-32 h-32 object-cover mx-auto md:mx-0"/>
                                <h1 className="text-4xl font-bold text-gray-500">
                                Want to learn Artificial Intelligence, Automation, RPA and Cyber Security?<span className="text-red-400">Artificial Intelligence, Automation, RPA and Cyber Security?</span>
                        </h1>
                        <p className="mt-4 text-lg text-red-400">
                        Join the Journey of Innovation and Security Today!
                        </p>
                               
                            </div>
                            <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
                                <img src={img4} style={{ width: "50%", height: "auto" }} alt="AI and Cyber Security" className="rounded shadow"/>
                            </div>
                        </div>
                    </div>
                </section>
        {/* Additional sections remain unchanged */}

        {/* Conditionally render the Chatbot */}

        <footer className="bg-gray-800 text-white py-8">
                        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                            <div className="text-center md:text-left">
                            <div class="flex items-center mb-4">
                            <img src={logo} alt="Logo of Passion IT" class="mr-2"/>
                            <span class="text-2xl text-red-500 font-bold">PASSION IT.com</span>
                        </div>
                                <p className="mt-4">A generic platform dedicated to empowering innovation research and development across various domains.</p>
                                <div class="flex items-center mb-2">
                            <i class="fas fa-map-marker-alt text-red-500 mr-2"></i>
                            <span>Office #5, Block 1, Lloyds Chambers, Mangalwar Peth, Near Ambedkar Bavan, Pune - 411011</span>
                        </div>
                                <div class="flex items-center">
                            <i class="fas fa-phone-alt text-red-500 mr-2"></i>
                            <span>+91 8983003402</span>
                        </div>
                            </div>
                            <div className="mt-8 md:mt-0 text-center md:text-right">
                                <h3 className="text-xl font-bold">Quick Links</h3>
                                <ul className="mt-4 space-y-2">
                                    <li><a href="#" className="hover:text-red-600">About Us</a></li>
                                    <li><a href="#" className="hover:text-red-600">Services</a></li>
                                    <li><a href="#" className="hover:text-red-600">Resources</a></li>
                                    <li><a href="#" className="hover:text-red-600">Blog</a></li>
                                </ul>
                            </div>
                            <div className="mt-8 md:mt-0 text-center md:text-right">
                                <h3 className="text-xl font-bold">Join Our Team</h3>
                                <ul className="mt-4 space-y-2">
                                    <li><a href="#" className="hover:text-red-600">Careers</a></li>
                                    <li><a href="#" className="hover:text-red-600">Internships</a></li>
                                    <li><a href="#" className="hover:text-red-600">Volunteer</a></li>
                                </ul>
                                <div className="mt-4 space-x-4">
                                    <a href="#" className="text-white hover:text-red-600"><i className="fab fa-facebook-f"></i></a>
                                    <a href="#" className="text-white hover:text-red-600"><i className="fab fa-twitter"></i></a>
                                    <a href="#" className="text-white hover:text-red-600"><i className="fab fa-linkedin-in"></i></a>
                                    <a href="#" className="text-white hover:text-red-600"><i className="fab fa-instagram"></i></a>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 text-center">
    <p>&copy; 2023 <a href="https://passionit.com/" target="_blank" className="text-yellow hover:text-red-600" rel="noopener noreferrer">Passion IT.com</a>. All rights reserved.</p>
</div>

                    </footer>
        
        <button 
  className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none
             w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-14 lg:h-14"
  onClick={toggleChatbot}
>
  💬 {/* You can use an icon instead of an emoji */}
</button>


      {/* Chatbot modal */}
      {chatbotOpen && (
        <div className="">
          {/* <Chatbot /> */}
        </div>
      )}
      </div>
    </>
  );
};

export default Home;