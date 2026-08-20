import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Stethoscope, 
  Users, 
  Bed, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Clock, 
  Building2,
  Activity,
  ArrowUpDown
} from 'lucide-react';

export const ResourcesSection = () => {
  const { data, setIsReallocationModalOpen } = useHospital();
  const { resources, kpis } = data;
  const [activeTab, setActiveTab] = useState('all'); // all, doctors, nurses, beds, equipment

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Top Header Banner */}
      <div className="glass-panel p-5 border-slate-800/80 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                Hospital Resources & Clinical Staff Roster
              </h2>
              <p className="text-xs text-slate-400">
                Live availability of Indian medical staff, critical care beds, operation theatres, and advanced diagnostic devices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReallocationModalOpen(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-cyan-500/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>AI Resource Optimizer</span>
          </button>
        </div>
      </div>

      {/* Resource Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Resources', count: null },
          { id: 'doctors', label: 'Doctors', count: resources.doctors.length },
          { id: 'nurses', label: 'Nurses & Staff', count: resources.nurses.length },
          { id: 'beds', label: 'Beds & Wards', count: `${resources.beds.available} Available` },
          { id: 'equipment', label: 'Medical Equipment', count: resources.equipment.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label} {tab.count && <span className="ml-1.5 opacity-80">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* 1. DOCTORS DIRECTORY */}
      {(activeTab === 'all' || activeTab === 'doctors') && (
        <div className="glass-panel p-5 border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>Consultant Doctors & Surgeons</span>
            </h3>
            <span className="text-xs text-slate-400">All Registered Staff (Indian Medical Registry)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.doctors.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{doc.name}</h4>
                      <div className="text-xs text-cyan-400 font-medium">{doc.specialty}</div>
                      <div className="text-[11px] text-slate-400">{doc.role}</div>
                    </div>
                    <span className="badge badge-emerald text-[10px] py-0.5">On Duty</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-slate-200 font-medium">{doc.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shift:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{doc.shift}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {doc.contact}
                  </span>
                  <span className="text-cyan-400 font-semibold text-[11px]">Direct Page</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. NURSING ROSTER */}
      {(activeTab === 'all' || activeTab === 'nurses') && (
        <div className="glass-panel p-5 border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Nursing Staff & Critical Duty Roster</span>
            </h3>
            <button
              onClick={() => setIsReallocationModalOpen(true)}
              className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Reallocate Nurses
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.nurses.map((nurse) => {
              const isReallocated = nurse.status.includes('Reallocated') || nurse.status.includes('Available');
              return (
                <div 
                  key={nurse.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    isReallocated 
                      ? 'bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400' 
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{nurse.name}</h4>
                      <div className="text-xs text-purple-300 font-medium">{nurse.role}</div>
                    </div>
                    <span className={`badge ${isReallocated ? 'badge-cyan' : 'badge-purple'} text-[10px]`}>
                      {nurse.department.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="text-slate-300 font-medium">{nurse.status}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {nurse.contact}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. BEDS MATRIX */}
      {(activeTab === 'all' || activeTab === 'beds') && (
        <div className="glass-panel p-5 border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
              <Bed className="w-4 h-4 text-emerald-400" />
              <span>Bed Availability & Ward Occupancy Matrix</span>
            </h3>
            <div className="text-xs text-emerald-400 font-bold">
              {resources.beds.available} Available / {resources.beds.total} Total Beds
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {resources.beds.breakdown.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="text-xs font-bold text-slate-200 truncate">{item.ward}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.type}</div>

                <div className="mt-3 flex items-end justify-between">
                  <div className="text-2xl font-bold metric-value text-white">
                    {item.available > 0 ? item.available : 0}
                    <span className="text-xs font-normal text-slate-400 ml-1">Free</span>
                  </div>
                  <span className="text-xs text-slate-400 mono-font">{item.occupied}/{item.total}</span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      (item.occupied / item.total) >= 0.9 ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, (item.occupied / item.total) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MEDICAL EQUIPMENT */}
      {(activeTab === 'all' || activeTab === 'equipment') && (
        <div className="glass-panel p-5 border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Advanced Medical Equipment & Diagnostic Systems</span>
            </h3>
            <span className="text-xs text-slate-400">Continuous IoT Health Telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.equipment.map((eq) => (
              <div key={eq.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{eq.name}</h4>
                    <div className="text-xs text-slate-400 font-medium">{eq.department}</div>
                  </div>
                  <span className="badge badge-emerald text-[10px]">Health: {eq.health}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>Status:</span>
                  <span className="text-cyan-300 font-semibold">{eq.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
