import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Link } from 'react-router-dom';

const Regface = () => {
    const [name, setName] = useState("");
  const [step, setStep] = useState(1); // 1: Name Input, 2: Webcam
  const [imageData, setImageData] = useState(null);
  const webcamRef = useRef(null);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageData(imageSrc);
  };

  const handleSubmit = async () => {
    if (!name || !imageData) return alert("Missing info");

    try {
      await axios.post("http://localhost:5000/register-face", {
        name,
        image: imageData
      });
      alert("Face registered successfully!");
      setStep(1);
      setName("");
      setImageData(null);
    } catch (err) {
      console.error(err);
      alert("Failed to register face.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {step === 1 && (
        <>
          <h2>Enter Your Name</h2>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "10px", fontSize: "16px" }}
          />
          <br /><br />
          <button
            onClick={() => name.trim() ? setStep(2) : alert("Enter a valid name")}
          >
            Next
          </button>
        </>
      )}

      {step === 2 && !imageData && (
        <>
          <h2>Capture Your Face</h2>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            height={240}
            audio={false}
          />
          <br /><br />
          <button onClick={captureImage}>Capture</button>
        </>
      )}

      {imageData && (
        <>
          <h2>Preview</h2>
          <img src={imageData} alt="Captured" width="320" />
          <br /><br />
          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
      <br />
      <br />
      <Link to="/">Back</Link>
    </div>
  );
};

export default Regface