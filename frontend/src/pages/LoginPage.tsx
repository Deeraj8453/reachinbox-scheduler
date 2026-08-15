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
    <div className="min-h-screen w-full bg-[#FAFAFA] flex items-center justify-center font-sans">
      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100 p-10 mx-4">
        
        <h2 className="text-[32px] font-bold text-center text-[#1A1A1A] mb-8">Login</h2>

        <div className="flex justify-center mb-6 relative z-10 w-full overflow-hidden h-12 rounded-lg bg-[#F0FDF4] hover:bg-[#DCFCE7] transition-colors border border-[#86EFAC]/30">
          <div className="w-full h-full flex items-center justify-center opacity-0 absolute inset-0 z-20">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => toast.error('Google login failed')}
            />
          </div>
          <div className="w-full h-full flex items-center justify-center gap-2 pointer-events-none text-[#166534] font-medium z-10">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Login with Google</span>
          </div>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="mx-4 text-slate-400 text-sm font-medium">or sign up through email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email ID" 
              className="w-full h-12 bg-[#F8FAFC] border-none rounded-lg px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-figma-green transition-shadow"
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full h-12 bg-[#F8FAFC] border-none rounded-lg px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-figma-green transition-shadow"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <button 
            onClick={handleDemoLogin}
            className="w-full py-2.5 border-2 border-[#0BA053] text-[#0BA053] hover:bg-[#E6F6ED] font-bold rounded-xl transition-colors"
          >
            Quick Demo Access (Bypass Login)
          </button>
          <p className="text-xs text-center text-slate-500 mt-2">
            Click this to view the dashboard without a Google Client ID.
          </p>
        </div>

      </div>
    </div>
  );
}
