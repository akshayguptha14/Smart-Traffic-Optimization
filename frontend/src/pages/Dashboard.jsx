import React, { useState, useEffect } from 'react';
import { Activity, Zap, HardDrive, Share2, MapPin, AlertCircle, Clock, CheckCircle2, AlertTriangle, Route, FileJson, Binary, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';
import { decompress } from '../utils/huffman';
import ErrorBoundary from '../components/ErrorBoundary';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';
import { useTrafficStream } from '../hooks/useTrafficStream';
import { useNavigate } from 'react-router-dom';

// --- Initial Data ---
const initialTrafficLocations = [
  { id: '1', name: 'Rajajinagar', level: 'LOW', status: 'Offline', timestamp: 'Waiting for data...', vehicleCount: 0, congestionPercentage: 0 },
  { id: '2', name: 'Peenya', level: 'LOW', status: 'Offline', timestamp: 'Waiting for data...', vehicleCount: 0, congestionPercentage: 0 },
  { id: '3', name: 'Yeshwanthpur', level: 'LOW', status: 'Offline', timestamp: 'Waiting for data...', vehicleCount: 0, congestionPercentage: 0 },
  { id: '4', name: 'Jalahalli', level: 'LOW', status: 'Offline', timestamp: 'Waiting for data...', vehicleCount: 0, congestionPercentage: 0 },
  { id: '5', name: 'Hesaraghatta', level: 'LOW', status: 'Offline', timestamp: 'Waiting for data...', vehicleCount: 0, congestionPercentage: 0 },
  { id: '6', name: 'Whitefield', level: 'LOW', status: 'Offline', timestamp: 'Waiting for data...', vehicleCount: 0, congestionPercentage: 0 },
  { id: '7', name: 'Silk Board', level: 'LOW', status: 'Offline', timestamp: 'Waiting for data...', vehicleCount: 0, congestionPercentage: 0 },
];

const densityData = [
  { time: '08:00', density: 40 }, { time: '09:00', density: 85 }, { time: '10:00', density: 95 },
  { time: '11:00', density: 70 }, { time: '12:00', density: 60 }, { time: '13:00', density: 50 },
  { time: '14:00', density: 55 }, { time: '15:00', density: 65 }, { time: '16:00', density: 80 },
  { time: '17:00', density: 100 }, { time: '18:00', density: 90 }, { time: '19:00', density: 75 },
];

const bandwidthData = [
  { node: 'Rajajinagar', saved: 450 }, { node: 'Peenya', saved: 800 }, { node: 'Yeshwanthpur', saved: 320 },
  { node: 'Whitefield', saved: 950 }, { node: 'Silk Board', saved: 700 },
];

const initialLiveAlerts = [
  { id: 1, type: 'info', message: 'System initialized. Waiting for compressed sensor data...', time: 'Just now' }
];

// --- Subcomponents ---
const StatCard = ({ title, value, icon, subtitle, colorClass }) => (
  <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/10 group cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl transition-colors ${colorClass}`}>
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-bold text-slate-100 tracking-tight">{value}</h3>
      <p className="text-sm font-medium text-slate-400 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const TrafficCard = ({ location }) => {
  const getLevelColor = (level) => {
    switch (level) {
      case 'LOW': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'HIGH': return 'text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'Online' ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-amber-400" />;
  };

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <MapPin size={16} className="text-blue-400" />
          <h4 className="font-semibold text-slate-200">{location.name.replace('_', ' ')}</h4>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-bold tracking-wide border ${getLevelColor(location.level)} transition-colors duration-500`}>
          {location.level}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mt-4">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1 flex items-center"><Activity size={12} className="mr-1" /> Vehicles</span>
          <span className="text-slate-300 font-medium">{location.vehicleCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1 flex items-center"><Clock size={12} className="mr-1" /> Congestion</span>
          <span className="text-slate-300 font-medium">{location.congestionPercentage}%</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500 flex justify-between items-center">
        <span className="flex items-center space-x-1">
          {getStatusIcon(location.status)}
          <span>{location.status}</span>
        </span>
        <span>{location.timestamp !== 'Waiting for data...' ? new Date(location.timestamp).toLocaleTimeString() : location.timestamp}</span>
      </div>
    </div>
  );
};

// --- Main Dashboard ---
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState(initialTrafficLocations);
  const [alerts, setAlerts] = useState(initialLiveAlerts);
  
  // Real-time Compression Metrics
  const [metrics, setMetrics] = useState({
    originalBits: 0,
    compressedBits: 0,
    ratio: 0,
    totalSavedBits: 0,
  });
  
  // Live Data strings for the feed panel
  const [liveStream, setLiveStream] = useState({ original: '', compressed: '' });

  // History for ratio chart
  const [ratioHistory, setRatioHistory] = useState([{ time: 'Init', ratio: 1 }]);

  const { parsedNodes, rawMetrics, rawString, encodedData, isConnected } = useTrafficStream();

  useEffect(() => {
    if (!parsedNodes || parsedNodes.length === 0) return;

    setLoading(false);
    
    // 1. Update locations & check for HIGH alerts
    setLocations(prevLocations => {
      parsedNodes.forEach(newSensor => {
        const oldSensor = prevLocations.find(p => p.name === newSensor.name);
        if (oldSensor && oldSensor.level !== 'HIGH' && newSensor.level === 'HIGH') {
          const alertMsg = `Traffic spike at ${newSensor.name.replace('_',' ')}! Congestion at ${newSensor.congestionPercentage}%`;
          toast.error(alertMsg, { icon: '🚨', id: newSensor.name });
          setAlerts(curr => [{
            id: Date.now() + Math.random(),
            type: 'critical',
            message: alertMsg,
            time: new Date().toLocaleTimeString()
          }, ...curr.slice(0, 4)]);
        }
      });
      return parsedNodes;
    });

    // 2. Update Metrics safely
    setMetrics(prev => ({
      originalBits: rawMetrics.originalBits,
      compressedBits: rawMetrics.compressedBits,
      ratio: rawMetrics.ratio,
      totalSavedBits: prev.totalSavedBits + (rawMetrics.originalBits - rawMetrics.compressedBits)
    }));

    // 3. Update Live Data Feed Stream
    setLiveStream({
      original: rawString,
      compressed: encodedData || ""
    });

    // 4. Update History
    setRatioHistory(prev => {
      const next = [...prev, { time: new Date().toLocaleTimeString().split(' ')[0], ratio: rawMetrics.ratio }];
      if (next.length > 15) next.shift();
      return next;
    });

  }, [parsedNodes, rawMetrics, rawString]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        <h2 className="text-xl font-medium text-slate-400 animate-pulse">Initializing Huffman Engine...</h2>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 pb-10">
        {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            System Dashboard
          </h2>
          <p className="text-slate-400 mt-1 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
            Receiving Huffman Compressed Live Data
          </p>
        </div>
      </div>

      {/* Top Stats - Real-time Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Original Data Size" 
          value={`${metrics.originalBits} bits`} 
          icon={<FileJson size={24} className="text-blue-400" />} 
          subtitle="Latest uncompressed payload"
          colorClass="bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400"
        />
        <StatCard 
          title="Compressed Size" 
          value={`${metrics.compressedBits} bits`} 
          icon={<Binary size={24} className="text-emerald-400" />} 
          subtitle="Latest Huffman payload"
          colorClass="bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400"
        />
        <StatCard 
          title="Compression Efficiency" 
          value={`${metrics.ratio}x`} 
          icon={<Zap size={24} className="text-amber-400" />} 
          subtitle="Average mathematical ratio"
          colorClass="bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400"
        />
        <StatCard 
          title="Total Bandwidth Saved" 
          value={`${(metrics.totalSavedBits / 8000).toFixed(2)} KB`} 
          icon={<HardDrive size={24} className="text-purple-400" />} 
          subtitle="Cumulative session savings"
          colorClass="bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Locations Panel */}
        <div className="lg:col-span-2 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center">
              <MapPin size={18} className="mr-2 text-blue-400" />
              Live Traffic Status (Decompressed)
            </h3>
            <button 
              onClick={() => {
                navigate('/routes');
                toast.success('Loading Live Traversal Matrix Map...', { icon: '🗺️', id: 'view-map-nav' });
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View Map
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <TrafficCard key={loc.id} location={loc} />
            ))}
          </div>
        </div>

        {/* Live Compression Feed & Alerts */}
        <div className="space-y-6">
          
          {/* Live Compression Updates Panel */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
              <Binary size={18} className="mr-2 text-emerald-400" />
              Live Compression Feed
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Original Data Packet</span>
                <div className="bg-slate-900/80 p-2 mt-1 rounded-lg border border-slate-700/50 font-mono text-xs text-slate-400 break-all h-16 overflow-hidden">
                  {liveStream.original || "Waiting..."}
                </div>
              </div>
              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-emerald-500/20 p-1 rounded-full border border-emerald-500/50">
                  <ArrowRight size={14} className="text-emerald-400 rotate-90" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-500/80 uppercase tracking-wider font-semibold">Compressed Binary Stream</span>
                  {liveStream.compressed && (
                    <span className="text-[10px] font-mono text-emerald-500/70 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">{liveStream.compressed.length} bits</span>
                  )}
                </div>
                <div className="bg-emerald-900/20 p-3 mt-1 rounded-lg border border-emerald-500/30 font-mono text-xs text-emerald-400 break-all h-20 overflow-y-auto shadow-[inset_0_0_10px_rgba(16,185,129,0.05)] select-all leading-relaxed scrollbar-thin scrollbar-thumb-emerald-500/20">
                  {liveStream.compressed 
                    ? (liveStream.compressed.match(/.{1,8}/g)?.join(' ') || liveStream.compressed) 
                    : "Waiting..."}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 opacity-65"></span>
                  Formatted in 8-bit byte blocks for standard transmission packet clarity.
                </p>
              </div>
            </div>
          </div>

          {/* Live Alerts */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
              <AlertCircle size={18} className="mr-2 text-rose-400" />
              Live System Alerts
            </h3>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className={`mt-0.5 rounded-full p-1 ${
                    alert.type === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                    alert.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {alert.type === 'critical' ? <AlertTriangle size={14} /> :
                     alert.type === 'warning' ? <AlertCircle size={14} /> :
                     <Activity size={14} />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 leading-snug">{alert.message}</p>
                    <span className="text-xs text-slate-500 mt-1 block">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compression Ratio Chart */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
            <Zap size={18} className="mr-2 text-emerald-400" />
            Live Huffman Compression Ratio
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratioHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="ratio" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Density Chart */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center">
              <Activity size={18} className="mr-2 text-blue-400" />
              Historical Density Trends
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={densityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="density" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDensity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </div>

    </PageTransition>
  );
};

const DashboardWithErrorBoundary = () => (
  <ErrorBoundary>
    <Dashboard />
  </ErrorBoundary>
);

export default DashboardWithErrorBoundary;
