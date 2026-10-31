/**
 * PostMortemPreview.jsx
 * Preview laporan post-mortem terformat + tombol export Markdown,
 * salin ke clipboard, dan cetak.
 *
 * @param {object}   props
 * @param {object}   props.postMortem - Data post-mortem
 * @param {object}   props.incident   - Data insiden terkait
 * @param {Function} props.addToast   - Callback toast
 * @param {Function} props.onClose    - Callback tutup preview
 */

import { useRef } from 'react';
import { Download, Copy, Printer, X, Clock } from 'lucide-react';
import { exportToMarkdown } from '../../utils/postmortem.js';
import { formatDateTime, formatDuration, calcDurationMinutes, isOverdue } from '../../utils/date.js';
import { getSeverityColor, getStatusColor } from '../../utils/severity.js';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';

function PostMortemPreview({ postMortem, incident, addToast, onClose }) {
  const contentRef = useRef(null);

  const handleExportMd = () => {
    const md = exportToMarkdown(postMortem, incident);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `post-mortem-${postMortem.id}-${incident?.id ?? 'unknown'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Post-mortem berhasil diunduh sebagai Markdown.', 'success');
  };

  const handleCopy = async () => {
    try {
      const md = exportToMarkdown(postMortem, incident);
      await navigator.clipboard.writeText(md);
      addToast('Post-mortem disalin ke clipboard.', 'success');
    } catch {
      addToast('Gagal menyalin. Coba lagi.', 'error');
    }
  };

  const handlePrint = () => window.print();

  const duration = formatDuration(calcDurationMinutes(incident?.createdAt, incident?.resolvedAt));

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden" aria-label="Preview post-mortem">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 no-print">
        <h3 className="text-sm font-semibold text-slate-700">Preview Post-Mortem</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Copy size={14} />} onClick={handleCopy}>
            <span className="hidden sm:inline">Salin</span>
          </Button>
          <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExportMd}>
            <span className="hidden sm:inline">Markdown</span>
          </Button>
          <Button variant="outline" size="sm" icon={<Printer size={14} />} onClick={handlePrint}>
            <span className="hidden sm:inline">Cetak</span>
          </Button>
          {onClose && (
            <button onClick={onClose} aria-label="Tutup preview" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Konten */}
      <div ref={contentRef} className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Judul */}
        <header>
          <p className="text-xs font-mono text-slate-400 mb-1">{postMortem.id}</p>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{incident?.title ?? 'Post-Mortem'}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            {incident && <Badge className={getSeverityColor(incident.severity)} size="md">{incident.severity}</Badge>}
            {incident && <Badge className={getStatusColor(incident.status)} size="md">{incident.status}</Badge>}
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={12} aria-hidden="true" /> Durasi: {duration}
            </span>
          </div>
        </header>

        {/* Tabel ringkasan */}
        <section>
          <h2 className="text-base font-bold text-slate-700 mb-3 pb-1 border-b border-slate-200">Ringkasan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {[
                  ['ID Insiden',    incident?.id ?? '-'],
                  ['Severity',      incident?.severity ?? '-'],
                  ['Sistem',        incident?.system ?? '-'],
                  ['Durasi',        duration],
                  ['Waktu Deteksi', formatDateTime(incident?.createdAt)],
                  ['Waktu Resolusi',formatDateTime(incident?.resolvedAt)],
                  ['Pelapor',       incident?.reporter ?? '-'],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-slate-100">
                    <td className="py-1.5 pr-4 text-xs font-semibold text-slate-500 whitespace-nowrap w-36">{label}</td>
                    <td className="py-1.5 text-slate-700">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">{postMortem.summary}</p>
        </section>

        {/* Kronologi */}
        <section>
          <h2 className="text-base font-bold text-slate-700 mb-3 pb-1 border-b border-slate-200">Kronologi</h2>
          {(postMortem.timeline ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada entri kronologi.</p>
          ) : (
            <ol className="space-y-2">
              {postMortem.timeline.map(t => (
                <li key={t.id} className="flex gap-3 text-sm">
                  <span className="text-xs text-slate-400 w-36 shrink-0 pt-0.5">{formatDateTime(t.time)}</span>
                  <span className="text-xs font-semibold text-brand-600 w-20 shrink-0">{t.type}</span>
                  <span className="text-slate-700 flex-1">{t.note}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Analisis */}
        {[
          { key: 'rootCause', label: 'Akar Masalah' },
          { key: 'impact',    label: 'Dampak' },
          { key: 'wentWell',  label: 'Yang Berjalan Baik' },
          { key: 'needsImprovement', label: 'Yang Perlu Diperbaiki' },
        ].map(({ key, label }) => postMortem[key] ? (
          <section key={key}>
            <h2 className="text-base font-bold text-slate-700 mb-2 pb-1 border-b border-slate-200">{label}</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{postMortem[key]}</p>
          </section>
        ) : null)}

        {/* Action Items */}
        {(postMortem.actionItems ?? []).length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-700 mb-3 pb-1 border-b border-slate-200">
              Action Items ({postMortem.actionItems.filter(a => a.done).length}/{postMortem.actionItems.length} selesai)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Deskripsi</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">Penanggung Jawab</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">Tenggat</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {postMortem.actionItems.map(ai => (
                    <tr key={ai.id}>
                      <td className="px-3 py-2 text-slate-700">{ai.text}</td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{ai.owner}</td>
                      <td className={`px-3 py-2 whitespace-nowrap text-xs font-medium ${!ai.done && isOverdue(ai.dueDate) ? 'text-red-600' : 'text-slate-600'}`}>
                        {ai.dueDate ?? '-'}
                        {!ai.done && isOverdue(ai.dueDate) && ' ⚠'}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-semibold ${ai.done ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {ai.done ? '✅ Selesai' : '⏳ Belum'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Dokumen ini dibuat otomatis oleh ResolveIQ · {formatDateTime(postMortem.createdAt)}
          </p>
        </footer>
      </div>
    </article>
  );
}

export default PostMortemPreview;
