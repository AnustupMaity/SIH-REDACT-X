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
      description: 'Redact sensitive information from text input',
      path: '/text-redaction',
    },
    {
      icon: FileUp,
      title: 'File Redaction',
      description: 'Redact sensitive information from any document of any extension',
      path: '/pdf-redaction',
    },
    {
      icon: Clock,
      title: 'History',
      description: 'View your last 25 redaction operations',
      path: '/history',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/#/login';
  };

  return (
    <main className="pt-24 px-4 pb-12 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Choose Redaction Type</h2>
          <p className="text-xs text-slate-400 mt-1">Select an option below to begin sanitizing sensitive data</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase font-bold text-red-400 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/60 rounded-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
