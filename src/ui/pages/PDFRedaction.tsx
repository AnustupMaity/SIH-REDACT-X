import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Cpu, Shield, Zap, Sparkles } from 'lucide-react';
import { Progress } from '../components/Progress';
import { Slider } from '../components/Slider';
import { BackButton } from '../components/BackButton';
import { cn } from '../lib/utils';
import { endpoints } from '../lib/api';

const LEVEL_DESCRIPTIONS = [
  { title: "Level 0: Pass-Through / Convert", desc: "No redaction applied. Converts document structure or image format cleanly.", badge: "Neutral", color: "text-gray-500" },
  { title: "Level 1: Ultra-Fast Regex Rules", desc: "Instantly masks structured identifiers: Emails, Phone numbers, Dates, Credit Cards, Aadhaar & PAN.", badge: "Regex Fast", color: "text-blue-500" },
  { title: "Level 2: Lightweight AI NER", desc: "Uses spaCy statistical NER model to identify names, locations, and organizations with low latency.", badge: "spaCy Small", color: "text-indigo-500" },
  { title: "Level 3: Enhanced AI NER", desc: "High-precision multi-word entity detection using spaCy medium statistical NLP pipeline.", badge: "spaCy Medium", color: "text-violet-500" },
  { title: "Level 4: Advanced Domain NER", desc: "Broad semantic masking using best-in-class spaCy domain-specific pipeline.", badge: "spaCy Best", color: "text-purple-500" },
  { title: "Level 5: Deep Learning Transformer", desc: "State-of-the-art neural network (BERT / RoBERTa) fine-tuned on complex Indian & Global PII datasets.", badge: "BERT / RoBERTa AI", color: "text-fuchsia-600 font-bold animate-pulse" },
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
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("redaction_level", currentLevel.toString());

    try {
      const response = await fetch(endpoints.redactFile, {
        method: "POST",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 sm:p-6 transition-colors">
      <div className="mt-20 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-sm text-xs font-semibold text-gray-700 dark:text-gray-300">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>Multi-Format AI Sanitizer</span>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800/80 shadow-2xl space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
                <Shield className="w-6 h-6" />
              </span>
              Multi-Format Document Redaction
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sanitize PDF documents, Excel sheets, Word files, PowerPoint presentations, Images, and Logs using AI.
            </p>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-3xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer group",
              isDragging
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]"
                : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50/50 dark:bg-gray-800/20"
            )}
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <label className="cursor-pointer">
              <span className="text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Click to browse files
              </span>
              <span className="text-gray-600 dark:text-gray-400 font-medium"> or drag & drop here</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.txt,.doc,.docx,.pptx,.csv,.xlsx,.xls,.log,.jpg,.jpeg,.png"
              />
            </label>
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {['PDF', 'DOCX', 'XLSX', 'PPTX', 'CSV', 'TXT', 'LOG', 'PNG', 'JPG'].map((fmt) => (
                <span key={fmt} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300">
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          {file && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
              {/* File Info & Upload Progress */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-md">{file.name}</h4>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Remove File
                  </button>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>File Readiness</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </div>

              {/* Redaction Level Slider */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-blue-500/10 dark:border-blue-400/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                      Redaction Scale & Engine
                    </span>
                    <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border", levelInfo.color)}>
                      {levelInfo.badge}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
                    Selected: Level {currentLevel} of 5
                  </span>
                </div>

                <Slider value={redactionLevel} onValueChange={setRedactionLevel} className="w-full" />

                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-gray-950/90 border border-gray-200/60 dark:border-gray-800/60 flex items-start gap-3 shadow-sm">
                  <Zap className={cn("w-5 h-5 shrink-0 mt-0.5", levelInfo.color)} />
                  <div>
                    <h4 className={cn("text-sm font-bold", levelInfo.color)}>{levelInfo.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{levelInfo.desc}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200/60 dark:border-gray-800/60">
                <button
                  onClick={handleRedact}
                  disabled={isProcessing || progress < 100}
                  className={cn(
                    "px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center gap-2.5",
                    isProcessing || progress < 100
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:scale-105 shadow-purple-500/25"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sanitizing Document with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Execute Document Redaction (Level {currentLevel})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}