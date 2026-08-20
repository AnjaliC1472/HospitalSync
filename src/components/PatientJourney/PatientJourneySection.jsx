import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Route, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  ArrowRight, 
  Pill, 
  Calendar, 
  Bell, 
  HeartPulse, 
  Phone
} from 'lucide-react';

export const PatientJourneySection = () => {
  const { 
    data, 
    selectedPatient, 
    setSelectedPatientId, 
    triggerMedicineAlarm, 
    sendAppointmentNotification,
    setActiveTab
  } = useHospital();

  const formattedRegTime = new Date(selectedPatient.registeredAt).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-panel p-5 border-slate-800/80 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                Patient Journey Tracking & Clinical Pathway
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end movement tracking across Registration, Triage, Clinical Consultation, Diagnostics, Pharmacy, and Ward Admissions.
              </p>
            </div>
          </div>
        </div>

        {/* Patient Switcher Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {data.patients.map((pt) => (
            <button
              key={pt.id}
              onClick={() => setSelectedPatientId(pt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedPatient.id === pt.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {pt.name} ({pt.id})
            </button>
          ))}
        </div>
      </div>

      {/* Selected Patient Identity Banner */}
      <div className="glass-panel p-5 border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-cyan-300 text-sm px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30">
                {selectedPatient.id}
              </span>
              <h3 className="text-xl font-bold text-white font-['Outfit']">{selectedPatient.name}</h3>
              <span className={`badge ${
                selectedPatient.triageLevel.includes('Red') ? 'badge-red' : selectedPatient.triageLevel.includes('Yellow') ? 'badge-amber' : 'badge-emerald'
              } text-xs`}>
                {selectedPatient.triageLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {selectedPatient.age}y • {selectedPatient.gender} • Blood: {selectedPatient.bloodGroup} • Attending: <strong className="text-cyan-300">{selectedPatient.attendingDoctor}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerMedicineAlarm(selectedPatient.id, selectedPatient.medicineAlarms[0]?.id)}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-300 border-amber-500/30 hover:border-amber-400"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alarm Push</span>
            </button>

            <button
              onClick={() => sendAppointmentNotification(selectedPatient.id)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-cyan-500/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointment SMS</span>
            </button>
          </div>
        </div>

        {/* Overall Journey Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Overall Clinical Pathway Completion</span>
            <span className="font-bold text-cyan-400 mono-font">{selectedPatient.journeyProgressPct}% Completed</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${selectedPatient.journeyProgressPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP PATIENT MOVEMENT TIMELINE */}
      <div className="glass-panel p-6 border-slate-800/80">
        <h3 className="text-base font-bold text-white mb-6 font-['Outfit'] flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Chronological Journey Steps & Station Dwell Times</span>
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-emerald-400 before:to-slate-800">
          {selectedPatient.journeySteps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in-progress';
            const isPending = step.status === 'pending';

            return (
              <div key={index} className="relative group">
                
                {/* Step Marker Dot */}
                <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-300 shadow-md shadow-emerald-500/50' 
                    : isInProgress 
                    ? 'bg-amber-400 border-amber-200 animate-ping' 
                    : 'bg-slate-900 border-slate-700'
                }`}></div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-900/60 border-slate-800/80'
                    : isInProgress
                    ? 'bg-gradient-to-r from-amber-950/30 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/30'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="mono-font text-xs font-bold text-slate-500">0{index + 1}.</span>
                      <h4 className={`text-sm font-bold ${isInProgress ? 'text-amber-300' : 'text-white'}`}>
                        {step.name}
                      </h4>
                      <span className={`badge ${
                        isCompleted ? 'badge-emerald' : isInProgress ? 'badge-amber' : 'badge-cyan'
                      } text-[10px] py-0.5 px-2`}>
                        {step.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 mono-font">{step.timestamp}</span>
                      <span className="text-slate-500">•</span>
                      <span className="font-semibold text-cyan-300">{step.duration}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
