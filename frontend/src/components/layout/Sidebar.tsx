import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Send, Settings } from 'lucide-react';
import useDashboardStats from '../../hooks/useDashboardStats';

interface SidebarProps {
  user: { name: string, email: string, picture?: string } | null;
  onLogout: () => void;
  onCompose: () => void;
  activeTab?: 'scheduled' | 'sent';
  onTabChange?: (tab: 'scheduled' | 'sent') => void;
}

export default function Sidebar({ user, onLogout, onCompose, activeTab, onTabChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stats } = useDashboardStats();

  const isSettings = location.pathname === '/settings';

  return (
    <aside className="w-[280px] flex-shrink-0 glass-panel flex flex-col h-full border-r border-white/5 border-l-0 border-y-0 relative z-20">
      {/* Logo */}
      <div className="px-8 pt-8 pb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center">
          <Send className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-white">ReachInbox</h1>
      </div>

      {/* User Profile */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group relative">
          {user?.picture ? (
            <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full ring-2 ring-emerald-500/30" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
              {(user?.name || 'U')[0]}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 font-medium truncate">{user?.email || 'user@domain.io'}</p>
          </div>
          
          <button 
            onClick={onLogout}
            className="absolute right-3 opacity-0 group-hover:opacity-100 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Compose Button */}
      <div className="px-6 mb-8">
        <button 
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 glass-button rounded-xl font-bold"
        >
          <Send className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Core Menu */}
      <div className="px-6 flex-1 flex flex-col">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Navigation</p>
        <nav className="space-y-2 flex-1">
          <button
            onClick={() => {
              if (isSettings) navigate('/dashboard');
              onTabChange?.('scheduled');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              !isSettings && activeTab === 'scheduled' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">Scheduled</span>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${!isSettings && activeTab === 'scheduled' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>
              {stats?.scheduled || 0}
            </span>
          </button>
          <button
            onClick={() => {
              if (isSettings) navigate('/dashboard');
              onTabChange?.('sent');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              !isSettings && activeTab === 'sent' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4" />
              <span className="text-sm font-bold">Sent</span>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${!isSettings && activeTab === 'sent' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>
              {stats?.sent || 0}
            </span>
          </button>
        </nav>
      </div>

      <div className="px-6 pb-6 mt-auto">
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isSettings ? 'bg-white/10 border border-white/20 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-bold">Settings</span>
        </button>
      </div>
    </aside>
  );
}
