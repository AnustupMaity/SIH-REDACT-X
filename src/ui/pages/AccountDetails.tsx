import React from 'react';
import { User, Shield, Key, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AccountDetails() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <main className="pt-24 px-6 pb-12 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Account Details</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your operator credentials and security preferences.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-sm text-gray-300 transition-colors"
        >
          Back to Home
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gray-900 border border-gray-800 p-6 rounded-sm flex flex-col items-center text-center h-fit">
          <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-500 mb-4">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-white">Administrator</h2>
          <p className="text-xs font-mono text-emerald-400 mt-1">Level 5 Clearance</p>
          <div className="w-full pt-4 mt-6 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 rounded-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-sm space-y-4">
            <h3 className="text-base font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Security Profile
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs uppercase font-mono">Username</span>
                <span className="text-gray-200 font-medium">admin</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase font-mono">Role</span>
                <span className="text-gray-200 font-medium">System Operator</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase font-mono">Session Encryption</span>
                <span className="text-emerald-400 font-mono text-xs">AES-256-GCM (Active)</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase font-mono">Data Retention</span>
                <span className="text-blue-400 font-mono text-xs">Zero Retention Protocol</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-sm space-y-4">
            <h3 className="text-base font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" />
              API & Model Configuration
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your account is authorized to execute offline Tesseract OCR, Poppler document conversion, and both spaCy and RoBERTa NLP models across all 5 gradational redaction tiers, including Synthetic Name Generation.
            </p>
            <div className="flex justify-between items-center pt-2 text-xs text-gray-500 font-mono border-t border-gray-800">
              <span>Token Status: Valid</span>
              <span>Expires: Never (Local Storage)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
