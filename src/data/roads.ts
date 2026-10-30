import type { PlanPoint } from './types';

/**
 * 校內步行路網（示意）
 *
 * 節點與連線依平面圖上的道路、空地與建築入口方向繪製，尚未經實地確認，
 * 因此導航結果一律標示為「示意路線」。
 * name 有值的節點會出現在導航起點／終點選單。
 */
export interface NavNode { id: string; plan: PlanPoint; name?: string; accessible?: boolean }
export interface NavEdge { a: string; b: string; kind: 'road' | 'path'; confirmed: boolean; accessible: boolean }

export const NAV_NODES: NavNode[] = [
  // 椰林大道（南 → 北）
  { id: 'gate', plan: [745, 1392], name: '大門' },
  { id: 'av1', plan: [715, 1335] },
  { id: 'av2', plan: [715, 1255] },
  { id: 'av3', plan: [715, 1140] },
  { id: 'av4', plan: [715, 1040] },
  { id: 'av5', plan: [715, 935] },
  { id: 'av6', plan: [715, 840] },
  { id: 'av7', plan: [715, 757] },
  { id: 'av8', plan: [715, 640] },
  { id: 'av9', plan: [715, 520] },
  { id: 'av10', plan: [715, 458] },
  // 東側
  { id: 'xuling', plan: [776, 757], name: '旭陵樓' },
  { id: 'c0', plan: [800, 643] },
  { id: 'court', plan: [960, 745], name: '中庭' },
  { id: 'huaien', plan: [960, 650], name: '懷恩樓' },
  { id: 'puyi', plan: [1050, 745], name: '樸毅樓' },
  { id: 'hongguan', plan: [960, 848], name: '宏觀樓' },
  { id: 'taobi', plan: [832, 1088], name: '陶壁' },
  { id: 'e1', plan: [880, 985] },
  { id: 'night', plan: [960, 990], name: '進修部大樓' },
  { id: 'e2', plan: [1070, 985] },
  { id: 'history', plan: [1074, 1000], name: '史蹟文物館' },
  { id: 'library', plan: [910, 1135], name: '圖書館' },
  { id: 'e3', plan: [1075, 1140] },
  { id: 'egate', plan: [1176, 1090], name: '東側門' },
  { id: 'wc-e', plan: [1136, 1125], name: '廁所（東側門旁）' },
  { id: 'lawn', plan: [785, 1230], name: '梅花池草坪' },
  { id: 'se1', plan: [830, 1310] },
  { id: 'se2', plan: [1012, 1305] },
  { id: 'shuren', plan: [1030, 1212], name: '樹人堂' },
  // 西側
  { id: 'shed1', plan: [640, 1080], name: '車棚' },
  { id: 'music', plan: [640, 1005], name: '音樂館' },
  { id: 'pool', plan: [590, 1130], name: '游泳池' },
  { id: 'gym', plan: [640, 1255], name: '體育館' },
  { id: 'w1', plan: [600, 1195] },
  { id: 'courts', plan: [503, 1195], name: '排球場／網球場' },
  { id: 'courts-sw', plan: [400, 1200], name: '西南球場' },
  { id: 'courts-w', plan: [365, 1050], name: '籃球場' },
  { id: 'w2', plan: [640, 935] },
  { id: 'w3', plan: [470, 935] },
  { id: 'w4', plan: [360, 935] },
  { id: 'wgate', plan: [345, 700], name: '西側門' },
  { id: 'w5', plan: [362, 700] },
  { id: 'yifeng', plan: [645, 693], name: '依風台／運動場' },
  // 北側
  { id: 'art', plan: [700, 432], name: '美術館' },
  { id: 'n1', plan: [600, 445] },
  { id: 'tech', plan: [546, 435], name: '生活科技館' },
  { id: 'science', plan: [450, 432], name: '科學館' },
  { id: 'n2', plan: [800, 470] },
  { id: 'dorm', plan: [870, 458], name: '陽明學苑' },
  { id: 'n3', plan: [995, 470] },
  { id: 'gifted', plan: [1050, 445], name: '資優大樓' },
  { id: 'n5', plan: [1048, 505] },
  { id: 'wc-n', plan: [1072, 512], name: '廁所（懷恩樓東側）' },
  { id: 'n4', plan: [995, 260] },
  { id: 'ngate', plan: [982, 218], name: '北側門' }
];

const E = (a: string, b: string, kind: NavEdge['kind'] = 'path'): NavEdge => ({ a, b, kind, confirmed: false, accessible: false }); // 無障礙路線尚未確認，暫不標記

export const NAV_EDGES: NavEdge[] = [
  E('gate', 'av1', 'road'), E('av1', 'av2', 'road'), E('av2', 'av3', 'road'), E('av3', 'av4', 'road'), E('av4', 'av5', 'road'),
  E('av5', 'av6', 'road'), E('av6', 'av7', 'road'), E('av7', 'av8', 'road'), E('av8', 'av9', 'road'), E('av9', 'av10', 'road'),
  E('av7', 'xuling'), E('av8', 'c0'), E('c0', 'huaien'), E('huaien', 'court'), E('court', 'puyi'), E('court', 'hongguan'),
  E('av4', 'taobi'), E('av5', 'e1'), E('e1', 'night'), E('night', 'e2'), E('e2', 'history'), E('e2', 'e3'),
  E('av3', 'library'), E('library', 'e3'), E('e3', 'wc-e'), E('wc-e', 'egate'),
  E('av2', 'lawn'), E('av1', 'se1', 'road'), E('se1', 'se2', 'road'), E('se2', 'shuren'), E('lawn', 'se1'),
  E('av4', 'shed1'), E('shed1', 'music'), E('av4', 'music'), E('shed1', 'pool'), E('av2', 'gym'), E('gym', 'w1'), E('w1', 'pool'),
  E('w1', 'courts'), E('courts', 'courts-sw'), E('courts-sw', 'courts-w'),
  E('av5', 'w2'), E('w2', 'music'), E('w2', 'w3'), E('w3', 'w4'), E('w4', 'w5'), E('w5', 'wgate'),
  E('av7', 'yifeng'),
  E('av10', 'art'), E('av10', 'n1'), E('n1', 'tech'), E('tech', 'science'),
  E('av10', 'n2'), E('n2', 'dorm'), E('dorm', 'n3'), E('n3', 'gifted'), E('gifted', 'n5'), E('n5', 'wc-n'), E('n3', 'n4'), E('n4', 'ngate')
];
