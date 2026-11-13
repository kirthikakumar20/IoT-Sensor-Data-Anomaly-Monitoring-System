const express = require('express');
const router = express.Router();

const Sensor = require('../models/Sensor');

const {
  classifySensorData,
  getNextState
} = require('../services/fsm');

// Device disconnect timeout: 60 seconds
const DISCONNECT_TIMEOUT = 60 * 1000;

// Regex validation for sensor message
// Example: TEMP=28;HUM=55;PRESS=1012
const sensorMessageRegex =
  /^\s*TEMP\s*=\s*(-?\d+(?:\.\d+)?)\s*;\s*HUM\s*=\s*(-?\d+(?:\.\d+)?)\s*;\s*PRESS\s*=\s*(-?\d+(?:\.\d+)?)\s*$/i;


// POST: Receive and save sensor readings
router.post('/readings', async (req, res) => {
  try {
    const { deviceId, message } = req.body;

    if (!deviceId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Device ID and sensor message are required'
      });
    }

    if (typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Sensor message must be a string'
      });
    }

    // Validate device ID
    if (!/^[A-Za-z0-9_-]+$/.test(deviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Device ID'
      });
    }

    // Validate message using Regex
    const match = message.match(sensorMessageRegex);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Use TEMP=28;HUM=55;PRESS=1012'
      });
    }

    // Extract sensor values
    const temperature = Number(match[1]);
    const humidity = Number(match[2]);
    const pressure = Number(match[3]);

    if (
      !Number.isFinite(temperature) ||
      !Number.isFinite(humidity) ||
      !Number.isFinite(pressure)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Sensor values must be valid numbers'
      });
    }

    // Classify sensor data using FSM
    const newState = classifySensorData({
      temperature,
      humidity,
      pressure
    });

    // Find existing device
    let sensor = await Sensor.findOne({ deviceId });

    if (!sensor) {
      sensor = new Sensor({ deviceId });
    }

    const previousState = sensor.status;

    // Get next FSM state
    const nextState = getNextState(previousState, newState);

    // Update latest readings
    sensor.temperature = temperature;
    sensor.humidity = humidity;
    sensor.pressure = pressure;
    sensor.status = nextState;
    sensor.lastSeen = new Date();
    sensor.message = message;

    // Store reading history
    sensor.readings.push({
      temperature,
      humidity,
      pressure,
      recordedAt: new Date()
    });

    // Keep only the latest 100 readings
    if (sensor.readings.length > 100) {
      sensor.readings.shift();
    }

    // Store state transition history
    if (previousState !== nextState) {
      sensor.stateHistory.push({
        previousState,
        newState: nextState,
        changedAt: new Date()
      });
    }

    await sensor.save();

    res.status(201).json({
      success: true,
      message: 'Sensor reading saved successfully',
      sensor
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// Update disconnected devices
async function updateDisconnectedSensors() {
  const sensors = await Sensor.find();

  for (const sensor of sensors) {
    const isDisconnected =
      !sensor.lastSeen ||
      Date.now() - new Date(sensor.lastSeen).getTime() >
      DISCONNECT_TIMEOUT;

    if (isDisconnected && sensor.status !== 'Disconnected') {
      const previousState = sensor.status;

      sensor.status = 'Disconnected';

      sensor.stateHistory.push({
        previousState,
        newState: 'Disconnected',
        changedAt: new Date()
      });

      await sensor.save();
    }
  }
}


// GET: Retrieve all sensors
router.get('/', async (req, res) => {
  try {
    await updateDisconnectedSensors();

    const sensors = await Sensor.find().sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: sensors.length,
      sensors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// GET: Retrieve alerts
router.get('/alerts', async (req, res) => {
  try {
    await updateDisconnectedSensors();

    const alerts = await Sensor.find({
      status: { $in: ['Warning', 'Faulty', 'Disconnected'] }
    });

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// GET: Retrieve one device
router.get('/:deviceId', async (req, res) => {
  try {
    await updateDisconnectedSensors();

    const sensor = await Sensor.findOne({
      deviceId: req.params.deviceId
    });

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor device not found'
      });
    }

    res.json({
      success: true,
      sensor
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;