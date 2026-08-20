import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Building2, 
  Users, 
  Bed, 
  Clock, 
  Activity, 
  Stethoscope, 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2,
  ChevronRight,
  Flame
} from 'lucide-react';

export const DepartmentsSection = () => {
  const { data, setActiveTab, setSelectedPatientId } = useHospital();
  const { departments, kpis } = data;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-panel p-5 border-slate-800/80 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                Hospital Departmental Operations Grid
              </h2>
              <p className="text-xs text-slate-400">
                Live synchronized status of OPD, Emergency, Diagnostic Lab, Central Pharmacy, ICU, and Inpatient Wards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge badge-purple text-xs py-1 px-3">
            {departments.length} Active Departments
          </span>
          <span className="badge badge-cyan text-xs py-1 px-3">
            Zero-Refresh Sync
          </span>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const isCritical = dept.status === 'critical';
          const isWarning = dept.status === 'warning';

          return (
            <div
              key={dept.id}
              className={`glass-panel p-5 border transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between ${
                isCritical 
                  ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/30 via-slate-950 to-slate-900 glass-panel-glow-rose' 
                  : isWarning 
                  ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-900 glass-panel-glow-amber' 
                  : 'border-slate-800/80 bg-slate-950/70 hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-[10px] text-cyan-400 tracking-wider font-bold">{dept.code}</span>
                    <h3 className="text-base font-bold text-white">{dept.name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                      <span>HOD: <strong className="text-slate-300">{dept.head}</strong></span>
                    </div>
                  </div>

                  <span className={`badge ${
                    isCritical ? 'badge-red' : isWarning ? 'badge-amber' : 'badge-emerald'
                  } text-[10px] py-1 px-2.5 font-bold`}>
                    {dept.statusLabel}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 my-3 text-xs">
                  <div>
                    <span className="text-slate-400">Active Queue / Patients:</span>
                    <div className="text-xl font-bold metric-value text-white mt-0.5">
                      {dept.patientCount}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg Wait Time:</span>
                    <div className={`text-xl font-bold metric-value mt-0.5 ${
                      isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {dept.avgWaitTime}
                    </div>
                  </div>
                </div>

                {/* Staffing Allocation */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
                  <span>Clinical Staff on Duty:</span>
                  <span className="text-slate-200 font-semibold">
                    {dept.doctorsOnDuty} Doctors • {dept.nursesOnDuty} Nurses
                  </span>
                </div>

                {/* Bed Allocation if applicable */}
                {dept.totalBeds !== undefined && (
                  <div className="mb-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>Bed Occupancy:</span>
                      <span className="font-bold text-emerald-400">
                        {dept.availableBeds} Available <span className="text-slate-500 font-normal">/ {dept.totalBeds}</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          ((dept.totalBeds - dept.availableBeds) / dept.totalBeds) >= 0.9 ? 'bg-rose-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, ((dept.totalBeds - dept.availableBeds) / dept.totalBeds) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Critical Alert notice */}
                {dept.criticalAlert && (
                  <div className={`p-2 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 ${
                    isCritical 
                      ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' 
                      : isWarning 
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' 
                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  }`}>
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{dept.criticalAlert}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Load: {dept.capacityPct}%</span>
                <button
                  onClick={() => {
                    if (dept.id === 'lab') setActiveTab('bottlenecks');
                    else if (dept.id === 'emergency') setActiveTab('emergency');
                    else setActiveTab('patients');
                  }}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
