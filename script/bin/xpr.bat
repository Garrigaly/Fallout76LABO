@echo off
setlocal
chcp 65001 >nul

:: [2026-02-03] Relative Path Edition
:: このバッチファイルがある場所(script/bin)を起点に設定
set "BASE_DIR=%~dp0"

echo [System] 黄金比率出力エンジン(xprint_image)を単独起動中...

:: 相対パスでJSを実行
node "%BASE_DIR%jsondata_today_xprint_image.js"

if %ERRORLEVEL% neq 0 (
    echo [Error] 実行中にエラーが発生しました。
    pause
) else (
    echo [Success] 処理が完了しました。
)

timeout /t 3