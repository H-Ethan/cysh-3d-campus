import { Html, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../store';

/** 導航路線：沿路網節點的折線，以及沿線移動的標記 */
export function RouteLine() {
  const route = useStore((s) => s.route);
  const dot = useRef<THREE.Mesh>(null);
  const pts = useMemo(() => route?.points.map(([x, z]) => new THREE.Vector3(x, 0.45, z)) ?? [], [route]);
  const curve = useMemo(() => (pts.length > 1 ? new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0) : null), [pts]);
  useFrame(({ clock }) => {
    if (!dot.current || !curve) return;
    const t = (clock.elapsedTime * 18 / Math.max(route!.length, 1)) % 1;
    dot.current.position.copy(curve.getPointAt(t)).setY(0.9);
  });
  if (!route || pts.length < 2) return null;
  const end = pts[pts.length - 1], start = pts[0];
  return (
    <group>
      <Line points={pts} color="#e0453a" lineWidth={5} transparent opacity={0.9} depthTest={false} renderOrder={5} />
      <mesh ref={dot} renderOrder={6}><sphereGeometry args={[0.8, 16, 12]} /><meshBasicMaterial color="#ffffff" depthTest={false} /></mesh>
      <mesh position={[start.x, 0.6, start.z]}><cylinderGeometry args={[1.4, 1.4, 0.4, 24]} /><meshBasicMaterial color="#1f6f5c" /></mesh>
      <mesh position={[end.x, 0.6, end.z]}><cylinderGeometry args={[1.4, 1.4, 0.4, 24]} /><meshBasicMaterial color="#e0453a" /></mesh>
      <Html position={[end.x, 3, end.z]} center zIndexRange={[40, 30]}><span className="route-end">{route.nodes[route.nodes.length - 1].name ?? '終點'}</span></Html>
    </group>
  );
}
