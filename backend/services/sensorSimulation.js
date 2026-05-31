const huffman = require('../utils/huffman');

const LOCATIONS = [
  'Rajajinagar',
  'Peenya',
  'Yeshwanthpur',
  'Jalahalli',
  'Hesaraghatta',
  'Whitefield',
  'Silk_Board'
];

const TRAFFIC_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];

const generateRandomSensorData = () => {
  return LOCATIONS.map((name, index) => {
    // Randomize traffic level with a slight bias towards MEDIUM/LOW
    const rand = Math.random();
    let level;
    if (rand < 0.2) level = 'HIGH';
    else if (rand < 0.6) level = 'MEDIUM';
    else level = 'LOW';

    let vehicleCount, congestion;
    if (level === 'HIGH') {
      vehicleCount = Math.floor(Math.random() * (500 - 300) + 300);
      congestion = Math.floor(Math.random() * (100 - 80) + 80);
    } else if (level === 'MEDIUM') {
      vehicleCount = Math.floor(Math.random() * (300 - 100) + 100);
      congestion = Math.floor(Math.random() * (80 - 40) + 40);
    } else {
      vehicleCount = Math.floor(Math.random() * 100);
      congestion = Math.floor(Math.random() * 40);
    }

    return {
      id: String(index + 1),
      name,
      level,
      vehicleCount,
      congestionPercentage: congestion,
      status: 'Online',
    };
  });
};

const startSensorSimulation = (io) => {
  console.log('Started sensor simulation service with Live Huffman Compression');
  
  // Emit updates every 3 seconds
  setInterval(() => {
    const sensorUpdates = generateRandomSensorData();
    
    // Serialize data into a string separated by spaces to allow tokenization
    const payloadString = sensorUpdates.map(s => `${s.id} ${s.name} ${s.level} ${s.vehicleCount} ${s.congestionPercentage} ${s.status}`).join(' ');
    
    // Compress the serialized string
    const compressed = huffman.compress(payloadString);
    
    // Emit only the compressed data and tree
    io.emit('sensor_update_compressed', {
      encodedData: compressed.encodedData,
      tree: compressed.tree,
      originalString: payloadString,
      metrics: {
        originalBits: compressed.originalBits,
        compressedBits: compressed.compressedBits,
        ratio: compressed.ratio
      },
      timestamp: new Date().toISOString()
    });
  }, 3000);
};

module.exports = {
  startSensorSimulation
};
