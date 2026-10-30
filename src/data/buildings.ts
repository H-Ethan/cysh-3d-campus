import type { BuildingDef } from './types';

const U = '2026-10-30';
const PLAN_ONLY = '尚無已授權的實景照片，外觀為白模，待補充實景資料。';
const PLAN_SIZE = '平面尺寸依校園平面圖量測，樓高為估算值。';

/**
 * 建築資料。位置一律取自官方校園平面圖（sourceIds 含 'plan'）。
 * 樓層數、面積、年份只填有官方文字依據者；其餘寫在 notes 標示為估算。
 */
export const BUILDINGS: BuildingDef[] = [
  {
    id: 'xuling', name: '旭陵樓', sub: '行政大樓', category: '行政', planRect: [783, 658, 885, 855],
    floors: 4, basement: true, floorArea: 5879, axis: 'z', depthFromArea: 'e',
    timeline: [{ year: '1995', event: '興建四層樓行政大樓（5,879 m²）', sourceId: 'history-1991' }],
    planColor: '#d6c2a2', confidence: 'B', navNode: 'xuling',
    summary: '全校行政中樞，位於中庭西側、面向椰林大道。',
    sourceIds: ['plan', 'intro', 'history-1991'],
    notes: ['量體深度依官方樓地板面積除以樓層數推算（含地下一層），並貼齊中庭側。', '地下一層依平面圖「B1」標示。', PLAN_ONLY],
    lastUpdated: U
  },
  {
    id: 'huaien', name: '懷恩樓', category: '教學', planRect: [778, 495, 1058, 628],
    floors: 4, basement: true, floorArea: 4634, axis: 'x', depthFromArea: 's',
    timeline: [{ year: '1997', event: '興建四層樓北棟教室（4,634 m²）', sourceId: 'history-1991' }],
    planColor: '#d9c6a8', confidence: 'B', navNode: 'huaien',
    summary: '中庭北側的教學大樓（北棟）。1F 為音樂班與美術班，2F 有輔導室，3F、4F 為高二班級。',
    sourceIds: ['plan', 'intro', 'history-1991', 'rooms-115'],
    notes: ['量體深度依官方樓地板面積推算，走廊朝向中庭為推測。', '教室順序依 115 學年度教室配置圖，各間寬度為平均分配。', PLAN_ONLY],
    lastUpdated: U
  },
  {
    id: 'puyi', name: '樸毅樓', category: '教學', planRect: [1060, 618, 1162, 855],
    floors: 4, basement: true, floorArea: 5240, axis: 'z', depthFromArea: 'w',
    timeline: [{ year: '2001', event: '興建四層樓東棟教室（5,240 m²）', sourceId: 'history-1991' }],
    planColor: '#d9c6a8', confidence: 'B', navNode: 'puyi',
    summary: '中庭東側的教學大樓（東棟），以高一班級為主。2F 為語資、數資、科學班，1F 有遊藝教室、電腦教室與書庫。',
    sourceIds: ['plan', 'intro', 'history-1991', 'rooms-115'],
    notes: ['量體深度依官方樓地板面積推算，走廊朝向中庭為推測。', '教室順序依 115 學年度教室配置圖，各間寬度為平均分配。', PLAN_ONLY],
    lastUpdated: U
  },
  {
    id: 'hongguan', name: '宏觀樓', category: '教學', planRect: [847, 865, 1070, 968],
    floors: 4, basement: true, floorArea: 5355, axis: 'x', depthFromArea: 'n',
    timeline: [{ year: '2000', event: '興建四層樓南棟教室（5,355 m²）', sourceId: 'history-1991' }],
    planColor: '#d9c6a8', confidence: 'B', navNode: 'hongguan',
    summary: '中庭南側、羅馬廣場旁的教學大樓（南棟）。1F 有進修部、教官室、校安中心與健康中心，2F 至 4F 為高三班級。',
    sourceIds: ['plan', 'intro', 'history-1991', 'rooms-115'],
    notes: ['量體深度依官方樓地板面積推算，走廊朝向中庭為推測。', '教室順序依 115 學年度教室配置圖，各間寬度為平均分配。', PLAN_ONLY],
    lastUpdated: U
  },
  {
    id: 'art', name: '美術館', category: '專科教室', planRect: [612, 282, 755, 345], extraRects: [[612, 345, 688, 420]],
    floors: 4, floorArea: 2269,
    timeline: [{ year: '1995', event: '拆除生物館，改建四層樓美術館（2,269 m²）', sourceId: 'history-1991' }],
    planColor: '#ee9097', confidence: 'B', navNode: 'art',
    summary: '美術班專科教室，位於椰林大道北端。L 形配置，東側連接木工室。',
    sourceIds: ['plan', 'intro', 'history-1991'], notes: [PLAN_SIZE, PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'music', name: '音樂館', category: '專科教室', planRect: [478, 965, 578, 1045],
    floors: 6, floorArea: 4496,
    timeline: [{ year: '2000', event: '六層樓音樂館（4,496 m²）完工', sourceId: 'history-1991' }, { year: '2001', event: '音樂新館完工啟用', sourceId: 'history-1991' }],
    planColor: '#f08fe2', confidence: 'B', navNode: 'music',
    summary: '音樂班專科教室，位於椰林大道西側。',
    sourceIds: ['plan', 'intro', 'history-1991'], notes: [PLAN_SIZE, PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'history', name: '史蹟文物館', category: '展覽', planRect: [1080, 948, 1122, 1052],
    floors: 1, storeyScale: 1.8, roof: 'gable', material: 'wood',
    timeline: [{ year: '日治時期', event: '木造禮堂，後改為合作社餐廳', sourceId: 'history-2005' }, { year: '2006', event: '修繕為史蹟文物館兼中型演講廳', sourceId: 'history-2005' }],
    planColor: '#ef9eec', confidence: 'B', navNode: 'history',
    summary: '嘉中最老的建築，原為日治時期的木造禮堂，2006 年修繕為史蹟文物館兼中型演講廳。',
    sourceIds: ['plan', 'intro', 'history-2005'],
    notes: ['木造與禮堂用途有官方依據；單層、斜屋頂與高度為依禮堂形式估算。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'science', name: '科學館', category: '專科教室', planRect: [345, 285, 505, 415],
    floors: 4,
    timeline: [{ year: '2009', event: '科學大樓改建工程動工', sourceId: 'history-2005' }, { year: '2010', event: '新科學大樓落成', sourceId: 'history-2005' }],
    planColor: '#d860cf', confidence: 'C', navNode: 'science',
    summary: '位於校園西北角的科學大樓，2010 年落成。',
    sourceIds: ['plan', 'intro', 'history-2005'], notes: ['樓層數未找到官方資料，暫以 4 層估算。', PLAN_SIZE, PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'tech', name: '生活科技館', category: '專科教室', planRect: [520, 278, 572, 420], floors: 3,
    planColor: '#c9a12e', confidence: 'C', navNode: 'tech', summary: '生活科技課程使用的專科教室。',
    sourceIds: ['plan', 'intro'], notes: ['樓層數未確認（估算 3 層）。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'wood', name: '木工室', category: '專科教室', planRect: [755, 278, 790, 348], floors: 1,
    planColor: '#c9a12e', confidence: 'C', navNode: 'art', summary: '美術館東側的木工室。',
    sourceIds: ['plan'], notes: ['樓層數未確認（估算 1 層）。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'dorm', name: '陽明學苑', sub: '學生宿舍', category: '生活', planRect: [765, 360, 980, 445], floors: 4,
    planColor: '#ef9eec', confidence: 'C', navNode: 'dorm',
    summary: '學生宿舍。西側有水池。',
    timeline: [{ year: '2004', event: '學生宿舍裝設冷氣', sourceId: 'history-1991' }],
    sourceIds: ['plan', 'intro', 'history-1991'], notes: ['樓層數未確認（估算 4 層）。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'gifted', name: '資優大樓', category: '教學', planRect: [1010, 285, 1090, 435], floors: 4,
    planColor: '#d4b598', confidence: 'C', navNode: 'gifted', summary: '位於校園東北角、椰林大道底端的資優大樓。',
    sourceIds: ['plan'], notes: ['樓層數未確認（估算 4 層）。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'armory', name: '軍械室', category: '行政', planRect: [1058, 452, 1105, 490], floors: 1,
    planColor: '#6f9fd8', confidence: 'C', navNode: 'gifted', summary: '懷恩樓東北側的軍械室。',
    sourceIds: ['plan'], notes: ['樓層數未確認（估算 1 層）。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'night', name: '進修部大樓', category: '教學', planRect: [893, 998, 1052, 1048], floors: 3,
    planColor: '#d8c3a6', confidence: 'C', navNode: 'night', summary: '宏觀樓南側的進修學校教室。',
    sourceIds: ['plan', 'intro'], notes: ['樓層數未確認（估算 3 層）。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'library', name: '圖書館', category: '學習資源', planRect: [918, 1055, 1050, 1120], floors: 3,
    planColor: '#f2a040', confidence: 'C', navNode: 'library', summary: '位於椰林大道東側、進修部大樓南邊。',
    sourceIds: ['plan', 'intro'], notes: ['樓層數未確認（估算 3 層）。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'shuren', name: '樹人堂', sub: '活動中心', category: '活動', planRect: [1038, 1155, 1135, 1268],
    floors: 1, storeyScale: 3,
    planColor: '#efeca6', confidence: 'C', navNode: 'shuren', summary: '活動中心（禮堂），位於椰林大道東側、梅花池草坪旁。',
    sourceIds: ['plan', 'intro'], notes: ['挑高量體，高度為估算值。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'gym', name: '體育館', category: '運動', planRect: [507, 1208, 592, 1302], floors: 1, storeyScale: 3.4,
    planColor: '#f1c18d', confidence: 'C', navNode: 'gym', summary: '室內運動場館，位於游泳池南側。',
    sourceIds: ['plan', 'intro'], notes: ['挑高量體，高度為估算值。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'oldmusic', name: '懷舊音樂館', category: '專科教室', planRect: [345, 942, 415, 995], floors: 1,
    planColor: '#f08fe2', confidence: 'C', navNode: 'music', summary: '籃球場北端的懷舊音樂館。',
    sourceIds: ['plan'], notes: ['樓層數未確認（估算 1 層）。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'clubs', name: '學生社團', category: '活動', planRect: [413, 1208, 498, 1253], floors: 1,
    planColor: '#ece05a', confidence: 'C', navNode: 'gym', summary: '學生社團活動空間。',
    sourceIds: ['plan'], notes: ['樓層數未確認（估算 1 層）。', PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'guard', name: '警衛室', category: '行政', planRect: [632, 1362, 700, 1394], floors: 1,
    planColor: '#8fd1b8', confidence: 'C', navNode: 'gate', summary: '大雅路大門旁的警衛室。',
    sourceIds: ['plan'], notes: [PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'wc-n', name: '廁所', sub: '懷恩樓東側', category: '洗手間', planRect: [1083, 492, 1106, 530], floors: 1,
    planColor: '#e7998a', confidence: 'C', navNode: 'wc-n', summary: '平面圖標示的廁所。', minor: true,
    sourceIds: ['plan'], notes: [PLAN_ONLY], lastUpdated: U
  },
  {
    id: 'wc-e', name: '廁所', sub: '東側門旁', category: '洗手間', planRect: [1142, 1100, 1160, 1150], floors: 1,
    planColor: '#e7998a', confidence: 'C', navNode: 'egate', summary: '平面圖標示的廁所。', minor: true,
    sourceIds: ['plan'], notes: [PLAN_ONLY], lastUpdated: U
  }
];

export const buildingById: Record<string, BuildingDef> = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));
