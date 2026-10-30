import type { Room } from './types';

/**
 * 115 學年度教室配置（來源：國立嘉義高中教室配置圖，sourceId: rooms-115）
 * 每層依建築走向排列：懷恩樓、宏觀樓由西 → 東；樸毅樓由北 → 南。
 * 換學年只要改這個檔案。
 */
export const ACADEMIC_YEAR = '115';

export const CLASSROOMS: Record<string, Record<number, Room[]>> = {
  huaien: {
    1: [
      { code: "320", name: "美術 320", type: "class3" },
      { code: "220", name: "美術 220", type: "class2" },
      { code: "120", name: "美術 120", type: "class1" },
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "319", name: "音樂 319", type: "class3" },
      { code: "219", name: "音樂 219", type: "class2" },
      { code: "119", name: "音樂 119", type: "class1" },
      { code: "212", name: "212", type: "class2" }
    ],
    2: [
      { code: "GUIDE", name: "輔導室", type: "office", span: 3 },
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "RES", name: "資源教室", type: "special" },
      { code: "213", name: "213", type: "class2" },
      { code: "214", name: "半導 214", type: "class2" },
      { code: "215", name: "雙語 215", type: "class2" }
    ],
    3: [
      { code: "GOV", name: "國公專科", type: "special" },
      { code: "LIT", name: "文史專科", type: "special" },
      { code: "201", name: "201", type: "class2" },
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "202", name: "202", type: "class2" },
      { code: "203", name: "203", type: "class2" },
      { code: "204", name: "204", type: "class2" },
      { code: "205", name: "205", type: "class2" }
    ],
    4: [
      { code: "MULTI", name: "多功能教室", type: "special" },
      { code: "206", name: "206", type: "class2" },
      { code: "207", name: "207", type: "class2" },
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "208", name: "208", type: "class2" },
      { code: "209", name: "209", type: "class2" },
      { code: "210", name: "210", type: "class2" },
      { code: "211", name: "211", type: "class2" }
    ]
  },
  puyi: {
    1: [
      { code: "101", name: "101", type: "class1" },
      { code: "102", name: "102", type: "class1" },
      { code: "GAME", name: "遊藝教室", type: "special" },
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "PC", name: "電腦教室", type: "special" },
      { code: "112", name: "112", type: "class1" },
      { code: "STACK", name: "書庫", type: "common" }
    ],
    2: [
      { code: "216", name: "語資 216", type: "class2" },
      { code: "217", name: "數資 217", type: "class2" },
      { code: "218", name: "科學 218", type: "class2" },
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "118", name: "科學 118", type: "class1" },
      { code: "117", name: "數資 117", type: "class1" },
      { code: "116", name: "語資 116", type: "class1" }
    ],
    3: [
      { code: "103", name: "103", type: "class1" },
      { code: "104", name: "104", type: "class1" },
      { code: "105", name: "105", type: "class1" },
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "106", name: "106", type: "class1" },
      { code: "107", name: "107", type: "class1" },
      { code: "108", name: "108", type: "class1" }
    ],
    4: [
      { code: "109", name: "109", type: "class1" },
      { code: "110", name: "110", type: "class1" },
      { code: "111", name: "111", type: "class1" },
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "113", name: "113", type: "class1" },
      { code: "114", name: "半導 114", type: "class1" },
      { code: "115", name: "雙語 115", type: "class1" }
    ]
  },
  hongguan: {
    1: [
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "HEALTH", name: "健康中心", type: "office" },
      { code: "SAFE", name: "校安中心", type: "office" },
      { code: "MIL", name: "教官室", type: "office", span: 2 },
      { code: "NIGHT", name: "進修部", type: "office", span: 2 },
      { code: "ST", name: "樓梯", type: "stair" }
    ],
    2: [
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "318", name: "科學 318", type: "class3" },
      { code: "317", name: "數資 317", type: "class3" },
      { code: "316", name: "語資 316", type: "class3" },
      { code: "315", name: "雙語 315", type: "class3" },
      { code: "314", name: "半導 314", type: "class3" },
      { code: "313", name: "313", type: "class3" },
      { code: "ST", name: "樓梯", type: "stair" }
    ],
    3: [
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "307", name: "307", type: "class3" },
      { code: "308", name: "308", type: "class3" },
      { code: "309", name: "309", type: "class3" },
      { code: "310", name: "310", type: "class3" },
      { code: "311", name: "311", type: "class3" },
      { code: "312", name: "312", type: "class3" },
      { code: "ST", name: "樓梯", type: "stair" }
    ],
    4: [
      { code: "ST", name: "樓梯", type: "stair" },
      { code: "306", name: "306", type: "class3" },
      { code: "305", name: "305", type: "class3" },
      { code: "304", name: "304", type: "class3" },
      { code: "303", name: "303", type: "class3" },
      { code: "302", name: "302", type: "class3" },
      { code: "301", name: "301", type: "class3" },
      { code: "ST", name: "樓梯", type: "stair" }
    ]
  }
};
