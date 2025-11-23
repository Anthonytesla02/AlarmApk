import React, { useState, useEffect } from 'react';
import { Alarm, DAYS_OF_WEEK } from '../types';
import { X, Check, Sparkles, Wand2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AlarmEditorProps {
  initialAlarm?: Alarm | null;
  onSave: (alarm: Omit<Alarm, 'id'>) => void;
  onCancel: () => void;
  onUpdate: (id: string, alarm: Alarm) => void;
}

const AlarmEditor: React.FC<AlarmEditorProps> = ({ initialAlarm, onSave, onCancel, onUpdate }) => {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [repeat, setRepeat] = useState<number[]>([]);
  const [label, setLabel] = useState('');
  const [isSmart, setIsSmart] = useState(false);
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);

  useEffect(() => {
    if (initialAlarm) {
      setHour(initialAlarm.hour);
      setMinute(initialAlarm.minute);
      setRepeat(initialAlarm.repeat);
      setLabel(initialAlarm.label);
      setIsSmart(initialAlarm.isSmart);
    } else {
        // Default to next hour
        const now = new Date();
        setHour((now.getHours() + 1) % 24);
        setMinute(0);
    }
  }, [initialAlarm]);

  const handleSave = () => {
    const alarmData = {
      hour,
      minute,
      label: label || 'Alarm',
      isEnabled: true,
      repeat,
      isSmart,
      snoozeInterval: 5
    };

    if (initialAlarm) {
      onUpdate(initialAlarm.id, { ...initialAlarm, ...alarmData });
    } else {
      onSave(alarmData);
    }
  };

  const toggleDay = (index: number) => {
    setRepeat(prev => 
      prev.includes(index) 
        ? prev.filter(d => d !== index)
        : [...prev, index].sort()
    );
  };

  const generateSmartLabel = async () => {
     setIsGeneratingLabel(true);
     try {
         const apiKey = process.env.API_KEY || '';
         if(!apiKey) {
             setLabel("Early Bird");
             return;
         }
         const ai = new GoogleGenAI({ apiKey });
         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: `Generate a short, creative 2-3 word label for an alarm set for ${hour}:${minute.toString().padStart(2, '0')}.`,
         });
         setLabel(response.text?.replace(/['"]/g, '').trim() || "Rise & Shine");
     } catch(e) {
         setLabel("Morning Alarm");
     } finally {
         setIsGeneratingLabel(false);
     }
  };

  // Time Picker Helpers
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-gray-900 border-b border-gray-800">
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition">
          <X size={24} />
        </button>
        <h2 className="text-lg font-semibold">{initialAlarm ? 'Edit Alarm' : 'Add Alarm'}</h2>
        <button onClick={handleSave} className="text-primary-500 hover:text-primary-400 font-bold transition">
          <Check size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Time Input - Simplified Digital Style */}
        <div className="flex justify-center items-center space-x-4 my-8">
            <div className="flex flex-col items-center">
                 <input 
                    type="number" 
                    min="0" 
                    max="23"
                    value={pad(hour)}
                    onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if(isNaN(val)) val = 0;
                        if(val > 23) val = 23;
                        if(val < 0) val = 0;
                        setHour(val);
                    }}
                    className="w-32 bg-transparent text-8xl font-thin text-center focus:outline-none border-b border-transparent focus:border-primary-500 transition-colors"
                 />
                 <span className="text-sm text-gray-500 mt-2">Hour</span>
            </div>
            <span className="text-8xl font-thin pb-8">:</span>
            <div className="flex flex-col items-center">
                 <input 
                    type="number" 
                    min="0" 
                    max="59"
                    value={pad(minute)}
                    onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if(isNaN(val)) val = 0;
                        if(val > 59) val = 59;
                        if(val < 0) val = 0;
                        setMinute(val);
                    }}
                    className="w-32 bg-transparent text-8xl font-thin text-center focus:outline-none border-b border-transparent focus:border-primary-500 transition-colors"
                 />
                 <span className="text-sm text-gray-500 mt-2">Minute</span>
            </div>
        </div>

        {/* Repeat Days */}
        <div className="space-y-3">
          <label className="text-gray-400 text-sm uppercase tracking-wider font-bold">Repeat</label>
          <div className="flex justify-between">
            {DAYS_OF_WEEK.map((d, idx) => (
              <button
                key={d}
                onClick={() => toggleDay(idx)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  repeat.includes(idx) 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {d.charAt(0)}
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-gray-400 text-sm uppercase tracking-wider font-bold">Label</label>
                <button 
                    onClick={generateSmartLabel}
                    disabled={isGeneratingLabel}
                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                    <Wand2 size={12} />
                    {isGeneratingLabel ? 'Magic...' : 'Auto-Generate'}
                </button>
            </div>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Alarm Name"
            className="w-full bg-gray-900 border-b border-gray-700 p-3 text-lg focus:border-primary-500 focus:outline-none transition-colors placeholder-gray-600"
          />
        </div>

        {/* Smart Alarm Toggle */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <Sparkles size={20} className="text-white" />
                </div>
                <div>
                    <h4 className="font-medium text-white">Gemini Smart Wake-Up</h4>
                    <p className="text-xs text-gray-500">Get a unique AI motivation message when you dismiss.</p>
                </div>
            </div>
            <button 
             onClick={() => setIsSmart(!isSmart)}
             className={`w-12 h-7 rounded-full transition-colors duration-300 relative ${isSmart ? 'bg-indigo-500' : 'bg-gray-700'}`}
           >
             <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform duration-300 ${isSmart ? 'left-6' : 'left-1'}`} />
           </button>
        </div>

      </div>
    </div>
  );
};

export default AlarmEditor;
