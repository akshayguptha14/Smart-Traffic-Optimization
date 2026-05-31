import React, { useState } from 'react';
import { Network, ArrowRight, Zap, Play, RotateCcw, Box, GitMerge, List } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const TreeNode = ({ node }) => {
  if (!node) return null;
  const isLeaf = node.char !== null;

  return (
    <div className="flex flex-col items-center">
      <div className={`
        flex flex-col items-center justify-center p-3 m-2 rounded-xl border-2 transition-all duration-300
        ${isLeaf 
          ? 'bg-blue-500/20 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] min-w-[60px]' 
          : 'bg-emerald-500/20 border-emerald-400/50 rounded-full w-14 h-14'
        }
      `}>
        {isLeaf ? (
          <>
            <span className="text-sm font-bold text-slate-100">{node.char}</span>
            <span className="text-xs text-blue-300 font-mono">f:{node.freq}</span>
          </>
        ) : (
          <span className="text-sm font-bold text-emerald-300">{node.freq}</span>
        )}
      </div>

      {!isLeaf && (
        <div className="flex w-full mt-2 relative">
          <div className="absolute top-0 left-1/2 w-px h-6 bg-slate-600 -translate-x-1/2 -mt-2"></div>
          
          <div className="flex-1 flex justify-end pr-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-rose-400 font-mono mr-2 mb-1">0</span>
              <div className="w-full h-px bg-slate-600"></div>
              <div className="w-px h-4 bg-slate-600 mr-[-0.5px]"></div>
              <TreeNode node={node.left} />
            </div>
          </div>
          
          <div className="flex-1 flex justify-start pl-4">
             <div className="flex flex-col items-start">
              <span className="text-xs text-emerald-400 font-mono ml-2 mb-1">1</span>
              <div className="w-full h-px bg-slate-600"></div>
              <div className="w-px h-4 bg-slate-600 ml-[-0.5px]"></div>
              <TreeNode node={node.right} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HuffmanVisualization = () => {
  const [inputText, setInputText] = useState("HIGH HIGH MEDIUM LOW HIGH MEDIUM");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCompress = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${URL}/api/huffman/compress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: inputText })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInputText("");
    setError(null);
  };

  return (
    <PageTransition>
      <div className="space-y-6 pb-10">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center">
            <Network className="mr-3 text-blue-400" size={32} />
            Huffman Compression Engine
          </h2>
          <p className="text-slate-400 mt-1">
            Simulate real-time payload compression for IoT traffic sensors.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Simulated Traffic Data Stream (Space-separated)
        </label>
        <div className="flex space-x-4">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
            placeholder="e.g., HIGH MEDIUM LOW HIGH"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleCompress}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            ) : (
              <Play size={18} className="mr-2" />
            )}
            Compress Payload
          </button>
          {result && (
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
        {error && <p className="text-rose-400 text-sm mt-3">{error}</p>}
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Original Size</p>
                <p className="text-2xl font-bold text-slate-100">{result.originalBits} <span className="text-sm font-normal text-slate-500">bits</span></p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl text-slate-400"><Box size={24} /></div>
            </div>
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Compressed Size</p>
                <p className="text-2xl font-bold text-emerald-400">{result.compressedBits} <span className="text-sm font-normal text-emerald-600">bits</span></p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Zap size={24} /></div>
            </div>
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Compression Ratio</p>
                <p className="text-2xl font-bold text-blue-400">{result.ratio}x</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><GitMerge size={24} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Tables */}
            <div className="space-y-6">
              {/* Frequency Table */}
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                  <List size={18} className="mr-2 text-indigo-400" />
                  Frequency Analysis
                </h3>
                <div className="space-y-2">
                  {Object.entries(result.frequencies).map(([char, freq]) => (
                    <div key={char} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                      <span className="font-mono text-sm text-slate-300 bg-slate-800 px-2 py-1 rounded">{char}</span>
                      <span className="text-indigo-300 font-semibold">{freq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Codes Table */}
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                  <Zap size={18} className="mr-2 text-emerald-400" />
                  Generated Binary Codes
                </h3>
                <div className="space-y-2">
                  {Object.entries(result.codes).map(([char, code]) => (
                    <div key={char} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                      <span className="font-mono text-sm text-slate-300 bg-slate-800 px-2 py-1 rounded">{char}</span>
                      <span className="font-mono text-emerald-400 font-bold tracking-widest">{code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Tree Visualization & Output */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Binary Output */}
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Payload Transformation</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Original Payload</p>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 font-mono text-sm text-slate-300 break-words">
                      {inputText}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="text-slate-500 rotate-90 lg:rotate-0" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-500/80 mb-1 uppercase tracking-wider font-semibold">Compressed Binary Payload</p>
                    <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30 font-mono text-emerald-400 break-words tracking-widest shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                      {result.encodedData}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tree Diagram */}
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 shadow-lg overflow-hidden">
                <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
                  <Network size={18} className="mr-2 text-blue-400" />
                  Huffman Tree Structure
                </h3>
                <div className="w-full overflow-x-auto pb-8 pt-4 flex justify-center min-h-[300px]">
                  {result.tree ? (
                    <TreeNode node={result.tree} />
                  ) : (
                    <div className="text-slate-500 italic flex items-center justify-center h-full">Tree could not be generated.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      </div>
    </PageTransition>
  );
};

export default HuffmanVisualization;
