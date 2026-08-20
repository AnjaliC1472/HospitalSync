import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  AlertCircle, 
  AlertOctagon, 
  Bed, 
  Activity, 
  Zap, 
  HeartPulse, 
  Clock, 
  Users, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const EmergencySection = () => {
  const { 
    data, 
    triggerCascadeScenario, 
    setIsReallocationModalOpen, 
    setSelectedPatientId, 
    setActiveTab, 
    activeScenario 
  } = useHospital();

  const { kpis, departments, patients, impactRipples } = data;
  const emergDept = departments.find(d => d.id === 'emergency');
  const emergencyPatients = patients.filter(p => p.department === 'emergency');
  const cascade = impactRipples.activeCascade;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Top Emergency Command Header */}
      <div className="glass-panel p-5 border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                Emergency Trauma Command & Red Cascades
              </h2>
              <p className="text-xs text-slate-400">
                High-acuity triage, resuscitation bay telemetry, and real-time cross-ward emergency coordination.
              </p>
            </div>
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsReallocationModalOpen(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-cyan-500/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Request Ward B Nurses</span>
          </button>

          <button
            onClick={() => triggerCascadeScenario('mass_casualty')}
            className={`text-xs px-3 py-2 rounded-xl font-semibold border transition-all flex items-center gap-1.5 ${
              activeScenario === 'mass_casualty'
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-slate-900 text-rose-300 border-rose-500/40 hover:border-rose-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>🚨 Mass Casualty Influx</span>
          </button>
        </div>
      </div>

      {/* Triage & Capacity Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 border-rose-500/50 bg-rose-950/20">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span>Level 1: Red (Critical)</span>
            <span className="badge badge-red text-[10px]">Immediate</span>
          </div>
          <div className="text-3xl font-extrabold metric-value text-rose-400 mt-2">
            {emergDept?.triageRed || 6} <span className="text-xs text-slate-400 font-normal">Patients</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Resuscitation & cardiac arrest protocols</p>
        </div>

        <div className="glass-panel p-4 border-amber-500/40 bg-amber-950/20">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Level 2: Yellow (Urgent)</span>
            <span className="badge badge-amber text-[10px]">Within 30m</span>
          </div>
          <div className="text-3xl font-extrabold metric-value text-amber-300 mt-2">
            {emergDept?.triageYellow || 8} <span className="text-xs text-slate-400 font-normal">Patients</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Fractures, severe abdominal pain, high pyrexia</p>
        </div>

        <div className="glass-panel p-4 border-emerald-500/40 bg-emerald-950/20">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>Level 3: Green (Standard)</span>
            <span className="badge badge-emerald text-[10px]">Stable</span>
          </div>
          <div className="text-3xl font-extrabold metric-value text-emerald-400 mt-2">
            {emergDept?.triageGreen || 4} <span className="text-xs text-slate-400 font-normal">Patients</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Minor lacerations, routine vital evaluations</p>
        </div>

        <div className="glass-panel p-4 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Emergency Staffing</span>
            <span className="badge badge-cyan text-[10px]">Live</span>
          </div>
          <div className="text-2xl font-bold metric-value text-white mt-2">
            {emergDept?.doctorsOnDuty} Docs • {emergDept?.nursesOnDuty} Nurses
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Chief: Dr. Rajesh Sharma</p>
        </div>

      </div>

      {/* 🔄 EMERGENCY IMPACT CASCADE HIGHLIGHT */}
      <div className="glass-panel p-5 border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-900">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="badge badge-amber text-[10px]">Emergency Cascade Trigger</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Active Impact Cascade: ICU Bed Crunch ➔ Emergency Overcrowding
              </h3>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('journey')}
            className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>View Full Journey Impact</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chain explanation */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
            <span className="text-rose-400 font-bold">1. Origin</span>
            <div className="font-semibold text-white mt-1">ICU Bed Unavailable</div>
            <p className="text-[11px] text-slate-400 mt-1">All 12 beds occupied</p>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
            <span className="text-rose-400 font-bold">2. Immediate Effect</span>
            <div className="font-semibold text-white mt-1">Emergency Admission Blocked</div>
            <p className="text-[11px] text-slate-400 mt-1">Trauma hold in Bay 1</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40">
            <span className="text-amber-400 font-bold">3. Secondary Ripple</span>
            <div className="font-semibold text-white mt-1">Bed Allocation Frozen</div>
            <p className="text-[11px] text-slate-400 mt-1">Ward step-downs delayed</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40">
            <span className="text-amber-400 font-bold">4. Resource Strain</span>
            <div className="font-semibold text-white mt-1">Doctor Planning Diverted</div>
            <p className="text-[11px] text-slate-400 mt-1">Intensive bedside coverage</p>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
            <span className="text-rose-400 font-bold">5. Hospital Impact</span>
            <div className="font-semibold text-white mt-1">Waiting Time May Increase</div>
            <p className="text-[11px] text-slate-400 mt-1">+35m avg wait surge</p>
          </div>
        </div>
      </div>

      {/* Critical Emergency Patients Table */}
      <div className="glass-panel p-5 border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
            <Users className="w-4 h-4 text-rose-400" />
            <span>High-Priority Emergency Patients (Triage Queue)</span>
          </h3>
          <span className="text-xs text-slate-400">All Indian Patient Registry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Patient ID</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Triage</th>
                <th className="py-2.5 px-3">Chief Complaint</th>
                <th className="py-2.5 px-3">Attending Doctor</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {emergencyPatients.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300">{pt.id}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{pt.name}</div>
                    <div className="text-[11px] text-slate-400">{pt.age}y • {pt.gender} • {pt.primaryMobile}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`badge ${
                      pt.triageLevel.includes('Red') ? 'badge-red' : 'badge-amber'
                    } text-[10px]`}>
                      {pt.triageLevel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{pt.chiefComplaint}</td>
                  <td className="py-3 px-3 font-semibold text-slate-200">{pt.attendingDoctor}</td>
                  <td className="py-3 px-3 font-mono text-amber-300">{pt.registrationDurationMinutes} mins</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedPatientId(pt.id);
                        setActiveTab('patients');
                      }}
                      className="btn-secondary text-[11px] py-1 px-2.5"
                    >
                      View Profile & Rx
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
