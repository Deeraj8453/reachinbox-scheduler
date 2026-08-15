import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Check, AlertCircle, Trash2, Calendar, Clock, ChevronDown, Type, Bold, Italic, Underline, Link2, List, ListOrdered } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

interface ComposeProps {
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
}

export default function ComposeEmailModal({ onClose, onSuccess, userEmail }: ComposeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delaySeconds, setDelaySeconds] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d.toTimeString().slice(0, 5);
  });

  // Recipient State
  const [recipientsText, setRecipientsText] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvStats, setCsvStats] = useState<{valid: number, invalid: number, total: number} | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    Papa.parse(file, {
      header: false,
      complete: (results) => {
        let valid = 0;
        let invalid = 0;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        results.data.forEach((row: any) => {
          if (row[0] && typeof row[0] === 'string') {
            if (emailRegex.test(row[0].trim())) valid++;
            else invalid++;
          }
        });
        
        setCsvStats({ valid, invalid, total: valid + invalid });
      }
    });
  };

  const removeFile = () => {
    setCsvFile(null);
    setCsvStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSchedule = async () => {
    if (!subject || !body) {
      toast.error('Subject and body are required');
      return;
    }
    if (!csvFile && !recipientsText) {
      toast.error('Please provide recipients');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalRecipients = recipientsText;
      if (csvFile) {
        const text = await csvFile.text();
        finalRecipients = text;
      }

      const scheduledAt = new Date(`${startDate}T${startTime}`).toISOString();

      await api.post('/emails/schedule', {
        subject,
        body,
        recipients: finalRecipients,
        startTime: scheduledAt,
        delaySeconds,
        hourlyLimit
      });

      toast.success('Campaign scheduled successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to schedule campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        className="w-full max-w-[1000px] h-[90vh] glass-panel border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Header - Figma alignment */}
        <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-white tracking-wide">Compose New Email</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
              Save Draft
            </button>
            <button 
              onClick={handleSchedule}
              disabled={isSubmitting}
              className="px-8 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-black/20">
          <div className="max-w-[800px] mx-auto space-y-6">
            
            {/* From */}
            <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <label className="text-sm font-bold text-slate-400 w-16">From</label>
              <div className="flex-1 flex items-center justify-between text-white font-medium text-sm px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                <span>{userEmail}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* To / Upload List */}
            <div className="flex items-start gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <label className="text-sm font-bold text-slate-400 w-16 mt-3">To</label>
              <div className="flex-1">
                {!csvFile ? (
                  <div className="flex items-center gap-4">
                    <input 
                      type="text" 
                      value={recipientsText}
                      onChange={(e) => setRecipientsText(e.target.value)}
                      placeholder="Add recipients (comma separated) or upload list" 
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload List
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept=".csv" 
                      className="hidden" 
                    />
                  </div>
                ) : (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 flex flex-col items-center justify-center relative group">
                    <button onClick={removeFile} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-white font-bold mb-1">{csvFile.name}</p>
                    <p className="text-slate-400 text-sm mb-4">{csvStats?.total} rows detected</p>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <span className="block text-xl font-black text-emerald-400">{csvStats?.valid}</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/50">Valid</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xl font-black text-red-400">{csvStats?.invalid}</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-red-500/50">Invalid</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <label className="text-sm font-bold text-slate-400 w-16">Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject" 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all"
              />
            </div>

            {/* Delay, Limit, Time Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <label className="block text-xs font-bold text-slate-400 mb-2">Delay between emails</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(parseInt(e.target.value) || 0)}
                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none text-center"
                  />
                  <span className="text-sm text-slate-500 font-medium">seconds</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <label className="block text-xs font-bold text-slate-400 mb-2">Hourly limit</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={hourlyLimit}
                    onChange={(e) => setHourlyLimit(parseInt(e.target.value) || 0)}
                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none text-center"
                  />
                  <span className="text-sm text-slate-500 font-medium">emails</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <label className="block text-xs font-bold text-slate-400 mb-2">Start time</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
                  />
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-[110px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Rich Text Editor Body */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden flex flex-col h-[300px]">
              {/* Toolbar */}
              <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-black/40">
                <div className="flex items-center gap-1 pr-4 border-r border-white/10">
                  <span className="text-sm font-bold text-white px-2">Normal</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex items-center gap-1 px-4 border-r border-white/10">
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Bold className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Italic className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Underline className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-1 px-4 border-r border-white/10">
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><List className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><ListOrdered className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-1 pl-4">
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Link2 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Type className="w-4 h-4" /></button>
                </div>
              </div>
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your email..." 
                className="flex-1 w-full bg-transparent p-6 text-sm text-white placeholder:text-slate-500 outline-none resize-none font-serif leading-relaxed"
              ></textarea>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
