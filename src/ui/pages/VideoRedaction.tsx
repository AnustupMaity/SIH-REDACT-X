import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Progress } from '../components/Progress';
import { Slider } from '../components/Slider';
import { BackButton } from '../components/BackButton';
import { cn } from '../lib/utils';

export function VideoRedaction() {
  const [file, setFile] = useState<File | null>(null);
  const [redactionLevel, setRedactionLevel] = useState([0]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      
      const url = URL.createObjectURL(file);
      setPreview(url);
      
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleRedact = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="mt-[60px] max-w-4xl mx-auto">
        <BackButton />

        <h1 className="text-2xl font-bold mb-6">Video Redaction</h1>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8">
            <div className="flex flex-col items-center">
              {preview ? (
                <video
                  src={preview}
                  controls
                  className="max-w-full h-auto max-h-64 mb-4 rounded-lg"
                />
              ) : (
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
              )}
              <label className="cursor-pointer">
                <span className="text-blue-500 hover:text-blue-600">
                  Click to upload video
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="video/*"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: MP4, WebM, MOV
              </p>
            </div>
          </div>

          {file && (
            <>
              <div>
                <p className="text-sm font-medium mb-2">Upload Progress</p>
                <Progress value={progress} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Redaction Level: {redactionLevel[0]}
                </label>
                <Slider
                  value={redactionLevel}
                  onValueChange={setRedactionLevel}
                  className="w-full"
                />
              </div>

              <button
                onClick={handleRedact}
                disabled={isProcessing}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "bg-blue-500 hover:bg-blue-600",
                  "text-white font-medium",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isProcessing ? 'Processing...' : 'Redact Video'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}