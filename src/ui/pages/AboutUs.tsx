import React from 'react';
import { Info, Shield, Database, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AboutUs() {
  const navigate = useNavigate();

  const features = [
    { title: 'Offline Execution', desc: 'All OCR binaries (Tesseract, Poppler) and NLP transformers execute entirely locally within your project environment. Zero external API dependencies.' },
    { title: '2.14 Lakh Training Corpus', desc: 'Models are trained on over 214,501 curated real and synthetic PII records across English, Spanish, German, and specialized Indian financial data.' },
    { title: 'Zero Data Retention', desc: 'Uploaded documents and text are processed in memory and immediately discarded. No original file contents are ever stored on disk or shared with third parties.' },
    { title: 'Gradational Anonymization', desc: 'Empowers users to strip specificity to their desired level, supporting everything from simple name removal to complete realistic synthetic data replacement.' }
  ];

  return (
    <main className="pt-24 px-6 pb-12 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white">About Us</h1>
          <p className="text-sm text-gray-400 mt-1">Background and technical specifications of the RE-DACT anonymization platform.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-sm text-gray-300 transition-colors"
        >
          Back to Home
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-sm">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Project Overview
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            RE-DACT is an advanced natural language processing and machine learning redaction tool designed to secure sensitive personal and financial identifiers. It strips key identifiers from text, documents, and images while leaving the output structurally and logically intact. Over time, the integrated model learns from operator feedback to generate realistic synthetic data in any sought format.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feat) => (
            <div key={feat.title} className="bg-gray-900 border border-gray-800 p-5 rounded-sm">
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat.title}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Compliance & Security Benchmarks</h3>
            <p className="text-xs text-gray-400 mt-1">Architected in accordance with secure coding practices, GDPR, HIPAA, and Indian DPDP Act standards.</p>
          </div>
          <span className="px-3 py-1 bg-emerald-950/50 border border-emerald-800 text-emerald-400 font-mono text-xs rounded-sm">
            Verified Safe
          </span>
        </div>
      </div>
    </main>
  );
}
