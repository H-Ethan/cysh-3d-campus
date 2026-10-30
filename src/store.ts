import { create } from 'zustand';
import type { Route } from './lib/pathfinding';

export type Selection =
  | { kind: 'building'; id: string }
  | { kind: 'room'; key: string }
  | { kind: 'facility'; id: string }
  | { kind: 'place'; id: string };

export interface FlyRequest { target: [number, number, number]; distance: number; topDown?: boolean; stamp: number }

export type Panel = 'search' | 'buildings' | 'facilities' | 'nav' | 'help';

interface State {
  selection: Selection | null;
  hovered: string | null;
  floor: 'all' | number;
  view: '3d' | '2d';
  walk: null | 'third' | 'first';
  route: Route | null;
  navFrom: string;
  navTo: string;
  quality: 'high' | 'low';
  look: 'white' | 'plan';
  labels: boolean;
  fly: FlyRequest | null;
  panel: Panel;
  panelOpen: boolean;
  select: (s: Selection | null) => void;
  hover: (id: string | null) => void;
  setFloor: (f: 'all' | number) => void;
  setView: (v: '3d' | '2d') => void;
  setWalk: (w: null | 'third' | 'first') => void;
  setRoute: (r: Route | null) => void;
  setNav: (from: string, to: string) => void;
  setQuality: (q: 'high' | 'low') => void;
  setLook: (l: 'white' | 'plan') => void;
  toggleLabels: () => void;
  flyTo: (target: [number, number, number], distance: number, topDown?: boolean) => void;
  setPanel: (p: Panel) => void;
  setPanelOpen: (o: boolean) => void;
}

function initialQuality(): 'high' | 'low' {
  try {
    const saved = localStorage.getItem('cysh-quality');
    if (saved === 'high' || saved === 'low') return saved;
  } catch { /* 無法存取 localStorage */ }
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  return coarse || cores <= 4 ? 'low' : 'high';
}

export const useStore = create<State>((set) => ({
  selection: null,
  hovered: null,
  floor: 'all',
  view: '3d',
  walk: null,
  route: null,
  navFrom: 'gate',
  navTo: '',
  quality: initialQuality(),
  look: 'white',
  labels: true,
  fly: null,
  panel: 'search',
  panelOpen: typeof innerWidth === 'number' ? innerWidth > 760 : true,
  select: (selection) => set({ selection }),
  hover: (hovered) => set({ hovered }),
  setFloor: (floor) => set({ floor }),
  setView: (view) => set({ view }),
  setWalk: (walk) => set({ walk }),
  setRoute: (route) => set({ route }),
  setNav: (navFrom, navTo) => set({ navFrom, navTo }),
  setQuality: (quality) => { try { localStorage.setItem('cysh-quality', quality); } catch { /* ignore */ } set({ quality }); },
  setLook: (look) => set({ look }),
  toggleLabels: () => set((s) => ({ labels: !s.labels })),
  flyTo: (target, distance, topDown) => set({ fly: { target, distance, topDown, stamp: performance.now() } }),
  setPanel: (panel) => set({ panel, panelOpen: true }),
  setPanelOpen: (panelOpen) => set({ panelOpen })
}));

/** 漫步搖桿輸入（UI 寫入、場景讀取） */
export const joystick = { x: 0, y: 0 };
