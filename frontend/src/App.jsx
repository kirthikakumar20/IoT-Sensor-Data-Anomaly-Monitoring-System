import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_URL = 'https://iot-sensor-data-anomaly-monitoring.vercel.app';
function App() {
  const [sensors, setSensors] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch sensor data from backend
  const fetchSensors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sensors`);
      setSensors(response.data.sensors);
      setError('');
    } catch (err) {
      setError('Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  // Automatically refresh sensor data every 5 seconds
  useEffect(() => {
    fetchSensors();

    const interval = setInterval(fetchSensors, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate device status count
  const normalCount = sensors.filter(
    sensor => sensor.status === 'Normal'
  ).length;

  const warningCount = sensors.filter(
    sensor => sensor.status === 'Warning'
  ).length;

  const faultyCount = sensors.filter(
    sensor => sensor.status === 'Faulty'
  ).length;

  const disconnectedCount = sensors.filter(
    sensor => sensor.status === 'Disconnected'
  ).length;

  // Submit sensor reading
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFeedback('');
    setError('');

    const regex =
      /^\s*TEMP\s*=\s*(-?\d+(?:\.\d+)?)\s*;\s*HUM\s*=\s*(-?\d+(?:\.\d+)?)\s*;\s*PRESS\s*=\s*(-?\d+(?:\.\d+)?)\s*$/i;

    if (!deviceId.trim() || !regex.test(message)) {
      setError(
        'Enter a valid Device ID and message: TEMP=28;HUM=55;PRESS=1012'
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/sensors/readings`,
        {
          deviceId: deviceId.trim(),
          message: message.trim()
        }
      );

      setFeedback(response.data.message);
      setDeviceId('');
      setMessage('');

      fetchSensors();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to save sensor reading.'
      );
    }
  };

  return (
    <div className="dashboard">

      <header className="header">
        <div>
          <h1>IoT Sensor Monitoring</h1>
          <p>Real-Time Anomaly Detection Dashboard</p>
        </div>
        <span className="live-status">● System Active</span>
      </header>

      <section className="summary">

        <div className="summary-card">
          <h3>Total Devices</h3>
          <h2>{sensors.length}</h2>
        </div>

        <div className="summary-card">
          <h3>Normal</h3>
          <h2>{normalCount}</h2>
        </div>

        <div className="summary-card">
          <h3>Warning</h3>
          <h2>{warningCount}</h2>
        </div>

        <div className="summary-card">
          <h3>Faulty</h3>
          <h2>{faultyCount}</h2>
        </div>

        <div className="summary-card">
          <h3>Disconnected</h3>
          <h2>{disconnectedCount}</h2>
        </div>

      </section>

      <h2 className="section-title">Add Sensor Reading</h2>

      <form className="sensor-form" onSubmit={handleSubmit}>

        <label>Device ID</label>
        <input
          type="text"
          placeholder="Example: IOT001"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        />

        <label>Sensor Message</label>
        <input
          type="text"
          placeholder="TEMP=28;HUM=55;PRESS=1012"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button type="submit">Submit Reading</button>

        {feedback && <p className="success-message">{feedback}</p>}
        {error && <p className="error-message">{error}</p>}

      </form>

      <h2 className="section-title">Device Information</h2>

      {loading && <p>Loading sensor data...</p>}

      {!loading && sensors.length === 0 && (
        <p>No sensor devices available.</p>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Temperature</th>
              <th>Humidity</th>
              <th>Pressure</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {sensors.map((sensor) => (
              <tr key={sensor.deviceId}>
                <td>{sensor.deviceId}</td>
                <td>{sensor.temperature ?? '--'} °C</td>
                <td>{sensor.humidity ?? '--'} %</td>
                <td>{sensor.pressure ?? '--'} hPa</td>
                <td>
                  <span className={`status ${sensor.status.toLowerCase()}`}>
                    {sensor.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
<h2 className="section-title">Sensor Readings Chart</h2>

<div className="table-container" style={{ height: '350px', padding: '20px' }}>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={sensors}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="deviceId" />
      <YAxis />
      <Tooltip />
      <Legend />

      <Bar dataKey="temperature" fill="#2563eb" name="Temperature (°C)" />
      <Bar dataKey="humidity" fill="#16a34a" name="Humidity (%)" />
      <Bar dataKey="pressure" fill="#f59e0b" name="Pressure (hPa)" />
    </BarChart>
  </ResponsiveContainer>
</div>
      <h2 className="section-title">Alerts</h2>

      <div className="table-container">
        {sensors.filter(
          sensor => sensor.status !== 'Normal'
        ).length === 0 ? (
          <p>No active alerts.</p>
        ) : (
          sensors.filter(
            sensor => sensor.status !== 'Normal'
          ).map(sensor => (
            <p key={sensor.deviceId}>
              ⚠️ {sensor.deviceId} - {sensor.status}
            </p>
          ))
        )}
      </div>

      <footer>
        IoT Sensor Data Anomaly Monitoring System
      </footer>

    </div>
  );
}

export default App;