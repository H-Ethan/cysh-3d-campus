import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';
import { useStore } from '../store';
import { camState } from '../lib/camState';

export const HOME = { target: new THREE.Vector3(8, 0, 6), position: new THREE.Vector3(-70, 210, 230) };
/** 直式螢幕需要拉遠才看得到整個校園 */
function homePosition(aspect: number) {
  const k = aspect < 1 ? Math.min(2.2, 1 / aspect + 0.25) : 1;
  return HOME.target.clone().add(HOME.position.clone().sub(HOME.target).multiplyScalar(k));
}
const BOUND = 230;

export function CameraRig() {
  const controls = useRef<OrbitImpl>(null);
  const { camera } = useThree();
  const fly = useStore((s) => s.fly);
  const view = useStore((s) => s.view);
  const walk = useStore((s) => s.walk);
  const tween = useRef<null | { t0: THREE.Vector3; p0: THREE.Vector3; t1: THREE.Vector3; p1: THREE.Vector3; start: number }>(null);

  useEffect(() => {
    camera.position.copy(homePosition((camera as THREE.PerspectiveCamera).aspect));
    controls.current?.target.copy(HOME.target);
  }, [camera]);

  // 飛行請求
  useEffect(() => {
    const c = controls.current; if (!fly || !c) return;
    const t1 = new THREE.Vector3(...fly.target);
    let p1: THREE.Vector3;
    if (fly.topDown || useStore.getState().view === '2d') {
      p1 = t1.clone().add(new THREE.Vector3(0, fly.distance * 1.6, 0.01));
    } else {
      const dir = camera.position.clone().sub(c.target).setY(0);
      if (dir.lengthSq() < 1) dir.set(0, 0, 1);
      dir.normalize();
      p1 = t1.clone().add(dir.multiplyScalar(fly.distance * 0.78)).setY(t1.y + fly.distance * 0.72);
    }
    tween.current = { t0: c.target.clone(), p0: camera.position.clone(), t1, p1, start: performance.now() };
  }, [fly, camera]);

  // 2D／3D
  useEffect(() => {
    const c = controls.current; if (!c) return;
    if (view === '2d') {
      c.minPolarAngle = 0; c.maxPolarAngle = 0.0001; c.enableRotate = false;
      c.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
      c.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };
      const t = c.target.clone();
      tween.current = { t0: t.clone(), p0: camera.position.clone(), t1: t, p1: t.clone().add(new THREE.Vector3(0, Math.max(120, camera.position.distanceTo(t)), 0.01)), start: performance.now() };
    } else {
      c.minPolarAngle = 0; c.maxPolarAngle = 1.42; c.enableRotate = true;
      c.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
      c.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
      const t = c.target.clone(), off = camera.position.clone().sub(t);
      if (off.y > off.length() * 0.95) tween.current = { t0: t.clone(), p0: camera.position.clone(), t1: t, p1: t.clone().add(new THREE.Vector3(0, off.length() * 0.7, off.length() * 0.7)), start: performance.now() };
    }
  }, [view, camera]);

  useFrame(() => {
    const c = controls.current;
    camera.getWorldDirection(camState.dir);
    camState.azimuth = Math.atan2(-camState.dir.x, -camState.dir.z);
    if (!c || walk) return;
    const tw = tween.current;
    if (tw) {
      const k = Math.min(1, (performance.now() - tw.start) / 900), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      c.target.lerpVectors(tw.t0, tw.t1, e); camera.position.lerpVectors(tw.p0, tw.p1, e);
      if (k === 1) tween.current = null;
    }
    // 限制在校園附近、鏡頭不低於地面
    c.target.x = THREE.MathUtils.clamp(c.target.x, -BOUND, BOUND);
    c.target.z = THREE.MathUtils.clamp(c.target.z, -BOUND, BOUND);
    c.target.y = THREE.MathUtils.clamp(c.target.y, -6, 30);
    if (camera.position.y < 2) camera.position.y = 2;
    c.update();
  });

  // 指北針「回正北」
  useEffect(() => {
    camState.resetNorth = () => {
      const c = controls.current; if (!c) return;
      const t = c.target.clone(), off = camera.position.clone().sub(t), h = Math.hypot(off.x, off.z);
      tween.current = { t0: t.clone(), p0: camera.position.clone(), t1: t, p1: t.clone().add(new THREE.Vector3(0, off.y, Math.max(0.01, h))), start: performance.now() };
    };
    camState.home = () => {
      const c = controls.current; if (!c) return;
      const v = useStore.getState().view;
      tween.current = { t0: c.target.clone(), p0: camera.position.clone(), t1: HOME.target.clone(), p1: v === '2d' ? HOME.target.clone().add(new THREE.Vector3(0, 330, 0.01))   : homePosition((camera as THREE.PerspectiveCamera).aspect), start: performance.now() };
    };
    camState.fitPoints = (pts: [number, number][]) => {
      const c = controls.current; if (!c || !pts.length) return;
      const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
      const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 40);
      useStore.getState().flyTo([cx, 0, cz], span * 1.05);
    };
  }, [camera]);

  return <OrbitControls ref={controls} makeDefault enabled={!walk} enableDamping dampingFactor={0.1} minDistance={12} maxDistance={520} maxPolarAngle={1.42} screenSpacePanning={false} />;
}
