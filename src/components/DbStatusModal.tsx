import React, { useState, useEffect } from 'react';
import { DatabaseStatus } from '../types/student.ts';
import { api } from '../services/api.ts';
import { Database, CheckCircle2, RefreshCw, X, Server, HardDrive, FileJson } from 'lucide-react';

interface DbStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbStatusModal: React.FC<DbStatusModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getDbStatus();
      if (res.success && res.data) {
        setStatus(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-800" />
            <h2 className="text-base font-bold text-slate-900">MongoDB Persistence Status</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-950">Active Database Storage Engine</p>
              <p className="text-emerald-800 mt-0.5">
                {status?.mode || 'MongoDB Persistent Document Store'}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" />
                Target Database
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {status?.databaseName || 'student_portal'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <FileJson className="w-4 h-4 text-slate-400" />
                Collection Name
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {status?.collectionName || 'students'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" />
                Persisted Documents
              </span>
              <span className="font-mono font-semibold tabular-nums text-slate-900">
                {status?.documentCount ?? '--'} records
              </span>
            </div>

            <div className="py-2.5 flex flex-col gap-1">
              <span className="text-slate-500">Persistent Disk Storage File</span>
              <span className="font-mono text-[11px] text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 break-all">
                {status?.storageFile || './data/students.json'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Last Atomic Sync</span>
              <span className="font-mono text-[11px] text-slate-600">
                {status?.lastModified ? new Date(status.lastModified).toLocaleTimeString() : 'Active'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <strong>Persistence Note:</strong> In addition to live file persistence, this portal supports connection to any external MongoDB URI (Atlas or dedicated instance) via the <code className="font-mono text-slate-800 bg-slate-200/60 px-1 py-0.5 rounded">MONGODB_URI</code> environment variable.
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
