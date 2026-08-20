export const initialHospitalData = {
  kpis: {
    patientsToday: 245,
    emergencyPatients: 18,
    availableBeds: 12,
    totalBeds: 80,
    pendingLabTests: 37,
    pharmacyRequests: 24,
    delayedCases: 8,
    avgWaitTimeMinutes: 28,
    occupancyRate: 85
  },
  
  bottlenecks: [
    {
      id: "bot-lab-1",
      departmentId: "lab",
      departmentName: "Diagnostic Laboratory",
      severity: "critical", // critical, warning, normal
      status: "active",
      badgeText: "Bottleneck Detected: Laboratory",
      pendingTasks: 37,
      normalThreshold: 15,
      avgWaitTime: "42 minutes",
      normalWaitTime: "15 minutes",
      impactScore: "High (Slows Down 68% of Inpatient & Emergency Flow)",
      rootCause: "High surge in STAT Cardiac Biomarker & CBC panels + Phlebotomy Bay 2 calibration delay.",
      description: "The laboratory is slowing down patient flow across Emergency and Inpatient admissions.",
      affectedDepartments: ["emergency", "icu", "opd", "ward-a"],
      suggestedActions: [
        {
          id: "act-lab-aux",
          title: "Open Auxiliary Sample Collection Bay 3",
          description: "Re-routes 14 routine OPD blood draws away from STAT lab queue.",
          impact: "Reduces lab wait time by 18 mins",
          type: "reroute"
        },
        {
          id: "act-lab-tech",
          title: "Deploy Floating Phlebotomist (Tech Sanjay Verma)",
          description: "Dispatches senior lab tech to assist in Emergency blood draws.",
          impact: "Clears 12 pending STAT tests in 15 mins",
          type: "staff"
        }
      ]
    },
    {
      id: "bot-pharm-1",
      departmentId: "pharmacy",
      departmentName: "Central Inpatient Pharmacy",
      severity: "warning",
      status: "active",
      badgeText: "Moderate Queue: Pharmacy",
      pendingTasks: 24,
      normalThreshold: 12,
      avgWaitTime: "21 minutes",
      normalWaitTime: "8 minutes",
      impactScore: "Medium (Discharge clearances delayed by ~15 min)",
      rootCause: "Evening IV dose batch reconstitution for General Ward A & B.",
      description: "Pharmacy dispensing queue slightly elevated due to batch compounding.",
      affectedDepartments: ["ward-a", "ward-b"],
      suggestedActions: [
        {
          id: "act-pharm-fast",
          title: "Enable Express Discharge Dispensing Counter",
          description: "Prioritizes take-home medication packets for 6 departing patients.",
          impact: "Frees up 2 beds in Ward A immediately",
          type: "process"
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
      sourceDepartment: "General Ward B (Low Workload 🟢 - 32% load)",
      targetDepartment: "Emergency & Trauma (Very Busy 🔴 - 94% load)",
      recommendedStaff: [
        { id: "staff-n-3", name: "Nurse Ananya Sen", role: "Senior Staff Nurse", currentDept: "General Ward B" },
        { id: "staff-n-4", name: "Nurse Rahul Varma", role: "Critical Care Nurse", currentDept: "General Ward B" }
      ],
      projectedImpact: {
        triageWaitReduction: "58% faster triage (26m ➔ 11m)",
        crowdingIndexReduction: "Overcrowding reduced from 94% to 74%",
        patientSafetyScore: "+32% responsiveness to Level 1 Red cases"
      },
      aiRationale: "Ward B has 7 unoccupied beds and only 13 stable recovering patients under the care of 6 nurses. Emergency currently has 18 active patients (6 red triage) with only 8 staff nurses on duty."
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
      recommendedStaff: [],
      projectedImpact: {
        triageWaitReduction: "Frees 1 critical ICU bed for incoming trauma",
        crowdingIndexReduction: "ICU capacity buffer restored to 17%",
        patientSafetyScore: "Continuous monitoring transferred to Step-down HDU"
      },
      aiRationale: "Biochemistry vitals stabilized over last 14 hours. Vasoactive support weaned off successfully."
    }
  ],

  impactRipples: {
    activeCascade: {
      id: "casc-icu-outage",
      title: "ICU Bed Unavailable Cascade",
      severity: "critical",
      origin: "ICU / Critical Care Unit (Capacity: 100%)",
      headline: "⚠️ Impact Alert: ICU capacity reduced. Emergency admissions may be affected.",
      nodes: [
        {
          id: "step-1",
          name: "ICU Bed Unavailable",
          department: "ICU / CCU",
          status: "danger",
          icon: "BedDouble",
          description: "All 12 critical care beds currently occupied by ventilator & post-op cases."
        },
        {
          id: "step-2",
          name: "Emergency Admission Affected",
          department: "Emergency Care",
          status: "danger",
          icon: "AlertOctagon",
          description: "High-acuity trauma patient held in Resuscitation Bay 1 awaiting ICU transfer."
        },
        {
          id: "step-3",
          name: "Bed Allocation Affected",
          department: "Central Admission Hub",
          status: "warning",
          icon: "Layers",
          description: "General step-down beds in Ward A/B queued; admission pipeline blocked."
        },
        {
          id: "step-4",
          name: "Doctor / Staff Planning Affected",
          department: "Clinical Staffing Roster",
          status: "warning",
          icon: "UserCheck",
          description: "Emergency physicians diverted to manage intensive ICU hold patient."
        },
        {
          id: "step-5",
          name: "Patient Waiting Time May Increase",
          department: "Entire Hospital Flow",
          status: "danger",
          icon: "Clock",
          description: "Overall OPD & Emergency waiting time surges by an estimated +35 minutes."
        }
      ]
    }
  },

  departments: [
    {
      id: "emergency",
      name: "Emergency & Trauma Care",
      code: "EMERG",
      head: "Dr. Rajesh Sharma",
      status: "critical", // critical, busy, normal
      statusLabel: "Very Busy 🔴",
      patientCount: 18,
      triageRed: 6,
      triageYellow: 8,
      triageGreen: 4,
      doctorsOnDuty: 6,
      nursesOnDuty: 8,
      capacityPct: 94,
      avgWaitTime: "38 mins",
      criticalAlert: "Resuscitation Bay at 100% capacity",
      color: "rose"
    },
    {
      id: "lab",
      name: "Diagnostic Laboratory",
      code: "PATH-LAB",
      head: "Dr. Suresh Iyer",
      status: "critical",
      statusLabel: "Bottleneck 🔴",
      patientCount: 37,
      triageRed: 0,
      triageYellow: 0,
      triageGreen: 0,
      doctorsOnDuty: 2,
      nursesOnDuty: 4, // technicians
      capacityPct: 96,
      avgWaitTime: "42 mins",
      criticalAlert: "37 Pending Tests (21 STAT Cardiac & Blood)",
      color: "rose"
    },
    {
      id: "icu",
      name: "ICU & Critical Care (CCU)",
      code: "ICU-CCU",
      head: "Dr. Sunita Rao",
      status: "warning",
      statusLabel: "Near Capacity 🟡",
      patientCount: 11,
      totalBeds: 12,
      availableBeds: 1,
      doctorsOnDuty: 3,
      nursesOnDuty: 6,
      capacityPct: 92,
      avgWaitTime: "12 mins",
      criticalAlert: "Only 1 Bed Available",
      color: "amber"
    },
    {
      id: "pharmacy",
      name: "Central Inpatient Pharmacy",
      code: "PHARM",
      head: "Pharmacist Arjun Nair",
      status: "warning",
      statusLabel: "Moderate Queue 🟡",
      patientCount: 24,
      doctorsOnDuty: 1,
      nursesOnDuty: 4,
      capacityPct: 78,
      avgWaitTime: "21 mins",
      criticalAlert: "24 Prescriptions Processing",
      color: "amber"
    },
    {
      id: "ward-a",
      name: "General Inpatient Ward A",
      code: "WARD-A",
      head: "Dr. Amit Deshmukh",
      status: "normal",
      statusLabel: "Active Normal 🟢",
      patientCount: 18,
      totalBeds: 22,
      availableBeds: 4,
      doctorsOnDuty: 2,
      nursesOnDuty: 5,
      capacityPct: 82,
      avgWaitTime: "10 mins",
      criticalAlert: "4 Beds Available for Transfers",
      color: "emerald"
    },
    {
      id: "ward-b",
      name: "General Inpatient Ward B",
      code: "WARD-B",
      head: "Dr. Neha Joshi",
      status: "normal",
      statusLabel: "Low Workload 🟢",
      patientCount: 13,
      totalBeds: 20,
      availableBeds: 7,
      doctorsOnDuty: 2,
      nursesOnDuty: 6,
      capacityPct: 32,
      avgWaitTime: "5 mins",
      criticalAlert: "Surplus Staff: 2 Available Nurses for Reallocation",
      color: "emerald"
    },
    {
      id: "opd",
      name: "Outpatient Department (OPD)",
      code: "OPD-GEN",
      head: "Dr. Priya Patel",
      status: "normal",
      statusLabel: "Operational 🟢",
      patientCount: 112,
      doctorsOnDuty: 8,
      nursesOnDuty: 10,
      capacityPct: 70,
      avgWaitTime: "18 mins",
      criticalAlert: "112 Consultations logged today",
      color: "cyan"
    },
    {
      id: "radiology",
      name: "Radiology & Advanced Imaging",
      code: "RAD-IMG",
      head: "Dr. Vikram Rathore",
      status: "normal",
      statusLabel: "Operational 🟢",
      patientCount: 14,
      doctorsOnDuty: 3,
      nursesOnDuty: 4,
      capacityPct: 62,
      avgWaitTime: "16 mins",
      criticalAlert: "CT Scanner 1 & MRI 3T Operational",
      color: "cyan"
    },
    {
      id: "ot",
      name: "Operation Theatres (OT Complex)",
      code: "OT-SURG",
      head: "Dr. Amit Deshmukh",
      status: "normal",
      statusLabel: "Operational 🟢",
      patientCount: 4,
      totalBeds: 6,
      availableBeds: 2,
      doctorsOnDuty: 5,
      nursesOnDuty: 6,
      capacityPct: 66,
      avgWaitTime: "0 mins",
      criticalAlert: "2 Emergency OT Suites on Immediate Standby",
      color: "purple"
    }
  ],

  resources: {
    doctors: [
      { id: "doc-1", name: "Dr. Rajesh Sharma", specialty: "Emergency Medicine & Trauma", role: "Chief of Emergency", department: "emergency", status: "On Duty - In Resuscitation", shift: "Morning (08:00 - 16:00)", contact: "+91 98200 11223" },
      { id: "doc-2", name: "Dr. Priya Patel", specialty: "Interventional Cardiology", role: "Senior Consultant", department: "opd", status: "On Duty - OPD Room 104", shift: "Morning (09:00 - 17:00)", contact: "+91 98200 44556" },
      { id: "doc-3", name: "Dr. Amit Deshmukh", specialty: "General & Laparoscopic Surgery", role: "Head of Surgery", department: "ot", status: "In OT Suite 2 (Appendectomy)", shift: "Full Day (08:00 - 20:00)", contact: "+91 98200 77889" },
      { id: "doc-4", name: "Dr. Sunita Rao", specialty: "Critical Care & Pulmonology", role: "ICU Director", department: "icu", status: "On Duty - ICU Rounds", shift: "Morning (08:00 - 16:00)", contact: "+91 98200 99001" },
      { id: "doc-5", name: "Dr. Vikram Rathore", specialty: "Radiodiagnosis & Interventional", role: "Lead Radiologist", department: "radiology", status: "On Duty - Reporting CT/MRI", shift: "Morning (09:00 - 17:00)", contact: "+91 98200 33445" },
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
        { ward: "OT Recovery", total: 10, occupied: 11, available: -1, type: "Overspill Monitored Bays" }
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
      chiefComplaint: "Acute substernal chest pain radiating to left arm & shortness of breath (30 min)",
      attendingDoctor: "Dr. Priya Patel",
      vitals: { bp: "154/96 mmHg", pulse: "108 bpm", spo2: "93%", temp: "98.4°F", rbs: "168 mg/dL" },
      status: "Under Emergency Resuscitation",
      currentJourneyStep: "lab_imaging",
      journeyProgressPct: 60,
      journeySteps: [
        { name: "Emergency Registration", status: "completed", timestamp: "08:15 AM", duration: "3 min" },
        { name: "Primary Triage & Vitals", status: "completed", timestamp: "08:18 AM", duration: "5 min" },
        { name: "Emergency Physician Assessment", status: "completed", timestamp: "08:24 AM", duration: "12 min" },
        { name: "STAT Cardiac Enzymes & ECG", status: "in-progress", timestamp: "08:40 AM", duration: "Waiting in Lab Queue (Delayed 🔴)" },
        { name: "ICU Bed Admission / Cath Lab", status: "pending", timestamp: "Est. 09:30 AM", duration: "--" },
        { name: "Pharmacy Dispensation", status: "pending", timestamp: "Est. 10:15 AM", duration: "--" }
      ],
      prescriptions: [
        {
          id: "rx-101",
          medicineName: "Sorbitrate (Isosorbide Dinitrate)",
          dosage: "5 mg",
          frequency: "Sublingual STAT",
          duration: "Immediate Dose",
          instructions: "Place 1 tablet under the tongue immediately for chest pain relief.",
          priceINR: 45,
          status: "Administered"
        },
        {
          id: "rx-102",
          medicineName: "Ecosprin (Aspirin)",
          dosage: "300 mg",
          frequency: "STAT (Chewable)",
          duration: "Immediate Dose",
          instructions: "Chew tablet thoroughly for antiplatelet effect.",
          priceINR: 18,
          status: "Administered"
        },
        {
          id: "rx-103",
          medicineName: "Brilinta (Ticagrelor)",
          dosage: "90 mg",
          frequency: "1-0-1 (Twice Daily)",
          duration: "7 Days",
          instructions: "Take with or without food after primary stabilization.",
          priceINR: 780,
          status: "Pending Dispense"
        },
        {
          id: "rx-104",
          medicineName: "Atorva (Atorvastatin)",
          dosage: "80 mg",
          frequency: "0-0-1 (Night)",
          duration: "30 Days",
          instructions: "Take bedtime after dinner.",
          priceINR: 420,
          status: "Pending Dispense"
        },
        {
          id: "rx-105",
          medicineName: "Pantocid (Pantoprazole)",
          dosage: "40 mg",
          frequency: "1-0-0 (Morning Empty Stomach)",
          duration: "10 Days",
          instructions: "Take 30 minutes before breakfast.",
          priceINR: 135,
          status: "Pending Dispense"
        }
      ],
      nextAppointment: {
        scheduledDate: "2026-08-25",
        scheduledTime: "10:30 AM",
        doctorName: "Dr. Priya Patel",
        department: "Cardiology OPD Block",
        roomNo: "Room 104 - 1st Floor",
        instructions: "Bring 12-lead ECG, Echo report, and 3-day BP log sheet.",
        smsSent: true,
        whatsappSent: true
      },
      medicineAlarms: [
        { id: "alm-1", time: "09:00 AM", medicine: "Pantocid 40mg", taken: true, status: "completed" },
        { id: "alm-2", time: "02:00 PM", medicine: "Brilinta 90mg", taken: false, status: "due_soon" },
        { id: "alm-3", time: "09:00 PM", medicine: "Atorva 80mg + Brilinta 90mg", taken: false, status: "scheduled" }
      ]
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
      departmentName: "Operation Theatres & General Surgery",
      triageLevel: "Yellow (Urgent)",
      triageColor: "amber",
      chiefComplaint: "Severe right lower quadrant abdominal pain, nausea, rebound tenderness",
      attendingDoctor: "Dr. Amit Deshmukh",
      vitals: { bp: "122/78 mmHg", pulse: "92 bpm", spo2: "98%", temp: "100.8°F", rbs: "110 mg/dL" },
      status: "In Pre-Op Preparation (Appendectomy)",
      currentJourneyStep: "surgery",
      journeyProgressPct: 75,
      journeySteps: [
        { name: "OPD Emergency Registration", status: "completed", timestamp: "07:45 AM", duration: "4 min" },
        { name: "Surgical Triage & Palpation", status: "completed", timestamp: "07:55 AM", duration: "10 min" },
        { name: "Abdominal Ultrasound & CBC", status: "completed", timestamp: "08:15 AM", duration: "25 min" },
        { name: "Pre-Anaesthetic Clearance", status: "completed", timestamp: "08:45 AM", duration: "15 min" },
        { name: "Laparoscopic Appendectomy (OT Suite 2)", status: "in-progress", timestamp: "09:15 AM", duration: "Underway" },
        { name: "Post-Op Ward B Recovery", status: "pending", timestamp: "Est. 11:00 AM", duration: "--" }
      ],
      prescriptions: [
        {
          id: "rx-201",
          medicineName: "Augmentin (Amoxicillin + Clavulanate)",
          dosage: "1.2 g IV",
          frequency: "STAT Pre-Op",
          duration: "1 Dose",
          instructions: "IV infusion 30 minutes prior to surgical incision.",
          priceINR: 320,
          status: "Administered"
        },
        {
          id: "rx-202",
          medicineName: "Dynapar (Diclofenac Sodium)",
          dosage: "75 mg IV",
          frequency: "SOS for Severe Pain",
          duration: "2 Days",
          instructions: "Dilute in 100ml Normal Saline over 20 minutes.",
          priceINR: 65,
          status: "Active"
        },
        {
          id: "rx-203",
          medicineName: "Emeset (Ondansetron)",
          dosage: "4 mg IV",
          frequency: "1-0-1 (Twice Daily)",
          duration: "3 Days",
          instructions: "Slow IV push for post-operative nausea prevention.",
          priceINR: 85,
          status: "Active"
        }
      ],
      nextAppointment: {
        scheduledDate: "2026-08-27",
        scheduledTime: "11:00 AM",
        doctorName: "Dr. Amit Deshmukh",
        department: "General Surgery Clinic",
        roomNo: "Room 208 - 2nd Floor",
        instructions: "Suture line inspection and dressing change. Maintain water-resistant cover.",
        smsSent: true,
        whatsappSent: true
      },
      medicineAlarms: [
        { id: "alm-4", time: "10:00 AM", medicine: "Augmentin IV Infusion", taken: true, status: "completed" },
        { id: "alm-5", time: "06:00 PM", medicine: "Emeset 4mg + Dynapar SOS", taken: false, status: "scheduled" }
      ]
    },
    {
      id: "HS-2026-879",
      name: "Rohan Gupta",
      age: 61,
      gender: "Male",
      bloodGroup: "A+",
      primaryMobile: "+91 94567 89012",
      emergencyContactName: "Meenakshi Gupta (Wife)",
      emergencyContactMobile: "+91 94123 98765",
      registeredAt: "2026-08-20T06:30:00+05:30",
      registrationDurationMinutes: 247,
      department: "ward-a",
      departmentName: "General Inpatient Ward A",
      triageLevel: "Yellow (Urgent)",
      triageColor: "amber",
      chiefComplaint: "Chronic COPD acute exacerbation, productive cough, wheezing",
      attendingDoctor: "Dr. Sunita Rao",
      vitals: { bp: "138/84 mmHg", pulse: "88 bpm", spo2: "91% on room air", temp: "99.1°F", rbs: "142 mg/dL" },
      status: "Admitted - Ward A Bed 04",
      currentJourneyStep: "inpatient_ward",
      journeyProgressPct: 80,
      journeySteps: [
        { name: "Emergency Registration", status: "completed", timestamp: "06:30 AM", duration: "4 min" },
        { name: "Triage & Nebulization", status: "completed", timestamp: "06:38 AM", duration: "20 min" },
        { name: "Chest X-Ray & ABG Analysis", status: "completed", timestamp: "07:15 AM", duration: "35 min" },
        { name: "Inpatient Bed Admission Ward A", status: "completed", timestamp: "08:00 AM", duration: "Bed 04" },
        { name: "Inhaled Bronchodilator Regimen", status: "in-progress", timestamp: "08:30 AM", duration: "Active" },
        { name: "Discharge Evaluation", status: "pending", timestamp: "Est. Tomorrow 11:00 AM", duration: "--" }
      ],
      prescriptions: [
        {
          id: "rx-301",
          medicineName: "Duolin Nebulizer (Levosalbutamol + Ipratropium)",
          dosage: "2.5 ml",
          frequency: "Every 6 Hours",
          duration: "4 Days",
          instructions: "Administer via electric nebulizer mask with 6L oxygen.",
          priceINR: 240,
          status: "Active"
        },
        {
          id: "rx-302",
          medicineName: "Budecort 0.5mg Respule",
          dosage: "0.5 mg",
          frequency: "1-0-1 (Twice Daily)",
          duration: "5 Days",
          instructions: "Nebulize immediately following Duolin dose.",
          priceINR: 195,
          status: "Active"
        },
        {
          id: "rx-303",
          medicineName: "Deriphyllin Retard (Theophylline + Etofylline)",
          dosage: "150 mg",
          frequency: "1-0-1 (After Food)",
          duration: "14 Days",
          instructions: "Do not crush or chew prolonged-release tablet.",
          priceINR: 92,
          status: "Dispensed"
        }
      ],
      nextAppointment: {
        scheduledDate: "2026-08-28",
        scheduledTime: "02:00 PM",
        doctorName: "Dr. Sunita Rao",
        department: "Pulmonology Clinic",
        roomNo: "Room 110 - OPD Block",
        instructions: "Spirometry pulmonary function test (PFT) 1 hour prior to appointment.",
        smsSent: true,
        whatsappSent: true
      },
      medicineAlarms: [
        { id: "alm-6", time: "08:00 AM", medicine: "Duolin + Budecort Nebulization", taken: true, status: "completed" },
        { id: "alm-7", time: "02:00 PM", medicine: "Duolin Nebulization", taken: false, status: "due_soon" },
        { id: "alm-8", time: "08:00 PM", medicine: "Deriphyllin 150mg + Budecort", taken: false, status: "scheduled" }
      ]
    },
    {
      id: "HS-2026-912",
      name: "Ananya Iyer",
      age: 52,
      gender: "Female",
      bloodGroup: "AB+",
      primaryMobile: "+91 99887 76655",
      emergencyContactName: "Karthik Iyer (Son)",
      emergencyContactMobile: "+91 99887 11223",
      registeredAt: "2026-08-19T21:30:00+05:30",
      registrationDurationMinutes: 785,
      department: "icu",
      departmentName: "ICU & Critical Care Unit",
      triageLevel: "Red (Critical)",
      triageColor: "rose",
      chiefComplaint: "Urosepsis with septic shock, persistent hypotension, oliguria",
      attendingDoctor: "Dr. Sunita Rao",
      vitals: { bp: "110/68 mmHg on Norad", pulse: "96 bpm", spo2: "97%", temp: "99.8°F", rbs: "155 mg/dL" },
      status: "Admitted - ICU Bed 02 (Step-down Eligible)",
      currentJourneyStep: "icu_stay",
      journeyProgressPct: 85,
      journeySteps: [
        { name: "Emergency Shock Resuscitation", status: "completed", timestamp: "Yesterday 09:30 PM", duration: "45 min" },
        { name: "Central Line & Arterial Line Placement", status: "completed", timestamp: "Yesterday 10:45 PM", duration: "30 min" },
        { name: "ICU Admission & Noradrenaline Infusion", status: "completed", timestamp: "Yesterday 11:30 PM", duration: "ICU Bed 02" },
        { name: "Vasopressor Weaning & Lactate Clearance", status: "completed", timestamp: "07:00 AM", duration: "Stable" },
        { name: "Transfer Clearance to General Ward A", status: "in-progress", timestamp: "09:30 AM", duration: "Step-Down Recommended" },
        { name: "Step-down Rehabilitation", status: "pending", timestamp: "Est. 12:00 PM", duration: "--" }
      ],
      prescriptions: [
        {
          id: "rx-401",
          medicineName: "Meromac (Meropenem)",
          dosage: "1 g IV",
          frequency: "1-1-1 (Every 8 Hours)",
          duration: "7 Days",
          instructions: "Infuse over 30 minutes in 100ml normal saline.",
          priceINR: 1850,
          status: "Active"
        },
        {
          id: "rx-402",
          medicineName: "Hydrocort (Hydrocortisone)",
          dosage: "100 mg IV",
          frequency: "Tapering Dose",
          duration: "3 Days",
          instructions: "Slow IV push morning and evening.",
          priceINR: 110,
          status: "Active"
        }
      ],
      nextAppointment: {
        scheduledDate: "2026-09-02",
        scheduledTime: "11:30 AM",
        doctorName: "Dr. Sunita Rao",
        department: "Critical Care Followup Clinic",
        roomNo: "Room 105 - Critical Care OPD",
        instructions: "Kidney Function Test (KFT) and Serum Procalcitonin reports required.",
        smsSent: true,
        whatsappSent: true
      },
      medicineAlarms: [
        { id: "alm-9", time: "06:00 AM", medicine: "Meropenem 1g IV", taken: true, status: "completed" },
        { id: "alm-10", time: "02:00 PM", medicine: "Meropenem 1g IV", taken: false, status: "due_soon" },
        { id: "alm-11", time: "10:00 PM", medicine: "Meropenem 1g + Hydrocortisone", taken: false, status: "scheduled" }
      ]
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
      attendingDoctor: "Dr. Priya Patel",
      vitals: { bp: "118/74 mmHg", pulse: "84 bpm", spo2: "99%", temp: "101.4°F", rbs: "94 mg/dL" },
      status: "Awaiting NS1 Antigen Lab Results",
      currentJourneyStep: "lab_imaging",
      journeyProgressPct: 50,
      journeySteps: [
        { name: "OPD Token Registration", status: "completed", timestamp: "08:50 AM", duration: "2 min" },
        { name: "Vitals & Nursing Assessment", status: "completed", timestamp: "09:02 AM", duration: "8 min" },
        { name: "Physician Clinical Consultation", status: "completed", timestamp: "09:20 AM", duration: "15 min" },
        { name: "Blood Draw for Dengue NS1 & Platelets", status: "in-progress", timestamp: "09:40 AM", duration: "Sample in Lab (37 queue)" },
        { name: "Pharmacy Prescription Pickup", status: "pending", timestamp: "Est. 10:45 AM", duration: "--" },
        { name: "Home Care Discharge", status: "pending", timestamp: "Est. 11:15 AM", duration: "--" }
      ],
      prescriptions: [
        {
          id: "rx-501",
          medicineName: "Dolo 650 (Paracetamol)",
          dosage: "650 mg",
          frequency: "1-1-1 (Every 6-8 Hours SOS)",
          duration: "5 Days",
          instructions: "Take strictly after meals for fever > 100°F. Maintain 3L water intake.",
          priceINR: 34,
          status: "Prescribed"
        },
        {
          id: "rx-502",
          medicineName: "Electral Oral Rehydration Salts (ORS)",
          dosage: "1 Sachet in 1L Water",
          frequency: "Throughout Day",
          duration: "4 Days",
          instructions: "Sip throughout the day to prevent dehydration.",
          priceINR: 42,
          status: "Prescribed"
        },
        {
          id: "rx-503",
          medicineName: "Caripill (Carica Papaya Extract)",
          dosage: "1100 mg",
          frequency: "1-1-1 (Three Times Daily)",
          duration: "5 Days",
          instructions: "Supports natural platelet recovery.",
          priceINR: 380,
          status: "Prescribed"
        }
      ],
      nextAppointment: {
        scheduledDate: "2026-08-23",
        scheduledTime: "09:00 AM",
        doctorName: "Dr. Priya Patel",
        department: "OPD Fever Clinic",
        roomNo: "Room 102 - Ground Floor",
        instructions: "Repeat Complete Blood Count (CBC) with Platelet Count prior to review.",
        smsSent: true,
        whatsappSent: true
      },
      medicineAlarms: [
        { id: "alm-12", time: "09:30 AM", medicine: "Dolo 650mg", taken: true, status: "completed" },
        { id: "alm-13", time: "01:30 PM", medicine: "Caripill 1100mg + ORS", taken: false, status: "due_soon" },
        { id: "alm-14", time: "07:30 PM", medicine: "Dolo 650mg + Caripill", taken: false, status: "scheduled" }
      ]
    }
  ],

  recentActivityFeed: [
    { id: "act-1", timestamp: "Just now", text: "Laboratory backlog reached 37 pending tests (Avg wait: 42m).", type: "danger", dept: "lab" },
    { id: "act-2", timestamp: "2 mins ago", text: "AI Alert: Recommended transferring 2 nurses from Ward B to Emergency.", type: "warning", dept: "ai" },
    { id: "act-3", timestamp: "5 mins ago", text: "ICU Bed 02 Patient Ananya Iyer stabilized and eligible for Step-Down.", type: "success", dept: "icu" },
    { id: "act-4", timestamp: "8 mins ago", text: "Emergency Resuscitation Bay 1 received red triage patient Aarav Verma.", type: "info", dept: "emergency" },
    { id: "act-5", timestamp: "12 mins ago", text: "Ward A Bed 12 discharged; sanitization completed.", type: "success", dept: "ward-a" }
  ]
};
