import * as THREE from 'three';

/** 場景與 UI 共用的鏡頭狀態（不放進 React state，避免每幀重新渲染） */
export const camState = {
  azimuth: 0,
  dir: new THREE.Vector3(),
  resetNorth: () => {},
  home: () => {},
  fitPoints: (_pts: [number, number][]) => {}
};
