import type { PlanPoint, PlanRect } from './types';

/**
 * 世界座標：公尺，X 向東、Z 向南（北方為 -Z），Y 向上。
 *
 * 比例尺校正：官方簡介記載校地 11 公頃，平面圖校界多邊形面積為 1,051,993 px²，
 * 推得 √(110000 / 1051993) ≈ 0.3234 公尺／像素。
 */
export const M_PER_PX = 0.3234;
export const PLAN_ORIGIN: PlanPoint = [720, 840];
export const STOREY = 3.6; // 一般樓層高度（估算值）

export function toWorld([x, y]: PlanPoint): [number, number] {
  return [(x - PLAN_ORIGIN[0]) * M_PER_PX, (y - PLAN_ORIGIN[1]) * M_PER_PX];
}

export interface WorldRect { x1: number; z1: number; x2: number; z2: number; w: number; d: number; cx: number; cz: number }

export function rectToWorld(r: PlanRect): WorldRect {
  const [x1, z1] = toWorld([r[0], r[1]]);
  const [x2, z2] = toWorld([r[2], r[3]]);
  return { x1, z1, x2, z2, w: x2 - x1, d: z2 - z1, cx: (x1 + x2) / 2, cz: (z1 + z2) / 2 };
}

export function makeRect(x1: number, z1: number, x2: number, z2: number): WorldRect {
  return { x1, z1, x2, z2, w: x2 - x1, d: z2 - z1, cx: (x1 + x2) / 2, cz: (z1 + z2) / 2 };
}

export function pointInPolygon(x: number, z: number, poly: [number, number][]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
