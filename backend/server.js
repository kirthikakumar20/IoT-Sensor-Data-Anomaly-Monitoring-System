const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// Sensor routes
const sensorRoutes = require('./routes/sensorRoutes');

app.use('/api/sensors', sensorRoutes);


// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas Connected Successfully');
  })
  .catch((error) => {
    console.log('MongoDB Connection Error:', error.message);
  });

// Test route
app.get('/', (req, res) => {
  res.send('IoT Sensor Monitoring API is Running');
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});