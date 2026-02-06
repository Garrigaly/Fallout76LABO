@echo off
setlocal
chcp 65001 >nul

:: [2026-02-03] Relative Path Edition
:: このバッチファイルがあるフォルダ(script\bin)を起点に設定
set "BASE_DIR=%~dp0"
set "ROOT_DIR=%BASE_DIR%..\..\"

set "PY_FILE=%ROOT_DIR%script\clip_magic.py"
set "JS_FILE=%BASE_DIR%jsdata_today_xprint_image.js"
set "DATA_DIR=%ROOT_DIR%data"
set "HIST_DIR=%ROOT_DIR%history"

if not exist "%HIST_DIR%" mkdir "%HIST_DIR%"

echo [System] 魔法のパイソン（clip_magic.py）を起動中...
python "%PY_FILE%"
if %ERRORLEVEL% neq 0 (
    echo [Error] Pythonの実行に失敗しました。
    pause
    exit /b
)

echo [System] 統合エンジン（jsdata_today_xprint_image.js）を起動中...
node "%JS_FILE%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$date = Get-Date -Format 'yyyyMMdd_HHmm'; " ^
    "$src = '%DATA_DIR%\today_daily_post.txt'; " ^
    "$dst = '%HIST_DIR%\post_' + $date + '.txt'; " ^
    "if (Test-Path $src) { " ^
    "  Copy-Item $src $dst; " ^
    "  Write-Host '📜 履歴を保存しました'; " ^
    "  Start-Process notepad.exe $src; " ^
    "} else { " ^
    "  Write-Host '❌ エラー: 投稿案が生成されませんでした。'; " ^
    "}"

echo [System] 全工程完了。
timeout /t 5