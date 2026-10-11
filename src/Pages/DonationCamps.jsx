import React, { useEffect, useState } from 'react';
import './DonationCamps.css';

const DonationCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/camps/all')
      .then(res => res.json())
      .then(data => {
        const today = new Date().toISOString().split('T')[0];
        const activeCamps = data.filter(camp => camp.date >= today);
        
        setCamps(activeCamps);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching camps:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="camps-page">
      <div className="camps-header">
        <h1>📅 Upcoming Donation Camps</h1>
        <p>Join these life-saving events happening near you.</p>
      </div>

      <div className="camps-container">
        {loading ? <p>Loading Camps...</p> : camps.length === 0 ? <p>No active camps at the moment.</p> : (
          <div className="camps-grid">
            {camps.map(camp => (
              <div className="camp-card" key={camp._id}>
                <div className="camp-status">{camp.status}</div>
                <h3 className="camp-title">{camp.campName}</h3>
                <p className="organized-by">Organized by: <strong>{camp.hospitalName}</strong></p>
                <hr />
                <div className="camp-details">
                  <p>📅 <strong>Date:</strong> {camp.date}</p>
                  <p>⏰ <strong>Time:</strong> {camp.time}</p>
                  <p>📍 <strong>Venue:</strong> {camp.location}</p>
                </div>
                <p className="camp-desc">{camp.description}</p>
                
                {/* Proper Google Maps URL redirection */}
                <button 
                  className="btn-join" 
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(camp.location)}`, '_blank')}
                >
                  📍 View on Map
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationCamps;