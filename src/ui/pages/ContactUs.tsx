import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ContactUs() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.message.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <main className="pt-24 px-6 pb-12 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Us</h1>
          <p className="text-sm text-gray-400 mt-1">Get in touch with our technical support and cybersecurity team.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-sm text-gray-300 transition-colors"
        >
          Back to Home
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </div>
            <p className="text-xs text-gray-400">support@redactx-secure.org</p>
            <p className="text-xs text-gray-400">privacy@redactx-secure.org</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <Phone className="w-4 h-4" />
              <span>Emergency Helpdesk</span>
            </div>
            <p className="text-xs text-gray-400">+91 (080) 4567-8900</p>
            <p className="text-xs text-gray-500">Available 24/7 for security dispatch</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-sm">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Send a Message
          </h2>

          {submitted ? (
            <div className="p-6 bg-emerald-950/30 border border-emerald-800 rounded-sm flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <h3 className="text-sm font-bold text-white">Message Transmitted Successfully</h3>
              <p className="text-xs text-gray-400">Our technical dispatch will review your inquiry and respond via encrypted channel.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@organization.org"
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Inquiry or issue subject"
                  className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your question, unredacted data vector, or feature request..."
                  className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm transition-colors text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
