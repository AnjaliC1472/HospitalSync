import React, { useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  X, 
  Smartphone, 
  Bell, 
  Calendar, 
  Pill, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  Send, 
  ShieldCheck, 
  Wifi, 
  Battery, 
  Signal, 
  Phone,
  MessageSquare
} from 'lucide-react';

export const PatientMobileDrawer = () => {
  const { 
    isMobileDrawerOpen, 
    setIsMobileDrawerOpen, 
    selectedPatient, 
    setSelectedPatientId, 
    data, 
    mobileActiveNotification, 
    setMobileActiveNotification,
    markDoseTaken,
    isAudioEnabled 
  } = useHospital();

  // Play synthetic pleasant chime on notification if audio enabled
  useEffect(() => {
    if (isMobileDrawerOpen && mobileActiveNotification && isAudioEnabled) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (err) {
        console.warn("Audio Context blocked by browser policy", err);
      }
    }
  }, [mobileActiveNotification, isMobileDrawerOpen, isAudioEnabled]);

  if (!isMobileDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      
      {/* Mobile Frame Container */}
      <div className="relative w-full max-w-sm h-[94vh] bg-slate-950 border-4 border-slate-700 rounded-[40px] shadow-2xl overflow-hidden flex flex-col justify-between">
        
        {/* Top Phone Notch / Dynamic Island */}
        <div className="pt-2.5 pb-1 px-6 bg-slate-950 flex items-center justify-between text-[11px] text-slate-300 select-none border-b border-slate-900">
          <span className="font-bold">09:41</span>
          
          {/* Speaker / Camera Notch */}
          <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-800"></div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400">Jio 5G</span>
            <Wifi className="w-3 h-3 text-slate-300" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Close Button Header */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              HS
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                HospitalSync Mobile App
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                {selectedPatient.name} ({selectedPatient.primaryMobile})
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phone Content Screen */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 text-xs">
          
          {/* Active Incoming Medicine Time Alarm Popup */}
          {mobileActiveNotification?.type === 'medicine_alarm' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-amber-950/60 border-2 border-amber-500 shadow-xl shadow-amber-950/50 animate-bounce">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Bell className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="badge badge-amber text-[9px] py-0.5">Live Medicine Alarm</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">Dose Reminder Alert</h4>
                  </div>
                </div>
                <span className="mono-font text-xs font-bold text-amber-400">{mobileActiveNotification.scheduledTime}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/30 my-2">
                <div className="text-sm font-extrabold text-amber-300">
                  {mobileActiveNotification.medicine}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  {mobileActiveNotification.instructions}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => markDoseTaken(mobileActiveNotification.patientId, mobileActiveNotification.alarmId)}
                  className="btn-success text-xs py-1.5 px-3 flex-1 justify-center flex items-center gap-1 font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Take Dose</span>
                </button>

                <button
                  onClick={() => setMobileActiveNotification(null)}
                  className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
                >
                  Snooze 10m
                </button>
              </div>
            </div>
          )}

          {/* Active Incoming SMS / WhatsApp Appointment Push */}
          {mobileActiveNotification?.type === 'appointment_sms' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/60 border-2 border-cyan-400 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="badge badge-cyan text-[9px] py-0.5">SMS & WhatsApp Delivered</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">Appointment Notification</h4>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1 my-2">
                <p>
                  <strong>Namaste {selectedPatient.name},</strong>
                </p>
                <p>
                  Your clinical consultation with <strong className="text-cyan-300">{mobileActiveNotification.doctor}</strong> is scheduled on:
                </p>
                <div className="font-bold text-white text-xs mono-font pt-1">
                  📅 {mobileActiveNotification.date} at {mobileActiveNotification.time}
                </div>
                <div className="text-slate-400">
                  📍 {mobileActiveNotification.roomNo} ({mobileActiveNotification.department})
                </div>
                <p className="pt-1 text-[10px] text-slate-400">
                  Instructions: {mobileActiveNotification.instructions}
                </p>
              </div>

              <button
                onClick={() => setMobileActiveNotification(null)}
                className="btn-secondary text-xs py-1 px-3 w-full justify-center mt-2"
              >
                Dismiss Message
              </button>
            </div>
          )}

          {/* Patient Quick Vitals & Status */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Patient Digital Health Pass
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{selectedPatient.name}</div>
                <div className="text-[11px] text-slate-400">ID: {selectedPatient.id} • {selectedPatient.bloodGroup}</div>
              </div>
              <span className={`badge ${
                selectedPatient.triageLevel.includes('Red') ? 'badge-red' : 'badge-emerald'
              } text-[9px]`}>
                {selectedPatient.triageLevel.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Scheduled Daily Alarms on Phone */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Daily Medicine Alarms
              </span>
              <span className="text-[10px] text-cyan-400">Auto-Synced</span>
            </div>

            <div className="space-y-1.5">
              {selectedPatient.medicineAlarms.map((alm) => (
                <div key={alm.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span className="mono-font">{alm.time}</span>
                    </div>
                    <div className="text-slate-400 mt-0.5">{alm.medicine}</div>
                  </div>

                  {alm.taken ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Taken
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Scheduled</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptions Pocket View in ₹ INR */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Active Doctor Rx (₹ INR)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                ₹{selectedPatient.prescriptions.reduce((a, b) => a + (b.priceINR || 0), 0)} Total
              </span>
            </div>

            <div className="space-y-1.5">
              {selectedPatient.prescriptions.slice(0, 3).map((rx) => (
                <div key={rx.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-semibold text-slate-200">{rx.medicineName}</div>
                    <div className="text-[10px] text-slate-400">{rx.dosage} • {rx.frequency}</div>
                  </div>
                  <span className="font-bold text-emerald-400 mono-font">₹{rx.priceINR}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Phone Bottom Home Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-900 flex justify-center">
          <div className="w-32 h-1 bg-slate-700 rounded-full"></div>
        </div>

      </div>

    </div>
  );
};
