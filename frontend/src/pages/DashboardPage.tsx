import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Send, Search, Filter, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import ComposeEmailModal from '../components/emails/ComposeEmailModal';
import EmailListItem from '../components/emails/EmailListItem';
import useDebounce from '../hooks/useDebounce';
import useEmails from '../hooks/useEmails';
import type { Email } from '../types/emails';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, email: string, picture?: string} | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const [scheduledPage, setScheduledPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        setUser(JSON.parse(raw));
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Invalid user in localStorage, clearing it.', err);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    setScheduledPage(1);
    setSentPage(1);
  }, [debouncedSearchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const { 
    data: scheduledData, 
    refetch: refetchScheduled, 
    isLoading: isLoadingScheduled 
  } = useEmails('scheduled', scheduledPage, debouncedSearchQuery, activeTab === 'scheduled');

  const { 
    data: sentData, 
    refetch: refetchSent, 
    isLoading: isLoadingSent 
  } = useEmails('sent', sentPage, debouncedSearchQuery, activeTab === 'sent');

  const handleScheduledSuccess = () => {
    setIsComposeOpen(false);
    refetchScheduled();
    setActiveTab('scheduled');
  };

  return (
    <div className="flex h-screen mesh-bg overflow-hidden font-sans">
      
      {/* Sidebar */}
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
          <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
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
              onClick={handleLogout}
              className="absolute right-8 opacity-0 group-hover:opacity-100 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Compose Button */}
        <div className="px-6 mb-8">
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 glass-button rounded-xl"
          >
            <Send className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {/* Core Menu */}
        <div className="px-6 flex-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Navigation</p>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === 'scheduled' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">Scheduled</span>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${activeTab === 'scheduled' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>
                {scheduledData?.total || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === 'sent' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Send className="w-4 h-4" />
                <span className="text-sm font-bold">Sent</span>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${activeTab === 'sent' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>
                {sentData?.total || 0}
              </span>
            </button>
          </nav>
        </div>
      </aside>

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
            <button aria-label="Filter" className="p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
              <Filter className="w-4 h-4" />
            </button>
            <button aria-label="Refresh" className="p-3 text-slate-400 hover:text-emerald-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group" onClick={() => { refetchScheduled(); refetchSent(); }}>
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </header>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="max-w-[1000px] mx-auto space-y-4 pb-10">
            <AnimatePresence mode="popLayout">
              {activeTab === 'scheduled' && (
                isLoadingScheduled ? (
                  <p className="text-center py-20 text-slate-400 font-medium">Loading campaigns...</p>
                ) : scheduledData?.emails.length === 0 ? (
                  <div className="text-center py-24 glass-panel rounded-3xl mt-4">
                    <p className="text-slate-400 font-medium text-lg">Your queue is empty. Ready to send some emails?</p>
                  </div>
                ) : (
                  scheduledData?.emails.map((job: Email, index: number) => (
                    <EmailListItem 
                      key={job.id} 
                      job={job} 
                      index={index}
                      type="scheduled"
                      onClick={() => {}}
                    />
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
                  sentData?.emails.map((job: Email, index: number) => (
                    <EmailListItem 
                      key={job.id} 
                      job={job} 
                      index={index}
                      type="sent"
                      onClick={() => {}}
                    />
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
    </div>
  );
}
