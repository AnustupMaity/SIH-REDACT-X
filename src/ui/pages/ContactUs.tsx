import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ContactUs() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.message.trim()) {
      setSubmitted(true);
      // Open default email client to send mail directly to Anustup Maity
      const mailtoUrl = `mailto:anustupmaity@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\nMessage:\n${form.message}`)}`;
      window.location.href = mailtoUrl;
      
      setTimeout(() => setSubmitted(false), 5000);
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <main className="pt-24 px-6 pb-12 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Us</h1>
          <p className="text-sm text-slate-400 mt-1">Get in touch directly with the developer and maintainer.</p>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="px-4 py-2 text-xs font-mono uppercase font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-sm text-slate-300 transition-colors"
        >
          Back to Home
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <User className="w-4 h-4" />
              <span>Developer & Lead</span>
            </div>
            <p className="text-sm font-bold text-white">ANUSTUP MAITY</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-slate-400 text-xs">
              <Mail className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <a href="mailto:anustupmaity@gmail.com" className="hover:text-red-400 transition-colors">
                anustupmaity@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-sm">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-red-500" />
            Send an Email to Developer
          </h2>

          {submitted ? (
            <div className="p-6 bg-red-950/20 border border-red-900/50 rounded-sm flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-red-500" />
              <h3 className="text-sm font-bold text-white">Opening Email Client...</h3>
              <p className="text-xs text-slate-400">Your default mail client is being launched to send your message directly to <b>anustupmaity@gmail.com</b>.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Inquiry or feedback subject"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Type your message here..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-sm text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm transition-colors text-xs uppercase tracking-wider font-mono"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email to Anustup</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
