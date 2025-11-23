import React from 'react';
import { Alarm, DAYS_OF_WEEK } from '../types';
import { Sparkles, Trash2, Clock } from 'lucide-react';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (alarm: Alarm) => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle, onDelete, onClick }) => {
  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const mStr = m.toString().padStart(2, '0');
    return { time: `${h12}:${mStr}`, ampm };
  };

  const { time, ampm } = formatTime(alarm.hour, alarm.minute);

  const formatDays = (days: number[]) => {
    if (days.length === 0) return 'Once';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => DAYS_OF_WEEK[d]).join(', ');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3 shadow-lg relative overflow-hidden group">
      <div 
        className="flex justify-between items-center relative z-10"
      >
        <div 
            className="flex-1 cursor-pointer"
            onClick={() => onClick(alarm)}
        >
          <div className="flex items-baseline space-x-2">
            <span className={`text-5xl font-light tracking-tighter ${alarm.isEnabled ? 'text-white' : 'text-gray-500'}`}>
              {time}
            </span>
            <span className={`text-xl ${alarm.isEnabled ? 'text-gray-300' : 'text-gray-600'}`}>
              {ampm}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-sm ${alarm.isEnabled ? 'text-indigo-400' : 'text-gray-600'}`}>
              {formatDays(alarm.repeat)}
            </span>
            {alarm.label && (
                <span className="text-sm text-gray-500 truncate max-w-[150px]">| {alarm.label}</span>
            )}
            {alarm.isSmart && (
               <Sparkles size={14} className="text-yellow-400" />
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
           {/* Toggle Switch */}
           <button 
             onClick={(e) => {
                e.stopPropagation();
                onToggle(alarm.id);
             }}
             className={`w-14 h-8 rounded-full transition-colors duration-300 ease-in-out relative ${alarm.isEnabled ? 'bg-primary-600' : 'bg-gray-700'}`}
           >
             <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-300 ${alarm.isEnabled ? 'left-7' : 'left-1'}`} />
           </button>
        </div>
      </div>
        
      {/* Delete Action (visible on hover/active in desktop, usually swipe in mobile but simple button here) */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onDelete(alarm.id);
        }}
        className="absolute top-4 right-4 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
      >
          <Trash2 size={20} />
      </button>
    </div>
  );
};

export default AlarmItem;
