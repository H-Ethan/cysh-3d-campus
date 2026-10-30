# 國立嘉義高中 3D 互動校園導覽

以 **React + TypeScript + Vite + React Three Fiber** 建置的國立嘉義高中 3D 校園導覽。建築位置取自官方校園平面圖，樓層與面積取自官方校史，教室配置取自 115 學年度教室配置圖。

真實性優先：沒有依據的細節不會自行生成。每棟建築都有可信度分級（A／B／C）與資料來源。

## 功能

- **3D 校園**：20 棟建築、2 處廁所、運動場、球場、游泳池、椰林大道（大王椰子）、中庭、羅馬廣場、鐘樓、陶壁、白石園、四個出入口與圍牆。
- **建築互動**：滑鼠移入時高亮，點選後鏡頭聚焦，右側資訊面板顯示建築用途、樓層、官方面積與年份、估算說明、資料來源與更新日期。
- **樓層與教室**：可切換全部、B1、1F 到 4F。懷恩樓、樸毅樓、宏觀樓共 60 個班級與各處室，依年級分色。
- **搜尋**：輸入班級（`315`）、處室（「輔導室」）、建築或設施，畫面會飛到該處。網址加 `#315` 可以直接定位。
- **校園導航**：在路網上用 Dijkstra 演算法規劃最短步行路線，顯示距離、時間與途經地點。目前的路線是示意路線。
- **校園漫步**：可切換第三人稱或第一人稱，有建築與圍牆碰撞，手機上用搖桿操作。
- **檢視**：2D 俯視與 3D 鳥瞰切換、全螢幕、指北針、白模與平面圖配色切換、高畫質與省電模式切換。
- **跨裝置**：手機版面、WebGL 不支援時的提示、載入進度。

## 開發

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build      # 型別檢查並輸出 dist/
npm run preview
```

需要 Node.js 18 以上版本。

## 專案結構

```
src/
  data/                 資料層（更新校園資訊只要改這裡）
    buildings.ts        建築：位置、樓層、面積、年份、可信度、來源、估算說明
    classrooms.ts       各學年度教室配置（換學年只改這個檔）
    facilities.ts       校界、球場、廣場、出入口、地標
    roads.ts            導航路網節點與連線
    vegetation.ts       椰子樹位置
    sources.ts          參考資料庫（網址、發布與查閱日期、可信度）
    geo.ts              座標換算（平面圖像素 → 公尺）
    types.ts            資料型別
  lib/                  layout（量體與教室配置計算）、pathfinding、search、selection
  scene/                3D 場景：Building、Campus、CameraRig、Walker、RouteLine、ModelBuilding
  ui/                   TopBar、SidePanel、InfoPanel、Controls（樓層列、指北針、漫步）
  store.ts              全域狀態（zustand）
docs/research.md        資料蒐集成果、推算方法與尚缺資料
public/models/          Blender 匯出的 GLB 模型
```

### 座標系統

單位是公尺，X 軸向東，Z 軸向南（北方為 -Z）。資料檔裡的 `planRect: [左, 上, 右, 下]` 是校園平面圖上的像素範圍，由 `geo.ts` 換算成公尺。比例尺依官方公布的校地 11 公頃校正，為 0.3234 m/px。

### 可信度分級

| 等級 | 條件 | 目前建築 |
|---|---|---|
| A | 有可靠的多角度照片與比例資訊 | 無 |
| B | 有官方文字資料（樓層、面積、年份），只還原有依據的部分 | 旭陵樓、懷恩樓、樸毅樓、宏觀樓、美術館、音樂館、史蹟文物館 |
| C | 只有平面圖位置，以白模呈現，待補充實景資料 | 其餘建築 |

### 更新資料

- **換學年**：修改 `src/data/classrooms.ts`。每層依建築走向排列，懷恩樓與宏觀樓由西到東，樸毅樓由北到南。`type` 可填 `class1`、`class2`、`class3`、`special`、`office`、`stair`、`common`；`span` 是佔幾格。
- **補照片**：在 `buildings.ts` 對應建築填入 `photo`（網址、作者、授權、拍攝日期、來源 ID），並在 `sources.ts` 新增來源。只使用授權明確的照片。
- **加入 Blender 模型**：匯出 GLB，原點放在建築地面中心，1 單位等於 1 公尺，正面朝北。將檔案放進 `public/models/`，再填入 `modelUrl: 'models/xxx.glb'`。
- **確認路網**：實地確認後，把 `roads.ts` 對應連線的 `confirmed` 改為 `true`；有無障礙坡道的連線改 `accessible: true`。

## 部署

### Render

1. 到 render.com，選 New，再選 **Blueprint**。
2. 選擇這個 GitHub repo。Render 會讀取 `render.yaml`，執行 `npm ci && npm run build`，並發布 `dist/`。
3. 之後每次 push 到 `main` 都會自動部署。

如果要手動建立，有兩種方式：

| 服務類型 | Build Command | 其他設定 |
|---|---|---|
| **Static Site**（建議，免費、不會休眠） | `npm ci && npm run build` | Publish Directory 填 `dist` |
| **Web Service**（Node） | `npm ci && npm run build` | Start Command 填 `npm start`（由 `server.mjs` 提供 `dist/`） |

### GitHub Pages

執行 `npm run build`，再把 `dist/` 發布到 Pages（設定檔已使用相對路徑 `base: './'`）。

## 資料來源

詳見 [docs/research.md](docs/research.md) 與 `src/data/sources.ts`。所有資料皆取自國立嘉義高中官方網站與學校提供的教室配置圖。
