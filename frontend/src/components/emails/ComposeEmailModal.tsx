import { useState, useRef } from 'react';
import { ArrowLeft, Paperclip, Clock, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Undo, Redo, ChevronDown, FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { motion } from 'framer-motion';
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
    <div className="fixed inset-0 z-50 bg-black/20 flex flex-col items-end font-sans">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-[800px] h-full bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <header className="h-[72px] flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Compose</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className="p-2 text-slate-400 hover:text-figma-green rounded-full hover:bg-slate-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              title="Upload CSV"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input type="file" className="hidden" ref={fileInputRef} accept=".csv,.txt" onChange={handleFileUpload} />

            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`p-2 rounded-full transition-colors ${showDatePicker ? 'text-figma-green bg-[#E6F6ED]' : 'text-slate-400 hover:text-figma-green hover:bg-slate-50'}`}
            >
              <Clock className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-figma-green hover:bg-[#098C49] text-white font-medium rounded-full ml-2 disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
              <Send className="w-4 h-4" />
            </button>

            {/* Send Later Dropdown */}
            {showDatePicker && (
              <div className="absolute top-[70px] right-6 bg-white border border-slate-200 rounded-xl p-4 shadow-lg z-50">
                <p className="text-sm font-semibold mb-2">Schedule Time</p>
                <input 
                  type="datetime-local" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-figma-green"
                />
              </div>
            )}
          </div>
        </header>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            
            {/* From */}
            <div className="flex items-center border-b border-slate-100 pb-4">
              <span className="w-20 font-semibold text-sm text-slate-500">From</span>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1A1A1A]">{userEmail}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* To */}
            <div className="flex flex-col border-b border-slate-100 pb-4 relative">
              <div className="flex items-center">
                <span className="w-20 font-semibold text-sm text-slate-500">To</span>
                {fileName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      {fileName}
                    </span>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={toField}
                    onChange={(e) => setToField(e.target.value)}
                    placeholder="example@gmail.com" 
                    className="flex-1 border-none text-sm font-semibold text-[#1A1A1A] placeholder:text-slate-300 focus:outline-none p-0"
                  />
                )}
              </div>
              {parseResult && (
                <div className="pl-20 mt-2 flex items-center gap-3 text-xs font-semibold">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{parseResult.valid} valid</span>
                  <span className="text-red-500 bg-red-50 px-2 py-1 rounded-md">{parseResult.invalid} invalid</span>
                  <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded-md">{parseResult.duplicates} dupes</span>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="flex items-center border-b border-slate-100 pb-4">
              <span className="w-20 font-semibold text-sm text-slate-500">Subject</span>
              <input 
                type="text" 
                placeholder="Write a subject" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 border-none text-sm font-semibold text-[#1A1A1A] placeholder:text-slate-300 focus:outline-none p-0"
              />
            </div>

            {/* Delay & Limit */}
            <div className="flex items-center gap-6 border-b border-slate-100 pb-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-slate-500">Delay (seconds)</span>
                <input 
                  type="number" 
                  value={delay}
                  onChange={(e) => setDelay(e.target.value)}
                  className="w-16 border border-slate-200 rounded-md p-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-figma-green"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-slate-500">Hourly Limit</span>
                <input 
                  type="number" 
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(e.target.value)}
                  className="w-16 border border-slate-200 rounded-md p-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-figma-green"
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
                className="w-full h-[400px] border-none text-sm text-[#1A1A1A] placeholder:text-slate-300 focus:outline-none p-0 resize-none"
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

