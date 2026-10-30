import { useEffect, useRef } from 'react';
import { camState } from '../lib/camState';
import { joystick, useStore } from '../store';

const FLOORS: ('all' | number)[] = ['all', 4, 3, 2, 1, -1];

export function FloorBar() {
  const floor = useStore((s) => s.floor), setFloor = useStore((s) => s.setFloor);
  const walk = useStore((s) => s.walk);
  if (walk) return null;
  return (
    <div className="floor-bar glass fixed z-20 flex items-center gap-0.5 p-1" role="toolbar" aria-label="樓層">
      <span className="eyebrow hidden px-2 sm:inline">樓層</span>
      {FLOORS.map((f) => (
        <button key={String(f)} className="tbtn min-w-[44px] justify-center px-2 font-mono" aria-pressed={floor === f} onClick={() => setFloor(f)}>
          {f === 'all' ? '全部' : f < 0 ? 'B1' : `${f}F`}
        </button>
      ))}
    </div>
  );
}

export function Compass() {
  const needle = useRef<SVGGElement>(null);
  useEffect(() => {
    let id = 0;
    const tick = () => { needle.current?.setAttribute('transform', `rotate(${(camState.azimuth * 180) / Math.PI} 20 20)`); id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <button className="compass glass fixed z-20 grid h-12 w-12 place-items-center rounded-full p-0" onClick={() => camState.resetNorth()} aria-label="指北針，點一下回正北" title="回正北">
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
        <g ref={needle}>
          <path d="M20 4 L25 20 L20 18 L15 20 Z" fill="var(--mark)" />
          <path d="M20 36 L25 20 L20 22 L15 20 Z" fill="var(--muted)" />
          <text x="20" y="13.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">N</text>
        </g>
      </svg>
    </button>
  );
}

export function WalkHUD() {
  const walk = useStore((s) => s.walk), setWalk = useStore((s) => s.setWalk);
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  const pad = useRef<HTMLDivElement>(null), knob = useRef<HTMLSpanElement>(null);
  useEffect(() => () => { joystick.x = 0; joystick.y = 0; }, [walk]);
  if (!walk) return null;
  let pid: number | null = null;
  const upd = (e: React.PointerEvent) => {
    const r = pad.current!.getBoundingClientRect();
    let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    joystick.x = x; joystick.y = y;
    if (knob.current) knob.current.style.transform = `translate(${x * 34}px, ${y * 34}px)`;
  };
  const end = () => { pid = null; joystick.x = 0; joystick.y = 0; if (knob.current) knob.current.style.transform = ''; };
  return (
    <>
      <div className="glass fixed left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 px-2 py-1.5" style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
        <span className="hidden px-2 text-[12px] text-muted sm:inline">{coarse ? '搖桿移動・拖曳畫面轉向' : 'WASD／方向鍵移動・Shift 跑步・拖曳轉向・Esc 結束'}</span>
        <button className="tbtn" aria-pressed={walk === 'third'} onClick={() => setWalk('third')}>第三人稱</button>
        <button className="tbtn" aria-pressed={walk === 'first'} onClick={() => setWalk('first')}>第一人稱</button>
        <button className="tbtn border-line" onClick={() => setWalk(null)}>返回鳥瞰</button>
      </div>
      {coarse && (
        <div ref={pad} className="glass fixed z-30 h-[120px] w-[120px] touch-none rounded-full" style={{ left: 'max(24px, env(safe-area-inset-left, 0px))', bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}
          onPointerDown={(e) => { pid = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); upd(e); }}
          onPointerMove={(e) => { if (e.pointerId === pid) upd(e); }} onPointerUp={end} onPointerCancel={end}>
          <span ref={knob} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full bg-accent opacity-85" />
        </div>
      )}
    </>
  );
}
