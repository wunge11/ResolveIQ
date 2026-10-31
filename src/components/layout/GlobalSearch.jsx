/**
 * GlobalSearch.jsx
 * Komponen pencarian global yang mencari berdasarkan ID, judul, dan tag insiden.
 * Hasil tampil sebagai dropdown; klik hasil membuka detail insiden.
 *
 * @param {object}   props
 * @param {Function} props.onOpenDetail - Callback untuk membuka detail insiden
 * @param {Function} props.onNavigate   - Callback navigasi halaman
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext.jsx';
import { getSeverityColor, getStatusColor } from '../../utils/severity.js';
import Badge from '../common/Badge.jsx';

/**
 * Menyoroti kata kunci dalam teks dengan elemen <mark>.
 * @param {string} text    - Teks asli
 * @param {string} query   - Kata kunci yang dicari
 * @returns {string} Teks dengan penanda highlight (sebagai plain text dengan mark tag)
 */
function highlightText(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i}>{part}</mark>
      : part
  );
}

function GlobalSearch({ onOpenDetail, onNavigate }) {
  const { state }       = useIncidents();
  const [query, setQuery]   = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const inputRef    = useRef(null);
  const containerRef = useRef(null);

  // Cari insiden yang cocok
  const results = query.trim().length >= 2
    ? state.incidents
        .filter(inc => {
          const q = query.toLowerCase();
          return (
            inc.id.toLowerCase().includes(q) ||
            inc.title.toLowerCase().includes(q) ||
            (inc.tags ?? []).some(t => t.toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
    : [];

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocused(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setFocused(-1);
  };

  const handleSelect = useCallback((incident) => {
    setQuery('');
    setIsOpen(false);
    setFocused(-1);
    onOpenDetail(incident);
  }, [onOpenDetail]);

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Navigasi keyboard di dropdown
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocused(f => Math.min(f + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocused(f => Math.max(f - 1, -1));
    } else if (e.key === 'Enter' && focused >= 0) {
      e.preventDefault();
      handleSelect(results[focused]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setFocused(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      {/* Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Cari insiden berdasarkan ID, judul, atau tag"
          aria-expanded={isOpen && results.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Cari insiden…"
          className="w-full pl-9 pr-8 py-1.5 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white transition-colors"
        />
        {query && (
          <button
            onClick={handleClear}
            aria-label="Hapus pencarian"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown hasil */}
      {isOpen && results.length > 0 && (
        <ul
          role="listbox"
          aria-label="Hasil pencarian insiden"
          className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-72 overflow-y-auto"
        >
          {results.map((inc, idx) => (
            <li key={inc.id} role="option" aria-selected={focused === idx}>
              <button
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                  focused === idx ? 'bg-brand-50' : ''
                }`}
                onClick={() => handleSelect(inc)}
                onMouseEnter={() => setFocused(idx)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-slate-500">{inc.id}</span>
                  <Badge className={getSeverityColor(inc.severity)} size="sm">
                    {inc.severity}
                  </Badge>
                  <Badge className={getStatusColor(inc.status)} size="sm">
                    {inc.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-800 truncate">
                  {highlightText(inc.title, query)}
                </p>
                {inc.tags?.length > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {inc.tags.join(' · ')}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 px-4 py-3 text-sm text-slate-500">
          Tidak ada insiden ditemukan untuk "<strong>{query}</strong>"
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
