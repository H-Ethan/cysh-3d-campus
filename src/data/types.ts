/** 平面圖像素矩形 [左, 上, 右, 下]（北方朝上） */
export type PlanRect = [number, number, number, number];
export type PlanPoint = [number, number];

/**
 * 建模可信度
 * A：有可靠的多角度照片與比例資訊
 * B：有官方文字資料（樓層、面積、年份）或部分照片，僅還原有依據的部分
 * C：只有平面圖位置，以白模呈現，待補充實景資料
 */
export type Confidence = 'A' | 'B' | 'C';

export type RoomType = 'class1' | 'class2' | 'class3' | 'special' | 'office' | 'stair' | 'common';

export interface Room {
  code: string;
  name: string;
  type: RoomType;
  /** 佔幾格，預設 1 */
  span?: number;
}

export interface Photo {
  url: string;
  credit: string;
  license: string;
  /** 拍攝日期；未知請填「拍攝日期未確認」 */
  taken: string;
  sourceId: string;
}

export interface BuildingDef {
  id: string;
  name: string;
  sub?: string;
  category: string;
  /** 平面圖上的範圍 */
  planRect: PlanRect;
  extraRects?: PlanRect[];
  /** 地上樓層 */
  floors: number;
  basement?: boolean;
  /** 單層樓高倍率（禮堂、體育館等挑高建築） */
  storeyScale?: number;
  /** 官方公布的樓地板面積（m²） */
  floorArea?: number;
  /** 興建、落成或重要整修年份 */
  timeline?: { year: string; event: string; sourceId: string }[];
  /** 長向：x 東西向、z 南北向 */
  axis?: 'x' | 'z';
  /**
   * 量體深度依官方樓地板面積推算，並貼齊平面圖的哪一側（走廊朝向中庭）。
   * 未設定時直接使用平面圖範圍。
   */
  depthFromArea?: 'n' | 's' | 'e' | 'w';
  roof?: 'flat' | 'gable';
  material?: 'concrete' | 'wood';
  /** 平面圖上的配色，供「平面圖配色」模式使用 */
  planColor: string;
  confidence: Confidence;
  summary: string;
  sourceIds: string[];
  /** 估算與待確認事項，會顯示在資訊面板 */
  notes: string[];
  photo?: Photo;
  /** 之後若以 Blender 製作 GLB，可填入 public/ 底下的路徑 */
  modelUrl?: string;
  /** 導航入口節點 */
  navNode?: string;
  /** 次要小建物（廁所等），不出現在建築清單 */
  minor?: boolean;
  lastUpdated: string;
}

export type FacilityKind = 'court' | 'pool' | 'lawn' | 'plaza' | 'road' | 'shed' | 'stage' | 'wall' | 'garden';

export interface FacilityDef {
  id: string;
  name: string;
  kind: FacilityKind;
  category: string;
  planRect: PlanRect;
  height?: number;
  solid?: boolean;
  listed?: boolean;
  navNode?: string;
  note?: string;
}

export interface PlaceDef {
  id: string;
  name: string;
  category: string;
  plan: PlanPoint;
  kind: 'gate' | 'pavilion' | 'tower' | 'plaza' | 'pond' | 'marker' | 'track';
  navNode?: string;
  note?: string;
}

export interface SourceDef {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  /** 發布日期；未知填「未標示」 */
  published: string;
  accessed: string;
  kind: 'official-map' | 'official-text' | 'official-schedule' | 'user-provided';
  reliability: '高' | '中' | '低';
  usedFor: string;
}
