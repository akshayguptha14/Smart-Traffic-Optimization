import { useState, useEffect } from 'react';
import { decompress } from '../utils/huffman';

/**
 * Custom hook to manage the real-time Socket.io traffic stream.
 * Automatically handles connection, Huffman decompression, payload parsing,
 * and exposes clean JSON data for any component to consume.
 */
export const useTrafficStream = (activeFilter = 'LIVE') => {
  const [dataPayload, setDataPayload] = useState({
    rawMetrics: { originalBits: 0, compressedBits: 0, ratio: 1 },
    parsedNodes: [], // Array of { name, level, vehicleCount, congestionPercentage, timestamp }
    rawString: "",
    encodedData: "",
    isConnected: false
  });

  useEffect(() => {
    let active = true;

    // Dynamically import socket to avoid initialization issues
    import('../services/socket').then(({ socket }) => {
      // Handle connection states
      socket.on('connect', () => {
        if (active) setDataPayload(prev => ({ ...prev, isConnected: true }));
      });
      
      socket.on('disconnect', () => {
        if (active) setDataPayload(prev => ({ ...prev, isConnected: false }));
      });

      socket.on('sensor_update_compressed', (data) => {
        if (!active || activeFilter !== 'LIVE') return;
        
        try {
          // 1. Decompress Huffman Binary
          const decompressedString = decompress(data?.encodedData, data?.tree) || "";
          const tokens = decompressedString.split(' ');
          
          // 2. Parse Tokens into Structured Array
          const nodes = [];
          for (let i = 0; i < tokens.length; i += 6) {
            if (tokens[i]) {
              nodes.push({
                id: tokens[i] || String(i),
                name: String(tokens[i+1] || 'Unknown'),
                level: tokens[i+2] || 'LOW',
                vehicleCount: parseInt(tokens[i+3] || '0', 10),
                congestionPercentage: parseInt(tokens[i+4] || '0', 10),
                timestamp: new Date().toISOString(),
                status: tokens[i+5] || 'Online'
              });
            }
          }

          // 3. Update State
          setDataPayload({
            rawMetrics: data?.metrics || { originalBits: 0, compressedBits: 0, ratio: 1 },
            parsedNodes: nodes,
            rawString: decompressedString,
            encodedData: data?.encodedData || "",
            isConnected: socket.connected
          });

        } catch (err) {
          console.error("TrafficStream Hook Error:", err);
        }
      });
    });

    return () => { 
      active = false; 
    };
  }, [activeFilter]);

  return dataPayload;
};
