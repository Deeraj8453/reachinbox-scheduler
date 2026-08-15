import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Send, Search, Filter, RefreshCw } from 'lucide-react';
import api from '../services/api';
import ComposeEmailModal from '../components/emails/ComposeEmailModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, email: string, picture?: string} | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [scheduledPage, setScheduledPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setScheduledPage(1);
      setSentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const { data: scheduledData, isLoading: isLoadingScheduled, refetch: refetchScheduled } = useQuery({
    queryKey: ['scheduled-emails', scheduledPage, debouncedSearch],
    queryFn: async () => {
      const res = await api.get(`/emails/scheduled?page=${scheduledPage}&limit=10&search=${encodeURIComponent(debouncedSearch)}`);
      return res.data.data;
    },
    refetchInterval: 5000,
  });

  const { data: sentData, isLoading: isLoadingSent, refetch: refetchSent } = useQuery({
    queryKey: ['sent-emails', sentPage, debouncedSearch],
    queryFn: async () => {
      const res = await api.get(`/emails/sent?page=${sentPage}&limit=10&search=${encodeURIComponent(debouncedSearch)}`);
      return res.data.data;
    },
    refetchInterval: 5000,
  });

  const handleScheduledSuccess = () => {
    setIsComposeOpen(false);
    refetchScheduled();
    setActiveTab('scheduled');
  };

  // Format date exactly like the figma (e.g., "Tue 9:15:12 AM")
  const formatFigmaDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    return `${day} ${time}`;
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-figma-text">
      
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 border-r border-slate-200/60 bg-[#FAFAFA] flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        {/* Logo */}
        <div className="px-6 pt-6 pb-8">
          <h1 className="text-[28px] font-black tracking-tighter text-slate-900">ONB</h1>
        </div>

        {/* User Profile */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-sm hover:shadow-md transition-all relative group cursor-pointer">
            {user?.picture ? (
              <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full bg-slate-100 ring-2 ring-white" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-500 font-medium truncate">{user?.email || 'user@domain.io'}</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 bg-white border border-slate-200 text-red-600 hover:bg-red-50 text-xs font-semibold py-1.5 px-4 rounded-full shadow-lg transition-all whitespace-nowrap z-50"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Compose Button */}
        <div className="px-4 mb-8">
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0BA053] hover:bg-[#098C49] text-white rounded-xl font-semibold transition-all shadow-md shadow-[#0BA053]/20 active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Compose
          </button>
        </div>

        {/* Core Menu */}
        <div className="px-4 flex-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Core</p>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'scheduled' ? 'bg-white shadow-sm border border-slate-200 text-[#0BA053]' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className={`w-4 h-4 ${activeTab === 'scheduled' ? 'text-[#0BA053]' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold">Scheduled</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'scheduled' ? 'bg-[#E6F6ED] text-[#0BA053]' : 'bg-slate-100 text-slate-500'}`}>
                {scheduledData?.total || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'sent' ? 'bg-white shadow-sm border border-slate-200 text-[#0BA053]' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Send className={`w-4 h-4 ${activeTab === 'sent' ? 'text-[#0BA053]' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold">Sent</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'sent' ? 'bg-[#E6F6ED] text-[#0BA053]' : 'bg-slate-100 text-slate-500'}`}>
                {sentData?.total || 0}
              </span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        {/* Top Header (Search & Actions) */}
        <header className="h-[72px] flex items-center justify-between px-8 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="relative w-full max-w-[600px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0BA053]/20 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all group" onClick={() => { refetchScheduled(); refetchSent(); }}>
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </header>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#FAFAFA]/30">
          <div className="max-w-[1000px] mx-auto space-y-3 pb-10">
            <AnimatePresence mode="popLayout">
              {activeTab === 'scheduled' && (
                isLoadingScheduled ? (
                  <p className="text-center py-10 text-slate-400">Loading...</p>
                ) : scheduledData?.emails.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
                    <p className="text-slate-400 font-medium">No scheduled emails.</p>
                  </div>
                ) : (
                  scheduledData?.emails.map((job: any) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between p-4 bg-white border border-slate-200/60 hover:border-[#0BA053]/30 shadow-sm hover:shadow-md transition-all rounded-2xl cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                          {job.recipient.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{job.recipient.split('@')[0]}</span>
                      </div>
                      <div className="flex items-center gap-5 flex-1 overflow-hidden">
                        <span className={`flex-shrink-0 inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          job.status === 'PROCESSING' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          <Clock className="w-3 h-3 mr-1.5" />
                          {formatFigmaDate(job.scheduledAt)}
                        </span>
                        <div className="truncate text-sm flex-1">
                          <span className="font-bold text-slate-800">{job.subject}</span>
                          <span className="text-slate-400 ml-2 font-medium">- Automated campaign sequence...</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              )}

              {activeTab === 'sent' && (
                isLoadingSent ? (
                  <p className="text-center py-10 text-slate-400">Loading...</p>
                ) : sentData?.emails.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
                    <p className="text-slate-400 font-medium">No sent emails.</p>
                  </div>
                ) : (
                  sentData?.emails.map((job: any) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between p-4 bg-white border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-md transition-all rounded-2xl cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase">
                          {job.recipient.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{job.recipient.split('@')[0]}</span>
                      </div>
                      <div className="flex items-center gap-5 flex-1 overflow-hidden">
                        <span className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                          Sent
                        </span>
                        <div className="truncate text-sm flex-1">
                          <span className="font-bold text-slate-800">{job.subject}</span>
                          <span className="text-slate-400 ml-2 font-medium">- Successfully delivered.</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              )}
            </AnimatePresence>
            
            {/* Pagination Controls */}
            {activeTab === 'scheduled' && scheduledData && scheduledData.total > 10 && (
              <div className="flex items-center justify-center gap-4 py-4 mt-4 border-t border-slate-100 text-sm">
                <button disabled={scheduledPage === 1} onClick={() => setScheduledPage(p => p - 1)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-lg disabled:opacity-50 transition-colors">Previous</button>
                <span className="text-slate-500 font-medium">Page {scheduledPage} of {Math.ceil(scheduledData.total / 10)}</span>
                <button disabled={scheduledPage * 10 >= scheduledData.total} onClick={() => setScheduledPage(p => p + 1)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-lg disabled:opacity-50 transition-colors">Next</button>
              </div>
            )}
            {activeTab === 'sent' && sentData && sentData.total > 10 && (
              <div className="flex items-center justify-center gap-4 py-4 mt-4 border-t border-slate-100 text-sm">
                <button disabled={sentPage === 1} onClick={() => setSentPage(p => p - 1)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-lg disabled:opacity-50 transition-colors">Previous</button>
                <span className="text-slate-500 font-medium">Page {sentPage} of {Math.ceil(sentData.total / 10)}</span>
                <button disabled={sentPage * 10 >= sentData.total} onClick={() => setSentPage(p => p + 1)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-lg disabled:opacity-50 transition-colors">Next</button>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Full Page Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <ComposeEmailModal 
            onClose={() => setIsComposeOpen(false)} 
            onSuccess={handleScheduledSuccess}
            userEmail={user?.email || 'oliver.brown@domain.io'}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
