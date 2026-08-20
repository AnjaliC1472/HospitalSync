import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  TrendingDown, 
  ShieldCheck, 
  Building2, 
  Clock,
  Layers,
  Check
} from 'lucide-react';

export const RecommendationsSection = () => {
  const { data, approveNurseReallocation, setIsReallocationModalOpen } = useHospital();
  const { aiRecommendations } = data;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-panel p-5 border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                🧠 AI Smart Resource Reallocation & Overcrowding Mitigation
              </h2>
              <p className="text-xs text-slate-400">
                Continuous AI telemetry analyzing ward capacity disparities and recommending staffing adjustments to reduce hospital bottlenecks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge badge-emerald text-xs py-1 px-3">
            Human-in-the-Loop Admin Approval
          </span>
        </div>
      </div>

      {/* AI Recommendations List */}
      <div className="grid grid-cols-1 gap-5">
        {aiRecommendations.map((rec) => {
          const isApproved = rec.status === 'approved';
          const isStaffing = rec.type === 'staffing';

          return (
            <div
              key={rec.id}
              className={`glass-panel p-6 border-2 transition-all ${
                isApproved 
                  ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-900' 
                  : 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-slate-900 glass-panel-glow-cyan'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${isApproved ? 'badge-emerald' : 'badge-amber'} text-xs font-bold`}>
                      {rec.badge}
                    </span>
                    <span className="text-xs text-slate-400">Priority: {rec.priority.toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{rec.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {isApproved ? (
                    <span className="badge badge-emerald py-1 px-3 text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Approved & Applied Live
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsReallocationModalOpen(true)}
                      className="btn-primary text-xs py-2 px-4 shadow-cyan-500/30 font-bold"
                    >
                      <span>Review & Approve</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Summary & Comparison */}
              <div className="my-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-sm font-semibold text-cyan-200 leading-relaxed">
                  "{rec.summary}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Origin Department:</span>
                    <div className="font-semibold text-emerald-400 mt-0.5">{rec.sourceDepartment}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Destination Department:</span>
                    <div className="font-semibold text-rose-400 mt-0.5">{rec.targetDepartment}</div>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-xs text-slate-300">
                  <strong className="text-cyan-400">AI Operational Rationale:</strong> {rec.aiRationale}
                </div>
              </div>

              {/* Projected Impact Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-emerald-400 font-bold text-sm">{rec.projectedImpact.triageWaitReduction}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Triage Delay Reduction</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold text-sm">{rec.projectedImpact.crowdingIndexReduction}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Overcrowding Index</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-purple-400 font-bold text-sm">{rec.projectedImpact.patientSafetyScore}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Clinical Safety Response</div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
