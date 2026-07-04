import React from 'react';
import { User, LogOut, Shield, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AccountDetails() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/#/login';
  };

  return (
    <main className="pt-24 px-6 pb-12 max-w-3xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Account Details</h1>
          <p className="text-sm text-slate-400 mt-1">View your current user profile and session status.</p>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="px-4 py-2 text-xs font-mono uppercase font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-sm text-slate-300 transition-colors"
        >
          Back to Home
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-sm space-y-8">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 bg-red-600/20 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Current User</h2>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Active Session</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm">
            <span className="text-slate-500 block text-xs uppercase font-mono tracking-wider mb-1">Username</span>
            <span className="text-white font-medium text-base">admin</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm">
            <span className="text-slate-500 block text-xs uppercase font-mono tracking-wider mb-1">Role</span>
            <span className="text-white font-medium text-base">Authenticated User</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm">
            <span className="text-slate-500 block text-xs uppercase font-mono tracking-wider mb-1">Status</span>
            <span className="text-emerald-400 font-mono text-sm">Logged In</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm">
            <span className="text-slate-500 block text-xs uppercase font-mono tracking-wider mb-1">Access Method</span>
            <span className="text-slate-300 font-mono text-sm">Standard Login</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-mono uppercase font-bold text-red-400 bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/60 rounded-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>
      </div>
    </main>
  );
}
