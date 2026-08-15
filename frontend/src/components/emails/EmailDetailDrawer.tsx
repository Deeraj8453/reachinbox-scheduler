import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Send, AlertCircle, RefreshCw, XOctagon } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailJob {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  status: string;
  error?: string;
  attempts: number;
}

interface EmailDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  job: EmailJob | null;
}

export default function EmailDetailDrawer({ isOpen, onClose, job }: EmailDetailDrawerProps) {
  if (!job) return null;

  const handleRetry = () => {
    toast.success('Retrying email job...');
    onClose();
  };

  const handleCancel = () => {
    toast.error('Email job cancelled.');
    onClose();
  };

  const formatFigmaDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    return `${day} at ${time}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[500px] bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col font-sans"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Email Details</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Header Status */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl uppercase shadow-lg ${
                  job.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  job.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  job.status === 'PROCESSING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}>
                  {job.recipient.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{job.recipient}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      job.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      job.status === 'FAILED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      job.status === 'PROCESSING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium tracking-wide">
                      {formatFigmaDate(job.scheduledAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject & Body */}
              <div className="space-y-4">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500 mb-2">Subject</p>
                  <p className="text-white font-medium">{job.subject}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500 mb-2">Body</p>
                  <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {job.body || 'No content provided.'}
                  </div>
                </div>
              </div>

              {/* Meta Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Attempts</span>
                  <span className="text-2xl font-bold text-white">{job.attempts}</span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Queue ID</span>
                  <span className="text-sm font-medium text-slate-300 mt-2 truncate w-full text-center">{job.id.slice(0, 8)}...</span>
                </div>
              </div>

              {job.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-xs font-black uppercase tracking-[0.1em] text-red-400">Error Message</p>
                  </div>
                  <p className="text-sm text-red-300 font-medium">{job.error}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/10 bg-black/20 flex gap-4">
              {job.status === 'FAILED' && (
                <button onClick={handleRetry} className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                  <RefreshCw className="w-4 h-4" />
                  Retry Email
                </button>
              )}
              {job.status === 'SCHEDULED' && (
                <button onClick={handleCancel} className="flex-1 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                  <XOctagon className="w-4 h-4" />
                  Cancel Job
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
