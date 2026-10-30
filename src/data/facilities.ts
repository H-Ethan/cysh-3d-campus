import type { FacilityDef, PlaceDef, PlanPoint } from './types';

/** 校界（依平面圖描繪） */
export const CAMPUS_OUTLINE: PlanPoint[] = [
  [345, 268], [1082, 188], [1165, 520], [1205, 1060], [1175, 1300], [1150, 1385],
  [705, 1368], [640, 1402], [60, 1398], [238, 935], [330, 932]
];

/** 周邊道路名稱（平面圖標示） */
export const STREETS = [
  { name: '公園街', plan: [700, 175] as PlanPoint },
  { name: '大雅路', plan: [640, 1470] as PlanPoint }
];

/** 運動場：跑道外緣、內緣、草皮（中心、半寬、直道半長，單位：像素） */
export const TRACK = { center: [475, 692] as PlanPoint, outer: [102, 125], lane: [85, 120], field: [64, 112] };

export const FACILITIES: FacilityDef[] = [
  { id: 'bball1', name: '籃球場', kind: 'court', category: '運動場地', planRect: [282, 935, 345, 1128], listed: true, navNode: 'courts-w' },
  { id: 'volley', name: '排球場', kind: 'court', category: '運動場地', planRect: [412, 1000, 495, 1115], listed: true, navNode: 'courts' },
  { id: 'tennis1', name: '網球場', kind: 'court', category: '運動場地', planRect: [412, 1115, 497, 1190], listed: true, navNode: 'courts' },
  { id: 'pool', name: '游泳池', kind: 'pool', category: '運動場地', planRect: [505, 1075, 576, 1185], listed: true, navNode: 'pool' },
  { id: 'tennis2', name: '網球場（西南）', kind: 'court', category: '運動場地', planRect: [296, 1165, 362, 1262], listed: true, navNode: 'courts-sw' },
  { id: 'bball2', name: '籃球場（西南）', kind: 'court', category: '運動場地', planRect: [268, 1165, 296, 1262], listed: true, navNode: 'courts-sw' },
  { id: 'lawn', name: '梅花池草坪', kind: 'lawn', category: '景觀', planRect: [792, 1162, 985, 1298], listed: true, navNode: 'lawn' },
  { id: 'taobi', name: '陶壁', kind: 'wall', category: '景觀', planRect: [803, 1095, 862, 1128], height: 2.4, solid: true, listed: true, navNode: 'taobi', note: '1994 年校友捐贈設置（校史 1991–2004）。高度為估算值。' },
  { id: 'yifeng', name: '依風台', kind: 'stage', category: '運動場地', planRect: [576, 645, 616, 742], height: 1.2, solid: true, listed: true, navNode: 'yifeng', note: '司令台（嘉中簡介）。高度為估算值。' },
  { id: 'shed1', name: '車棚', kind: 'shed', category: '停車區', planRect: [597, 958, 627, 1205], listed: true, navNode: 'shed1' },
  { id: 'shed2', name: '車棚（東南）', kind: 'shed', category: '停車區', planRect: [860, 1322, 1145, 1370], listed: true, navNode: 'se1' },
  { id: 'shed3', name: '車棚（西南）', kind: 'shed', category: '停車區', planRect: [362, 1165, 390, 1262], listed: true, navNode: 'courts-sw' },
  { id: 'baishi1', name: '白石園', kind: 'garden', category: '景觀', planRect: [614, 465, 642, 640], listed: true, navNode: 'av9', note: '1994 年 4 月完工（校史 1991–2004）。' },
  { id: 'baishi2', name: '白石園', kind: 'garden', category: '景觀', planRect: [618, 742, 646, 915] },
  { id: 'baishi3', name: '白石園', kind: 'garden', category: '景觀', planRect: [785, 875, 808, 965] },
  { id: 'avenue', name: '椰林大道', kind: 'road', category: '景觀', planRect: [650, 470, 780, 1360], listed: true, navNode: 'av5', note: '1994 年於校門入口道路兩側種植大王椰子（校史 1991–2004）。' },
  { id: 'court', name: '中庭', kind: 'plaza', category: '景觀', planRect: [886, 628, 1060, 862], listed: true, navNode: 'court' }
];

export const PLACES: PlaceDef[] = [
  { id: 'gate', name: '大門', category: '出入口', plan: [750, 1405], kind: 'gate', navNode: 'gate', note: '大雅路二段 738 號' },
  { id: 'egate', name: '東側門', category: '出入口', plan: [1182, 1090], kind: 'gate', navNode: 'egate' },
  { id: 'wgate', name: '西側門', category: '出入口', plan: [340, 700], kind: 'gate', navNode: 'wgate' },
  { id: 'ngate', name: '北側門', category: '出入口', plan: [982, 212], kind: 'gate', navNode: 'ngate' },
  { id: 'track', name: '運動場', category: '運動場地', plan: [475, 692], kind: 'track', navNode: 'yifeng' },
  { id: 'roma', name: '羅馬廣場', category: '景觀', plan: [970, 838], kind: 'plaza', navNode: 'court' },
  { id: 'bell', name: '鐘樓', category: '景觀', plan: [1010, 740], kind: 'tower', navNode: 'court', note: '平面圖標示位置。外觀與高度為估算值。' },
  { id: 'meihua', name: '梅花池', category: '景觀', plan: [888, 1222], kind: 'pond', navNode: 'lawn' },
  { id: 'pond', name: '水池', category: '景觀', plan: [751, 413], kind: 'pond', navNode: 'av10' },
  { id: 'liyu', name: '立譽亭', category: '景觀', plan: [626, 476], kind: 'pavilion', navNode: 'av9' },
  { id: 'chengmen', name: '程門亭', category: '景觀', plan: [634, 902], kind: 'pavilion', navNode: 'av5' },
  { id: 'jianghe', name: '江河亭', category: '景觀', plan: [380, 1050], kind: 'pavilion', navNode: 'courts-w' },
  { id: 'atm', name: 'ATM', category: '公共設施', plan: [598, 1392], kind: 'marker', navNode: 'gate' },
  { id: 'hanpo', name: '好漢坡', category: '景觀', plan: [280, 705], kind: 'marker', navNode: 'wgate' }
];
