import React, { useState } from 'react';
import { Download, Sparkles, Shield, Cpu, Zap, CheckCircle2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { Slider } from '../components/Slider';
import { BackButton } from '../components/BackButton';
import { cn } from '../lib/utils';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { endpoints } from '../lib/api';

const LEVEL_DESCRIPTIONS = [
  { title: "Level 0: Pass-Through", desc: "No redaction applied. Useful for formatting or conversion testing.", badge: "Neutral", color: "text-gray-500" },
  { title: "Level 1: Ultra-Fast Regex Rules", desc: "Instantly masks structured PII: Emails, Phone numbers, Dates, Credit Cards, Aadhaar & PAN numbers.", badge: "Regex Fast", color: "text-blue-500" },
  { title: "Level 2: Lightweight AI NER", desc: "Uses spaCy statistical NER model to identify names, locations, and organizations with low latency.", badge: "spaCy Small", color: "text-indigo-500" },
  { title: "Level 3: Enhanced AI NER", desc: "High-precision multi-word entity detection using spaCy medium statistical NLP pipeline.", badge: "spaCy Medium", color: "text-violet-500" },
  { title: "Level 4: Advanced Domain NER", desc: "Broad semantic masking using best-in-class spaCy domain-specific pipeline.", badge: "spaCy Best", color: "text-purple-500" },
  { title: "Level 5: Deep Learning Transformer", desc: "State-of-the-art neural network (BERT / RoBERTa) fine-tuned on complex Indian & Global PII datasets.", badge: "BERT / RoBERTa AI", color: "text-fuchsia-600 font-bold animate-pulse" },
];

const SAMPLE_INDIAN_PII = `Confidential Financial & HR Report - Tata Consultancy Services (TCS)
Employee Name: Rajesh Sharma | Location: Mumbai, Maharashtra
Email: rajesh.sharma@tcs.com | Phone: +91-9876543210
Aadhaar Number: 5485-6985-1245 | PAN: ABCDE1234F
Date of Joining: 15th August 2023 | Annual Salary: Rs. 18,50,000

Transaction Details:
Invoice Number: #INV-2023-8899 was billed to Reliance Industries in Bengaluru for Rs. 4,50,000.
Order ID: ORD-554433 authorized by Aditya Verma on 14/10/2023 via HDFC Bank transfer.`;

const SAMPLE_GLOBAL_PII = `Global Incident & Audit Log - Apple Inc.
Reported by: Sarah Jenkins, Senior VP of Engineering
Office Location: Cupertino, San Francisco | Date: October 14th, 2024
Contact Email: s.jenkins@apple.com | Emergency Phone: +1-415-555-0199
Passport Number: P98765432 | Driver License: D123-456-789

Financial Billing Audit:
Michael Davis authorized wire transfer TXN-889922 to Microsoft Corporation in London.
Total Bill Price: $150,000 USD paid against Invoice REF-102938 on 01-01-2025.`;

export function TextRedaction() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [redactionLevel, setRedactionLevel] = useState([2]);
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
          headers: { 'Content-Type': 'application/json' },
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
      setShowFeedbackModal(false);
      setFeedbackMode('initial');
      alert('✅ Thank you! Positive reinforcement saved to Active Learning loop.');
    } else {
      setFeedbackMode('correction');
    }
  };

  const handleCorrectionSubmit = async () => {
    setIsSubmittingFeedback(true);
    try {
      const missedList = missedInput.split(',').map((s) => s.trim()).filter(Boolean);
      await fetch(endpoints.feedback, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    setIsRetraining(true);
    try {
      const res = await fetch(endpoints.triggerRetrain, { method: 'POST' });
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
    if (!inputText.trim()) {
      alert('Please enter some text to redact first.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(endpoints.redactText, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          redaction_level: currentLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to redact text from server.');
      }

      const data = await response.json();
      setOutputText(data.redacted_text || 'Error: No redacted text returned');
      setShowFeedbackModal(true);
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
    } else if (format === 'docx') {
      const doc = new Document({
        sections: [{ children: [new Paragraph({ children: [new TextRun(outputText)] })] }],
      });
      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `redactx_sanitized_text.docx`);
      });
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(outputText, 180);
      doc.text(splitText, 15, 20);
      doc.save(`redactx_sanitized_text.pdf`);
    }
    setShowDownloadOptions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 sm:p-6 transition-colors">
      <div className="mt-20 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-sm text-xs font-semibold text-gray-700 dark:text-gray-300">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>AI Engine: Hybrid NER + RoBERTa</span>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800/80 shadow-2xl space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                <Shield className="w-6 h-6" />
              </span>
              Intelligent Text Redaction Studio
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Obfuscate sensitive identifiers, Indian & Global names, organizations, bill prices, orders, and confidential markers in real-time.
            </p>
          </div>

          {/* Supported Entity Categories Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 dark:border-purple-400/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" /> Comprehensive 9-Class Entity Detection Active
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300">
                Multi-Model AI + Active Learning
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">👤 Person (PER)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">🏢 Company / Bank (ORG)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">📍 Location / City (LOC)</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold shadow-2xs">💵 Bill Price / Salary / Currency (MONEY)</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-bold shadow-2xs">📦 Order ID / Invoice / Tracking (ORDER)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">📅 Date / Deadline (DATE)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">🆔 Aadhaar / PAN / Passport (GOV_ID)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">📧 Email Address (EMAIL)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">📞 Phone Number (PHONE)</span>
            </div>
          </div>

          {/* Sample Loader Buttons */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Test Data:
            </span>
            <button
              onClick={() => setInputText(SAMPLE_INDIAN_PII)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all shadow-sm"
            >
              🇮🇳 Load Sample Indian PII (Aadhaar / PAN / TCS)
            </button>
            <button
              onClick={() => setInputText(SAMPLE_GLOBAL_PII)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all shadow-sm"
            >
              🌐 Load Sample Global PII (Apple / Microsoft)
            </button>
          </div>

          {/* Redaction Slider Section */}
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

          {/* Input and Output Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Original Text
                </label>
                <span className="text-xs text-gray-400">{inputText.length} chars</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 p-4 rounded-2xl border bg-gray-50/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 resize-none shadow-inner"
                placeholder="Paste confidential documents, emails, or reports here..."
              />
            </div>

            <div className="space-y-2 relative">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sanitized Output
                </label>
                <span className="text-xs text-gray-400">{outputText.length} chars</span>
              </div>
              <textarea
                value={outputText}
                readOnly
                className="w-full h-64 p-4 rounded-2xl border bg-blue-500/5 dark:bg-blue-950/10 border-blue-500/20 dark:border-blue-400/20 font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100 resize-none shadow-inner focus:outline-none"
                placeholder="Sanitized text will appear here once redacted..."
              />

              {outputText && (
                <div className="absolute bottom-4 right-4 z-20">
                  <div className="relative">
                    <button
                      onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:scale-105 transition-all"
                    >
                      <Download className="w-4 h-4" /> Export File
                    </button>

                    {showDownloadOptions && (
                      <div className="absolute bottom-full right-0 mb-2 w-44 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        <button
                          onClick={() => handleDownload('txt')}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500" /> Plain Text (.txt)
                        </button>
                        <button
                          onClick={() => handleDownload('docx')}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500" /> Word Doc (.docx)
                        </button>
                        <button
                          onClick={() => handleDownload('pdf')}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-500" /> PDF Document (.pdf)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-800/60">
            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/30 transition-all flex items-center gap-2 shadow-sm hover:scale-105"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRetraining && "animate-spin")} />
              {isRetraining ? 'Retraining AI Loop...' : '🔄 Retrain AI from Feedback Loop'}
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset Studio
            </button>
            <button
              onClick={handleRedact}
              disabled={isLoading || !inputText}
              className={cn(
                "px-8 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center gap-2.5",
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 shadow-blue-500/25"
              )}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running AI Redaction Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Execute Redaction (Level {currentLevel})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Learning Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-md w-full mx-4 space-y-6">
              {feedbackMode === 'initial' ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sanitization Complete</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Help our hybrid model learn and improve accuracy.</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Was the redaction quality satisfactory for Level {currentLevel} ({levelInfo.badge})?
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleFeedback('yes')}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20"
                    >
                      ✅ Yes, Perfect
                    </button>
                    <button
                      onClick={() => handleFeedback('no')}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-md shadow-amber-500/20"
                    >
                      ❌ Needs Improvement
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Learning Input</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Teach the AI model what was missed!</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Missed Words or Corrected Entities (comma separated)
                    </label>
                    <textarea
                      value={missedInput}
                      onChange={(e) => setMissedInput(e.target.value)}
                      placeholder="e.g. Aditya Verma, Bengaluru, Google Cloud, 5485-6985-1245..."
                      className="w-full h-28 p-3.5 rounded-2xl border bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-sm font-mono text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none shadow-inner"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5">
                      💡 These words will be tagged as entities and added directly to our `pii_training_dataset.json` for retraining!
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setFeedbackMode('initial'); setShowFeedbackModal(false); }}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCorrectionSubmit}
                      disabled={isSubmittingFeedback || !missedInput.trim()}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md",
                        isSubmittingFeedback || !missedInput.trim()
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 shadow-purple-500/20"
                      )}
                    >
                      {isSubmittingFeedback ? 'Ingesting...' : '🧠 Submit to Training Loop'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
