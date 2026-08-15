import { useState, useRef } from 'react';
import { ArrowLeft, Paperclip, Clock, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Undo, Redo, ChevronDown, FileText, Send } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex flex-col items-end font-sans">
      <motion.div 
        initial={{ x: '100%', opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 200 }}
        className="w-full max-w-[800px] h-full bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex flex-col border-l border-slate-200/50"
      >
        {/* Header */}
        <header className="h-[72px] flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">Compose Campaign</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className="p-2.5 text-slate-400 hover:text-[#0BA053] bg-slate-50 hover:bg-[#E6F6ED] rounded-xl transition-all"
              onClick={() => fileInputRef.current?.click()}
              title="Upload CSV"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input type="file" className="hidden" ref={fileInputRef} accept=".csv,.txt" onChange={handleFileUpload} />

            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`p-2.5 rounded-xl transition-all ${showDatePicker ? 'text-[#0BA053] bg-[#E6F6ED]' : 'text-slate-400 hover:text-[#0BA053] bg-slate-50 hover:bg-[#E6F6ED]'}`}
            >
              <Clock className="w-4 h-4" />
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0BA053] hover:bg-[#098C49] text-white font-semibold rounded-xl ml-2 disabled:opacity-70 transition-all shadow-md shadow-[#0BA053]/20 active:scale-[0.98]"
            >
              {isSubmitting ? 'Sending...' : 'Send Now'}
              <Send className="w-4 h-4" />
            </button>

            {/* Send Later Dropdown */}
            <AnimatePresence>
              {showDatePicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-[70px] right-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-50 w-72"
                >
                  <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0BA053]" />
                    Schedule Time
                  </p>
                  <input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0BA053]/20 focus:bg-white transition-all"
                  />
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => setShowDatePicker(false)} className="px-4 py-2 text-sm font-bold text-white bg-[#0BA053] rounded-lg">Done</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="space-y-6">
            
            {/* From */}
            <div className="flex items-center border-b border-slate-100 pb-4">
              <span className="w-24 font-bold text-xs text-slate-400 uppercase tracking-wider">From</span>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  {userEmail}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* To */}
            <div className="flex flex-col border-b border-slate-100 pb-4 relative">
              <div className="flex items-center">
                <span className="w-24 font-bold text-xs text-slate-400 uppercase tracking-wider">To</span>
                {fileName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <FileText className="w-4 h-4 text-blue-500" />
                      {fileName}
                    </span>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={toField}
                    onChange={(e) => setToField(e.target.value)}
                    placeholder="recipient@example.com (or upload CSV)" 
                    className="flex-1 border-none text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none p-0"
                  />
                )}
              </div>
              {parseResult && (
                <div className="pl-24 mt-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">{parseResult.valid} valid</span>
                  <span className="text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md">{parseResult.invalid} invalid</span>
                  <span className="text-amber-500 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">{parseResult.duplicates} dupes</span>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="flex items-center border-b border-slate-100 pb-4">
              <span className="w-24 font-bold text-xs text-slate-400 uppercase tracking-wider">Subject</span>
              <input 
                type="text" 
                placeholder="Write an amazing subject..." 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 border-none text-base font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none p-0"
              />
            </div>

            {/* Delay & Limit */}
            <div className="flex items-center gap-8 border-b border-slate-100 pb-6 pt-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Delay (s)</span>
                <input 
                  type="number" 
                  value={delay}
                  onChange={(e) => setDelay(e.target.value)}
                  className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#0BA053]/20 focus:border-[#0BA053] transition-all"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Hourly Limit</span>
                <input 
                  type="number" 
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(e.target.value)}
                  className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#0BA053]/20 focus:border-[#0BA053] transition-all"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Body */}
            <div className="pt-2">
              <textarea 
                placeholder="Write your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full min-h-[300px] border-none text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none p-0 resize-none leading-relaxed"
              />
            </div>

          </div>
        </div>

        {/* Toolbar (Static/Visual only) */}
        <div className="h-[56px] border-t border-slate-100 px-6 flex items-center gap-1.5 text-slate-400 flex-shrink-0 bg-[#FAFAFA]">
          <button className="p-1.5 hover:bg-slate-200 rounded"><Undo className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded"><Redo className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button className="p-1.5 hover:bg-slate-200 rounded font-serif font-bold text-lg leading-none">T<span className="text-sm">T</span></button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button className="p-1.5 hover:bg-slate-200 rounded"><Bold className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded"><Italic className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded"><Underline className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button className="p-1.5 hover:bg-slate-200 rounded"><AlignLeft className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded"><AlignCenter className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-200 rounded"><AlignRight className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button className="p-1.5 hover:bg-slate-200 rounded"><List className="w-4 h-4" /></button>
        </div>

      </motion.div>
    </div>
  );
}

