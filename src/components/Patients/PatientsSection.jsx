import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Users, 
  Search, 
  UserPlus, 
  Clock, 
  Phone, 
  Pill, 
  Calendar, 
  Bell, 
  Send, 
  HeartPulse, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ChevronRight, 
  Route,
  Activity
} from 'lucide-react';

export const PatientsSection = () => {
  const { 
    data, 
    selectedPatient, 
    selectedPatientId, 
    setSelectedPatientId, 
    setIsNewPatientModalOpen,
    triggerMedicineAlarm,
    sendAppointmentNotification,
    addPrescription,
    setActiveTab
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [triageFilter, setTriageFilter] = useState('all');
  const [isAddingRx, setIsAddingRx] = useState(false);
  const [newRx, setNewRx] = useState({
    medicineName: '',
    dosage: '500 mg',
    frequency: '1-0-1 (After Food)',
    duration: '5 Days',
    instructions: 'Take after meals with warm water.',
    priceINR: '120'
  });

  const filteredPatients = data.patients.filter(p => {
    const matchesQuery = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.primaryMobile.includes(searchQuery);
    const matchesTriage = triageFilter === 'all' || p.triageLevel.toLowerCase().includes(triageFilter.toLowerCase());
    return matchesQuery && matchesTriage;
  });

  const handleAddRxSubmit = (e) => {
    e.preventDefault();
    if (!newRx.medicineName) return;
    addPrescription(selectedPatient.id, newRx);
    setNewRx({
      medicineName: '',
      dosage: '500 mg',
      frequency: '1-0-1 (After Food)',
      duration: '5 Days',
      instructions: 'Take after meals with warm water.',
      priceINR: '120'
    });
    setIsAddingRx(false);
  };

  const formattedRegTime = new Date(selectedPatient.registeredAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                Patient Records, Prescriptions & Mobile Notifications
              </h2>
              <p className="text-xs text-slate-400">
                Instant Patient ID lookup, Indian mobile number notifications, live medicine alarms, and complete doctor prescriptions in Indian Rupees (₹).
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsNewPatientModalOpen(true)}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-cyan-500/30"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Main Layout: Left Patient List + Right Patient Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Search & Patient List (5 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          
          {/* Search Bar & Filters */}
          <div className="glass-panel p-3.5 border-slate-800/80 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Patient ID (HS-2026-881), Name, or Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
              {['all', 'red', 'yellow', 'green'].map((level) => (
                <button
                  key={level}
                  onClick={() => setTriageFilter(level)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase transition-all ${
                    triageFilter === level
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {level === 'all' ? 'All Triage' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Patients Scroll List */}
          <div className="flex flex-col gap-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredPatients.map((patient) => {
              const isSelected = patient.id === selectedPatientId;
              const isRed = patient.triageLevel.includes('Red');
              const isYellow = patient.triageLevel.includes('Yellow');

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300 text-xs">{patient.id}</span>
                        <span className={`badge ${
                          isRed ? 'badge-red' : isYellow ? 'badge-amber' : 'badge-emerald'
                        } text-[9px] py-0.5 px-1.5`}>
                          {patient.triageLevel.split(' ')[0]}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{patient.name}</h4>
                      <div className="text-[11px] text-slate-400">{patient.age}y • {patient.gender} • {patient.bloodGroup}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 mono-font">
                        {patient.departmentName.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[170px]">{patient.chiefComplaint}</span>
                    <span className="text-cyan-400 font-semibold text-[10px]">Select ➔</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Detailed Patient Profile (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Patient Overview Card */}
          <div className="glass-panel p-5 border-slate-800/80">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-cyan-400 text-sm px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30">
                    {selectedPatient.id}
                  </span>
                  <h3 className="text-xl font-bold text-white font-['Outfit']">{selectedPatient.name}</h3>
                  <span className={`badge ${
                    selectedPatient.triageLevel.includes('Red') ? 'badge-red' : selectedPatient.triageLevel.includes('Yellow') ? 'badge-amber' : 'badge-emerald'
                  } text-xs`}>
                    {selectedPatient.triageLevel}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>{selectedPatient.age} Years • {selectedPatient.gender} • Blood Group: <strong className="text-slate-200">{selectedPatient.bloodGroup}</strong></span>
                  <span>• Department: <strong className="text-cyan-300">{selectedPatient.departmentName}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('journey')}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-cyan-300 border-cyan-500/30 hover:border-cyan-400"
              >
                <Route className="w-3.5 h-3.5" />
                <span>Live Journey Tracker</span>
              </button>
            </div>

            {/* Registration Timestamp & Duration Elapsed Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Registration Date & Time:
                </span>
                <div className="font-bold text-slate-200 mt-1 mono-font">{formattedRegTime}</div>
              </div>

              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Time in Hospital (Duration):
                </span>
                <div className="font-bold text-amber-300 mt-1 mono-font">
                  {selectedPatient.registrationDurationMinutes} Minutes Elapsed
                </div>
              </div>

              <div>
                <span className="text-slate-400">Attending Doctor:</span>
                <div className="font-bold text-cyan-300 mt-1">{selectedPatient.attendingDoctor}</div>
              </div>
            </div>

            {/* Contact Details (Primary + Alternate Emergency Mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    Primary Mobile Number (Alarm / SMS):
                  </span>
                  <div className="font-bold text-slate-100 mt-0.5 mono-font">{selectedPatient.primaryMobile}</div>
                </div>
                <span className="badge badge-cyan text-[10px]">Verified</span>
              </div>

              <div className="flex items-center justify-between sm:border-l sm:border-slate-800 sm:pl-3">
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-rose-400" />
                    Emergency Contact ({selectedPatient.emergencyContactName}):
                  </span>
                  <div className="font-bold text-slate-100 mt-0.5 mono-font">{selectedPatient.emergencyContactMobile}</div>
                </div>
                <span className="badge badge-red text-[10px]">Alternate</span>
              </div>
            </div>

            {/* Vitals Telemetry */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                Live Patient Clinical Vitals
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">BP</div>
                  <div className="font-bold text-white font-mono">{selectedPatient.vitals.bp}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Pulse</div>
                  <div className="font-bold text-white font-mono">{selectedPatient.vitals.pulse}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">SpO2</div>
                  <div className="font-bold text-emerald-400 font-mono">{selectedPatient.vitals.spo2}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Temp</div>
                  <div className="font-bold text-white font-mono">{selectedPatient.vitals.temp}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">RBS</div>
                  <div className="font-bold text-amber-400 font-mono">{selectedPatient.vitals.rbs}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 💊 DOCTOR'S PRESCRIPTIONS TABLE (WITH DOSAGE, FREQUENCY, DURATION, INSTRUCTIONS, AND ₹ INR) */}
          <div className="glass-panel p-5 border-slate-800/80">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-400" />
                <h4 className="text-base font-bold text-white font-['Outfit']">
                  Doctor Prescriptions & Medication Schedule (₹ INR)
                </h4>
              </div>

              <button
                onClick={() => setIsAddingRx(!isAddingRx)}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingRx ? 'Cancel' : 'Add Medicine'}</span>
              </button>
            </div>

            {/* Inline Add Prescription Form */}
            {isAddingRx && (
              <form onSubmit={handleAddRxSubmit} className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 mb-4 space-y-3 text-xs">
                <div className="font-bold text-cyan-300">Add Prescribed Medication</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Medicine Name (e.g. Augmentin 625)"
                    value={newRx.medicineName}
                    onChange={(e) => setNewRx({ ...newRx, medicineName: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 625 mg)"
                    value={newRx.dosage}
                    onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g. 1-0-1 After Food)"
                    value={newRx.frequency}
                    onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Duration (e.g. 5 Days)"
                    value={newRx.duration}
                    onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                  />
                  <input
                    type="number"
                    placeholder="Cost in ₹ INR (e.g. 240)"
                    value={newRx.priceINR}
                    onChange={(e) => setNewRx({ ...newRx, priceINR: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Clinical Instructions"
                    value={newRx.instructions}
                    onChange={(e) => setNewRx({ ...newRx, instructions: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary text-xs py-1.5 px-4">
                    Save Prescription
                  </button>
                </div>
              </form>
            )}

            {/* Prescriptions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Medicine Name</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Instructions</th>
                    <th className="py-2.5 px-3 text-right">Price (₹ INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selectedPatient.prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{rx.medicineName}</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">{rx.dosage}</td>
                      <td className="py-2.5 px-3 text-slate-300">{rx.frequency}</td>
                      <td className="py-2.5 px-3 text-slate-400">{rx.duration}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{rx.instructions}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400 mono-font">
                        ₹{rx.priceINR}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Prescription Value in INR */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Prescription Cost:</span>
              <span className="text-sm font-extrabold text-emerald-400 mono-font">
                ₹{selectedPatient.prescriptions.reduce((acc, rx) => acc + (rx.priceINR || 0), 0)} INR
              </span>
            </div>
          </div>

          {/* 📱 MEDICINE TIME ALARMS & NEXT APPOINTMENT MOBILE NOTIFICATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Medicine Time Alarm Clock */}
            <div className="glass-panel p-5 border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">Medicine Time Alarms</h4>
                  </div>
                  <span className="badge badge-amber text-[10px]">Mobile Push</span>
                </div>

                <div className="space-y-2">
                  {selectedPatient.medicineAlarms.map((alm) => (
                    <div key={alm.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span className="mono-font">{alm.time}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{alm.medicine}</div>
                      </div>

                      <button
                        onClick={() => triggerMedicineAlarm(selectedPatient.id, alm.id)}
                        className="btn-secondary text-[11px] py-1 px-2.5 hover:border-amber-400 hover:text-amber-300"
                      >
                        🔔 Test Alarm
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3">
                Syncs with patient's registered mobile ({selectedPatient.primaryMobile}) with audible dose reminder.
              </p>
            </div>

            {/* Next Appointment Card & SMS Notification Trigger */}
            <div className="glass-panel p-5 border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">Next Hospital Appointment</h4>
                  </div>
                  <span className="badge badge-cyan text-[10px]">SMS & WhatsApp</span>
                </div>

                {selectedPatient.nextAppointment ? (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date & Time:</span>
                      <span className="font-bold text-white mono-font">
                        {selectedPatient.nextAppointment.scheduledDate} at {selectedPatient.nextAppointment.scheduledTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Doctor:</span>
                      <span className="font-semibold text-cyan-300">{selectedPatient.nextAppointment.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-slate-200">{selectedPatient.nextAppointment.roomNo}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <strong>Note:</strong> {selectedPatient.nextAppointment.instructions}
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No appointment scheduled.</div>
                )}
              </div>

              <button
                onClick={() => sendAppointmentNotification(selectedPatient.id)}
                className="btn-primary text-xs py-2 px-3.5 w-full mt-3 justify-center shadow-cyan-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS & WhatsApp Confirmation</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
