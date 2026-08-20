import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { 
  Activity, 
  Smartphone, 
  AlertTriangle, 
  Sparkles, 
  UserPlus, 
  Volume2, 
  VolumeX, 
  Clock, 
  Building2,
  TrendingUp,
  Flame
} from 'lucide-react';

export const Navbar = () => {
  const { 
    data, 
    liveClock, 
    activeTab, 
    setActiveTab, 
    setIsMobileDrawerOpen, 
    setIsReallocationModalOpen,
    setIsNewPatientModalOpen,
    isAudioEnabled, 
    setIsAudioEnabled,
    triggerCascadeScenario
  } = useHospital();

  const formattedTime = liveClock.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = liveClock.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const hasCriticalBottleneck = data.bottlenecks.some(b => b.severity === 'critical' && b.status === 'active');

  return (
    <header className="sticky top-0 z-40 w-full glass-panel rounded-none border-t-0 border-x-0 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Live Heartbeat Indicator */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent font-['Outfit']">
                  HospitalSync
                </h1>
                <span className="badge badge-cyan text-[10px] py-0.5 px-2">v2.6 Live OS</span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Hospital Operations & Smart Orchestration Command
              </p>
            </div>
          </div>

          {/* Quick Live Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800">
            {hasCriticalBottleneck ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                🔴 Lab Bottleneck Active (37 Pending)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                🟢 Flow Stabilized
              </span>
            )}
          </div>
        </div>

        {/* Real-time IST Clock & Operational Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end w-full md:w-auto">
          
          {/* Indian Standard Time Widget */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs font-medium text-slate-300">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col text-right">
              <span className="mono-font font-bold text-cyan-300 tracking-wide text-xs">{formattedTime} IST</span>
              <span className="text-[10px] text-slate-400">{formattedDate}</span>
            </div>
          </div>

          {/* Register New Patient Button */}
          <button 
            onClick={() => setIsNewPatientModalOpen(true)}
            className="btn-secondary text-xs py-2 px-3 hover:border-cyan-500/50 group"
            title="Register New Patient"
          >
            <UserPlus className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Register Patient</span>
          </button>

          {/* Smart Reallocation Modal Trigger */}
          <button 
            onClick={() => setIsReallocationModalOpen(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-cyan-500/20"
            title="AI Smart Resource Reallocation"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
            <span className="font-semibold">Smart Reallocation</span>
          </button>

          {/* Patient Mobile Simulator Toggle */}
          <button 
            onClick={() => setIsMobileDrawerOpen(true)}
            className="relative px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-950 to-purple-950 border border-purple-500/40 text-purple-200 text-xs font-semibold hover:border-purple-400 hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-purple-950/50"
            title="Open Patient Mobile Simulator"
          >
            <Smartphone className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">Patient Mobile</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          </button>

          {/* Audio toggle */}
          <button 
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title={isAudioEnabled ? "Mute Siren & Alarms" : "Unmute Siren & Alarms"}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

        </div>
      </div>
    </header>
  );
};
