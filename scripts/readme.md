# 🛠 Fallout 76 運用支援システム：Vision Core 統合環境

## 📌 現在の環境ステータス
- **指令書バージョン**: v1.8.5 (Golden Ratio) 準拠
- **ディレクトリ形式**: 相対パス完全移行済み
- **コアエンジン**: `vision_core/` (旧テストブランチから昇格)

---

## 🧪 原子分解プロトコル (Gemini AI Studio 用)

スクリーンショットを解析し、`Fallout76_data.json` の基礎データを生成する際のプロンプトです。

### 【入力プロンプト】
> 添付した画像から情報を抽出してください。
> 出力形式は以下のJSON構造を厳守すること。
> 
> ```json
> {
>   "date": "YYYY-MM-DD",
>   "current_event": "イベント名 or null",
>   "event_status": "残り日数 or 終了",
>   "minerva": "場所 or 不在",
>   "daily_ops": {
>     "location": "場所",
>     "faction": "派閥",
>     "mutations": ["変異1", "変異2"]
>   },
>   "atomic_shop": [
>     {"name": "アイテム名", "price": "Atom or Free", "status": "Sale/1st/New/None"}
>   ]
> }
> ```
> ※用語は博士流エイリアス（ウエ研、スパミュ等）を適用せず、一旦ゲーム内正式名称で抽出すること。

---

## ⚙️ 運用フロー

### 1. スクリーンショットの整理
`script/sort_captures.ps1` を実行し、撮影した画像を `processed/` フォルダへ日付別に仕分けます。

### 2. データ更新 (原子分解)
抽出したデータを `data/Fallout76_data.json` に上書き保存します。
※相対パス化により、どのドライブからでも `data/` フォルダが自動参照されます。

### 3. 出力エンジンの起動
`up.bat`（ルート直下）を実行してください。以下の工程が自動走査されます。
1. `clip_magic.py` によるデータ整合性チェック
2. `jsdata_today_xprint_image.js` による黄金比率ポスト案生成
3. `history/` へのログ保存およびメモ帳での確認

---

## 📂 主要ディレクトリ構成 (相対パス基準)
- `/data`: JSONデータ、指令書、生成テキストの格納場所
- `/script`: Python/PowerShell/JSエンジンの本拠地
- `/script/bin`: 日常運用スクリプトの実行バイナリ
- `/vision_core`: 画像解析・OCRの精密診断モジュール（旧テスト）
- `/manual`: 運用ルール・トラブルシューティング

---
**Last Updated**: 2026-02-03 (Relative Path Edition)