import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import './reg.css';
const Home = () => {
  const [email, setEmail] = useState('');
  const [emergency, setEmergency] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !emergency) {
      alert("Please fill both fields!");
      return;
    }

    // Send email to backend
    await fetch('http://localhost:5000/save-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
      localStorage.setItem('userEmail', email);
    localStorage.setItem('emergencyNumber', emergency);

    // Redirect and pass emergency number in state
    navigate('/output');
  };

  return (
    <div className="home-container">
      <h2>Register Emergency Contact</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="Enter Your Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Enter Emergency Number"
          className="input"
          value={emergency}
          onChange={(e) => setEmergency(e.target.value)}
        />
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
      <br />
      <Link to="/" className="back-link">Back</Link>
    </div>
  );
};

export default Home;
