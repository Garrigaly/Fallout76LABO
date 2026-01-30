@echo off
setlocal
chcp 65001 >nul

:: --- 設定エリア ---
set "BIN_DIR=D:\nvidia_captures\script\bin"
set "DATA_DIR=D:\nvidia_captures\data"
set "HIST_DIR=D:\nvidia_captures\history"

:: 1. 履歴用フォルダがない場合は自動で作成する
if not exist "%HIST_DIR%" mkdir "%HIST_DIR%"

echo [System] 魔法のパイソンを呼び出し中...

:: 2. Pythonでクリップボードから直接データを取得
python "%BIN_DIR%\clip_magic.py"
if %ERRORLEVEL% neq 0 (
    echo [Error] クリップボードにデータがないか、Pythonの実行に失敗しました。
    pause
    exit /b
)

:: 3. Node.js で投稿案を生成
echo [System] 投稿案を生成中...
node "%BIN_DIR%\jsdata_today_xprint_image.js"

:: 4. 履歴の保存といきなりデスクトップ表示（PowerShellで実行）
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$date = Get-Date -Format 'yyyyMMdd_HHmm'; " ^
    "$src = Join-Path '%DATA_DIR%' 'today_daily_post.txt'; " ^
    "$dst = Join-Path '%HIST_DIR%' \"post_$date.txt\"; " ^
    "if (Test-Path $src) { " ^
    "  Copy-Item $src $dst; " ^
    "  Write-Host \"📜 履歴を保存しました: post_$date.txt\"; " ^
    "  Start-Process notepad.exe $src; " ^
    "} else { " ^
    "  Write-Host '❌ エラー: 生成されたテキストファイルが見つかりません。'; " ^
    "}"

echo [System] 全工程完了。
timeout /t 5