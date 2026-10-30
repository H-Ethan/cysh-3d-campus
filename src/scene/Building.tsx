import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { memo, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import type { WorldRect } from '../data/geo';
import { floorName, isNumericClass, type BuildingLayout, type RoomLayout } from '../lib/layout';
import { focusSelection } from '../lib/selection';
import { useStore } from '../store';
import { MAT, ROOM_COLORS } from './palette';
import { ModelBuilding } from './ModelBuilding';

interface Look { opacity: number; visible: boolean }

function levelLook(level: number, floor: 'all' | number): Look {
  if (floor === 'all') return { opacity: 1, visible: level > 0 };
  if (floor === -1) return { opacity: level === -1 ? 1 : 0.18, visible: true };
  if (level > floor) return { opacity: 1, visible: false };
  if (level < floor) return { opacity: level < 0 ? 0.18 : 0.22, visible: level > 0 };
  return { opacity: 1, visible: true };
}

interface MatProps { color: string; opacity: number; emissive?: string; emissiveIntensity?: number; roughness?: number }
function Mat({ color, opacity, emissive = '#000000', emissiveIntensity = 0, roughness = 0.85 }: MatProps) {
  const t = opacity < 1;
  return <meshStandardMaterial color={color} roughness={roughness} transparent={t} opacity={opacity} depthWrite={!t} emissive={emissive} emissiveIntensity={emissiveIntensity} />;
}

function Box({ r, y, h, inset = 0, children, ...rest }: { r: WorldRect; y: number; h: number; inset?: number; children: React.ReactNode } & Partial<JSX.IntrinsicElements['mesh']>) {
  return (
    <mesh position={[r.cx, y + h / 2, r.cz]} castShadow receiveShadow {...rest}>
      <boxGeometry args={[Math.max(0.1, r.w - inset * 2), h, Math.max(0.1, r.d - inset * 2)]} />
      {children}
    </mesh>
  );
}

function GableRoof({ r, y, h, color, opacity }: { r: WorldRect; y: number; h: number; color: string; opacity: number }) {
  const geom = useMemo(() => {
    const alongX = r.w >= r.d;
    const span = (alongX ? r.d : r.w) + 1.2, len = (alongX ? r.w : r.d) + 1.2;
    const s = new THREE.Shape();
    s.moveTo(-span / 2, 0); s.lineTo(span / 2, 0); s.lineTo(0, h); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
    g.translate(0, 0, -len / 2);
    if (alongX) g.rotateY(Math.PI / 2);
    return g;
  }, [r, h]);
  return <mesh geometry={geom} position={[r.cx, y, r.cz]} castShadow receiveShadow><Mat color={color} opacity={opacity} /></mesh>;
}

/** 窗帶（只用於有教室配置資料的教學大樓，為示意） */
function WindowBand({ room, y, storey, side, opacity }: { room: RoomLayout; y: number; storey: number; side: 'n' | 's' | 'e' | 'w'; opacity: number }) {
  const r = room.rect, h = 1.5, t = 0.06, inset = 0.9;
  const yy = y + storey * 0.55;
  const props = side === 'n' || side === 's'
    ? { pos: [r.cx, yy, side === 'n' ? r.z1 - t / 2 + 0.01 : r.z2 + t / 2 - 0.01] as const, size: [Math.max(0.5, r.w - inset * 2), h, t] as const }
    : { pos: [side === 'w' ? r.x1 - t / 2 + 0.01 : r.x2 + t / 2 - 0.01, yy, r.cz] as const, size: [t, h, Math.max(0.5, r.d - inset * 2)] as const };
  return (
    <mesh position={props.pos as unknown as [number, number, number]} raycast={() => null}>
      <boxGeometry args={props.size as unknown as [number, number, number]} />
      <Mat color={MAT.glass} opacity={opacity} roughness={0.25} />
    </mesh>
  );
}

const opposite = { n: 's', s: 'n', e: 'w', w: 'e' } as const;

export const Building = memo(function Building({ layout }: { layout: BuildingLayout }) {
  const floor = useStore((s) => s.floor);
  const look = useStore((s) => s.look);
  const sel = useStore((s) => s.selection);
  const hovered = useStore((s) => s.hovered);
  const showLabels = useStore((s) => s.labels);
  const walk = useStore((s) => s.walk);
  const hover = useStore((s) => s.hover);
  const { def, rects, corridor, corridorSide, storey, levels, floors } = layout;

  const selected = sel?.kind === 'building' && sel.id === def.id;
  const selRoomKey = sel?.kind === 'room' ? sel.key : null;
  const isHover = hovered === def.id;
  const wood = def.material === 'wood';
  const wallColor = look === 'plan' ? def.planColor : wood ? MAT.wallWood : MAT.wall;
  const glowColor = selected ? '#e0453a' : '#ffffff';
  const glow = selected ? 0.16 : isHover ? 0.1 : 0;

  const onOver = (e: ThreeEvent<PointerEvent>) => { if (walk) return; e.stopPropagation(); hover(def.id); document.body.style.cursor = 'pointer'; };
  const onOut = () => { if (useStore.getState().hovered === def.id) hover(null); document.body.style.cursor = ''; };
  const onClick = (e: ThreeEvent<MouseEvent>) => { if (walk || e.delta > 6) return; e.stopPropagation(); focusSelection({ kind: 'building', id: def.id }, false); };

  const topLevel = levels[levels.length - 1];
  const visibleTop = floor === 'all' ? topLevel : Math.min(topLevel, Math.max(1, floor));
  const labelY = (floor === 'all' ? layout.height : visibleTop * storey) + 3;
  const showBuildingLabel = showLabels && !walk && (floor === 'all' || levels.includes(floor as number) || floor === -1 ? true : !def.minor);

  return (
    <group onPointerOver={onOver} onPointerOut={onOut} onClick={onClick} name={def.id}>
      {def.modelUrl && floor === 'all' && <Suspense fallback={null}><ModelBuilding layout={layout} url={def.modelUrl} /></Suspense>}
      {floors.map((fl) => {
        if (def.modelUrl && floor === 'all') return null;
        const lk = levelLook(fl.floor, floor);
        if (!lk.visible) return null;
        const isTop = fl.floor === topLevel;
        const active = floor !== 'all' && fl.floor === floor;
        return (
          <group key={fl.floor}>
            {fl.rooms.length > 0 && corridor && corridorSide ? (
              <>
                {/* 走廊樓板與女兒牆 */}
                <Box r={corridor} y={fl.y} h={0.22}><Mat color={MAT.corridor} opacity={lk.opacity} /></Box>
                <Box r={edgeStrip(corridor, corridorSide)} y={fl.y + 0.22} h={1.1}><Mat color={MAT.parapet} opacity={lk.opacity} emissive={glowColor} emissiveIntensity={glow} /></Box>
                {fl.rooms.map((rm) => {
                  const isSel = rm.key === selRoomKey;
                  const tint = active && rm.type !== 'stair' ? ROOM_COLORS[rm.type] : rm.type === 'stair' ? MAT.slab : wallColor;
                  return (
                    <group key={rm.key}>
                      <Box r={rm.rect} y={fl.y} h={storey - 0.28} inset={0.08}
                        onClick={(e: ThreeEvent<MouseEvent>) => { if (walk || !active || rm.type === 'stair' || e.delta > 6) return; e.stopPropagation(); focusSelection({ kind: 'room', key: rm.key }, false); }}>
                        <Mat color={tint} opacity={lk.opacity} emissive={isSel ? '#e0453a' : glowColor} emissiveIntensity={isSel ? 0.45 : glow} />
                      </Box>
                      {rm.type !== 'stair' && lk.opacity === 1 && (
                        <>
                          <WindowBand room={rm} y={fl.y} storey={storey} side={opposite[corridorSide]} opacity={lk.opacity} />
                          <WindowBand room={rm} y={fl.y} storey={storey} side={corridorSide} opacity={lk.opacity} />
                        </>
                      )}
                      {active && showLabels && rm.type !== 'stair' && (
                        <Html position={[rm.rect.cx, fl.y + storey + 0.6, rm.rect.cz]} center zIndexRange={[20, 10]}>
                          <button className={`room-tag${isSel ? ' is-sel' : ''}`} style={{ ['--rc' as string]: ROOM_COLORS[rm.type] }}
                            onClick={() => focusSelection({ kind: 'room', key: rm.key }, true)}>
                            {isNumericClass(rm.code) ? <b>{rm.code}</b> : rm.name}
                          </button>
                        </Html>
                      )}
                    </group>
                  );
                })}
                {/* 樓板 */}
                <Box r={rects[0]} y={fl.y + storey - 0.28} h={0.28}><Mat color={MAT.slab} opacity={lk.opacity} /></Box>
              </>
            ) : (
              rects.map((r, i) => (
                <group key={i}>
                  <Box r={r} y={fl.y} h={storey - 0.3} inset={0.2}><Mat color={wallColor} opacity={lk.opacity} emissive={glowColor} emissiveIntensity={glow} /></Box>
                  <Box r={r} y={fl.y + storey - 0.3} h={0.3}><Mat color={wood ? MAT.roofWood : MAT.slab} opacity={lk.opacity} /></Box>
                </group>
              ))
            )}
            {isTop && (floor === 'all' || floor === topLevel) && (
              def.roof === 'gable'
                ? rects.map((r, i) => <GableRoof key={i} r={r} y={fl.y + storey} h={storey * 0.6} color={wood ? MAT.roofWood : MAT.roof} opacity={lk.opacity} />)
                : rects.map((r, i) => <Parapet key={i} r={r} y={fl.y + storey} opacity={lk.opacity} />)
            )}
          </group>
        );
      })}
      {showBuildingLabel && !def.minor && (
        <Html position={[rects[0].cx, labelY, rects[0].cz]} center zIndexRange={[30, 20]}>
          <button className={`bld-tag${selected ? ' is-sel' : ''}`} onClick={() => focusSelection({ kind: 'building', id: def.id }, true)}>
            {def.name}{floor !== 'all' && levels.includes(floor as number) ? <small> {floorName(floor as number)}</small> : null}
          </button>
        </Html>
      )}
    </group>
  );
});

function edgeStrip(r: WorldRect, side: 'n' | 's' | 'e' | 'w'): WorldRect {
  const t = 0.2;
  const m = (x1: number, z1: number, x2: number, z2: number): WorldRect => ({ x1, z1, x2, z2, w: x2 - x1, d: z2 - z1, cx: (x1 + x2) / 2, cz: (z1 + z2) / 2 });
  if (side === 's') return m(r.x1, r.z2 - t, r.x2, r.z2);
  if (side === 'n') return m(r.x1, r.z1, r.x2, r.z1 + t);
  if (side === 'e') return m(r.x2 - t, r.z1, r.x2, r.z2);
  return m(r.x1, r.z1, r.x1 + t, r.z2);
}

function Parapet({ r, y, opacity }: { r: WorldRect; y: number; opacity: number }) {
  const h = 0.9, t = 0.25;
  const m = (x1: number, z1: number, x2: number, z2: number): WorldRect => ({ x1, z1, x2, z2, w: x2 - x1, d: z2 - z1, cx: (x1 + x2) / 2, cz: (z1 + z2) / 2 });
  const strips = [m(r.x1, r.z1, r.x2, r.z1 + t), m(r.x1, r.z2 - t, r.x2, r.z2), m(r.x1, r.z1, r.x1 + t, r.z2), m(r.x2 - t, r.z1, r.x2, r.z2)];
  return (
    <>
      <Box r={r} y={y} h={0.05} inset={t}><Mat color={MAT.roof} opacity={opacity} /></Box>
      {strips.map((s, i) => <Box key={i} r={s} y={y} h={h}><Mat color={MAT.parapet} opacity={opacity} /></Box>)}
    </>
  );
}
