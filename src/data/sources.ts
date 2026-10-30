import type { SourceDef } from './types';

/** 參考資料庫：所有建築與設施資料都必須對應到這裡的來源 */
export const SOURCES: SourceDef[] = [
  {
    id: 'plan',
    title: '國立嘉義高級中學校園平面圖',
    publisher: '國立嘉義高中',
    url: 'https://www.cysh.cy.edu.tw/p/412-1008-95.php',
    published: '未標示',
    accessed: '2026-10-30',
    kind: 'official-map',
    reliability: '高',
    usedFor: '全部建築與設施的位置、相對配置、出入口；校界輪廓'
  },
  {
    id: 'intro',
    title: '嘉中簡介',
    publisher: '國立嘉義高中',
    url: 'https://www.cysh.cy.edu.tw/p/412-1008-89.php',
    published: '未標示',
    accessed: '2026-10-30',
    kind: 'official-text',
    reliability: '高',
    usedFor: '校地 11 公頃（比例尺校正）、地址、建築名稱與用途、校園前中後三段地勢'
  },
  {
    id: 'history-1991',
    title: '校史 1991 年～2004 年',
    publisher: '國立嘉義高中',
    url: 'https://www.cysh.cy.edu.tw/p/412-1008-1322.php',
    published: '未標示',
    accessed: '2026-10-30',
    kind: 'official-text',
    reliability: '高',
    usedFor: '旭陵樓、懷恩樓、宏觀樓、樸毅樓、美術館、音樂館的樓層數、樓地板面積與興建年份；椰林、白石園、陶壁'
  },
  {
    id: 'history-2005',
    title: '校史 2005 年～至今',
    publisher: '國立嘉義高中',
    url: 'https://www.cysh.cy.edu.tw/p/412-1008-4934.php',
    published: '未標示（記載至 2023 年）',
    accessed: '2026-10-30',
    kind: 'official-text',
    reliability: '高',
    usedFor: '科學大樓 2010 年落成、史蹟文物館為日治時期木造禮堂（2006 年修繕）、旭陵文學步道'
  },
  {
    id: 'rooms-115',
    title: '國立嘉義高中教室配置圖（115 學年度）',
    publisher: '國立嘉義高中（由使用者提供）',
    published: '115 學年度',
    accessed: '2026-10-30',
    kind: 'official-schedule',
    reliability: '高',
    usedFor: '懷恩樓、樸毅樓、宏觀樓各樓層班級與處室配置'
  }
];

export const sourceById = Object.fromEntries(SOURCES.map((s) => [s.id, s]));
