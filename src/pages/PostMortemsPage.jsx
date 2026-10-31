/**
 * PostMortemsPage.jsx
 * Halaman Post-Mortems: list kartu + wizard buat/edit + preview.
 *
 * @param {object}   props
 * @param {Function} props.onNavigate - Callback navigasi
 * @param {Function} props.addToast   - Callback toast
 */

import { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { useIncidents } from '../context/IncidentContext.jsx';
import PostMortemList    from '../components/postmortem/PostMortemList.jsx';
import PostMortemWizard  from '../components/postmortem/PostMortemWizard.jsx';
import PostMortemPreview from '../components/postmortem/PostMortemPreview.jsx';
import ConfirmDialog     from '../components/common/ConfirmDialog.jsx';
import ErrorBoundary     from '../components/common/ErrorBoundary.jsx';

// Mode tampilan halaman
const MODE = { LIST: 'list', WIZARD: 'wizard', PREVIEW: 'preview' };

function PostMortemsPage({ onNavigate, addToast }) {
  const { state, dispatch } = useIncidents();
  const [mode,       setMode]       = useState(MODE.LIST);
  const [activePM,   setActivePM]   = useState(null);
  const [activeInc,  setActiveInc]  = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);

  // Temukan insiden resolved/closed yang belum punya PM (untuk buat baru)
  const incidentsNeedPM = state.incidents.filter(
    i => (i.status === 'Resolved' || i.status === 'Closed') && !i.postMortemId
  );

  const handleCreate = useCallback(() => {
    if (incidentsNeedPM.length === 0) {
      addToast('Tidak ada insiden resolved yang belum punya post-mortem.', 'info');
      return;
    }
    setActiveInc(incidentsNeedPM[0]);
    setActivePM(null);
    setMode(MODE.WIZARD);
  }, [incidentsNeedPM, addToast]);

  const handleView = useCallback((pm) => {
    const inc = state.incidents.find(i => i.id === pm.incidentId);
    setActivePM(pm);
    setActiveInc(inc ?? null);
    setMode(MODE.PREVIEW);
  }, [state.incidents]);

  const handleEdit = useCallback((pm) => {
    const inc = state.incidents.find(i => i.id === pm.incidentId);
    setActivePM(pm);
    setActiveInc(inc ?? null);
    setMode(MODE.WIZARD);
  }, [state.incidents]);

  const handleSaveWizard = useCallback((data) => {
    if (activePM?.id) {
      dispatch({ type: 'UPDATE_POST_MORTEM', payload: { ...data, id: activePM.id } });
      addToast('Post-mortem berhasil diperbarui.', 'success');
      // Setelah simpan, tampilkan preview
      const updated = { ...activePM, ...data, id: activePM.id };
      setActivePM(updated);
      setMode(MODE.PREVIEW);
    } else {
      dispatch({ type: 'ADD_POST_MORTEM', payload: data });
      addToast('Post-mortem berhasil dibuat.', 'success');
      setMode(MODE.LIST);
    }
  }, [activePM, dispatch, addToast]);

  const handleDelete = useCallback(() => {
    dispatch({ type: 'DELETE_POST_MORTEM', payload: { id: deleteId } });
    addToast('Post-mortem dihapus.', 'info');
    setDeleteId(null);
    if (activePM?.id === deleteId) { setActivePM(null); setMode(MODE.LIST); }
  }, [dispatch, deleteId, activePM, addToast]);

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Post-Mortems</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {state.postMortems.length} post-mortem
            {incidentsNeedPM.length > 0 && (
              <span className="text-amber-600 font-medium"> · {incidentsNeedPM.length} insiden belum punya PM</span>
            )}
          </p>
        </div>
        {mode === MODE.LIST && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={16} aria-hidden="true" />
            Buat Post-Mortem
          </button>
        )}
        {mode !== MODE.LIST && (
          <button
            onClick={() => setMode(MODE.LIST)}
            className="text-sm text-brand-600 hover:text-blue-800 font-medium"
          >
            ← Kembali ke Daftar
          </button>
        )}
      </div>

      {/* Konten per mode */}
      <ErrorBoundary>
        {mode === MODE.LIST && (
          <PostMortemList
            postMortems={state.postMortems}
            incidents={state.incidents}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteId(id)}
            onCreate={handleCreate}
          />
        )}

        {mode === MODE.WIZARD && activeInc && (
          <PostMortemWizard
            incident={activeInc}
            existing={activePM}
            onSave={handleSaveWizard}
            onCancel={() => setMode(MODE.LIST)}
          />
        )}

        {mode === MODE.PREVIEW && activePM && (
          <PostMortemPreview
            postMortem={activePM}
            incident={activeInc}
            addToast={addToast}
            onClose={() => setMode(MODE.LIST)}
          />
        )}
      </ErrorBoundary>

      {/* Konfirmasi hapus */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Post-Mortem?"
        message="Post-mortem ini akan dihapus permanen. Insiden terkait juga akan di-unlink."
        confirmLabel="Hapus Post-Mortem"
      />
    </div>
  );
}

export default PostMortemsPage;
