import React, { useState, useEffect } from 'react';

function App() {
  const [apiMessage, setApiMessage] = useState('Loading...');

  useEffect(() => {
    // Fetching from the backend running on port 8000 inside the same container
    fetch('http://localhost:8000/api/test')
      .then(response => response.json())
      .then(data => setApiMessage(data.data))
      .catch(err => setApiMessage('Error connecting to backend: ' + err.message));
  }, []);

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Sandbox React App Active 🚀</h1>
      <div style={{ padding: '20px', marginTop: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Backend API Status:</h3>
        <p style={{ color: apiMessage.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>
          {apiMessage}
        </p>
      </div>
    </div>
  );
}

export default App;