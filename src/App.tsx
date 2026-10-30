import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { search } from './lib/search';
import { focusSelection } from './lib/selection';
import { hasWebGL } from './lib/webgl';
import { Compass, FloorBar, WalkHUD } from './ui/Controls';
import { InfoPanel } from './ui/InfoPanel';
import { SidePanel } from './ui/SidePanel';
import { TopBar } from './ui/TopBar';

const CampusScene = lazy(() => import('./scene/CampusScene').then((m) => ({ default: m.CampusScene })));

class SceneBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? <Notice title="3D 場景無法載入" body="瀏覽器的 WebGL 發生錯誤。請重新整理頁面，或改用最新版 Chrome、Edge、Safari。" /> : this.props.children; }
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="fixed inset-0 grid place-items-center p-6">
      <div className="glass max-w-md p-6 text-center">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}

function Loading({ done }: { done: boolean }) {
  const [p, setP] = useState(8);
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setP((v) => Math.min(92, v + (100 - v) * 0.12)), 120);
    return () => clearInterval(id);
  }, [done]);
  if (done) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg">
      <div className="w-[min(320px,80vw)] text-center">
        <p className="font-display text-2xl font-bold">國立嘉義高中</p>
        <p className="mt-1 text-[13px] text-muted">正在建立 3D 校園⋯</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${p}%` }} />
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [webgl] = useState(hasWebGL);
  const [ready, setReady] = useState(false);

  // 網址 #315 直接定位
  useEffect(() => {
    if (!ready) return;
    const go = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (!h) return;
      const hit = search(h)[0];
      if (hit) focusSelection(hit.sel);
    };
    go();
    addEventListener('hashchange', go);
    return () => removeEventListener('hashchange', go);
  }, [ready]);

  if (!webgl) return <Notice title="此裝置不支援 3D 顯示" body="你的瀏覽器沒有啟用 WebGL，無法顯示 3D 校園。請改用最新版 Chrome、Edge、Safari，或在瀏覽器設定中開啟硬體加速。" />;

  return (
    <>
      <div className="fixed inset-0">
        <SceneBoundary>
          <Suspense fallback={null}>
            <CampusScene onReady={() => setReady(true)} />
          </Suspense>
        </SceneBoundary>
      </div>
      <TopBar />
      <SidePanel />
      <InfoPanel />
      <FloorBar />
      <Compass />
      <WalkHUD />
      <Loading done={ready} />
    </>
  );
}
