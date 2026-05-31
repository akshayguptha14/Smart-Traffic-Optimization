const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { startSensorSimulation } = require('./services/sensorSimulation');
const huffman = require('./utils/huffman');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Huffman APIs
app.post('/api/huffman/compress', (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'No data provided' });
  
  try {
    const result = huffman.compress(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/huffman/decompress', (req, res) => {
  const { encodedData, tree } = req.body;
  if (!encodedData || !tree) return res.status(400).json({ error: 'Missing data' });
  
  try {
    const result = huffman.decompress(encodedData, tree);
    res.json({ decodedData: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.io integration
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the real-time sensor simulator
startSensorSimulation(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
