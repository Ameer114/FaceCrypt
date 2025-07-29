import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Outputpage.css'; // Import the new CSS file

const Outputpage = () => {
 const [emergency, setEmergency] = useState('');

useEffect(() => {
  const storedEmergency = localStorage.getItem('emergencyNumber');
  if (storedEmergency) {
    setEmergency(storedEmergency);
  }
}, []);


  const [imageUrl, setImageUrl] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [lastImageFile, setLastImageFile] = useState('');
  const [initialImageFile, setInitialImageFile] = useState('');

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/latest-image')
      .then((res) => res.json())
      .then((data) => {
        setInitialImageFile(data.imageUrl);
        setLastImageFile(data.imageUrl);
      })
      .catch((err) => console.error('Initial image fetch failed', err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:5000/latest-image')
        .then((res) => res.json())
        .then((data) => {
          const newFile = data.imageUrl;
          if (newFile !== lastImageFile) {
            setLastImageFile(newFile);
            if (newFile !== initialImageFile) {
              setImageUrl(`http://localhost:5000${newFile}?t=${Date.now()}`);
              setShowImage(true);

              if (Notification.permission === 'granted') {
                new Notification('📸 New Image Received!', {
                  body: 'Click to view the latest image.',
                  icon: `http://localhost:5000${newFile}?t=${Date.now()}`,
                });
              }
            }
          }
        })
        .catch((err) => console.error('Polling error:', err));
    }, 3000);

    return () => clearInterval(interval);
  }, [lastImageFile, initialImageFile]);

  const handleHide = () => setShowImage(false);

  return (
    <div className="output-page-container">
      {showImage ? (
        <div className="image-container">
          <img
            src={imageUrl}
            alt="Latest face"
            className="latest-image"
          />
          <button onClick={handleHide} className="hide-button">Hide Image</button>
        </div>
      ) : (
        <p className="waiting-text">Waiting for new image...</p>
      )}

      {emergency ? (
        <a href={`tel:${emergency}`} className="emergency-button">
          <button className="button">📞 Emergency SOS</button>
        </a>
      ) : (
        <p className="no-emergency-text">No emergency number provided.</p>
      )}

      
        <button className="button door-button" onClick={() => {
    fetch("http://192.168.81.130/toggle")  // 👈 ESP32 ka IP address yahan do
      .then((res) => {
        if (res.ok) {
          console.log("✅ Request sent to ESP32!");
          alert("Door opened");
        } else {
          console.log("❌ Failed to send request.");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }}>Open Door 🚪</button>
<br/>      

      <Link to="/" className="home-link">
        <button className="home-button">🏠 Home</button>
      </Link>
    </div>
  );
};

export default Outputpage;
