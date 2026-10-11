import React, { useState, useEffect } from 'react';
import './Hospitals.css';

const Hospitals = () => {
  const [hospitalList, setHospitalList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/hospitals/list');
        const data = await response.json();
        
        if (response.ok) {
          setHospitalList(data);
        } else {
          console.error("Failed to fetch hospitals");
        }
      } catch (error) {
        console.error("Server error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = hospitalList.filter(hosp => {
    const hospName = hosp.name ? hosp.name.toLowerCase() : '';
    const hospCity = hosp.location ? hosp.location.toLowerCase() : ''; 
    const searchLower = searchTerm.toLowerCase();
    
    return hospName.includes(searchLower) || hospCity.includes(searchLower);
  });

  const openHospitalWebsite = (hosp) => {
    const websiteUrl = hosp.website || `https://www.google.com/search?q=${encodeURIComponent(hosp.name + ' hospital ' + (hosp.location || hosp.city || ''))}`;
    window.open(websiteUrl, '_blank');
  };

  return (
    <div className="hospitals-page">
      
      <div className="hosp-header">
        <h1>🏥 Verified Hospitals & Blood Banks</h1>
        <p>Find trusted medical partners in the LifeDaan Network for safe blood donations and emergencies.</p>
        
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by Hospital Name or City..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="hosp-container">
        {loading ? (
          <div className="no-results">
            <h3>Loading Verified Hospitals... ⏳</h3>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="no-results">
            <h3>No hospitals found! 🚫</h3>
            <p>Try searching for a different city or check back later when more hospitals register.</p>
          </div>
        ) : (
          <div className="hosp-grid">
            {filteredHospitals.map((hosp, index) => (
              <div 
                className="hosp-card clickable-card" 
                key={hosp._id || index}
                onClick={() => openHospitalWebsite(hosp)}
                title="Click to visit hospital website"
              >
                <div className="card-header">
                  <span className="verified-badge">✔️ Verified Network</span>
                  <span className="stock-badge green">Active</span>
                </div>
                
                <h3 className="hosp-name">{hosp.name} 🌐</h3>
                <p className="hosp-location">📍 {hosp.location || hosp.city || 'India (Registered)'}</p>
                
                <div className="hosp-contact">
                  <p>📞 Contact: <strong>{hosp.contactNumber || hosp.phone || hosp.email || 'N/A'}</strong></p>
                </div>
                
                <div className="card-footer">
                  <button 
                    className="btn-directions"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.name + ' ' + (hosp.location || ''))}`, '_blank');
                    }}
                  >
                    🗺️ Directions
                  </button>
                  
                  <a 
                    href={`tel:${hosp.contactNumber || hosp.phone}`} 
                    style={{flex: 1, textDecoration: 'none'}}
                    onClick={(e) => e.stopPropagation()} 
                  >
                    <button className="btn-contact" style={{width: '100%'}}>Call Now</button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Hospitals;