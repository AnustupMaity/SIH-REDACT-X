import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus, ArrowLeft, AlertTriangle } from 'lucide-react';
import { endpoints } from '../lib/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  interface FormErrors {
    firstName?: string;
    lastName?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim() || formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch(endpoints.register, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            username: formData.username.trim(),
            password: formData.password,
            confirm_password: formData.confirmPassword,
            security_question: "None",
            security_answer: "None",
          }),
        });

        if (response.ok) {
          navigate("/login");
        } else {
          const data = await response.json();
          if (data.detail === "Username already exists") {
            setErrors({
              username: "Username already taken, please choose a different one.",
            });
          } else {
            setErrors({
              general: "An unexpected error occurred during registration.",
            });
          }
        }
      } catch (error) {
        setErrors({
          general: "Unable to connect to the server. Please try again later.",
        });
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans p-6 relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-red-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">
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

        {/* Register Box */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-xl relative">
          <div className="mb-6 pb-3 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Register New User</h2>
              <p className="text-xs text-slate-400 mt-0.5">Create a new operator account</p>
            </div>
            <UserPlus className="w-5 h-5 text-red-500" />
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-sm text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1 font-sans">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                />
                {errors.firstName && <p className="text-red-400 mt-1 font-sans">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1 font-sans">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                />
                {errors.lastName && <p className="text-red-400 mt-1 font-sans">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1 font-sans">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
              {errors.username && <p className="text-red-400 mt-1 font-sans">{errors.username}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1 font-sans">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                />
                {errors.password && <p className="text-red-400 mt-1 font-sans">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1 font-sans">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                />
                {errors.confirmPassword && <p className="text-red-400 mt-1 font-sans">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm transition-colors mt-4 uppercase tracking-wide"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center font-sans">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white mx-auto transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
