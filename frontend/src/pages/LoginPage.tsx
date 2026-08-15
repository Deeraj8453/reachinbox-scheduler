import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const { data } = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        toast.success('Successfully logged in!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Authentication failed');
      console.error(error);
    }
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.error('Email login is disabled for this assignment. Please use Google Login.');
  };

  const handleDemoLogin = () => {
    localStorage.setItem('token', 'demo_token');
    localStorage.setItem('user', JSON.stringify({
      id: 'demo-id',
      email: 'reviewer@reachinbox.ai',
      name: 'Reviewer',
      picture: 'https://ui-avatars.com/api/?name=Reviewer&background=0BA053&color=fff'
    }));
    toast.success('Bypassed login for Demo purposes');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full mesh-bg flex font-sans overflow-hidden">
      
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative z-10 border-r border-white/10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">ReachInbox<span className="text-emerald-400">.ai</span></h1>
          <p className="mt-6 text-xl text-slate-300 font-light max-w-md leading-relaxed">
            The next generation of AI-driven cold email outreach. Scale your revenue with hyper-personalized automation.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-slate-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-medium text-lg">Send millions of emails instantly</p>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="font-medium text-lg">Bank-grade rate limit protection</p>
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[440px] glass-panel rounded-3xl p-10">
          
          <h2 className="text-3xl font-bold text-center text-white mb-8">Welcome Back</h2>

          <div className="flex justify-center mb-8 relative w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
            <div className="w-full h-full flex items-center justify-center opacity-0 absolute inset-0 z-20 cursor-pointer">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => toast.error('Google login failed')}
              />
            </div>
            <div className="w-full h-full flex items-center justify-center gap-3 pointer-events-none text-white font-medium z-10">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.56 0 2.96.54 4.06 1.58l3.04-3.04C17.3 2.19 14.88 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </div>
          </div>

          <div className="relative flex items-center py-5 mb-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-white/40 text-sm font-medium">or login with email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full h-12 glass-input rounded-xl px-4"
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full h-12 glass-input rounded-xl px-4"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-3 mt-4 glass-button rounded-xl"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <button 
              onClick={handleDemoLogin}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
            >
              Demo Access (Bypass)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
