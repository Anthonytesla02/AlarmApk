import React from 'react';
import { Alarm } from '../types';
import { BellOff, Timer, Sparkles } from 'lucide-react';

interface RingingScreenProps {
  alarm: Alarm;
  time: Date;
  onDismiss: () => void;
  onSnooze: () => void;
}

const RingingScreen: React.FC<RingingScreenProps> = ({ alarm, time, onDismiss, onSnooze }) => {
  // Format time for display
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const displayTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between py-20 px-6 animate-in fade-in duration-500">
      
      {/* Background Pulse Effect */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <div className="w-64 h-64 bg-primary-900/30 rounded-full animate-ping opacity-75 absolute"></div>
          <div className="w-96 h-96 bg-primary-800/20 rounded-full animate-ping opacity-50 absolute delay-75"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center mt-12">
        <div className="animate-pulse-fast mb-8">
            <Sparkles size={48} className="text-indigo-400 mb-4 mx-auto" />
            <span className="text-indigo-400 uppercase tracking-widest text-sm font-bold">{alarm.label || 'Alarm'}</span>
        </div>
        
        <h1 className="text-9xl font-thin text-white tracking-tighter">
            {displayTime}
            <span className="text-2xl ml-2 font-normal text-gray-400">{ampm}</span>
        </h1>
        
        <p className="text-gray-400 mt-4 text-lg">
            {alarm.isSmart ? "Gemini has a message for you..." : "Wake Up!"}
        </p>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6 mb-12">
        <button
            onClick={onSnooze}
            className="w-full py-4 rounded-full bg-gray-800 text-white font-semibold text-lg border border-gray-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
            <Timer size={20} />
            Snooze (5m)
        </button>
        
        <button // Slide to dismiss visual cue handled by simple button for web simplicity
            onClick={onDismiss}
            className="w-full py-5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xl border border-red-500/30 active:scale-95 transition-transform shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2"
        >
            <BellOff size={24} />
            Dismiss
        </button>
      </div>
    </div>
  );
};

export default RingingScreen;