
import React, { useEffect, useState } from 'react';
import './DonorsList.css';

const DonorsList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await fetch('https://lifedaan-backend.onrender.com/api/auth/donors');

        // Check whether the server response is successful
        if (!response.ok) {
          throw new Error(`Failed to fetch donors: ${response.status}`);
        }

        // Read the response safely
        const responseText = await response.text();

        // Handle an empty response without causing a JSON parsing error
        if (!responseText.trim()) {
          setDonors([]);
          return;
        }

        // Parse the response as JSON
        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error('Server returned an invalid JSON response.');
        }

        // Ensure the response contains a donors array
        if (Array.isArray(data)) {
          setDonors(data);
        } else {
          throw new Error('Invalid donors response from server.');
        }
      } catch (error) {
        console.error('Error fetching donors:', error);
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
                <p className="donor-blood-group">
                  {donor.bloodGroup || 'Ready to Donate'}
                </p>
                <p className="donor-city">
                  📍 {donor.district || donor.city || 'India'}
                </p>
                <span className="view-details-btn">View Details</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL (POPUP) SECTION */}
      {selectedDonor && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedDonor(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setSelectedDonor(null)}
            >
              ✖
            </button>

            <div className="modal-header">
              <div className="modal-avatar">👤</div>
              <h2>{selectedDonor.name}</h2>
              <span className="modal-badge">Verified Lifesaver ✔️</span>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <strong>🩸 Blood Group:</strong>{' '}
                <span>{selectedDonor.bloodGroup || 'N/A'}</span>
              </div>

              <div className="detail-row">
                <strong>🎂 Age:</strong>{' '}
                <span>
                  {selectedDonor.age
                    ? `${selectedDonor.age} Years`
                    : 'N/A'}
                </span>
              </div>

              <div className="detail-row">
                <strong>⚖️ Weight:</strong>{' '}
                <span>
                  {selectedDonor.weight
                    ? `${selectedDonor.weight} Kg`
                    : 'N/A'}
                </span>
              </div>

              <div className="detail-row">
                <strong>⚧ Gender:</strong>{' '}
                <span>{selectedDonor.gender || 'N/A'}</span>
              </div>

              <div className="detail-row">
                <strong>📍 Location:</strong>{' '}
                <span>
                  {selectedDonor.address}, {selectedDonor.district},{' '}
                  {selectedDonor.state} - {selectedDonor.pincode}
                </span>
              </div>

              <hr />

              <p
                style={{
                  textAlign: 'center',
                  color: '#666',
                  fontStyle: 'italic',
                  marginTop: '15px'
                }}
              >
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
