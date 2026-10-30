import { useMemo, useState } from 'react';
import { BUILDINGS } from '../data/buildings';
import { FACILITIES, PLACES } from '../data/facilities';
import { camState } from '../lib/camState';
import { findRoute, NAMED_NODES } from '../lib/pathfinding';
import { search, type SearchItem } from '../lib/search';
import { focusSelection } from '../lib/selection';
import { useStore, type Panel } from '../store';

const TABS: { id: Panel; label: string }[] = [
  { id: 'search', label: '搜尋' }, { id: 'buildings', label: '建築' }, { id: 'facilities', label: '設施' }, { id: 'nav', label: '導航' }, { id: 'help', label: '說明' }
];

export function SidePanel() {
  const panel = useStore((s) => s.panel), setPanel = useStore((s) => s.setPanel);
  const open = useStore((s) => s.panelOpen), setOpen = useStore((s) => s.setPanelOpen);
  const walk = useStore((s) => s.walk);
  if (walk) return null;
  return (
    <aside className="side-panel glass fixed z-20 flex flex-col" aria-label="功能面板" data-open={open}>
      <div role="tablist" className="flex items-center gap-0.5 border-b border-line p-1.5">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={panel === t.id && open} className="tbtn flex-1 justify-center px-1"
            aria-pressed={panel === t.id && open} onClick={() => (panel === t.id && open ? setOpen(false) : setPanel(t.id))}>{t.label}</button>
        ))}
      </div>
      {open && (
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-3">
          {panel === 'search' && <SearchTab />}
          {panel === 'buildings' && <BuildingsTab />}
          {panel === 'facilities' && <FacilitiesTab />}
          {panel === 'nav' && <NavTab />}
          {panel === 'help' && <HelpTab />}
        </div>
      )}
    </aside>
  );
}

function Legend() {
  const items: [string, string][] = [['var(--g1)', '高一'], ['var(--g2)', '高二'], ['var(--g3)', '高三'], ['var(--special)', '專科教室'], ['var(--office)', '處室']];
  return (
    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
      {items.map(([c, l]) => <span key={l} className="inline-flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c }} />{l}</span>)}
    </div>
  );
}

function ResultList({ items, onPick }: { items: SearchItem[]; onPick?: () => void }) {
  return (
    <ul className="mt-2 flex flex-col">
      {items.map((i, k) => (
        <li key={k}>
          <button className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
            onClick={() => { focusSelection(i.sel); onPick?.(); }}>
            <span className="min-w-0 truncate">{i.label}</span>
            <small className="shrink-0 text-right text-[11px] text-muted">{i.sub}</small>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SearchTab() {
  const [q, setQ] = useState('');
  const items = useMemo(() => search(q), [q]);
  const setOpen = useStore((s) => s.setPanelOpen);
  const closeOnMobile = () => { if (innerWidth <= 760) setOpen(false); };
  return (
    <div>
      <label htmlFor="q" className="eyebrow">搜尋班級、處室、教室或地點</label>
      <input id="q" type="search" className="field mt-1.5 text-[15px]" placeholder="例如 315、輔導室、圖書館" value={q} autoComplete="off"
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && items[0]) { focusSelection(items[0].sel); closeOnMobile(); } }} />
      {q && !items.length && <p className="mt-3 text-[13px] text-muted">找不到「{q}」。試試班級代號（如 108）或建築名稱。</p>}
      {items.length > 0 && <ResultList items={items} onPick={closeOnMobile} />}
      {!q && (
        <>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">快速前往</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {['101', '215', '315', '輔導室', '健康中心', '圖書館', '樹人堂'].map((s) => <button key={s} className="chip hover:border-accent" onClick={() => setQ(s)}>{s}</button>)}
          </div>
          <Legend />
        </>
      )}
    </div>
  );
}

const confLabel = { A: 'A 高可信度', B: 'B 中可信度', C: 'C 白模' } as const;

function BuildingsTab() {
  const groups = useMemo(() => {
    const m = new Map<string, typeof BUILDINGS>();
    BUILDINGS.filter((b) => !b.minor).forEach((b) => m.set(b.category, [...(m.get(b.category) ?? []), b]));
    return [...m.entries()];
  }, []);
  return (
    <div className="flex flex-col gap-3">
      {groups.map(([cat, list]) => (
        <section key={cat}>
          <h3 className="eyebrow mb-1">{cat}</h3>
          <ul>
            {list.map((b) => (
              <li key={b.id}>
                <button className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]" onClick={() => focusSelection({ kind: 'building', id: b.id })}>
                  <span>{b.name}{b.sub && <span className="text-muted">（{b.sub}）</span>}</span>
                  <span className="chip" title={confLabel[b.confidence]}>{b.confidence}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-[11px] leading-relaxed text-muted">A／B／C 為建模可信度：B 有官方文字資料（樓層、面積、年份），C 只有平面圖位置。目前沒有建築達到 A 級，需要授權實景照片。</p>
    </div>
  );
}

function FacilitiesTab() {
  const cats = useMemo(() => {
    const items: { cat: string; label: string; act: () => void }[] = [
      ...PLACES.map((p) => ({ cat: p.category, label: p.name, act: () => focusSelection({ kind: 'place', id: p.id }) })),
      ...FACILITIES.filter((f) => f.listed).map((f) => ({ cat: f.category, label: f.name, act: () => focusSelection({ kind: 'facility', id: f.id }) })),
      ...BUILDINGS.filter((b) => b.minor).map((b) => ({ cat: b.category, label: `${b.name}（${b.sub}）`, act: () => focusSelection({ kind: 'building', id: b.id }) }))
    ];
    const order = ['出入口', '洗手間', '停車區', '運動場地', '公共設施', '景觀'];
    const m = new Map<string, typeof items>();
    items.forEach((i) => m.set(i.cat, [...(m.get(i.cat) ?? []), i]));
    return [...m.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, []);
  return (
    <div className="flex flex-col gap-3">
      {cats.map(([cat, list]) => (
        <section key={cat}>
          <h3 className="eyebrow mb-1">{cat}</h3>
          <div className="flex flex-wrap gap-1.5">{list.map((i) => <button key={i.label} className="chip hover:border-accent" onClick={i.act}>{i.label}</button>)}</div>
        </section>
      ))}
      <p className="text-[11px] leading-relaxed text-muted">無障礙設施尚無官方資料，待補充。</p>
    </div>
  );
}

function NavTab() {
  const from = useStore((s) => s.navFrom), to = useStore((s) => s.navTo), setNav = useStore((s) => s.setNav);
  const route = useStore((s) => s.route), setRoute = useStore((s) => s.setRoute);
  const [err, setErr] = useState('');
  const opts = useMemo(() => [...NAMED_NODES].sort((a, b) => a.name!.localeCompare(b.name!, 'zh-Hant')), []);
  const plan = (f = from, t = to) => {
    if (!t) { setErr('請選擇目的地。'); return; }
    if (f === t) { setErr('起點和終點相同。'); return; }
    const r = findRoute(f, t);
    if (!r) { setErr('這兩點之間目前沒有可用的路網連線。'); setRoute(null); return; }
    setErr(''); setRoute(r); camState.fitPoints(r.points);
  };
  return (
    <div className="flex flex-col gap-2.5">
      <label className="eyebrow" htmlFor="nav-from">起點</label>
      <select id="nav-from" className="field" value={from} onChange={(e) => setNav(e.target.value, to)}>
        {opts.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
      </select>
      <label className="eyebrow" htmlFor="nav-to">終點</label>
      <select id="nav-to" className="field" value={to} onChange={(e) => setNav(from, e.target.value)}>
        <option value="">選擇目的地</option>
        {opts.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
      </select>
      <div className="flex gap-2">
        <button className="tbtn flex-1 justify-center bg-accent text-accent-ink" onClick={() => plan()}>規劃步行路線</button>
        <button className="tbtn" onClick={() => { setNav(to || from, from); if (to) plan(to, from); }} title="交換起點與終點">交換</button>
      </div>
      {err && <p className="text-[13px] text-mark">{err}</p>}
      {route && (
        <div className="rounded-lg border border-line p-2.5">
          <p className="text-[15px] font-medium tabular-nums">約 {Math.round(route.length)} 公尺・步行 {Math.max(1, Math.round(route.minutes))} 分鐘</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">途經：{route.nodes.filter((n) => n.name).map((n) => n.name).join(' → ')}</p>
          {route.schematic && <p className="mt-2 text-[12px] leading-relaxed text-warn">示意路線：路網依平面圖繪製，尚未實地確認可通行。</p>}
          <button className="tbtn mt-1 px-0 text-muted" onClick={() => setRoute(null)}>清除路線</button>
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-muted">無障礙路線需要實地確認坡道與電梯位置，目前尚未提供。</p>
    </div>
  );
}

function HelpTab() {
  const rows: [string, string, string][] = [
    ['旋轉', '左鍵拖曳', '單指拖曳'], ['平移', '右鍵拖曳', '雙指拖曳'], ['縮放', '滾輪', '雙指捏合'],
    ['選取', '點建築或標籤', '點建築或標籤'], ['漫步移動', 'WASD／方向鍵，Shift 跑', '左下搖桿'], ['漫步轉向', '拖曳畫面', '拖曳畫面']
  ];
  return (
    <div className="flex flex-col gap-3 text-[13px] leading-relaxed">
      <table className="w-full text-left text-[12px]">
        <thead className="text-muted"><tr><th className="py-1 font-normal"></th><th className="font-normal">電腦</th><th className="font-normal">手機</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-line"><td className="py-1.5 pr-2 text-muted">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody>
      </table>
      <section>
        <h3 className="eyebrow mb-1">資料說明</h3>
        <p>建築位置取自官方校園平面圖，比例尺以官方公布的校地 11 公頃校正。四棟教學與行政大樓的樓層數、樓地板面積與興建年份取自官方校史；教室配置取自 115 學年度教室配置圖。</p>
        <p className="mt-1.5 text-muted">目前沒有已授權的實景照片，建築外觀以白模呈現，窗帶為示意。歡迎提供可授權的照片以提升擬真度。</p>
      </section>
    </div>
  );
}
