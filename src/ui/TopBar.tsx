import { useEffect, useState } from 'react';
import { ACADEMIC_YEAR } from '../data/classrooms';
import { camState } from '../lib/camState';
import { useStore } from '../store';

export function TopBar() {
  const view = useStore((s) => s.view), setView = useStore((s) => s.setView);
  const walk = useStore((s) => s.walk), setWalk = useStore((s) => s.setWalk);
  const look = useStore((s) => s.look), setLook = useStore((s) => s.setLook);
  const quality = useStore((s) => s.quality), setQuality = useStore((s) => s.setQuality);
  const labels = useStore((s) => s.labels), toggleLabels = useStore((s) => s.toggleLabels);
  const [fs, setFs] = useState(false);
  const [fsError, setFsError] = useState(false);

  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  const toggleFs = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setFsError(true); setTimeout(() => setFsError(false), 2500);
    }
  };

  return (
    <header className="glass fixed z-30 flex items-center gap-2 px-2 py-1.5"
      style={{ top: 'calc(10px + env(safe-area-inset-top, 0px))', left: 'max(12px, env(safe-area-inset-left, 0px))', right: 'max(12px, env(safe-area-inset-right, 0px))' }}>
      <div className="flex min-w-0 items-center gap-2.5 pr-2">
        <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-accent font-display text-[15px] font-bold text-accent">嘉中</span>
        <div className="min-w-0 leading-tight">
          <h1 className="truncate font-display text-[17px] font-bold tracking-wide sm:text-[19px]">國立嘉義高中 3D 校園導覽</h1>
          <p className="hidden truncate text-[11px] text-muted sm:block">{ACADEMIC_YEAR} 學年度・嘉義市東區大雅路二段 738 號</p>
        </div>
      </div>
      <nav className="scroll-thin ml-auto flex items-center gap-1 overflow-x-auto" aria-label="檢視工具">
        <button className="tbtn" onClick={() => { setWalk(null); camState.home(); }} title="回到全校鳥瞰">全校視角</button>
        <button className="tbtn" aria-pressed={view === '2d'} onClick={() => setView(view === '2d' ? '3d' : '2d')} disabled={!!walk} title="切換 2D 俯視與 3D 鳥瞰">{view === '2d' ? '2D 俯視' : '3D 鳥瞰'}</button>
        <button className="tbtn" aria-pressed={!!walk} onClick={() => { setView('3d'); setWalk(walk ? null : 'third'); }} title="在校園中步行">漫步</button>
        <span className="mx-1 hidden h-5 border-l border-line md:block" />
        <button className="tbtn hidden md:inline-flex" aria-pressed={look === 'plan'} onClick={() => setLook(look === 'plan' ? 'white' : 'plan')} title="白模或平面圖配色">{look === 'plan' ? '平面圖配色' : '白模'}</button>
        <button className="tbtn hidden md:inline-flex" aria-pressed={labels} onClick={toggleLabels}>標籤</button>
        <button className="tbtn hidden md:inline-flex" onClick={() => setQuality(quality === 'high' ? 'low' : 'high')} title="低效能裝置可切換為省電模式">{quality === 'high' ? '高畫質' : '省電模式'}</button>
        <button className="tbtn" aria-pressed={fs} onClick={toggleFs} title="全螢幕">{fsError ? '無法全螢幕' : fs ? '離開全螢幕' : '全螢幕'}</button>
      </nav>
    </header>
  );
}
