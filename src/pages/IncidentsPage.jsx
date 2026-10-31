/**
 * IncidentsPage.jsx
 * Halaman manajemen insiden ResolveIQ.
 * Fitur: toolbar filter, tabel/card insiden, dan panel detail.
 * Form pelaporan insiden dikelola di App.jsx (global) agar bisa dibuka dari halaman mana saja.
 *
 * @param {object}   props
 * @param {Function} props.onNavigate          - Callback navigasi halaman
 * @param {Function} props.onOpenIncidentForm  - Callback buka form laporkan insiden (di App.jsx)
 * @param {Function} props.addToast            - Callback toast
 * @param {object}   props.selectedIncident    - Insiden yang dibuka dari halaman lain
 * @param {Function} props.setSelectedIncident - Setter selected incident
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useIncidents } from '../context/IncidentContext.jsx';
import { sortIncidents } from '../utils/stats.js';
import IncidentFilters from '../components/incidents/IncidentFilters.jsx';
import IncidentTable   from '../components/incidents/IncidentTable.jsx';
import IncidentDetail  from '../components/incidents/IncidentDetail.jsx';
import ErrorBoundary   from '../components/common/ErrorBoundary.jsx';

const DEFAULT_FILTERS = {
  search:   '',
  severity: '',
  status:   '',
  category: '',
  system:   '',
  sort:     'newest',
};

function IncidentsPage({
  onNavigate,
  onOpenIncidentForm,
  addToast,
  selectedIncident,
  setSelectedIncident,
}) {
  const { state }   = useIncidents();
  const [filters, setFilters]     = useState(DEFAULT_FILTERS);
  const [detailInc, setDetailInc] = useState(selectedIncident ?? null);

  // Sinkronkan selectedIncident dari navigasi halaman lain (misal klik dari Dashboard)
  useEffect(() => {
    if (selectedIncident) {
      setDetailInc(selectedIncident);
      setSelectedIncident(null);
    }
  }, [selectedIncident, setSelectedIncident]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
  }, []);

  const handleReset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  // Filter + sort insiden
  const filteredIncidents = useMemo(() => {
    let result = state.incidents;
    const q = filters.search.toLowerCase().trim();

    if (q) {
      result = result.filter(i =>
        i.id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        (i.tags ?? []).some(t => t.toLowerCase().includes(q)),
      );
    }
    if (filters.severity) result = result.filter(i => i.severity === filters.severity);
    if (filters.status)   result = result.filter(i => i.status   === filters.status);
    if (filters.category) result = result.filter(i => i.category === filters.category);
    if (filters.system)   result = result.filter(i => i.system   === filters.system);

    return sortIncidents(result, filters.sort);
  }, [state.incidents, filters]);

  const handleOpenDetail = useCallback((inc) => {
    setDetailInc(inc);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailInc(null);
  }, []);

  const handleCreatePM = useCallback((incident) => {
    // Navigasi ke Post-Mortems dan bawa incident sebagai state
    setDetailInc(null);
    onNavigate('Post-Mortems');
    addToast(`Buat post-mortem untuk ${incident.id}`, 'info');
  }, [onNavigate, addToast]);

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Incidents</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {state.incidents.length} insiden total · {filteredIncidents.length} ditampilkan
          </p>
        </div>
        <button
          onClick={onOpenIncidentForm}
          aria-label="Laporkan insiden baru"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Laporkan Insiden</span>
          <span className="sm:hidden">Laporkan</span>
        </button>
      </div>

      {/* Layout: tabel + panel detail */}
      {detailInc ? (
        /* Mode detail: split view jika cukup lebar */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Tabel di kiri */}
          <div className="space-y-4">
            <ErrorBoundary>
              <IncidentFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                resultCount={filteredIncidents.length}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <IncidentTable
                incidents={filteredIncidents}
                onOpenDetail={handleOpenDetail}
                onNavigate={onNavigate}
              />
            </ErrorBoundary>
          </div>

          {/* Detail di kanan */}
          <div className="xl:sticky xl:top-0 xl:self-start">
            <ErrorBoundary>
              <IncidentDetail
                incident={detailInc}
                onClose={handleCloseDetail}
                onNavigate={onNavigate}
                addToast={addToast}
                onCreatePM={handleCreatePM}
              />
            </ErrorBoundary>
          </div>
        </div>
      ) : (
        /* Mode list normal */
        <div className="space-y-4">
          <ErrorBoundary>
            <IncidentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              resultCount={filteredIncidents.length}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <IncidentTable
              incidents={filteredIncidents}
              onOpenDetail={handleOpenDetail}
              onNavigate={onNavigate}
            />
          </ErrorBoundary>
        </div>
      )}

    </div>
  );
}

export default IncidentsPage;
