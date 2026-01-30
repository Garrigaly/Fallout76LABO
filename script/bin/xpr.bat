@echo off
:: 1. スクリプトがあるディレクトリに移動（これならどこから実行しても安心です）
cd /d %~dp0

:: 2. NVIDIA Script フォルダへ移動
cd "NVIDIA Script"

:: 3. 処理を実行
node jsdata_today_xprint_image.js

:: 4. 完了後に少し待機（ログをゆっくり確認したい場合。不要なら削除してください）
pause