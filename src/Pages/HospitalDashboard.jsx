import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HospitalDashboard.css';
import './DonorDashboard.css';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Hospital Admin';
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (userRole !== 'hospital') navigate('/');
  }, [navigate, userRole]);

  // General States
  const [inventory, setInventory] = useState(null);
  const [activeMatches, setActiveMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');

  // NAYE STATES
  const [myCamps, setMyCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [donorForm, setDonorForm] = useState({ donorName: '', bloodGroup: '', contact: '', age: '', gender: '' });

  // 1. FETCH INVENTORY
  const fetchInventory = async () => {
    try {
      const encodedName = encodeURIComponent(userName);
      const response = await fetch(`https://lifedaan-backend.onrender.com/api/inventory/${encodedName}`);
      const data = await response.json();
      if (response.ok) setInventory(data);
    } catch (error) {
      console.error("Inventory Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [userName]);

  // 2. FETCH ACTIVE MATCHES (Incoming Donors)
  const fetchActiveMatches = async () => {
    try {
      const encodedName = encodeURIComponent(userName);
      const response = await fetch(`https://lifedaan-backend.onrender.com/api/requests/hospital-matches/${encodedName}`);
      const data = await response.json();
      if (response.ok) setActiveMatches(data);
    } catch (error) { }
  };

  useEffect(() => {
    fetchActiveMatches();
  }, [userName]);

  // 3. FETCH HOSPITAL'S OWN CAMPS
  const fetchMyCamps = async () => {
    try {
      const encodedName = encodeURIComponent(userName);
      const response = await fetch(`https://lifedaan-backend.onrender.com/api/camps/hospital-name/${encodedName}`);
      const data = await response.json();
      if (response.ok) setMyCamps(data);
    } catch (error) {
      console.error("Fetch camps error:", error);
    }
  };

  useEffect(() => {
    fetchMyCamps();
  }, [userName]);

  // 4. MANUAL STOCK UPDATE
  const updateStock = async (bloodGroup, change) => {
    try {
      const response = await fetch('https://lifedaan-backend.onrender.com/api/inventory/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalName: userName, bloodGroup, change })
      });
      const updatedStock = await response.json();
      if (response.ok) setInventory(updatedStock);
    } catch (error) { }
  };

  // 5. COMPLETE DONATION
  const handleComplete = async (requestId, bloodGroup) => {
    const confirmDone = window.confirm(`Has the donor successfully donated? This will close the request and automatically add 1 Unit of ${bloodGroup} to your inventory.`);
    if (!confirmDone) return;

    try {
      const response = await fetch(`https://lifedaan-backend.onrender.com/api/requests/complete/${requestId}`, { method: 'PUT' });
      if (response.ok) {
        alert(`✅ Donation successfully recorded! Backend has updated your ${bloodGroup} stock.`);
        setActiveMatches(activeMatches.filter(match => match._id !== requestId));
        fetchInventory();
      }
    } catch (error) {
      alert("Error completing donation.");
    }
  };

  // Form States & Handlers (Blood Request)
  const [formData, setFormData] = useState({ patientName: '', bloodGroup: '', contactNumber: '', urgency: 'high', location: '', pincode: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestPayload = { ...formData, hospitalName: userName };
      const response = await fetch('https://lifedaan-backend.onrender.com/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      if (response.ok) {
        alert("🚨 Urgent Blood Request Generated Successfully!");
        setFormData({ patientName: '', bloodGroup: '', contactNumber: '', urgency: 'high', location: '' });
      }
    } catch (error) { alert("Server error!"); }
  };

  // Camp Publish Handler
  const [campData, setCampData] = useState({ campName: '', date: '', time: '', location: '', description: '' });
  const handleCampChange = (e) => setCampData({ ...campData, [e.target.name]: e.target.value });

  const handleCampSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId') || localStorage.getItem('_id') || localStorage.getItem('id');
      if (!userId) {
        alert("Hospital ID not found! Please login again.");
        return;
      }
      const campPayload = { ...campData, hospitalName: userName, hospitalId: userId };

      const response = await fetch('https://lifedaan-backend.onrender.com/api/camps/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campPayload)
      });

      if (response.ok) {
        alert("📢 Camp successfully published!");
        setCampData({ campName: '', date: '', time: '', location: '', description: '' });
        fetchMyCamps();
      } else {
        alert("❌ Error publishing camp!");
      }
    } catch (error) {
      alert("Server error!");
    }
  };

//Add donor in Camp
  const handleAddDonor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://lifedaan-backend.onrender.com/api/camps/${selectedCamp._id}/add-donor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorForm)
      });
      const data = await response.json();

      if (response.ok) {
        alert("✅ Donor Record Saved!");
        setSelectedCamp(data.camp);
        setDonorForm({ donorName: '', bloodGroup: '', contact: '', age: '', gender: '' }); 
        fetchMyCamps(); 
      }
    } catch (error) {
      console.log(error);
      alert("Error saving donor.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmName = window.prompt(`DANGER ZONE: Type "${userName}" to unregister your hospital.`);
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
    <div className="hospital-wrapper">
      <aside className="sidebar">
        <ul className="sidebar-menu">
          <li className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>🏥 Blood Inventory</li>
          <li className={activeTab === 'create-request' ? 'active' : ''} onClick={() => setActiveTab('create-request')}>🚨 Create Request</li>
          <li className={activeTab === 'organize-camp' ? 'active' : ''} onClick={() => { setActiveTab('organize-camp'); setSelectedCamp(null); }}>📅 Camps Manager</li>
          <li className={activeTab === 'verify' ? 'active' : ''} onClick={() => setActiveTab('verify')}>📋 Verify Donors</li>
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>⚙️ Settings</li>
          <li onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="hospital-main">
        <div className="dashboard-header">
          <h2>{userName} Control Room 🏥</h2>
          <p>Manage your blood bank inventory and verify incoming donors.</p>
        </div>

        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <h3>🩸 Live Blood Stock</h3>
            {!inventory ? <p>Loading inventory...</p> : (
              <div className="inventory-grid">
                {Object.keys(inventory).map((group) => (
                  <div className={`blood-card ${inventory[group] < 5 ? 'low-stock' : ''}`} key={group}>
                    <p className="blood-type">{group}</p>
                    <p className="blood-units">{inventory[group]} Units</p>
                    <div className="stock-controls">
                      <button className="stock-btn" onClick={() => updateStock(group, -1)}>-</button>
                      <button className="stock-btn" onClick={() => updateStock(group, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create-request' && (
          <div className="request-form-container">
            <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px' }}>🚨 Generate Urgent Blood Request</h3>
            <form onSubmit={handleSubmit} className="req-form-grid">
              <div className="req-input-group"><label>Patient Name *</label><input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required /></div>
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
              <div className="req-input-group"><label>Contact Number *</label><input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required /></div>
              <div className="req-input-group">
                <label>Urgency Level *</label>
                <select name="urgency" value={formData.urgency} onChange={handleChange} required>
                  <option value="critical">🔴 Critical</option><option value="high">🟡 High</option><option value="normal">🟢 Normal</option>
                </select>
                <label>Pincode *</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required pattern="[0-9]{6}" placeholder="e.g. 800001" />
              </div>
              <div className="req-input-group full-width"><label>Location / City *</label><input type="text" name="location" value={formData.location} onChange={handleChange} required /></div>
              <button type="submit" className="submit-req-btn full-width">Broadcast Request</button>
            </form>
          </div>
        )}

        {activeTab === 'organize-camp' && (
          <div className="request-form-container">

            {!selectedCamp ? (
              <>
                <h3 style={{ borderLeft: '4px solid #4CAF50', paddingLeft: '10px' }}>📅 Organize a Camp</h3>
                <form onSubmit={handleCampSubmit} className="req-form-grid">
                  <div className="req-input-group full-width"><label>Camp Name *</label><input type="text" name="campName" value={campData.campName} onChange={handleCampChange} required /></div>
                  <div className="req-input-group"><label>Date *</label><input type="date" name="date" value={campData.date} onChange={handleCampChange} required /></div>
                  <div className="req-input-group"><label>Time *</label><input type="time" name="time" value={campData.time} onChange={handleCampChange} required /></div>
                  <div className="req-input-group full-width"><label>Location *</label><input type="text" name="location" value={campData.location} onChange={handleCampChange} required /></div>
                  <button type="submit" className="submit-req-btn full-width" style={{ backgroundColor: '#4CAF50' }}>Publish Camp</button>
                </form>

                <hr style={{ margin: "40px 0" }} />

                <h3>📋 Organized Camps Record</h3>
                <div className="inventory-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                  {myCamps.length === 0 ? <p>No camps organized yet.</p> : (
                    myCamps.map(camp => (
                      <div key={camp._id} className="request-card" style={{ borderLeft: '5px solid #4CAF50', padding: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>{camp.campName}</h4>
                        <p style={{ margin: '5px 0' }}>📅 {camp.date} | 📍 {camp.location}</p>
                        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>🩸 Total Donors: {camp.donorsList ? camp.donorsList.length : 0}</p>

                        <button
                          onClick={() => setSelectedCamp(camp)}
                          className="btn-accept"
                          style={{ backgroundColor: '#333', marginTop: '10px', width: '100%' }}
                        >
                          👁️ View & Manage Donors
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (

              <div className="camp-details-view">
                <button onClick={() => setSelectedCamp(null)} className="stock-btn" style={{ marginBottom: '20px', padding: '10px 20px', width: 'auto' }}>🔙 Back to List</button>

                <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
                  <h2>{selectedCamp.campName}</h2>
                  <p><strong>Date:</strong> {selectedCamp.date} | <strong>Location:</strong> {selectedCamp.location}</p>
                  <p><strong>Status:</strong> {selectedCamp.status}</p>
                </div>

                <h3 style={{ borderLeft: '4px solid #1976D2', paddingLeft: '10px' }}>➕ Register New Donor</h3>
                <form onSubmit={handleAddDonor} className="req-form-grid" style={{ marginBottom: '40px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div className="req-input-group"><label>Donor Name *</label><input type="text" required value={donorForm.donorName} onChange={e => setDonorForm({ ...donorForm, donorName: e.target.value })} /></div>
                  <div className="req-input-group">
                    <label>Blood Group *</label>
                    <select required value={donorForm.bloodGroup} onChange={e => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}>
                      <option value="">Select</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="req-input-group"><label>Age *</label><input type="number" required value={donorForm.age} onChange={e => setDonorForm({ ...donorForm, age: e.target.value })} /></div>
                  <div className="req-input-group"><label>Contact No.</label><input type="text" value={donorForm.contact} onChange={e => setDonorForm({ ...donorForm, contact: e.target.value })} /></div>
                  <button type="submit" className="submit-req-btn full-width" style={{ backgroundColor: '#1976D2' }}>Save Donor Record</button>
                </form>

                <h3 style={{ borderLeft: '4px solid #8e24aa', paddingLeft: '10px' }}>🩸 Recorded Donors History</h3>
                {selectedCamp.donorsList && selectedCamp.donorsList.length > 0 ? (
                  <div style={{ overflowX: 'auto', background: 'white', borderRadius: '10px', padding: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                          <th style={{ padding: '12px' }}>Name</th>
                          <th style={{ padding: '12px' }}>Blood Group</th>
                          <th style={{ padding: '12px' }}>Age</th>
                          <th style={{ padding: '12px' }}>Contact</th>
                          <th style={{ padding: '12px' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCamp.donorsList.map((d, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>{d.donorName}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold', color: '#d32f2f' }}>{d.bloodGroup}</td>
                            <td style={{ padding: '12px' }}>{d.age}</td>
                            <td style={{ padding: '12px' }}>{d.contact || 'N/A'}</td>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>{new Date(d.donatedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>No donors recorded yet for this camp.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="inventory-section">
            <h3>📋 Incoming Donors</h3>
            <div className="request-feed">
              {activeMatches.length === 0 ? <p>No active donors arriving right now.</p> : (
                activeMatches.map((match) => (
                  <div className="request-card" key={match._id} style={{ borderLeft: '5px solid #1976D2' }}>
                    <div className="req-details">
                      <h4>Patient: {match.patientName} ({match.bloodGroup})</h4>
                      <p>🩸 Donor: <strong>{match.acceptedBy}</strong> | 📞 {match.donorContact}</p>
                    </div>
                    <button className="btn-accept" style={{ backgroundColor: '#1976D2' }} onClick={() => handleComplete(match._id, match.bloodGroup)}>✅ Blood Received</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="inventory-section">
            <h3>⚙️ Hospital Settings</h3>
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
              <p><strong>Name:</strong> {userName}</p>
              <p><strong>Account Type:</strong> Blood Bank Admin</p>
            </div>
            <div style={{ background: '#fff5f5', padding: '20px', borderRadius: '10px', border: '1px solid #ffcdd2' }}>
              <h4 style={{ color: '#d32f2f' }}>⚠️ Danger Zone</h4>
              <p>Permanently remove your hospital from the LifeDaan network.</p>
              <button onClick={handleDeleteAccount} className="stock-btn" style={{ color: '#d32f2f', border: '1px solid #d32f2f', padding: '10px', width: 'auto' }}>🗑️ Delete Hospital Account</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HospitalDashboard;