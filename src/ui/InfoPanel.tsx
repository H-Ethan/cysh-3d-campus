import { buildingById } from '../data/buildings';
import { FACILITIES, PLACES } from '../data/facilities';
import { sourceById } from '../data/sources';
import type { BuildingDef, Confidence } from '../data/types';
import { camState } from '../lib/camState';
import { floorName, isNumericClass, layoutById, roomByKey } from '../lib/layout';
import { findRoute, nodeById } from '../lib/pathfinding';
import { ROOM_TYPE_LABEL, ROOM_TYPE_VAR, roomTitle } from '../lib/search';
import { focusOf, focusSelection } from '../lib/selection';
import { useStore } from '../store';

const CONF: Record<Confidence, { label: string; desc: string }> = {
  A: { label: 'A 高可信度', desc: '有可靠的多角度照片與比例資訊。' },
  B: { label: 'B 中可信度', desc: '有官方文字資料，僅還原有依據的部分。' },
  C: { label: 'C 白模', desc: '只有平面圖位置，待補充實景資料。' }
};

function gmaps(name: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('國立嘉義高中 ' + name)}`;
}

export function InfoPanel() {
  const sel = useStore((s) => s.selection);
  const walk = useStore((s) => s.walk);
  const select = useStore((s) => s.select);
  if (!sel || walk) return null;

  let building: BuildingDef | undefined;
  let title = '', meta: string[] = [], body = '', note = '';
  if (sel.kind === 'building') {
    building = buildingById[sel.id];
    title = building.name + (building.sub ? `（${building.sub}）` : '');
  } else if (sel.kind === 'room') {
    const r = roomByKey[sel.key];
    building = buildingById[r.buildingId];
    title = roomTitle(r.code, r.name);
    meta = [building.name, floorName(r.floor), ROOM_TYPE_LABEL[r.type]];
    body = `位於${building.name} ${floorName(r.floor)}。`;
  } else if (sel.kind === 'facility') {
    const f = FACILITIES.find((x) => x.id === sel.id)!;
    title = f.name; meta = [f.category]; note = f.note ?? '位置取自校園平面圖。';
  } else {
    const p = PLACES.find((x) => x.id === sel.id)!;
    title = p.name; meta = [p.category]; note = p.note ?? '位置取自校園平面圖。';
  }

  const focus = focusOf(sel);
  const navTo = () => {
    const st = useStore.getState();
    const to = focus?.navNode; if (!to) return;
    const from = st.navFrom && st.navFrom !== to ? st.navFrom : 'gate';
    st.setNav(from, to); st.setPanel('nav');
    const r = findRoute(from, to); st.setRoute(r); if (r) camState.fitPoints(r.points);
  };

  return (
    <section className="info-panel glass fixed z-30 flex flex-col" aria-label="資訊面板">
      <div className="flex items-start gap-2 border-b border-line p-3.5 pb-3">
        <div className="min-w-0 flex-1">
          {sel.kind === 'room' && <p className="eyebrow">{building?.name}</p>}
          <h2 className="font-display text-[22px] font-bold leading-tight">{title}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {meta.map((m) => <span key={m} className="chip">{m}</span>)}
            {building && sel.kind === 'building' && (
              <>
                <span className="chip">{building.category}</span>
                <span className="chip">地上 {building.floors} 層{building.basement ? '・地下 1 層' : ''}</span>
                <span className="chip" title={CONF[building.confidence].desc} style={{ borderColor: building.confidence === 'C' ? 'var(--warn)' : undefined }}>{CONF[building.confidence].label}</span>
              </>
            )}
          </div>
        </div>
        <button className="tbtn -mr-1 -mt-1" onClick={() => select(null)} aria-label="關閉資訊面板">✕</button>
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-3.5 pt-3 text-[13px] leading-relaxed">
        {building && sel.kind === 'building' && (
          <>
            <Photo b={building} />
            <p className="mt-3">{building.summary}</p>
            <Facts b={building} />
          </>
        )}
        {body && <p>{body}</p>}
        {note && <p className="text-muted">{note}</p>}
        {building && layoutById[building.id].floors.some((f) => f.rooms.length) && <FloorRooms b={building} />}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {building && layoutById[building.id].floors.some((f) => f.rooms.length) && sel.kind === 'building' && (
            <button className="tbtn border-line" onClick={() => useStore.getState().setFloor(1)}>查看樓層</button>
          )}
          {focus?.navNode && nodeById[focus.navNode] && <button className="tbtn bg-accent text-accent-ink" onClick={navTo}>導航至此</button>}
          <button className="tbtn border-line" onClick={() => { useStore.getState().setFloor('all'); select(null); camState.home(); }}>返回全校</button>
        </div>
        {building && sel.kind === 'building' && <Sources b={building} />}
      </div>
    </section>
  );
}

function Photo({ b }: { b: BuildingDef }) {
  if (b.photo) {
    return (
      <figure>
        <img src={b.photo.url} alt={`${b.name}實景`} className="w-full rounded-lg" loading="lazy" />
        <figcaption className="mt-1 text-[11px] text-muted">{b.photo.credit}・{b.photo.license}・{b.photo.taken}</figcaption>
      </figure>
    );
  }
  return (
    <div className="rounded-lg border border-dashed border-line p-3 text-[12px] text-muted">
      <p>實景照片：資料整理中。目前沒有已確認授權與拍攝日期的照片。</p>
      <a className="mt-1 inline-block text-accent underline" href={gmaps(b.name)} target="_blank" rel="noreferrer">在 Google 地圖查看位置</a>
    </div>
  );
}

function Facts({ b }: { b: BuildingDef }) {
  const l = layoutById[b.id], r = l.rects[0];
  const rows: [string, string][] = [];
  if (b.floorArea) rows.push(['樓地板面積', `${b.floorArea.toLocaleString()} m²（官方）`]);
  rows.push(['量體尺寸', `約 ${Math.round(Math.max(r.w, r.d))} × ${Math.round(Math.min(r.w, r.d))} m（估算）`]);
  b.timeline?.forEach((t) => rows.push([t.year, t.event]));
  return (
    <>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]">
        {rows.map(([k, v], i) => <div key={i} className="contents"><dt className="text-muted tabular-nums">{k}</dt><dd>{v}</dd></div>)}
      </dl>
      {b.notes.length > 0 && (
        <ul className="mt-2.5 list-disc pl-4 text-[11px] text-muted">{b.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      )}
    </>
  );
}

function FloorRooms({ b }: { b: BuildingDef }) {
  const floor = useStore((s) => s.floor), setFloor = useStore((s) => s.setFloor);
  const sel = useStore((s) => s.selection);
  const l = layoutById[b.id];
  const withRooms = l.floors.filter((f) => f.rooms.length);
  const cur = withRooms.find((f) => f.floor === floor) ?? (sel?.kind === 'room' ? withRooms.find((f) => f.floor === roomByKey[sel.key].floor) : undefined);
  return (
    <div className="mt-3.5">
      <div className="flex items-center justify-between"><h3 className="eyebrow">樓層與教室</h3><span className="text-[11px] text-muted">{b.axis === 'z' ? '由北 → 南' : '由西 → 東'}</span></div>
      <div className="mt-1.5 flex flex-wrap gap-1" role="tablist">
        {withRooms.map((f) => (
          <button key={f.floor} role="tab" className="tbtn min-h-[30px] border-line px-2.5 font-mono" aria-pressed={cur?.floor === f.floor} onClick={() => setFloor(f.floor)}>{floorName(f.floor)}</button>
        ))}
      </div>
      {!cur && <p className="mt-2 text-[12px] text-muted">選擇樓層查看教室配置。</p>}
      {cur && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cur.rooms.map((r) => {
            const isSel = sel?.kind === 'room' && sel.key === r.key;
            const num = isNumericClass(r.code);
            return (
              <button key={r.key} disabled={r.type === 'stair'} onClick={() => focusSelection({ kind: 'room', key: r.key })}
                className="flex min-w-[64px] flex-col items-start rounded-md border border-line px-2 py-1 text-left disabled:opacity-50"
                style={{ borderLeft: `4px solid ${ROOM_TYPE_VAR[r.type]}`, background: isSel ? 'color-mix(in srgb, var(--accent) 16%, transparent)' : undefined, borderColor: isSel ? 'var(--accent)' : undefined }}>
                <b className={num ? 'font-mono text-[13px] font-medium' : 'text-[13px] font-medium'}>{num ? r.code : r.name}</b>
                <small className="text-[11px] text-muted">{num ? (r.name.replace(r.code, '').trim() || ROOM_TYPE_LABEL[r.type]) : ROOM_TYPE_LABEL[r.type]}</small>
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-2 text-[11px] text-muted">來源：{sourceById['rooms-115'].title}。各間寬度為平均分配，非實測。</p>
    </div>
  );
}

function Sources({ b }: { b: BuildingDef }) {
  return (
    <details className="mt-3.5 text-[12px]">
      <summary className="cursor-pointer text-muted">參考資料（{b.sourceIds.length}）・更新於 {b.lastUpdated}</summary>
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {b.sourceIds.map((id) => {
          const s = sourceById[id];
          return (
            <li key={id}>
              {s.url ? <a className="text-accent underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : <span>{s.title}</span>}
              <span className="text-muted">・{s.publisher}・發布 {s.published}・查閱 {s.accessed}</span>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
