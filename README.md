# 國立嘉義高中 3D 校園導覽

依「國立嘉義高中校園平面圖」建模的互動式 3D 校園，單一 HTML 檔，不需建置。

## 功能
- 3D 建築（依平面圖位置與樓層數建模）
- 建築／教室標籤（點擊可看資訊）
- 樓層切換：全部、B1、1F–4F
- 搜尋建築、教室、設施、出入口

> 教室編號（如「懷恩 301」）目前是依平面圖格局產生的**示意編號**。
> 請在 `index.html` 的 `BUILDINGS` 陣列修改 `rooms`（每層間數），或改寫房間命名規則以對應實際門牌。

## 本機預覽
直接用瀏覽器開啟 `index.html`，或：
```bash
python3 -m http.server 8000
```

## 部署到 GitHub
```bash
git init
git add .
git commit -m "3D 校園導覽初版"
git branch -M main
git remote add origin https://github.com/<你的帳號>/cysh-3d-campus.git
git push -u origin main
```
GitHub Pages：Repo → Settings → Pages → Source 選 `main` / root。

## 部署到 Render
1. 到 render.com → New → **Blueprint**（或 Static Site）
2. 連結上面的 GitHub repo，Render 會讀取 `render.yaml`
3. Static Site 手動設定時：Build Command 留空，Publish Directory 填 `.`
之後每次 `git push`，Render 會自動重新部署。

## 調整位置
座標換算在 `const S=0.33, FH=3.6, CX=720, CY=840;`
每棟建築的 `r:[左,上,右,下]` 是平面圖上的像素範圍，可對照 Google 地圖微調。
