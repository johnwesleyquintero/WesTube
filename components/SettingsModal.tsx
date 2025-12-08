

import React, { useState, useEffect } from 'react';
import { MOODS, DURATIONS } from '../constants';
import { GlassSelect } from './GlassSelect';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'config' | 'manual';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<Tab>('config');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-wes-950 border border-wes-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header & Tabs */}
        <div className="flex flex-col border-b border-wes-700 bg-wes-900/50">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-200 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-wes-accent/10 flex items-center justify-center mr-3 border border-wes-accent/20 text-wes-accent">
                <i className="fa-solid fa-sliders"></i>
              </span>
              Settings & Documentation
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          
          <div className="flex px-4 space-x-4">
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'config' 
                  ? 'border-wes-accent text-slate-200' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'manual' 
                  ? 'border-wes-pop text-slate-200' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              System Manual
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-wes-950">
          
          {/* TAB: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="p-6 space-y-8">
              
              {/* Defaults */}
              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-slate-200 flex items-center">
                    <i className="fa-solid fa-layer-group mr-2 text-slate-400"></i>
                    Production Defaults
                 </h3>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <GlassSelect 
                     label="Default Duration"
                     options={DURATIONS}
                     value={defaultDuration}
                     onChange={(e) => setDefaultDuration(e.target.value)}
                   />
                   <GlassSelect 
                     label="Default Mood"
                     options={MOODS}
                     value={defaultMood}
                     onChange={(e) => setDefaultMood(e.target.value)}
                   />
                 </div>
              </div>
            </div>
          )}

          {/* TAB: SYSTEM MANUAL */}
          {activeTab === 'manual' && (
            <div className="p-6 space-y-8 text-sm text-slate-300">
              {/* Introduction */}
              <div className="bg-wes-900/40 p-4 rounded-lg border border-wes-700">
                <h3 className="text-slate-200 font-bold mb-2 flex items-center">
                  <i className="fa-solid fa-microchip text-wes-pop mr-2"></i>
                  System Overview
                </h3>
                <p className="leading-relaxed">
                  WesTube Engine v2.0 is a multi-channel content production system. It utilizes <strong>Google Gemini 2.5 Flash</strong> to transform a single topic into a complete production package (Script, SEO, Asset Prompts) tailored to specific channel personas.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {activeTab === 'config' && (
          <div className="p-4 border-t border-wes-700 bg-wes-900/80 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-wes-accent hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95 flex items-center"
            >
              <i className="fa-solid fa-save mr-2"></i>
              Save Configuration
            </button>
          </div>
        )}
        
        {activeTab === 'manual' && (
           <div className="p-4 border-t border-wes-700 bg-wes-900/80 flex justify-end">
             <button 
              onClick={onClose}
              className="px-6 py-2 bg-wes-800 hover:bg-wes-700 text-slate-200 text-sm font-bold rounded-lg border border-wes-700 transition-colors"
            >
              Close Manual
            </button>
           </div>
        )}

      </div>
    </div>
  );
};