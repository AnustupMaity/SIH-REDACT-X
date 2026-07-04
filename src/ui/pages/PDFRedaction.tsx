import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Cpu, Shield, Zap, Sparkles, AlertTriangle, Terminal, Play } from 'lucide-react';
import { Progress } from '../components/Progress';
import { Slider } from '../components/Slider';
import { BackButton } from '../components/BackButton';
import { cn } from '../lib/utils';
import { endpoints, getAuthHeaders } from '../lib/api';

const LEVEL_DESCRIPTIONS = [
  { title: "Level 0: Pass-Through / Convert", desc: "No redaction applied. Converts document structure or image format cleanly.", badge: "Neutral", color: "text-slate-400" },
  { title: "Level 1: Ultra-Fast Regex Rules", desc: "Instantly masks structured identifiers: Emails, Phone numbers, Dates, Credit Cards, Aadhaar & PAN.", badge: "Regex Fast", color: "text-blue-400" },
  { title: "Level 2: Lightweight AI NER", desc: "Uses spaCy statistical NER model to identify names, locations, and organizations with low latency.", badge: "spaCy Small", color: "text-indigo-400" },
  { title: "Level 3: Enhanced AI NER", desc: "High-precision multi-word entity detection using spaCy medium statistical NLP pipeline.", badge: "spaCy Medium", color: "text-blue-400" },
  { title: "Level 4: Advanced Domain NER", desc: "Broad semantic masking using best-in-class spaCy domain-specific pipeline.", badge: "spaCy Best", color: "text-purple-400" },
  { title: "Level 5: Deep Learning Transformer", desc: "State-of-the-art neural network (BERT / RoBERTa) fine-tuned on complex Indian & Global PII datasets.", badge: "BERT / RoBERTa AI", color: "text-red-400 font-bold" },
];

export function PDFRedaction() {
  const [file, setFile] = useState<File | null>(null);
  const [redactionLevel, setRedactionLevel] = useState([2]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const currentLevel = redactionLevel[0];
  const levelInfo = LEVEL_DESCRIPTIONS[currentLevel] || LEVEL_DESCRIPTIONS[0];

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRedact = async () => {
    if (isProcessing || !file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("redaction_level", currentLevel.toString());
    formData.append("mode", "mask");

    try {
      const response = await fetch(endpoints.redactFile, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `redactx_${file.name}`;
        link.click();
      } else {
        const err = await response.json().catch(() => ({ detail: "Unknown server error" }));
        alert(`Redaction failed: ${err.detail || 'Server rejected file processing'}`);
      }
    } catch (error) {
      console.error("Error redacting file:", error);
      alert("Error communicating with RE-DACT backend server. Ensure backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="pt-20 px-4 sm:px-6 pb-12 max-w-[1600px] mx-auto font-sans text-slate-200">
      
      {/* Top SOC Critical Alert Banner */}
      <div className="bg-red-700 text-white px-4 py-3 rounded-sm flex flex-wrap items-center justify-between text-xs font-mono font-bold tracking-wider uppercase mb-6 shadow-xl border border-red-600">
        <div className="flex items-center gap-3">
          <span className="p-1 bg-red-900/80 rounded-sm border border-red-400 text-red-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
          </span>
          <span className="text-sm font-black tracking-widest text-white">DOCUMENT OCR SANITIZER</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <span className="bg-red-950/90 px-2.5 py-1 rounded-sm border border-red-500/50 text-white">
            Escalation: <strong className="text-red-200">Level {currentLevel}</strong>
          </span>
          <span className="hidden md:inline font-bold">Offline Tesseract OCR: ACTIVE</span>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide font-mono">
              <Terminal className="w-5 h-5 text-red-500" />
              Document & Image OCR Redaction
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Sanitize PDF documents, Excel sheets, Word files, PowerPoint presentations, Images, and Logs using offline AI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-sm text-xs font-semibold text-slate-300 font-mono">
          <Cpu className="w-3.5 h-3.5 text-red-500" />
          <span>MULTI-FORMAT OCR ENGINE</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-sm space-y-6 shadow-xl">
        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "border border-dashed rounded-sm p-10 transition-all flex flex-col items-center justify-center text-center cursor-pointer group font-mono",
            isDragging
              ? "border-red-500 bg-red-950/20"
              : "border-slate-800 hover:border-slate-700 bg-slate-950"
          )}
        >
          <div className="p-3 rounded-sm bg-slate-900 border border-slate-800 text-red-500 mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <label className="cursor-pointer">
            <span className="text-sm font-bold text-white hover:text-red-400 transition-colors uppercase tracking-wider">
              Click to browse document files
            </span>
            <span className="text-slate-400 text-xs block mt-1"> or drag & drop confidential files here</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.txt,.doc,.docx,.pptx,.csv,.xlsx,.xls,.log,.jpg,.jpeg,.png"
            />
          </label>
          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            {['PDF', 'DOCX', 'XLSX', 'PPTX', 'CSV', 'TXT', 'LOG', 'PNG', 'JPG'].map((fmt) => (
              <span key={fmt} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm bg-slate-900 border border-slate-800 text-slate-400">
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {file && (
          <div className="space-y-6 pt-2 font-mono">
            {/* File Info & Upload Progress */}
            <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-md">{file.name}</h4>
                    <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 px-2.5 py-1 rounded-sm bg-slate-900 border border-slate-800 transition-colors uppercase tracking-wider"
                >
                  Remove File
                </button>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>File Readiness</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </div>

            {/* Redaction Level Slider */}
            <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Redaction Scale
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-sm bg-slate-900 border border-slate-800 text-red-400 font-bold">
                    {levelInfo.badge}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  Level {currentLevel} of 5
                </span>
              </div>

              <Slider value={redactionLevel} onValueChange={setRedactionLevel} className="w-full" />

              <div className="p-3 rounded-sm bg-slate-900 border border-slate-800 flex items-start gap-3">
                <Zap className={cn("w-4 h-4 shrink-0 mt-0.5", levelInfo.color)} />
                <div>
                  <h4 className={cn("text-xs font-bold", levelInfo.color)}>{levelInfo.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-sans">{levelInfo.desc}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-4 border-t border-slate-800 font-mono">
              <button
                onClick={handleRedact}
                disabled={isProcessing || progress < 100}
                className="px-6 py-2.5 rounded-sm font-bold text-xs text-white transition-all bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:bg-slate-800 flex items-center gap-2 shadow-lg shadow-red-600/20 uppercase tracking-wider"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Redaction (Level {currentLevel})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}