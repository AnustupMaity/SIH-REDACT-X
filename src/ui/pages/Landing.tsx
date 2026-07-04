import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Cpu, FileText, FileUp, Activity, 
  ArrowRight, CheckCircle2, Layers, ShieldAlert, Key
} from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  const [demoStep, setDemoStep] = useState(0);

  const demoStreams = [
    { raw: "Employee: Rajesh Sharma | PAN: ABCDE1234F | Salary: Rs. 18,50,000", redacted: "Employee: [PERSON_1] | PAN: [PAN_CARD_1] | Salary: [AMOUNT_1]", mode: "Synthetic Replacement" },
    { raw: "Patient: Sarah Jenkins | ID: 987-65-4321 | Diagnosis: Arrhythmia", redacted: "Patient: [XXXXX] | ID: [XXX-XX-XXXX] | Diagnosis: [MEDICAL_RECORD]", mode: "Standard Masking" },
    { raw: "Transaction: TXN-889922 to Microsoft Corp | Amount: $150,000 USD", redacted: "Transaction: [TXN_ID] to [ORG_1] | Amount: [CURRENCY_VAL]", mode: "Entity Recognition" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % demoStreams.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentStream = demoStreams[demoStep];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-600 selection:text-white relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-red-600/10 via-red-900/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-sm text-white shadow-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              RE-DACT
            </span>
            <span className="block text-[10px] text-slate-400 font-sans">
              Data Anonymization Tool
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold transition-all"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-medium">
          <Activity className="w-3.5 h-3.5 text-red-500" />
          <span>Automated PII Redaction & Anonymization Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Professional <span className="text-red-500">Data Redaction</span> & Synthetic Anonymization
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-sans">
          Safely remove sensitive identifiers, names, Aadhaar numbers, PAN cards, financial records, and confidential data from text, scanned documents, spreadsheets, and images.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-mono">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-sm bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wide shadow-lg transition-all flex items-center gap-2 group"
          >
            <span>Login to Application</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-bold uppercase tracking-wide border border-slate-800 transition-all flex items-center gap-2"
          >
            <Key className="w-4 h-4 text-slate-400" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Live Interactive Demo Box */}
        <div className="mt-14 max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-sm p-6 shadow-2xl text-left font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-2 text-xs text-slate-400 font-bold">
                Live Redaction Preview
              </span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-sm bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
              {currentStream.mode}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Original Input
              </div>
              <div className="text-slate-300 font-medium pt-1 leading-relaxed">
                {currentStream.raw}
              </div>
            </div>

            <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Redacted Output
              </div>
              <div className="text-emerald-400 font-medium pt-1 leading-relaxed">
                {currentStream.redacted}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
            CORE FEATURES
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Reliable Data Protection Tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-sm bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg">
            <div className="p-3 rounded-sm bg-slate-950 border border-slate-800 w-fit text-red-500">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Entity Recognition Pipeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Combines pattern recognition rules with statistical models to identify standard and complex personal identifiers in structured and unstructured text.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg">
            <div className="p-3 rounded-sm bg-slate-950 border border-slate-800 w-fit text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Synthetic Anonymization</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Optionally replace sensitive names, identification numbers, and financial details with realistic dummy replacements to maintain document readability and format.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg">
            <div className="p-3 rounded-sm bg-slate-950 border border-slate-800 w-fit text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Format Document OCR</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Process PDF files, Excel spreadsheets (.xlsx), Word documents (.docx), and scanned images (.png, .jpg) directly on your machine without external dependencies.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950 px-6 py-8 text-center font-mono text-xs text-slate-500 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
          <span>Zero Retention Processing</span>
          <span>&bull;</span>
          <span>Offline OCR Engine</span>
          <span>&bull;</span>
          <span>SQLite Audit Trail</span>
        </div>
        <div className="text-[11px] text-slate-500 font-sans">
          RE-DACT &bull; Secure Anonymization Tool
        </div>
      </footer>
    </div>
  );
}
