import { buildingById } from '../data/buildings';
import { FACILITIES, PLACES } from '../data/facilities';
import type { Selection } from '../store';
import { useStore } from '../store';
import { FACILITY_W, layoutById, PLACE_W, roomByKey } from './layout';

export interface Focus { target: [number, number, number]; distance: number; floor?: 'all' | number; name: string; navNode?: string }

export function focusOf(sel: Selection): Focus | null {
  if (sel.kind === 'building') {
    const l = layoutById[sel.id]; if (!l) return null;
    return { target: l.center, distance: Math.max(55, l.size * 2), name: l.def.name, navNode: l.def.navNode };
  }
  if (sel.kind === 'room') {
    const r = roomByKey[sel.key]; if (!r) return null;
    const l = layoutById[r.buildingId];
    return { target: [r.rect.cx, r.y + l.storey / 2, r.rect.cz], distance: 75, floor: r.floor, name: r.name, navNode: l.def.navNode };
  }
  if (sel.kind === 'facility') {
    const f = FACILITY_W.find((x) => x.def.id === sel.id); if (!f) return null;
    return { target: [f.rect.cx, 0, f.rect.cz], distance: Math.max(50, Math.max(f.rect.w, f.rect.d) * 1.4), name: f.def.name, navNode: f.def.navNode };
  }
  const p = PLACE_W.find((x) => x.def.id === sel.id); if (!p) return null;
  return { target: [p.pos[0], 0, p.pos[1]], distance: p.def.kind === 'track' ? 130 : 60, name: p.def.name, navNode: p.def.navNode };
}

/** 選取並移動鏡頭 */
export function focusSelection(sel: Selection, fly = true) {
  const st = useStore.getState();
  st.select(sel);
  const f = focusOf(sel);
  if (!f) return;
  if (f.floor !== undefined) st.setFloor(f.floor);
  if (fly && !st.walk) st.flyTo(f.target, f.distance, st.view === '2d');
}

export function selectionName(sel: Selection): string {
  if (sel.kind === 'building') return buildingById[sel.id]?.name ?? '';
  if (sel.kind === 'room') return roomByKey[sel.key]?.name ?? '';
  if (sel.kind === 'facility') return FACILITIES.find((f) => f.id === sel.id)?.name ?? '';
  return PLACES.find((p) => p.id === sel.id)?.name ?? '';
}
