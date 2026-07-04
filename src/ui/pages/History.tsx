import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw, CheckCircle2, AlertCircle, FileText, Terminal, Activity } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { endpoints, getAuthHeaders } from '../lib/api';

interface HistoryRecord {
  id: number;
  filename: string;
  operation_type: string;
  redaction_level: number;
  status: string;
  timestamp: string;
  details?: string;
}

export function History() {
  const [historyItems, setHistoryItems] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoints.history, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error('Failed to load operation history');
      }
      const data = await res.json();
      setHistoryItems(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <main className="pt-20 px-4 sm:px-6 pb-12 max-w-[1600px] mx-auto font-sans text-slate-200">
      
      {/* Top SOC Critical Alert Banner */}
      <div className="bg-red-700 text-white px-4 py-3 rounded-sm flex flex-wrap items-center justify-between text-xs font-mono font-bold tracking-wider uppercase mb-6 shadow-xl border border-red-600">
        <div className="flex items-center gap-3">
          <span className="p-1 bg-red-900/80 rounded-sm border border-red-400 text-red-100 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white animate-pulse" />
          </span>
          <span className="text-sm font-black tracking-widest text-white">SECURITY AUDIT & OPERATION HISTORY</span>
          <span className="hidden sm:inline text-red-200 font-normal">| Target: AUDIT-LOG-SRV</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <span className="bg-red-950/90 px-2.5 py-1 rounded-sm border border-red-500/50 text-white">
            Policy: <strong className="text-red-200">Zero Retention</strong>
          </span>
          <span className="hidden md:inline font-bold">SQLite Audit Log: ONLINE</span>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide font-mono">
              <Terminal className="w-5 h-5 text-red-500" />
              Operation History & Security Audit Trail
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              View your recent sanitization logs, executed redaction levels, and system compliance status.
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-sm text-xs font-semibold text-slate-300 transition-colors disabled:opacity-50 font-mono uppercase tracking-wider"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-sm shadow-xl font-mono">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-6 h-6 text-red-500 animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-mono">Loading operation history from SQLite audit log...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-sm bg-red-950/30 border border-red-900/50 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No redaction operations recorded in local memory yet. Execute sanitization in Text or Document modules!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">ID</th>
                  <th className="py-3 px-4 font-bold">Operation / File Buffer</th>
                  <th className="py-3 px-4 font-bold">Type</th>
                  <th className="py-3 px-4 font-bold">Level</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/60 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-bold">#{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate max-w-xs">{item.filename}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans text-xs">{item.operation_type}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-950 border border-slate-800 text-red-400 font-bold">
                        Level {item.redaction_level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        item.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {item.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(item.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
