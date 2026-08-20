// ==========================================================================
// HospitalSync - Hospital Administrator Operations Command
// Client-Side Intelligence & Orchestration Engine
// ==========================================================================

// Global State
const appState = {
    currentTab: 'dashboard',
    systemPressure: 78,
    patientsToday: 245,
    emergencyPatients: 18,
    availableBeds: 12,
    pendingLabTests: 37,
    pharmacyRequests: 24,
    delayedCases: 8,
    reallocationApproved: false,
    selectedPatientId: 'PAT-1082',
    activeScenario: 'icu',
    filterDept: 'All',
    filterTriage: 'All'
};

// ==========================================================================
// 1. DATASETS (Realistic Clinical Telemetry)
// ==========================================================================

const patientsDatabase = [
    {
        id: 'PAT-1082',
        name: 'Marcus Vance',
        age: 48,
        gender: 'Male',
        triage: 'Red',
        dept: 'Emergency',
        complaint: 'Acute Chest Pain / STEMI rule-out',
        status: 'Stalled in Lab Queue',
        stageTime: '44m (Delayed 🔴)',
        doctor: 'Dr. Robert Davis (Cardiology)',
        currentStage: 3, // 0: Arrival, 1: Triage, 2: Emergency, 3: Lab/Diagnostics, 4: Doctor Review, 5: Bed Admission, 6: Pharmacy/Discharge
        stages: [
            { name: 'Arrival & Reg', time: '13:58', dwell: '4 mins', status: 'completed', note: 'Ambulance transfer via Bay 2' },
            { name: 'Triage Acuity', time: '14:02', dwell: '6 mins', status: 'completed', note: 'Assigned Red / Category 1' },
            { name: 'Emergency Bay', time: '14:08', dwell: '12 mins', status: 'completed', note: 'EKG, IV lines placed, Blood drawn' },
            { name: 'Laboratory Diagnostics', time: '14:20', dwell: '44 mins', status: 'bottleneck', note: '🔴 STALLED: Stat Troponin & Blood Gas queued (37 pending in Lab)' },
            { name: 'Doctor Clinical Review', time: 'Pending', dwell: '--', status: 'waiting', note: 'Waiting on Lab Troponin result before Cath Lab activation' },
            { name: 'ICU / CCU Admission', time: 'Pending', dwell: '--', status: 'waiting', note: 'ICU Bed #08 reserved pending lab confirmation' },
            { name: 'Discharge / Stepdown', time: 'Pending', dwell: '--', status: 'waiting', note: 'Projected post-op stepdown' }
        ],
        vitals: { hr: '108 bpm', bp: '154/96 mmHg', spo2: '94%', temp: '37.1 °C' },
        orders: ['Stat High-Sensitivity Troponin I', '12-Lead EKG', 'Arterial Blood Gas (ABG)', 'Aspirin 325mg PO']
    },
    {
        id: 'PAT-2041',
        name: 'Elena Rostova',
        age: 62,
        gender: 'Female',
        triage: 'Yellow',
        dept: 'ICU',
        complaint: 'Post-Op Coronary Bypass Recovery',
        status: 'Stable / Awaiting Stepdown',
        stageTime: '2h 15m',
        doctor: 'Dr. Michael Chen (Critical Care)',
        currentStage: 5,
        stages: [
            { name: 'Arrival & Reg', time: '08:30', dwell: '5 mins', status: 'completed', note: 'Scheduled Surgical Intake' },
            { name: 'Pre-Op Triage', time: '08:35', dwell: '25 mins', status: 'completed', note: 'Anesthesia clearance confirmed' },
            { name: 'Operating Theatre', time: '09:00', dwell: '3h 15m', status: 'completed', note: 'CABG x 3 performed smoothly' },
            { name: 'Post-Op Lab', time: '12:20', dwell: '15 mins', status: 'completed', note: 'Hemoglobin 11.2, ABG normal' },
            { name: 'Surgeon Review', time: '12:40', dwell: '20 mins', status: 'completed', note: 'Extubation criteria met' },
            { name: 'ICU Bed #04', time: '13:00', dwell: '2h 15m', status: 'active', note: '🔵 Can be stepped down to Ward C Bed #302 to free 1 ICU Bed' },
            { name: 'Discharge / Transfer', time: 'Pending', dwell: '--', status: 'waiting', note: 'Ward C Transfer in progress' }
        ],
        vitals: { hr: '74 bpm', bp: '122/78 mmHg', spo2: '98%', temp: '36.8 °C' },
        orders: ['Telemetry Monitoring', 'Incentive Spirometry', 'Enoxaparin 40mg SC']
    },
    {
        id: 'PAT-3190',
        name: 'David Kim',
        age: 34,
        gender: 'Male',
        triage: 'Yellow',
        dept: 'Lab',
        complaint: 'Abdominal Pain / Suspected Appendicitis',
        status: 'Waiting on CBC Panel',
        stageTime: '38m (Delayed 🔴)',
        doctor: 'Dr. Sarah Jenkins (General Surgery)',
        currentStage: 3,
        stages: [
            { name: 'Arrival & Reg', time: '14:04', dwell: '6 mins', status: 'completed', note: 'Self check-in via OPD Walk-In' },
            { name: 'Triage Acuity', time: '14:10', dwell: '8 mins', status: 'completed', note: 'Yellow / Moderate Urgency' },
            { name: 'Consultation Room 4', time: '14:18', dwell: '14 mins', status: 'completed', note: 'Abdominal palpation tenderness in RLQ' },
            { name: 'Laboratory Diagnostics', time: '14:32', dwell: '38 mins', status: 'bottleneck', note: '🔴 Delayed: CBC with Diff sample queued behind ER surge' },
            { name: 'Ultrasound / Review', time: 'Pending', dwell: '--', status: 'waiting', note: 'Radiology Ultrasound scheduled pending WBC count' },
            { name: 'Surgical Ward Inpatient', time: 'Pending', dwell: '--', status: 'waiting', note: 'Potential Laparoscopic Appendectomy' },
            { name: 'Post-Op Discharge', time: 'Pending', dwell: '--', status: 'waiting', note: 'Target discharge: 24h' }
        ],
        vitals: { hr: '88 bpm', bp: '130/84 mmHg', spo2: '99%', temp: '38.2 °C' },
        orders: ['Complete Blood Count (CBC)', 'Urinalysis', 'Abdominal Ultrasound']
    },
    {
        id: 'PAT-4022',
        name: 'Amina Patel',
        age: 29,
        gender: 'Female',
        triage: 'Green',
        dept: 'Ward',
        complaint: 'Post-Pneumonia Inpatient Recovery',
        status: 'Medically Cleared / Awaiting Rx',
        stageTime: '18m',
        doctor: 'Dr. Emily Ross (Internal Med)',
        currentStage: 6,
        stages: [
            { name: 'Arrival & Reg', time: 'Yesterday', dwell: '10 mins', status: 'completed', note: 'Direct admit from Clinic' },
            { name: 'Triage Assessment', time: 'Yesterday', dwell: '15 mins', status: 'completed', note: 'Bilateral lung crackles' },
            { name: 'Inpatient Treatment', time: '24h', dwell: '24h', status: 'completed', note: 'IV Ceftriaxone completed' },
            { name: 'Repeat Chest X-Ray', time: '11:00', dwell: '20 mins', status: 'completed', note: 'Infiltrate resolved' },
            { name: 'Physician Discharge Signoff', time: '13:30', dwell: '15 mins', status: 'completed', note: 'Signed & cleared for home' },
            { name: 'Ward A Bed #108', time: '14:00', dwell: '45 mins', status: 'completed', note: 'Bed hold until discharge packet ready' },
            { name: 'Pharmacy Dispensing', time: '14:25', dwell: '18 mins', status: 'active', note: '🟢 Dispensing oral Azithromycin to discharge patient and free Bed #108' }
        ],
        vitals: { hr: '70 bpm', bp: '118/74 mmHg', spo2: '99%', temp: '36.6 °C' },
        orders: ['Oral Azithromycin 500mg (Discharge)', 'Follow-up in 7 days']
    },
    {
        id: 'PAT-5110',
        name: 'Gregory Scott',
        age: 71,
        gender: 'Male',
        triage: 'Red',
        dept: 'Emergency',
        complaint: 'Severe Dyspnea / COPD Exacerbation',
        status: 'BiPAP Active / In Resuscitation',
        stageTime: '22m',
        doctor: 'Dr. Robert Davis (Emergency)',
        currentStage: 2,
        stages: [
            { name: 'Arrival & Reg', time: '14:20', dwell: '2 mins', status: 'completed', note: 'Arrived via EMS' },
            { name: 'Triage Red', time: '14:22', dwell: '3 mins', status: 'completed', note: 'Accessory muscle use' },
            { name: 'Emergency Bay 01', time: '14:25', dwell: '22 mins', status: 'active', note: 'BiPAP therapy underway' },
            { name: 'Stat Blood Gas', time: '14:35', dwell: '12 mins', status: 'bottleneck', note: 'Waiting on Lab Blood Gas' },
            { name: 'Doctor Re-evaluation', time: 'Pending', dwell: '--', status: 'waiting', note: '--' },
            { name: 'ICU / Ward Stepdown', time: 'Pending', dwell: '--', status: 'waiting', note: '--' },
            { name: 'Discharge', time: 'Pending', dwell: '--', status: 'waiting', note: '--' }
        ],
        vitals: { hr: '114 bpm', bp: '148/92 mmHg', spo2: '89% on RA -> 95% on BiPAP', temp: '37.4 °C' },
        orders: ['BiPAP Ventilation', 'Duoneb Inhalations', 'IV Methylprednisolone', 'ABG Stat']
    },
    {
        id: 'PAT-6204',
        name: 'Chloe Bennett',
        age: 8,
        gender: 'Female',
        triage: 'Green',
        dept: 'OPD',
        complaint: 'Fractured Distal Radius',
        status: 'Cast Applied / Ready for Checkout',
        stageTime: '12m',
        doctor: 'Dr. James Thorne (Orthopedics)',
        currentStage: 6,
        stages: [
            { name: 'Arrival', time: '13:40', dwell: '5 mins', status: 'completed', note: 'Walk-in' },
            { name: 'Triage', time: '13:45', dwell: '5 mins', status: 'completed', note: 'Green' },
            { name: 'Ortho Clinic', time: '13:50', dwell: '15 mins', status: 'completed', note: 'Exam complete' },
            { name: 'X-Ray Imaging', time: '14:05', dwell: '12 mins', status: 'completed', note: 'Non-displaced fracture' },
            { name: 'Doctor Review', time: '14:18', dwell: '10 mins', status: 'completed', note: 'Fiberglass cast applied' },
            { name: 'Observation', time: '14:28', dwell: '10 mins', status: 'completed', note: 'Normal neurovascular status' },
            { name: 'Discharge Desk', time: '14:38', dwell: '5 mins', status: 'active', note: 'Print discharge instruction' }
        ],
        vitals: { hr: '92 bpm', bp: '102/68 mmHg', spo2: '100%', temp: '36.5 °C' },
        orders: ['Forearm Cast', 'Ibuprofen Suspension', 'Ortho Clinic Follow-up in 4 weeks']
    }
];

const departmentsData = [
    {
        id: 'Emergency',
        name: 'Emergency Department (ER / ED)',
        status: 'Very Busy 🔴',
        statusClass: 'status-red',
        load: '92%',
        activePatients: 18,
        staff: '3 Physicians • 6 Nurses (Need +2)',
        avgWait: '28 mins',
        bottleneckRisk: 'High',
        description: 'Receiving severe trauma & cardiac cases. Resuscitation bays fully occupied.'
    },
    {
        id: 'Lab',
        name: 'Central Diagnostic Laboratory',
        status: 'Bottleneck Detected 🔴',
        statusClass: 'status-red',
        load: '98%',
        activePatients: '37 Pending Tests',
        staff: '2 Technicians • 1 Chemist',
        avgWait: '42 mins (SLA: 15m)',
        bottleneckRisk: 'Critical Bottleneck',
        description: 'Auto-Analyzer #2 undergoing unscheduled calibration. Stalling patient flow hospital-wide.'
    },
    {
        id: 'WardB',
        name: 'Inpatient Ward B (Post-Op Surgical)',
        status: 'Low Workload 🟢',
        statusClass: 'status-green',
        load: '38%',
        activePatients: '12 / 32 Beds',
        staff: '4 Nurses (2 Surplus)',
        avgWait: '4 mins',
        bottleneckRisk: 'None (Surplus)',
        description: 'Post-op discharges completed this morning. Staff available for temporary float reassignment.'
    },
    {
        id: 'ICU',
        name: 'Intensive Care Unit (ICU / CCU)',
        status: 'Near Capacity 🟡',
        statusClass: 'status-orange',
        load: '90%',
        activePatients: '18 / 20 Beds',
        staff: '2 Intensivists • 12 Nurses',
        avgWait: '15 mins',
        bottleneckRisk: 'Moderate',
        description: '2 available beds remaining. Step-down candidate Elena Rostova ready to transition.'
    },
    {
        id: 'OPD',
        name: 'Outpatient Clinics (OPD)',
        status: 'Stable 🟢',
        statusClass: 'status-green',
        load: '64%',
        activePatients: '86 Registered',
        staff: '8 Consultants • 6 Nurses',
        avgWait: '18 mins',
        bottleneckRisk: 'Low',
        description: 'Routine outpatient specialty clinics operating on schedule.'
    },
    {
        id: 'Pharmacy',
        name: 'Central Hospital Pharmacy',
        status: 'Normal 🟢',
        statusClass: 'status-green',
        load: '45%',
        activePatients: '24 Requests (18 Filled)',
        staff: '3 Pharmacists',
        avgWait: '8 mins',
        bottleneckRisk: 'Low',
        description: 'Automated dispensing unit clearing medication orders within standard 10m SLA.'
    }
];

// ==========================================================================
// 2. INITIALIZATION & CLOCK
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderPatientsTable();
    renderDepartmentsGrid();
    renderEmergencyQueue();
    renderPatientJourney('PAT-1082');
    initRippleCascadeAnimation();
});

function initClock() {
    const clockEl = document.getElementById('liveClock');
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${hours}:${minutes}:${seconds} EST`;
    }
    updateTime();
    setInterval(updateTime, 1000);
}

// ==========================================================================
// 3. TAB NAVIGATION
// ==========================================================================

function switchTab(tabId) {
    appState.currentTab = tabId;

    // Update Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update Tab Panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(`tab-${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    // Scroll to top of main
    document.querySelector('.main-content').scrollTop = 0;

    // Trigger specific animations if needed
    if (tabId === 'impact-ripple') {
        restartRippleAnimation();
    }
}

function navigateTo(tabId) {
    switchTab(tabId);
    toggleNotifPanel(false);
}

// ==========================================================================
// 4. PATIENT REGISTRY & SEARCH
// ==========================================================================

function renderPatientsTable() {
    const tbody = document.getElementById('patientTableBody');
    if (!tbody) return;

    let filtered = patientsDatabase;

    // Apply Department Filter
    if (appState.filterDept !== 'All') {
        filtered = filtered.filter(p => p.dept.toLowerCase().includes(appState.filterDept.toLowerCase()));
    }

    // Apply Triage Filter
    if (appState.filterTriage !== 'All') {
        filtered = filtered.filter(p => p.triage.toLowerCase() === appState.filterTriage.toLowerCase());
    }

    // Apply Search Query
    const searchVal = document.getElementById('patientSearchInput')?.value.trim().toLowerCase();
    if (searchVal) {
        filtered = filtered.filter(p => 
            p.id.toLowerCase().includes(searchVal) ||
            p.name.toLowerCase().includes(searchVal) ||
            p.complaint.toLowerCase().includes(searchVal) ||
            p.doctor.toLowerCase().includes(searchVal)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-dim);">
                    No matching patients found. Try searching for "PAT-1082" or "PAT-2041".
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        let triageClass = 'triage-green';
        if (p.triage === 'Red') triageClass = 'triage-red';
        if (p.triage === 'Yellow') triageClass = 'triage-yellow';

        return `
            <tr>
                <td class="patient-id-cell">${p.id}</td>
                <td>
                    <strong>${p.name}</strong>
                    <span style="display:block; font-size:10px; color:var(--text-dim);">${p.age}y • ${p.gender}</span>
                </td>
                <td><span class="triage-badge ${triageClass}">● ${p.triage}</span></td>
                <td><strong>${p.dept}</strong></td>
                <td>${p.complaint}</td>
                <td><span style="font-weight:600; color:${p.status.includes('Stalled') || p.status.includes('Delayed') ? 'var(--red-accent)' : 'var(--text-main)'}">${p.status}</span></td>
                <td><span style="font-family:var(--font-mono); font-size:11px;">${p.stageTime}</span></td>
                <td><span style="color:var(--text-muted); font-size:11px;">${p.doctor}</span></td>
                <td>
                    <button class="btn btn-sm btn-cyan" onclick="openPatientModal('${p.id}')">Inspect</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterPatients() {
    renderPatientsTable();
}

function clearPatientSearch() {
    const input = document.getElementById('patientSearchInput');
    if (input) input.value = '';
    renderPatientsTable();
}

function filterDept(dept, btn) {
    appState.filterDept = dept;
    document.querySelectorAll('.filter-group:first-child .filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    renderPatientsTable();
}

function filterTriage(triage, btn) {
    if (appState.filterTriage === triage) {
        appState.filterTriage = 'All';
        btn.classList.remove('active');
    } else {
        appState.filterTriage = triage;
        document.querySelectorAll('.filter-group:nth-child(2) .filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
    }
    renderPatientsTable();
}

// ==========================================================================
// 5. DEPARTMENTS DIRECTORY
// ==========================================================================

function renderDepartmentsGrid() {
    const grid = document.getElementById('deptFullGrid');
    if (!grid) return;

    grid.innerHTML = departmentsData.map(d => {
        let borderClass = 'danger-border';
        if (d.status.includes('🟢')) borderClass = 'success-border';
        if (d.status.includes('🟡')) borderClass = 'warning-border';

        return `
            <div class="dept-full-card ${borderClass}">
                <div class="dept-full-header">
                    <div>
                        <span class="eyebrow">${d.id.toUpperCase()}</span>
                        <h3>${d.name}</h3>
                    </div>
                    <span class="badge-status-red ${d.statusClass}">${d.status}</span>
                </div>

                <div class="dept-stat-list">
                    <div><span>Operational Load:</span><strong style="color:${d.status.includes('🔴') ? 'var(--red-accent)' : 'inherit'}">${d.load}</strong></div>
                    <div><span>Active Patient Volume:</span><strong>${d.activePatients}</strong></div>
                    <div><span>Staffing on Duty:</span><strong>${d.staff}</strong></div>
                    <div><span>Average Turnaround Time:</span><strong>${d.avgWait}</strong></div>
                    <div><span>Bottleneck Risk Index:</span><strong>${d.bottleneckRisk}</strong></div>
                </div>

                <p style="font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px;">
                    ${d.description}
                </p>

                <div class="dept-actions-bar">
                    <button class="btn btn-sm btn-secondary" onclick="showDeptDetails('${d.id}')">Inspect Unit Telemetry</button>
                </div>
            </div>
        `;
    }).join('');
}

function showDeptDetails(deptId) {
    showToast(`Telemetric diagnostics loaded for ${deptId}`, 'info');
}

// ==========================================================================
// 6. EMERGENCY QUEUE
// ==========================================================================

function renderEmergencyQueue() {
    const list = document.getElementById('erQueueList');
    if (!list) return;

    const erPatients = patientsDatabase.filter(p => p.dept === 'Emergency' || p.triage === 'Red');

    list.innerHTML = erPatients.map(p => `
        <div class="er-queue-item">
            <div class="er-patient-meta">
                <span class="triage-badge ${p.triage === 'Red' ? 'triage-red' : 'triage-yellow'}">● ${p.triage}</span>
                <div>
                    <strong style="font-size: 13px;">${p.name} (${p.id})</strong>
                    <span style="display:block; font-size:11px; color:var(--text-muted);">${p.complaint} • Age: ${p.age}</span>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="font-size: 12px; font-weight:700; color:${p.status.includes('Stalled') ? 'var(--red-accent)' : 'var(--cyan-primary)'};">${p.status}</span>
                <span style="display:block; font-size:10px; color:var(--text-dim); font-family:var(--font-mono);">${p.stageTime}</span>
            </div>
            <button class="btn btn-sm btn-cyan" onclick="openPatientModal('${p.id}')">Details</button>
        </div>
    `).join('');
}

function simulateAmbulanceInflow() {
    appState.emergencyPatients += 3;
    document.getElementById('kpiEmergency').textContent = appState.emergencyPatients;
    document.getElementById('hudRedCount').textContent = '9 Patients';
    document.getElementById('miniErPat').textContent = `${appState.emergencyPatients} Active`;
    
    showToast('🚑 Trauma Surge: 3 critical patients admitted to Emergency Resuscitation!', 'alert');
    addAuditLog('Emergency Inflow Surge', '3 inbound trauma cases arrived via EMS. ER nurse load at 98%.', 'red');
}

// ==========================================================================
// 7. SMART RESOURCE REALLOCATION WORKFLOW
// ==========================================================================

function openReallocationModal() {
    document.getElementById('reallocationModal').classList.add('show');
}

function closeReallocationModal() {
    document.getElementById('reallocationModal').classList.remove('show');
}

function executeNurseReallocation() {
    appState.reallocationApproved = true;
    closeReallocationModal();

    // Update UI elements
    const statusPill = document.getElementById('recStatusPill');
    if (statusPill) {
        statusPill.textContent = '✅ Approved by Dr. Sarah Jenkins (In Progress)';
        statusPill.className = 'rec-status-pill approved';
    }

    const decisionBar = document.getElementById('recDecisionBar');
    if (decisionBar) {
        decisionBar.innerHTML = `
            <div class="decision-explainer" style="color: var(--green-accent);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Action Dispatched:</strong> Nurse E. Collins & Nurse T. Reynolds shifted to Emergency. ER load easing to 68%.</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick="rollbackReallocation()">Rollback Shift</button>
        `;
    }

    // Update Mini cards and Resources
    document.getElementById('erBarMini').style.width = '68%';
    document.getElementById('erStatMini').textContent = '68% Stress (Relieved 🟢)';
    document.getElementById('erStatMini').className = 'load-stat text-green';

    document.getElementById('wardBarMini').style.width = '52%';
    document.getElementById('wardStatMini').textContent = '52% Load (Stable 🟢)';

    document.getElementById('badgeErMini').textContent = '🟡 MODERATE LOAD';
    document.getElementById('badgeErMini').className = 'badge-status-orange';
    document.getElementById('barErMini').style.width = '68%';
    document.getElementById('barErMini').className = 'bar-fill orange';
    document.getElementById('miniErStaff').textContent = '8 Nurses / 3 Docs';

    document.getElementById('resErNurses').textContent = '8 Nurses (Relieved 🟡)';
    document.getElementById('resErNurses').className = 'text-green';
    document.getElementById('resWardBNurses').textContent = '2 Nurses (Float dispatched)';

    document.getElementById('hudStaffCount').textContent = '3 Docs / 8 Nurses';
    document.getElementById('hudStaffRec').textContent = '✅ +2 Nurses Float Active from Ward B';
    document.getElementById('hudStaffRec').className = 'hud-sub text-green';

    showToast('💡 Staff Reallocation Approved: 2 Nurses dispatched from Ward B to Emergency.', 'success');
    addAuditLog('Resource Reallocation Executed', 'Dr. Sarah Jenkins approved float of 2 nurses from Ward B to Emergency. ER stress reduced to 68%.', 'green');
}

function rollbackReallocation() {
    appState.reallocationApproved = false;
    showToast('Staff allocation returned to baseline', 'info');
    location.reload();
}

function dismissRecommendation() {
    showToast('Recommendation dismissed. System will keep monitoring load.', 'info');
}

function modifyRecommendation() {
    showToast('Opening custom shift configuration panel...', 'info');
}

function resolveLabBottleneck() {
    appState.pendingLabTests = 12;
    document.getElementById('kpiLab').textContent = '12';
    document.getElementById('bnPendingCount').textContent = '12 Tests';
    document.getElementById('bnWaitTime').textContent = '14 Minutes';
    document.getElementById('bnWaitTime').className = 'text-green';
    document.getElementById('miniLabTests').textContent = '12 Tests';
    document.getElementById('miniLabWait').textContent = '14m';
    document.getElementById('frictionLabText').textContent = '14 mins (Normal 🟢)';
    document.getElementById('frictionLabText').className = 'text-green';
    document.getElementById('frictionLabBar').style.width = '30%';
    document.getElementById('frictionLabBar').className = 'friction-fill green';

    showToast('🔬 Satellite Lab Reroute Active: 16 routine tests offloaded. Lab wait time down to 14 mins!', 'success');
    addAuditLog('Lab Bottleneck Mitigated', '16 routine chemistries rerouted to Satellite Lab. Critical Troponin turnaround restored.', 'green');
}

function prioritizeErLab() {
    showToast('⚡ Stat priority flag assigned to all ER cardiac & blood gas samples.', 'info');
}

function expediteDischarges() {
    appState.availableBeds += 2;
    document.getElementById('kpiBeds').textContent = appState.availableBeds;
    document.getElementById('resFreeBedsBadge').textContent = `${appState.availableBeds} Available`;
    showToast('🛏️ 2 Inpatient Beds freed up via expedited discharge pharmacy sign-off!', 'success');
}

function simulateLabRelief() {
    resolveLabBottleneck();
}

// ==========================================================================
// 8. PATIENT JOURNEY VISUALIZER
// ==========================================================================

function renderPatientJourney(patientId) {
    const patient = patientsDatabase.find(p => p.id === patientId) || patientsDatabase[0];
    appState.selectedPatientId = patient.id;

    const summaryEl = document.getElementById('journeySummaryHeader');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div>
                <span class="eyebrow">ACTIVE PATIENT PROFILE</span>
                <h3 style="font-size: 20px; font-weight:800;">${patient.name} (${patient.id})</h3>
                <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                    ${patient.age}y • ${patient.gender} • Chief Complaint: <strong>${patient.complaint}</strong>
                </p>
            </div>
            <div style="display:flex; gap:14px; align-items:center;">
                <div style="text-align:right;">
                    <span class="triage-badge ${patient.triage === 'Red' ? 'triage-red' : patient.triage === 'Yellow' ? 'triage-yellow' : 'triage-green'}">
                        ● Triage ${patient.triage}
                    </span>
                    <span style="display:block; font-size:10px; color:var(--text-dim); margin-top:4px;">Attending: ${patient.doctor}</span>
                </div>
            </div>
        `;
    }

    const trackEl = document.getElementById('journeyPipelineTrack');
    if (trackEl) {
        trackEl.innerHTML = patient.stages.map((stage, idx) => {
            let stageClass = '';
            if (stage.status === 'completed') stageClass = 'completed';
            if (stage.status === 'active') stageClass = 'active-stage';
            if (stage.status === 'bottleneck') stageClass = 'bottleneck-stage';

            return `
                <div class="pipeline-stage ${stageClass}" onclick="inspectStageDetail(${idx})">
                    <span class="stage-num">0${idx+1}</span>
                    <strong class="stage-title">${stage.name}</strong>
                    <span class="stage-dwell">${stage.dwell}</span>
                </div>
            `;
        }).join('');
    }

    inspectStageDetail(patient.currentStage || 0);
}

function inspectStageDetail(stageIdx) {
    const patient = patientsDatabase.find(p => p.id === appState.selectedPatientId) || patientsDatabase[0];
    const stage = patient.stages[stageIdx] || patient.stages[0];

    const boxEl = document.getElementById('stageDetailsBox');
    if (!boxEl) return;

    boxEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
                <span class="eyebrow">STAGE 0${stageIdx+1} TELEMETRY</span>
                <h4 style="font-size: 16px; font-weight:800;">${stage.name}</h4>
            </div>
            <span style="font-size:11px; font-family:var(--font-mono); color:var(--cyan-primary);">Timestamp: ${stage.time}</span>
        </div>
        <p style="font-size: 13px; color: var(--text-main); margin-bottom: 14px; line-height: 1.5;">
            ${stage.note}
        </p>
        <div style="display: flex; gap: 20px; font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;">
            <span>Stage Dwell Time: <strong style="color:#fff;">${stage.dwell}</strong></span>
            <span>Vitals HR/BP: <strong style="color:#fff;">${patient.vitals.hr} / ${patient.vitals.bp}</strong></span>
            <span>SpO2: <strong style="color:#fff;">${patient.vitals.spo2}</strong></span>
        </div>
    `;
}

// ==========================================================================
// 9. PATIENT INSPECT MODAL
// ==========================================================================

function openPatientModal(patientId) {
    const patient = patientsDatabase.find(p => p.id === patientId);
    if (!patient) return;

    appState.selectedPatientId = patient.id;
    document.getElementById('modalPatientName').textContent = patient.name;
    document.getElementById('modalPatientId').textContent = `${patient.id} • ${patient.age}y ${patient.gender}`;

    const body = document.getElementById('patientModalBody');
    body.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
                <span class="eyebrow">CLINICAL STATUS</span>
                <p style="font-size: 14px; font-weight: 700; margin: 4px 0;">${patient.complaint}</p>
                <span style="font-size: 11px; color: var(--text-muted);">Current Location: <strong>${patient.dept}</strong></span>
            </div>
            <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
                <span class="eyebrow">LIVE VITALS</span>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: 11px; margin-top: 4px;">
                    <div>HR: <strong>${patient.vitals.hr}</strong></div>
                    <div>BP: <strong>${patient.vitals.bp}</strong></div>
                    <div>SpO2: <strong>${patient.vitals.spo2}</strong></div>
                    <div>Temp: <strong>${patient.vitals.temp}</strong></div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 18px;">
            <span class="eyebrow">ACTIVE CLINICAL ORDERS & LABS</span>
            <ul style="list-style: disc inside; font-size: 12px; color: var(--text-muted); margin-top: 6px; line-height: 1.6;">
                ${patient.orders.map(o => `<li>${o}</li>`).join('')}
            </ul>
        </div>

        <div style="padding: 12px; background: rgba(255, 92, 104, 0.08); border: 1px solid var(--red-border); border-radius: 8px; font-size: 12px;">
            <strong style="color: var(--red-accent);">Operational Insight:</strong>
            <p style="color: var(--text-main); margin-top: 2px;">${patient.status} - Stage dwell time: ${patient.stageTime}</p>
        </div>
    `;

    document.getElementById('patientModal').classList.add('show');
}

function closePatientModal() {
    document.getElementById('patientModal').classList.remove('show');
}

function viewPatientInJourney() {
    closePatientModal();
    const select = document.getElementById('journeyPatientSelect');
    if (select) select.value = appState.selectedPatientId;
    switchTab('patient-journey');
    renderPatientJourney(appState.selectedPatientId);
}

// ==========================================================================
// 10. IMPACT RIPPLE ENGINE & DISRUPTION SCENARIOS
// ==========================================================================

const rippleScenarios = {
    icu: {
        title: "Impact Alert: ICU capacity reduced. Emergency admissions may be affected.",
        desc: "When an ICU bed becomes unavailable, the emergency department cannot transfer critical patients, leading to upstream backlog and increased total patient waiting times.",
        nodes: [
            { num: "01", icon: "❌", title: "ICU Bed Unavailable", sub: "Capacity reduced to 0 free beds", tag: "ROOT CAUSE", tagClass: "red-tag", danger: true },
            { num: "02", icon: "🚑", title: "Emergency Admission Affected", sub: "Critical ER patients held in resuscitation bays", tag: "DIRECT IMPACT", tagClass: "orange-tag" },
            { num: "03", icon: "🛏️", title: "Bed Allocation Affected", sub: "Ward beds repurposed; step-down holds triggered", tag: "SECONDARY", tagClass: "orange-tag" },
            { num: "04", icon: "👨‍⚕️", title: "Doctor / Staff Planning Affected", sub: "Intensivists & ER nurses diverted to manage boarded ICU patients", tag: "TERTIARY", tagClass: "orange-tag" },
            { num: "05", icon: "⏱️", title: "Patient Waiting Time Increases", sub: "Hospital-wide wait time rises +35 to +50 minutes", tag: "GLOBAL RESULT", tagClass: "red-tag", danger: true }
        ],
        mitigations: [
            { num: 1, title: "Expedite ICU Stepdown #4", desc: "Move stable recovering ICU patient (Elena Rostova) to Ward C Step-down Bed #302 to free 1 ICU bed in ~25 mins." },
            { num: 2, title: "Hold Elective Post-Op ICU Hold", desc: "Reschedule 1 non-emergency cardiac post-op transfer by 2 hours." },
            { num: 3, title: "Notify Emergency Triage", desc: "Route incoming non-critical ambulances to Regional Partner Hospital." }
        ]
    },
    lab: {
        title: "Impact Alert: Laboratory Analyzer Failure. Diagnostics & OPD Stalled.",
        desc: "Primary automated chemistry analyzer offline. Diagnostic delay halts doctor decisions across 14 emergency & surgical beds.",
        nodes: [
            { num: "01", icon: "🔬", title: "Lab Analyzer #2 Breakdown", sub: "Capacity down 50%; 37 tests pending", tag: "ROOT CAUSE", tagClass: "red-tag", danger: true },
            { num: "02", icon: "📋", title: "Diagnostic Reports Delayed", sub: "Average test turnaround rises from 15m to 42m", tag: "DIRECT IMPACT", tagClass: "orange-tag" },
            { num: "03", icon: "🩺", title: "Doctor Clinical Reviews Stalled", sub: "8 physicians waiting on lab results to clear discharge", tag: "SECONDARY", tagClass: "orange-tag" },
            { num: "04", icon: "🛏️", title: "Bed Turnover Freezes", sub: "Recovered patients cannot be discharged; new admissions backed up", tag: "TERTIARY", tagClass: "orange-tag" },
            { num: "05", icon: "⏱️", title: "Emergency Bottleneck Gridlock", sub: "ER waiting room queue depth swells +45 mins", tag: "GLOBAL RESULT", tagClass: "red-tag", danger: true }
        ],
        mitigations: [
            { num: 1, title: "Reroute Chemistries to Satellite Lab", desc: "Offload 16 routine panels immediately to clear automated line." },
            { num: 2, title: "Stat ER Troponin Override", desc: "Force priority execution on single active analyzer." }
        ]
    },
    surge: {
        title: "Impact Alert: Mass Casualty Highway Surge. Emergency Overload.",
        desc: "Multi-vehicle collision brings 9 simultaneous trauma patients. Total emergency resuscitation demand exceeds capacity.",
        nodes: [
            { num: "01", icon: "💥", title: "Mass Casualty Influx", sub: "9 trauma patients arriving simultaneously", tag: "ROOT CAUSE", tagClass: "red-tag", danger: true },
            { num: "02", icon: "🚨", title: "Resuscitation Bay Overflow", sub: "All 6 ER red bays occupied; triage hall used", tag: "DIRECT IMPACT", tagClass: "orange-tag" },
            { num: "03", icon: "👨‍⚕️", title: "Surgeon & Anesthesia Call-In", sub: "Elective OR suites paused for emergency trauma", tag: "SECONDARY", tagClass: "orange-tag" },
            { num: "04", icon: "🩸", title: "Blood Bank & CT Bottleneck", sub: "Cross-matching and trauma CT scan queues back up", tag: "TERTIARY", tagClass: "orange-tag" },
            { num: "05", icon: "⏱️", title: "Non-Critical Wait Time Spikes", sub: "Yellow/Green triage cases wait +65 minutes", tag: "GLOBAL RESULT", tagClass: "red-tag", danger: true }
        ],
        mitigations: [
            { num: 1, title: "Activate Hospital Incident Command", desc: "Mobilize 4 on-call emergency physicians and 6 ICU float nurses." },
            { num: 2, title: "Convert Recovery Room to Step-Down", desc: "Open 8 surge flex beds in PACU." }
        ]
    }
};

function triggerImpactScenario(scenKey) {
    appState.activeScenario = scenKey;

    document.querySelectorAll('.scen-btn').forEach(b => b.classList.remove('active'));
    if (scenKey === 'icu') document.getElementById('btnScenIcu')?.classList.add('active');
    if (scenKey === 'lab') document.getElementById('btnScenLab')?.classList.add('active');
    if (scenKey === 'surge') document.getElementById('btnScenSurge')?.classList.add('active');

    const scen = rippleScenarios[scenKey];
    if (!scen) return;

    document.getElementById('rippleAlertTitle').textContent = scen.title;
    document.getElementById('rippleAlertDesc').textContent = scen.desc;

    // Render Nodes
    const flowContainer = document.getElementById('rippleCascadeFlow');
    if (flowContainer) {
        let html = '';
        scen.nodes.forEach((node, idx) => {
            html += `
                <div class="cascade-node ${node.danger ? 'node-danger' : 'node-warning'}" id="ripNode_${idx}">
                    <div class="node-num">${node.num}</div>
                    <div class="node-icon">${node.icon}</div>
                    <div class="node-text">
                        <strong>${node.title}</strong>
                        <small>${node.sub}</small>
                    </div>
                    <span class="node-tag ${node.tagClass}">${node.tag}</span>
                </div>
            `;
            if (idx < scen.nodes.length - 1) {
                html += `
                    <div class="cascade-connector-v" id="ripLine_${idx}">
                        <div class="connector-arrow">↓</div>
                    </div>
                `;
            }
        });
        flowContainer.innerHTML = html;
    }

    // Render Mitigations
    const mitBody = document.getElementById('mitigationBody');
    if (mitBody) {
        mitBody.innerHTML = scen.mitigations.map(m => `
            <div class="mitigation-step">
                <span class="m-step-num">${m.num}</span>
                <p><strong>${m.title}:</strong> ${m.desc}</p>
            </div>
        `).join('');
    }

    restartRippleAnimation();
}

function initRippleCascadeAnimation() {
    restartRippleAnimation();
}

function restartRippleAnimation() {
    const nodes = document.querySelectorAll('.cascade-node');
    const lines = document.querySelectorAll('.cascade-connector-v');

    nodes.forEach(n => n.classList.remove('active-cascade'));
    lines.forEach(l => l.classList.remove('active-line'));

    nodes.forEach((node, idx) => {
        setTimeout(() => {
            node.classList.add('active-cascade');
            if (lines[idx]) {
                lines[idx].classList.add('active-line');
            }
        }, idx * 450);
    });
}

function applyRippleMitigation() {
    showToast('🚀 AI Mitigation Plan Executed: Step-down transfer initiated & Partner routing active.', 'success');
    addAuditLog('Impact Mitigation Executed', 'Administrator Dr. Sarah Jenkins activated predictive ripple countermeasures.', 'green');
}

// ==========================================================================
// 11. NOTIFICATIONS & AUDIT FEED HELPER
// ==========================================================================

function toggleNotifPanel(forceState) {
    const dropdown = document.getElementById('notifDropdown');
    if (!dropdown) return;
    if (typeof forceState === 'boolean') {
        if (forceState) dropdown.classList.add('show');
        else dropdown.classList.remove('show');
    } else {
        dropdown.classList.toggle('show');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'alert') icon = '⚠️';

    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

function addAuditLog(title, desc, dotColor = 'cyan') {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `
        <span class="feed-time">${timeStr}</span>
        <span class="feed-dot ${dotColor}"></span>
        <div class="feed-content">
            <strong>${title}:</strong>
            <span>${desc}</span>
        </div>
    `;

    feed.insertBefore(item, feed.firstChild);
}

console.log('HospitalSync Administrator Operations Hub loaded successfully.');