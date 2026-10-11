import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, userName, setIsLoggedIn, setUserName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const timeoutRef = useRef(null);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  // Dynamic Dashboard Link Generator
  const getDashboardLink = () => {
    if (userRole === 'donor') return '/donor-dashboard';
    if (userRole === 'hospital') return '/hospital-dashboard';
    if (userRole === 'patient') return '/patient-dashboard';
    return '/login';
  };

  // Logout Function
  const handleLogout = () => {
    setIsLoggedIn(false);
    if (setUserName) setUserName("");
    localStorage.clear();
    
    setDropdownOpen(false); 
    closeMenu(); 
    window.location.href = '/login'; 
  };

  // Smooth Hover Functions
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 300); 
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <img src="/image/logo.png" alt="LifeDaan Logo" className="logo-img" />
          <div className="logo-text">
            <h1>LifeDaan</h1>
            <p>Empowering Medical Connectivity</p>
          </div>
        </Link>
      </div>

      <div className="menu-icon" onClick={toggleMenu}>
        {isMobileMenuOpen ? '✖' : '☰'}
      </div>

      <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/hospitals" onClick={closeMenu}>Hospitals</Link></li>
        <li><Link to="/destinations" onClick={closeMenu}>Donation Camps</Link></li>
        <li><Link to="/donors" onClick={closeMenu}>Our Donors</Link></li>
        <li><Link to="/contact" onClick={closeMenu}>Contact Us</Link></li>

        {isLoggedIn ? (
          <li 
            className="user-dropdown-container"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => setDropdownOpen(!dropdownOpen)} 
          >
            <div className="user-profile-btn">
              👤 Hi, {userName} <span className="arrow">▼</span>
            </div>
            
            {dropdownOpen && (
              <div className="dropdown-menu" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 15px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '1.05rem' }}>{userName}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#d32f2f', fontWeight: 'bold', marginTop: '3px' }}>
                    {userRole === 'donor' ? 'Lifesaver 🌟' : userRole === 'hospital' ? 'Hospital Admin 🏥' : 'Patient 👤'}
                  </p>
                </div>

                <Link to={getDashboardLink()} state={{ tab: 'dashboard' }} onClick={closeMenu}>📊 My Dashboard</Link>
                <Link to={getDashboardLink()} state={{ tab: 'profile' }} onClick={closeMenu}>⚙️ Profile Settings</Link>
                
                <div style={{ borderTop: '1px solid #eee' }}>
                  <button onClick={handleLogout} className="logout-btn" style={{ width: '100%', textAlign: 'center', fontWeight: 'bold' }}>🚪 Logout</button>
                </div>
              </div>
            )}
          </li>
        ) : (
          <li><Link to="/login" className="login-btn" onClick={closeMenu}>Login / Register</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;