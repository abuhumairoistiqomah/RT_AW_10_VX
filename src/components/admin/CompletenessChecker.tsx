import React, { useState, useEffect } from 'react';
import { Event } from '../../types';
import { ApiService } from '../../services/api';
import {
  CheckCircle2, AlertCircle, Calendar, Layers, Shield, RefreshCw, AlertTriangle
} from 'lucide-react';

export const CompletenessChecker: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('RT2026-02');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadReport(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    const evts = await ApiService.getEvents();
    setEvents(evts);
    const active = evts.find(e => e.status === 'ACTIVE') || evts[0];
    if (active) setSelectedEventId(active.event_id);
  };

  const loadReport = async (eventId: string) => {
    setLoading(true);
    const r = await ApiService.getCompletenessReport(eventId);
    setReport(r);
    setLoading(false);
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 w-full min-w-0">
        <div className="w-full min-w-0 max-w-full flex-1">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Shield className="w-4 h-4 shrink-0" />
            <span className="truncate">Operational Audit & Completeness</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1 line-clamp-2 break-normal">Completeness Checker</h1>
          <p className="text-slate-400 text-xs mt-1 break-normal">
            Deteksi kelengkapan data operasional: siswa tanpa halaqah, baseline/target yang belum diisi, dan setoran per halaqah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full xl:w-auto xl:justify-end shrink-0">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="py-1.5 sm:py-2 px-2.5 sm:px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none max-w-[200px] truncate"
          >
            {events.map((e) => (
              <option key={e.event_id} value={e.event_id}>
                {e.event_name} ({e.academic_year})
              </option>
            ))}
          </select>
          <button onClick={() => loadReport(selectedEventId)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition shrink-0">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading || !report ? (
        <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
          Memeriksa kelengkapan data operasional...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Tanpa Halaqah</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className={`text-2xl font-black ${report.counts.withoutHalaqahCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {report.counts.withoutHalaqahCount}
                </span>
                <span className="text-xs text-slate-500">Siswa</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Tanpa Baseline</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className={`text-2xl font-black ${report.counts.withoutBaselineCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {report.counts.withoutBaselineCount}
                </span>
                <span className="text-xs text-slate-500">Siswa</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Tanpa Target</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className={`text-2xl font-black ${report.counts.withoutTargetCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {report.counts.withoutTargetCount}
                </span>
                <span className="text-xs text-slate-500">Siswa</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Belum Penilaian Akhir</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className={`text-2xl font-black ${report.counts.withoutFinalEvalCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {report.counts.withoutFinalEvalCount}
                </span>
                <span className="text-xs text-slate-500">Siswa</span>
              </div>
            </div>
          </div>

          {/* Per-Halaqah Progress Actionable List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 min-w-0 w-full">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kelengkapan Input Sesi per Halaqah</span>
            </h3>

            <div className="space-y-3">
              {report.halaqahReports.map((h: any) => (
                <div key={h.halaqah_id} className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 min-w-0">
                    <span className="font-bold text-slate-900 truncate">{h.halaqah_name}</span>
                    <span className="font-mono font-bold text-slate-700 shrink-0">
                      {h.submittedSessions} / {h.expectedSessions} Sesi ({h.percentage}%)
                      {h.missingCount > 0 && <span className="text-amber-600 ml-2">→ {h.missingCount} rekaman tersisa</span>}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        h.percentage === 100
                          ? 'bg-emerald-500'
                          : h.percentage >= 80
                          ? 'bg-emerald-400'
                          : h.percentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${h.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Breakdown */}
          {report.counts.withoutHalaqahCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-2 min-w-0 w-full">
              <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Siswa Belum Memiliki Halaqah ({report.counts.withoutHalaqahCount})</span>
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {report.issues.withoutHalaqah.map((st: any) => (
                  <span key={st.student_id} className="text-[11px] font-semibold bg-white text-slate-800 px-2.5 py-1 rounded-lg border border-amber-300 break-words">
                    {st.name} ({st.class})
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
