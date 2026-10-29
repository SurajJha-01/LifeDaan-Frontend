import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientDashboard.css';
import './HospitalDashboard.css'; 

const PatientDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Patient';
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail') || ''; 

  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Security Check
  useEffect(() => {
    if (userRole !== 'patient') navigate('/');
  }, [navigate, userRole]);

  // FETCH PATIENT'S OWN REQUESTS
  const fetchMyRequests = async () => {
    try {
      const response = await fetch(`https://lifedaan-backend.onrender.com/api/requests/my-requests/${userName}`);
      const data = await response.json();
      if (response.ok) setMyRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [userName]);

  const [formData, setFormData] = useState({
    bloodGroup: '', hospitalName: '', contactNumber: '', urgency: 'high', location: '', pincode: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // CREATE NEW EMERGENCY REQUEST
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestPayload = { ...formData, patientName: userName };

      const response = await fetch('https://lifedaan-backend.onrender.com/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      if (response.ok) {
        alert("🚨 Emergency Request Broadcasted to Local Donors!");
        setFormData({ bloodGroup: '', hospitalName: '', contactNumber: '', urgency: 'high', location: '', pincode: '' });
        fetchMyRequests(); 
        setActiveTab('dashboard'); 
      } else {
        alert("❌ Error generating request. Please try again.");
      }
    } catch (error) {
      alert("Server error!");
    }
  };

  // NEY FUNCTION: COMPLETE DONATION & START TIMER
  const handleCompleteDonation = async (requestId, donorEmail) => {
    const confirm = window.confirm("Verify that this donor has successfully donated blood? This will start their 90-day recovery timer.");
    if (!confirm) return;

    try {
      const response = await fetch(`https://lifedaan-backend.onrender.com/api/requests/complete/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorEmail })
      });

      if (response.ok) {
        alert("✅ Donation completed! Blood stock updated and Donor's timer has started.");
        fetchMyRequests();
      } else {
        alert("❌ Failed to complete request.");
      }
    } catch (error) {
      alert("Server Error!");
    }
  };

  // PASSWORD CHANGE HANDLER
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return alert("❌ New passwords do not match!");
    }
    try {
      const response = await fetch(`https://lifedaan-backend.onrender.com/api/auth/change-password/${userEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: passwordData.currentPassword, 
          newPassword: passwordData.newPassword 
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert("✅ Password changed successfully!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(`❌ ${data.message || "Error changing password"}`);
      }
    } catch (error) {
      alert("Server Error!");
    }
  };

  // DELETE ACCOUNT HANDLER
  const handleDeleteAccount = async () => {
    const confirmName = window.prompt(`DANGER ZONE: Type "${userName}" to permanently delete your patient account.`);
    if (confirmName === userName) {
      try {
        const response = await fetch(`https://lifedaan-backend.onrender.com/api/auth/delete-account/${encodeURIComponent(userName)}`, { method: 'DELETE' });
        if (response.ok) {
          localStorage.clear();
          window.location.href = '/'; 
        }
      } catch (error) { alert("Server Error!"); }
    } else if (confirmName !== null) {
      alert("❌ Name did not match.");
    }
  };

  return (
    <div className="patient-wrapper">
      
      <aside className="sidebar">
        <ul className="sidebar-menu">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            📊 My Dashboard
          </li>
          <li className={activeTab === 'new-request' ? 'active' : ''} onClick={() => setActiveTab('new-request')}>
            🚨 New Request
          </li>
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            ⚙️ Profile Settings
          </li>
          <li onClick={() => {
            localStorage.clear();
            window.location.href = '/login'; 
          }}>
            🚪 Logout
          </li>
        </ul>
      </aside>

      <main className="patient-main">
        <div className="dashboard-header">
          <div>
            <h2>Hi, {userName} 👤</h2>
            <p>Track your blood requests and connect with donors.</p>
          </div>
        </div>

        {/* TAB 1: LIVE TRACKER SECTION */}
        {activeTab === 'dashboard' && (
          <div className="tracker-section">
            <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px' }}>📡 Live Request Tracker</h3>
            
            <div className="tracker-grid">
              {myRequests.length === 0 ? (
                <p>You have no active blood requests.</p>
              ) : (
                myRequests.map((req) => (
                  <div className={`tracker-card ${req.status}`} key={req._id}>
                    <div className="tracker-info">
                      <h4>Need {req.bloodGroup} Blood at {req.hospitalName}</h4>
                      <p>📅 Requested on: {new Date(req.createdAt).toLocaleDateString()}</p>
                      <p>📍 Location: {req.location} | 📞 Your Contact: {req.contactNumber}</p>
                    </div>
                    
                    <div className={`status-badge ${req.status}`}>
                      {req.status === 'pending' ? '⏳ Searching for Donors...' : req.status === 'fulfilled' ? '🎉 Request Completed!' : '✅ Donors Found!'}
                    </div>
                    
                    {/* UI: VOLUNTEERED DONORS LIST WITH WHATSAPP/CALL */}
                    {req.acceptedDonors && req.acceptedDonors.length > 0 && req.status !== 'fulfilled' && (
                      <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>🤝 Donors Ready to Help</h4>
                        
                        {req.acceptedDonors.map((donor, index) => (
                          <div key={index} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '12px', borderRadius: '5px', marginBottom: '10px', border: '1px solid #bbdefb', gap: '10px' }}>
                            <div>
                              <strong style={{ fontSize: '1.1rem' }}>{donor.donorName}</strong><br/>
                              <span style={{ color: '#555', fontSize: '0.9rem' }}>{donor.donorContact}</span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              {/* 💬 WhatsApp Button */}
                              <a 
                                href={`https://wa.me/91${donor.donorContact}?text=Hello ${donor.donorName}, I am reaching out regarding my urgent blood request on LifeDaan. Are you available to donate?`} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ backgroundColor: '#25D366', color: 'white', padding: '8px 12px', textDecoration: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold' }}
                              >
                                💬 WhatsApp
                              </a>
                              
                              {/* 📞 Call Button */}
                              <a 
                                href={`tel:${donor.donorContact}`} 
                                style={{ backgroundColor: '#1976D2', color: 'white', padding: '8px 12px', textDecoration: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold' }}
                              >
                                📞 Call
                              </a>

                              {/* ✅ Verify Donation Button */}
                              <button 
                                onClick={() => handleCompleteDonation(req._id, donor.donorEmail)} 
                                style={{ backgroundColor: '#d32f2f', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                ✅ Blood Received
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CREATE REQUEST FORM */}
        {activeTab === 'new-request' && (
          <div className="request-form-container">
            <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px' }}>🚨 Need Blood? Create Request</h3>
            <form onSubmit={handleSubmit} className="req-form-grid">
              <div className="req-input-group">
                <label>Blood Group Needed *</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                  <option value="">Select Group</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
              <div className="req-input-group">
                <label>Admitted Hospital Name *</label>
                <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} required />
              </div>
              <div className="req-input-group">
                <label>Your Contact Number *</label>
                <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
              </div>
              <div className="req-input-group">
                <label>Urgency Level *</label>
                <select name="urgency" value={formData.urgency} onChange={handleChange} required>
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟡 High</option>
                  <option value="normal">🟢 Normal</option>
                </select>
              </div>
              <div className="req-input-group full-width">
                <label>City / Complete Address *</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required />
              </div>
              
              <div className="req-input-group full-width">
                <label>Pincode * (To notify local donors)</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required pattern="[0-9]{6}" placeholder="e.g. 800001" />
              </div>

              <button type="submit" className="submit-req-btn full-width">Broadcast Request</button>
            </form>
          </div>
        )}

        {/* TAB 3: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="tracker-section">
            <h3 style={{ borderLeft: '4px solid #333', paddingLeft: '10px' }}>⚙️ Profile Settings</h3>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <p style={{ fontSize: '1.1rem' }}><strong>Name:</strong> {userName}</p>
              <p style={{ fontSize: '1.1rem' }}><strong>Email:</strong> {userEmail || "Not available"}</p>
              <p style={{ fontSize: '1.1rem' }}><strong>Role:</strong> Patient / Receiver</p>
            </div>

            {/* PASSWORD CHANGE */}
            <h3 style={{ borderLeft: '4px solid #1976D2', paddingLeft: '10px', color: '#1976D2' }}>🔐 Change Password</h3>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <form onSubmit={handlePasswordChange} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Current Password</label>
                  <input type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>New Password</label>
                  <input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirm New Password</label>
                  <input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                </div>
                <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', background: '#1976D2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Update Password</button>
              </form>
            </div>

            {/* DELETE ACCOUNT */}
            <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px', color: '#d32f2f' }}>⚠️ Account Deletion</h3>
            <div style={{ background: '#fff5f5', padding: '25px', borderRadius: '12px', border: '1px solid #ffcdd2' }}>
              <h4 style={{ color: '#d32f2f', margin: '0 0 10px 0', fontSize: '1.2rem' }}>Close Patient Account</h4>
              <p style={{ color: '#555', marginBottom: '20px' }}>Once deleted, your request history will be gone forever.</p>
              <button onClick={handleDeleteAccount} style={{ backgroundColor: 'transparent', color: '#d32f2f', border: '2px solid #d32f2f', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️ Permanently Delete Account</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default PatientDashboard;