import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { X, UserPlus, Phone, ShieldCheck, HeartPulse, Clock, Sparkles } from 'lucide-react';

export const NewPatientModal = () => {
  const { isNewPatientModalOpen, setIsNewPatientModalOpen, registerPatient } = useHospital();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'B+',
    primaryMobile: '',
    emergencyContactName: '',
    emergencyContactMobile: '',
    department: 'emergency',
    triageLevel: 'Yellow (Urgent)',
    chiefComplaint: '',
    attendingDoctor: 'Dr. Rajesh Sharma',
    bp: '120/80 mmHg',
    pulse: '78 bpm',
    spo2: '98%',
    temp: '98.6°F'
  });

  if (!isNewPatientModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.primaryMobile) {
      alert("Please enter patient name and primary mobile number");
      return;
    }
    registerPatient(formData);
    setIsNewPatientModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel p-6 border-cyan-500/40 bg-slate-950/95 shadow-2xl rounded-2xl border-2 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setIsNewPatientModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <span className="badge badge-cyan text-xs font-bold">New Admission Registration</span>
            <h3 className="text-xl font-bold text-white font-['Outfit'] mt-0.5">
              Patient Registration & Emergency Intake Form
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Patient Personal Details */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              1. Patient Demographics (Indian Registry)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Full Name (e.g. Vikram Malhotra) *</label>
                <input
                  type="text"
                  required
                  placeholder="Patient Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Age & Gender</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-1/2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-1/2 px-2 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Numbers (Primary + Alternate Emergency Contact) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-cyan-400" />
                  Primary Mobile Number (For Alarms & SMS) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.primaryMobile}
                  onChange={(e) => setFormData({ ...formData, primaryMobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-rose-400" />
                  Alternate / Emergency Contact Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98111 22334"
                  value={formData.emergencyContactMobile}
                  onChange={(e) => setFormData({ ...formData, emergencyContactMobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Department & Triage */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              2. Department Assignment & Clinical Triage
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Target Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="emergency">Emergency & Trauma</option>
                  <option value="opd">Outpatient OPD</option>
                  <option value="ward-a">General Ward A</option>
                  <option value="ward-b">General Ward B</option>
                  <option value="icu">ICU Critical Care</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Triage Priority</label>
                <select
                  value={formData.triageLevel}
                  onChange={(e) => setFormData({ ...formData, triageLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Red (Critical)">🔴 Red (Critical - Immediate)</option>
                  <option value="Yellow (Urgent)">🟡 Yellow (Urgent - Within 30m)</option>
                  <option value="Green (Standard)">🟢 Green (Standard - Stable)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Attending Doctor</label>
                <select
                  value={formData.attendingDoctor}
                  onChange={(e) => setFormData({ ...formData, attendingDoctor: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Emergency)</option>
                  <option value="Dr. Priya Patel">Dr. Priya Patel (Cardiology)</option>
                  <option value="Dr. Amit Deshmukh">Dr. Amit Deshmukh (Surgery)</option>
                  <option value="Dr. Sunita Rao">Dr. Sunita Rao (Critical Care)</option>
                  <option value="Dr. Neha Joshi">Dr. Neha Joshi (Paediatrics)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Chief Clinical Complaint</label>
              <input
                type="text"
                placeholder="e.g. Acute chest discomfort, high fever, abdominal pain"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Vitals */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span>3. Initial Nursing Vitals</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={formData.bp}
                  onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Pulse</label>
                <input
                  type="text"
                  value={formData.pulse}
                  onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">SpO2</label>
                <input
                  type="text"
                  value={formData.spo2}
                  onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Temperature</label>
                <input
                  type="text"
                  value={formData.temp}
                  onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewPatientModalOpen(false)}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-6 shadow-cyan-500/30 font-bold"
            >
              Complete Registration & Admit
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
