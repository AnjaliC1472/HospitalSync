import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  AlertCircle, 
  GitPullRequest, 
  Stethoscope, 
  Sparkles, 
  Route,
  Zap,
  Activity,
  Bed,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, data } = useHospital();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subtext: 'Hospital Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'patients',
      label: 'Patients & Rx',
      subtext: 'Search & Prescriptions',
      icon: Users,
      badge: data.patients.length,
      badgeColor: 'badge-cyan'
    },
    {
      id: 'departments',
      label: 'Departments',
      subtext: 'OPD, ICU, Lab & Wards',
      icon: Building2,
      badge: data.departments.length,
      badgeColor: 'badge-purple'
    },
    {
      id: 'emergency',
      label: 'Emergency',
      subtext: 'Trauma & Red Cascades',
      icon: AlertCircle,
      badge: `${data.kpis.emergencyPatients} Critical`,
      badgeColor: 'badge-red'
    },
    {
      id: 'bottlenecks',
      label: 'Bottlenecks',
      subtext: 'Queue Detection',
      icon: GitPullRequest,
      badge: '1 Active 🔴',
      badgeColor: 'badge-red'
    },
    {
      id: 'resources',
      label: 'Resources',
      subtext: 'Staff, Beds & Devices',
      icon: Stethoscope,
      badge: `${data.kpis.availableBeds} Beds Free`,
      badgeColor: 'badge-emerald'
    },
    {
      id: 'recommendations',
      label: 'AI Insights',
      subtext: 'Smart Reallocation',
      icon: Sparkles,
      badge: '2 New 💡',
      badgeColor: 'badge-amber'
    },
    {
      id: 'journey',
      label: 'Patient Journey',
      subtext: 'Live Tracking & Alarms',
      icon: Route,
      badge: null
    }
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6 p-4 lg:py-6">
      
      {/* Navigation Card */}
      <div className="glass-panel p-3.5 flex flex-col gap-1.5 border-slate-800/90 shadow-2xl">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
          <span>Operations Matrix</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            Live
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 via-cyan-900/40 to-slate-900/80 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-900 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm leading-tight group-hover:translate-x-0.5 transition-transform">{item.label}</div>
                    <div className="text-[11px] text-slate-500 font-normal truncate">{item.subtext}</div>
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

      {/* Hospital Administrator Identity Card */}
      <div className="glass-panel p-4 border-slate-800/80 flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              RS
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Dr. Rajesh Sharma
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xs text-cyan-400/90 font-medium">Medical Superintendent</div>
            <div className="text-[11px] text-slate-500">Hospital Operations Admin</div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Authority Level:</span>
          <span className="font-semibold text-emerald-400">Chief Executive</span>
        </div>
      </div>

      {/* Quick Simulation Scenario Card */}
      <div className="glass-panel p-4 border-slate-800/80 flex flex-col gap-2.5">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Live Event Simulator
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Simulate real-time emergency events to test ripple cascades across all departments.
        </p>
        <button 
          onClick={() => setActiveTab('emergency')}
          className="btn-secondary text-xs py-2 justify-center w-full mt-1 border-amber-500/30 hover:border-amber-400 text-amber-300"
        >
          Open Impact Cascade
        </button>
      </div>

    </aside>
  );
};
