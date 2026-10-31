/**
 * App.jsx
 * Root komponen ResolveIQ.
 * Mengelola navigasi halaman via useState (tanpa React Router),
 * menyediakan IncidentProvider, ToastContainer, dan layout utama.
 * Termasuk modal form laporkan insiden yang bisa dibuka dari mana saja.
 */

import { useState, useCallback } from 'react';
import { IncidentProvider } from './context/IncidentContext.jsx';
import { ToastContainer } from './components/common/Toast.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { PAGES } from './utils/constants.js';

// Pages
import DashboardPage     from './pages/DashboardPage.jsx';
import IncidentsPage     from './pages/IncidentsPage.jsx';
import RunbooksPage      from './pages/RunbooksPage.jsx';
import PostMortemsPage   from './pages/PostMortemsPage.jsx';
import KnowledgeBasePage from './pages/KnowledgeBasePage.jsx';

// Layout
import Sidebar      from './components/layout/Sidebar.jsx';
import TopNav       from './components/layout/TopNav.jsx';

// Form insiden global — hidup di level App agar bisa dibuka dari halaman mana saja
import IncidentForm from './components/incidents/IncidentForm.jsx';

/**
 * Hook sederhana untuk mengelola daftar toast aktif.
 */
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}

/**
 * Merender halaman yang sesuai dengan currentPage.
 */
function PageRenderer({
  currentPage,
  onNavigate,
  onOpenIncidentForm,
  onOpenDetail,
  addToast,
  selectedIncident,
  setSelectedIncident,
}) {
  const sharedProps = {
    onNavigate,
    onOpenIncidentForm,
    onOpenDetail,
    addToast,
    selectedIncident,
    setSelectedIncident,
  };

  switch (currentPage) {
    case PAGES.DASHBOARD:
      return <DashboardPage {...sharedProps} />;
    case PAGES.INCIDENTS:
      return <IncidentsPage {...sharedProps} />;
    case PAGES.RUNBOOKS:
      return <RunbooksPage {...sharedProps} />;
    case PAGES.POST_MORTEMS:
      return <PostMortemsPage {...sharedProps} />;
    case PAGES.KNOWLEDGE_BASE:
      return <KnowledgeBasePage {...sharedProps} />;
    default:
      return <DashboardPage {...sharedProps} />;
  }
}

function App() {
  const [currentPage,      setCurrentPage]      = useState(PAGES.DASHBOARD);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  // incidentFormOpen dikelola di App agar modal bisa dibuka dari halaman mana saja
  const [incidentFormOpen, setIncidentFormOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const { toasts, addToast, dismissToast } = useToast();

  const handleNavigate = useCallback((page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  }, []);

  // Satu-satunya fungsi yang membuka form — dipakai TopNav, Dashboard, dan halaman lain
  const handleOpenIncidentForm = useCallback(() => {
    setIncidentFormOpen(true);
  }, []);

  const handleOpenDetail = useCallback((incident) => {
    setSelectedIncident(incident);
    setCurrentPage(PAGES.INCIDENTS);
  }, []);

  return (
    <IncidentProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        {/* Area konten utama */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TopNav */}
          <TopNav
            currentPage={currentPage}
            onMenuToggle={() => setSidebarOpen(o => !o)}
            onOpenIncidentForm={handleOpenIncidentForm}
            onNavigate={handleNavigate}
            onOpenDetail={handleOpenDetail}
            addToast={addToast}
          />

          {/* Konten halaman */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 md:p-6"
          >
            <ErrorBoundary>
              <PageRenderer
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onOpenIncidentForm={handleOpenIncidentForm}
                onOpenDetail={handleOpenDetail}
                addToast={addToast}
                selectedIncident={selectedIncident}
                setSelectedIncident={setSelectedIncident}
              />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* IncidentForm global — di sini agar bisa dibuka dari SEMUA halaman */}
      <IncidentForm
        isOpen={incidentFormOpen}
        onClose={() => setIncidentFormOpen(false)}
        addToast={addToast}
        onCreated={() => {
          // Navigasi ke halaman Incidents agar user langsung melihat insiden baru
          setCurrentPage(PAGES.INCIDENTS);
        }}
      />

      {/* Toast container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </IncidentProvider>
  );
}

export default App;
