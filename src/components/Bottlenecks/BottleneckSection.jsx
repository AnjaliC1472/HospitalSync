import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  GitPullRequest, 
  FlaskConical, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  TrendingDown, 
  Activity, 
  Layers, 
  Users,
  ShieldAlert
} from 'lucide-react';

export const BottleneckSection = () => {
  const { data, resolveBottleneckAction, setActiveTab } = useHospital();
  const { bottlenecks, departments, kpis } = data;

  const labBottleneck = bottlenecks.find(b => b.departmentId === 'lab');

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="glass-panel p-5 border-slate-800/80 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <GitPullRequest className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                🚦 Automated Bottleneck Detection Engine
              </h2>
              <p className="text-xs text-slate-400">
                Identifies operational chokepoints, queue backlogs, and patient flow slowdowns across hospital pipelines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge badge-red text-xs py-1 px-3">
            {bottlenecks.filter(b => b.status === 'active').length} Active Bottlenecks
          </span>
          <span className="badge badge-cyan text-xs py-1 px-3">
            Real-Time Analysis
          </span>
        </div>
      </div>

      {/* PRIMARY BOTTLENECK SPOTLIGHT: LABORATORY */}
      {labBottleneck && (
        <div className={`glass-panel p-6 border-2 transition-all ${
          labBottleneck.status === 'active' 
            ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-900 glass-panel-glow-rose' 
            : 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-900'
        }`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl ${
                labBottleneck.status === 'active' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                <FlaskConical className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${labBottleneck.status === 'active' ? 'badge-red' : 'badge-emerald'} text-xs font-bold`}>
                    {labBottleneck.badgeText}
                  </span>
                  <span className="text-xs text-slate-400">Diagnostic Laboratory Division</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  Laboratory Delay Chokepoint Analysis
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Average Waiting Time</div>
                <div className="text-xl font-extrabold text-rose-400 mono-font">
                  {labBottleneck.avgWaitTime}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Target Turnaround</div>
                <div className="text-xl font-extrabold text-emerald-400 mono-font">
                  {labBottleneck.normalWaitTime}
                </div>
              </div>
            </div>
          </div>

          {/* Root cause and flow description */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-5">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Queue Status</span>
                <div className="text-2xl font-bold text-rose-400 mt-1 mono-font">
                  {labBottleneck.pendingTasks} Pending Tests
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Threshold: &gt; {labBottleneck.normalThreshold} tests triggers critical bottleneck alert.
                </p>
              </div>
              <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (labBottleneck.pendingTasks / 40) * 100)}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between lg:col-span-2">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Diagnostic Insight & Root Cause</span>
                <p className="text-sm font-semibold text-rose-300 mt-1 leading-snug">
                  "{labBottleneck.description}"
                </p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  <strong className="text-slate-100">Flow Mechanics:</strong> {labBottleneck.rootCause}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <span className="text-amber-400 font-semibold">Downstream Affected:</span>
                <span>Emergency Care, ICU Admissions, OPD Fever Clinic, General Ward A</span>
              </div>
            </div>
          </div>

          {/* Actionable Mitigations */}
          <div className="bg-slate-950/90 rounded-2xl p-5 border border-rose-500/20">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI-Recommended Chokepoint Mitigations (1-Click Action)
                </h4>
              </div>
              <span className="text-xs text-slate-400">Admin Approval Required</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labBottleneck.suggestedActions.map((act) => (
                <div 
                  key={act.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h5 className="text-sm font-bold text-slate-100">{act.title}</h5>
                      <span className="badge badge-emerald text-[10px] py-0.5">{act.impact}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {act.description}
                    </p>
                  </div>

                  <button
                    onClick={() => resolveBottleneckAction(labBottleneck.id, act.id)}
                    disabled={labBottleneck.status === 'resolved'}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      labBottleneck.status === 'resolved'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'btn-primary shadow-cyan-500/20'
                    }`}
                  >
                    {labBottleneck.status === 'resolved' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Mitigation Applied & Queue Cleared</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Deploy This Mitigation Now</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ALL DEPARTMENTS QUEUE COMPARISON */}
      <div className="glass-panel p-5 border-slate-800/80">
        <h3 className="text-base font-bold text-white mb-3 font-['Outfit']">
          Hospital Department Queue & Waiting Time Telemetry
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Cross-department comparison demonstrating why the Laboratory is the primary active bottleneck while other departments remain within normal parameters.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => {
            const isLab = dept.id === 'lab';
            const isEmerg = dept.id === 'emergency';

            return (
              <div 
                key={dept.id}
                className={`p-4 rounded-xl border ${
                  isLab 
                    ? 'bg-rose-950/30 border-rose-500/50' 
                    : isEmerg 
                    ? 'bg-amber-950/30 border-amber-500/40' 
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">{dept.name}</span>
                  <span className={`badge ${
                    isLab ? 'badge-red' : isEmerg ? 'badge-amber' : 'badge-emerald'
                  } text-[10px]`}>
                    {dept.avgWaitTime}
                  </span>
                </div>

                <div className="text-xl font-bold metric-value text-white mt-1">
                  {dept.patientCount} <span className="text-xs font-normal text-slate-400">active tasks</span>
                </div>

                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`font-semibold ${
                    isLab ? 'text-rose-400' : isEmerg ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {dept.statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
