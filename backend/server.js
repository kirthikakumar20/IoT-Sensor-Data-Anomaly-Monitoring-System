const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Atlas Connected Successfully');
}

// Connect to MongoDB before processing API requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MongoDB connection failed'
    });
  }
});

// Sensor routes
const sensorRoutes = require('./routes/sensorRoutes');
app.use('/api/sensors', sensorRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('IoT Sensor Monitoring API is Running');
});

// Local development server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;