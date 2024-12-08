import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { FileText, Image, FileUp, Clock, Video, LogOut } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RedactionCard } from './components/RedactionCard';
import { TextRedaction } from './pages/TextRedaction';
import { FileRedaction } from './pages/FileRedaction';
import { PDFRedaction } from './pages/PDFRedaction';
import { ImageRedaction } from './pages/ImageRedaction';
import { VideoRedaction } from './pages/VideoRedaction';
import { useThemeStore } from './store/theme';

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
      title: 'Text File Redaction',
      description: 'Upload and redact text files',
      path: '/file-redaction',
    },
    {
      icon: FileUp,
      title: 'PDF Redaction',
      description: 'Redact sensitive information from PDF documents',
      path: '/pdf-redaction',
    },
    {
      icon: Image,
      title: 'Image Redaction',
      description: 'Redact sensitive information from images',
      path: '/image-redaction',
    },
    {
      icon: Video,
      title: 'Video Redaction',
      description: 'Redact sensitive information from videos',
      path: '/video-redaction',
    },
    {
      icon: Clock,
      title: 'History',
      description: 'View your last 25 redaction operations',
      path: '/history',
    },
  ];

  const handleLogout = () => {
    
    navigate('/');
  };

  return (
    <main className="pt-24 px-4 pb-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Choose Redaction Type</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text-redaction" element={<TextRedaction />} />
            <Route path="/file-redaction" element={<FileRedaction />} />
            <Route path="/pdf-redaction" element={<PDFRedaction />} />
            <Route path="/image-redaction" element={<ImageRedaction />} />
            <Route path="/video-redaction" element={<VideoRedaction />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
