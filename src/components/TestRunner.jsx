import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, X } from 'lucide-react';

const TestRunner = ({ code, language, onClose }) => {
  const [output, setOutput] = useState([]);
  const [status, setStatus] = useState('connecting');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3001');

    ws.current.onopen = () => {
      setStatus('running');
      ws.current.send(JSON.stringify({ code, language }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOutput(prevOutput => [...prevOutput, data]);
    };

    ws.current.onclose = () => {
      setStatus('finished');
    };

    ws.current.onerror = (error) => {
      setStatus('error');
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current.close();
    };
  }, [code, language]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <h2 className="text-lg font-bold">Test Run Output</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1 bg-slate-900/50 font-mono text-sm">
          {output.map((line, index) => (
            <div key={index} className={`flex items-start ${line.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
              <span className="mr-4 text-gray-500">{index + 1}</span>
              <pre className="whitespace-pre-wrap">{line.data}</pre>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-white/10 text-xs text-center text-gray-400">
          Status: {status}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TestRunner;
