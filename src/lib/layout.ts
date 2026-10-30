import { BUILDINGS } from '../data/buildings';
import { CLASSROOMS } from '../data/classrooms';
import { CAMPUS_OUTLINE, FACILITIES, PLACES } from '../data/facilities';
import { makeRect, rectToWorld, STOREY, toWorld, type WorldRect } from '../data/geo';
import type { BuildingDef, Room } from '../data/types';

export const CORRIDOR = 2.6; // 走廊寬（估算）

export interface RoomLayout extends Room {
  key: string;
  buildingId: string;
  floor: number;
  rect: WorldRect;
  y: number;
}

export interface FloorLayout { floor: number; y: number; rooms: RoomLayout[] }

export interface BuildingLayout {
  def: BuildingDef;
  /** 量體（第一個為主體） */
  rects: WorldRect[];
  corridor?: WorldRect;
  corridorSide?: 'n' | 's' | 'e' | 'w';
  storey: number;
  height: number;
  levels: number[]; // -1 = B1
  floors: FloorLayout[];
  center: [number, number, number];
  size: number;
}

function footprint(b: BuildingDef): { rects: WorldRect[]; corridor?: WorldRect } {
  const main = rectToWorld(b.planRect);
  const rects = [main, ...(b.extraRects ?? []).map(rectToWorld)];
  if (!b.depthFromArea || !b.floorArea) return { rects };
  const levels = b.floors + (b.basement ? 1 : 0);
  const along = b.axis === 'z' ? main.d : main.w;
  const depth = Math.min(b.floorArea / levels / along, b.axis === 'z' ? main.w : main.d);
  let r: WorldRect, c: WorldRect;
  switch (b.depthFromArea) {
    case 's': r = makeRect(main.x1, main.z2 - depth, main.x2, main.z2); c = makeRect(main.x1, main.z2 - CORRIDOR, main.x2, main.z2); break;
    case 'n': r = makeRect(main.x1, main.z1, main.x2, main.z1 + depth); c = makeRect(main.x1, main.z1, main.x2, main.z1 + CORRIDOR); break;
    case 'e': r = makeRect(main.x2 - depth, main.z1, main.x2, main.z2); c = makeRect(main.x2 - CORRIDOR, main.z1, main.x2, main.z2); break;
    default: r = makeRect(main.x1, main.z1, main.x1 + depth, main.z2); c = makeRect(main.x1, main.z1, main.x1 + CORRIDOR, main.z2);
  }
  return { rects: [r, ...rects.slice(1)], corridor: c };
}

function layoutBuilding(b: BuildingDef): BuildingLayout {
  const { rects, corridor } = footprint(b);
  const storey = STOREY * (b.storeyScale ?? 1);
  const levels: number[] = [];
  if (b.basement) levels.push(-1);
  for (let i = 1; i <= b.floors; i++) levels.push(i);
  const main = rects[0];
  const data = CLASSROOMS[b.id];
  const floors: FloorLayout[] = levels.map((floor) => {
    const y = floor < 0 ? -storey : (floor - 1) * storey;
    const list = data?.[floor] ?? [];
    const rooms: RoomLayout[] = [];
    if (list.length && corridor) {
      const side = b.depthFromArea!;
      const roomBand = side === 's' ? makeRect(main.x1, main.z1, main.x2, corridor.z1)
        : side === 'n' ? makeRect(main.x1, corridor.z2, main.x2, main.z2)
        : side === 'e' ? makeRect(main.x1, main.z1, corridor.x1, main.z2)
        : makeRect(corridor.x2, main.z1, main.x2, main.z2);
      const units = list.reduce((s, r) => s + (r.span ?? 1), 0);
      const alongX = b.axis !== 'z';
      const len = alongX ? roomBand.w : roomBand.d;
      let acc = 0;
      list.forEach((r, i) => {
        const L = (len * (r.span ?? 1)) / units;
        const a = acc; acc += L;
        const rect = alongX
          ? makeRect(roomBand.x1 + a, roomBand.z1, roomBand.x1 + a + L, roomBand.z2)
          : makeRect(roomBand.x1, roomBand.z1 + a, roomBand.x2, roomBand.z1 + a + L);
        rooms.push({ ...r, key: `${b.id}:${floor}:${i}`, buildingId: b.id, floor, rect, y });
      });
    }
    return { floor, y, rooms };
  });
  const height = b.floors * storey + (b.roof === 'gable' ? storey * 0.6 : 0);
  return {
    def: b, rects, corridor, corridorSide: b.depthFromArea, storey, height, levels, floors,
    center: [main.cx, height / 2, main.cz], size: Math.max(main.w, main.d)
  };
}

export const LAYOUTS: BuildingLayout[] = BUILDINGS.map(layoutBuilding);
export const layoutById: Record<string, BuildingLayout> = Object.fromEntries(LAYOUTS.map((l) => [l.def.id, l]));

export const OUTLINE_W: [number, number][] = CAMPUS_OUTLINE.map(toWorld);

export const ALL_ROOMS: RoomLayout[] = LAYOUTS.flatMap((l) => l.floors.flatMap((f) => f.rooms));
export const roomByKey: Record<string, RoomLayout> = Object.fromEntries(ALL_ROOMS.map((r) => [r.key, r]));

export const FACILITY_W = FACILITIES.map((f) => ({ def: f, rect: rectToWorld(f.planRect) }));
export const PLACE_W = PLACES.map((p) => ({ def: p, pos: toWorld(p.plan) }));

/** 漫步碰撞：建築地面層、實心設施、鐘樓 */
export const SOLIDS: WorldRect[] = [
  ...LAYOUTS.flatMap((l) => l.rects),
  ...FACILITY_W.filter((f) => f.def.solid).map((f) => f.rect),
  ...PLACE_W.filter((p) => p.def.kind === 'tower').map((p) => makeRect(p.pos[0] - 2.5, p.pos[1] - 2.5, p.pos[0] + 2.5, p.pos[1] + 2.5))
];

export function isNumericClass(code: string) { return /^\d{3}$/.test(code); }
export const floorName = (n: number) => (n < 0 ? 'B1' : `${n}F`);
