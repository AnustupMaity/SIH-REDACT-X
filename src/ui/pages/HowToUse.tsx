import React from 'react';
import { HelpCircle, Layers, Cpu, Shield, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HowToUse() {
  const navigate = useNavigate();

  const levels = [
    {
      level: 'Level 0',
      title: 'No Redaction (Pass-through)',
      desc: 'Returns the original document without modifications. Used for baseline logging and formatting verification.'
    },
      level: 'Level 1',
      title: 'Regex & Basic Rule Scrubbing',
      desc: 'Redacts structured text identifiers (PAN cards, Aadhaar, phone numbers, emails, bank accounts) across all documents via fast OCR.'
    },
    {
      level: 'Level 2 - 4',
      title: 'Gradational spaCy Statistical NER + Visual Biometrics',
      desc: 'Layers spaCy NLP models for names, organizations, and locations across all files. For PDFs & Images: Level 3 automatically blurs Human Faces, and Level 4 blurs Handwritten Signatures.'
    },
    {
      level: 'Level 5',
      title: 'Transformer Deep Learning + Total Biometrics',
      desc: 'Engages fine-tuned RoBERTa transformers for text/data files. For PDFs & Images: performs Total Biometric De-identification (Faces, Signatures, Official Colored Stamps, Seals, and Fingerprints/Thumbprints).'
    }
  ];

  return (
    <main className="pt-24 px-6 pb-12 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white">How to Use</h1>
          <p className="text-sm text-gray-400 mt-1">A step-by-step guide to gradational redaction and synthetic anonymization.</p>
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
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            Gradational Redaction Scale
          </h2>
          <p className="text-sm text-gray-300 mb-6 leading-relaxed">
            RE-DACT allows users to calibrate redaction intensity on a gradational scale from 0 to 5. The higher the degree set by the user, the deeper the NLP model inspects and obfuscates contextual markers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levels.map((item) => (
              <div key={item.level} className="bg-gray-950 border border-gray-800 p-4 rounded-sm">
                <span className="text-xs font-mono text-blue-400 font-bold uppercase">{item.level}</span>
                <h3 className="text-sm font-bold text-white mt-1 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-sm">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              Synthetic Name Generation
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              When using advanced redaction tiers, RE-DACT can replace real personal names, organizations, and identifiers with realistic synthetic equivalents (e.g., replacing real names with synthetic Indian names like "Aarav Sharma" or "Priya Nair"). This produces realistic databases safe for sharing and analysis.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-sm">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-500" />
              Active Learning Feedback Loop
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              If you notice a missed entity or make a manual correction in the UI, submit it via the feedback interface. The system stores corrections in an O(1) JSONL pipeline to automatically train and improve future model iterations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
