import React, { useState, useEffect } from 'react';
import { MOODS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [defaultDuration, setDefaultDuration] = useState('Medium (5-8m)');
  const [defaultMood, setDefaultMood] = useState(MOODS[0]);

  // Load from local storage on mount
  useEffect(() => {
    const savedDuration = localStorage.getItem('wes_default_duration');
    const savedMood = localStorage.getItem('wes_default_mood');
    if (savedDuration) setDefaultDuration(savedDuration);
    if (savedMood) setDefaultMood(savedMood);
  }, []);

  const handleSave = () => {
    localStorage.setItem('wes_default_duration', defaultDuration);
    localStorage.setItem('wes_default_mood', defaultMood);
    onClose();
    // Force a reload to apply changes cleanly across the app
    window.location.reload(); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-wes-800 border border-wes-700 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="p-4 border-b border-wes-700 flex justify-between items-center bg-wes-900/50">
          <h2 className="text-lg font-bold text-white flex items-center">
            <i className="fa-solid fa-gear text-slate-400 mr-2"></i>
            System Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* API Key Section (Read Only per System Rules) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Connection</label>
            <div className="flex items-center justify-between p-3 bg-wes-900 rounded border border-wes-700 opacity-70 cursor-not-allowed" title="Managed by Environment Variables">
              <div className="flex items-center text-sm text-slate-300">
                <i className="fa-solid fa-key mr-2 text-wes-success"></i>
                <span>Google Gemini API</span>
              </div>
              <span className="text-xs bg-wes-700 px-2 py-1 rounded text-slate-400 flex items-center border border-wes-600">
                <i className="fa-solid fa-lock mr-1.5 text-[10px]"></i> Env Locked
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              * Security Protocol: The API key is injected via secure environment variables and cannot be modified in the client interface.
            </p>
          </div>

          <div className="h-px bg-wes-700/50"></div>

          {/* Defaults */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-white">Production Defaults</h3>
             
             <div className="space-y-2">
               <label className="text-xs text-slate-400">Default Duration</label>
               <select 
                 value={defaultDuration}
                 onChange={(e) => setDefaultDuration(e.target.value)}
                 className="w-full bg-wes-900 border border-wes-700 rounded p-2 text-sm text-white focus:border-wes-accent outline-none"
               >
                 <option value="Short (<60s)">Short (&lt;60s)</option>
                 <option value="Medium (5-8m)">Medium (5-8m)</option>
                 <option value="Long (15m+)">Long (15m+)</option>
               </select>
             </div>

             <div className="space-y-2">
               <label className="text-xs text-slate-400">Default Mood</label>
               <select 
                 value={defaultMood}
                 onChange={(e) => setDefaultMood(e.target.value)}
                 className="w-full bg-wes-900 border border-wes-700 rounded p-2 text-sm text-white focus:border-wes-accent outline-none"
               >
                 {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-wes-700 bg-wes-900/50 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-wes-accent hover:bg-blue-600 text-white text-sm font-bold rounded shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};