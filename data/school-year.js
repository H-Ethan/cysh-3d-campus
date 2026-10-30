// 國立嘉義高中 3D 校園導覽 — 每學年更新資料
//
// 換學年時只需修改這個檔案：
//   1. academicYear：學年度（頁首自動顯示）
//   2. buildings：各建築的名稱、簡介與各樓層空間配置
//
// 各樓層空間 (floorsData) 填寫方式：
//   - 每一層是一個陣列，依建築走向排列：
//       東西向建築（懷恩樓、宏觀樓）由「西 → 東」
//       南北向建築（樸毅樓）由「北 → 南」
//   - 每個空間：{ code: "代碼或班級", name: "顯示名稱", type: "類型", span: 佔幾格(預設1) }
//     type：class1 高一班級、class2 高二班級、class3 高三班級、
//           special 專科／特殊教室、office 處室、stair 樓梯、common 公共空間
//   - 搜尋班級（例如 315）會比對 code 與 name
//
// 資料來源：國立嘉義高中教室配置圖（115 學年度）
// 建築位置、大小與外觀請改 data/campus-data.js。

window.SCHOOL_YEAR_DATA = {
  academicYear: "115",

  buildings: {
    huaien: { // 東西向：西 → 東
      name: "懷恩樓",
      summary: "位於中庭北側的教學大樓，地上 4 層、地下 1 層。1F 為音樂班與美術班，2F 有輔導室，3F、4F 為高二班級。",
      floorsData: {
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
      }
    },

    puyi: { // 南北向：北 → 南
      name: "樸毅樓",
      summary: "位於中庭東側的教學大樓，地上 4 層、地下 1 層。以高一班級為主，2F 為語資、數資、科學班，1F 有遊藝教室、電腦教室與書庫。",
      floorsData: {
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
      }
    },

    hongguan: { // 東西向：西 → 東
      name: "宏觀樓",
      summary: "位於中庭南側、羅馬廣場旁的教學大樓，地上 4 層、地下 1 層。1F 有進修部、教官室、校安中心與健康中心，2F 至 4F 為高三班級。",
      floorsData: {
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
    },

    xuling: { name: "旭陵樓", summary: "行政大樓，位於中庭西側、面向椰林大道，地上 4 層、地下 1 層。" },
    science: { name: "科學館", summary: "位於校園西北角的專科教室大樓。" },
    tech: { name: "生活科技館", summary: "生活科技課程使用的專科教室。" },
    art: { name: "美術館", summary: "美術課程使用的專科教室，L 形配置，東側連接木工室。" },
    wood: { name: "木工室", summary: "生活科技木工實作教室。" },
    dorm: { name: "陽明學苑", summary: "學生宿舍，西側有水池。" },
    gifted: { name: "資優大樓", summary: "位於校園東北角。" },
    armory: { name: "軍械室", summary: "" },
    night: { name: "進修部大樓", summary: "位於宏觀樓南側。" },
    history: { name: "史蹟館", summary: "校史展示空間，位於宏觀樓東南側。" },
    library: { name: "圖書館", summary: "位於進修部大樓南側。" },
    shuren: { name: "樹人堂", summary: "活動中心，位於校園東南側、梅花池草坪東邊。" },
    music: { name: "音樂館", summary: "音樂班專科教室。" },
    oldmusic: { name: "懷舊音樂館", summary: "" },
    clubs: { name: "學生社團", summary: "學生社團活動空間。" },
    gym: { name: "體育館", summary: "室內運動場館，位於游泳池南側。" },
    guard: { name: "警衛室", summary: "大門旁的警衛室。" }
  }
};
