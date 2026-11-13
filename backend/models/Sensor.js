const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    temperature: {
      type: Number,
      default: null
    },

    humidity: {
      type: Number,
      default: null
    },

    pressure: {
      type: Number,
      default: null
    },

    status: {
      type: String,
      enum: ['Normal', 'Warning', 'Faulty', 'Disconnected'],
      default: 'Disconnected'
    },

    lastSeen: {
      type: Date,
      default: null
    },

    message: {
      type: String,
      default: ''
    },

    readings: [
      {
        temperature: Number,
        humidity: Number,
        pressure: Number,
        recordedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    stateHistory: [
      {
        previousState: String,
        newState: String,
        changedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Sensor', sensorSchema);