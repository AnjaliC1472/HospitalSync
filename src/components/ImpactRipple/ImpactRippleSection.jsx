import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  AlertOctagon, 
  BedDouble, 
  Layers, 
  UserCheck, 
  Clock, 
  ArrowDown, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  Sparkles,
  GitMerge,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export const ImpactRippleSection = () => {
  const { data, triggerCascadeScenario, activeScenario } = useHospital();
  const { impactRipples, kpis } = data;
  const cascade = impactRipples.activeCascade;

  const nodeIcons = {
    BedDouble: BedDouble,
    AlertOctagon: AlertOctagon,
    Layers: Layers,
    UserCheck: UserCheck,
    Clock: Clock
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <GitMerge className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                🔄 Cross-Department Impact Ripple & Emergency Cascades
              </h2>
              <p className="text-xs text-slate-400">
                Visualizes how an operational disruption in one department ripples across admission pipelines, staffing, and patient waiting times in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Scenario Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => triggerCascadeScenario('icu_crunch')}
            className={`text-xs px-3.5 py-2 rounded-xl font-semibold border transition-all flex items-center gap-1.5 ${
              activeScenario === 'icu_crunch'
                ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-950/60'
                : 'bg-slate-900/80 text-rose-300 border-rose-500/30 hover:border-rose-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate ICU Crunch</span>
          </button>

          <button
            onClick={() => triggerCascadeScenario('mass_casualty')}
            className={`text-xs px-3.5 py-2 rounded-xl font-semibold border transition-all flex items-center gap-1.5 ${
              activeScenario === 'mass_casualty'
                ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950/60'
                : 'bg-slate-900/80 text-amber-300 border-amber-500/30 hover:border-amber-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Trauma Surge</span>
          </button>

          <button
            onClick={() => triggerCascadeScenario('reset')}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Telemetry</span>
          </button>
        </div>
      </div>

      {/* ACTIVE IMPACT ALERT NOTIFICATION BANNER */}
      <div className="glass-panel p-5 border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/60 via-slate-950 to-slate-950 shadow-xl shadow-amber-950/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
            <ShieldAlert className="w-7 h-7 animate-bounce" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-amber text-xs font-bold uppercase">Critical Ripple Propagation</span>
              <span className="text-xs text-slate-400">Trigger: {cascade.origin}</span>
            </div>
            <h3 className="text-lg font-bold text-amber-200">
              {cascade.headline}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              When an ICU bed becomes unavailable, the disruption doesn't stay confined to critical care. It causes a multi-tiered bottleneck downstream across triage, doctor assignments, and hospital waiting times.
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE DIRECTED RIPPLE GRAPH */}
      <div className="glass-panel p-6 border-slate-800/80">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
              <span>Dynamic Causality Chain & Flow Propagation</span>
              <span className="badge badge-cyan text-xs">Zero-Refresh Live Cascade</span>
            </h3>
            <p className="text-xs text-slate-400">Trace the domino effect through interconnected hospital departments.</p>
          </div>
          <span className="badge badge-red text-xs py-1 px-2.5">
            Estimated TAT Impact: +35 mins
          </span>
        </div>

        {/* Step-by-Step Directed Graph Nodes */}
        <div className="flex flex-col items-center gap-3 relative max-w-2xl mx-auto py-2">
          {cascade.nodes.map((node, index) => {
            const Icon = nodeIcons[node.icon] || AlertOctagon;
            const isDanger = node.status === 'danger';
            const isLast = index === cascade.nodes.length - 1;

            return (
              <React.Fragment key={node.id}>
                
                {/* Node Box */}
                <div className={`w-full p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] shadow-xl ${
                  isDanger 
                    ? 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-950 border-rose-500/50 shadow-rose-950/20' 
                    : 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 border-amber-500/40 shadow-amber-950/20'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        isDanger ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 mono-font">0{index + 1}.</span>
                          <h4 className="text-sm font-bold text-white">{node.name}</h4>
                          <span className={`badge ${isDanger ? 'badge-red' : 'badge-amber'} text-[10px] py-0.5`}>
                            {node.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Arrow Connector */}
                {!isLast && (
                  <div className="flex flex-col items-center my-0.5">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-rose-500 via-amber-400 to-cyan-400"></div>
                    <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce" />
                  </div>
                )}

              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Downstream Mitigation & AI Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel p-5 border-slate-800/80">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Automated Mitigation Strategy</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            To break the cascade, HospitalSync suggests:
          </p>
          <ul className="mt-3 space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">1.</span>
              <span>Fast-track discharge or step-down clearance for <strong>Patient Ananya Iyer</strong> (ICU Bed 02) to Ward A.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">2.</span>
              <span>Reassign 2 nurses from Ward B to Emergency to manage the holding queue.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">3.</span>
              <span>Direct non-critical walk-in triage cases to OPD Fast-Track bays.</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel p-5 border-slate-800/80">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <span>Projected Hospital-Wide Metrics</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400">Emergency Wait Time</div>
              <div className="text-lg font-bold text-rose-400 mt-1 mono-font">+35 mins (Surging)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400">ICU Bed Availability</div>
              <div className="text-lg font-bold text-rose-400 mt-1 mono-font">0 Beds (Critical)</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
