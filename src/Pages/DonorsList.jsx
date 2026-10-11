import React, { useEffect, useState } from 'react';
import './DonorsList.css';

const DonorsList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/donors');
        const data = await response.json();
        if (response.ok) {
          setDonors(data);
        }
      } catch (error) {
        console.error("Error fetching donors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  return (
    <div className="donors-page">
      <div className="donors-header">
        <h1>🩸 Wall of Fame: Our Heroes</h1>
        <p>Meet the incredible donors who have registered to save lives.</p>
      </div>

      <div className="donors-container">
        {loading ? (
          <p>Loading our heroes...</p>
        ) : donors.length === 0 ? (
          <p>No donors registered yet.</p>
        ) : (
          <div className="donors-grid">
            {donors.map((donor) => (
              <div 
                className="donor-card" 
                key={donor._id} 
                onClick={() => setSelectedDonor(donor)} 
              >
                <div className="donor-avatar">👤</div>
                <h3>{donor.name}</h3>
                <p className="donor-blood-group">{donor.bloodGroup || 'Ready to Donate'}</p>
                <p className="donor-city">📍 {donor.district || donor.city || 'India'}</p>
                <span className="view-details-btn">View Details</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL (POPUP) SECTION */}
      {selectedDonor && (
        <div className="modal-overlay" onClick={() => setSelectedDonor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedDonor(null)}>✖</button>
            
            <div className="modal-header">
              <div className="modal-avatar">👤</div>
              <h2>{selectedDonor.name}</h2>
              <span className="modal-badge">Verified Lifesaver ✔️</span>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <strong>🩸 Blood Group:</strong> <span>{selectedDonor.bloodGroup || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>🎂 Age:</strong> <span>{selectedDonor.age ? `${selectedDonor.age} Years` : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>⚖️ Weight:</strong> <span>{selectedDonor.weight ? `${selectedDonor.weight} Kg` : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>⚧ Gender:</strong> <span>{selectedDonor.gender || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>📍 Location:</strong> <span>{selectedDonor.address}, {selectedDonor.district}, {selectedDonor.state} - {selectedDonor.pincode}</span>
              </div>
              
              <hr />
              <p style={{textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '15px'}}>
                "Registered to save lives via LifeDaan Network."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorsList;