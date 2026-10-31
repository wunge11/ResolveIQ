/**
 * IncidentContext.jsx
 * State global aplikasi ResolveIQ menggunakan useReducer + Context.
 * Menyediakan data insiden, runbook, post-mortem, dan aktivitas kepada
 * seluruh komponen tanpa prop drilling.
 *
 * Struktur:
 * - IncidentProvider: membungkus aplikasi dan menyediakan state + dispatch
 * - useIncidents:     hook untuk mengakses context dari komponen manapun
 * - reducer:          menangani semua mutasi state (CRUD, status, dll.)
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { seedIncidents, generateNextIncidentId } from '../data/seedIncidents.js';
import { seedRunbooks } from '../data/seedRunbooks.js';
import { seedPostMortems } from '../data/seedPostMortems.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { daysAgoISO } from '../utils/date.js';

// Aktivitas seed awal
const SEED_ACTIVITIES = [
  { id: 'act-1',  type: 'incident_created',  message: 'Insiden INC-001 dilaporkan: API Gateway tidak merespons',                     time: daysAgoISO(0, 3),    refId: 'INC-001' },
  { id: 'act-2',  type: 'status_changed',    message: 'INC-001 status berubah dari Open menjadi Investigating',                      time: daysAgoISO(0, 2, 45),refId: 'INC-001' },
  { id: 'act-3',  type: 'incident_created',  message: 'Insiden INC-002 dilaporkan: Database Cluster latency tinggi',                  time: daysAgoISO(0, 5),    refId: 'INC-002' },
  { id: 'act-4',  type: 'incident_resolved', message: 'INC-003 berhasil diselesaikan: Auth Service gagal login',                     time: daysAgoISO(3, 8),    refId: 'INC-003' },
  { id: 'act-5',  type: 'postmortem_created',message: 'Post-mortem PM-001 dibuat untuk insiden INC-003',                             time: daysAgoISO(3, 6),    refId: 'PM-001'  },
  { id: 'act-6',  type: 'incident_resolved', message: 'INC-004 berhasil diselesaikan: Payment Service merchant code diperbaiki',      time: daysAgoISO(5, 12),   refId: 'INC-004' },
  { id: 'act-7',  type: 'postmortem_created',message: 'Post-mortem PM-002 dibuat untuk insiden INC-004',                             time: daysAgoISO(5, 10),   refId: 'PM-002'  },
  { id: 'act-8',  type: 'status_changed',    message: 'INC-006 status berubah dari Investigating menjadi Mitigated',                 time: daysAgoISO(2, 4, 30),refId: 'INC-006' },
  { id: 'act-9',  type: 'incident_closed',   message: 'INC-010 ditutup setelah post-mortem selesai',                                 time: daysAgoISO(14),      refId: 'INC-010' },
  { id: 'act-10', type: 'postmortem_created',message: 'Post-mortem PM-004 dibuat untuk insiden INC-010',                             time: daysAgoISO(15, 7),   refId: 'PM-004'  },
];

// ─── Context ───────────────────────────────────────────────────────────────

const IncidentContext = createContext(null);

// ─── Reducer ───────────────────────────────────────────────────────────────

/**
 * Reducer utama untuk semua mutasi state.
 * @param {object} state  - State saat ini
 * @param {object} action - Action { type, payload }
 * @returns {object} State baru
 */
function appReducer(state, action) {
  switch (action.type) {

    // ── Incidents ──────────────────────────────────────────────────────────

    case 'ADD_INCIDENT': {
      const newInc = {
        ...action.payload,
        id:          generateNextIncidentId(state.incidents),
        createdAt:   new Date().toISOString(),
        resolvedAt:  null,
        timeline:    [],
        runbookProgress: { runbookId: null, completedStepIds: [] },
        postMortemId: null,
      };
      const activity = {
        id:      `act-${Date.now()}`,
        type:    'incident_created',
        message: `Insiden ${newInc.id} dilaporkan: ${newInc.title}`,
        time:    newInc.createdAt,
        refId:   newInc.id,
      };
      return {
        ...state,
        incidents:  [newInc, ...state.incidents],
        activities: [activity, ...state.activities].slice(0, 50),
      };
    }

    case 'UPDATE_INCIDENT': {
      return {
        ...state,
        incidents: state.incidents.map(i =>
          i.id === action.payload.id ? { ...i, ...action.payload } : i,
        ),
      };
    }

    case 'DELETE_INCIDENT': {
      return {
        ...state,
        incidents: state.incidents.filter(i => i.id !== action.payload.id),
      };
    }

    case 'CHANGE_STATUS': {
      const { id, newStatus } = action.payload;
      const inc = state.incidents.find(i => i.id === id);
      if (!inc) return state;

      const timelineEntry = {
        id:     `TL-${Date.now()}`,
        time:   new Date().toISOString(),
        type:   newStatus === 'Resolved' ? 'Resolved' : 'Action',
        note:   `Status berubah dari ${inc.status} menjadi ${newStatus}`,
        author: 'Rina Aditya',
      };

      const resolvedAt = newStatus === 'Resolved' ? new Date().toISOString() : inc.resolvedAt;

      const activity = {
        id:      `act-${Date.now()}`,
        type:    newStatus === 'Resolved' ? 'incident_resolved' : 'status_changed',
        message: `${id} status berubah dari ${inc.status} menjadi ${newStatus}`,
        time:    new Date().toISOString(),
        refId:   id,
      };

      return {
        ...state,
        incidents: state.incidents.map(i =>
          i.id === id
            ? { ...i, status: newStatus, resolvedAt, timeline: [...i.timeline, timelineEntry] }
            : i,
        ),
        activities: [activity, ...state.activities].slice(0, 50),
      };
    }

    case 'ADD_TIMELINE_ENTRY': {
      const { incidentId, entry } = action.payload;
      return {
        ...state,
        incidents: state.incidents.map(i =>
          i.id === incidentId
            ? { ...i, timeline: [...i.timeline, { id: `TL-${Date.now()}`, ...entry }] }
            : i,
        ),
      };
    }

    case 'UPDATE_RUNBOOK_PROGRESS': {
      const { incidentId, runbookId, completedStepIds } = action.payload;
      return {
        ...state,
        incidents: state.incidents.map(i =>
          i.id === incidentId
            ? { ...i, runbookProgress: { runbookId, completedStepIds } }
            : i,
        ),
      };
    }

    // ── Runbooks ───────────────────────────────────────────────────────────

    case 'ADD_RUNBOOK': {
      const newRb = {
        ...action.payload,
        id:          `RB-${String(state.runbooks.length + 1).padStart(3, '0')}`,
        version:     '1.0',
        updatedAt:   new Date().toISOString(),
        suggestions: [],
      };
      return { ...state, runbooks: [newRb, ...state.runbooks] };
    }

    case 'UPDATE_RUNBOOK': {
      return {
        ...state,
        runbooks: state.runbooks.map(rb =>
          rb.id === action.payload.id
            ? { ...rb, ...action.payload, updatedAt: new Date().toISOString() }
            : rb,
        ),
      };
    }

    case 'DELETE_RUNBOOK': {
      return {
        ...state,
        runbooks: state.runbooks.filter(rb => rb.id !== action.payload.id),
      };
    }

    case 'ADD_RUNBOOK_SUGGESTION': {
      const { runbookId, suggestion } = action.payload;
      const newSug = { id: `sug-${Date.now()}`, status: 'pending', ...suggestion };
      return {
        ...state,
        runbooks: state.runbooks.map(rb =>
          rb.id === runbookId
            ? { ...rb, suggestions: [...(rb.suggestions ?? []), newSug] }
            : rb,
        ),
      };
    }

    case 'RESOLVE_SUGGESTION': {
      const { runbookId, suggestionId, decision, newStep } = action.payload;
      return {
        ...state,
        runbooks: state.runbooks.map(rb => {
          if (rb.id !== runbookId) return rb;
          const updatedSuggestions = rb.suggestions.map(s =>
            s.id === suggestionId ? { ...s, status: decision } : s,
          );
          const updatedSteps = decision === 'accepted' && newStep
            ? [...rb.steps, { id: `step-${Date.now()}`, text: newStep }]
            : rb.steps;
          const newVersion = decision === 'accepted'
            ? String((parseFloat(rb.version) + 0.1).toFixed(1))
            : rb.version;
          return {
            ...rb,
            suggestions: updatedSuggestions,
            steps:       updatedSteps,
            version:     newVersion,
            updatedAt:   new Date().toISOString(),
          };
        }),
      };
    }

    // ── Post-Mortems ───────────────────────────────────────────────────────

    case 'ADD_POST_MORTEM': {
      const newPm = {
        ...action.payload,
        id:        `PM-${String(state.postMortems.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const activity = {
        id:      `act-${Date.now()}`,
        type:    'postmortem_created',
        message: `Post-mortem ${newPm.id} dibuat untuk insiden ${newPm.incidentId}`,
        time:    newPm.createdAt,
        refId:   newPm.id,
      };
      const updatedIncidents = state.incidents.map(i =>
        i.id === newPm.incidentId ? { ...i, postMortemId: newPm.id } : i,
      );
      return {
        ...state,
        postMortems: [newPm, ...state.postMortems],
        incidents:   updatedIncidents,
        activities:  [activity, ...state.activities].slice(0, 50),
      };
    }

    case 'UPDATE_POST_MORTEM': {
      return {
        ...state,
        postMortems: state.postMortems.map(pm =>
          pm.id === action.payload.id
            ? { ...pm, ...action.payload, updatedAt: new Date().toISOString() }
            : pm,
        ),
      };
    }

    case 'DELETE_POST_MORTEM': {
      const pm = state.postMortems.find(p => p.id === action.payload.id);
      const updatedIncidents = pm
        ? state.incidents.map(i => i.id === pm.incidentId ? { ...i, postMortemId: null } : i)
        : state.incidents;
      return {
        ...state,
        postMortems: state.postMortems.filter(p => p.id !== action.payload.id),
        incidents:   updatedIncidents,
      };
    }

    case 'TOGGLE_ACTION_ITEM': {
      const { postMortemId, actionItemId } = action.payload;
      return {
        ...state,
        postMortems: state.postMortems.map(pm => {
          if (pm.id !== postMortemId) return pm;
          return {
            ...pm,
            actionItems: pm.actionItems.map(ai =>
              ai.id === actionItemId ? { ...ai, done: !ai.done } : ai,
            ),
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }

    // ── Alerts dismissed ──────────────────────────────────────────────────

    case 'DISMISS_ALERT': {
      return {
        ...state,
        dismissedAlerts: [...(state.dismissedAlerts ?? []), action.payload.alertId],
      };
    }

    // ── Reset data demo ────────────────────────────────────────────────────

    case 'RESET_DATA': {
      return {
        incidents:       seedIncidents,
        runbooks:        seedRunbooks,
        postMortems:     seedPostMortems,
        activities:      SEED_ACTIVITIES,
        dismissedAlerts: [],
      };
    }

    default:
      return state;
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────

/**
 * IncidentProvider membungkus seluruh aplikasi dan menyediakan state global.
 * Data di-persist ke localStorage sehingga bertahan setelah refresh.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function IncidentProvider({ children }) {
  const [savedIncidents,       setSavedIncidents]       = useLocalStorage(STORAGE_KEYS.INCIDENTS,             seedIncidents);
  const [savedRunbooks,        setSavedRunbooks]        = useLocalStorage(STORAGE_KEYS.RUNBOOKS,              seedRunbooks);
  const [savedPostMortems,     setSavedPostMortems]     = useLocalStorage(STORAGE_KEYS.POST_MORTEMS,          seedPostMortems);
  const [savedActivities,      setSavedActivities]      = useLocalStorage(STORAGE_KEYS.ACTIVITIES,            SEED_ACTIVITIES);
  const [savedDismissed,       setSavedDismissed]       = useLocalStorage('resolveiq:v1:dismissed-alerts',    []);

  const [state, dispatch] = useReducer(appReducer, {
    incidents:       savedIncidents,
    runbooks:        savedRunbooks,
    postMortems:     savedPostMortems,
    activities:      savedActivities,
    dismissedAlerts: savedDismissed,
  });

  // Sinkronisasi state ke localStorage setiap kali ada perubahan
  useEffect(() => { setSavedIncidents(state.incidents); },           [state.incidents]);           // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setSavedRunbooks(state.runbooks); },             [state.runbooks]);             // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setSavedPostMortems(state.postMortems); },       [state.postMortems]);         // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setSavedActivities(state.activities); },         [state.activities]);           // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setSavedDismissed(state.dismissedAlerts); },     [state.dismissedAlerts]);     // eslint-disable-line react-hooks/exhaustive-deps

  const value = { state, dispatch };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
}

/**
 * Hook untuk mengakses IncidentContext dari komponen manapun.
 * Melempar error jika digunakan di luar IncidentProvider.
 * @returns {{ state: object, dispatch: Function }}
 */
export function useIncidents() {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error('useIncidents harus digunakan di dalam IncidentProvider');
  return ctx;
}

export default IncidentContext;
