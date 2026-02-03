# 📝 チャレンジ抽出モジュール (Vision Core)

## 📌 概要
デイリーチャレンジのリスト部分を、OCRに適したサイズで正確に切り抜くためのツールです。

## ⚙️ 座標設定
- **設計日**: 2026-01-27
- **座標 (CHALLENGE_AREA)**: { left: 194, top: 405, width: 440, height: 575 }

## 🚀 使用方法
1. `input/` フォルダにチャレンジ画面のスクリーンショットを入れます。
2. `node vision_core/extract_challenge_list.js` を実行します。
3. `output/` に切り抜かれた画像が生成されます。