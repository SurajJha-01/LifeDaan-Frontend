import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import './DonorDashboard.css';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userName = localStorage.getItem('userName') || 'Hero';
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [donationHistory, setDonationHistory] = useState([]);
  const [totalDonations, setTotalDonations] = useState(0);

  const [timeLeft, setTimeLeft] = useState("Calculating...");
  const [isEligible, setIsEligible] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // 🚀 Handle Tab Switching from Navbar
  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Prevent unauthorized access
  useEffect(() => {
    if (userRole !== 'donor') navigate('/');
  }, [navigate, userRole]);

  // FETCH ACTIVE EMERGENCY REQUESTS
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const donorPincode = localStorage.getItem('userPincode');
        if (donorPincode) {
          const response = await fetch(`http://localhost:5000/api/requests/active/${donorPincode}`);
          const data = await response.json();
          setRequests(data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // FETCH REAL DONATION HISTORY FROM BACKEND
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/requests/donor-history/${encodeURIComponent(userEmail)}`); const data = await response.json();
        if (response.ok) {
          setDonationHistory(data);
          setTotalDonations(data.length);
        }
      } catch (error) {
        console.error("Error fetching history", error);
      }
    };
    fetchHistory();
  }, [userName]);

  // ELIGIBILITY TIMER LOGIC
  useEffect(() => {
    const lastDonation = localStorage.getItem('lastDonationDate');

    if (!lastDonation || lastDonation === 'null' || lastDonation === 'undefined') {
      setIsEligible(true);
      setTimeLeft("✅ Ready to Donate");
      return;
    }

    const lastDate = new Date(lastDonation);

    if (isNaN(lastDate.getTime())) {
      setIsEligible(true);
      setTimeLeft("✅ Ready to Donate");
      return;
    }

    const eligibleDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = eligibleDate - now;

      if (difference <= 0) {
        setIsEligible(true);
        setTimeLeft("✅ Ready to Donate");
        clearInterval(timer);
      } else {
        setIsEligible(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft(`⏳ ${days}d ${hours}h ${minutes}m ${seconds}s left`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ACCEPT REQUEST LOGIC (MULTI-DONOR SUPPORT)
  const handleAccept = async (requestId) => {
    if (!isEligible) {
      alert("❌ Please wait for your 90-day recovery period.");
      return;
    }

    const donorContact = window.prompt("Please enter your mobile number:");
    if (!donorContact) return;

    if (!userEmail) {
      alert("❌ Email not found! Please logout and login again.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/requests/accept/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: userName,
          donorContact: donorContact,
          donorEmail: userEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Request Accepted! Patient will contact you soon.");
        window.location.reload();
      } else {
        alert(`⚠️ ${data.message || "Could not accept request."}`);
      }
    } catch (error) {
      alert("Server error!");
      console.error(error);
    }
  };

  // PROFESSIONAL CERTIFICATE GENERATOR
  const generateCertificate = (count) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const centerX = 297 / 2;

    doc.setDrawColor(178, 34, 34); doc.setLineWidth(3); doc.rect(10, 10, 277, 190);
    doc.setDrawColor(218, 165, 32); doc.setLineWidth(1); doc.rect(15, 15, 267, 180);

    doc.setFont("times", "bold"); doc.setFontSize(36); doc.setTextColor(178, 34, 34); doc.text("LifeDaan", centerX, 45, null, null, "center");
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(50, 50, 50); doc.text("CERTIFICATE OF APPRECIATION", centerX, 65, null, null, "center");

    doc.setFont("times", "italic"); doc.setFontSize(16); doc.setTextColor(80, 80, 80); doc.text("This certificate is proudly presented to", centerX, 90, null, null, "center");

    doc.setFont("times", "bolditalic"); doc.setFontSize(36); doc.setTextColor(0, 0, 0); doc.text(userName, centerX, 115, null, null, "center");

    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5); doc.line(80, 120, 217, 120);
    doc.setFont("helvetica", "normal"); doc.setFontSize(14); doc.setTextColor(60, 60, 60);
    doc.text("In profound recognition of your selfless act of donating blood.", centerX, 135, null, null, "center");
    doc.text("Your noble contribution has given the gift of life to someone in urgent need.", centerX, 145, null, null, "center");

    doc.setFont("times", "bold"); doc.setFontSize(18); doc.setTextColor(218, 165, 32);
    doc.text(`~ Total Lifesaving Donations: ${count} ~`, centerX, 160, null, null, "center");

    doc.setFontSize(14); doc.setFont("times", "normal"); doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 60, 180, null, null, "center"); doc.line(40, 182, 80, 182);
    doc.text("Authorized Signature", 237, 180, null, null, "center"); doc.line(207, 175, 267, 175);

    doc.save(`LifeDaan_Hero_${userName}.pdf`);
  };

  // PROFILE UPDATES & SETTINGS
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setProfilePic(base64);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const saveProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/update-profile/${userEmail}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profilePicture: profilePic })
      });
      if (response.ok) {
        alert("✅ Profile picture updated successfully!");
        localStorage.setItem('profilePic', profilePic);
        setIsEditing(false);
      }
    } catch (error) { alert("Server Error"); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return alert("❌ New passwords do not match!");
    try {
      const response = await fetch(`http://localhost:5000/api/auth/change-password/${userEmail}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        alert("✅ Password changed!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else alert(`❌ ${data.message}`);
    } catch (error) { alert("Server Error!"); }
  };

  const handleDeleteAccount = async () => {
    const confirmName = window.prompt(`DANGER ZONE: Type "${userName}" to delete account.`);
    if (confirmName === userName) {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/delete-account/${encodeURIComponent(userName)}`, { method: 'DELETE' });
        if (response.ok) { localStorage.clear(); window.location.href = '/'; }
      } catch (error) { alert("Server Error!"); }
    }
  };

  // RESET TIMER FUNCTION (For Testing/Admin Purposes)
  const handleResetTimer = async () => {
    const confirmReset = window.confirm("Are you sure you want to stop the countdown?");
    if (!confirmReset) return;

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-timer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Countdown Stopped! You are now eligible to donate.");
        localStorage.removeItem('lastDonationDate');
        window.location.reload();
      } else {
        alert(`❌ Error from Backend: ${data.message || "Failed"}`);
      }
    } catch (error) {
      alert("Server Error! Check Console.");
      console.error(error);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <ul className="sidebar-menu">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</li>
          <li className={activeTab === 'donations' ? 'active' : ''} onClick={() => setActiveTab('donations')}>🩸 My Donations</li>
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>⚙️ Profile</li>
          <li onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h2>Welcome back, {userName}! 🩸</h2>
            <p>Your dashboard to track donations and save lives.</p>
          </div>
          <div className="status-toggle">
            {isEligible ? '🟢 Available for Emergency' : '🔴 Resting Period'}
          </div>
        </div>

        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="stat-icon">❤️</div>
                  <div className="stat-info">
                    <h3>Total Donations</h3>
                    <p style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#d32f2f' }}>
                      {totalDonations < 10 && totalDonations > 0 ? `0${totalDonations}` : totalDonations}
                    </p>
                  </div>
                </div>
                <button onClick={() => generateCertificate(totalDonations)} style={{ marginTop: '15px', padding: '8px 12px', backgroundColor: '#fff', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }} disabled={totalDonations === 0}>
                  {totalDonations > 0 ? '📥 Download Certificate' : '⏳ Donate to Unlock'}
                </button>
              </div>
              <div className="stat-card"><div className="stat-icon">🩸</div><div className="stat-info"><h3>Your Status</h3><p>{isEligible ? "Ready" : "Recovering"}</p></div></div>
              <div className="stat-card" style={{ borderBottomColor: isEligible ? '#2e7d32' : '#f57c00' }}>
                <div className="stat-icon">⏳</div>
                <div className="stat-info"><h3>Next Eligibility</h3><p style={{ fontSize: '1.2rem', color: isEligible ? '#2e7d32' : '#f57c00', fontWeight: 'bold' }}>{timeLeft}</p></div>
              </div>
            </div>

            <div className="requests-section">
              <h3>🚨 Urgent Matches Near You</h3>
              <div className="request-feed">
                {loading ? (
                  <p>Loading live requests...</p>
                ) : requests.length === 0 ? (
                  <p>No urgent blood requests at the moment.</p>
                ) : (
                  requests.map((req) => {
                    // 🚀 MULTI-DONOR BACKUP SYSTEM LOGIC
                    const donorCount = req.acceptedDonors ? req.acceptedDonors.length : 0;
                    const isAlreadyAcceptedByMe = req.acceptedDonors?.some(d => d.donorEmail === userEmail);

                    return (
                      <div className="request-card" key={req._id}>
                        <div className="req-details">
                          <h4>
                            Need {req.bloodGroup} Blood{' '}
                            <span className={`tag ${req.urgency}`}>
                              {req.urgency === 'critical' ? '🔴 Critical' : '🟡 High Priority'}
                            </span>
                          </h4>
                          <p>👤 Patient: {req.patientName}</p>
                          <p>🏥 Location: {req.hospitalName} ({req.location})</p>

                          {/* 🚀 BACKUP DONOR BADGES */}
                          <div style={{ marginTop: '10px' }}>
                            {donorCount > 0 ? (
                              <span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '5px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                                ⏳ {donorCount} Donor(s) already volunteered (Backup needed)
                              </span>
                            ) : (
                              <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                                🟢 No donors yet (Be the first!)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="req-actions" style={{ marginTop: '15px' }}>
                          <button
                            className="btn-map"
                            // 🚀 FIXED MAP URL FORMAT
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.hospitalName + ' ' + req.location)}`, '_blank')}
                          >
                            📍 View Map
                          </button>

                          {/* 🚀 DYNAMIC BUTTON LOGIC */}
                          {isAlreadyAcceptedByMe ? (
                            <button
                              disabled
                              style={{ backgroundColor: '#4caf50', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold' }}
                            >
                              ✅ You accepted this
                            </button>
                          ) : donorCount > 0 ? (
                            <button
                              onClick={() => handleAccept(req._id)}
                              disabled={!isEligible}
                              style={{ backgroundColor: '#ff9800', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: isEligible ? 'pointer' : 'not-allowed', fontWeight: 'bold', opacity: isEligible ? 1 : 0.5 }}
                            >
                              🤝 Accept as Backup
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAccept(req._id)}
                              disabled={!isEligible}
                              className="btn-accept"
                              style={{ opacity: isEligible ? 1 : 0.5, cursor: isEligible ? 'pointer' : 'not-allowed' }}
                            >
                              📢 Accept Request
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: REAL DONATION HISTORY */}
        {activeTab === 'donations' && (
          <div className="requests-section">
            <h3>🩸 My Verified Donation History</h3>
            <div className="request-feed">
              {donationHistory.length === 0 ? (
                <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '10px', textAlign: 'center', color: '#666' }}>
                  <p>You haven't completed any donations through LifeDaan yet.</p>
                  <p>Accept a request from the dashboard to start saving lives!</p>
                </div>
              ) : (
                donationHistory.map((historyItem, index) => (
                  <div className="request-card" key={historyItem._id} style={{ borderLeft: '5px solid #2e7d32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="req-details">
                      <h4 style={{ color: '#2e7d32', margin: '0 0 5px 0' }}>✅ Lifesaver #{totalDonations - index}</h4>
                      <p style={{ margin: '3px 0' }}>📍 Donated at: <strong>{historyItem.hospitalName}</strong></p>
                      <p style={{ margin: '3px 0' }}>👤 Patient: {historyItem.patientName} ({historyItem.bloodGroup})</p>
                      <p style={{ margin: '3px 0' }}>📅 Date: {new Date(historyItem.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="requests-section">
            <h3>⚙️ Profile Settings</h3>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderTop: '4px solid #333', display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #d32f2f', marginBottom: '15px' }}>
                  <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {isEditing ? (
                  <>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ fontSize: '0.8rem', width: '150px' }} />
                    <button onClick={saveProfile} style={{ display: 'block', marginTop: '10px', width: '100%', padding: '8px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>💾 Save Photo</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} style={{ padding: '8px 15px', background: '#f1f1f1', color: '#333', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem' }}>✏️ Edit Photo</button>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}><strong>Name:</strong> {userName}</p>
                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}><strong>Email:</strong> {userEmail}</p>
                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}><strong>Role:</strong> Lifesaver 🌟</p>
              </div>
            </div>

            <h3 style={{ borderLeft: '4px solid #1976D2', paddingLeft: '10px', color: '#1976D2' }}>🔐 Change Password</h3>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <form onSubmit={handlePasswordChange} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Current Password</label><input type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} style={{ width: '100%', padding: '10px' }} />
                </div>
                <div><label>New Password</label><input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} style={{ width: '100%', padding: '10px' }} /></div>
                <div><label>Confirm Password</label><input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} style={{ width: '100%', padding: '10px' }} /></div>
                <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', background: '#1976D2', color: 'white', border: 'none', borderRadius: '5px' }}>Update Password</button>
              </form>
            </div>

            <div style={{ background: '#fff9c4', padding: '20px', borderRadius: '12px', border: '1px solid #fbc02d', marginBottom: '30px' }}>
              <h4 style={{ color: '#f57f17', marginTop: 0 }}>🛠️ Developer/Testing Tools</h4>
              <p style={{ fontSize: '14px', color: '#666' }}>Bypass the 90-day waiting period (For testing purposes only).</p>

              <button
                onClick={handleResetTimer}
                style={{ backgroundColor: '#f57f17', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🛑 Stop Countdown & Make Eligible
              </button>
            </div>

            <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px', color: '#d32f2f' }}>⚠️ Account Deletion</h3>
            <div style={{ background: '#fff5f5', padding: '25px', borderRadius: '12px', border: '1px solid #ffcdd2' }}>
              <h4 style={{ color: '#d32f2f' }}>Delete Donor Account</h4>
              <button onClick={handleDeleteAccount} style={{ backgroundColor: 'transparent', color: '#d32f2f', border: '2px solid #d32f2f', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>🗑️ Permanently Delete</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonorDashboard;