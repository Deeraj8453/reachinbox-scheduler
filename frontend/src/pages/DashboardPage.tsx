import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, MoreVertical, Calendar } from 'lucide-react';
import api from '../services/api';
import ComposeEmailModal from '../components/emails/ComposeEmailModal';
import EmailDetailDrawer from '../components/emails/EmailDetailDrawer';
import Sidebar from '../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Format date like Figma: "14 Aug 2026, 02:00 PM"
  const formatFigmaDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year}, ${time}`;
  };

  return (
    <div className="flex h-screen mesh-bg overflow-hidden font-sans text-white">
      
      {/* Sidebar */}
      <Sidebar 
        onCompose={() => setIsComposeOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Top Header - Matches Figma exactly */}
        <header className="h-[88px] flex items-center justify-between px-10 border-b border-white/5 flex-shrink-0 bg-white/[0.02]">
          <h2 className="text-2xl font-black text-white w-64">
            {activeTab === 'scheduled' ? 'Scheduled Emails' : 'Sent Emails'}
          </h2>
          
          <div className="flex-1 max-w-[500px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search emails..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end w-64 gap-6">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogout} title="Click to logout">
              <div className="text-right">
                <p className="text-sm font-bold leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400">{user?.email || 'user@domain.io'}</p>
              </div>
              {user?.picture ? (
                <img src={user.picture} alt="Profile" className="w-9 h-9 rounded-full ring-2 ring-emerald-500/30" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  {(user?.name || 'U')[0]}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          
          {/* Sub Header for active tabs inside dashboard content like figma */}
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-8 border-b border-white/10 w-full pb-1">
               <button 
                 onClick={() => setActiveTab('scheduled')}
                 className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === 'scheduled' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
               >
                 Scheduled Emails
                 {activeTab === 'scheduled' && (
                   <motion.div layoutId="activeTabDashboard" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                 )}
               </button>
               <button 
                 onClick={() => setActiveTab('sent')}
                 className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === 'sent' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
               >
                 Sent Emails
                 {activeTab === 'sent' && (
                   <motion.div layoutId="activeTabDashboard" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                 )}
               </button>
               
               <div className="ml-auto pb-2">
                 <button 
                  onClick={() => setIsComposeOpen(true)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
                 >
                   <Plus className="w-4 h-4" />
                   Compose New Email
                 </button>
               </div>
             </div>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20">
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-500 w-[25%]">Email</th>
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-500 w-[35%]">Subject</th>
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-500 w-[25%]">{activeTab === 'scheduled' ? 'Scheduled Time' : 'Sent Time'}</th>
                  <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                  <th className="py-4 px-6 w-10"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {activeTab === 'scheduled' && (
                    isLoadingScheduled ? (
                      <tr><td colSpan={5} className="py-20 text-center text-slate-500 font-medium">Loading...</td></tr>
                    ) : scheduledData?.emails.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="py-32 flex flex-col items-center justify-center">
                             <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                               <Calendar className="w-10 h-10 text-emerald-400" />
                             </div>
                             <h3 className="text-xl font-bold text-white mb-2">No scheduled emails yet</h3>
                             <p className="text-slate-400 mb-6">Your scheduled emails will appear here.</p>
                             <button onClick={() => setIsComposeOpen(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                               <Plus className="w-4 h-4" />
                               Compose New Email
                             </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      scheduledData?.emails.map((job: any) => (
                        <tr key={job.id} onClick={() => setSelectedJob(job)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                          <td className="py-4 px-6">
                            <span className="text-sm font-medium text-white">{job.recipient}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-slate-300">{job.subject}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatFigmaDate(job.scheduledAt)}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[11px] font-black uppercase tracking-wider">
                              Scheduled
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  )}

                  {activeTab === 'sent' && (
                    isLoadingSent ? (
                      <tr><td colSpan={5} className="py-20 text-center text-slate-500 font-medium">Loading...</td></tr>
                    ) : sentData?.emails.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="py-32 flex flex-col items-center justify-center">
                             <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                               <Send className="w-10 h-10 text-emerald-400" />
                             </div>
                             <h3 className="text-xl font-bold text-white mb-2">No sent emails yet</h3>
                             <p className="text-slate-400 mb-6">Your sent emails will appear here.</p>
                             <button onClick={() => setIsComposeOpen(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                               <Plus className="w-4 h-4" />
                               Compose New Email
                             </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sentData?.emails.map((job: any) => (
                        <tr key={job.id} onClick={() => setSelectedJob(job)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                          <td className="py-4 px-6">
                            <span className="text-sm font-medium text-white">{job.recipient}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-slate-300">{job.subject}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Send className="w-3 h-3" />
                              {formatFigmaDate(job.scheduledAt)}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {job.status === 'FAILED' ? (
                              <span className="inline-block px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-[11px] font-black uppercase tracking-wider">
                                Failed
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[11px] font-black uppercase tracking-wider">
                                Sent
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </AnimatePresence>
              </tbody>
            </table>
            
            {/* Pagination aligned to bottom right like Figma */}
            <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/[0.01]">
              <span className="text-xs text-slate-500 font-medium ml-2">
                 Showing {activeTab === 'scheduled' ? (scheduledData?.emails.length || 0) : (sentData?.emails.length || 0)} of {activeTab === 'scheduled' ? (scheduledData?.total || 0) : (sentData?.total || 0)} results
              </span>
              <div className="flex items-center gap-2 mr-2">
                <button 
                  disabled={activeTab === 'scheduled' ? scheduledPage === 1 : sentPage === 1}
                  onClick={() => activeTab === 'scheduled' ? setScheduledPage(p => p - 1) : setSentPage(p => p - 1)}
                  className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30"
                >
                  &lt;
                </button>
                <span className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-sm font-bold">
                  {activeTab === 'scheduled' ? scheduledPage : sentPage}
                </span>
                <button 
                  disabled={activeTab === 'scheduled' ? scheduledPage * 10 >= (scheduledData?.total || 0) : sentPage * 10 >= (sentData?.total || 0)}
                  onClick={() => activeTab === 'scheduled' ? setScheduledPage(p => p + 1) : setSentPage(p => p + 1)}
                  className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30"
                >
                  &gt;
                </button>
              </div>
            </div>

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
