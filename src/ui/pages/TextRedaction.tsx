import React, { useState } from 'react';
import { Download, Zap, CheckCircle2, AlertCircle, RefreshCw, FileText, Layers, AlertTriangle, Terminal, Play } from 'lucide-react';
import { Slider } from '../components/Slider';
import { BackButton } from '../components/BackButton';
import { cn } from '../lib/utils';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { endpoints, getAuthHeaders } from '../lib/api';

const LEVEL_DESCRIPTIONS = [
  { title: "Level 0: Pass-Through", desc: "No redaction applied. Useful for formatting or conversion testing.", badge: "Neutral", color: "text-slate-400" },
  { title: "Level 1: Ultra-Fast Regex Rules", desc: "Instantly masks structured PII: Emails, Phone numbers, Dates, Credit Cards, Aadhaar & PAN numbers.", badge: "Regex Fast", color: "text-blue-400" },
  { title: "Level 2: Lightweight AI NER", desc: "Uses spaCy statistical NER model to identify names, locations, and organizations with low latency.", badge: "spaCy Small", color: "text-indigo-400" },
  { title: "Level 3: Enhanced AI NER", desc: "High-precision multi-word entity detection using spaCy medium statistical NLP pipeline.", badge: "spaCy Medium", color: "text-blue-400" },
  { title: "Level 4: Advanced Domain NER", desc: "Broad semantic masking using best-in-class spaCy domain-specific pipeline.", badge: "spaCy Best", color: "text-purple-400" },
  { title: "Level 5: Deep Learning Transformer", desc: "State-of-the-art neural network (BERT / RoBERTa) fine-tuned on complex Indian & Global PII datasets.", badge: "BERT / RoBERTa AI", color: "text-red-400 font-bold" },
];

export function TextRedaction() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [redactionLevel, setRedactionLevel] = useState([2]);
  const [mode, setMode] = useState<'mask' | 'synthetic'>('mask');
  const [isLoading, setIsLoading] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<'initial' | 'correction'>('initial');
  const [missedInput, setMissedInput] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  const currentLevel = redactionLevel[0];
  const levelInfo = LEVEL_DESCRIPTIONS[currentLevel] || LEVEL_DESCRIPTIONS[0];

  const handleFeedback = async (satisfaction: string) => {
    if (satisfaction === 'yes') {
      try {
        await fetch(endpoints.feedback, {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            text: inputText,
            redacted_text: outputText,
            satisfaction: 'yes',
            redaction_level: currentLevel,
          }),
        });
      } catch (e) {
        console.error(e);
      }
      alert('Thank you! Your positive feedback reinforces our model accuracy.');
      setShowFeedbackModal(false);
    } else {
      setFeedbackMode('correction');
    }
  };

  const handleCorrectionSubmit = async () => {
    if (isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    try {
      const missedList = missedInput.split(',').map((s) => s.trim()).filter(Boolean);
      await fetch(endpoints.feedback, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          text: inputText,
          redacted_text: outputText,
          satisfaction: 'no',
          missed_entities: missedList,
          corrected_text: missedInput,
          redaction_level: currentLevel,
        }),
      });
      alert('🎯 Correction ingested into Active Learning loop! Our AI training dataset has been automatically updated.');
    } catch (e) {
      console.error(e);
      alert('Error submitting feedback to server.');
    } finally {
      setIsSubmittingFeedback(false);
      setShowFeedbackModal(false);
      setFeedbackMode('initial');
      setMissedInput('');
    }
  };

  const handleRetrain = async () => {
    if (isRetraining) return;
    setIsRetraining(true);
    try {
      const res = await fetch(endpoints.triggerRetrain, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      alert(`🤖 Active Learning Retrain Triggered:\n${data.message}`);
    } catch (e) {
      console.error(e);
      alert('Failed to connect to retrain endpoint.');
    } finally {
      setIsRetraining(false);
    }
  };

  const handleRedact = async () => {
    if (isLoading) return;
    if (!inputText.trim()) {
      alert('Please enter some text to redact first.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(endpoints.redactText, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          text: inputText,
          redaction_level: currentLevel,
          mode: mode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to redact text from server.');
      }

      const data = await response.json();
      setOutputText(data.redacted_text || 'Error: No redacted text returned');
    } catch (error) {
      console.error(error);
      setOutputText('An error occurred while communicating with the RE-DACT AI Engine. Please check that backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setRedactionLevel([2]);
    setShowDownloadOptions(false);
    setShowFeedbackModal(false);
  };

  const handleDownload = (format: string) => {
    if (format === 'txt') {
      const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `redactx_sanitized_text.txt`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(outputText, 180);
      doc.text(splitText, 15, 15);
      doc.save(`redactx_sanitized_text.pdf`);
    } else if (format === 'docx') {
      const docx = new Document({
        sections: [
          {
            properties: {},
            children: outputText.split('\n').map((line) => new Paragraph({ children: [new TextRun(line)] })),
          },
        ],
      });
      Packer.toBlob(docx).then((blob) => {
        saveAs(blob, `redactx_sanitized_text.docx`);
      });
    }
    setShowDownloadOptions(false);
  };

  return (
    <main className="pt-20 px-4 sm:px-6 pb-12 max-w-[1600px] mx-auto font-sans text-slate-200">
      
      {/* Top SOC Critical Alert Banner */}
      <div className="bg-red-700 text-white px-4 py-3 rounded-sm flex flex-wrap items-center justify-between text-xs font-mono font-bold tracking-wider uppercase mb-6 shadow-xl border border-red-600">
        <div className="flex items-center gap-3">
          <span className="p-1 bg-red-900/80 rounded-sm border border-red-400 text-red-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
          </span>
          <span className="text-sm font-black tracking-widest text-white">TEXT SANITIZATION MODULE</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <span className="bg-red-950/90 px-2.5 py-1 rounded-sm border border-red-500/50 text-white">
            Escalation: <strong className="text-red-200">Level {currentLevel}</strong>
          </span>
          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="px-2.5 py-1 bg-red-900 hover:bg-red-950 text-red-100 border border-red-500/50 rounded-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 font-bold"
            title="Trigger model retrain on collected feedback"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRetraining && "animate-spin")} />
            <span>{isRetraining ? 'Retraining...' : 'Retrain AI'}</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide font-mono">
              <Terminal className="w-5 h-5 text-red-500" />
              Text PII & Financial Sanitizer
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Obfuscate sensitive identifiers, Indian & Global names, organizations, bill prices, orders, and confidential markers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Studio Container */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-sm space-y-6 shadow-xl">
        
        {/* Mode Selection and Sample Loaders */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Mode:</span>
            <button
              onClick={() => setMode('mask')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-sm border transition-all",
                mode === 'mask'
                  ? "bg-red-600 border-red-500 text-white shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              Masking Mode [xxxx]
            </button>
            <button
              onClick={() => setMode('synthetic')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-sm border transition-all flex items-center gap-1.5",
                mode === 'synthetic'
                  ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Synthetic Name Generation
            </button>
          </div>
        </div>

        {/* Redaction Slider Section */}
        <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 space-y-4 font-mono">
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

        {/* Input and Output Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Input Text
              </label>
              <span className="text-xs text-slate-500">{inputText.length} chars</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-64 p-4 rounded-sm border bg-slate-950 border-slate-800 focus:outline-none focus:border-red-500 transition-all text-xs leading-relaxed text-slate-200 resize-none shadow-inner"
              placeholder="Paste confidential documents, emails, or reports here..."
            />
          </div>

          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Redacted Output
              </label>
              <span className="text-xs text-slate-500">{outputText.length} chars</span>
            </div>
            <textarea
              value={outputText}
              readOnly
              className="w-full h-64 p-4 rounded-sm border bg-slate-950 border-slate-800 text-xs leading-relaxed text-emerald-400 resize-none focus:outline-none shadow-inner"
              placeholder="Sanitized text will appear here once redacted..."
            />

            {outputText && (
              <div className="absolute bottom-4 right-4 z-20 font-sans">
                <div className="relative">
                  <button
                    onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-sm shadow-md transition-colors font-mono uppercase tracking-wider"
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>

                  {showDownloadOptions && (
                    <div className="absolute right-0 bottom-full mb-2 w-36 rounded-sm bg-slate-900 border border-slate-800 shadow-xl py-1 z-30 font-mono">
                      <button
                        onClick={() => handleDownload('txt')}
                        className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" /> Plain Text (.txt)
                      </button>
                      <button
                        onClick={() => handleDownload('pdf')}
                        className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-400" /> PDF (.pdf)
                      </button>
                      <button
                        onClick={() => handleDownload('docx')}
                        className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" /> Word (.docx)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 font-mono">
          {outputText && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-4 py-2 rounded-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5 uppercase tracking-wider"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Provide Feedback</span>
            </button>
          )}
          <button
            onClick={handleClear}
            disabled={!inputText && !outputText}
            className="px-4 py-2 rounded-sm border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-all disabled:opacity-50 uppercase tracking-wider"
          >
            Clear
          </button>
          <button
            onClick={handleRedact}
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-2.5 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-600/20 uppercase tracking-wider"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Learning Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-sm p-6 max-w-md w-full space-y-4 shadow-2xl">
            {feedbackMode === 'initial' ? (
              <>
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm font-mono uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4" />
                  <h3>Active Learning Verification</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Did the AI engine correctly identify and redact all sensitive PII markers according to Level {currentLevel}?
                </p>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 font-mono">
                  <button
                    onClick={() => handleFeedback('no')}
                    className="px-4 py-2 rounded-sm bg-slate-950 hover:bg-slate-800 border border-slate-800 text-red-400 text-xs font-semibold transition-colors"
                  >
                    No (Report Missed)
                  </button>
                  <button
                    onClick={() => handleFeedback('yes')}
                    className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                  >
                    Yes (Confirm Accuracy)
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm font-mono uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4" />
                  <h3>Report Missed Entities</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter any missed sensitive words or identifiers separated by commas. These will be ingested into our O(1) active learning loop for immediate model retraining.
                </p>
                <textarea
                  value={missedInput}
                  onChange={(e) => setMissedInput(e.target.value)}
                  placeholder="e.g., Rajesh Sharma, Reliance Industries, #INV-2023-8899"
                  className="w-full h-24 p-3 rounded-sm bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500 resize-none"
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 font-mono">
                  <button
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setFeedbackMode('initial');
                    }}
                    className="px-4 py-2 rounded-sm bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCorrectionSubmit}
                    disabled={isSubmittingFeedback || !missedInput.trim()}
                    className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingFeedback ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Submit to SOC Loop</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
