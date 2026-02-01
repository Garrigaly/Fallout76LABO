@echo off
setlocal
chcp 65001 >nul

set "PY_FILE=D:\nvidia_captures\script\clip_magic.py"
set "JS_FILE=D:\nvidia_captures\script\bin\jsdata_today_xprint_image.js"
set "DATA_DIR=D:\nvidia_captures\data"
set "HIST_DIR=D:\nvidia_captures\history"

if not exist "%HIST_DIR%" mkdir "%HIST_DIR%"

echo [System] 魔法のパイソン（clip_magic.py）を起動中...
python "%PY_FILE%"
if %ERRORLEVEL% neq 0 (
    echo [Error] Pythonの実行に失敗しました。
    pause
    exit /b
)

echo [System] 統合エンジン（xprint_image.js）を起動中...
node "%JS_FILE%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$date = Get-Date -Format 'yyyyMMdd_HHmm'; " ^
    "$src = 'D:\nvidia_captures\data\today_daily_post.txt'; " ^
    "$dst = 'D:\nvidia_captures\history\post_' + $date + '.txt'; " ^
    "if (Test-Path $src) { " ^
    "  Copy-Item $src $dst; " ^
    "  Write-Host '📜 履歴を保存しました'; " ^
    "  Start-Process notepad.exe $src; " ^
    "} else { " ^
    "  Write-Host '❌ エラー: 投稿案が生成されませんでした。'; " ^
    "}"

echo [System] 全工程完了。
timeout /t 5