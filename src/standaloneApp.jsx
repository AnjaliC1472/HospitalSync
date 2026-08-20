const { useState, useEffect, useCallback, useMemo } = React;

// ==========================================================================
// 1. DATASETS & INITIAL STATE (Indian Healthcare Telemetry)
// ==========================================================================

const INITIAL_DATA = {
  kpis: {
    patientsToday: 245,
    emergencyPatients: 18,
    availableBeds: 12,
    totalBeds: 80,
    pendingLabTests: 37,
    pharmacyRequests: 24,
    delayedCases: 8,
    avgWaitTimeMinutes: 28,
  },
  bottlenecks: [
    {
      id: "bot-lab-1",
      departmentId: "lab",
      departmentName: "Diagnostic Laboratory",
      severity: "critical",
      status: "active",
      badgeText: "Bottleneck Detected: Laboratory",
      pendingTasks: 37,
      normalThreshold: 15,
      avgWaitTime: "42 minutes",
      normalWaitTime: "15 minutes",
      impactScore: "High (Slows down 68% of patient flow)",
      rootCause: "High influx of STAT cardiac biomarker & blood panels + Phlebotomy Bay 2 backlog.",
      description: "The laboratory is slowing down patient flow across Emergency and Inpatient admissions.",
      suggestedActions: [
        {
          id: "act-lab-aux",
          title: "Open Auxiliary Sample Collection Bay 3",
          description: "Re-routes 14 routine OPD blood draws away from STAT emergency queue.",
          impact: "Reduces lab wait time by 26 mins",
        },
        {
          id: "act-lab-tech",
          title: "Deploy Floating Phlebotomist (Tech Sanjay Verma)",
          description: "Dispatches senior phlebotomist directly to Emergency triage for bedside blood draws.",
          impact: "Clears 16 pending STAT tests in 12 mins",
        }
      ]
    }
  ],
  aiRecommendations: [
    {
      id: "rec-nurse-realloc",
      title: "Smart Staff Reallocation: Ward B ➔ Emergency",
      priority: "high",
      type: "staffing",
      status: "pending",
      badge: "Smart Resource Reallocation",
      summary: "2 available nurses from Ward B can be temporarily assigned to Emergency.",
      sourceDepartment: "General Ward B (Low Workload 🟢 - 32% load, 7 beds free)",
      targetDepartment: "Emergency & Trauma (Very Busy 🔴 - 94% load, 18 patients)",
      recommendedStaff: [
        { id: "staff-n-3", name: "Nurse Ananya Sen", role: "Senior Staff Nurse", currentDept: "General Ward B" },
        { id: "staff-n-4", name: "Nurse Rahul Varma", role: "Critical Care Certified Nurse", currentDept: "General Ward B" }
      ],
      projectedImpact: {
        triageWaitReduction: "58% faster triage (26m ➔ 11m)",
        crowdingIndexReduction: "Overcrowding reduced from 94% to 74%",
        patientSafetyScore: "+32% responsiveness to Level 1 Red critical cases"
      },
      aiRationale: "Ward B has 7 unoccupied beds and only 13 stable recovering patients under 6 nurses. Emergency currently has 18 active patients (6 red triage) with only 8 staff nurses."
    },
    {
      id: "rec-bed-stepdown",
      title: "ICU Step-Down Transfer to Ward A",
      priority: "medium",
      type: "beds",
      status: "pending",
      badge: "Bed Capacity Optimization",
      summary: "Patient Ananya Iyer (ICU Bed 02) meets step-down criteria. Transfer to Ward A Bed 04.",
      sourceDepartment: "ICU / CCU (11/12 Occupied - 92%)",
      targetDepartment: "General Ward A (18/22 Occupied)",
      projectedImpact: {
        triageWaitReduction: "Frees 1 critical ICU bed for incoming trauma",
        crowdingIndexReduction: "ICU capacity buffer restored to 17%",
        patientSafetyScore: "Continuous monitoring transferred to Step-down HDU"
      },
      aiRationale: "Biochemistry vitals stabilized over last 14 hours. Vasoactive noradrenaline support weaned off successfully."
    }
  ],
  impactCascade: {
    title: "ICU Bed Unavailable Cascade",
    severity: "critical",
    origin: "ICU / Critical Care Unit (Capacity: 100%)",
    headline: "⚠️ Impact Alert: ICU capacity reduced. Emergency admissions may be affected.",
    nodes: [
      { id: "step-1", name: "ICU Bed Unavailable", department: "ICU / CCU", status: "danger", desc: "All 12 critical care beds occupied by ventilator & post-op cases." },
      { id: "step-2", name: "Emergency Admission Affected", department: "Emergency Care", status: "danger", desc: "High-acuity trauma patient held in Resuscitation Bay 1 awaiting ICU transfer." },
      { id: "step-3", name: "Bed Allocation Affected", department: "Central Admission Hub", status: "warning", desc: "General step-down beds in Ward A/B queued; admission pipeline blocked." },
      { id: "step-4", name: "Doctor / Staff Planning Affected", department: "Clinical Roster", status: "warning", desc: "Emergency physicians diverted to manage intensive ICU hold patient." },
      { id: "step-5", name: "Patient Waiting Time May Increase", department: "Hospital-Wide", status: "danger", desc: "Overall OPD & Emergency waiting time surges by an estimated +35 minutes." }
    ]
  },
  departments: [
    { id: "emergency", name: "Emergency & Trauma Care", code: "EMERG", head: "Dr. Rajesh Sharma", status: "critical", statusLabel: "Very Busy 🔴", patientCount: 18, triageRed: 6, triageYellow: 8, triageGreen: 4, doctorsOnDuty: 6, nursesOnDuty: 8, capacityPct: 94, avgWaitTime: "38 mins", criticalAlert: "Resuscitation Bay at 100% capacity" },
    { id: "lab", name: "Diagnostic Laboratory", code: "PATH-LAB", head: "Dr. Suresh Iyer", status: "critical", statusLabel: "Bottleneck 🔴", patientCount: 37, doctorsOnDuty: 2, nursesOnDuty: 4, capacityPct: 96, avgWaitTime: "42 mins", criticalAlert: "37 Pending Tests (21 STAT Cardiac & Blood Panels)" },
    { id: "icu", name: "ICU & Critical Care (CCU)", code: "ICU-CCU", head: "Dr. Sunita Rao", status: "warning", statusLabel: "Near Capacity 🟡", patientCount: 11, totalBeds: 12, availableBeds: 1, doctorsOnDuty: 3, nursesOnDuty: 6, capacityPct: 92, avgWaitTime: "12 mins", criticalAlert: "Only 1 Bed Available" },
    { id: "pharmacy", name: "Central Inpatient Pharmacy", code: "PHARM", head: "Pharmacist Arjun Nair", status: "warning", statusLabel: "Moderate Queue 🟡", patientCount: 24, doctorsOnDuty: 1, nursesOnDuty: 4, capacityPct: 78, avgWaitTime: "21 mins", criticalAlert: "24 Prescriptions Processing" },
    { id: "ward-a", name: "General Inpatient Ward A", code: "WARD-A", head: "Dr. Amit Deshmukh", status: "normal", statusLabel: "Active Normal 🟢", patientCount: 18, totalBeds: 22, availableBeds: 4, doctorsOnDuty: 2, nursesOnDuty: 5, capacityPct: 82, avgWaitTime: "10 mins", criticalAlert: "4 Beds Available for Step-Downs" },
    { id: "ward-b", name: "General Inpatient Ward B", code: "WARD-B", head: "Dr. Neha Joshi", status: "normal", statusLabel: "Low Workload 🟢", patientCount: 13, totalBeds: 20, availableBeds: 7, doctorsOnDuty: 2, nursesOnDuty: 6, capacityPct: 32, avgWaitTime: "5 mins", criticalAlert: "Surplus Staff: 2 Available Nurses for Float" },
    { id: "opd", name: "Outpatient Department (OPD)", code: "OPD-GEN", head: "Dr. Priya Patel", status: "normal", statusLabel: "Operational 🟢", patientCount: 112, doctorsOnDuty: 8, nursesOnDuty: 10, capacityPct: 70, avgWaitTime: "18 mins", criticalAlert: "112 Consultations logged today" },
    { id: "radiology", name: "Radiology & Advanced Imaging", code: "RAD-IMG", head: "Dr. Vikram Rathore", status: "normal", statusLabel: "Operational 🟢", patientCount: 14, doctorsOnDuty: 3, nursesOnDuty: 4, capacityPct: 62, avgWaitTime: "16 mins", criticalAlert: "CT 128-Slice & MRI 3T Operational" },
    { id: "ot", name: "Operation Theatres (OT Complex)", code: "OT-SURG", head: "Dr. Amit Deshmukh", status: "normal", statusLabel: "Operational 🟢", patientCount: 4, totalBeds: 6, availableBeds: 2, doctorsOnDuty: 5, nursesOnDuty: 6, capacityPct: 66, avgWaitTime: "0 mins", criticalAlert: "2 Emergency OT Suites on Immediate Standby" }
  ],
  resources: {
    doctors: [
      { id: "doc-1", name: "Dr. Rajesh Sharma", specialty: "Emergency Medicine & Trauma", role: "Chief of Emergency", department: "emergency", status: "On Duty - In Resuscitation", shift: "Morning (08:00 - 16:00)", contact: "+91 98200 11223" },
      { id: "doc-2", name: "Dr. Priya Patel", specialty: "Interventional Cardiology", role: "Senior Consultant", department: "opd", status: "On Duty - OPD Room 104", shift: "Morning (09:00 - 17:00)", contact: "+91 98200 44556" },
      { id: "doc-3", name: "Dr. Amit Deshmukh", specialty: "General & Laparoscopic Surgery", role: "Head of Surgery", department: "ot", status: "In OT Suite 2 (Appendectomy)", shift: "Full Day (08:00 - 20:00)", contact: "+91 98200 77889" },
      { id: "doc-4", name: "Dr. Sunita Rao", specialty: "Critical Care & Pulmonology", role: "ICU Director", department: "icu", status: "On Duty - ICU Rounds", shift: "Morning (08:00 - 16:00)", contact: "+91 98200 99001" },
      { id: "doc-5", name: "Dr. Vikram Rathore", specialty: "Radiodiagnosis & Imaging", role: "Lead Radiologist", department: "radiology", status: "On Duty - Reporting CT/MRI", shift: "Morning (09:00 - 17:00)", contact: "+91 98200 33445" },
      { id: "doc-6", name: "Dr. Neha Joshi", specialty: "Paediatrics & Neonatology", role: "Attending Consultant", department: "ward-b", status: "Available - Ward B Office", shift: "Morning (08:00 - 16:00)", contact: "+91 98200 55667" },
      { id: "doc-7", name: "Dr. Suresh Iyer", specialty: "Pathology & Biochemistry", role: "Chief Pathologist", department: "lab", status: "On Duty - Processing STAT Samples", shift: "Morning (08:00 - 16:00)", contact: "+91 98200 88990" }
    ],
    nurses: [
      { id: "nurse-1", name: "Nurse Kavita Menon", role: "Emergency Triage Nurse", department: "emergency", status: "Active Triage", shift: "Morning", contact: "+91 97110 12345" },
      { id: "nurse-2", name: "Nurse Pooja Nair", role: "ICU Staff Nurse", department: "icu", status: "Bedside Monitoring", shift: "Morning", contact: "+91 97110 23456" },
      { id: "staff-n-3", name: "Nurse Ananya Sen", role: "Ward Senior Nurse", department: "ward-b", status: "Available for Reallocation 🟢", shift: "Morning", contact: "+91 97110 34567" },
      { id: "staff-n-4", name: "Nurse Rahul Varma", role: "Critical Care Certified Nurse", department: "ward-b", status: "Available for Reallocation 🟢", shift: "Morning", contact: "+91 97110 45678" },
      { id: "nurse-5", name: "Nurse Deepak Rawat", role: "Surgical Scrub Nurse", department: "ot", status: "In OT Suite 2", shift: "Morning", contact: "+91 97110 56789" },
      { id: "nurse-6", name: "Nurse Sunita Rao", role: "Ward General Nurse", department: "ward-a", status: "Medication Round", shift: "Morning", contact: "+91 97110 67890" }
    ],
    beds: {
      total: 80,
      occupied: 68,
      available: 12,
      breakdown: [
        { ward: "ICU / CCU", total: 12, occupied: 11, available: 1, type: "Critical Care Ventilator Beds" },
        { ward: "General Ward A", total: 22, occupied: 18, available: 4, type: "Step-down Inpatient Beds" },
        { ward: "General Ward B", total: 20, occupied: 13, available: 7, type: "Post-op & Recovery Beds" },
        { ward: "Emergency Bay", total: 16, occupied: 15, available: 1, type: "Trauma & Resuscitation Beds" },
        { ward: "OT Recovery", total: 10, occupied: 11, available: 0, type: "Monitored Surgical Bays" }
      ]
    },
    equipment: [
      { id: "eq-1", name: "GE SIGNA 3.0T MRI", department: "Radiology", status: "Operational (Queue: 4)", health: "98%" },
      { id: "eq-2", name: "Somatom 128-Slice CT", department: "Radiology", status: "Operational (Queue: 6)", health: "94%" },
      { id: "eq-3", name: "Cobas 8000 Biochemistry Analyzer", department: "Laboratory", status: "Running at 100% Load", health: "88%" },
      { id: "eq-4", name: "Dräger Evita ICU Ventilators", department: "ICU", status: "11 in Use, 1 Standby", health: "99%" },
      { id: "eq-5", name: "Philips HeartStart XL Defibrillator", department: "Emergency", status: "Ready on Crash Cart 1", health: "100%" }
    ]
  },
  patients: [
    {
      id: "HS-2026-881",
      name: "Aarav Verma",
      age: 42,
      gender: "Male",
      bloodGroup: "O+",
      primaryMobile: "+91 98765 43210",
      emergencyContactName: "Pooja Verma (Spouse)",
      emergencyContactMobile: "+91 98111 22334",
      registeredAt: "2026-08-20T08:15:00+05:30",
      registrationDurationMinutes: 142,
      department: "emergency",
      departmentName: "Emergency & Trauma Care",
      triageLevel: "Red (Critical)",
      triageColor: "rose",
      chiefComplaint: "Acute chest pain radiating to left arm, sweating, dyspnea (40m)",
      symptomsList: ["Chest Pain", "Shortness of Breath", "Sweating / Diaphoresis"],
      attendingDoctor: "Dr. Priya Patel",
      vitals: { bp: "154/96 mmHg", pulse: "108 bpm", spo2: "93%", temp: "98.4°F", rbs: "168 mg/dL" },
      status: "Under Emergency Resuscitation (STAT Lab Hold)",
      currentJourneyStep: "lab_imaging",
      journeyProgressPct: 60,
      journeySteps: [
        { name: "Emergency Intake Registration", status: "completed", timestamp: "08:15 AM", duration: "3 min", delayWarning: null },
        { name: "Primary Triage & Vitals", status: "completed", timestamp: "08:18 AM", duration: "5 min", delayWarning: null },
        { name: "Emergency Physician Assessment", status: "completed", timestamp: "08:24 AM", duration: "12 min", delayWarning: null },
        { name: "STAT Cardiac Enzymes & 12-Lead ECG", status: "in-progress", timestamp: "08:40 AM", duration: "42 min (Lab Queue)", delayWarning: "🔴 Bottleneck Delay (+24 min)" },
        { name: "Cath Lab / ICU Bed Allocation", status: "pending", timestamp: "Est. 09:35 AM", duration: "--", delayWarning: "⚠️ ICU Near Capacity" },
        { name: "Pharmacy Dispensation & Rx", status: "pending", timestamp: "Est. 10:15 AM", duration: "--", delayWarning: null }
      ],
      prescriptions: [
        { id: "rx-101", medicineName: "Sorbitrate (Isosorbide Dinitrate)", dosage: "5 mg", frequency: "Sublingual STAT", duration: "Immediate Dose", instructions: "Place under tongue immediately for chest pain relief.", priceINR: 45, status: "Administered" },
        { id: "rx-102", medicineName: "Ecosprin (Aspirin)", dosage: "300 mg", frequency: "Chewable STAT", duration: "Immediate Dose", instructions: "Chew thoroughly for antiplatelet effect.", priceINR: 18, status: "Administered" },
        { id: "rx-103", medicineName: "Brilinta (Ticagrelor)", dosage: "90 mg", frequency: "1-0-1 (Twice Daily)", duration: "7 Days", instructions: "Take with water after stabilization.", priceINR: 780, status: "Pending Dispense" },
        { id: "rx-104", medicineName: "Atorva (Atorvastatin)", dosage: "80 mg", frequency: "0-0-1 (Night)", duration: "30 Days", instructions: "Take bedtime after dinner.", priceINR: 420, status: "Pending Dispense" },
        { id: "rx-105", medicineName: "Pantocid (Pantoprazole)", dosage: "40 mg", frequency: "1-0-0 (Morning Empty Stomach)", duration: "10 Days", instructions: "Take 30 minutes before breakfast.", priceINR: 135, status: "Pending Dispense" }
      ],
      nextAppointment: {
        scheduledDate: "2026-08-25",
        scheduledTime: "10:30 AM",
        doctorName: "Dr. Priya Patel",
        department: "Cardiology OPD Block",
        roomNo: "Room 104 - 1st Floor",
        instructions: "Bring 12-lead ECG, Echo report, and 3-day BP log sheet."
      },
      medicineAlarms: [
        { id: "alm-1", time: "09:00 AM", medicine: "Pantocid 40mg", taken: true, status: "completed" },
        { id: "alm-2", time: "02:00 PM", medicine: "Brilinta 90mg", taken: false, status: "due_soon" },
        { id: "alm-3", time: "09:00 PM", medicine: "Atorva 80mg + Brilinta 90mg", taken: false, status: "scheduled" }
      ],
      report: {
        title: "STAT Cardiac Biomarker & Lipid Evaluation",
        sampleDate: "20 Aug 2026, 08:45 AM",
        labTech: "Tech Sanjay Verma",
        approvedBy: "Dr. Suresh Iyer (Chief Pathologist)",
        overallConclusion: "Elevated High-Sensitivity Troponin I & CK-MB indicate acute cardiac ischemic strain. Immediate clinical coronary angiogram evaluation is advised.",
        hindiSummary: "रिपोर्ट से पता चलता है कि हृदय की मांसपेशियों पर तीव्र खिंचाव है (Troponin बढ़ा हुआ है)। तुरंत डॉक्टर की देखरेख और आराम की आवश्यकता है। भारी काम से बचें।",
        parameters: [
          { name: "High-Sensitivity Troponin I", value: "0.42 ng/mL", normalRange: "< 0.04 ng/mL", status: "high", meaning: "Indicates myocardial heart muscle stress. Requires continuous cardiac monitoring." },
          { name: "CK-MB (Creatine Kinase)", value: "38 U/L", normalRange: "0 - 25 U/L", status: "high", meaning: "Heart muscle enzyme elevated following acute chest episode." },
          { name: "Serum Potassium (K+)", value: "4.1 mEq/L", normalRange: "3.5 - 5.0 mEq/L", status: "normal", meaning: "Electrolyte level is stable and within normal cardiac safety limits." },
          { name: "Blood Glucose (Random)", value: "168 mg/dL", normalRange: "70 - 140 mg/dL", status: "high", meaning: "Mild acute stress hyperglycemia. Manage dietary sugars." }
        ],
        patientTips: [
          "Do not engage in physical exertion, heavy lifting, or brisk climbing.",
          "Take sublingual Sorbitrate immediately if acute chest heaviness recurs.",
          "Maintain a low-sodium (salt-restricted) diet and stay hydrated."
        ]
      }
    },
    {
      id: "HS-2026-935",
      name: "Priya Venkatesh",
      age: 23,
      gender: "Female",
      bloodGroup: "O-",
      primaryMobile: "+91 93456 78901",
      emergencyContactName: "Lakshmi Venkatesh (Mother)",
      emergencyContactMobile: "+91 93456 12345",
      registeredAt: "2026-08-20T08:50:00+05:30",
      registrationDurationMinutes: 107,
      department: "opd",
      departmentName: "Outpatient Department (OPD)",
      triageLevel: "Green (Standard)",
      triageColor: "emerald",
      chiefComplaint: "Acute viral pyrexia, severe body ache, retro-orbital headache (3 days)",
      symptomsList: ["High Fever", "Headache / Eye pain", "Body Ache"],
      attendingDoctor: "Dr. Priya Patel",
      vitals: { bp: "118/74 mmHg", pulse: "84 bpm", spo2: "99%", temp: "101.4°F", rbs: "94 mg/dL" },
      status: "Awaiting Dengue NS1 Antigen Clearance",
      currentJourneyStep: "lab_imaging",
      journeyProgressPct: 50,
      journeySteps: [
        { name: "OPD Token Registration", status: "completed", timestamp: "08:50 AM", duration: "2 min", delayWarning: null },
        { name: "Vitals & Nursing Assessment", status: "completed", timestamp: "09:02 AM", duration: "8 min", delayWarning: null },
        { name: "Physician Clinical Consultation", status: "completed", timestamp: "09:20 AM", duration: "15 min", delayWarning: null },
        { name: "Blood Draw: Dengue NS1 & Platelet Count", status: "in-progress", timestamp: "09:40 AM", duration: "35 min", delayWarning: "🔴 Lab Queue Delay" },
        { name: "Pharmacy Prescription Pickup", status: "pending", timestamp: "Est. 10:45 AM", duration: "--", delayWarning: null },
        { name: "Home Care & Hydration Discharge", status: "pending", timestamp: "Est. 11:15 AM", duration: "--", delayWarning: null }
      ],
      prescriptions: [
        { id: "rx-501", medicineName: "Dolo 650 (Paracetamol)", dosage: "650 mg", frequency: "1-1-1 (Every 6-8h SOS)", duration: "5 Days", instructions: "Take strictly after meals for fever > 100°F.", priceINR: 34, status: "Prescribed" },
        { id: "rx-502", medicineName: "Electral Oral Rehydration Salts (ORS)", dosage: "1 Sachet in 1L Water", frequency: "Throughout Day", duration: "4 Days", instructions: "Sip throughout the day to prevent dehydration.", priceINR: 42, status: "Prescribed" },
        { id: "rx-503", medicineName: "Caripill (Carica Papaya Extract)", dosage: "1100 mg", frequency: "1-1-1 (Three Times Daily)", duration: "5 Days", instructions: "Supports natural platelet count recovery.", priceINR: 380, status: "Prescribed" }
      ],
      nextAppointment: {
        scheduledDate: "2026-08-23",
        scheduledTime: "09:00 AM",
        doctorName: "Dr. Priya Patel",
        department: "OPD Fever Clinic",
        roomNo: "Room 102 - Ground Floor",
        instructions: "Repeat Complete Blood Count (CBC) with Platelet Count prior to review."
      },
      medicineAlarms: [
        { id: "alm-12", time: "09:30 AM", medicine: "Dolo 650mg", taken: true, status: "completed" },
        { id: "alm-13", time: "01:30 PM", medicine: "Caripill 1100mg + ORS", taken: false, status: "due_soon" },
        { id: "alm-14", time: "07:30 PM", medicine: "Dolo 650mg + Caripill", taken: false, status: "scheduled" }
      ],
      report: {
        title: "Dengue Serology & Complete Blood Count (CBC)",
        sampleDate: "20 Aug 2026, 09:45 AM",
        labTech: "Tech Ramesh Joshi",
        approvedBy: "Dr. Suresh Iyer (Chief Pathologist)",
        overallConclusion: "Dengue NS1 Antigen Positive with moderate thrombocytopenia (Platelets 85,000). White blood count is normal. Maintain vigorous oral hydration and daily platelet monitoring.",
        hindiSummary: "डेंगू एन.एस.1 टेस्ट पॉजिटिव है और प्लेटलेट्स 85,000 हैं। घबराने की बात नहीं है। ओ.आर.एस, नारियल पानी और पपीते के पत्ते का रस लें। एस्पिरिन या दर्द की दवा न लें।",
        parameters: [
          { name: "Dengue NS1 Antigen", value: "POSITIVE", normalRange: "NEGATIVE", status: "high", meaning: "Indicates early dengue viral infection. Body is fighting the virus." },
          { name: "Platelet Count", value: "85,000 /mcL", normalRange: "150,000 - 450,000", status: "low", meaning: "Platelets are moderately reduced. Requires daily monitoring to ensure they stay > 50,000." },
          { name: "Hemoglobin (Hb)", value: "13.2 g/dL", normalRange: "12.0 - 15.5 g/dL", status: "normal", meaning: "Oxygen carrying red cells are completely healthy and normal." },
          { name: "Total Leucocyte Count (WBC)", value: "4,600 /mcL", normalRange: "4,000 - 11,000", status: "normal", meaning: "Immune white blood cells are within normal range." }
        ],
        patientTips: [
          "Drink at least 3 to 4 Litres of fluids daily (ORS, coconut water, fresh fruit juices, warm soups).",
          "Strictly avoid Painkillers like Brufen/Diclofenac/Aspirin; only take Paracetamol (Dolo 650).",
          "Repeat CBC blood test in 24 hours to monitor platelet trajectory."
        ]
      }
    },
    {
      id: "HS-2026-904",
      name: "Sneha Mukherjee",
      age: 29,
      gender: "Female",
      bloodGroup: "B+",
      primaryMobile: "+91 97123 45678",
      emergencyContactName: "Subhash Mukherjee (Father)",
      emergencyContactMobile: "+91 97987 65432",
      registeredAt: "2026-08-20T07:45:00+05:30",
      registrationDurationMinutes: 172,
      department: "ot",
      departmentName: "Operation Theatres & Surgery",
      triageLevel: "Yellow (Urgent)",
      triageColor: "amber",
      chiefComplaint: "Severe right lower quadrant abdominal pain, nausea, rebound tenderness",
      symptomsList: ["Abdominal Pain", "Nausea / Vomiting", "Mild Fever"],
      attendingDoctor: "Dr. Amit Deshmukh",
      vitals: { bp: "122/78 mmHg", pulse: "92 bpm", spo2: "98%", temp: "100.8°F", rbs: "110 mg/dL" },
      status: "In Pre-Op Preparation (Laparoscopic Appendectomy)",
      currentJourneyStep: "surgery",
      journeyProgressPct: 75,
      journeySteps: [
        { name: "OPD Emergency Registration", status: "completed", timestamp: "07:45 AM", duration: "4 min", delayWarning: null },
        { name: "Surgical Triage & Palpation", status: "completed", timestamp: "07:55 AM", duration: "10 min", delayWarning: null },
        { name: "Abdominal Ultrasound & CBC", status: "completed", timestamp: "08:15 AM", duration: "25 min", delayWarning: null },
        { name: "Pre-Anaesthetic Clearance", status: "completed", timestamp: "08:45 AM", duration: "15 min", delayWarning: null },
        { name: "Laparoscopic Appendectomy (OT Suite 2)", status: "in-progress", timestamp: "09:15 AM", duration: "Underway", delayWarning: null },
        { name: "Post-Op Ward B Recovery", status: "pending", timestamp: "Est. 11:00 AM", duration: "--", delayWarning: null }
      ],
      prescriptions: [
        { id: "rx-201", medicineName: "Augmentin (Amoxicillin + Clavulanate)", dosage: "1.2 g IV", frequency: "STAT Pre-Op", duration: "1 Dose", instructions: "IV infusion 30 minutes prior to surgical incision.", priceINR: 320, status: "Administered" },
        { id: "rx-202", medicineName: "Dynapar (Diclofenac Sodium)", dosage: "75 mg IV", frequency: "SOS for Severe Pain", duration: "2 Days", instructions: "Dilute in 100ml Normal Saline over 20 minutes.", priceINR: 65, status: "Active" },
        { id: "rx-203", medicineName: "Emeset (Ondansetron)", dosage: "4 mg IV", frequency: "1-0-1 (Twice Daily)", duration: "3 Days", instructions: "Slow IV push for post-operative nausea prevention.", priceINR: 85, status: "Active" }
      ],
      nextAppointment: {
        scheduledDate: "2026-08-27",
        scheduledTime: "11:00 AM",
        doctorName: "Dr. Amit Deshmukh",
        department: "General Surgery Clinic",
        roomNo: "Room 208 - 2nd Floor",
        instructions: "Suture line inspection and dressing change. Maintain waterproof cover."
      },
      medicineAlarms: [
        { id: "alm-4", time: "10:00 AM", medicine: "Augmentin IV Infusion", taken: true, status: "completed" },
        { id: "alm-5", time: "06:00 PM", medicine: "Emeset 4mg + Dynapar SOS", taken: false, status: "scheduled" }
      ],
      report: {
        title: "High-Resolution Abdominal Ultrasound & Pathology",
        sampleDate: "20 Aug 2026, 08:20 AM",
        labTech: "Dr. Vikram Rathore (Radiologist)",
        approvedBy: "Dr. Amit Deshmukh (Head of Surgery)",
        overallConclusion: "Target sign and dilated non-compressible tubular structure in Right Iliac Fossa measuring 8.4mm with surrounding periappendiceal fluid, consistent with Acute Appendicitis. Laparoscopic excision planned.",
        hindiSummary: "अल्ट्रासाउंड रिपोर्ट में अपेंडिक्स में सूजन और रुकावट दिखाई दे रही है। संक्रमण को रोकने के लिए लैप्रोस्कोपिक सर्जरी द्वारा इसे निकालना सुरक्षित और सर्वोत्तम है।",
        parameters: [
          { name: "Appendix Outer Diameter", value: "8.4 mm", normalRange: "< 6.0 mm", status: "high", meaning: "Appendix is significantly inflamed and swollen (Acute Appendicitis)." },
          { name: "Periappendiceal Fluid", value: "PRESENT", normalRange: "ABSENT", status: "high", meaning: "Localized inflammatory reaction around the appendix." },
          { name: "Total Leukocyte Count (WBC)", value: "14,800 /mcL", normalRange: "4,000 - 11,000", status: "high", meaning: "Elevated infection-fighting white cells responding to inflammation." },
          { name: "Renal Serum Creatinine", value: "0.8 mg/dL", normalRange: "0.6 - 1.2 mg/dL", status: "normal", meaning: "Kidney function is optimal for anaesthesia clearance." }
        ],
        patientTips: [
          "Remain strictly nil-by-mouth (no food/water) until after the laparoscopic procedure.",
          "Wear loose comfortable clothing and follow surgical nursing guidance.",
          "Early gentle walking after 6 hours helps speed up digestion recovery."
        ]
      }
    }
  ],
  recentActivityFeed: [
    { id: "act-1", timestamp: "Just now", text: "Laboratory queue backlog reached 37 pending tests (Avg wait: 42m).", type: "danger" },
    { id: "act-2", timestamp: "2 mins ago", text: "AI Alert: Recommended transferring 2 nurses from Ward B to Emergency.", type: "warning" },
    { id: "act-3", timestamp: "6 mins ago", text: "ICU Bed 02 Patient Ananya Iyer stabilized and eligible for Step-Down.", type: "success" },
    { id: "act-4", timestamp: "9 mins ago", text: "Emergency Resuscitation Bay 1 received red triage patient Aarav Verma.", type: "info" }
  ]
};

// ==========================================================================
// 2. MAIN APPLICATION COMPONENT
// ==========================================================================

function HospitalSyncApp() {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, patients, departments, emergency, bottlenecks, resources, recommendations, journey, report
  const [selectedPatientId, setSelectedPatientId] = useState("HS-2026-881");
  const [activeScenario, setActiveScenario] = useState("default");
  
  // Modals & Drawers
  const [isReallocationModalOpen, setIsReallocationModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [mobileNotification, setMobileNotification] = useState(null);
  const [reportLangHindi, setReportLangHindi] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [triageFilter, setTriageFilter] = useState("all");

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    bloodGroup: "B+",
    primaryMobile: "",
    emergencyContactName: "",
    emergencyContactMobile: "",
    department: "emergency",
    triageLevel: "Yellow (Urgent)",
    chiefComplaint: "",
    symptoms: ["High Fever"],
    attendingDoctor: "Dr. Rajesh Sharma",
    bp: "120/80 mmHg",
    pulse: "78 bpm",
    spo2: "98%",
    temp: "98.6°F"
  });

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Audio Chime Synthesizer for Medicine Alarm
  const playAlarmAudio = useCallback(() => {
    if (!isAudioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Web Audio policy note:", e);
    }
  }, [isAudioEnabled]);

  // 1. SMART RESOURCE REALLOCATION (Ward B -> Emergency)
  const approveNurseReallocation = useCallback((recId) => {
    setData((prev) => {
      const updatedRecs = prev.aiRecommendations.map((r) =>
        r.id === recId ? { ...r, status: "approved" } : r
      );

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

      const updatedKpis = {
        ...prev.kpis,
        delayedCases: Math.max(2, prev.kpis.delayedCases - 4),
        avgWaitTimeMinutes: 20
      };

      const newActivity = {
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        text: "⚡ Smart Reallocation Executed: Nurse Ananya Sen & Nurse Rahul Varma deployed to Emergency. Wait time reduced to 18m.",
        type: "success"
      };

      return {
        ...prev,
        aiRecommendations: updatedRecs,
        resources: { ...prev.resources, nurses: updatedNurses },
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
        text: "✅ Laboratory Bottleneck Cleared: Auxiliary sample collection bay active. Lab queue reduced from 37 to 14 tests.",
        type: "success"
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
          type: "danger"
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
          type: "danger"
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
      setData(INITIAL_DATA);
      showToast("Hospital operational telemetry reset to baseline state.", "info");
    }
  }, [showToast]);

  // 4. REGISTER NEW PATIENT
  const handleRegisterPatient = useCallback((e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.primaryMobile) {
      alert("Please enter patient name and primary mobile number");
      return;
    }

    const newId = `HS-2026-${Math.floor(800 + Math.random() * 199)}`;
    const isRed = regForm.triageLevel.includes("Red");
    const isYellow = regForm.triageLevel.includes("Yellow");

    // Dynamic delay prediction based on live laboratory backlog & triage level
    const labDelayEstimate = data.kpis.pendingLabTests > 25 ? "42 min (Lab Backlog 🔴)" : "15 min (Normal 🟢)";

    const newPatient = {
      id: newId,
      name: regForm.name,
      age: Number(regForm.age) || 32,
      gender: regForm.gender,
      bloodGroup: regForm.bloodGroup,
      primaryMobile: regForm.primaryMobile,
      emergencyContactName: regForm.emergencyContactName || "Family Contact",
      emergencyContactMobile: regForm.emergencyContactMobile || "+91 98000 00000",
      registeredAt: new Date().toISOString(),
      registrationDurationMinutes: 1,
      department: regForm.department,
      departmentName: regForm.department === "emergency" ? "Emergency & Trauma" : regForm.department === "opd" ? "Outpatient OPD" : "Inpatient Care",
      triageLevel: regForm.triageLevel,
      triageColor: isRed ? "rose" : isYellow ? "amber" : "emerald",
      chiefComplaint: regForm.chiefComplaint || `Patient presented with ${regForm.symptoms.join(", ")}`,
      symptomsList: regForm.symptoms,
      attendingDoctor: regForm.attendingDoctor,
      vitals: {
        bp: regForm.bp,
        pulse: regForm.pulse,
        spo2: regForm.spo2,
        temp: regForm.temp,
        rbs: "110 mg/dL"
      },
      status: "Registered - Journey Initiated",
      currentJourneyStep: "triage",
      journeyProgressPct: 25,
      journeySteps: [
        { name: "Patient Registration Intake", status: "completed", timestamp: "Just now", duration: "1 min", delayWarning: null },
        { name: "Primary Triage & Vitals", status: "in-progress", timestamp: "Active", duration: "Recording", delayWarning: null },
        { name: "Doctor Clinical Consultation", status: "pending", timestamp: "Queued", duration: isRed ? "Immediate (0m)" : "15 mins", delayWarning: null },
        { name: "Diagnostic & Lab Workup", status: "pending", timestamp: "Queued", duration: labDelayEstimate, delayWarning: data.kpis.pendingLabTests > 25 ? "🔴 Chokepoint Delay (+24m)" : null },
        { name: "Pharmacy Dispensation", status: "pending", timestamp: "Queued", duration: "--", delayWarning: null },
        { name: "Discharge / Ward Admission", status: "pending", timestamp: "Queued", duration: "--", delayWarning: null }
      ],
      prescriptions: [
        { id: `rx-${Date.now()}-1`, medicineName: "Dolo 650 (Paracetamol)", dosage: "650 mg", frequency: "1-0-1 (After Food)", duration: "3 Days", instructions: "Take with water after meals.", priceINR: 35, status: "Prescribed" },
        { id: `rx-${Date.now()}-2`, medicineName: "Pantocid (Pantoprazole)", dosage: "40 mg", frequency: "1-0-0 (Empty Stomach)", duration: "5 Days", instructions: "Take 30 minutes before breakfast.", priceINR: 110, status: "Prescribed" }
      ],
      nextAppointment: {
        scheduledDate: "2026-08-26",
        scheduledTime: "11:00 AM",
        doctorName: regForm.attendingDoctor,
        department: "Main Consultation OPD",
        roomNo: "Room 106 - Ground Floor",
        instructions: "Bring previous prescription slip and lab reports."
      },
      medicineAlarms: [
        { id: `alm-${Date.now()}-1`, time: "09:00 AM", medicine: "Pantocid 40mg", taken: false, status: "scheduled" },
        { id: `alm-${Date.now()}-2`, time: "01:00 PM", medicine: "Dolo 650mg", taken: false, status: "scheduled" },
        { id: `alm-${Date.now()}-3`, time: "09:00 PM", medicine: "Dolo 650mg", taken: false, status: "scheduled" }
      ],
      report: {
        title: "Intake Diagnostic Baseline Workup",
        sampleDate: "Today, Just Now",
        labTech: "Tech Sanjay Verma",
        approvedBy: "Dr. Suresh Iyer (Chief Pathologist)",
        overallConclusion: "Initial screening completed. Routine baseline blood chemistry is normal. Vitals are currently stable.",
        hindiSummary: "प्रारंभिक जांच पूरी हो चुकी है। सभी महत्वपूर्ण संकेत (वाइटल्स) स्थिर हैं। डॉक्टर की सलाह के अनुसार दवाइयां समय पर लें।",
        parameters: [
          { name: "Blood Pressure (BP)", value: regForm.bp, normalRange: "120/80 mmHg", status: "normal", meaning: "Arterial blood pressure is within expected clinical tolerance." },
          { name: "Pulse Rate", value: regForm.pulse, normalRange: "60 - 100 bpm", status: "normal", meaning: "Heart rate rhythm is steady." },
          { name: "Oxygen Saturation (SpO2)", value: regForm.spo2, normalRange: "95 - 100%", status: "normal", meaning: "Blood oxygen saturation is healthy." },
          { name: "Body Temperature", value: regForm.temp, normalRange: "98.6°F", status: Number(regForm.temp.replace("°F","")) > 99.5 ? "high" : "normal", meaning: "Temperature evaluation." }
        ],
        patientTips: [
          "Take prescribed medication strictly according to the mobile alarm reminders.",
          "Stay hydrated and avoid strenuous activities.",
          "Contact hospital emergency immediately if symptoms worsen."
        ]
      }
    };

    setData((prev) => {
      const updatedPatients = [newPatient, ...prev.patients];
      const updatedKpis = {
        ...prev.kpis,
        patientsToday: prev.kpis.patientsToday + 1,
        emergencyPatients: regForm.department === "emergency" ? prev.kpis.emergencyPatients + 1 : prev.kpis.emergencyPatients
      };

      const newActivity = {
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        text: `👤 New Patient Registered: ${newPatient.name} (${newPatient.id}) in ${newPatient.departmentName}.`,
        type: "info"
      };

      return {
        ...prev,
        patients: updatedPatients,
        kpis: updatedKpis,
        recentActivityFeed: [newActivity, ...prev.recentActivityFeed]
      };
    });

    setSelectedPatientId(newId);
    setIsNewPatientModalOpen(false);
    showToast(`Patient ${newPatient.name} (${newId}) registered with live journey tracking!`, "success");
  }, [regForm, data.kpis.pendingLabTests, showToast]);

  // 5. TRIGGER MEDICINE ALARM
  const triggerMedicineAlarm = useCallback((patientId, alarmId) => {
    const pt = data.patients.find((p) => p.id === patientId);
    if (!pt) return;
    const alarm = pt.medicineAlarms.find((a) => a.id === alarmId) || pt.medicineAlarms[0];

    playAlarmAudio();
    setMobileNotification({
      type: "medicine_alarm",
      title: "⏰ Medicine Time Alert!",
      patientName: pt.name,
      patientMobile: pt.primaryMobile,
      medicine: alarm ? alarm.medicine : "Prescribed Medication Dose",
      scheduledTime: alarm ? alarm.time : "Now",
      instructions: `Take dose with water after food as prescribed by ${pt.attendingDoctor}`,
      patientId: pt.id,
      alarmId: alarm?.id
    });
    setIsMobileDrawerOpen(true);
    showToast(`Alarm triggered for ${pt.name} (${alarm?.medicine || 'Medicine'})!`, "warning");
  }, [data.patients, playAlarmAudio, showToast]);

  // 6. SEND APPOINTMENT NOTIFICATION
  const sendAppointmentNotification = useCallback((patientId) => {
    const pt = data.patients.find((p) => p.id === patientId);
    if (!pt || !pt.nextAppointment) return;

    setMobileNotification({
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
    });
    setIsMobileDrawerOpen(true);
    showToast(`Appointment SMS & WhatsApp delivered to ${pt.primaryMobile}!`, "success");
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
    setMobileNotification(null);
    showToast("Medicine dose logged as taken successfully!", "success");
  }, [showToast]);

  const selectedPatient = data.patients.find((p) => p.id === selectedPatientId) || data.patients[0];
  const labBottleneck = data.bottlenecks.find((b) => b.departmentId === "lab");
  const nurseRec = data.aiRecommendations.find((r) => r.id === "rec-nurse-realloc");

  // Filtered patients list
  const filteredPatients = useMemo(() => {
    return data.patients.filter((p) => {
      const matchesQuery = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.primaryMobile.includes(searchQuery);
      const matchesTriage = triageFilter === "all" || p.triageLevel.toLowerCase().includes(triageFilter.toLowerCase());
      return matchesQuery && matchesTriage;
    });
  }, [data.patients, searchQuery, triageFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* ====================================================================
          TOP OPERATIONS COMMAND NAVBAR
         ==================================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight font-['Outfit']">HospitalSync</h1>
                <span className="badge badge-cyan text-[10px] py-0.5 px-2">ADMIN COMMAND</span>
              </div>
              <p className="text-[11px] text-slate-400">Hospital Operations & Cross-Department Synchronizer</p>
            </div>
          </div>

          {/* Quick Simulation & Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsNewPatientModalOpen(true)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-cyan-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>+ Register Patient</span>
            </button>

            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-amber-300 border-amber-500/30 hover:border-amber-400"
            >
              <span>📱 Patient Phone App</span>
            </button>

            <button
              onClick={() => setActiveTab("report")}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-cyan-300 border-cyan-500/30 hover:border-cyan-400"
            >
              <span>📑 Understand My Report</span>
            </button>

            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isAudioEnabled ? "bg-slate-900 border-cyan-500/40 text-cyan-400" : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
              title={isAudioEnabled ? "Audio Chime Enabled" : "Audio Muted"}
            >
              {isAudioEnabled ? "🔊" : "🔇"}
            </button>
          </div>

        </div>
      </header>

      {/* ====================================================================
          MAIN APP BODY WITH SIDEBAR & ACTIVE SECTIONS
         ==================================================================== */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row pb-12">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-5 p-4 lg:py-6">
          <div className="glass-panel p-3.5 flex flex-col gap-1 border-slate-800/90 shadow-xl">
            <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
              <span>Operations Matrix</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                Live
              </span>
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { id: "dashboard", label: "Dashboard", sub: "Hospital Overview", icon: "📊", badge: null },
                { id: "patients", label: "Patients", sub: "Search & ID Lookup", icon: "👥", badge: `${data.patients.length}`, badgeColor: "badge-cyan" },
                { id: "departments", label: "Departments", sub: "OPD, Lab, ICU, Wards", icon: "🏢", badge: `${data.departments.length}`, badgeColor: "badge-purple" },
                { id: "emergency", label: "Emergency", sub: "Trauma & Cascades", icon: "🚨", badge: `${data.kpis.emergencyPatients} Critical`, badgeColor: "badge-red" },
                { id: "bottlenecks", label: "Bottlenecks", sub: "Queue Detection", icon: "🚦", badge: labBottleneck?.status === 'active' ? "1 Active 🔴" : "Cleared 🟢", badgeColor: labBottleneck?.status === 'active' ? "badge-red" : "badge-emerald" },
                { id: "resources", label: "Resources", sub: "Doctors, Nurses, Beds", icon: "🩺", badge: `${data.kpis.availableBeds} Free`, badgeColor: "badge-emerald" },
                { id: "recommendations", label: "Recommendations", sub: "AI Smart Rebalance", icon: "💡", badge: nurseRec?.status === 'pending' ? "1 Actionable" : "Optimized", badgeColor: "badge-amber" },
                { id: "journey", label: "Patient Journey", sub: "Tracking & Alarms", icon: "🗺️", badge: null },
                { id: "report", label: "Understand My Report", sub: "AI Patient Explainer", icon: "📑", badge: "AI Plain English", badgeColor: "badge-cyan" }
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-950/80 via-cyan-900/40 to-slate-900/80 text-cyan-300 border border-cyan-500/40 shadow-lg font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-base">{item.icon}</span>
                      <div className="truncate">
                        <div className="text-sm leading-tight">{item.label}</div>
                        <div className="text-[11px] text-slate-500 font-normal truncate">{item.sub}</div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`badge ${item.badgeColor || 'badge-cyan'} text-[10px] py-0.5 px-2 shrink-0`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Hospital Administrator Badge */}
          <div className="glass-panel p-4 border-slate-800/80 flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                RS
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  Dr. Rajesh Sharma
                  <span className="text-cyan-400 text-xs">✓</span>
                </div>
                <div className="text-xs text-cyan-400">Medical Superintendent</div>
                <div className="text-[11px] text-slate-500">Hospital Administrator</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Decision Authority:</span>
              <span className="font-semibold text-emerald-400">Human-In-The-Loop</span>
            </div>
          </div>

          {/* Live Scenario Quick Triggers */}
          <div className="glass-panel p-4 border-slate-800/80 space-y-2 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡ Live Impact Simulators</span>
            </div>
            <p className="text-[11px] text-slate-400">Simulate real-time emergency events to test ripple cascades across all departments.</p>
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={() => triggerCascadeScenario("icu_crunch")}
                className={`py-1.5 px-3 rounded-lg border text-left font-semibold transition-all ${
                  activeScenario === "icu_crunch" ? "bg-rose-950 text-rose-300 border-rose-500" : "bg-slate-900 text-slate-300 border-slate-800 hover:border-rose-500/50"
                }`}
              >
                🚨 ICU Bed Unavailable Crunch
              </button>
              <button
                onClick={() => triggerCascadeScenario("mass_casualty")}
                className={`py-1.5 px-3 rounded-lg border text-left font-semibold transition-all ${
                  activeScenario === "mass_casualty" ? "bg-amber-950 text-amber-300 border-amber-500" : "bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50"
                }`}
              >
                🚑 Mass Casualty Trauma Surge
              </button>
              <button
                onClick={() => triggerCascadeScenario("reset")}
                className="py-1 px-3 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 text-center"
              >
                🔄 Reset Telemetry
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN DYNAMIC CONTENT ROUTER */}
        <main className="flex-1 p-4 lg:py-6 overflow-x-hidden min-w-0">
          
          {/* ================================================================
              SECTION 1: DASHBOARD (OVERALL HOSPITAL STATUS)
             ================================================================ */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-6">
              
              {/* Header Title */}
              <div className="glass-panel p-5 border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2.5 font-['Outfit']">
                    <span>Hospital Overview & Operations Dashboard</span>
                    <span className="badge badge-cyan text-xs">Live Command</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Suppose you are the hospital administrator. Understand the hospital situation from one unified screen.
                  </p>
                </div>

                <div className="text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span>Active Occupancy: </span>
                  <strong className="text-cyan-300">85% (68 / 80 Beds)</strong>
                </div>
              </div>

              {/* 1. TOP 6 EXECUTIVE KPI CARDS (Exact User Requirements) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                
                {/* Patients Today */}
                <div onClick={() => setActiveTab("patients")} className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-cyan-500/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Patients Today</span>
                    <span className="text-cyan-400">👥</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl metric-value text-white group-hover:text-cyan-300">{data.kpis.patientsToday}</div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-medium">↑ +14 in last hr</div>
                  </div>
                </div>

                {/* Emergency Patients */}
                <div onClick={() => setActiveTab("emergency")} className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-rose-500">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-300">Emergency Patients</span>
                    <span className="text-rose-400">🚨</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl metric-value text-rose-400">{data.kpis.emergencyPatients}</div>
                    <div className="text-[11px] text-rose-300 mt-1 font-semibold">🔴 6 Red Triage</div>
                  </div>
                </div>

                {/* Available Beds */}
                <div onClick={() => setActiveTab("resources")} className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-emerald-500/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300">Available Beds</span>
                    <span className="text-emerald-400">🛏️</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl metric-value text-emerald-400">{data.kpis.availableBeds} <span className="text-xs text-slate-400 font-normal">/ 80</span></div>
                    <div className="text-[11px] text-slate-400 mt-1">ICU: 1 | W-A: 4 | W-B: 7</div>
                  </div>
                </div>

                {/* Pending Lab Tests */}
                <div onClick={() => setActiveTab("bottlenecks")} className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-rose-500">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-300">Pending Lab Tests</span>
                    <span className="text-rose-400">🧪</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl metric-value text-rose-400">{data.kpis.pendingLabTests}</div>
                    <div className="text-[11px] text-rose-300 mt-1 font-semibold">🔴 Bottleneck (42m wait)</div>
                  </div>
                </div>

                {/* Pharmacy Requests */}
                <div onClick={() => setActiveTab("departments")} className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-amber-500/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300">Pharmacy Requests</span>
                    <span className="text-amber-400">💊</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl metric-value text-amber-300">{data.kpis.pharmacyRequests}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Avg dispensing: 14 min</div>
                  </div>
                </div>

                {/* Delayed Cases */}
                <div onClick={() => setActiveTab("bottlenecks")} className="glass-panel p-4 flex flex-col justify-between cursor-pointer group hover:border-rose-500/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Delayed Cases</span>
                    <span className="text-rose-400">⏱️</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl metric-value text-rose-400">{data.kpis.delayedCases}</div>
                    <div className="text-[11px] text-slate-400 mt-1">&gt; SLA Target TAT</div>
                  </div>
                </div>

              </div>

              {/* 2. BOTTLENECK & SMART REALLOCATION SPOTLIGHT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* 🚦 BOTTLENECK DETECTION */}
                <div className="glass-panel p-5 border-rose-500/40 bg-gradient-to-br from-rose-950/30 via-slate-950 to-slate-950 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🚦</span>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Bottleneck Detection Engine</span>
                          <h3 className="text-base font-bold text-white">🔴 Bottleneck Detected: Laboratory</h3>
                        </div>
                      </div>
                      <span className="badge badge-red text-xs">Chokepoint</span>
                    </div>

                    <div className="bg-slate-950/80 rounded-xl p-4 border border-rose-500/20 mb-4 text-xs space-y-3">
                      <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-800">
                        <div>
                          <span className="text-slate-400">Pending Lab Tests:</span>
                          <div className="text-xl font-bold text-rose-400 mono-font">{data.kpis.pendingLabTests} Tests</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Average Waiting Time:</span>
                          <div className="text-xl font-bold text-rose-400 mono-font">{labBottleneck?.avgWaitTime || "42 minutes"}</div>
                        </div>
                      </div>

                      <p className="text-slate-300 leading-relaxed">
                        <strong className="text-rose-300 font-bold">The administrator now knows:</strong> "The laboratory is slowing down patient flow. Other departments are relatively normal."
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => resolveBottleneckAction('bot-lab-1', 'act-lab-aux')}
                      disabled={labBottleneck?.status === 'resolved'}
                      className={`btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 ${labBottleneck?.status === 'resolved' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <span>⚡ Deploy Auxiliary Bay Mitigation</span>
                    </button>
                    <button onClick={() => setActiveTab("bottlenecks")} className="btn-secondary text-xs py-2 px-3">
                      <span>Inspect Lab Queue ➔</span>
                    </button>
                  </div>
                </div>

                {/* 🧠 SMART RESOURCE REALLOCATION */}
                <div className="glass-panel p-5 border-cyan-500/40 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-950 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🧠</span>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Smart Resource Reallocation</span>
                          <h3 className="text-base font-bold text-white">💡 Recommendation: 2 Available Nurses</h3>
                        </div>
                      </div>
                      <span className="badge badge-emerald text-xs">Actionable</span>
                    </div>

                    <div className="bg-slate-950/80 rounded-xl p-4 border border-cyan-500/20 mb-4 text-xs space-y-3">
                      <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
                        <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30">
                          <span className="text-[11px] font-bold text-rose-300">Emergency</span>
                          <div className="text-xs font-semibold text-rose-400 mt-0.5">Very Busy 🔴 (94% Load)</div>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                          <span className="text-[11px] font-bold text-emerald-300">General Ward B</span>
                          <div className="text-xs font-semibold text-emerald-400 mt-0.5">Low Workload 🟢 (32% Load)</div>
                        </div>
                      </div>

                      <p className="text-cyan-200 font-semibold leading-relaxed">
                        💡 Recommendation: 2 available nurses from Ward B can be temporarily assigned to Emergency.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        The administrator makes the final decision. The system recommends the best action without auto-moving staff.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setIsReallocationModalOpen(true)}
                      className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-cyan-500/20"
                    >
                      <span>✓ Review & Approve Decision</span>
                    </button>
                    <button onClick={() => setActiveTab("recommendations")} className="btn-secondary text-xs py-2 px-3">
                      <span>All Insights ➔</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* 3. 🔄 IMPACT RIPPLE PREVIEW */}
              <div 
                onClick={() => setActiveTab("emergency")}
                className="glass-panel p-4 border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:border-amber-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-amber text-[10px]">Impact Ripple Engine</span>
                      <h4 className="text-sm font-bold text-amber-200">
                        ⚠️ Impact Alert: ICU capacity reduced. Emergency admissions may be affected.
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cascade: ICU Bed Unavailable ➔ Emergency Admission affected ➔ Bed Allocation affected ➔ Staff planning affected ➔ Patient wait time increases.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-amber-300 font-semibold shrink-0">View Interactive Ripple Graph ➔</span>
              </div>

              {/* 4. DEPARTMENT REAL-TIME OPERATIONS MATRIX */}
              <div className="glass-panel p-5 border-slate-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Department Operations Matrix & Live Bed Capacity
                  </h3>
                  <button onClick={() => setActiveTab("departments")} className="btn-secondary text-xs py-1.5 px-3">
                    <span>Full Departments Grid ➔</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {data.departments.slice(0, 6).map((dept) => (
                    <div
                      key={dept.id}
                      onClick={() => setActiveTab("departments")}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        dept.status === 'critical' ? 'bg-rose-950/20 border-rose-500/40' : dept.status === 'warning' ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{dept.name}</span>
                        <span className={`badge ${dept.status === 'critical' ? 'badge-red' : dept.status === 'warning' ? 'badge-amber' : 'badge-emerald'} text-[10px]`}>
                          {dept.statusLabel}
                        </span>
                      </div>
                      <div className="flex items-end justify-between mt-2 text-xs">
                        <div>
                          <div className="text-2xl font-bold metric-value text-white">{dept.patientCount} <span className="text-xs text-slate-400 font-normal">tasks</span></div>
                          <div className="text-[11px] text-slate-400">Staff: {dept.doctorsOnDuty} Docs • {dept.nursesOnDuty} Nurses</div>
                        </div>
                        {dept.availableBeds !== undefined && (
                          <div className="text-right">
                            <span className="font-bold text-emerald-400">{dept.availableBeds} Free Beds</span>
                            <div className="text-[10px] text-slate-500">of {dept.totalBeds} Beds</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================================================================
              SECTION 2: PATIENTS (SEARCH BY ID, RX IN ₹, VITALS)
             ================================================================ */}
          {activeTab === "patients" && (
            <div className="flex flex-col gap-6">
              
              <div className="glass-panel p-5 border-slate-800/80 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <span>Patient Records, Search & Medical Management</span>
                    <span className="badge badge-cyan text-xs">Indian Registry</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Search patient using Patient ID, inspect real-time vitals, manage prescriptions in Indian Rupees (₹), and trigger mobile medicine alarms.
                  </p>
                </div>
                <button onClick={() => setIsNewPatientModalOpen(true)} className="btn-primary text-xs py-2 px-4">
                  <span>+ Register New Patient</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Search & Patient List (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <div className="glass-panel p-3.5 border-slate-800 space-y-2">
                    <input
                      type="text"
                      placeholder="Search Patient ID (e.g. HS-2026-881), Name, Phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none font-mono"
                    />
                    <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-1">
                      {["all", "red", "yellow", "green"].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setTriageFilter(lvl)}
                          className={`px-2.5 py-1 rounded-lg uppercase font-semibold transition-all ${
                            triageFilter === lvl ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {filteredPatients.map((pt) => {
                      const isSel = pt.id === selectedPatientId;
                      const isRed = pt.triageLevel.includes("Red");
                      const isYellow = pt.triageLevel.includes("Yellow");

                      return (
                        <div
                          key={pt.id}
                          onClick={() => setSelectedPatientId(pt.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSel
                              ? "bg-gradient-to-r from-cyan-950/90 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/40"
                              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-cyan-300 text-xs">{pt.id}</span>
                                <span className={`badge ${isRed ? 'badge-red' : isYellow ? 'badge-amber' : 'badge-emerald'} text-[9px] py-0.5 px-1.5`}>
                                  {pt.triageLevel.split(" ")[0]}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white mt-1">{pt.name}</h4>
                              <div className="text-[11px] text-slate-400">{pt.age}y • {pt.gender} • Blood: {pt.bloodGroup}</div>
                            </div>
                            <span className="text-[10px] text-slate-500 mono-font">{pt.departmentName.split(" ")[0]}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                            <span className="truncate max-w-[180px]">{pt.chiefComplaint}</span>
                            <span className="text-cyan-400 font-semibold text-[10px]">Select ➔</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Patient Profile & Prescription Deck (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  
                  {/* Selected Patient Identity */}
                  <div className="glass-panel p-5 border-slate-800/80">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-cyan-300 text-xs px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30">
                            {selectedPatient.id}
                          </span>
                          <h3 className="text-xl font-bold text-white font-['Outfit']">{selectedPatient.name}</h3>
                          <span className={`badge ${selectedPatient.triageLevel.includes('Red') ? 'badge-red' : selectedPatient.triageLevel.includes('Yellow') ? 'badge-amber' : 'badge-emerald'} text-xs`}>
                            {selectedPatient.triageLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedPatient.age} Yrs • {selectedPatient.gender} • Blood: <strong className="text-slate-200">{selectedPatient.bloodGroup}</strong> • Doctor: <strong className="text-cyan-300">{selectedPatient.attendingDoctor}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => setActiveTab("journey")} className="btn-secondary text-xs py-1.5 px-3 text-cyan-300 border-cyan-500/30">
                          <span>🗺️ Live Journey</span>
                        </button>
                        <button onClick={() => setActiveTab("report")} className="btn-primary text-xs py-1.5 px-3">
                          <span>📑 View AI Report</span>
                        </button>
                      </div>
                    </div>

                    {/* Vitals Telemetry */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center my-4">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px]">Blood Pressure</span>
                        <div className="font-bold text-white font-mono text-sm mt-0.5">{selectedPatient.vitals.bp}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px]">Pulse Rate</span>
                        <div className="font-bold text-white font-mono text-sm mt-0.5">{selectedPatient.vitals.pulse}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px]">Blood Oxygen (SpO2)</span>
                        <div className="font-bold text-emerald-400 font-mono text-sm mt-0.5">{selectedPatient.vitals.spo2}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px]">Temperature</span>
                        <div className="font-bold text-white font-mono text-sm mt-0.5">{selectedPatient.vitals.temp}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 text-[10px]">Blood Sugar (RBS)</span>
                        <div className="font-bold text-amber-400 font-mono text-sm mt-0.5">{selectedPatient.vitals.rbs}</div>
                      </div>
                    </div>

                    {/* Contact & Mobile Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400">Primary Mobile Number (Alarms & SMS):</span>
                        <div className="font-bold text-cyan-300 mono-font text-sm mt-0.5">{selectedPatient.primaryMobile}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Emergency Alternate Contact ({selectedPatient.emergencyContactName}):</span>
                        <div className="font-bold text-rose-300 mono-font text-sm mt-0.5">{selectedPatient.emergencyContactMobile}</div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Prescriptions in ₹ INR */}
                  <div className="glass-panel p-5 border-slate-800/80">
                    <div className="flex items-center justify-between mb-3.5">
                      <h4 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <span>💊 Doctor Prescriptions & Medication Regimen (₹ INR)</span>
                      </h4>
                      <span className="text-xs font-bold text-emerald-400 mono-font">
                        Total Rx: ₹{selectedPatient.prescriptions.reduce((a, b) => a + (b.priceINR || 0), 0)} INR
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                            <th className="py-2 px-3">Medicine Name</th>
                            <th className="py-2 px-3">Dosage</th>
                            <th className="py-2 px-3">Frequency</th>
                            <th className="py-2 px-3">Duration</th>
                            <th className="py-2 px-3 text-right">Price (₹ INR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {selectedPatient.prescriptions.map((rx) => (
                            <tr key={rx.id} className="hover:bg-slate-900/40">
                              <td className="py-2.5 px-3 font-semibold text-white">
                                {rx.medicineName}
                                <div className="text-[10px] text-slate-400 font-normal">{rx.instructions}</div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-cyan-300">{rx.dosage}</td>
                              <td className="py-2.5 px-3 text-slate-300">{rx.frequency}</td>
                              <td className="py-2.5 px-3 text-slate-400">{rx.duration}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-emerald-400 mono-font">₹{rx.priceINR}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Alarms & Appointment Push Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass-panel p-4 border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">⏰ Medicine Alarms</span>
                        <span className="badge badge-amber text-[10px]">Audio Chime</span>
                      </div>
                      <div className="space-y-1.5">
                        {selectedPatient.medicineAlarms.map((alm) => (
                          <div key={alm.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-mono font-bold text-cyan-300">{alm.time}</span>
                              <div className="text-[11px] text-slate-400">{alm.medicine}</div>
                            </div>
                            <button
                              onClick={() => triggerMedicineAlarm(selectedPatient.id, alm.id)}
                              className="btn-secondary text-[11px] py-1 px-2.5 text-amber-300 border-amber-500/30 hover:border-amber-400"
                            >
                              🔔 Test Alarm
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-4 border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">📅 Next Appointment</span>
                          <span className="badge badge-cyan text-[10px]">SMS & WhatsApp</span>
                        </div>
                        {selectedPatient.nextAppointment && (
                          <div className="text-xs text-slate-300 space-y-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div><strong>Date:</strong> {selectedPatient.nextAppointment.scheduledDate} at {selectedPatient.nextAppointment.scheduledTime}</div>
                            <div><strong>Doctor:</strong> {selectedPatient.nextAppointment.doctorName} ({selectedPatient.nextAppointment.roomNo})</div>
                            <div className="text-[11px] text-slate-400">{selectedPatient.nextAppointment.instructions}</div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => sendAppointmentNotification(selectedPatient.id)}
                        className="btn-primary text-xs py-2 px-3 w-full justify-center mt-3 shadow-cyan-500/20"
                      >
                        <span>Send SMS & WhatsApp Confirmation</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ================================================================
              SECTION 3: DEPARTMENTS (OPD, EMERGENCY, LAB, PHARMACY, ICU, WARDS)
             ================================================================ */}
          {activeTab === "departments" && (
            <div className="flex flex-col gap-6">
              
              <div className="glass-panel p-5 border-slate-800/80 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-950 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit']">Hospital Departmental Telemetry</h2>
                  <p className="text-xs text-slate-400">Continuous telemetry across Outpatient, Emergency, Critical Care, Labs, Pharmacy, and Inpatient Wards.</p>
                </div>
                <span className="badge badge-purple text-xs">9 Active Wards</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.departments.map((dept) => {
                  const isCrit = dept.status === "critical";
                  const isWarn = dept.status === "warning";
                  return (
                    <div
                      key={dept.id}
                      className={`glass-panel p-5 border transition-all ${
                        isCrit ? "border-rose-500/50 bg-rose-950/20" : isWarn ? "border-amber-500/50 bg-amber-950/20" : "border-slate-800/80 bg-slate-950/70"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-mono text-[10px] text-cyan-400 font-bold">{dept.code}</span>
                          <h3 className="text-base font-bold text-white">{dept.name}</h3>
                          <div className="text-xs text-slate-400">Head: {dept.head}</div>
                        </div>
                        <span className={`badge ${isCrit ? 'badge-red' : isWarn ? 'badge-amber' : 'badge-emerald'} text-[10px]`}>
                          {dept.statusLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400">Active Queue:</span>
                          <div className="text-lg font-bold text-white">{dept.patientCount} tasks</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Average Wait:</span>
                          <div className={`text-lg font-bold ${isCrit ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'}`}>{dept.avgWaitTime}</div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 flex justify-between mb-2">
                        <span>Staff: {dept.doctorsOnDuty} Docs • {dept.nursesOnDuty} Nurses</span>
                        {dept.availableBeds !== undefined && <span className="text-emerald-400 font-bold">{dept.availableBeds} Free Beds</span>}
                      </div>

                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${dept.capacityPct > 90 ? 'bg-rose-500' : dept.capacityPct > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(100, dept.capacityPct)}%` }}></div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 truncate">
                        Alert: <span className="text-slate-200">{dept.criticalAlert}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ================================================================
              SECTION 4: EMERGENCY (CRITICAL PATIENTS & CASCADES)
             ================================================================ */}
          {activeTab === "emergency" && (
            <div className="flex flex-col gap-6">
              
              <div className="glass-panel p-5 border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <span>Emergency Trauma Command & Impact Cascades</span>
                    <span className="badge badge-red text-xs">High Acuity</span>
                  </h2>
                  <p className="text-xs text-slate-400">Critical patients, red triage resuscitation queues, and active multi-department emergency cascades.</p>
                </div>
                <button onClick={() => triggerCascadeScenario("mass_casualty")} className="btn-primary text-xs py-2 px-3.5 bg-gradient-to-r from-rose-600 to-rose-700">
                  <span>🚨 Trigger Mass Casualty Event</span>
                </button>
              </div>

              {/* Impact Ripple Directed Graph */}
              <div className="glass-panel p-5 border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-900">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <span className="badge badge-amber text-[10px]">Impact Ripple Engine</span>
                    <h3 className="text-base font-bold text-white mt-1">
                      ⚠️ Active Impact Alert: ICU capacity reduced. Emergency admissions may be affected.
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">TAT Surge: +35m</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  {data.impactCascade.nodes.map((n, idx) => (
                    <div key={n.id} className={`p-3 rounded-xl border ${n.status === 'danger' ? 'bg-rose-950/40 border-rose-500/40' : 'bg-amber-950/40 border-amber-500/40'}`}>
                      <div className="font-mono text-[10px] text-slate-400 font-bold">0{idx + 1}. {n.department}</div>
                      <div className="font-bold text-white mt-1">{n.name}</div>
                      <p className="text-[11px] text-slate-400 mt-1">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Patients Table */}
              <div className="glass-panel p-5 border-slate-800">
                <h3 className="text-base font-bold text-white mb-3 font-['Outfit']">Emergency Triage Board</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                        <th className="py-2 px-3">Patient ID</th>
                        <th className="py-2 px-3">Name & Phone</th>
                        <th className="py-2 px-3">Triage</th>
                        <th className="py-2 px-3">Chief Complaint</th>
                        <th className="py-2 px-3">Attending Doctor</th>
                        <th className="py-2 px-3">Duration</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.patients.filter(p => p.department === 'emergency').map((pt) => (
                        <tr key={pt.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-3 font-mono font-bold text-cyan-300">{pt.id}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{pt.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{pt.primaryMobile}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`badge ${pt.triageLevel.includes('Red') ? 'badge-red' : 'badge-amber'} text-[10px]`}>
                              {pt.triageLevel}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{pt.chiefComplaint}</td>
                          <td className="py-3 px-3 font-semibold text-slate-200">{pt.attendingDoctor}</td>
                          <td className="py-3 px-3 font-mono text-amber-300">{pt.registrationDurationMinutes} mins</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => { setSelectedPatientId(pt.id); setActiveTab("patients"); }}
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
          )}

          {/* ================================================================
              SECTION 5: BOTTLENECKS (DIAGNOSTIC LAB & 1-CLICK MITIGATION)
             ================================================================ */}
          {activeTab === "bottlenecks" && (
            <div className="flex flex-col gap-6">
              
              <div className="glass-panel p-5 border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <span>🚦 Automated Bottleneck Detection Engine</span>
                    <span className="badge badge-red text-xs">Real-Time Chokepoints</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    HospitalSync notices when one department is backing up while others remain normal, identifying root causes and recommending instant mitigations.
                  </p>
                </div>
                <span className="badge badge-cyan text-xs">Zero-Refresh Sensor Matrix</span>
              </div>

              {/* Spotlight: Laboratory Bottleneck */}
              {labBottleneck && (
                <div className={`glass-panel p-6 border-2 transition-all ${
                  labBottleneck.status === 'active' ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-900' : 'border-emerald-500/40 bg-slate-950'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${labBottleneck.status === 'active' ? 'badge-red' : 'badge-emerald'} text-xs font-bold`}>
                          {labBottleneck.badgeText}
                        </span>
                        <span className="text-xs text-slate-400">Diagnostic Laboratory Division</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1">Laboratory Queue Delay & Chokepoint Analysis</h3>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400">Average Waiting Time:</span>
                        <div className="text-lg font-bold text-rose-400 mono-font">{labBottleneck.avgWaitTime}</div>
                      </div>
                      <div className="h-7 w-px bg-slate-800"></div>
                      <div>
                        <span className="text-slate-400">Target Turnaround:</span>
                        <div className="text-lg font-bold text-emerald-400 mono-font">{labBottleneck.normalWaitTime}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-slate-400 uppercase">Pending Tasks:</span>
                      <div className="text-2xl font-bold text-rose-400 mono-font mt-1">{labBottleneck.pendingTasks} Tests</div>
                      <p className="text-slate-400 mt-1">Threshold: &gt; 15 triggers critical bottleneck alarm.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 md:col-span-2 space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase">Root Cause & Administrator Insight:</span>
                      <p className="text-sm font-semibold text-rose-300">"{labBottleneck.description}"</p>
                      <p className="text-slate-400"><strong>Root Cause:</strong> {labBottleneck.rootCause}</p>
                    </div>
                  </div>

                  {/* 1-Click Mitigations */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-rose-500/20 space-y-3">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚡ 1-Click Chokepoint Mitigations (Admin Action)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {labBottleneck.suggestedActions.map((act) => (
                        <div key={act.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between text-xs">
                          <div>
                            <div className="font-bold text-white flex justify-between">
                              <span>{act.title}</span>
                              <span className="text-emerald-400 text-[10px]">{act.impact}</span>
                            </div>
                            <p className="text-slate-400 mt-1">{act.description}</p>
                          </div>
                          <button
                            onClick={() => resolveBottleneckAction(labBottleneck.id, act.id)}
                            disabled={labBottleneck.status === 'resolved'}
                            className={`btn-primary text-xs py-1.5 px-3 mt-3 justify-center ${labBottleneck.status === 'resolved' ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            <span>{labBottleneck.status === 'resolved' ? '✓ Mitigation Deployed' : 'Deploy This Action Now'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================================================
              SECTION 6: RESOURCES (DOCTORS, NURSES, BEDS, EQUIPMENT)
             ================================================================ */}
          {activeTab === "resources" && (
            <div className="flex flex-col gap-6">
              
              <div className="glass-panel p-5 border-slate-800/80 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <span>Hospital Clinical Resources & Bed Roster</span>
                    <span className="badge badge-emerald text-xs">Live Telemetry</span>
                  </h2>
                  <p className="text-xs text-slate-400">Doctors, registered nurses, ward beds, and diagnostic equipment availability.</p>
                </div>
                <button onClick={() => setIsReallocationModalOpen(true)} className="btn-primary text-xs py-2 px-3.5">
                  <span>💡 Smart Reallocation Advisor</span>
                </button>
              </div>

              {/* Beds Breakdown */}
              <div className="glass-panel p-5 border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white font-['Outfit']">🛏️ Hospital Beds & Ward Occupancy</h3>
                  <span className="text-xs font-bold text-emerald-400">{data.resources.beds.available} Available / 80 Total Beds</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  {data.resources.beds.breakdown.map((b, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="font-bold text-white">{b.ward}</div>
                      <div className="text-[11px] text-slate-400">{b.type}</div>
                      <div className="text-xl font-bold metric-value text-emerald-400 mt-2">{b.available > 0 ? b.available : 0} Free</div>
                      <div className="text-[10px] text-slate-500">{b.occupied} / {b.total} Occupied</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctors & Nurses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Doctors */}
                <div className="glass-panel p-5 border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white font-['Outfit']">🩺 Consultant Doctors on Duty</h3>
                  <div className="space-y-2">
                    {data.resources.doctors.map((doc) => (
                      <div key={doc.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{doc.name}</div>
                          <div className="text-cyan-400 text-[11px]">{doc.specialty} • {doc.department.toUpperCase()}</div>
                          <div className="text-slate-400 text-[10px]">{doc.status}</div>
                        </div>
                        <div className="text-right">
                          <span className="badge badge-emerald text-[9px]">Active Shift</span>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">{doc.contact}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nurses */}
                <div className="glass-panel p-5 border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white font-['Outfit']">👩‍⚕️ Nursing Staff Roster</h3>
                    <button onClick={() => setIsReallocationModalOpen(true)} className="text-xs text-cyan-400 hover:underline">Reallocate Nurses ➔</button>
                  </div>
                  <div className="space-y-2">
                    {data.resources.nurses.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{n.name}</div>
                          <div className="text-purple-300 text-[11px]">{n.role} • {n.department.toUpperCase()}</div>
                          <div className="text-slate-300 text-[10px] font-medium">{n.status}</div>
                        </div>
                        <div className="text-right">
                          <span className={`badge ${n.status.includes('Reallocated') || n.status.includes('Available') ? 'badge-cyan' : 'badge-purple'} text-[9px]`}>
                            {n.shift}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">{n.contact}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================================================================
              SECTION 7: RECOMMENDATIONS (SMART RESOURCE REALLOCATION)
             ================================================================ */}
          {activeTab === "recommendations" && (
            <div className="flex flex-col gap-6">
              
              <div className="glass-panel p-5 border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <span>🧠 AI Smart Resource Reallocation Hub</span>
                    <span className="badge badge-cyan text-xs">Advisor</span>
                  </h2>
                  <p className="text-xs text-slate-400">The system recommends the best staffing and bed reallocation actions. The administrator makes the final decision.</p>
                </div>
              </div>

              <div className="space-y-4">
                {data.aiRecommendations.map((rec) => {
                  const isApp = rec.status === "approved";
                  return (
                    <div key={rec.id} className={`glass-panel p-6 border-2 ${isApp ? 'border-emerald-500/50 bg-slate-950' : 'border-cyan-500/50 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-slate-900'}`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${isApp ? 'badge-emerald' : 'badge-amber'} text-xs font-bold`}>{rec.badge}</span>
                            <span className="text-xs text-slate-400">Priority: {rec.priority.toUpperCase()}</span>
                          </div>
                          <h3 className="text-lg font-bold text-white mt-1">{rec.title}</h3>
                        </div>

                        {isApp ? (
                          <span className="badge badge-emerald py-1 px-3 text-xs">✓ Approved & Executed Live</span>
                        ) : (
                          <button onClick={() => setIsReallocationModalOpen(true)} className="btn-primary text-xs py-2 px-4">
                            <span>Review & Approve</span>
                          </button>
                        )}
                      </div>

                      <div className="my-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                        <p className="text-sm font-semibold text-cyan-200">"{rec.summary}"</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          <div className="p-2 rounded bg-slate-950 border border-slate-800">
                            <span className="text-slate-400">Source:</span>
                            <div className="text-emerald-400 font-semibold">{rec.sourceDepartment}</div>
                          </div>
                          <div className="p-2 rounded bg-slate-950 border border-slate-800">
                            <span className="text-slate-400">Target:</span>
                            <div className="text-rose-400 font-semibold">{rec.targetDepartment}</div>
                          </div>
                        </div>
                        <p className="text-slate-400 pt-1"><strong>AI Rationale:</strong> {rec.aiRationale}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                          <div className="text-emerald-400 font-bold text-sm">{rec.projectedImpact.triageWaitReduction}</div>
                          <div className="text-slate-400 text-[10px]">Triage Wait Reduction</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                          <div className="text-cyan-400 font-bold text-sm">{rec.projectedImpact.crowdingIndexReduction}</div>
                          <div className="text-slate-400 text-[10px]">Overcrowding Index</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                          <div className="text-purple-400 font-bold text-sm">{rec.projectedImpact.patientSafetyScore}</div>
                          <div className="text-slate-400 text-[10px]">Clinical Response Score</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ================================================================
              SECTION 8: PATIENT JOURNEY (TRACKING, STATIONS, DELAY PREDICTION)
             ================================================================ */}
          {activeTab === "journey" && (
            <div className="flex flex-col gap-6">
              
              <div className="glass-panel p-5 border-slate-800/80 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <span>Patient Journey Tracking & Delay Prediction</span>
                    <span className="badge badge-cyan text-xs">Real-Time Progression</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tracks patient movement from Registration ➔ Triage ➔ Doctor ➔ Diagnostics ➔ Pharmacy ➔ Admission/Discharge with live delay prediction per station.
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  {data.patients.map((pt) => (
                    <button
                      key={pt.id}
                      onClick={() => setSelectedPatientId(pt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedPatient.id === pt.id ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {pt.name} ({pt.id})
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Patient Banner */}
              <div className="glass-panel p-5 border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-cyan-300 text-sm px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">{selectedPatient.id}</span>
                      <h3 className="text-lg font-bold text-white">{selectedPatient.name}</h3>
                      <span className={`badge ${selectedPatient.triageLevel.includes('Red') ? 'badge-red' : 'badge-emerald'} text-xs`}>{selectedPatient.triageLevel}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedPatient.age}y • {selectedPatient.gender} • Chief Complaint: <strong className="text-slate-200">{selectedPatient.chiefComplaint}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => triggerMedicineAlarm(selectedPatient.id, selectedPatient.medicineAlarms[0]?.id)} className="btn-secondary text-xs py-1.5 px-3 text-amber-300">
                      <span>⏰ Trigger Alarm</span>
                    </button>
                    <button onClick={() => setActiveTab("report")} className="btn-primary text-xs py-1.5 px-3">
                      <span>📑 Understand My Report</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Clinical Pathway Completion</span>
                    <span className="font-bold text-cyan-400 mono-font">{selectedPatient.journeyProgressPct}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${selectedPatient.journeyProgressPct}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Station Timeline */}
              <div className="glass-panel p-6 border-slate-800">
                <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider font-['Outfit']">
                  Chronological Journey Stations & Station Dwell Times
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-emerald-400 before:to-slate-800">
                  {selectedPatient.journeySteps.map((step, idx) => {
                    const isComp = step.status === "completed";
                    const isProg = step.status === "in-progress";

                    return (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 ${
                          isComp ? 'bg-emerald-500 border-emerald-300' : isProg ? 'bg-amber-400 border-amber-200 animate-ping' : 'bg-slate-900 border-slate-700'
                        }`}></div>

                        <div className={`p-4 rounded-2xl border transition-all ${
                          isComp ? 'bg-slate-900/60 border-slate-800' : isProg ? 'bg-amber-950/30 border-amber-500/40 shadow-lg' : 'bg-slate-950/40 border-slate-900 opacity-60'
                        }`}>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="mono-font text-xs font-bold text-slate-500">0{idx + 1}.</span>
                              <h4 className={`text-sm font-bold ${isProg ? 'text-amber-300' : 'text-white'}`}>{step.name}</h4>
                              <span className={`badge ${isComp ? 'badge-emerald' : isProg ? 'badge-amber' : 'badge-cyan'} text-[10px] py-0.5 px-2`}>
                                {step.status.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-slate-400 mono-font">{step.timestamp}</span>
                              <span className="font-semibold text-cyan-300">{step.duration}</span>
                            </div>
                          </div>

                          {step.delayWarning && (
                            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-rose-300 font-semibold flex items-center gap-1.5">
                              <span>⚠️ Delay Prediction Alert:</span>
                              <span>{step.delayWarning}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ================================================================
              SECTION 9: UNDERSTAND MY REPORT ("UNDERSTAND MY REPORT" AI EXPLINER)
             ================================================================ */}
          {activeTab === "report" && (
            <div className="flex flex-col gap-6">
              
              <div className="glass-panel p-5 border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <span>📑 Understand My Medical Report (AI Simplifier)</span>
                    <span className="badge badge-cyan text-xs">Patient Friendly</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Converts complex clinical lab & radiology reports into plain, easy-to-understand language with bilingual support (English & Hindi) and doctor remarks.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setReportLangHindi(!reportLangHindi)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      reportLangHindi ? "bg-amber-500 text-slate-950 font-bold border-amber-400" : "bg-slate-900 text-slate-300 border-slate-700"
                    }`}
                  >
                    {reportLangHindi ? "🇮🇳 भाषा: हिंदी (Hindi)" : "🌐 Language: English"}
                  </button>
                </div>
              </div>

              {/* Patient Selector Bar */}
              <div className="glass-panel p-4 border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Patient Diagnostic Report:</span>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {data.patients.map((pt) => (
                    <button
                      key={pt.id}
                      onClick={() => setSelectedPatientId(pt.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedPatient.id === pt.id ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {pt.name} ({pt.report ? pt.report.title.split(" ")[0] : "Lab"})
                    </button>
                  ))}
                </div>
              </div>

              {/* Report Body */}
              {selectedPatient.report ? (
                <div className="glass-panel p-6 border-slate-800 space-y-6">
                  
                  {/* Report Top Sheet */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <span className="badge badge-cyan text-[10px]">Verified Pathological Telemetry</span>
                      <h3 className="text-xl font-bold text-white mt-1 font-['Outfit']">{selectedPatient.report.title}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Patient: <strong className="text-white">{selectedPatient.name}</strong> ({selectedPatient.id}) • Sample Date: {selectedPatient.report.sampleDate}
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-400">
                      <div>Signed by: <strong className="text-cyan-300">{selectedPatient.report.approvedBy}</strong></div>
                      <div className="text-[11px] text-slate-500">Phlebotomist: {selectedPatient.report.labTech}</div>
                    </div>
                  </div>

                  {/* AI Plain English / Hindi Explanation Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border-2 border-cyan-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>💡 "In Plain Words" - What this report means for you</span>
                      </span>
                      <span className="badge badge-emerald text-[10px]">AI Translated</span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                      {reportLangHindi ? selectedPatient.report.hindiSummary : selectedPatient.report.overallConclusion}
                    </p>
                  </div>

                  {/* Clinical Parameters Breakdown Cards */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Test Parameter Analysis & Reference Ranges
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {selectedPatient.report.parameters.map((param, i) => {
                        const isHigh = param.status === "high";
                        const isLow = param.status === "low";

                        return (
                          <div key={i} className={`p-4 rounded-xl border ${
                            isHigh ? 'bg-rose-950/20 border-rose-500/40' : isLow ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900/70 border-slate-800'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="text-sm font-bold text-white">{param.name}</h5>
                                <div className="text-xs text-slate-400 mt-0.5">Reference: {param.normalRange}</div>
                              </div>
                              <div className="text-right">
                                <div className={`text-base font-bold mono-font ${isHigh ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {param.value}
                                </div>
                                <span className={`badge ${isHigh ? 'badge-red' : isLow ? 'badge-amber' : 'badge-emerald'} text-[9px] py-0.5`}>
                                  {isHigh ? 'HIGH' : isLow ? 'LOW' : 'NORMAL'}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 mt-2.5 pt-2 border-t border-slate-800/80 leading-relaxed">
                              <strong>Meaning:</strong> {param.meaning}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Patient Actionable Tips */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🥗 Diet, Medication & Lifestyle Recommendations</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedPatient.report.patientTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="glass-panel p-8 text-center text-slate-400">
                  <p>No report currently generated for this patient.</p>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* ====================================================================
          MODAL 1: SMART RESOURCE REALLOCATION (WARD B -> EMERGENCY)
         ==================================================================== */}
      {isReallocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl glass-panel p-6 border-cyan-500/40 bg-slate-950 shadow-2xl rounded-2xl border-2">
            
            <button onClick={() => setIsReallocationModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white">✕</button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🧠</span>
              <div>
                <span className="badge badge-cyan text-xs font-bold">Smart Resource Reallocation</span>
                <h3 className="text-lg font-bold text-white mt-0.5">AI Staffing & Overcrowding Optimizer</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40">
                <span className="text-rose-300 font-bold uppercase">Demand Surge:</span>
                <div className="text-sm font-bold text-white mt-0.5">Emergency & Trauma (94% Load)</div>
                <p className="text-slate-400 mt-1">18 patients (6 red triage) under 8 nurses.</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                <span className="text-emerald-300 font-bold uppercase">Surplus Staff:</span>
                <div className="text-sm font-bold text-white mt-0.5">General Ward B (32% Load)</div>
                <p className="text-slate-400 mt-1">13 stable patients, 7 free beds, 6 nurses on duty.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 mb-4 text-xs space-y-2">
              <div className="font-bold text-cyan-300">💡 AI Recommendation:</div>
              <p className="text-slate-100 font-semibold">
                "2 available nurses (Nurse Ananya Sen & Nurse Rahul Varma) from Ward B can be temporarily assigned to Emergency."
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-emerald-400 font-bold">-58%</div>
                  <div className="text-[10px] text-slate-400">Triage Wait Time</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold">74%</div>
                  <div className="text-[10px] text-slate-400">Overcrowding Index</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-purple-400 font-bold">+32%</div>
                  <div className="text-[10px] text-slate-400">Red Acuity Response</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">The administrator makes the final decision.</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsReallocationModalOpen(false)} className="btn-secondary text-xs py-2 px-3">Dismiss</button>
                <button
                  onClick={() => { approveNurseReallocation("rec-nurse-realloc"); setIsReallocationModalOpen(false); }}
                  disabled={nurseRec?.status === 'approved'}
                  className={`btn-primary text-xs py-2 px-4 ${nurseRec?.status === 'approved' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span>{nurseRec?.status === 'approved' ? 'Already Reallocated' : 'Approve & Execute Shift'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: PATIENT REGISTRATION INTAKE FORM (WITH SYMPTOMS & PHONE)
         ==================================================================== */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl glass-panel p-6 border-cyan-500/40 bg-slate-950 shadow-2xl rounded-2xl border-2 max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => setIsNewPatientModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white">✕</button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📝</span>
              <div>
                <span className="badge badge-cyan text-xs font-bold">New Admission Registration</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Patient Intake Form & Clinical Registration</h3>
              </div>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
              
              {/* Demographics */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="font-bold text-cyan-300 uppercase tracking-wider">1. Patient Details & Mobile Contact</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Full Name (e.g. Vikram Malhotra) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Patient Full Name"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
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
                        value={regForm.age}
                        onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                        className="w-1/2 px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                      <select
                        value={regForm.gender}
                        onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                        className="w-1/2 px-2 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Primary Mobile Number (For Alarms & SMS) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={regForm.primaryMobile}
                      onChange={(e) => setRegForm({ ...regForm, primaryMobile: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Emergency Alternate Contact Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98111 22334"
                      value={regForm.emergencyContactMobile}
                      onChange={(e) => setRegForm({ ...regForm, emergencyContactMobile: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms Selector */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="font-bold text-cyan-300 uppercase tracking-wider">2. Symptoms & Chief Complaints</div>
                
                <div>
                  <label className="block text-slate-400 mb-1.5">Select Patient Symptoms:</label>
                  <div className="flex flex-wrap gap-2">
                    {["Chest Pain", "Shortness of Breath", "High Fever", "Severe Abdominal Pain", "Dizziness / Fainting", "Vomiting / Nausea", "Headache", "Trauma / Fracture"].map((sym) => {
                      const isSel = regForm.symptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setRegForm({ ...regForm, symptoms: regForm.symptoms.filter(s => s !== sym) });
                            } else {
                              setRegForm({ ...regForm, symptoms: [...regForm.symptoms, sym] });
                            }
                          }}
                          className={`px-3 py-1 rounded-lg font-medium transition-all ${
                            isSel ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                          }`}
                        >
                          {isSel ? "✓ " : "+ "}{sym}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Chief Clinical Complaint Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Acute severe substernal discomfort for past 45 minutes"
                    value={regForm.chiefComplaint}
                    onChange={(e) => setRegForm({ ...regForm, chiefComplaint: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Department & Triage */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={regForm.department}
                    onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                  >
                    <option value="emergency">Emergency & Trauma</option>
                    <option value="opd">Outpatient OPD</option>
                    <option value="ward-a">General Ward A</option>
                    <option value="ward-b">General Ward B</option>
                    <option value="icu">ICU Critical Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Triage Acuity</label>
                  <select
                    value={regForm.triageLevel}
                    onChange={(e) => setRegForm({ ...regForm, triageLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                  >
                    <option value="Red (Critical)">🔴 Red (Critical - Immediate)</option>
                    <option value="Yellow (Urgent)">🟡 Yellow (Urgent - 30m)</option>
                    <option value="Green (Standard)">🟢 Green (Standard - Stable)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Attending Doctor</label>
                  <select
                    value={regForm.attendingDoctor}
                    onChange={(e) => setRegForm({ ...regForm, attendingDoctor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                  >
                    <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Emergency)</option>
                    <option value="Dr. Priya Patel">Dr. Priya Patel (Cardiology)</option>
                    <option value="Dr. Amit Deshmukh">Dr. Amit Deshmukh (Surgery)</option>
                    <option value="Dr. Sunita Rao">Dr. Sunita Rao (Critical Care)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsNewPatientModalOpen(false)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2 px-6 font-bold shadow-cyan-500/30">
                  Complete Registration & Launch Journey Track
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ====================================================================
          DRAWER: PATIENT MOBILE APP SIMULATOR (ALARMS & SMS/WHATSAPP)
         ==================================================================== */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm h-[92vh] bg-slate-950 border-4 border-slate-700 rounded-[38px] shadow-2xl overflow-hidden flex flex-col justify-between">
            
            {/* Top Notch */}
            <div className="pt-2.5 pb-1 px-6 bg-slate-950 flex items-center justify-between text-[11px] text-slate-300 border-b border-slate-900">
              <span className="font-bold">09:41</span>
              <div className="w-16 h-3.5 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                <span>Jio 5G</span>
              </div>
            </div>

            {/* App Header */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">HS</div>
                <div>
                  <div className="text-xs font-bold text-white">HospitalSync Patient App</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{selectedPatient.name} ({selectedPatient.primaryMobile})</div>
                </div>
              </div>
              <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Mobile Screen View */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-950 text-xs">
              
              {/* Active Alarm Notification */}
              {mobileNotification?.type === "medicine_alarm" && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-950/80 border-2 border-amber-500 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-amber text-[9px]">🔔 Medicine Time Alert</span>
                    <span className="font-mono text-xs font-bold text-amber-300">{mobileNotification.scheduledTime}</span>
                  </div>
                  <div className="font-bold text-sm text-white">{mobileNotification.medicine}</div>
                  <p className="text-[11px] text-slate-300">{mobileNotification.instructions}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => markDoseTaken(mobileNotification.patientId, mobileNotification.alarmId)}
                      className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center bg-gradient-to-r from-emerald-600 to-emerald-700"
                    >
                      ✓ Take Dose
                    </button>
                    <button onClick={() => setMobileNotification(null)} className="btn-secondary text-xs py-1.5 px-3">Snooze</button>
                  </div>
                </div>
              )}

              {/* Active Appointment SMS Notification */}
              {mobileNotification?.type === "appointment_sms" && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/90 via-slate-900 to-blue-950/80 border-2 border-cyan-400 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-cyan text-[9px]">📅 SMS & WhatsApp Received</span>
                  </div>
                  <p className="text-slate-200"><strong>Namaste {selectedPatient.name},</strong></p>
                  <p className="text-slate-300">Your clinical consultation is scheduled with <strong className="text-cyan-300">{mobileNotification.doctor}</strong> on:</p>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-white text-xs">
                    📅 {mobileNotification.date} at {mobileNotification.time}
                    <div className="text-slate-400 text-[10px]">{mobileNotification.roomNo} ({mobileNotification.department})</div>
                  </div>
                  <button onClick={() => setMobileNotification(null)} className="btn-secondary text-xs py-1 px-3 w-full justify-center">Dismiss Message</button>
                </div>
              )}

              {/* Digital Health Pass */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{selectedPatient.name}</div>
                  <div className="text-[10px] text-slate-400">ID: {selectedPatient.id} • Blood: {selectedPatient.bloodGroup}</div>
                </div>
                <span className={`badge ${selectedPatient.triageLevel.includes('Red') ? 'badge-red' : 'badge-emerald'} text-[9px]`}>
                  {selectedPatient.triageLevel.split(' ')[0]}
                </span>
              </div>

              {/* Scheduled Daily Alarms */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Daily Medicine Alarm Schedule</div>
                <div className="space-y-1.5">
                  {selectedPatient.medicineAlarms.map((alm) => (
                    <div key={alm.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-mono font-bold text-cyan-300">{alm.time}</span>
                        <div className="text-slate-400">{alm.medicine}</div>
                      </div>
                      {alm.taken ? (
                        <span className="text-emerald-400 font-bold">✓ Taken</span>
                      ) : (
                        <span className="text-amber-400 font-semibold">Scheduled</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Prescriptions */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Active Prescriptions (₹ INR)</div>
                {selectedPatient.prescriptions.slice(0, 3).map((rx) => (
                  <div key={rx.id} className="p-1.5 rounded bg-slate-950 border border-slate-800 flex justify-between text-[11px]">
                    <span className="text-slate-200">{rx.medicineName}</span>
                    <span className="text-emerald-400 font-bold mono-font">₹{rx.priceINR}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-900 flex justify-center">
              <div className="w-28 h-1 bg-slate-700 rounded-full"></div>
            </div>

          </div>
        </div>
      )}

      {/* Global Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
            toast.type === "success" ? "bg-emerald-950/90 border-emerald-500 text-emerald-200" : toast.type === "danger" ? "bg-rose-950/90 border-rose-500 text-rose-200" : "bg-cyan-950/90 border-cyan-500 text-cyan-200"
          }`}>
            <span className="text-lg">{toast.type === "success" ? "✓" : toast.type === "danger" ? "⚠️" : "ℹ️"}</span>
            <span className="text-xs font-semibold">{toast.msg}</span>
          </div>
        </div>
      )}

    </div>
  );
}

// Render root
ReactDOM.render(<HospitalSyncApp />, document.getElementById("root"));
