import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import type { BuildingLayout } from '../lib/layout';

/**
 * Blender 匯出的 GLB 建築模型。
 * 模型原點請放在建築地面中心、1 單位 = 1 公尺、正面朝 -Z（北）。
 */
export function ModelBuilding({ layout, url }: { layout: BuildingLayout; url: string }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
    return c;
  }, [scene]);
  const r = layout.rects[0];
  return <primitive object={obj} position={[r.cx, 0, r.cz]} />;
}
