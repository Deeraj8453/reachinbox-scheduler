import { useState, useRef } from 'react';
import { Paperclip, Clock, ChevronDown, FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { processCsvContent, type CsvStats } from '../../utils/csv';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
}

export default function ComposeEmailModal({ onClose, onSuccess, userEmail }: Props) {
  const [toField, setToField] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [startTime, setStartTime] = useState('');
  const [delay, setDelay] = useState('');
  const [hourlyLimit, setHourlyLimit] = useState('');
  
  const [fileName, setFileName] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [parseResult, setParseResult] = useState<CsvStats | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5 MB.');
      return;
    }
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a .csv or .txt file');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const stats = processCsvContent(content);
      setParseResult(stats);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const finalRecipients = parseResult ? parseResult.validEmails : (toField ? [toField] : []);

    if (!subject || !body || (finalRecipients.length === 0) || !startTime) {
      toast.error('Please fill in all required fields (To, Subject, Body, and Date)');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/emails/schedule', {
        subject,
        body,
        recipients: finalRecipients,
        startTime: new Date(startTime).toISOString(),
        delaySeconds: parseInt(delay || '0'),
        hourlyLimit: parseInt(hourlyLimit || '100')
      });
      
      if (data.success) {
        toast.success(`Successfully scheduled ${data.data.jobsScheduled} emails!`);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to schedule emails');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center font-sans p-6">
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-[800px] max-h-[90vh] glass-panel rounded-3xl flex flex-col overflow-hidden relative bg-slate-900/80 backdrop-blur-xl border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500"></div>
        
        {/* Header */}
        <header className="h-[80px] flex items-center justify-between px-8 border-b border-white/10 flex-shrink-0 bg-white/5">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-white tracking-wide">Compose</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              className="p-3 text-slate-400 hover:text-emerald-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              title="Upload CSV Leads"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input type="file" className="hidden" ref={fileInputRef} accept=".csv,.txt" onChange={handleFileUpload} />

            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`p-3 rounded-xl transition-all border shadow-sm ${showDatePicker ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' : 'text-slate-400 hover:text-emerald-400 bg-white/5 hover:bg-white/10 border-white/5'}`}
            >
              <Clock className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl ml-2 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-emerald-900/20"
            >
              <span className="font-bold tracking-wide">{isSubmitting ? 'Initializing...' : 'Launch Campaign'}</span>
              <Send className="w-4 h-4 ml-1" />
            </button>

            {/* Close Button */}
            <button onClick={onClose} className="p-3 ml-2 text-slate-400 hover:text-white bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all border border-white/5 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Send Later Dropdown */}
            <AnimatePresence>
              {showDatePicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-[90px] right-24 bg-slate-800/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 z-50 w-[320px]"
                >
                  <p className="text-sm font-black text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Schedule Time
                  </p>
                  <input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm font-bold text-white"
                  />
                  <div className="mt-5 flex justify-end">
                    <button onClick={() => setShowDatePicker(false)} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl">Confirm</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-slate-900/20">
          <div className="space-y-6">
            
            {/* From */}
            <div className="flex items-center border-b border-white/10 pb-5">
              <span className="w-28 font-black text-xs text-slate-500 uppercase tracking-[0.2em]">Sender</span>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                  {userEmail}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* To */}
            <div className="flex flex-col border-b border-white/10 pb-5 relative">
              <div className="flex items-center">
                <span className="w-28 font-black text-xs text-slate-500 uppercase tracking-[0.2em]">Audience</span>
                {fileName ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white flex items-center gap-2 bg-indigo-500/20 px-4 py-2 rounded-xl border border-indigo-500/30">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      {fileName}
                    </span>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={toField}
                    onChange={(e) => setToField(e.target.value)}
                    placeholder="Enter email or upload leads CSV..." 
                    className="flex-1 bg-transparent border-none text-base font-medium text-white placeholder:text-slate-600 focus:outline-none p-0"
                  />
                )}
              </div>
              {parseResult && (
                <div className="pl-28 mt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                  <span className="text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg">{parseResult.valid} valid</span>
                  <span className="text-red-300 bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-lg">{parseResult.invalid} invalid</span>
                  <span className="text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg">{parseResult.duplicates} dupes</span>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="flex items-center border-b border-white/10 pb-5">
              <span className="w-28 font-black text-xs text-slate-500 uppercase tracking-[0.2em]">Subject</span>
              <input 
                type="text" 
                placeholder="Craft an irresistible subject line..." 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent border-none text-lg font-bold text-white placeholder:text-slate-600 focus:outline-none p-0"
              />
            </div>

            {/* Config: Delay & Limit */}
            <div className="flex items-center gap-10 border-b border-white/10 pb-8 pt-3">
              <div className="flex items-center gap-4">
                <span className="font-black text-xs text-slate-500 uppercase tracking-[0.2em]">Delay (s)</span>
                <input 
                  type="number" 
                  value={delay}
                  onChange={(e) => setDelay(e.target.value)}
                  className="w-24 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-sm font-bold text-white text-center"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black text-xs text-slate-500 uppercase tracking-[0.2em]">Hr Limit</span>
                <input 
                  type="number" 
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(e.target.value)}
                  className="w-24 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-sm font-bold text-white text-center"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Body */}
            <div className="pt-4">
              <textarea 
                placeholder="Write your email sequence body here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full min-h-[300px] bg-transparent border-none text-base text-slate-300 placeholder:text-slate-600 focus:outline-none p-0 resize-none leading-relaxed font-medium"
              />
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}

