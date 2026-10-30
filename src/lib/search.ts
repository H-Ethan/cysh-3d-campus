import { BUILDINGS } from '../data/buildings';
import { FACILITIES, PLACES } from '../data/facilities';
import type { RoomType } from '../data/types';
import type { Selection } from '../store';
import { ALL_ROOMS, floorName, isNumericClass } from './layout';

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  class1: '高一', class2: '高二', class3: '高三', special: '專科教室', office: '處室', stair: '樓梯', common: '公共空間'
};
export const ROOM_TYPE_VAR: Record<RoomType, string> = {
  class1: 'var(--g1)', class2: 'var(--g2)', class3: 'var(--g3)', special: 'var(--special)', office: 'var(--office)', stair: 'var(--stair)', common: 'var(--common)'
};

export interface SearchItem { label: string; sub: string; group: '班級' | '處室／教室' | '建築' | '設施' | '地點'; keys: string; sel: Selection; rank: number }

const bName = Object.fromEntries(BUILDINGS.map((b) => [b.id, b.name]));

export function roomTitle(code: string, name: string) {
  if (!isNumericClass(code)) return name;
  const tag = name.replace(code, '').trim();
  return tag ? `${code} 班（${tag}）` : `${code} 班`;
}

export const SEARCH_INDEX: SearchItem[] = [
  ...ALL_ROOMS.filter((r) => r.type !== 'stair').map<SearchItem>((r) => ({
    label: roomTitle(r.code, r.name),
    sub: `${bName[r.buildingId]} ${floorName(r.floor)}・${ROOM_TYPE_LABEL[r.type]}`,
    group: isNumericClass(r.code) ? '班級' : '處室／教室',
    keys: `${r.code} ${r.name} ${ROOM_TYPE_LABEL[r.type]}`,
    sel: { kind: 'room', key: r.key },
    rank: isNumericClass(r.code) ? 0 : 1
  })),
  ...BUILDINGS.map<SearchItem>((b) => ({
    label: b.name + (b.sub ? `（${b.sub}）` : ''), sub: b.category, group: b.minor ? '設施' : '建築',
    keys: `${b.name} ${b.sub ?? ''} ${b.category}`, sel: { kind: 'building', id: b.id }, rank: b.minor ? 3 : 1
  })),
  ...FACILITIES.filter((f) => f.listed).map<SearchItem>((f) => ({
    label: f.name, sub: f.category, group: '設施', keys: `${f.name} ${f.category}`, sel: { kind: 'facility', id: f.id }, rank: 2
  })),
  ...PLACES.map<SearchItem>((p) => ({
    label: p.name, sub: p.category, group: '地點', keys: `${p.name} ${p.category}`, sel: { kind: 'place', id: p.id }, rank: 2
  }))
];

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

export function search(q: string, limit = 16): SearchItem[] {
  const s = norm(q);
  if (!s) return [];
  return SEARCH_INDEX
    .map((i) => {
      const k = norm(i.keys + i.label);
      if (!k.includes(s)) return null;
      const starts = norm(i.label).startsWith(s) || norm(i.keys).startsWith(s) ? 0 : 1;
      return { i, score: starts * 10 + i.rank };
    })
    .filter((x): x is { i: SearchItem; score: number } => !!x)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.i);
}
