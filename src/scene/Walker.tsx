import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { toWorld } from '../data/geo';
import { camState } from '../lib/camState';
import { OUTLINE_W, SOLIDS } from '../lib/layout';
import { pointInPolygon } from '../data/geo';
import { joystick, useStore } from '../store';

const START = toWorld([722, 1325]);
const RADIUS = 0.45;

function blocked(x: number, z: number) {
  if (!pointInPolygon(x, z, OUTLINE_W)) return true;
  // 只檢查地面層會擋路的量體；車棚、球場可通行
  return SOLIDS.some((r) => x > r.x1 - RADIUS && x < r.x2 + RADIUS && z > r.z1 - RADIUS && z < r.z2 + RADIUS);
}

/** 校園漫步：第三人稱／第一人稱，具備建築與圍牆碰撞 */
export function Walker() {
  const walk = useStore((s) => s.walk);
  const { camera, gl } = useThree();
  const avatar = useRef<THREE.Group>(null);
  const st = useRef({ x: START[0], z: START[1], yaw: 0, pitch: -0.08, phase: 0 });
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!walk) return;
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'SELECT') return;
      keys.current[e.code] = true;
      if (e.code === 'Escape') useStore.getState().setWalk(null);
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    const blur = () => { keys.current = {}; };
    let drag: [number, number] | null = null;
    const pd = (e: PointerEvent) => { drag = [e.clientX, e.clientY]; };
    const pm = (e: PointerEvent) => {
      if (!drag) return;
      st.current.yaw -= (e.clientX - drag[0]) * 0.005;
      st.current.pitch = THREE.MathUtils.clamp(st.current.pitch - (e.clientY - drag[1]) * 0.003, -0.8, 0.5);
      drag = [e.clientX, e.clientY];
    };
    const pu = () => { drag = null; };
    const el = gl.domElement;
    addEventListener('keydown', down); addEventListener('keyup', up); addEventListener('blur', blur);
    el.addEventListener('pointerdown', pd); addEventListener('pointermove', pm); addEventListener('pointerup', pu);
    return () => {
      removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', blur);
      el.removeEventListener('pointerdown', pd); removeEventListener('pointermove', pm); removeEventListener('pointerup', pu);
    };
  }, [walk, gl]);

  // 開始漫步時重設位置；結束時把鏡頭放回附近
  useEffect(() => {
    if (walk) return;
    const s = st.current;
    if (s.phase > 0) useStore.getState().flyTo([s.x, 0, s.z], 70);
  }, [walk]);
  useEffect(() => { if (walk && st.current.phase === 0) Object.assign(st.current, { x: START[0], z: START[1], yaw: 0 }); }, [walk]);

  useFrame((_, dtRaw) => {
    if (!walk || !avatar.current) { if (avatar.current) avatar.current.visible = false; return; }
    const dt = Math.min(dtRaw, 0.05), k = keys.current, s = st.current;
    const run = k.ShiftLeft || k.ShiftRight;
    const fwd = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) - joystick.y;
    const strafe = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
    s.yaw += ((k.ArrowLeft ? 1 : 0) - (k.ArrowRight ? 1 : 0) - joystick.x) * 1.9 * dt;
    const speed = (run ? 9 : 4.2) * dt;
    const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw);
    const dx = (fx * fwd + Math.cos(s.yaw) * strafe) * speed, dz = (fz * fwd - Math.sin(s.yaw) * strafe) * speed;
    if (!blocked(s.x + dx, s.z)) s.x += dx;
    if (!blocked(s.x, s.z + dz)) s.z += dz;
    const moving = Math.abs(dx) + Math.abs(dz) > 1e-4;
    s.phase += moving ? dt * (run ? 14 : 9) : 0.0001;
    const a = avatar.current;
    a.position.set(s.x, moving ? Math.abs(Math.sin(s.phase)) * 0.06 : 0, s.z);
    a.rotation.y = s.yaw;
    a.visible = walk === 'third';
    const legL = a.getObjectByName('legL'), legR = a.getObjectByName('legR');
    if (legL && legR) { legL.rotation.x = moving ? Math.sin(s.phase) * 0.5 : 0; legR.rotation.x = -legL.rotation.x; }
    if (walk === 'first') {
      camera.position.set(s.x, 1.6, s.z);
      camera.lookAt(s.x + fx, 1.6 + Math.tan(s.pitch), s.z + fz);
    } else {
      const back = 7.5, h = 3.2 - s.pitch * 5;
      // 鏡頭碰到建築時拉近，避免穿牆
      let d = back;
      while (d > 1.5 && SOLIDS.some((r) => { const x = s.x - fx * d, z = s.z - fz * d; return x > r.x1 && x < r.x2 && z > r.z1 && z < r.z2; })) d -= 0.5;
      const cx = s.x - fx * d, cz = s.z - fz * d;
      camera.position.set(cx, h, cz);
      camera.lookAt(s.x, 1.5, s.z);
    }
    camState.dir.set(fx, 0, fz);
  });

  return (
    <group ref={avatar} visible={false}>
      <mesh position-y={1.18} castShadow><boxGeometry args={[0.52, 0.66, 0.3]} /><meshStandardMaterial color="#f2f2ee" /></mesh>
      <mesh position-y={1.72} castShadow><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color="#e9c4a2" /></mesh>
      <mesh position={[0, 1.8, 0.03]}><sphereGeometry args={[0.215, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#2a2522" /></mesh>
      <mesh position={[0, 1.2, 0.2]} castShadow><boxGeometry args={[0.4, 0.5, 0.16]} /><meshStandardMaterial color="#2d5a49" /></mesh>
      <group name="legL" position={[-0.13, 0.85, 0]}><mesh position-y={-0.42}><boxGeometry args={[0.17, 0.84, 0.2]} /><meshStandardMaterial color="#233042" /></mesh></group>
      <group name="legR" position={[0.13, 0.85, 0]}><mesh position-y={-0.42}><boxGeometry args={[0.17, 0.84, 0.2]} /><meshStandardMaterial color="#233042" /></mesh></group>
    </group>
  );
}
