/**
 * RunbooksPage.jsx
 * Halaman manajemen runbook: list + viewer + form tambah/edit.
 *
 * @param {object}   props
 * @param {Function} props.onNavigate - Callback navigasi
 * @param {Function} props.addToast   - Callback toast
 */

import { useState, useCallback } from 'react';
import { useIncidents } from '../context/IncidentContext.jsx';
import RunbookList   from '../components/runbooks/RunbookList.jsx';
import RunbookViewer from '../components/runbooks/RunbookViewer.jsx';
import RunbookForm   from '../components/runbooks/RunbookForm.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';

function RunbooksPage({ onNavigate, addToast }) {
  const { state, dispatch } = useIncidents();
  const [selectedId,    setSelectedId]    = useState(state.runbooks[0]?.id ?? null);
  const [formOpen,      setFormOpen]      = useState(false);
  const [editRunbook,   setEditRunbook]   = useState(null);
  const [deleteId,      setDeleteId]      = useState(null);

  const selectedRunbook = state.runbooks.find(rb => rb.id === selectedId) ?? null;

  const handleAdd = () => { setEditRunbook(null); setFormOpen(true); };
  const handleEdit = (rb) => { setEditRunbook(rb); setFormOpen(true); };
  const handleDeleteConfirm = (id) => setDeleteId(id);

  const handleSave = useCallback((data) => {
    if (data.id) {
      dispatch({ type: 'UPDATE_RUNBOOK', payload: data });
      addToast('Runbook berhasil diperbarui.', 'success');
    } else {
      dispatch({ type: 'ADD_RUNBOOK', payload: data });
      addToast('Runbook baru berhasil ditambahkan.', 'success');
    }
  }, [dispatch, addToast]);

  const handleDelete = useCallback(() => {
    dispatch({ type: 'DELETE_RUNBOOK', payload: { id: deleteId } });
    if (selectedId === deleteId) setSelectedId(state.runbooks.find(rb => rb.id !== deleteId)?.id ?? null);
    setDeleteId(null);
    addToast('Runbook dihapus.', 'info');
  }, [dispatch, deleteId, selectedId, state.runbooks, addToast]);

  const handleAcceptSuggestion = useCallback((runbookId, suggestionId, newStep) => {
    dispatch({ type: 'RESOLVE_SUGGESTION', payload: { runbookId, suggestionId, decision: 'accepted', newStep } });
    addToast('Usulan diterima dan langkah baru ditambahkan.', 'success');
  }, [dispatch, addToast]);

  const handleRejectSuggestion = useCallback((runbookId, suggestionId) => {
    dispatch({ type: 'RESOLVE_SUGGESTION', payload: { runbookId, suggestionId, decision: 'rejected' } });
    addToast('Usulan ditolak.', 'info');
  }, [dispatch, addToast]);

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Runbooks</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {state.runbooks.length} runbook · Prosedur penanganan insiden terstandar
        </p>
      </div>

      {/* Layout: list + viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-0">
          <ErrorBoundary>
            <RunbookList
              runbooks={state.runbooks}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteConfirm}
            />
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <RunbookViewer
              runbook={selectedRunbook}
              incidents={state.incidents}
              onEdit={() => selectedRunbook && handleEdit(selectedRunbook)}
              onAcceptSuggestion={handleAcceptSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Form tambah/edit */}
      <RunbookForm
        isOpen={formOpen}
        runbook={editRunbook}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      {/* Konfirmasi hapus */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Runbook?"
        message="Runbook ini akan dihapus permanen."
        confirmLabel="Hapus Runbook"
      />
    </div>
  );
}

export default RunbooksPage;
