import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("🎉 Thank you for contacting LifeDaan! Our support team will get back to you shortly.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      
      {/* 🟢 Hero Header */}
      <div className="contact-header">
        <h1>Get in Touch 📩</h1>
        <p>Have questions, feedback, or need urgent assistance? The LifeDaan support team is available 24/7 to help you.</p>
      </div>

      <div className="contact-container">
        
        {/* 🟢 Contact Info Cards */}
        <div className="contact-info">
          <div className="info-card">
            <span className="info-icon">📍</span>
            <h3>Head Office</h3>
            <p>New Moradabad<br/>Uttar Pradesh 244103</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📞</span>
            <h3>24/7 Helpline</h3>
            <p>Emergency: +91 8077204093<br/>Support: +91 7903785309</p>
          </div>
          <div className="info-card">
            <span className="info-icon">✉️</span>
            <h3>Email Support</h3>
            <p>lifedaan.contact@gmail.com<br/>lifedaan.contact@gmail.com</p>
          </div>
        </div>

        {/* Form & Map Layout */}
        <div className="contact-bottom">
          
          {/* Contact Form */}
          <div className="contact-form-container">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="input-group">
                <label>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., John Doe" />
              </div>
              <div className="input-group">
                <label>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="mail@example.com" />
              </div>
              <div className="input-group">
                <label>Subject *</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="How can we help?" />
              </div>
              <div className="input-group">
                <label>Message *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Write your message here..."></textarea>
              </div>
              <button type="submit" className="btn-submit-contact">Send Message 🚀</button>
            </form>
          </div>

          {/* Google Map Embedded */}
          <div className="contact-map">
            <iframe
              title="LifeDaan HQ"
              src="https://www.google.com/maps?q=New+Moradabad,+Uttar+Pradesh+244103&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '15px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;