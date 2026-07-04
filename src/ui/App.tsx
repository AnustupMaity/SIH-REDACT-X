import React, { useState, Suspense } from 'react';
import { HashRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import {
  FileText, FileUp, Clock, LogOut, Loader2, AlertTriangle, CheckCircle2,
  Shield, Activity, Lock, Terminal, ArrowRight, ChevronRight, Server, Database, ShieldAlert, Play
} from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RedactionCard } from './components/RedactionCard';
import { useThemeStore } from './store/theme';

// Lazy loading components for code splitting & bundle reduction
const TextRedaction = React.lazy(() => import('./pages/TextRedaction').then(m => ({ default: m.TextRedaction })));
const PDFRedaction = React.lazy(() => import('./pages/PDFRedaction').then(m => ({ default: m.PDFRedaction })));
const History = React.lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const AccountDetails = React.lazy(() => import('./pages/AccountDetails').then(m => ({ default: m.AccountDetails })));
const HowToUse = React.lazy(() => import('./pages/HowToUse').then(m => ({ default: m.HowToUse })));
const AboutUs = React.lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const ContactUs = React.lazy(() => import('./pages/ContactUs').then(m => ({ default: m.ContactUs })));
const RegisterPage = React.lazy(() => import('./pages/Register'));
const LoginPage = React.lazy(() => import('./pages/Login'));
const LandingPage = React.lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));

function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 font-sans">
      <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-3" />
      <p className="text-sm font-mono tracking-wider uppercase">Loading Module...</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/landing" replace />;
  }
  return children;
}

function Home() {
  const navigate = useNavigate();
  const redactionOptions = [
    {
      icon: FileText,
      title: 'Text Redaction',
      description: 'Obfuscate PII, Indian numbers, names, and custom confidential text in real-time.',
      path: '/text-redaction',
    },
    {
      icon: FileUp,
      title: 'File Redaction',
      description: 'Sanitize PDF documents, Word files, Excel spreadsheets, and scanned images offline.',
      path: '/pdf-redaction',
    },
    {
      icon: Clock,
      title: 'History',
      description: 'Review your recent redaction logs and processed files stored in local memory.',
      path: '/history',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/#/login';
  };

  return (
    <main className="pt-24 px-6 pb-16 max-w-6xl mx-auto font-sans relative overflow-hidden">
      {/* Dynamic Ambient Background Animations */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-red-600/15 via-red-900/10 to-blue-600/10 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-red-500/10 rounded-full blur-2xl pointer-events-none -z-10 animate-bounce duration-1000" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none -z-20" />

      {/* Hero Welcome Banner */}
      <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-md p-8 rounded-sm mb-10 shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Shield className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Security Console Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">
              Welcome to <span className="text-red-500 underline decoration-red-600/50 underline-offset-4">RE-DACT</span> Studio
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Your localized workspace for stripping sensitive personal identifiers, Indian regulatory numbers, and financial data using advanced offline NLP and synthetic anonymization.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase font-bold text-red-400 bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/60 rounded-sm transition-all shrink-0 shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>

        {/* Live Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 font-mono text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold">100% Offline AI</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>2.14 Lakh Trained Corpus</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Lock className="w-4 h-4 text-red-400 shrink-0" />
            <span>Zero Data Retention</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>5 Redaction Levels</span>
          </div>
        </div>
      </div>

      {/* Module Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-lg font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-red-500" />
            Select Sanitization Module
          </h2>
          <span className="text-xs text-slate-500 font-mono">Choose a module to launch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {redactionOptions.map((option) => (
            <RedactionCard
              key={option.title}
              icon={option.icon}
              title={option.title}
              description={option.description}
              onClick={() => navigate(option.path)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useThemeStore();

  return (
    <HashRouter>
      <div className={theme}>
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-red-600 selection:text-white font-sans">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <>
                      <Header onMenuClick={() => setIsSidebarOpen(true)} />
                      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                      <Home />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route
                path="/text-redaction"
                element={
                  <ProtectedRoute>
                    <>
                      <Header onMenuClick={() => setIsSidebarOpen(true)} />
                      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                      <TextRedaction />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pdf-redaction"
                element={
                  <ProtectedRoute>
                    <>
                      <Header onMenuClick={() => setIsSidebarOpen(true)} />
                      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                      <PDFRedaction />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <>
                      <Header onMenuClick={() => setIsSidebarOpen(true)} />
                      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                      <History />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account-details"
                element={
                  <ProtectedRoute>
                    <>
                      <Header onMenuClick={() => setIsSidebarOpen(true)} />
                      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                      <AccountDetails />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/how-to-use"
                element={
                  <ProtectedRoute>
                    <>
                      <Header onMenuClick={() => setIsSidebarOpen(true)} />
                      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                      <HowToUse />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/about-us"
                element={
                  <ProtectedRoute>
                    <>
                      <Header onMenuClick={() => setIsSidebarOpen(true)} />
                      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                      <AboutUs />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contact-us"
                element={
                  <ProtectedRoute>
                    <>
                      <Header onMenuClick={() => setIsSidebarOpen(true)} />
                      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                      <ContactUs />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
