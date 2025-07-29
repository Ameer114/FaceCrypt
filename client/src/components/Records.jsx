import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';

const Records = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/getimg"); // your backend URL
        setRecords(res.data); // set the image records
      } catch (err) {
        console.error("Error fetching images:", err);
      }
    };

    fetchImages();
  }, []);

  return (
    <>
      <div style={{
        fontWeight: 'bold',
        fontSize: '24px',
        position:"fixed",
        top:'20px',
        left:'44vw',
        color: 'black',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Image Records
      </div>
  
      <div style={{
        maxHeight: '100vh',
        overflowY: 'auto',
        padding: '20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginTop:"50px"
        }}>
          {records.length > 0 ? (
            records.map((record, index) => (
              <div key={index} style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fff',
                transition: 'transform 0.3s ease'
              }}>
                <img
                  src={`http://localhost:5000${record.image}`}
                  alt={`Record ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderBottom: '1px solid #ddd'
                  }}
                />
                <div style={{ padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', color: 'black', fontWeight: '600' }}>{record.tm}</p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', fontSize: '18px', color: 'white' }}>No records found.</p>
          )}
        </div>
  
        <div style={{ textAlign: 'center', marginTop: '20px',position:"fixed",
        bottom:'20px',
        left:'47vw' }}>
          <button>
            <Link to="/">Back</Link>
          </button>
        </div>
      </div>
    </>
  );
  
}

export default Records;
