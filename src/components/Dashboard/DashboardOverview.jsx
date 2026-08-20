import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Users, 
  AlertOctagon, 
  Bed, 
  FlaskConical, 
  Pill, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Activity,
  GitPullRequest,
  Zap,
  ShieldAlert,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const DashboardOverview = () => {
  const { 
    data, 
    setActiveTab, 
    setIsReallocationModalOpen, 
    resolveBottleneckAction,
    triggerCascadeScenario,
    activeScenario
  } = useHospital();

  const { kpis, bottlenecks, departments, aiRecommendations, recentActivityFeed } = data;
  const labBottleneck = bottlenecks.find(b => b.departmentId === 'lab');
  const nurseRec = aiRecommendations.find(r => r.id === 'rec-nurse-realloc');

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Top Banner with Quick Simulation Control Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-4 border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5 font-['Outfit']">
            <span>Hospital Operational Command</span>
            <span className="badge badge-cyan text-xs">Live Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cross-department synchronization, bottleneck detection, and AI resource orchestration.
          </p>
        </div>

        {/* Live Scenario Quick Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Zap className="w-3 h-3 text-amber-400" /> Scenarios:
          </span>

          <button
            onClick={() => triggerCascadeScenario('icu_crunch')}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              activeScenario === 'icu_crunch' 
                ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-md shadow-rose-950/50' 
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-rose-500/50'
            }`}
          >
            🚨 ICU Crunch
          </button>

          <button
            onClick={() => triggerCascadeScenario('mass_casualty')}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              activeScenario === 'mass_casualty' 
                ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-md shadow-amber-950/50' 
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            🚑 Mass Casualty Surge
          </button>

          <button
            onClick={() => triggerCascadeScenario('reset')}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* 1. TOP 6 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Patients Today */}
        <div 
          onClick={() => setActiveTab('patients')}
          className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-cyan-500/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Patients Today</span>
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl metric-value text-white group-hover:text-cyan-300 transition-colors">
              {kpis.patientsToday}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+14 in last hour</span>
            </div>
          </div>
        </div>

        {/* Emergency Patients */}
        <div 
          onClick={() => setActiveTab('emergency')}
          className="glass-panel p-4 flex flex-col justify-between cursor-pointer group glass-panel-glow-rose hover:border-rose-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">Emergency Patients</span>
            <div className="p-2 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl metric-value text-rose-400 font-bold">
              {kpis.emergencyPatients}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-rose-300 mt-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>6 Red Triage (Critical)</span>
            </div>
          </div>
        </div>

        {/* Available Beds */}
        <div 
          onClick={() => setActiveTab('resources')}
          className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-emerald-500/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Available Beds</span>
            <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl metric-value text-emerald-400">
              {kpis.availableBeds} <span className="text-xs text-slate-400 font-normal">/ {kpis.totalBeds}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>ICU: 1 | W-A: 4 | W-B: 7</span>
            </div>
          </div>
        </div>

        {/* Pending Lab Tests */}
        <div 
          onClick={() => setActiveTab('bottlenecks')}
          className="glass-panel p-4 flex flex-col justify-between cursor-pointer group glass-panel-glow-rose hover:border-rose-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">Pending Lab Tests</span>
            <div className="p-2 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-transform">
              <FlaskConical className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl metric-value text-rose-400">
              {kpis.pendingLabTests}
            </div>
            <div className="text-[11px] text-rose-300 mt-1 font-semibold">
              🔴 Bottleneck (42m wait)
            </div>
          </div>
        </div>

        {/* Pharmacy Requests */}
        <div 
          onClick={() => setActiveTab('departments')}
          className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-amber-500/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Pharmacy Requests</span>
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl metric-value text-amber-300">
              {kpis.pharmacyRequests}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Avg dispensing: 14 min</span>
            </div>
          </div>
        </div>

        {/* Delayed Cases */}
        <div 
          onClick={() => setActiveTab('bottlenecks')}
          className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-rose-500/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Delayed Cases</span>
            <div className="p-2 rounded-lg bg-slate-900 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl metric-value text-rose-400">
              {kpis.delayedCases}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>&gt; Target TAT threshold</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. CORE HIGHLIGHT: BOTTLENECK DETECTION & SMART REALLOCATION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 🚦 BOTTLENECK DETECTION CARD */}
        <div className="glass-panel p-5 border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-950 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <GitPullRequest className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Bottleneck Detection Engine</span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    🔴 Bottleneck Detected: Laboratory
                  </h3>
                </div>
              </div>

              <span className="badge badge-red text-xs">High Impact</span>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-4 border border-rose-500/20 mb-4">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Pending Lab Tests:</span>
                  <div className="text-lg font-bold text-rose-400 mono-font">{kpis.pendingLabTests} Tests</div>
                </div>
                <div>
                  <span className="text-slate-400">Average Waiting Time:</span>
                  <div className="text-lg font-bold text-rose-400 mono-font">42 minutes</div>
                </div>
              </div>

              <div className="pt-3">
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  <span className="text-rose-400 font-bold">Root Cause:</span> "The laboratory is slowing down patient flow. High influx of STAT cardiac biomarker & blood panels while phlebotomy queue is backlogged."
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Other departments (OPD, Ward A, Ward B) are relatively normal, creating an isolated operational chokepoint.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => resolveBottleneckAction('bot-lab-1', 'act-lab-aux')}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-500/30"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Deploy 1-Click Mitigation</span>
            </button>

            <button
              onClick={() => setActiveTab('bottlenecks')}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 hover:text-rose-300"
            >
              <span>Inspect Laboratory Queue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 🧠 SMART RESOURCE REALLOCATION CARD */}
        <div className="glass-panel p-5 border-cyan-500/40 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-indigo-950/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">AI Resource Optimizer</span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    💡 Smart Resource Reallocation
                  </h3>
                </div>
              </div>

              <span className="badge badge-emerald text-xs">Actionable</span>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-4 border border-cyan-500/20 mb-4">
              {/* Department Load Comparison Pill */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800 text-xs">
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30">
                  <div className="text-[11px] font-bold text-rose-300">Emergency & Trauma</div>
                  <div className="text-xs font-semibold text-rose-400 mt-0.5">Very Busy 🔴 (94% Load)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                  <div className="text-[11px] font-bold text-emerald-300">General Ward B</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-0.5">Low Workload 🟢 (32% Load)</div>
                </div>
              </div>

              <div className="pt-3">
                <p className="text-xs text-cyan-200 font-semibold leading-relaxed">
                  💡 Recommendation: 2 available nurses (Nurse Ananya Sen & Nurse Rahul Varma) from Ward B can be temporarily assigned to Emergency.
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  The administrator makes the final decision. The system recommends the optimal action to prevent emergency overcrowding.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setIsReallocationModalOpen(true)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-cyan-500/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Review & Approve Reallocation</span>
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
            >
              <span>All Recommendations</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. 🔄 IMPACT RIPPLE CAUSALITY PREVIEW BAR */}
      <div 
        onClick={() => setActiveTab('emergency')}
        className="glass-panel p-4 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer group hover:border-amber-400"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-amber text-[10px]">Impact Ripple Engine</span>
              <h4 className="text-sm font-bold text-amber-200">
                ⚠️ Impact Alert: ICU capacity reduced. Emergency admissions may be affected.
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live cascade: <span className="text-amber-300">ICU Bed Unavailable</span> ➔ Emergency Admission affected ➔ Bed Allocation affected ➔ Staff planning affected ➔ Waiting time increases.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform">
          <span>View Interactive Ripple Graph</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 4. DEPARTMENT REAL-TIME OPERATIONS GRID */}
      <div className="glass-panel p-5 border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
              <span>Department Operations & Live Bed Status</span>
              <span className="badge badge-cyan text-xs">Zero-Refresh Live Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">Continuous telemetry across OPD, Emergency, Critical Care, Diagnostic Labs, and Inpatient Wards.</p>
          </div>

          <button
            onClick={() => setActiveTab('departments')}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <span>Full Departments View</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {departments.map((dept) => {
            const isCritical = dept.status === 'critical';
            const isWarning = dept.status === 'warning';

            return (
              <div
                key={dept.id}
                onClick={() => setActiveTab('departments')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                  isCritical 
                    ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400' 
                    : isWarning 
                    ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 truncate">{dept.name}</span>
                  <span className={`badge ${
                    isCritical ? 'badge-red' : isWarning ? 'badge-amber' : 'badge-emerald'
                  } text-[10px] py-0.5 px-1.5 shrink-0`}>
                    {dept.statusLabel}
                  </span>
                </div>

                <div className="flex items-end justify-between mt-2">
                  <div>
                    <div className="text-2xl font-bold metric-value text-white">
                      {dept.patientCount} <span className="text-xs font-normal text-slate-400">active</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Doctors: <span className="text-slate-200 font-semibold">{dept.doctorsOnDuty}</span> | Nurses: <span className="text-slate-200 font-semibold">{dept.nursesOnDuty}</span>
                    </div>
                  </div>

                  {dept.availableBeds !== undefined && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">
                        {dept.availableBeds} Free
                      </div>
                      <div className="text-[10px] text-slate-500">
                        of {dept.totalBeds} Beds
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress bar of capacity */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Capacity Load</span>
                    <span className="mono-font font-semibold">{dept.capacityPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.capacityPct > 90 ? 'bg-rose-500' : dept.capacityPct > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, dept.capacityPct)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className="text-slate-500">Lead:</span>
                  <span className="text-slate-300 font-medium">{dept.head}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. LIVE ACTIVITY FEED & HEARTBEAT LOG */}
      <div className="glass-panel p-5 border-slate-800/80">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Real-Time Cross-Department Activity Stream
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Auto-synced</span>
        </div>

        <div className="flex flex-col gap-2">
          {recentActivityFeed.map((act) => {
            const isDanger = act.type === 'danger';
            const isSuccess = act.type === 'success';
            const isWarning = act.type === 'warning';

            return (
              <div 
                key={act.id}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    isDanger ? 'bg-rose-500 animate-ping' : isSuccess ? 'bg-emerald-400' : isWarning ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}></span>
                  <span className="text-slate-300 font-medium">{act.text}</span>
                </div>

                <span className="text-[11px] text-slate-500 shrink-0 ml-4 mono-font">{act.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
