import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialHospitalData } from '../data/initialData';

const HospitalContext = createContext(null);

export const HospitalProvider = ({ children }) => {
  const [data, setData] = useState(initialHospitalData);
  const [selectedPatientId, setSelectedPatientId] = useState("HS-2026-881");
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, patients, departments, emergency, bottlenecks, resources, recommendations, journey
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [mobileActiveNotification, setMobileActiveNotification] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [activeScenario, setActiveScenario] = useState("default");
  const [liveClock, setLiveClock] = useState(new Date());
  const [toastMessage, setToastMessage] = useState(null);
  const [isReallocationModalOpen, setIsReallocationModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // Live timer for IST time and elapsed patient registration counters
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show Toast notification
  const showToast = useCallback((msg, type = "info") => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // 1. SMART RESOURCE REALLOCATION (Ward B -> Emergency)
  const approveNurseReallocation = useCallback((recId) => {
    setData((prev) => {
      const updatedRecs = prev.aiRecommendations.map((r) =>
        r.id === recId ? { ...r, status: "approved" } : r
      );

      // Shift 2 nurses from Ward B to Emergency
      const updatedNurses = prev.resources.nurses.map((nurse) => {
        if (nurse.id === "staff-n-3" || nurse.id === "staff-n-4") {
          return {
            ...nurse,
            department: "emergency",
            status: "Active in Emergency (Reallocated from Ward B) ⚡"
          };
        }
        return nurse;
      });

      // Update Departments
      const updatedDepts = prev.departments.map((dept) => {
        if (dept.id === "emergency") {
          return {
            ...dept,
            nursesOnDuty: dept.nursesOnDuty + 2,
            capacityPct: 74,
            status: "busy",
            statusLabel: "Stabilizing (Staff Boosted) 🟢",
            avgWaitTime: "18 mins"
          };
        }
        if (dept.id === "ward-b") {
          return {
            ...dept,
            nursesOnDuty: dept.nursesOnDuty - 2,
            statusLabel: "Optimized Workload 🟢"
          };
        }
        return dept;
      });

      // Update KPIs
      const updatedKpis = {
        ...prev.kpis,
        delayedCases: Math.max(2, prev.kpis.delayedCases - 4),
        avgWaitTimeMinutes: 20
      };

      const newActivity = {
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        text: "⚡ Smart Reallocation Executed: Nurse Ananya Sen & Nurse Rahul Varma deployed to Emergency. Wait time dropped to 18m.",
        type: "success",
        dept: "emergency"
      };

      return {
        ...prev,
        aiRecommendations: updatedRecs,
        resources: {
          ...prev.resources,
          nurses: updatedNurses
        },
        departments: updatedDepts,
        kpis: updatedKpis,
        recentActivityFeed: [newActivity, ...prev.recentActivityFeed]
      };
    });

    showToast("Smart Reallocation Applied: 2 Nurses reassigned to Emergency!", "success");
  }, [showToast]);

  // 2. RESOLVE BOTTLENECK ACTION
  const resolveBottleneckAction = useCallback((bottleneckId, actionId) => {
    setData((prev) => {
      const updatedBottlenecks = prev.bottlenecks.map((bot) => {
        if (bot.id === bottleneckId) {
          return {
            ...bot,
            severity: "normal",
            status: "resolved",
            badgeText: "Bottleneck Mitigated: Normal Flow Restored",
            pendingTasks: 14,
            avgWaitTime: "16 minutes"
          };
        }
        return bot;
      });

      const updatedDepts = prev.departments.map((d) => {
        if (d.id === "lab") {
          return {
            ...d,
            status: "normal",
            statusLabel: "Queue Cleared 🟢",
            patientCount: 14,
            avgWaitTime: "16 mins",
            criticalAlert: "Phlebotomy Bay 3 Operating - Queue Normalized"
          };
        }
        return d;
      });

      const updatedKpis = {
        ...prev.kpis,
        pendingLabTests: 14,
        delayedCases: Math.max(1, prev.kpis.delayedCases - 3)
      };

      const newActivity = {
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        text: "✅ Laboratory Bottleneck Cleared: Auxiliary collection bay active. Lab queue normalized to 14 tests.",
        type: "success",
        dept: "lab"
      };

      return {
        ...prev,
        bottlenecks: updatedBottlenecks,
        departments: updatedDepts,
        kpis: updatedKpis,
        recentActivityFeed: [newActivity, ...prev.recentActivityFeed]
      };
    });

    showToast("Laboratory action deployed! Pending tests reduced from 37 to 14.", "success");
  }, [showToast]);

  // 3. TRIGGER IMPACT CASCADE SCENARIOS
  const triggerCascadeScenario = useCallback((scenarioType) => {
    setActiveScenario(scenarioType);

    if (scenarioType === "icu_crunch") {
      setData((prev) => {
        const updatedDepts = prev.departments.map((d) => {
          if (d.id === "icu") {
            return {
              ...d,
              patientCount: 12,
              availableBeds: 0,
              status: "critical",
              statusLabel: "100% Full 🔴",
              criticalAlert: "ZERO ICU Beds Available - Admissions Paused"
            };
          }
          if (d.id === "emergency") {
            return {
              ...d,
              avgWaitTime: "52 mins",
              criticalAlert: "Severe ICU Hold Backlog in Bay 1 & 2"
            };
          }
          return d;
        });

        const updatedKpis = {
          ...prev.kpis,
          availableBeds: 11,
          delayedCases: 14,
          avgWaitTimeMinutes: 44
        };

        const newActivity = {
          id: `act-${Date.now()}`,
          timestamp: "Just now",
          text: "⚠️ Cascade Alert: ICU reached 0 available beds. Emergency admissions holding patients.",
          type: "danger",
          dept: "icu"
        };

        return {
          ...prev,
          departments: updatedDepts,
          kpis: updatedKpis,
          recentActivityFeed: [newActivity, ...prev.recentActivityFeed]
        };
      });

      showToast("Impact Ripple Active: ICU Full ➔ Emergency admissions delayed!", "danger");
    } else if (scenarioType === "mass_casualty") {
      setData((prev) => {
        const updatedDepts = prev.departments.map((d) => {
          if (d.id === "emergency") {
            return {
              ...d,
              patientCount: 26,
              triageRed: 11,
              status: "critical",
              statusLabel: "CRITICAL SURGE 🔴",
              capacityPct: 115,
              criticalAlert: "Mass Casualty Protocol Activated: +8 incoming trauma cases"
            };
          }
          return d;
        });

        const updatedKpis = {
          ...prev.kpis,
          emergencyPatients: 26,
          delayedCases: 16
        };

        const newActivity = {
          id: `act-${Date.now()}`,
          timestamp: "Just now",
          text: "🚨 Emergency Surge: Mass casualty influx on NH-48. 8 trauma patients arriving.",
          type: "danger",
          dept: "emergency"
        };

        return {
          ...prev,
          departments: updatedDepts,
          kpis: updatedKpis,
          recentActivityFeed: [newActivity, ...prev.recentActivityFeed]
        };
      });

      showToast("Mass Casualty Alert: 8 critical trauma admissions initiated!", "danger");
    } else if (scenarioType === "reset") {
      setData(initialHospitalData);
      showToast("Hospital operational telemetry reset to baseline state.", "info");
    }
  }, [showToast]);

  // 4. REGISTER NEW PATIENT
  const registerPatient = useCallback((newPt) => {
    const newId = `HS-2026-${Math.floor(800 + Math.random() * 199)}`;
    const nowIso = new Date().toISOString();

    const formattedPatient = {
      id: newId,
      name: newPt.name || "Unnamed Patient",
      age: Number(newPt.age) || 35,
      gender: newPt.gender || "Male",
      bloodGroup: newPt.bloodGroup || "B+",
      primaryMobile: newPt.primaryMobile || "+91 98765 00000",
      emergencyContactName: newPt.emergencyContactName || "Family Contact",
      emergencyContactMobile: newPt.emergencyContactMobile || "+91 98765 11111",
      registeredAt: nowIso,
      registrationDurationMinutes: 1,
      department: newPt.department || "emergency",
      departmentName: newPt.department === "emergency" ? "Emergency & Trauma" : "Outpatient OPD",
      triageLevel: newPt.triageLevel || "Yellow (Urgent)",
      triageColor: newPt.triageLevel?.includes("Red") ? "rose" : newPt.triageLevel?.includes("Yellow") ? "amber" : "emerald",
      chiefComplaint: newPt.chiefComplaint || "Routine consultation & medical evaluation",
      attendingDoctor: newPt.attendingDoctor || "Dr. Rajesh Sharma",
      vitals: {
        bp: newPt.bp || "120/80 mmHg",
        pulse: newPt.pulse || "78 bpm",
        spo2: newPt.spo2 || "98%",
        temp: newPt.temp || "98.6°F",
        rbs: newPt.rbs || "115 mg/dL"
      },
      status: "Registered - Awaiting Doctor Consultation",
      currentJourneyStep: "triage",
      journeyProgressPct: 25,
      journeySteps: [
        { name: "Patient Registration Form", status: "completed", timestamp: "Just now", duration: "1 min" },
        { name: "Primary Triage & Vitals", status: "in-progress", timestamp: "Active", duration: "Recording" },
        { name: "Doctor Consultation", status: "pending", timestamp: "Queued", duration: "--" },
        { name: "Lab / Diagnostic Tests", status: "pending", timestamp: "Queued", duration: "--" },
        { name: "Pharmacy Dispensation", status: "pending", timestamp: "Queued", duration: "--" },
        { name: "Discharge / Ward Admission", status: "pending", timestamp: "Queued", duration: "--" }
      ],
      prescriptions: [
        {
          id: `rx-${Date.now()}-1`,
          medicineName: "Dolo 650 (Paracetamol)",
          dosage: "650 mg",
          frequency: "1-0-1 (Twice Daily After Food)",
          duration: "3 Days",
          instructions: "Take with warm water after meals.",
          priceINR: 35,
          status: "Prescribed"
        },
        {
          id: `rx-${Date.now()}-2`,
          medicineName: "Pantocid (Pantoprazole)",
          dosage: "40 mg",
          frequency: "1-0-0 (Morning Empty Stomach)",
          duration: "5 Days",
          instructions: "Take 30 minutes before breakfast.",
          priceINR: 110,
          status: "Prescribed"
        }
      ],
      nextAppointment: {
        scheduledDate: "2026-08-26",
        scheduledTime: "11:00 AM",
        doctorName: newPt.attendingDoctor || "Dr. Rajesh Sharma",
        department: "Main Consultation OPD",
        roomNo: "Room 106 - Ground Floor",
        instructions: "Bring previous prescription slip and lab reports.",
        smsSent: true,
        whatsappSent: true
      },
      medicineAlarms: [
        { id: `alm-${Date.now()}-1`, time: "09:00 AM", medicine: "Pantocid 40mg", taken: false, status: "scheduled" },
        { id: `alm-${Date.now()}-2`, time: "01:00 PM", medicine: "Dolo 650mg", taken: false, status: "scheduled" },
        { id: `alm-${Date.now()}-3`, time: "09:00 PM", medicine: "Dolo 650mg", taken: false, status: "scheduled" }
      ]
    };

    setData((prev) => {
      const updatedPatients = [formattedPatient, ...prev.patients];
      const updatedKpis = {
        ...prev.kpis,
        patientsToday: prev.kpis.patientsToday + 1,
        emergencyPatients: newPt.department === "emergency" ? prev.kpis.emergencyPatients + 1 : prev.kpis.emergencyPatients
      };

      const newActivity = {
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        text: `👤 New Patient Registered: ${formattedPatient.name} (ID: ${formattedPatient.id}) in ${formattedPatient.departmentName}.`,
        type: "info",
        dept: formattedPatient.department
      };

      return {
        ...prev,
        patients: updatedPatients,
        kpis: updatedKpis,
        recentActivityFeed: [newActivity, ...prev.recentActivityFeed]
      };
    });

    setSelectedPatientId(newId);
    showToast(`Patient ${formattedPatient.name} (${newId}) registered successfully!`, "success");
  }, [showToast]);

  // 5. TRIGGER MEDICINE ALARM
  const triggerMedicineAlarm = useCallback((patientId, alarmId) => {
    const pt = data.patients.find((p) => p.id === patientId);
    if (!pt) return;
    const alarm = pt.medicineAlarms.find((a) => a.id === alarmId) || pt.medicineAlarms[0];

    const notificationPayload = {
      type: "medicine_alarm",
      title: "⏰ Medicine Time Alert!",
      patientName: pt.name,
      patientMobile: pt.primaryMobile,
      medicine: alarm ? alarm.medicine : "Prescribed Medication Dose",
      scheduledTime: alarm ? alarm.time : "Now",
      instructions: "Take dose with water after meals as prescribed by " + pt.attendingDoctor,
      patientId: pt.id,
      alarmId: alarm?.id
    };

    setMobileActiveNotification(notificationPayload);
    setIsMobileDrawerOpen(true);
    showToast(`Alarm triggered for ${pt.name} (${alarm?.medicine || 'Medicine'})!`, "warning");
  }, [data.patients, showToast]);

  // 6. SEND APPOINTMENT NOTIFICATION TO PATIENT MOBILE
  const sendAppointmentNotification = useCallback((patientId) => {
    const pt = data.patients.find((p) => p.id === patientId);
    if (!pt || !pt.nextAppointment) return;

    const notificationPayload = {
      type: "appointment_sms",
      title: "📅 Appointment Confirmation (SMS & WhatsApp)",
      patientName: pt.name,
      patientMobile: pt.primaryMobile,
      date: pt.nextAppointment.scheduledDate,
      time: pt.nextAppointment.scheduledTime,
      doctor: pt.nextAppointment.doctorName,
      department: pt.nextAppointment.department,
      roomNo: pt.nextAppointment.roomNo,
      instructions: pt.nextAppointment.instructions,
      patientId: pt.id
    };

    setMobileActiveNotification(notificationPayload);
    setIsMobileDrawerOpen(true);
    showToast(`Appointment SMS & WhatsApp notification sent to ${pt.primaryMobile}!`, "success");
  }, [data.patients, showToast]);

  // 7. MARK DOSE TAKEN
  const markDoseTaken = useCallback((patientId, alarmId) => {
    setData((prev) => {
      const updatedPatients = prev.patients.map((p) => {
        if (p.id === patientId) {
          const updatedAlarms = p.medicineAlarms.map((alm) => {
            if (alm.id === alarmId) {
              return { ...alm, taken: true, status: "completed" };
            }
            return alm;
          });
          return { ...p, medicineAlarms: updatedAlarms };
        }
        return p;
      });
      return { ...prev, patients: updatedPatients };
    });
    setMobileActiveNotification(null);
    showToast("Medicine dose logged as taken successfully!", "success");
  }, [showToast]);

  // 8. ADD PRESCRIPTION TO PATIENT
  const addPrescription = useCallback((patientId, rx) => {
    setData((prev) => {
      const updatedPatients = prev.patients.map((p) => {
        if (p.id === patientId) {
          const newRxItem = {
            id: `rx-${Date.now()}`,
            medicineName: rx.medicineName,
            dosage: rx.dosage || "500 mg",
            frequency: rx.frequency || "1-0-1",
            duration: rx.duration || "5 Days",
            instructions: rx.instructions || "Take after meals",
            priceINR: Number(rx.priceINR) || 120,
            status: "Prescribed"
          };
          return {
            ...p,
            prescriptions: [...p.prescriptions, newRxItem]
          };
        }
        return p;
      });
      return { ...prev, patients: updatedPatients };
    });
    showToast(`Prescription added for ₹${rx.priceINR || 120}!`, "success");
  }, [showToast]);

  const selectedPatient = data.patients.find((p) => p.id === selectedPatientId) || data.patients[0];

  const value = {
    data,
    selectedPatient,
    selectedPatientId,
    setSelectedPatientId,
    activeTab,
    setActiveTab,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    mobileActiveNotification,
    setMobileActiveNotification,
    isAudioEnabled,
    setIsAudioEnabled,
    activeScenario,
    liveClock,
    toastMessage,
    showToast,
    isReallocationModalOpen,
    setIsReallocationModalOpen,
    isNewPatientModalOpen,
    setIsNewPatientModalOpen,
    approveNurseReallocation,
    resolveBottleneckAction,
    triggerCascadeScenario,
    registerPatient,
    triggerMedicineAlarm,
    sendAppointmentNotification,
    markDoseTaken,
    addPrescription
  };

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error("useHospital must be used within a HospitalProvider");
  }
  return context;
};
