import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { memo, useMemo } from 'react';
import * as THREE from 'three';
import { STREETS, TRACK } from '../data/facilities';
import { M_PER_PX, toWorld, type WorldRect } from '../data/geo';
import type { FacilityDef, PlaceDef } from '../data/types';
import { FACILITY_W, OUTLINE_W, PLACE_W } from '../lib/layout';
import { focusSelection } from '../lib/selection';
import { useStore } from '../store';
import { MAT } from './palette';
import { PALMS } from '../data/vegetation';

function Slab({ r, y = 0, h = 0.1, color, roughness = 0.95, onClick }: { r: WorldRect; y?: number; h?: number; color: string; roughness?: number; onClick?: (e: ThreeEvent<MouseEvent>) => void }) {
  return (
    <mesh position={[r.cx, y + h / 2, r.cz]} receiveShadow castShadow={h > 0.8} onClick={onClick}>
      <boxGeometry args={[r.w, h, r.d]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

const Ground = memo(function Ground() {
  const floor = useStore((s) => s.floor);
  const geom = useMemo(() => {
    const s = new THREE.Shape(OUTLINE_W.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); return g;
  }, []);
  const basement = floor === -1;
  return (
    <group>
      <mesh geometry={geom} receiveShadow onClick={(e) => { if (e.delta < 6) useStore.getState().select(null); }}>
        <meshStandardMaterial color={MAT.campus} roughness={1} transparent={basement} opacity={basement ? 0.35 : 1} depthWrite={!basement} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.25} receiveShadow>
        <planeGeometry args={[1600, 1600]} />
        <meshStandardMaterial color={MAT.outside} roughness={1} />
      </mesh>
      {/* 圍牆（高度估算 1.6 m） */}
      {OUTLINE_W.map((a, i) => {
        const b = OUTLINE_W[(i + 1) % OUTLINE_W.length];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        return (
          <mesh key={i} position={[(a[0] + b[0]) / 2, 0.8, (a[1] + b[1]) / 2]} rotation-y={-Math.atan2(b[1] - a[1], b[0] - a[0])} castShadow>
            <boxGeometry args={[len, 1.6, 0.35]} />
            <meshStandardMaterial color={MAT.wall_campus} roughness={0.9} />
          </mesh>
        );
      })}
      {STREETS.map((s) => {
        const [x, z] = toWorld(s.plan);
        return <Html key={s.name} position={[x, 0.5, z]} center zIndexRange={[5, 0]}><span className="street-tag">{s.name}</span></Html>;
      })}
    </group>
  );
});

function stadium([cx, cy]: [number, number], [rx, half]: number[]) {
  const s = new THREE.Shape(), [X, Z] = toWorld([cx, cy]), R = rx * M_PER_PX, H = half * M_PER_PX;
  s.moveTo(X - R, -(Z - H)); s.lineTo(X - R, -(Z + H));
  s.absarc(X, -(Z + H), R, Math.PI, 2 * Math.PI, false); s.lineTo(X + R, -(Z - H));
  s.absarc(X, -(Z - H), R, 0, Math.PI, false);
  const g = new THREE.ShapeGeometry(s, 48); g.rotateX(-Math.PI / 2); return g;
}

const Track = memo(function Track() {
  const [outer, lane, field] = useMemo(() => [stadium(TRACK.center, TRACK.outer), stadium(TRACK.center, TRACK.lane), stadium(TRACK.center, TRACK.field)], []);
  const onClick = (e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); focusSelection({ kind: 'place', id: 'track' }, false); };
  return (
    <group onClick={onClick}>
      <mesh geometry={outer} position-y={0.04} receiveShadow><meshStandardMaterial color={MAT.grass} roughness={1} /></mesh>
      <mesh geometry={lane} position-y={0.07} receiveShadow><meshStandardMaterial color={MAT.track} roughness={0.95} /></mesh>
      <mesh geometry={field} position-y={0.1} receiveShadow><meshStandardMaterial color={MAT.grassField} roughness={1} /></mesh>
    </group>
  );
});

function Court({ r, color }: { r: WorldRect; color: string }) {
  const inset = 1.2, t = 0.12;
  const x1 = r.x1 + inset, x2 = r.x2 - inset, z1 = r.z1 + inset, z2 = r.z2 - inset;
  const lines: [number, number, number, number][] = [[x1, z1, x2, z1 + t], [x1, z2 - t, x2, z2], [x1, z1, x1 + t, z2], [x2 - t, z1, x2, z2], [x1, (z1 + z2) / 2 - t / 2, x2, (z1 + z2) / 2 + t / 2]];
  return (
    <group>
      <Slab r={r} h={0.12} color={color} roughness={0.8} />
      {lines.map(([a, b, c, d], i) => (
        <mesh key={i} position={[(a + c) / 2, 0.13, (b + d) / 2]}><boxGeometry args={[c - a, 0.02, d - b]} /><meshStandardMaterial color={MAT.courtLine} /></mesh>
      ))}
    </group>
  );
}

function Shed({ r }: { r: WorldRect }) {
  const posts: [number, number][] = [];
  const along = r.w > r.d, n = Math.max(2, Math.round((along ? r.w : r.d) / 6));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    if (along) { posts.push([r.x1 + r.w * t, r.z1 + 0.3], [r.x1 + r.w * t, r.z2 - 0.3]); }
    else { posts.push([r.x1 + 0.3, r.z1 + r.d * t], [r.x2 - 0.3, r.z1 + r.d * t]); }
  }
  return (
    <group>
      <mesh position={[r.cx, 2.8, r.cz]} castShadow receiveShadow><boxGeometry args={[r.w, 0.12, r.d]} /><meshStandardMaterial color={MAT.shedRoof} roughness={0.6} /></mesh>
      {posts.map(([x, z], i) => <mesh key={i} position={[x, 1.4, z]}><cylinderGeometry args={[0.07, 0.07, 2.8, 6]} /><meshStandardMaterial color="#8d918f" /></mesh>)}
    </group>
  );
}

function Facility({ def, r }: { def: FacilityDef; r: WorldRect }) {
  const onClick = def.listed ? (e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); focusSelection({ kind: 'facility', id: def.id }, false); } : undefined;
  const body = (() => {
    switch (def.kind) {
      case 'court': return <Court r={r} color={def.id.startsWith('tennis') ? MAT.courtTennis : MAT.court} />;
      case 'pool': return <group><Slab r={r} h={0.3} color={MAT.stone} /><Slab r={{ ...r, w: r.w - 3, d: r.d - 3 }} y={0.3} h={0.02} color={MAT.water} roughness={0.15} /></group>;
      case 'lawn': return <Slab r={r} h={0.12} color={MAT.grass} />;
      case 'garden': return <group><Slab r={r} h={0.14} color={MAT.grass} /><Slab r={{ ...r, w: r.w * 0.55, d: r.d * 0.85 }} y={0.14} h={0.05} color={MAT.stone} /></group>;
      case 'road': { const cx = r.cx, half = 8; return <group><Slab r={r} h={0.04} color={MAT.plaza} /><Slab r={{ ...r, x1: cx - half, x2: cx + half, w: half * 2 }} y={0.04} h={0.03} color={MAT.asphalt} roughness={0.9} /></group>; }
      case 'plaza': return <Slab r={r} h={0.08} color={MAT.plaza} />;
      case 'shed': return <Shed r={r} />;
      case 'stage': return <Slab r={r} h={def.height ?? 1.2} color={MAT.stone} />;
      case 'wall': return <Slab r={{ ...r, d: Math.min(r.d, 1.2) }} h={def.height ?? 2.4} color={MAT.ceramic} />;
    }
  })();
  return <group onClick={onClick}>{body}</group>;
}

function Place({ def, pos }: { def: PlaceDef; pos: [number, number] }) {
  const [x, z] = pos;
  const onClick = (e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); focusSelection({ kind: 'place', id: def.id }, false); };
  switch (def.kind) {
    case 'gate':
      return <group onClick={onClick}>{[-3.5, 3.5].map((o) => <mesh key={o} position={[x + o, 1.6, z]} castShadow><boxGeometry args={[1.2, 3.2, 1.2]} /><meshStandardMaterial color="#8a8273" /></mesh>)}</group>;
    case 'pavilion':
      return (
        <group onClick={onClick} position={[x, 0, z]}>
          {[[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].map(([a, b], i) => <mesh key={i} position={[a, 1.4, b]}><cylinderGeometry args={[0.12, 0.12, 2.8, 8]} /><meshStandardMaterial color="#7a5a40" /></mesh>)}
          <mesh position-y={3.4} rotation-y={Math.PI / 4} castShadow><coneGeometry args={[2.6, 1.6, 4]} /><meshStandardMaterial color="#8c3a2e" roughness={0.7} /></mesh>
        </group>
      );
    case 'tower':
      return <mesh position={[x, 5, z]} onClick={onClick} castShadow><cylinderGeometry args={[2.1, 2.4, 10, 20]} /><meshStandardMaterial color="#d9d3c4" /></mesh>;
    case 'plaza':
      return <mesh position={[x, 0.12, z + 3]} onClick={onClick} receiveShadow><cylinderGeometry args={[12, 12, 0.24, 40, 1, false, Math.PI / 2, Math.PI]} /><meshStandardMaterial color="#d9c79f" /></mesh>;
    case 'pond':
      return <mesh position={[x, 0.18, z]} onClick={onClick}><cylinderGeometry args={[def.id === 'meihua' ? 5 : 4, def.id === 'meihua' ? 5 : 4, 0.3, def.id === 'meihua' ? 5 : 24]} /><meshStandardMaterial color={MAT.water} roughness={0.15} /></mesh>;
    default:
      return null;
  }
}

/** 大王椰子（1994 年種植於椰林大道兩側；位置依平面圖圖示） */
const Palms = memo(function Palms() {
  const quality = useStore((s) => s.quality);
  const data = useMemo(() => PALMS.map((p) => toWorld(p)), []);
  const leaves = quality === 'high' ? 10 : 6;
  const geo = useMemo(() => ({
    trunk: new THREE.CylinderGeometry(0.28, 0.38, 13, 8),
    shaft: new THREE.CylinderGeometry(0.3, 0.3, 2.2, 8),
    leaf: (() => { const g = new THREE.PlaneGeometry(0.9, 5.2, 1, 4); const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) { const yy = pos.getY(i); pos.setZ(i, -0.06 * (yy + 2.6) ** 2); } g.translate(0, 2.6, 0); g.computeVertexNormals(); return g; })()
  }), []);
  const mats = useMemo(() => ({
    trunk: new THREE.MeshStandardMaterial({ color: MAT.palmTrunk, roughness: 0.9 }),
    shaft: new THREE.MeshStandardMaterial({ color: MAT.palmShaft, roughness: 0.8 }),
    leaf: new THREE.MeshStandardMaterial({ color: MAT.palmLeaf, roughness: 0.8, side: THREE.DoubleSide })
  }), []);
  return (
    <group>
      {data.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={i * 1.3}>
          <mesh geometry={geo.trunk} material={mats.trunk} position-y={6.5} castShadow />
          <mesh geometry={geo.shaft} material={mats.shaft} position-y={14.1} castShadow />
          {Array.from({ length: leaves }, (_, k) => (
            <group key={k} position-y={15} rotation-y={(k / leaves) * Math.PI * 2}>
              <mesh geometry={geo.leaf} material={mats.leaf} rotation-x={-1.05} castShadow />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
});

export const Campus = memo(function Campus() {
  const labels = useStore((s) => s.labels);
  const walk = useStore((s) => s.walk);
  const floor = useStore((s) => s.floor);
  const showMinor = labels && !walk && floor === 'all';
  return (
    <group>
      <Ground />
      <Track />
      {FACILITY_W.map(({ def, rect }) => <Facility key={def.id} def={def} r={rect} />)}
      {PLACE_W.map(({ def, pos }) => <Place key={def.id} def={def} pos={pos} />)}
      <Palms />
      {showMinor && FACILITY_W.filter((f) => f.def.listed).map(({ def, rect }) => (
        <Html key={def.id} position={[rect.cx, (def.height ?? 0) + 2, rect.cz]} center zIndexRange={[15, 5]}>
          <button className="minor-tag" onClick={() => focusSelection({ kind: 'facility', id: def.id }, true)}>{def.name}</button>
        </Html>
      ))}
      {showMinor && PLACE_W.filter((p) => p.def.kind !== 'marker' || p.def.id === 'hanpo').map(({ def, pos }) => (
        <Html key={def.id} position={[pos[0], def.kind === 'tower' ? 12 : def.kind === 'gate' ? 5 : 4, pos[1]]} center zIndexRange={[15, 5]}>
          <button className={def.kind === 'gate' ? 'gate-tag' : 'minor-tag'} onClick={() => focusSelection({ kind: 'place', id: def.id }, true)}>{def.name}</button>
        </Html>
      ))}
    </group>
  );
});
