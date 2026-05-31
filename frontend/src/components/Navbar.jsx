import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Wifi, WifiOff, MapPin, Compass } from 'lucide-react';
import { socket } from '../services/socket';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const searchIndex = [
    { type: 'page', title: 'Dashboard Hub', path: '/', category: 'System Pages', keywords: 'home dashboard main central grid overview' },
    { type: 'page', title: 'Sensor Monitoring Network', path: '/sensors', category: 'System Pages', keywords: 'telemetry sensors active huffman data stream nodes' },
    { type: 'page', title: 'Route Recommendation Engine', path: '/routes', category: 'System Pages', keywords: 'dijkstra maps travel route reroute time path yeshwanthpur peenya' },
    { type: 'page', title: 'Huffman Binary Visualizer', path: '/huffman', category: 'System Pages', keywords: 'tree binary huffman compression node visualization encoder decoder' },
    { type: 'page', title: 'Analytics & Reports', path: '/analytics', category: 'System Pages', keywords: 'reports bandwidth metrics performance analysis network statistics' },
    
    { type: 'sensor', title: 'Rajajinagar Junction', path: '/sensors?search=Rajajinagar', category: 'Junction Sensors', keywords: 'rajajinagar node 1 low medium high traffic' },
    { type: 'sensor', title: 'Peenya Industrial Area', path: '/sensors?search=Peenya', category: 'Junction Sensors', keywords: 'peenya node 2 heavy congestion reroute high' },
    { type: 'sensor', title: 'Yeshwanthpur Metro Station', path: '/sensors?search=Yeshwanthpur', category: 'Junction Sensors', keywords: 'yeshwanthpur node 3 low medium high' },
    { type: 'sensor', title: 'Jalahalli Cross', path: '/sensors?search=Jalahalli', category: 'Junction Sensors', keywords: 'jalahalli node 4 alternate' },
    { type: 'sensor', title: 'Hesaraghatta Main Rd', path: '/sensors?search=Hesaraghatta', category: 'Junction Sensors', keywords: 'hesaraghatta node 5 terminal end' },
    { type: 'sensor', title: 'Whitefield ITPL', path: '/sensors?search=Whitefield', category: 'Junction Sensors', keywords: 'whitefield node 6 silicon' },
    { type: 'sensor', title: 'Silk Board Junction', path: '/sensors?search=Silk_Board', category: 'Junction Sensors', keywords: 'silk board node 7 peak traffic' }
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = searchQuery.trim() 
    ? searchIndex.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleResultClick = (item) => {
    navigate(item.path);
    setSearchQuery('');
    setShowDropdown(false);
    toast.success(`Navigating to ${item.title}`, {
      icon: item.type === 'page' ? '🚀' : '📍',
      id: 'global-search-nav'
    });
  };

  useEffect(() => {
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const notifications = [
    { id: 1, text: "System Online & Connected", time: "Just now" },
    { id: 2, text: "Huffman Engine Active", time: "2m ago" },
  ];

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    setHasUnread(false);
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-40 relative shadow-sm">
      <div className="flex items-center flex-1" ref={dropdownRef}>
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search pages, junctions (e.g. Peenya)..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner placeholder:text-slate-500"
          />
          
          {/* Autocomplete Dropdown */}
          {showDropdown && searchQuery.trim() && (
            <div className="absolute left-0 mt-3 w-full bg-slate-850 border border-slate-700/80 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200 backdrop-blur-md bg-slate-900/95">
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleResultClick(result)}
                      className="p-3 hover:bg-slate-800/70 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-lg ${
                          result.type === 'page' 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {result.type === 'page' ? <Compass size={15} /> : <MapPin size={15} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                            {result.title}
                          </p>
                          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            {result.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/50 group-hover:border-cyan-500/30 group-hover:text-slate-400 transition-colors">
                        Select
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                    <Search size={20} className="opacity-30" />
                    <p>No results matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-6 relative">
        <div className="flex items-center space-x-2 text-sm font-medium">
          {isConnected ? (
            <span className="flex items-center text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <Wifi size={14} className="mr-2" /> Live Connect
            </span>
          ) : (
            <span className="flex items-center text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
              <WifiOff size={14} className="mr-2" /> Disconnected
            </span>
          )}
        </div>
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={handleBellClick}
            className={`relative p-2 rounded-lg transition-all duration-200 hover:bg-slate-800 ${showNotifications ? 'text-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                <h3 className="font-semibold text-slate-200">System Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => { setShowNotifications(false); toast('Reviewing notification details...', { icon: '🔍' }); }}
                    className="p-4 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <p className="text-sm text-slate-300">{notif.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div 
                onClick={() => { setShowNotifications(false); toast.loading('Loading complete system logs...', { duration: 1500 }); }}
                className="p-3 text-center bg-slate-900/50 hover:bg-slate-800 transition-colors cursor-pointer text-xs text-cyan-400 font-medium"
              >
                View All Logs
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="relative">
          <div 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-slate-600 shadow-md flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:shadow-cyan-500/20 transition-all"
          >
            AD
          </div>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-3 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                <h3 className="font-semibold text-slate-200">Admin User</h3>
                <p className="text-xs text-slate-400">admin@grid.bengaluru.in</p>
              </div>
              <div className="py-2">
                <div 
                  onClick={() => { setShowProfile(false); toast('Opening System Settings module...', { icon: '⚙️' }); }}
                  className="px-4 py-2 hover:bg-slate-700/50 cursor-pointer text-sm text-slate-300 transition-colors"
                >
                  System Settings
                </div>
                <div 
                  onClick={() => { setShowProfile(false); toast('Checking Access Control privileges...', { icon: '🔐' }); }}
                  className="px-4 py-2 hover:bg-slate-700/50 cursor-pointer text-sm text-slate-300 transition-colors"
                >
                  Access Controls
                </div>
                <div 
                  onClick={() => { setShowProfile(false); toast.success('Downloading Grid Documentation PDF...', { icon: '📄' }); }}
                  className="px-4 py-2 hover:bg-slate-700/50 cursor-pointer text-sm text-slate-300 transition-colors"
                >
                  Documentation
                </div>
              </div>
              <div className="p-2 border-t border-slate-700">
                <div 
                  onClick={() => { 
                    setShowProfile(false); 
                    toast.loading('Terminating secure session...', { duration: 1500 });
                    setTimeout(() => toast.success('Logged out successfully.'), 1500);
                  }}
                  className="px-4 py-2 hover:bg-rose-500/10 cursor-pointer text-sm text-rose-400 rounded-lg transition-colors text-center font-medium"
                >
                  Log Out
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
