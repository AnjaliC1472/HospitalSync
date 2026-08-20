import React from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { PatientsSection } from './components/Patients/PatientsSection';
import { DepartmentsSection } from './components/Departments/DepartmentsSection';
import { EmergencySection } from './components/Emergency/EmergencySection';
import { BottleneckSection } from './components/Bottlenecks/BottleneckSection';
import { ResourcesSection } from './components/Resources/ResourcesSection';
import { RecommendationsSection } from './components/Recommendations/RecommendationsSection';
import { PatientJourneySection } from './components/PatientJourney/PatientJourneySection';
import { ResourceReallocationModal } from './components/Resources/ResourceReallocationModal';
import { NewPatientModal } from './components/Patients/NewPatientModal';
import { PatientMobileDrawer } from './components/MobileSimulator/PatientMobileDrawer';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

const MainLayout = () => {
  const { activeTab, toastMessage } = useHospital();

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'patients':
        return <PatientsSection />;
      case 'departments':
        return <DepartmentsSection />;
      case 'emergency':
        return <EmergencySection />;
      case 'bottlenecks':
        return <BottleneckSection />;
      case 'resources':
        return <ResourcesSection />;
      case 'recommendations':
        return <RecommendationsSection />;
      case 'journey':
        return <PatientJourneySection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Top Operations Header */}
      <Navbar />

      {/* Main App Body with Sidebar + Dynamic Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row pb-12">
        <Sidebar />
        <main className="flex-1 p-4 lg:py-6 overflow-x-hidden min-w-0">
          {renderActiveSection()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <ResourceReallocationModal />
      <NewPatientModal />
      <PatientMobileDrawer />

      {/* Global Live Toast Alerts */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : toastMessage.type === 'danger'
              ? 'bg-rose-950/90 border-rose-500 text-rose-200'
              : toastMessage.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500 text-amber-200'
              : 'bg-cyan-950/90 border-cyan-500 text-cyan-200'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'danger' && <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
            <span className="text-xs font-semibold">{toastMessage.msg}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export function App() {
  return (
    <HospitalProvider>
      <MainLayout />
    </HospitalProvider>
  );
}

export default App;
