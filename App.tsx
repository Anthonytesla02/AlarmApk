import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alarm, ViewState } from './types';
import AlarmItem from './components/AlarmItem';
import AlarmEditor from './components/AlarmEditor';
import RingingScreen from './components/RingingScreen';
import { audioService } from './services/audioService';
import { generateWakeUpMessage } from './services/geminiService';
import { Plus, Settings, Sparkles, Loader2, Quote } from 'lucide-react';

// Use local storage for persistence
const STORAGE_KEY = 'gemini-alarms-v1';

const App: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.LIST);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  
  // AI Message State
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Audio Unlock for Mobile
  useEffect(() => {
    const unlockAudio = () => {
        audioService.unlock();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Load alarms on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAlarms(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse alarms");
      }
    }
  }, []);

  // Save alarms on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }, [alarms]);

  // Clock Tick & Alarm Check
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check alarms only at 0 seconds to avoid multiple triggers
      if (now.getSeconds() === 0 && !ringingAlarm) {
        checkAlarms(now);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms, ringingAlarm]);

  const checkAlarms = (now: Date) => {
    const h = now.getHours();
    const m = now.getMinutes();
    const day = now.getDay();

    const activeAlarm = alarms.find(a => 
      a.isEnabled && 
      a.hour === h && 
      a.minute === m &&
      (a.repeat.length === 0 || a.repeat.includes(day))
    );

    if (activeAlarm) {
      triggerAlarm(activeAlarm);
    }
  };

  const triggerAlarm = (alarm: Alarm) => {
    setRingingAlarm(alarm);
    setView(ViewState.RINGING);
    audioService.startAlarm();
  };

  const handleToggle = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
  };

  const handleDelete = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveAlarm = (data: Omit<Alarm, 'id'>) => {
    const newAlarm: Alarm = {
      ...data,
      id: Date.now().toString(),
    };
    setAlarms(prev => [...prev, newAlarm]);
    setView(ViewState.LIST);
  };

  const handleUpdateAlarm = (id: string, updatedData: Alarm) => {
    setAlarms(prev => prev.map(a => a.id === id ? updatedData : a));
    setView(ViewState.LIST);
    setEditingAlarmId(null);
  };

  const handleDismiss = async () => {
    if (!ringingAlarm) return;
    
    audioService.stopAlarm();
    
    // If repeat is empty, disable the alarm
    if (ringingAlarm.repeat.length === 0) {
      handleToggle(ringingAlarm.id);
    }

    if (ringingAlarm.isSmart) {
      // Go to AI Summary View
      setIsLoadingAi(true);
      setView(ViewState.AI_SUMMARY);
      const timeStr = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      const msg = await generateWakeUpMessage(timeStr);
      setAiMessage(msg);
      setIsLoadingAi(false);
    } else {
      setRingingAlarm(null);
      setView(ViewState.LIST);
    }
  };

  const handleSnooze = () => {
    if (!ringingAlarm) return;
    audioService.stopAlarm();
    
    // Create a temporary snooze alarm 5 mins later
    // In a real native build, use LocalNotifications plugin here
    
    setRingingAlarm(null);
    setView(ViewState.LIST);
    
    // Quick Hack for Snooze demo:
    setTimeout(() => {
        triggerAlarm(ringingAlarm);
    }, ringingAlarm.snoozeInterval * 60 * 1000); 
  };

  const closeAiSummary = () => {
    setRingingAlarm(null);
    setAiMessage(null);
    setView(ViewState.LIST);
  };

  // Views
  if (view === ViewState.RINGING && ringingAlarm) {
    return (
      <RingingScreen 
        alarm={ringingAlarm} 
        time={currentTime} 
        onDismiss={handleDismiss} 
        onSnooze={handleSnooze} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {/* List View Header */}
      <div className="pt-8 pb-4 px-6 flex justify-between items-start sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-gray-900/50">
        <div>
           <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-1">
              <Sparkles size={14} className="text-yellow-400" />
              <span>Gemini AI Enabled</span>
           </div>
           <h1 className="text-3xl font-bold tracking-tight text-white">Alarm</h1>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
          <Settings size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Main Content */}
      <main className="px-4 pb-32">
        {/* Clock Hero */}
        <div className="py-10 flex flex-col items-center justify-center border-b border-gray-900 mb-6">
           <h2 className="text-7xl font-light text-gray-200 tracking-tighter">
             {currentTime.getHours() % 12 || 12}
             <span className="animate-pulse">:</span>
             {currentTime.getMinutes().toString().padStart(2, '0')}
           </h2>
           <p className="text-gray-500 text-lg mt-2 font-medium">
             {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
           </p>
        </div>

        {/* Alarm List */}
        {alarms.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-gray-500">No alarms set.</p>
            <p className="text-gray-600 text-sm mt-2">Tap + to add one.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {alarms.map(alarm => (
              <AlarmItem 
                key={alarm.id} 
                alarm={alarm} 
                onToggle={handleToggle} 
                onDelete={handleDelete}
                onClick={(a) => {
                    setEditingAlarmId(a.id);
                    setView(ViewState.EDIT);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <button 
          onClick={() => {
              setEditingAlarmId(null);
              setView(ViewState.EDIT);
          }}
          className="w-16 h-16 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-2xl shadow-primary-900/50 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 pointer-events-auto"
        >
          <Plus size={32} strokeWidth={2.5} />
        </button>
      </div>

      {/* Edit Modal */}
      {view === ViewState.EDIT && (
        <AlarmEditor 
          initialAlarm={editingAlarmId ? alarms.find(a => a.id === editingAlarmId) : null}
          onSave={handleSaveAlarm}
          onUpdate={handleUpdateAlarm}
          onCancel={() => setView(ViewState.LIST)}
        />
      )}

      {/* AI Summary Modal */}
      {view === ViewState.AI_SUMMARY && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
           {isLoadingAi ? (
               <div className="flex flex-col items-center gap-4">
                   <Loader2 size={48} className="text-indigo-500 animate-spin" />
                   <p className="text-indigo-300 font-medium animate-pulse">Gemini is brewing your morning motivation...</p>
               </div>
           ) : (
               <div className="max-w-md w-full">
                   <div className="mb-8 flex justify-center">
                       <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                           <Quote size={32} className="text-indigo-400" />
                       </div>
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-6 leading-tight">Good Morning!</h2>
                   <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-8">
                       <p className="text-xl text-gray-200 italic font-serif leading-relaxed">
                           "{aiMessage}"
                       </p>
                   </div>
                   <button 
                    onClick={closeAiSummary}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                   >
                       I'm Ready!
                   </button>
               </div>
           )}
        </div>
      )}
    </div>
  );
};

export default App;