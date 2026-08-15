import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Email } from '../../types/emails';
import { formatFigmaDateSafe, getLocalPart } from '../../utils/emailHelpers';

interface Props {
  job: Email;
  index: number;
  type: 'scheduled' | 'sent';
  onClick?: () => void;
}

export default function EmailListItem({ job, index, type, onClick }: Props) {
  const isScheduled = type === 'scheduled';
  
  return (
    <motion.button
      onClick={onClick}
      aria-label={`View details for campaign to ${job.recipient}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="w-full flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 shadow-lg transition-all rounded-2xl cursor-pointer group text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
    >
      <div className="flex items-center gap-4 min-w-[240px]">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-inner ${
          isScheduled 
            ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-purple-500/30 text-purple-300 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]'
            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]'
        }`}>
          {getLocalPart(job.recipient).charAt(0)}
        </div>
        <span className="text-sm font-bold text-white tracking-wide">{getLocalPart(job.recipient)}</span>
      </div>
      
      <div className="flex items-center gap-6 flex-1 overflow-hidden">
        <span className={`flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
          !isScheduled 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : job.status === 'PROCESSING' 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        }`}>
          {isScheduled && <Clock className="w-3 h-3 mr-2" />}
          {isScheduled ? formatFigmaDateSafe(job.scheduledAt) : 'Delivered'}
        </span>
        <div className="truncate text-sm flex-1">
          <span className="font-bold text-white">{job.subject}</span>
          <span className="text-slate-500 ml-3 font-medium hidden md:inline">
            {isScheduled ? '- Automated campaign sequence...' : '- Successfully delivered.'}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
