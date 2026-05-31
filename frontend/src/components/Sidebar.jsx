import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Map, Code2, BarChart3, LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Sensors', path: '/sensors', icon: Activity },
    { name: 'Routes', path: '/routes', icon: Map },
    { name: 'Huffman', path: '/huffman', icon: Code2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-50">
      <div className="p-6">
        <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent flex flex-col items-start leading-tight">
          <span>Bengaluru</span>
          <span className="text-xl">Smart Grid</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600/20 to-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]'
              }`}
            >
              <link.icon className={`mr-3 transition-colors ${isActive ? 'text-emerald-400' : 'group-hover:text-cyan-400'}`} size={20} />
              <span className="font-medium tracking-wide">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-slate-800 space-y-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.05)] hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] group"
        >
          <LogOut size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold tracking-wide">Secure Logout</span>
        </button>

        <div className="flex items-center text-xs text-slate-500 font-mono justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          Grid System Active v2.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
