import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  ShieldCheck,
  Building2
} from 'lucide-react';

export const ResourceReallocationModal = () => {
  const { 
    isReallocationModalOpen, 
    setIsReallocationModalOpen, 
    data, 
    approveNurseReallocation 
  } = useHospital();

  if (!isReallocationModalOpen) return null;

  const rec = data.aiRecommendations.find(r => r.id === 'rec-nurse-realloc') || data.aiRecommendations[0];
  const isApproved = rec.status === 'approved';

  const handleApprove = () => {
    approveNurseReallocation(rec.id);
    setIsReallocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel p-6 border-cyan-500/40 bg-slate-950/95 shadow-2xl rounded-2xl border-2">
        
        {/* Close Button */}
        <button
          onClick={() => setIsReallocationModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <span className="badge badge-cyan text-xs font-bold">Smart Resource Reallocation</span>
            <h3 className="text-xl font-bold text-white font-['Outfit'] mt-0.5">
              AI Overcrowding & Nurse Deployment Advisor
            </h3>
          </div>
        </div>

        {/* Workload Disparity Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          
          {/* High Stress: Emergency */}
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Demand Surge Department</span>
              <span className="badge badge-red text-[10px]">High Workload 🔴</span>
            </div>
            <div className="text-base font-bold text-white">Emergency & Trauma Care</div>
            <div className="mt-2 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Patients:</span>
                <span className="font-semibold text-rose-400">18 Active (6 Red Triage)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nurses on Duty:</span>
                <span className="font-semibold text-slate-200">8 Nurses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacity Load:</span>
                <span className="font-semibold text-rose-400">94% (Near Saturation)</span>
              </div>
            </div>
          </div>

          {/* Low Workload: Ward B */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Surplus Staff Department</span>
              <span className="badge badge-emerald text-[10px]">Low Workload 🟢</span>
            </div>
            <div className="text-base font-bold text-white">General Inpatient Ward B</div>
            <div className="mt-2 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Patients:</span>
                <span className="font-semibold text-emerald-400">13 Stable Patients</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nurses on Duty:</span>
                <span className="font-semibold text-slate-200">6 Nurses (Surplus)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacity Load:</span>
                <span className="font-semibold text-emerald-400">32% (7 Beds Free)</span>
              </div>
            </div>
          </div>

        </div>

        {/* AI System Recommendation */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-cyan-300">
              💡 System Recommendation:
            </h4>
          </div>
          <p className="text-sm text-slate-100 font-semibold leading-relaxed">
            "2 available nurses from General Ward B can be temporarily assigned to Emergency."
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-bold text-white">Nurse Ananya Sen</div>
                <div className="text-[10px] text-slate-400">Senior Staff Nurse (Ward B)</div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-bold text-white">Nurse Rahul Varma</div>
                <div className="text-[10px] text-slate-400">Critical Care Certified (Ward B)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Projected Impact Matrix */}
        <div className="grid grid-cols-3 gap-3 mb-5 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-emerald-400 font-bold text-base">-58%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Triage Wait Time (26m ➔ 11m)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-emerald-400 font-bold text-base">74%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Reduced Overcrowding Index</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-cyan-400 font-bold text-base">+32%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Critical Red Responsiveness</div>
          </div>
        </div>

        {/* Administrator Decision Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
            The administrator makes the final decision. The system does not automatically move staff without approval.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsReallocationModalOpen(false)}
              className="btn-secondary text-xs py-2 px-4 flex-1 sm:flex-none justify-center"
            >
              Dismiss
            </button>
            <button
              onClick={handleApprove}
              disabled={isApproved}
              className={`btn-primary text-xs py-2 px-5 flex-1 sm:flex-none justify-center flex items-center gap-1.5 ${
                isApproved ? 'opacity-60 cursor-not-allowed' : 'shadow-cyan-500/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproved ? "Already Reallocated" : "Approve & Execute Shift"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
