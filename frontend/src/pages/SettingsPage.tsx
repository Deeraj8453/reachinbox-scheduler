import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Plus, Mail, Shield, Zap, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import toast from 'react-hot-toast';

interface Sender {
  id: string;
  email: string;
  displayName: string;
  hourlyLimit: number;
  isActive: boolean;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();


  const { data: senders, isLoading } = useQuery({
    queryKey: ['senders'],
    queryFn: async () => {
      const res = await api.get('/senders');
      return res.data.data as Sender[];
    }
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      await api.put(`/senders/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senders'] });
      toast.success('Sender status updated');
    }
  });

  const deleteSender = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/senders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senders'] });
      toast.success('Sender deleted');
    }
  });

  const createSender = useMutation({
    mutationFn: async (data: { email: string, displayName: string, hourlyLimit: number }) => {
      await api.post('/senders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senders'] });
      toast.success('Sender added successfully!');
    }
  });

  const handleAddSender = () => {
    const email = prompt('Enter sender email address:');
    if (!email) return;
    const displayName = prompt('Enter display name:') || email.split('@')[0];
    const hourlyLimit = parseInt(prompt('Enter hourly limit:') || '100');
    
    createSender.mutate({ email, displayName, hourlyLimit });
  };

  return (
    <div className="flex h-screen mesh-bg overflow-hidden font-sans">
      <Sidebar 
        onCompose={() => navigate('/dashboard')}
        activeTab={undefined}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className="h-[88px] flex items-center px-10 border-b border-white/5 flex-shrink-0 bg-white/[0.02]">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide">
            <Settings className="w-6 h-6 text-emerald-400" />
            Platform Settings
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="max-w-[1000px] mx-auto space-y-10">
            
            {/* Senders Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Sender Profiles</h3>
                  <p className="text-sm text-slate-400 font-medium">Manage your connected email accounts and throttle limits.</p>
                </div>
                <button 
                  onClick={handleAddSender}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Sender
                </button>
              </div>

              <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20">
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 w-[30%]">Account</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Hourly Limit</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-500 font-medium">Loading senders...</td>
                      </tr>
                    ) : senders?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-500 font-medium">No sender profiles found.</td>
                      </tr>
                    ) : (
                      senders?.map((sender) => (
                        <tr key={sender.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Mail className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{sender.displayName}</p>
                                <p className="text-xs font-medium text-slate-400">{sender.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-white">
                              <Zap className="w-3 h-3 text-amber-400" />
                              {sender.hourlyLimit} / hr
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button 
                              onClick={() => toggleStatus.mutate({ id: sender.id, isActive: !sender.isActive })}
                              className={`flex items-center gap-2 text-sm font-bold transition-colors ${sender.isActive ? 'text-emerald-400' : 'text-slate-500'}`}
                            >
                              {sender.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                              {sender.isActive ? 'Active' : 'Paused'}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this sender?')) {
                                  deleteSender.mutate(sender.id);
                                }
                              }}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Global Rules Section */}
            <section>
               <h3 className="text-xl font-bold text-white mb-6">Global Rules</h3>
               <div className="grid grid-cols-2 gap-6">
                 <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Idempotency Locks</h4>
                    <p className="text-sm text-slate-400 font-medium mb-4">Prevents accidental duplicate sends during network retries or Redis failovers.</p>
                    <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded border border-emerald-500/30">Active globally</span>
                 </div>
                 <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">BullMQ Concurrency</h4>
                    <p className="text-sm text-slate-400 font-medium mb-4">Background workers currently processing email jobs with defined concurrency.</p>
                    <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest rounded border border-purple-500/30">Workers: 5</span>
                 </div>
               </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
