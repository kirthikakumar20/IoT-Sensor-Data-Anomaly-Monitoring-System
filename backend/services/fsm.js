const STATES = {
  NORMAL: 'Normal',
  WARNING: 'Warning',
  FAULTY: 'Faulty',
  DISCONNECTED: 'Disconnected'
};

function classifySensorData(data) {
  const { temperature, humidity, pressure } = data;

  let temperatureStatus = 'Normal';

  if (temperature < 0 || temperature > 50) {
    temperatureStatus = 'Faulty';
  } else if (temperature < 15 || temperature > 35) {
    temperatureStatus = 'Warning';
  }

  let humidityStatus = 'Normal';

  if (humidity < 0 || humidity > 85) {
    humidityStatus = 'Faulty';
  } else if (humidity < 20 || humidity > 70) {
    humidityStatus = 'Warning';
  }

  let pressureStatus = 'Normal';

  if (pressure < 900 || pressure > 1100) {
    pressureStatus = 'Faulty';
  } else if (pressure < 950 || pressure > 1050) {
    pressureStatus = 'Warning';
  }

  const statuses = [
    temperatureStatus,
    humidityStatus,
    pressureStatus
  ];

  if (statuses.includes('Faulty')) {
    return STATES.FAULTY;
  }

  if (statuses.includes('Warning')) {
    return STATES.WARNING;
  }

  return STATES.NORMAL;
}

function getNextState(currentState, newState) {
  const validStates = Object.values(STATES);

  if (!validStates.includes(currentState)) {
    return STATES.DISCONNECTED;
  }

  if (!validStates.includes(newState)) {
    return currentState;
  }

  return newState;
}

module.exports = {
  STATES,
  classifySensorData,
  getNextState
};