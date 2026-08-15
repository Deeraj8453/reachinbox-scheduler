import { useState, useRef } from 'react';
import { Paperclip, Clock, ChevronDown, FileText, Send, ChevronRight, ChevronLeft, CheckCircle2, Settings, Users, AlignLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { processCsvContent, type CsvStats } from '../../utils/csv';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
}

const STEPS = [
  { id: 1, title: 'Content', icon: AlignLeft, description: 'Craft your message' },
  { id: 2, title: 'Audience', icon: Users, description: 'Upload leads' },
  { id: 3, title: 'Schedule', icon: Calendar, description: 'Set launch time' },
  { id: 4, title: 'Settings', icon: Settings, description: 'Throttle limits' },
  { id: 5, title: 'Review', icon: CheckCircle2, description: 'Final check' }
];

export default function ComposeEmailModal({ onClose, onSuccess, userEmail }: Props) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Content
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Step 2: Audience
  const [toField, setToField] = useState('');
  const [fileName, setFileName] = useState('');
  const [parseResult, setParseResult] = useState<CsvStats | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Schedule
  const [startTime, setStartTime] = useState('');

  // Step 4: Settings
  const [delay, setDelay] = useState('0');
  const [hourlyLimit, setHourlyLimit] = useState('100');

  // Helpers
  const finalRecipients = parseResult ? parseResult.validEmails : (toField ? [toField] : []);

  const handleNext = () => {
    if (step === 1 && (!subject || !body)) {
      toast.error('Subject and Body are required.');
      return;
    }
    if (step === 2 && finalRecipients.length === 0) {
      toast.error('Please add at least one recipient.');
      return;
    }
    if (step === 3 && !startTime) {
      toast.error('Please select a start date and time.');
      return;
    }
    if (step < 5) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

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
      if (stats.valid > 0) {
        toast.success(`Found ${stats.valid} valid emails!`);
      } else {
        toast.error('No valid emails found in the file.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = async () => {
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
        className="w-full max-w-[900px] h-[700px] glass-panel rounded-3xl flex overflow-hidden relative bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 z-10" />
        
        {/* Left Sidebar - Progress Tracker */}
        <div className="w-[240px] bg-black/20 border-r border-white/5 p-8 flex flex-col relative z-10">
          <h2 className="text-xl font-black text-white mb-10 tracking-tight">Campaign Setup</h2>
          
          <div className="flex flex-col gap-6 relative">
            <div className="absolute left-[19px] top-[24px] bottom-[24px] w-0.5 bg-white/5" />
            <div 
              className="absolute left-[19px] top-[24px] w-0.5 bg-emerald-500 transition-all duration-500 ease-in-out" 
              style={{ height: `${((step - 1) / 4) * 100}%` }}
            />

            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isPast = step > s.id;
              
              return (
                <div key={s.id} className="flex items-start gap-4 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    isActive ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
                    isPast ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                    'bg-slate-800 text-slate-500 border border-white/5'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-bold ${isActive || isPast ? 'text-white' : 'text-slate-500'}`}>{s.title}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{s.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto">
             <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Cancel Setup
             </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col relative z-10">
          
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                
                {/* STEP 1: CONTENT */}
                {step === 1 && (
                  <div className="space-y-6 h-full flex flex-col">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Craft your message</h3>
                      <p className="text-slate-400 text-sm">Write a compelling subject line and email body.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                        {userEmail.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sending as</p>
                        <p className="text-sm font-bold text-white">{userEmail}</p>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">Subject Line</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Quick question about your SaaS..." 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">Email Body</label>
                        <textarea 
                          placeholder="Hey {{firstName}}, I noticed..."
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          className="w-full flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-slate-300 font-medium placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: AUDIENCE */}
                {step === 2 && (
                  <div className="space-y-6 h-full flex flex-col">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Upload your leads</h3>
                      <p className="text-slate-400 text-sm">Upload a CSV or manually enter a recipient.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 flex-1">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer flex flex-col items-center justify-center p-8 group text-center h-[280px]"
                      >
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileText className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-bold text-white mb-2">Upload CSV</p>
                        <p className="text-sm text-slate-500 font-medium px-4">Drag and drop or click to browse. Max 5MB.</p>
                        <input type="file" className="hidden" ref={fileInputRef} accept=".csv,.txt" onChange={handleFileUpload} />
                      </div>

                      <div className="flex flex-col justify-center space-y-6">
                        <div className="relative flex items-center py-2">
                          <div className="flex-grow border-t border-white/10"></div>
                          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-black uppercase tracking-widest">OR</span>
                          <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 pl-1">Single Recipient</label>
                          <input 
                            type="email" 
                            placeholder="john@example.com" 
                            value={toField}
                            onChange={(e) => {
                              setToField(e.target.value);
                              setFileName('');
                              setParseResult(null);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {fileName && parseResult && (
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            <span className="text-white font-bold">{fileName}</span>
                          </div>
                          <button onClick={() => { setFileName(''); setParseResult(null); }} className="text-xs text-slate-400 hover:text-white font-bold">REMOVE</button>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                          <span className="text-emerald-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> {parseResult.valid} Valid Emails</span>
                          <span className="text-red-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /> {parseResult.invalid} Invalid</span>
                          <span className="text-amber-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /> {parseResult.duplicates} Dupes</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: SCHEDULE */}
                {step === 3 && (
                  <div className="space-y-6 h-full flex flex-col">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">When should we send this?</h3>
                      <p className="text-slate-400 text-sm">Pick the exact time the first email should be dispatched.</p>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                        <div className="flex justify-center">
                          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Clock className="w-10 h-10" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-center text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Select Date & Time</label>
                          <input 
                            type="datetime-local" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-colors text-center text-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: SETTINGS */}
                {step === 4 && (
                  <div className="space-y-6 h-full flex flex-col">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Deliverability Settings</h3>
                      <p className="text-slate-400 text-sm">Protect your sender reputation by throttling the campaign.</p>
                    </div>

                    <div className="flex-1 flex flex-col gap-6 pt-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-1">Delay Between Emails (Seconds)</h4>
                          <p className="text-slate-400 text-sm mb-4">We recommend at least 30-60 seconds to mimic human sending.</p>
                          <input 
                            type="number" 
                            value={delay}
                            onChange={(e) => setDelay(e.target.value)}
                            min="0"
                            className="w-32 bg-slate-900 border border-white/10 rounded-xl p-3 text-white font-bold text-center focus:outline-none focus:border-emerald-500/50 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                          <Settings className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-1">Max Emails Per Hour</h4>
                          <p className="text-slate-400 text-sm mb-4">Hard limit on how many emails can be sent per hour across all campaigns.</p>
                          <input 
                            type="number" 
                            value={hourlyLimit}
                            onChange={(e) => setHourlyLimit(e.target.value)}
                            min="1"
                            className="w-32 bg-slate-900 border border-white/10 rounded-xl p-3 text-white font-bold text-center focus:outline-none focus:border-emerald-500/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW */}
                {step === 5 && (
                  <div className="space-y-6 h-full flex flex-col">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Review & Confirm</h3>
                      <p className="text-slate-400 text-sm">Please verify the campaign parameters before launching.</p>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Subject</p>
                          <p className="text-white font-bold">{subject}</p>
                        </div>
                        <button onClick={() => setStep(1)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300">Edit</button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Audience</p>
                            <p className="text-white font-bold">{finalRecipients.length} Recipients</p>
                          </div>
                          <button onClick={() => setStep(2)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300">Edit</button>
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Start Time</p>
                            <p className="text-white font-bold">{new Date(startTime).toLocaleString()}</p>
                          </div>
                          <button onClick={() => setStep(3)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300">Edit</button>
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Settings</p>
                          <p className="text-white font-bold">{delay}s delay • {hourlyLimit}/hr limit</p>
                        </div>
                        <button onClick={() => setStep(4)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300">Edit</button>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mt-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-emerald-400 mb-1">Ready to launch</p>
                            <p className="text-xs text-emerald-500/80 font-medium">Clicking Launch Campaign will queue the emails and begin sending at the scheduled time.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Nav */}
          <div className="h-[88px] border-t border-white/10 bg-white/5 flex items-center justify-between px-10 flex-shrink-0 z-20">
            <button 
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className={`font-bold text-sm transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white'}`}
            >
              Back
            </button>

            {step < 5 ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-xl font-bold transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:grayscale"
              >
                {isSubmitting ? 'Launching...' : 'Launch Campaign'}
                <Send className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
