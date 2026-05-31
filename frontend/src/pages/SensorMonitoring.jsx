import React, { useState, useEffect } from 'react';
import { Activity, MapPin, CheckCircle2, AlertTriangle, Search, Filter, Server, WifiOff, Car } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useTrafficStream } from '../hooks/useTrafficStream';
import { useSearchParams } from 'react-router-dom';

const SensorCard = ({ node }) => {
  const isHigh = node.level === 'HIGH';
  const isMedium = node.level === 'MEDIUM';
  const isOffline = node.status === 'Offline';

  const getBorderColor = () => {
    if (isOffline) return 'border-slate-700/50';
    if (isHigh) return 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
    if (isMedium) return 'border-amber-500/40';
    return 'border-emerald-500/40';
  };

  const getBgColor = () => {
    if (isOffline) return 'bg-slate-800/40';
    if (isHigh) return 'bg-rose-950/20';
    if (isMedium) return 'bg-amber-950/10';
    return 'bg-emerald-950/10';
  };

  return (
    <div className={`rounded-2xl p-5 border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${getBorderColor()} ${getBgColor()}`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isOffline ? 'bg-slate-800 text-slate-500' : isHigh ? 'bg-rose-500/20 text-rose-400' : isMedium ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <Server size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-lg leading-tight">{node.name.replace('_', ' ')}</h3>
            <span className="text-xs font-mono text-slate-500">ID: NODE-{node.id.padStart(4, '0')}</span>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border 
          ${isOffline ? 'bg-slate-800 text-slate-500 border-slate-700' : 
            isHigh ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
            isMedium ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
          {isOffline ? 'OFFLINE' : node.level}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center text-slate-400 mb-1">
            <Car size={14} className="mr-1.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Vehicles</span>
          </div>
          <p className={`text-xl font-bold ${isOffline ? 'text-slate-600' : 'text-slate-200'}`}>
            {isOffline ? '--' : node.vehicleCount}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
           <div className="flex items-center text-slate-400 mb-1">
            <Activity size={14} className="mr-1.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Congestion</span>
          </div>
          <p className={`text-xl font-bold ${isOffline ? 'text-slate-600' : isHigh ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isOffline ? '--' : `${node.congestionPercentage}%`}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 mb-4 overflow-hidden border border-slate-800">
        <div 
          className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
            isHigh ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 
            isMedium ? 'bg-amber-500' : 
            'bg-emerald-500'
          }`}
          style={{ width: isOffline ? '0%' : `${node.congestionPercentage}%` }}
        ></div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs">
        <div className={`flex items-center ${isOffline ? 'text-slate-500' : 'text-emerald-500'}`}>
          {isOffline ? <WifiOff size={12} className="mr-1" /> : <CheckCircle2 size={12} className="mr-1" />}
          <span className="font-medium">{isOffline ? 'Connection Lost' : 'Streaming Active'}</span>
        </div>
        <span className="text-slate-500 font-mono">
          {isOffline ? 'N/A' : new Date(node.timestamp).toLocaleTimeString()}
        </span>
      </div>

    </div>
  );
};

const SensorMonitoring = () => {
  const { parsedNodes, isConnected } = useTrafficStream('LIVE');
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filterLevel, setFilterLevel] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW

  // Sync searchQuery when search query parameters change (e.g. clicked search result from Global Search Navbar)
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Sync local search updates back to search query parameters
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const filteredNodes = parsedNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterLevel === 'ALL' || node.level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  return (
    <PageTransition>
      <div className="space-y-6 pb-10 min-h-screen">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <Activity className="text-emerald-400" size={32} />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Sensor Monitoring Network
              </h2>
            </div>
            <p className="text-slate-400 mt-1">
              Real-time telemetry and diagnostics for all active traffic junction sensors.
            </p>
          </div>

          <div className="flex items-center space-x-3">
             <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700/50 p-1">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
                  <button
                    key={level}
                    onClick={() => setFilterLevel(level)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
                      filterLevel === level 
                        ? 'bg-slate-700 text-slate-100 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
            placeholder="Search sensors by junction name or ID..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Network Status Banner */}
        {!isConnected && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center text-rose-400">
            <WifiOff size={18} className="mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">Network disconnected. Waiting for telemetry data from the backend simulator...</p>
          </div>
        )}

        {/* Sensor Grid */}
        {isConnected && parsedNodes.length === 0 ? (
           <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-3 bg-slate-800/20 rounded-2xl border border-slate-700/30 border-dashed">
             <Server size={32} className="opacity-50" />
             <p>No active sensors detected on the network.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNodes.map((node, i) => (
              <SensorCard key={node.id || i} node={node} />
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {isConnected && parsedNodes.length > 0 && filteredNodes.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Filter size={32} className="mx-auto mb-3 opacity-50" />
            <p>No sensors match your current search filters.</p>
          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default SensorMonitoring;
