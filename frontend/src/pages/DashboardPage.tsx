import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Send, Search, Filter, RefreshCw } from 'lucide-react';
import api from '../services/api';
import ComposeEmailModal from '../components/emails/ComposeEmailModal';
import EmailDetailDrawer from '../components/emails/EmailDetailDrawer';
import Sidebar from '../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import useDashboardStats from '../hooks/useDashboardStats';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, email: string, picture?: string} | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');

  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [scheduledPage, setScheduledPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);

  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();

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
    <div className="flex h-screen mesh-bg overflow-hidden font-sans">
      
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        onCompose={() => setIsComposeOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-[88px] flex items-center justify-between px-10 border-b border-white/5 flex-shrink-0">
          <div className="relative w-full max-w-[600px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 glass-input rounded-xl"
            />
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button className="p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-3 text-slate-400 hover:text-emerald-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group" onClick={() => { refetchScheduled(); refetchSent(); }}>
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </header>

        {/* Email List Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
            
            {/* Dashboard Stats Overview */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Campaigns', value: stats?.totalCampaigns, colorLine: 'bg-emerald-500', colorGlow: 'bg-emerald-500/10' },
                { label: 'Scheduled', value: stats?.scheduled, colorLine: 'bg-teal-500', colorGlow: 'bg-teal-500/10' },
                { label: 'Sending', value: stats?.sending, colorLine: 'bg-amber-500', colorGlow: 'bg-amber-500/10' },
                { label: 'Sent', value: stats?.sent, colorLine: 'bg-blue-500', colorGlow: 'bg-blue-500/10' },
                { label: 'Failed', value: stats?.failed, colorLine: 'bg-red-500', colorGlow: 'bg-red-500/10' }
              ].map((stat, i) => (
                <div key={i} className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center border-t border-white/10 relative overflow-hidden group">
                  <div className={`absolute top-0 inset-x-0 h-0.5 ${stat.colorLine} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute -inset-10 ${stat.colorGlow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full`} />
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{stat.label}</span>
                  {isLoadingStats ? (
                    <div className="h-8 w-12 bg-white/10 animate-pulse rounded-lg mt-1" />
                  ) : (
                    <span className="text-3xl font-black text-white tracking-tighter">{stat.value || 0}</span>
                  )}
                </div>
              ))}
            </div>
            <AnimatePresence mode="popLayout">
              {activeTab === 'scheduled' && (
                isLoadingScheduled ? (
                  <p className="text-center py-20 text-slate-400 font-medium">Loading campaigns...</p>
                ) : scheduledData?.emails.length === 0 ? (
                  <div className="text-center py-24 glass-panel rounded-3xl mt-4">
                    <p className="text-slate-400 font-medium text-lg">Your queue is empty. Ready to send some emails?</p>
                  </div>
                ) : (
                  scheduledData?.emails.map((job: any, index: number) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedJob(job)}
                      className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 shadow-lg transition-all rounded-2xl cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 min-w-[240px]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-sm uppercase shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]">
                          {job.recipient.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white tracking-wide">{job.recipient.split('@')[0]}</span>
                      </div>
                      <div className="flex items-center gap-6 flex-1 overflow-hidden">
                        <span className={`flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          job.status === 'PROCESSING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          <Clock className="w-3 h-3 mr-2" />
                          {formatFigmaDate(job.scheduledAt)}
                        </span>
                        <div className="truncate text-sm flex-1">
                          <span className="font-bold text-white">{job.subject}</span>
                          <span className="text-slate-500 ml-3 font-medium hidden md:inline">- Automated campaign sequence...</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              )}

              {activeTab === 'sent' && (
                isLoadingSent ? (
                  <p className="text-center py-20 text-slate-400 font-medium">Loading history...</p>
                ) : sentData?.emails.length === 0 ? (
                  <div className="text-center py-24 glass-panel rounded-3xl mt-4">
                    <p className="text-slate-400 font-medium text-lg">No emails sent yet.</p>
                  </div>
                ) : (
                  sentData?.emails.map((job: any, index: number) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedJob(job)}
                      className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 shadow-lg transition-all rounded-2xl cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-[240px]">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm uppercase shadow-[inset_0_0_10px_rgba(10,185,129,0.1)]">
                          {job.recipient.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white tracking-wide">{job.recipient.split('@')[0]}</span>
                      </div>
                      <div className="flex items-center gap-6 flex-1 overflow-hidden">
                        <span className="flex-shrink-0 inline-flex items-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Delivered
                        </span>
                        <div className="truncate text-sm flex-1">
                          <span className="font-bold text-white">{job.subject}</span>
                          <span className="text-slate-500 ml-3 font-medium hidden md:inline">- Successfully delivered.</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              )}
            </AnimatePresence>

            {/* Pagination Controls */}
            {activeTab === 'scheduled' && scheduledData && scheduledData.total > 10 && (
              <div className="flex items-center justify-center gap-4 py-4 mt-4 border-t border-white/5 text-sm">
                <button disabled={scheduledPage === 1} onClick={() => setScheduledPage(p => p - 1)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-lg disabled:opacity-30 transition-colors">Previous</button>
                <span className="text-slate-500 font-medium">Page {scheduledPage} of {Math.ceil(scheduledData.total / 10)}</span>
                <button disabled={scheduledPage * 10 >= scheduledData.total} onClick={() => setScheduledPage(p => p + 1)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-lg disabled:opacity-30 transition-colors">Next</button>
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

      <EmailDetailDrawer 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        job={selectedJob} 
      />
    </div>
  );
}
