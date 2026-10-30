import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { LAYOUTS } from '../lib/layout';
import { useStore } from '../store';
import { Building } from './Building';
import { Campus } from './Campus';
import { CameraRig } from './CameraRig';
import { RouteLine } from './RouteLine';
import { Walker } from './Walker';

function useSky() {
  const read = () => getComputedStyle(document.documentElement).getPropertyValue('--sky').trim() || '#cfdde0';
  const [sky, setSky] = useState(read);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = () => setSky(read());
    mq.addEventListener('change', on);
    const mo = new MutationObserver(on); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => { mq.removeEventListener('change', on); mo.disconnect(); };
  }, []);
  return sky;
}

export function CampusScene({ onReady }: { onReady: () => void }) {
  const quality = useStore((s) => s.quality);
  const sky = useSky();
  const high = quality === 'high';
  return (
    <Canvas
      shadows={high}
      dpr={high ? [1, 2] : 1}
      camera={{ fov: 45, near: 0.3, far: 2500 }}
      gl={{ antialias: high, powerPreference: 'high-performance' }}
      onCreated={() => requestAnimationFrame(() => requestAnimationFrame(onReady))}
      onPointerMissed={(e) => { if (e.type === 'click') useStore.getState().select(null); }}
    >
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 420, 1100]} />
      <hemisphereLight args={['#ffffff', '#8d8a77', 0.75]} />
      <directionalLight
        position={[-110, 210, 120]} intensity={1.15} castShadow={high}
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}
        shadow-camera-left={-230} shadow-camera-right={230} shadow-camera-top={230} shadow-camera-bottom={-230} shadow-camera-far={600}
      />
      <ambientLight intensity={0.15} />
      <Campus />
      {LAYOUTS.map((l) => <Building key={l.def.id} layout={l} />)}
      <RouteLine />
      <Walker />
      <CameraRig />
    </Canvas>
  );
}
