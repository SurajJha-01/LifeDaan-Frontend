import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// SOCKET & TOAST IMPORTS START
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// SOCKET & TOAST IMPORTS END

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx'; 

import Home from './Pages/Home.jsx';
import Login from './Pages/Login.jsx';
import DonorDashboard from './Pages/DonorDashboard.jsx';
import HospitalDashboard from './Pages/HospitalDashboard.jsx';
import PatientDashboard from './Pages/PatientDashboard.jsx';
import Hospitals from './Pages/Hospitals';
import ContactUs from './Pages/ContactUs';
import DonorsList from './Pages/DonorsList';

// Donation Camps page Imported
import DonationCamps from './Pages/DonationCamps'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || "");

  // 30-MINUTE AUTO LOGOUT (SECURITY LOGIC) START
  useEffect(() => {
    let inactivityTimer;
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30 mins in milliseconds

    const forceLogout = () => {
      const hasToken = localStorage.getItem('token'); 
      if (hasToken) {
        localStorage.clear();
        window.location.href = '/login';
      }
    };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      localStorage.setItem('lastActiveTime', new Date().getTime().toString());
      
      // Start new thirty minutes timer
      inactivityTimer = setTimeout(forceLogout, THIRTY_MINUTES);
    };

    const checkTabReopen = () => {
      const lastActive = localStorage.getItem('lastActiveTime');
      if (lastActive) {
        const timePassed = new Date().getTime() - parseInt(lastActive);
        if (timePassed > THIRTY_MINUTES) {
          forceLogout();
        }
      }
    };

    checkTabReopen();

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      window.removeEventListener('scroll', resetInactivityTimer);
    };
  }, []);
  //  AUTO LOGOUT LOGIC END


  // REAL-TIME NOTIFICATION LOGIC START
  useEffect(() => {
    const socket = io("https://lifedaan-backend.onrender.com"); 

    socket.on("connect", () => {
      console.log("🟢 Frontend Connected to Socket.io:", socket.id);
    });

    socket.on("newBloodRequest", (data) => {
      
      const userRole = localStorage.getItem('role') ? localStorage.getItem('role').toLowerCase() : ""; 
      const isDonorPage = window.location.pathname.includes('donor');

      if (userRole === 'donor' || isDonorPage) {
        toast.error(`🚨 URGENT: ${data.message}`, {
          position: "top-right",
          autoClose: 10000, 
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  //  REAL-TIME NOTIFICATION LOGIC END

  return (
    <Router>
      <ToastContainer />
      
      <Navbar 
        isLoggedIn={isLoggedIn} 
        userName={userName} 
        setIsLoggedIn={setIsLoggedIn} 
        setUserName={setUserName} 
      /> 
      
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/destinations" element={<DonationCamps />} />
        <Route path="/donors" element={<DonorsList />} />
        <Route path="/contact" element={<ContactUs />} />
        
        <Route 
          path="/login" 
          element={<Login setIsLoggedIn={setIsLoggedIn} setUserName={setUserName} />} 
        />
        
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
      </Routes>
      
      <Footer />
    </Router>
  );
}

export default App;