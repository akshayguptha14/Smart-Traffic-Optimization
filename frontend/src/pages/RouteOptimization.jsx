import React, { useState, useEffect } from 'react';
import { Route, MapPin, AlertTriangle, ArrowRight, Clock, ShieldCheck, Zap } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';
import { useTrafficStream } from '../hooks/useTrafficStream';

// --- Subcomponents ---
const RouteNode = ({ name, isDanger, isEnd, active }) => {
  return (
    <div className="flex items-center">
      <div className={`
        flex flex-col items-center justify-center w-32 h-20 rounded-xl border-2 transition-all duration-700
        ${active 
          ? (isDanger ? 'bg-rose-500/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]')
          : 'bg-slate-800/50 border-slate-700 opacity-50 grayscale'
        }
      `}>
        <MapPin size={20} className={`mb-1 ${active ? (isDanger ? 'text-rose-400' : 'text-blue-400') : 'text-slate-500'}`} />
        <span className={`text-xs font-bold text-center ${active ? 'text-slate-100' : 'text-slate-500'}`}>{name}</span>
        {isDanger && active && (
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce font-bold shadow-lg">
            HIGH
          </span>
        )}
      </div>

      {!isEnd && (
        <div className="mx-2 flex flex-col items-center justify-center w-12 overflow-hidden relative h-6">
          <div className={`absolute top-1/2 w-full h-0.5 -translate-y-1/2 transition-colors duration-700 ${active ? 'bg-emerald-500/50' : 'bg-slate-700'}`}></div>
          <ArrowRight size={16} className={`absolute top-1/2 -translate-y-1/2 transition-colors duration-700 ${active ? 'text-emerald-400 right-0 animate-pulse' : 'text-slate-600 right-2'}`} />
        </div>
      )}
    </div>
  );
};

// --- Dijkstra Routing Algorithm ---
const calculateDijkstra = (startNode, endNode, nodesCongestion) => {
  const graph = {
    'Rajajinagar': [
      { node: 'Yeshwanthpur', dist: 5 },
      { node: 'Jalahalli', dist: 8 },
      { node: 'Silk_Board', dist: 14 }
    ],
    'Yeshwanthpur': [
      { node: 'Rajajinagar', dist: 5 },
      { node: 'Peenya', dist: 4 },
      { node: 'Jalahalli', dist: 3 }
    ],
    'Peenya': [
      { node: 'Yeshwanthpur', dist: 4 },
      { node: 'Hesaraghatta', dist: 9 }
    ],
    'Jalahalli': [
      { node: 'Rajajinagar', dist: 8 },
      { node: 'Yeshwanthpur', dist: 3 },
      { node: 'Hesaraghatta', dist: 6 }
    ],
    'Hesaraghatta': [
      { node: 'Peenya', dist: 9 },
      { node: 'Jalahalli', dist: 6 },
      { node: 'Whitefield', dist: 25 }
    ],
    'Whitefield': [
      { node: 'Hesaraghatta', dist: 25 },
      { node: 'Silk_Board', dist: 18 }
    ],
    'Silk_Board': [
      { node: 'Rajajinagar', dist: 14 },
      { node: 'Whitefield', dist: 18 }
    ]
  };

  const getCongestionMultiplier = (nodeName) => {
    const status = nodesCongestion[nodeName] || 'LOW';
    if (status === 'HIGH') return 2.5;
    if (status === 'MEDIUM') return 1.5;
    return 1.0;
  };

  const distances = {};
  const previous = {};
  const queue = [];

  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
    queue.push(node);
  });
  distances[startNode] = 0;

  while (queue.length > 0) {
    queue.sort((a, b) => distances[a] - distances[b]);
    const current = queue.shift();

    if (current === endNode) break;
    if (distances[current] === Infinity) break;

    const neighbors = graph[current] || [];
    neighbors.forEach(neighbor => {
      const multiplier = getCongestionMultiplier(neighbor.node);
      const dynamicWeight = neighbor.dist * multiplier;
      const alt = distances[current] + dynamicWeight;

      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = current;
      }
    });
  }

  const path = [];
  let curr = endNode;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return {
    path: path[0] === startNode ? path : [],
    cost: distances[endNode] === Infinity ? 0 : Math.round(distances[endNode])
  };
};

// --- Calculate Travel Cost of a Specific Path based on Congestion ---
const calculatePathCost = (path, nodesCongestion) => {
  const graph = {
    'Rajajinagar': [
      { node: 'Yeshwanthpur', dist: 5 },
      { node: 'Jalahalli', dist: 8 },
      { node: 'Silk_Board', dist: 14 }
    ],
    'Yeshwanthpur': [
      { node: 'Rajajinagar', dist: 5 },
      { node: 'Peenya', dist: 4 },
      { node: 'Jalahalli', dist: 3 }
    ],
    'Peenya': [
      { node: 'Yeshwanthpur', dist: 4 },
      { node: 'Hesaraghatta', dist: 9 }
    ],
    'Jalahalli': [
      { node: 'Rajajinagar', dist: 8 },
      { node: 'Yeshwanthpur', dist: 3 },
      { node: 'Hesaraghatta', dist: 6 }
    ],
    'Hesaraghatta': [
      { node: 'Peenya', dist: 9 },
      { node: 'Jalahalli', dist: 6 },
      { node: 'Whitefield', dist: 25 }
    ],
    'Whitefield': [
      { node: 'Hesaraghatta', dist: 25 },
      { node: 'Silk_Board', dist: 18 }
    ],
    'Silk_Board': [
      { node: 'Rajajinagar', dist: 14 },
      { node: 'Whitefield', dist: 18 }
    ]
  };

  const getCongestionMultiplier = (nodeName) => {
    const status = nodesCongestion[nodeName] || 'LOW';
    if (status === 'HIGH') return 2.5;
    if (status === 'MEDIUM') return 1.5;
    return 1.0;
  };

  let totalCost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i+1];
    const neighbors = graph[u] || [];
    const edge = neighbors.find(n => n.node === v);
    if (edge) {
      const multiplier = getCongestionMultiplier(v);
      totalCost += edge.dist * multiplier;
    }
  }
  return Math.round(totalCost);
};

const LOCATIONS = [
  'Rajajinagar',
  'Peenya',
  'Yeshwanthpur',
  'Jalahalli',
  'Hesaraghatta',
  'Whitefield',
  'Silk_Board'
];

const RouteOptimization = () => {
  const [startNode, setStartNode] = useState('Rajajinagar');
  const [endNode, setEndNode] = useState('Whitefield');
  const [currentPath, setCurrentPath] = useState([]);
  const [currentCost, setCurrentCost] = useState(0);
  const [baseDistance, setBaseDistance] = useState(0);
  
  // States for comparative Standard Path
  const [standardPath, setStandardPath] = useState([]);
  const [standardCost, setStandardCost] = useState(0);

  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), msg: 'Routing Engine online. Awaiting junction metrics...', type: 'info' }
  ]);

  const { parsedNodes } = useTrafficStream();

  // Extract live congestion levels
  const congestionMap = {};
  parsedNodes.forEach(node => {
    congestionMap[node.name] = node.level;
  });

  // Handle dropdown selectors
  const handleStartChange = (val) => {
    if (val === endNode) {
      toast.error("Source and Destination cannot be the same junction!");
      return;
    }
    setStartNode(val);
    setCurrentPath([]); // Reset to trigger fresh logs
  };

  const handleEndChange = (val) => {
    if (val === startNode) {
      toast.error("Source and Destination cannot be the same junction!");
      return;
    }
    setEndNode(val);
    setCurrentPath([]); // Reset to trigger fresh logs
  };

  // Recalculate Dijkstra optimal path based on live telemetric congestion
  useEffect(() => {
    if (!parsedNodes || parsedNodes.length === 0) return;

    // 1. Congestion-aware Dijkstra (Optimized Alternate Path)
    const result = calculateDijkstra(startNode, endNode, congestionMap);
    
    // 2. Base distance (Topological Standard Path ignoring congestion)
    const baseResult = calculateDijkstra(startNode, endNode, {});
    const baseCostCongested = calculatePathCost(baseResult.path, congestionMap);

    const pathString = result.path.join(' ➔ ');
    const oldPathString = currentPath.join(' ➔ ');

    if (pathString !== oldPathString) {
      if (oldPathString) {
        toast.success(`Dijkstra recalculation complete! Route optimized.`, {
          icon: '🔄',
          id: 'dijkstra-reroute'
        });
        setLogs(curr => [{
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          msg: `REROUTE: Dijkstra engine optimized track. Path: ${result.path.map(n => n.replace('_',' ')).join(' ➔ ')} (${result.cost} mins)`,
          type: 'warning'
        }, ...curr.slice(0, 9)]);
      } else {
        setLogs(curr => [{
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          msg: `ROUTE LOCKED: optimal track: ${result.path.map(n => n.replace('_',' ')).join(' ➔ ')} (${result.cost} mins)`,
          type: 'info'
        }, ...curr.slice(0, 9)]);
      }
      setCurrentPath(result.path);
      setCurrentCost(result.cost);
      setStandardPath(baseResult.path);
      setStandardCost(baseCostCongested);
      setBaseDistance(baseResult.cost);
    } else {
      if (result.cost !== currentCost || baseCostCongested !== standardCost) {
        setCurrentCost(result.cost);
        setStandardCost(baseCostCongested);
        setBaseDistance(baseResult.cost);
        setLogs(curr => [{
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          msg: `TELEMETRY: Congestion shifts adjusted ETA to: ${result.cost} mins.`,
          type: 'success'
        }, ...curr.slice(0, 9)]);
      }
    }
  }, [startNode, endNode, parsedNodes]);

  return (
    <PageTransition>
      <div className="space-y-6 pb-10">
        
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Route className="text-indigo-400" size={32} />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Smart Route Recommendation Engine
            </h2>
          </div>
          <p className="text-slate-400 mt-1">
            Calculates the absolute shortest path dynamically using live telemetric congestion weights in Dijkstra's Algorithm.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Controls & Map Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Dijkstra Source / Destination Controls */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                <MapPin size={18} className="mr-2 text-indigo-400" />
                Dynamic Dijkstra Route Selector
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Start Junction (Source)</label>
                  <select
                    value={startNode}
                    onChange={(e) => handleStartChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer font-medium"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">End Junction (Destination)</label>
                  <select
                    value={endNode}
                    onChange={(e) => handleEndChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer font-medium"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Map Visualizer (Standard vs Alternate comparison) */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg min-h-[360px] flex flex-col justify-center relative overflow-hidden">
              <h3 className="absolute top-6 left-6 text-lg font-semibold text-slate-200 flex items-center">
                <Zap size={18} className="mr-2 text-yellow-400" />
                Live Traversal Matrix Comparison
              </h3>

              {/* Standard Route Row */}
              <div className="transition-all duration-700 mt-12 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-500 block">
                    Primary Route (Topological Shortest)
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Est: {standardCost} mins
                  </span>
                </div>
                <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700/50">
                  <div className="flex items-center min-w-max px-2">
                    {standardPath.length > 0 ? (
                      standardPath.map((nodeName, idx) => {
                        const isEnd = idx === standardPath.length - 1;
                        const congestion = congestionMap[nodeName] || 'LOW';
                        return (
                          <RouteNode 
                            key={`standard-${nodeName}`} 
                            name={nodeName.replace('_', ' ')} 
                            isDanger={congestion === 'HIGH'} 
                            isEnd={isEnd}
                            active={true}
                          />
                        );
                      })
                    ) : (
                      <div className="text-slate-500 text-sm animate-pulse">Mapping standard route...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Optimized Alternate Route Row */}
              <div className="transition-all duration-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold tracking-widest uppercase text-indigo-400 block flex items-center">
                    <ShieldCheck size={14} className="mr-1 text-indigo-400" />
                    Optimized Alternate Path (Dijkstra Live flow)
                  </span>
                  {currentPath.join('->') !== standardPath.join('->') ? (
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      Saved {standardCost - currentCost} mins
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Standard Optimal
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700/50">
                  <div className="flex items-center min-w-max px-2">
                    {currentPath.length > 0 ? (
                      currentPath.map((nodeName, idx) => {
                        const isEnd = idx === currentPath.length - 1;
                        const congestion = congestionMap[nodeName] || 'LOW';
                        return (
                          <RouteNode 
                            key={`optimized-${nodeName}`} 
                            name={nodeName.replace('_', ' ')} 
                            isDanger={congestion === 'HIGH'} 
                            isEnd={isEnd}
                            active={true}
                          />
                        );
                      })
                    ) : (
                      <div className="text-slate-500 text-sm animate-pulse">Calculating optimal Dijkstra route...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Time & Distance Panels */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-indigo-955/20 border border-indigo-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(99,102,241,0.05)]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-slate-300 font-medium">Dijkstra Dynamic ETA</h4>
                  <Clock size={18} className="text-indigo-400" />
                </div>
                <p className="text-4xl font-bold tracking-tight text-indigo-400">
                  {currentCost} <span className="text-lg font-normal text-slate-500">mins</span>
                </p>
                <p className="text-slate-500 text-[10px] mt-2 italic">Incorporates real-time sensor traffic delays.</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-slate-300 font-medium">Physical Distance</h4>
                  <ShieldCheck size={18} className="text-emerald-400" />
                </div>
                <p className="text-4xl font-bold tracking-tight text-slate-300">
                  {baseDistance} <span className="text-lg font-normal text-slate-500">km</span>
                </p>
                <p className="text-slate-500 text-[10px] mt-2 italic">Base topological distance on shortest track.</p>
              </div>
            </div>
            
          </div>

          {/* System Logs Sidebar */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg flex flex-col h-[520px]">
            <div className="p-5 border-b border-slate-700/50 bg-slate-800/50 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                <Route size={18} className="mr-2 text-indigo-400" />
                Dijkstra Engine Logs
              </h3>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-700/50">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-slate-600 border-l border-slate-700 ml-2 animate-in slide-in-from-left-4 fade-in duration-300">
                  <div className={`absolute -left-[5px] top-[7px] w-2.5 h-2.5 rounded-full ${
                    log.type === 'warning' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 
                    log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider block mb-1">{log.time}</span>
                  <p className={`text-sm leading-snug ${
                    log.type === 'warning' ? 'text-rose-200 bg-rose-500/10 p-2 rounded border border-rose-500/20' : 
                    log.type === 'success' ? 'text-emerald-200 bg-emerald-500/10 p-2 rounded border border-emerald-500/20' : 'text-slate-300'
                  }`}>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default RouteOptimization;
