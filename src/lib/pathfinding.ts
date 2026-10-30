import { toWorld } from '../data/geo';
import { NAV_EDGES, NAV_NODES, type NavNode } from '../data/roads';

export interface Route { nodes: NavNode[]; points: [number, number][]; length: number; minutes: number; schematic: boolean }

const nodeById: Record<string, NavNode> = Object.fromEntries(NAV_NODES.map((n) => [n.id, n]));
const W = (id: string) => toWorld(nodeById[id].plan);
const adj: Record<string, { to: string; w: number; confirmed: boolean; accessible: boolean }[]> = {};
for (const e of NAV_EDGES) {
  const [ax, az] = W(e.a), [bx, bz] = W(e.b), w = Math.hypot(bx - ax, bz - az);
  (adj[e.a] ??= []).push({ to: e.b, w, confirmed: e.confirmed, accessible: e.accessible });
  (adj[e.b] ??= []).push({ to: e.a, w, confirmed: e.confirmed, accessible: e.accessible });
}

export const NAMED_NODES = NAV_NODES.filter((n) => n.name);
export { nodeById };

/** Dijkstra 最短路徑；accessibleOnly 時只走標記為無障礙的連線 */
export function findRoute(from: string, to: string, accessibleOnly = false): Route | null {
  if (!adj[from] || !adj[to]) return null;
  const dist: Record<string, number> = { [from]: 0 };
  const prev: Record<string, string> = {};
  const done = new Set<string>();
  let schematic = false;
  while (true) {
    let u: string | null = null, best = Infinity;
    for (const k in dist) if (!done.has(k) && dist[k] < best) { best = dist[k]; u = k; }
    if (u === null) return null;
    if (u === to) break;
    done.add(u);
    for (const e of adj[u]) {
      if (accessibleOnly && !e.accessible) continue;
      const nd = dist[u] + e.w;
      if (nd < (dist[e.to] ?? Infinity)) { dist[e.to] = nd; prev[e.to] = u; }
    }
  }
  const ids: string[] = [to];
  while (ids[0] !== from) ids.unshift(prev[ids[0]]);
  for (let i = 1; i < ids.length; i++) if (!adj[ids[i - 1]].find((e) => e.to === ids[i])?.confirmed) schematic = true;
  const length = dist[to];
  return { nodes: ids.map((i) => nodeById[i]), points: ids.map(W), length, minutes: length / 70, schematic };
}
