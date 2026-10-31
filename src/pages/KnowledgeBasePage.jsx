/**
 * KnowledgeBasePage.jsx
 * Halaman Knowledge Base: pencarian terpadu atas insiden, runbook, dan post-mortem.
 * Fitur: tab hasil (Semua/Insiden/Runbook/Post-Mortem), penyorotan kata kunci,
 * filter kategori.
 *
 * @param {object}   props
 * @param {Function} props.onNavigate   - Callback navigasi halaman
 * @param {Function} props.onOpenDetail - Callback buka detail insiden
 * @param {Function} props.addToast     - Callback toast
 */

import { useState, useMemo } from 'react';
import {
  Search, AlertTriangle, BookOpen, FileText, Database,
  Tag, ChevronRight,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext.jsx';
import { getSeverityColor, getStatusColor } from '../utils/severity.js';
import { CATEGORIES } from '../utils/constants.js';
import { timeAgo } from '../utils/date.js';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const TABS = [
  { key: 'all',        label: 'Semua',       icon: Database    },
  { key: 'incidents',  label: 'Insiden',     icon: AlertTriangle },
  { key: 'runbooks',   label: 'Runbooks',    icon: BookOpen    },
  { key: 'postmortems',label: 'Post-Mortems',icon: FileText    },
];

/**
 * Menyoroti teks yang cocok dengan query menggunakan elemen <mark>.
 */
function Highlight({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts   = String(text).split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

/** Card hasil insiden */
function IncidentResult({ incident, query, onOpenDetail }) {
  return (
    <button
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-brand-300 transition-all"
      onClick={() => onOpenDetail(incident)}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-mono text-xs font-bold text-slate-400">{incident.id}</span>
        <Badge className={getSeverityColor(incident.severity)} size="sm">{incident.severity}</Badge>
        <Badge className={getStatusColor(incident.status)} size="sm">{incident.status}</Badge>
        <span className="ml-auto text-xs text-slate-400">{timeAgo(incident.createdAt)}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 mb-1">
        <Highlight text={incident.title} query={query} />
      </p>
      <p className="text-xs text-slate-500">{incident.system} · {incident.category}</p>
      {incident.tags?.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          <Tag size={10} className="text-slate-400" aria-hidden="true" />
          {incident.tags.map(t => (
            <span key={t} className="text-xs text-slate-400">
              <Highlight text={t} query={query} />
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

/** Card hasil runbook */
function RunbookResult({ runbook, query, onNavigate }) {
  return (
    <button
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-brand-300 transition-all"
      onClick={() => onNavigate('Runbooks')}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-semibold">{runbook.category}</span>
        <span className="text-xs text-slate-400">v{runbook.version}</span>
        <ChevronRight size={12} className="ml-auto text-slate-300" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-slate-800 mb-1">
        <Highlight text={runbook.title} query={query} />
      </p>
      <p className="text-xs text-slate-500">{runbook.steps?.length ?? 0} langkah · {runbook.systems?.join(', ')}</p>
    </button>
  );
}

/** Card hasil post-mortem */
function PostMortemResult({ pm, incident, query, onNavigate }) {
  const done  = pm.actionItems?.filter(ai => ai.done).length ?? 0;
  const total = pm.actionItems?.length ?? 0;
  return (
    <button
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-brand-300 transition-all"
      onClick={() => onNavigate('Post-Mortems')}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-mono text-xs font-bold text-slate-400">{pm.id}</span>
        {incident && <Badge className={getSeverityColor(incident.severity)} size="sm">{incident.severity}</Badge>}
        <span className="text-xs text-slate-400 ml-auto">{done}/{total} action item</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 mb-1">
        <Highlight text={incident?.title ?? pm.incidentId} query={query} />
      </p>
      {pm.rootCause && (
        <p className="text-xs text-slate-500 line-clamp-2">
          <Highlight text={pm.rootCause} query={query} />
        </p>
      )}
    </button>
  );
}

function KnowledgeBasePage({ onNavigate, onOpenDetail, addToast }) {
  const { state }     = useIncidents();
  const [query,    setQuery]    = useState('');
  const [tab,      setTab]      = useState('all');
  const [category, setCategory] = useState('');

  const q = query.toLowerCase().trim();

  const matchedIncidents = useMemo(() => {
    if (!q) return [];
    const match = (...texts) => texts.some(t => String(t ?? '').toLowerCase().includes(q));
    return state.incidents.filter(i =>
      match(i.id, i.title, i.description, i.category, i.system, ...(i.tags ?? [])) &&
      (!category || i.category === category),
    );
  }, [q, state.incidents, category]);

  const matchedRunbooks = useMemo(() => {
    if (!q) return [];
    const match = (...texts) => texts.some(t => String(t ?? '').toLowerCase().includes(q));
    return state.runbooks.filter(rb =>
      match(rb.title, rb.category, ...(rb.systems ?? []),
        ...(rb.steps ?? []).map(s => s.text)) &&
      (!category || rb.category === category),
    );
  }, [q, state.runbooks, category]);

  const matchedPMs = useMemo(() => {
    if (!q) return [];
    const match = (...texts) => texts.some(t => String(t ?? '').toLowerCase().includes(q));
    return state.postMortems.filter(pm => {
      const inc = state.incidents.find(i => i.id === pm.incidentId);
      return match(pm.id, pm.summary, pm.rootCause, pm.impact,
        pm.wentWell, pm.needsImprovement, inc?.title);
    });
  }, [q, state.postMortems, state.incidents]);

  const totalResults = matchedIncidents.length + matchedRunbooks.length + matchedPMs.length;

  const showIncidents  = tab === 'all' || tab === 'incidents';
  const showRunbooks   = tab === 'all' || tab === 'runbooks';
  const showPMs        = tab === 'all' || tab === 'postmortems';

  return (
    <div className="space-y-5 max-w-screen-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Knowledge Base</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Cari di seluruh insiden, runbook, dan post-mortem
        </p>
      </div>

      {/* Search box besar */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ketik kata kunci untuk mencari…"
          aria-label="Cari di Knowledge Base"
          className="w-full pl-12 pr-4 py-3 text-base border border-slate-200 rounded-xl bg-white shadow-card focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors"
          autoFocus
        />
      </div>

      {/* Filter + Tabs */}
      {q && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            {TABS.map(t => {
              const count = t.key === 'all' ? totalResults
                : t.key === 'incidents'   ? matchedIncidents.length
                : t.key === 'runbooks'    ? matchedRunbooks.length
                : matchedPMs.length;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  aria-pressed={tab === t.key}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                    tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <t.icon size={12} aria-hidden="true" />
                  {t.label}
                  {count > 0 && (
                    <span className={`ml-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center ${
                      tab === t.key ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filter kategori */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Filter kategori"
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Hasil pencarian */}
      {!q ? (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-slate-200 mb-4" aria-hidden="true" />
          <p className="text-slate-400">Mulai mengetik untuk mencari di seluruh Knowledge Base</p>
        </div>
      ) : totalResults === 0 ? (
        <EmptyState
          icon={Database}
          title="Tidak ada hasil ditemukan"
          message={`Tidak ditemukan hasil untuk "${query}". Coba kata kunci yang berbeda.`}
        />
      ) : (
        <div className="space-y-6">
          {/* Insiden */}
          {showIncidents && matchedIncidents.length > 0 && (
            <section aria-label="Hasil insiden">
              {tab === 'all' && <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Insiden ({matchedIncidents.length})</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchedIncidents.map(inc => (
                  <IncidentResult key={inc.id} incident={inc} query={query} onOpenDetail={onOpenDetail} />
                ))}
              </div>
            </section>
          )}

          {/* Runbooks */}
          {showRunbooks && matchedRunbooks.length > 0 && (
            <section aria-label="Hasil runbook">
              {tab === 'all' && <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Runbooks ({matchedRunbooks.length})</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchedRunbooks.map(rb => (
                  <RunbookResult key={rb.id} runbook={rb} query={query} onNavigate={onNavigate} />
                ))}
              </div>
            </section>
          )}

          {/* Post-Mortems */}
          {showPMs && matchedPMs.length > 0 && (
            <section aria-label="Hasil post-mortem">
              {tab === 'all' && <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Post-Mortems ({matchedPMs.length})</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchedPMs.map(pm => {
                  const inc = state.incidents.find(i => i.id === pm.incidentId);
                  return <PostMortemResult key={pm.id} pm={pm} incident={inc} query={query} onNavigate={onNavigate} />;
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default KnowledgeBasePage;
