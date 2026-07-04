import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, AlertTriangle } from 'lucide-react';
import { endpoints } from '../lib/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  interface FormErrors {
    username?: string;
    password?: string;
    general?: string;
  }

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch(endpoints.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username.trim(),
            password: formData.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            navigate('/');
          }
        } else {
          setErrors({ general: 'Invalid username or password.' });
        }
      } catch (error) {
        setErrors({ general: 'Unable to connect to the authentication server.' });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans p-6 relative overflow-hidden">
      
      {/* Dark Subtle Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-red-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Logo */}
        <div 
          onClick={() => navigate('/landing')}
          className="flex items-center justify-center gap-3 mb-8 cursor-pointer group"
        >
          <div className="p-2.5 bg-red-600 rounded-sm text-white shadow-lg group-hover:bg-red-700 transition-colors">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              RE-DACT
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Secure Anonymization Tool
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-xl relative">
          <div className="mb-6 pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">User Login</h2>
            <p className="text-xs text-slate-400 mt-0.5">Enter your credentials to access the redaction suite</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-sm text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-medium mb-1 font-sans">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-9 p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              {errors.username && <p className="text-red-400 mt-1 font-sans">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1 font-sans">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              {errors.password && <p className="text-red-400 mt-1 font-sans">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm transition-colors mt-2 uppercase tracking-wide font-mono"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>

            <div className="flex justify-center items-center pt-4 border-t border-slate-800 mt-4 text-xs font-sans">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-red-400 hover:text-red-300 transition-colors font-medium flex items-center gap-1"
              >
                <span>Register New User</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
