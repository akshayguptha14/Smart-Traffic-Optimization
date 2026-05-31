import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, BarChart2, Zap, Clock, Box, GitMerge, FileJson, Binary, Filter } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useTrafficStream } from '../hooks/useTrafficStream';

// --- Initial Seed Data for Instant Realistic UI ---
const initialRatioData = [
  { time: '10:00', ratio: 6.2 }, { time: '10:05', ratio: 7.1 }, { time: '10:10', ratio: 5.8 },
  { time: '10:15', ratio: 8.4 }, { time: '10:20', ratio: 9.1 }, { time: '10:25', ratio: 7.6 },
];

const initialCongestionData = [
  { time: '10:00', avgCongestion: 45 }, { time: '10:05', avgCongestion: 52 }, { time: '10:10', avgCongestion: 68 },
  { time: '10:15', avgCongestion: 85 }, { time: '10:20', avgCongestion: 79 }, { time: '10:25', avgCongestion: 61 },
];

const COLORS = { HIGH: '#f43f5e', MEDIUM: '#fbbf24', LOW: '#10b981' };

const Analytics = () => {
  const [filter, setFilter] = useState('LIVE'); // 'LIVE' | '1H' | '24H'
  
  // Chart States
  const [ratioTrends, setRatioTrends] = useState(initialRatioData);
  const [congestionTrends, setCongestionTrends] = useState(initialCongestionData);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([{ name: 'LOW', value: 100 }]);
  
  // Summary States
  const [summary, setSummary] = useState({
    totalRaw: 0,
    totalCompressed: 0,
    avgRatio: 0,
    liveCongestion: 0
  });

  const { parsedNodes, rawMetrics } = useTrafficStream(filter);

  useEffect(() => {
    if (!parsedNodes || parsedNodes.length === 0 || filter !== 'LIVE') return;
    
    let totalCongestion = 0;
    const levels = { HIGH: 0, MEDIUM: 0, LOW: 0 };

    parsedNodes.forEach(node => {
      totalCongestion += node.congestionPercentage;
      levels[node.level] = (levels[node.level] || 0) + 1;
    });

    const timeStr = new Date().toLocaleTimeString().split(' ')[0];
    const nodeCount = parsedNodes.length;

    // 1. Update Pie Chart (Sensor Activity)
    setPieData([
      { name: 'HIGH', value: levels.HIGH },
      { name: 'MEDIUM', value: levels.MEDIUM },
      { name: 'LOW', value: levels.LOW },
    ].filter(item => item.value > 0));

    // 2. Update Bar Chart (Top Congested Areas)
    const sortedNodes = [...parsedNodes].sort((a, b) => b.vehicleCount - a.vehicleCount);
    setBarData(sortedNodes);

    // 3. Update Area Chart (Congestion Trends)
    const avgCongestion = nodeCount > 0 ? Math.round(totalCongestion / nodeCount) : 0;
    setCongestionTrends(prev => {
      const next = [...prev, { time: timeStr, avgCongestion }];
      if (next.length > 10) next.shift();
      return next;
    });

    // 4. Update Line Chart (Compression Ratio)
    setRatioTrends(prev => {
      const next = [...prev, { time: timeStr, ratio: rawMetrics?.ratio || 1 }];
      if (next.length > 10) next.shift();
      return next;
    });

    // 5. Update Summary Counters
    setSummary(prev => {
      const newRaw = prev.totalRaw + (rawMetrics?.originalBits || 0);
      const newComp = prev.totalCompressed + (rawMetrics?.compressedBits || 0);
      return {
        totalRaw: newRaw,
        totalCompressed: newComp,
        avgRatio: newComp > 0 ? (newRaw / newComp).toFixed(2) : 1,
        liveCongestion: avgCongestion
      };
    });

  }, [parsedNodes, rawMetrics, filter]);

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-300 text-xs mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-bold" style={{ color: entry.color || entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <PageTransition>
      <div className="space-y-6 pb-10">
        
        {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <BarChart2 className="text-cyan-400" size={32} />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Advanced Data Analytics
            </h2>
          </div>
          <p className="text-slate-400 mt-1">
            Deep-dive metrics on Huffman compression efficiency and historical traffic patterns.
          </p>
        </div>
        
        {/* Dashboard Filters */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/50">
          <Filter size={16} className="text-slate-500 mx-2" />
          {['LIVE', '1H', '24H'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-transparent'}`}
            >
              {f === 'LIVE' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Top Summary Counters (Original vs Compressed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Raw Streamed</p>
            <p className="text-2xl font-bold text-slate-200">{(summary.totalRaw / 8000).toFixed(2)} <span className="text-sm font-normal text-slate-500">KB</span></p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl text-slate-400"><FileJson size={24} /></div>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Compressed</p>
            <p className="text-2xl font-bold text-emerald-400">{(summary.totalCompressed / 8000).toFixed(2)} <span className="text-sm font-normal text-emerald-600">KB</span></p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Binary size={24} /></div>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-sm text-slate-400 mb-1">Global Avg Ratio</p>
            <p className="text-2xl font-bold text-cyan-400">{summary.avgRatio}x</p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><GitMerge size={24} /></div>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-sm text-slate-400 mb-1">Live Avg Congestion</p>
            <p className="text-2xl font-bold text-rose-400">{summary.liveCongestion}%</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><Activity size={24} /></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Line Chart: Compression Ratio Trends */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <GitMerge size={18} className="mr-2 text-cyan-400" />
            Compression Ratio Trends
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratioTrends} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="ratio" name="Ratio" stroke="#22d3ee" strokeWidth={4} dot={{ r: 4, fill: '#22d3ee', stroke: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Area Chart: Traffic Congestion Trends */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <Activity size={18} className="mr-2 text-rose-400" />
            Traffic Congestion Trends (Avg %)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={congestionTrends} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avgCongestion" name="Congestion %" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCongestion)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Bar Chart: Most Congested Areas */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <BarChart2 size={18} className="mr-2 text-emerald-400" />
            Most Congested Nodes (Vehicle Count)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="vehicleCount" name="Vehicles" fill="#10b981" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.congestion > 80 ? '#f43f5e' : entry.congestion > 50 ? '#fbbf24' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Pie Chart: Sensor Activity Statistics */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg flex flex-col">
          <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
            <Zap size={18} className="mr-2 text-yellow-400" />
            Sensor Activity Statistics
          </h3>
          <p className="text-xs text-slate-400 mb-4">Real-time distribution of congestion severity across all active endpoints.</p>
          
          <div className="flex-1 w-full flex items-center justify-center relative min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-bold text-slate-200">{pieData.reduce((a, b) => a + b.value, 0)}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Nodes</span>
            </div>
          </div>
        </div>

      </div>
    </div>
    </PageTransition>
  );
};

export default Analytics;
