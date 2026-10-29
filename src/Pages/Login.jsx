import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setIsLoggedIn, setUserName }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [role, setRole] = useState('donor');

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', password: '', confirmPassword: '',
    bloodGroup: '', gender: '', age: '', weight: '',
    hospitalLicense: '', facilityType: '', medicalCondition: '',
    state: '', district: '', address: '', pincode: '', website: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      try {
        const response = await fetch('https://lifedaan-backend.onrender.com/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });

        const data = await response.json();

        if (response.ok) {
          // THE ULTIMATE ID FINDER
          const finalUserId = data.user?._id || data.user?.id || data._id || data.id;
          const finalUserName = data.user?.name || data.name || "User";
          const finalUserEmail = data.user?.email || data.email || formData.email;
          const finalUserRole = data.user?.role || data.role;

          alert(`🎉 Welcome back, ${finalUserName}!`);
          
          // LOCAL STORAGE SETUP (With guaranteed valid values)
          localStorage.setItem('lastDonationDate', data.lastDonationDate || "null");
          localStorage.setItem('token', data.token || "");
          localStorage.setItem('userName', finalUserName);
          localStorage.setItem('userEmail', finalUserEmail);
          localStorage.setItem('userPincode', data.user.pincode);
          
          if (finalUserId) {
            localStorage.setItem('userId', finalUserId);
          } else {
            console.error("Critical Error: Backend did not send an ID!");
          }
          
          localStorage.setItem('userRole', finalUserRole);
          localStorage.setItem('role', finalUserRole); 

          setIsLoggedIn(true);
          setUserName(finalUserName);

          // Redirect as per role
          if (finalUserRole === 'donor') navigate('/donor-dashboard');
          else if (finalUserRole === 'hospital') navigate('/hospital-dashboard');
          else if (finalUserRole === 'patient') navigate('/patient-dashboard');

        } else {
          alert("❌ Login Failed: " + data.message);
        }
      } catch (error) {
        console.error("Login Error: ", error);
        alert("Server error! Backend check karein.");
      }
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    try {
      const payload = { ...formData, role };

      const response = await fetch('https://lifedaan-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Registration Successful! Please sign in.");
        setIsLogin(true); 
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      console.error("API Error: ", error);
      alert("Server error!");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card-pro">

        <div className="tab-container">
          <button type="button" className={`tab-btn ${isLogin ? 'active-tab' : ''}`} onClick={() => setIsLogin(true)}>
            Sign In
          </button>
          <button type="button" className={`tab-btn ${!isLogin ? 'active-tab' : ''}`} onClick={() => setIsLogin(false)}>
            Register
          </button>
        </div>

        <form className="pro-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>{isLogin ? "Welcome Back 🩸" : "Create an Account"}</h2>
            <p>{isLogin ? "Enter your email address and password to login." : "Join the LifeDaan network and make a difference."}</p>
          </div>

          {!isLogin && (
            <div className="role-selector-pro">
              <label>I am registering as a:</label>
              <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="pro-input">
                <option value="donor">🩸 Blood Donor</option>
                <option value="hospital">🏥 Hospital / Blood Bank</option>
                <option value="patient">👤 Patient / Requester</option>
              </select>
            </div>
          )}

          <div className="form-section-pro">
            <h3 className="section-title">{isLogin ? "Login Credentials" : "Account Details"}</h3>
            <div className="input-grid">

              {!isLogin && (
                <div className="input-group-pro full-width">
                  <label>{role === 'hospital' ? 'Hospital/Organization Name *' : 'Full Name *'}</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" required />
                </div>
              )}

              <div className="input-group-pro">
                <label>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="mail@example.com" required />
              </div>

              {!isLogin && (
                <div className="input-group-pro">
                  <label>Mobile Number *</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="+91 xxxxxxxxxx" required />
                </div>
              )}

              <div className="input-group-pro">
                <label>Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isLogin ? "Enter your password" : "Create password"} required />
              </div>

              {!isLogin && (
                <div className="input-group-pro">
                  <label>Confirm Password *</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" required />
                </div>
              )}
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-section-pro">
                <h3 className="section-title">Medical / Organization Info</h3>
                <div className="input-grid">

                  {role === 'donor' && (
                    <>
                      <div className="input-group-pro">
                        <label>Blood Group *</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="pro-input">
                          <option value="">Select Group</option>
                          <option value="A+">A+ (A Positive)</option>
                          <option value="A-">A- (A Negative)</option>
                          <option value="B+">B+ (B Positive)</option>
                          <option value="B-">B- (B Negative)</option>
                          <option value="AB+">AB+ (AB Positive)</option>
                          <option value="AB-">AB- (AB Negative)</option>
                          <option value="O+">O+ (O Positive)</option>
                          <option value="O-">O- (O Negative)</option>
                        </select>
                      </div>
                      <div className="input-group-pro">
                        <label>Gender *</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required className="pro-input">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="input-group-pro">
                        <label>Age *</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Years (e.g., 25)" min="18" max="65" required />
                      </div>
                      <div className="input-group-pro">
                        <label>Weight (kg) *</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Min 50kg" min="50" required />
                      </div>
                    </>
                  )}

                  {role === 'hospital' && (
                    <>
                      <div className="input-group-pro full-width">
                        <label>Hospital License / Registration No. *</label>
                        <input type="text" name="hospitalLicense" value={formData.hospitalLicense} onChange={handleChange} placeholder="e.g., REG-123456" required />
                      </div>
                      <div className="input-group-pro">
                        <label>Type of Facility *</label>
                        <select name="facilityType" value={formData.facilityType} onChange={handleChange} className="pro-input" required>
                          <option value="">Select Type</option>
                          <option value="Govt Hospital">Government Hospital</option>
                          <option value="Private Hospital">Private Hospital</option>
                          <option value="Blood Bank">Standalone Blood Bank</option>
                        </select>
                      </div>
                      <div className="input-group-pro">
                        <label>Hospital Website URL (Optional)</label>
                        <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://www.yourhospital.com" />
                      </div>
                    </>
                  )}

                  {role === 'patient' && (
                    <div className="input-group-pro full-width">
                      <label>Patient Medical Condition / Reason *</label>
                      <input type="text" name="medicalCondition" value={formData.medicalCondition} onChange={handleChange} placeholder="e.g., Surgery, Accident, Thalassemia" required />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section-pro">
                <h3 className="section-title">Location (For Finding Nearby Matches)</h3>
                <div className="input-grid">
                  <div className="input-group-pro">
                    <label>State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g., Bihar" required />
                  </div>
                  <div className="input-group-pro">
                    <label>District / City *</label>
                    <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="e.g., Patna" required />
                  </div>
                  <div className="input-group-pro full-width">
                    <label>Complete Address / Area *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address or landmark" rows="2" required></textarea>
                  </div>
                  <div className="input-group-pro">
                    <label>Pincode *</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6-digit pincode" required pattern="[0-9]{6}" />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="form-footer-pro">
            <button type="submit" className="pro-submit-btn">
              {isLogin ? "Secure Login" : "Complete Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;