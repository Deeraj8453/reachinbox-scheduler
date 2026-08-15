import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Send, Settings, ChevronDown, PenSquare } from 'lucide-react';
import useDashboardStats from '../../hooks/useDashboardStats';

interface SidebarProps {
  onCompose: () => void;
  activeTab?: 'scheduled' | 'sent';
  onTabChange?: (tab: 'scheduled' | 'sent') => void;
}

export default function Sidebar({ onCompose, activeTab, onTabChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stats } = useDashboardStats();

  const isSettings = location.pathname === '/settings';

  return (
    <aside className="w-[280px] flex-shrink-0 glass-panel flex flex-col h-full border-r border-white/5 border-l-0 border-y-0 relative z-20">
      {/* Logo */}
      <div className="px-8 pt-8 pb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center">
          <Send className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-white">ReachInbox.ai</h1>
      </div>

      {/* Workspace Dropdown Mock */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-xs text-white">
              OL
            </div>
            <div>
              <p className="text-sm font-bold text-white">Outbox Labs</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Team Workspace</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Core Menu */}
      <div className="px-6 flex-1 flex flex-col">
        <nav className="space-y-1 flex-1">
          <button
            onClick={onCompose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-white/5 hover:text-white border border-transparent mb-2"
          >
            <PenSquare className="w-4 h-4" />
            <span className="text-sm font-bold">Compose</span>
          </button>

          <button
            onClick={() => {
              if (isSettings) navigate('/dashboard');
              onTabChange?.('scheduled');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border-l-4 ${!isSettings && activeTab === 'scheduled' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">Scheduled</span>
            </div>
            <span className={`text-xs font-black px-2 py-0.5 rounded ${!isSettings && activeTab === 'scheduled' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
              {stats?.scheduled || 0}
            </span>
          </button>

          <button
            onClick={() => {
              if (isSettings) navigate('/dashboard');
              onTabChange?.('sent');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border-l-4 ${!isSettings && activeTab === 'sent' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4" />
              <span className="text-sm font-bold">Sent</span>
            </div>
            <span className={`text-xs font-black px-2 py-0.5 rounded ${!isSettings && activeTab === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
              {stats?.sent || 0}
            </span>
          </button>
        </nav>
      </div>

      {/* Plan Usage */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-white">Plan</p>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Pro</span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium mb-1">Emails sent this month</p>
        <p className="text-xs font-bold text-white mb-3">1,250 / 15,000</p>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12.5%' }}></div>
        </div>
        <p className="text-[10px] text-slate-500 font-black tracking-widest mt-2 text-right">12.5%</p>
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border-l-4 ${isSettings ? 'bg-white/10 border-white/20 text-white' : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'
            }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-bold">Settings</span>
        </button>
      </div>
    </aside>
  );
}
