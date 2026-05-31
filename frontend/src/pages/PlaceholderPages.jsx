import React from 'react';

const PlaceholderPage = ({ title, description }) => (
  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
    <h2 className="text-3xl font-bold text-slate-100">{title}</h2>
    <p className="text-slate-400 max-w-lg">{description}</p>
    <div className="mt-8 p-6 bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl h-64 flex items-center justify-center">
      <span className="text-slate-500">Component Construction Area</span>
    </div>
  </div>
);

export const SensorMonitoring = () => (
  <PlaceholderPage 
    title="Sensor Monitoring Network" 
    description="Visualize individual traffic nodes, their signal status, and historical delay data across Bengaluru."
  />
);

export const RouteOptimization = () => (
  <PlaceholderPage 
    title="Dijkstra / A* Route Optimization" 
    description="Interactive map showing shortest paths and dynamically rerouted paths based on real-time traffic weights."
  />
);

export const HuffmanVisualization = () => (
  <PlaceholderPage 
    title="Huffman Coding Engine" 
    description="Live demonstration of data compression using Huffman Trees. Watch JSON traffic payloads get compressed."
  />
);

export const Analytics = () => (
  <PlaceholderPage 
    title="System Analytics" 
    description="Historical charts, peak congestion times, and bandwidth savings over time using Recharts."
  />
);
