import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SensorMonitoring from './pages/SensorMonitoring';
import RouteOptimization from './pages/RouteOptimization';
import HuffmanVisualization from './pages/HuffmanVisualization';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/sensors" element={<SensorMonitoring />} />
          <Route path="/routes" element={<RouteOptimization />} />
          <Route path="/huffman" element={<HuffmanVisualization />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
      <Toaster 
        position="bottom-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }
        }} 
      />
    </BrowserRouter>
  );
}

export default App;
