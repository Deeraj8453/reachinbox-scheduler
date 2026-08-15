import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Send, ShieldAlert, ArrowLeft, Mail, FileText, Activity } from 'lucide-react';
import { useState } from 'react';
import type { Email } from '../../types/emails';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  job: Email | null;
}

export default function EmailDetailDrawer({ isOpen, onClose, job }: DrawerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'activity'>('preview');

  if (!isOpen || !job) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative ml-auto w-full max-w-[900px] h-full glass-panel border-l border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar (Metadata) */}
            <div className="w-[320px] border-r border-white/5 p-8 overflow-y-auto custom-scrollbar flex-shrink-0">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg uppercase shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]">
                  {job.recipient.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{job.recipient}</h3>
                  <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-black uppercase tracking-widest ${
                    job.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    job.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    job.status === 'PROCESSING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Subject</p>
                  <p className="text-sm font-bold text-white">{job.subject}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Scheduled Time</p>
                  <p className="text-sm text-white font-medium flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(job.scheduledAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Sender</p>
                  <p className="text-sm text-white font-medium flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {job.senderId || 'default@reachinbox.ai'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Delay Setting</p>
                  <p className="text-sm text-white font-medium">Smart Automated Delay</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Created At</p>
                  <p className="text-sm text-white font-medium flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(job.createdAt || job.scheduledAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side (Content) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
              <div className="flex items-center gap-6 px-8 border-b border-white/5 pt-4">
                <button 
                  onClick={() => setActiveTab('preview')}
                  className={`pb-4 text-sm font-bold relative transition-colors flex items-center gap-2 ${activeTab === 'preview' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <FileText className="w-4 h-4" />
                  Email Preview
                  {activeTab === 'preview' && (
                    <motion.div layoutId="activeTabDrawer" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={`pb-4 text-sm font-bold relative transition-colors flex items-center gap-2 ${activeTab === 'activity' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <Activity className="w-4 h-4" />
                  Activity Log
                  {activeTab === 'activity' && (
                    <motion.div layoutId="activeTabDrawer" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {activeTab === 'preview' ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full font-serif text-slate-300 leading-relaxed shadow-inner"
                    >
                      <div dangerouslySetInnerHTML={{ __html: job.body || '<p>No content provided.</p>' }} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="activity"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-1">
                          <Send className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white mb-1">Email Job Created</p>
                          <p className="text-xs text-slate-400 mb-2">{formatDate(job.createdAt || job.scheduledAt)}</p>
                          <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10">The email was created and queued in BullMQ via Redis with deterministic ID <code className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded ml-1">{job.bullJobId}</code>.</p>
                        </div>
                      </div>

                      {job.status === 'PROCESSING' && (
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white mb-1">Worker Processing</p>
                            <p className="text-xs text-slate-400 mb-2">Just now</p>
                            <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10">A BullMQ background worker has picked up the job and is attempting SMTP transport delivery.</p>
                          </div>
                        </div>
                      )}

                      {job.status === 'SENT' && (
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1">
                            <Send className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white mb-1">Delivered Successfully</p>
                            <p className="text-xs text-slate-400 mb-2">{formatDate(job.scheduledAt)}</p>
                            <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10">The email was successfully routed via nodemailer ETHEREAL and marked as SENT in the database.</p>
                          </div>
                        </div>
                      )}

                      {job.status === 'FAILED' && (
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white mb-1">Delivery Failed</p>
                            <p className="text-xs text-slate-400 mb-2">{formatDate(job.scheduledAt)}</p>
                            <p className="text-sm text-slate-300 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">SMTP transport rejection or worker crash. Retries may be configured.</p>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
