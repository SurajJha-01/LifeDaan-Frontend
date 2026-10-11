import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ isLoggedIn }) => {
  const userRole = localStorage.getItem('userRole');

  const getDashboardLink = () => {
    if (userRole === 'donor') return '/donor-dashboard';
    if (userRole === 'hospital') return '/hospital-dashboard';
    if (userRole === 'patient') return '/patient-dashboard';
    return '/login';
  };

  return (
    <div className="home-container">
      
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">❤️ #1 Blood Donation Network</div>
          <h1>Give the Gift of <span className="highlight">Life</span></h1>
          <p>
            Connect with verified blood donors instantly. Whether you want to step up as a hero or need urgent blood for a loved one, LifeDaan bridges the gap in seconds.
          </p>
          
          <div className="hero-buttons">
            {isLoggedIn ? (
              <>
                <Link to={getDashboardLink()} className="btn-primary">Go to Dashboard 🚀</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-primary">Become a Donor</Link>
                <Link to="/login" className="btn-secondary">Request Blood</Link>
              </>
            )}
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="pulse-ring"></div>
          <img src="/image/d&d.png" alt="LifeDaan Connect" className="hero-img" /> 
        </div>
      </section>

      {/* 2. IMPACT STATS BANNER (Trust Builder) */}
      <section className="stats-banner">
        <div className="stat-item">
          <h2>10,000+</h2>
          <p>Active Donors</p>
        </div>
        <div className="stat-item">
          <h2>5,200+</h2>
          <p>Lives Saved</p>
        </div>
        <div className="stat-item">
          <h2>150+</h2>
          <p>Verified Hospitals</p>
        </div>
        <div className="stat-item">
          <h2>&lt; 5 Min</h2>
          <p>Avg. Match Time</p>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Process Steps) */}
      <section className="steps-section">
        <div className="section-header">
          <h2>How LifeDaan Works</h2>
          <p>Three simple steps to save a life or find a match.</p>
        </div>
        
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Register & Verify</h3>
            <p>Sign up as a donor or patient. Hospitals verify accounts to keep the community 100% safe.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Smart Matching</h3>
            <p>Our algorithm instantly alerts nearby donors when a critical blood request is generated.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Connect & Save</h3>
            <p>Donors accept the request, share contact details safely, and visit the hospital to donate.</p>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION (Upgraded UI) */}
      <section className="features-section">
        <h2>Why Choose LifeDaan?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feat-icon">⚡</div>
            <h3>Real-Time Alerts</h3>
            <p>Get instant SOS notifications on your dashboard when someone in your city needs your blood group.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon">🛡️</div>
            <h3>100% Secure</h3>
            <p>Your contact details are hidden until you explicitly accept a request. Privacy is our top priority.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon">📜</div>
            <h3>Earn Certificates</h3>
            <p>Download official appreciation certificates for every successful donation to boost your portfolio.</p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER */}
      <section className="cta-section">
        <h2>Ready to make a difference?</h2>
        <p>Join thousands of heroes who are already saving lives daily.</p>
        {!isLoggedIn && <Link to="/login" className="btn-primary light">Join the Network Now</Link>}
      </section>

    </div>
  );
};

export default Home;