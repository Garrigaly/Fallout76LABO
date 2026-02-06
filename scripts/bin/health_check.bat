@echo off
setlocal
chcp 65001 >nul

echo ==================================================
echo   🚀 Vision Core: システム一括臨床試験 (v1.8.6)
echo ==================================================

:: 1. ディレクトリ構造の確認
echo [1/4] ディレクトリ構造を診察中...
if exist "data" (echo   ok: data) else (echo   NG: dataフォルダがありません)
if exist "script\bin" (echo   ok: bin) else (echo   NG: binフォルダがありません)
if exist "vision_core" (echo   ok: vision_core) else (echo   NG: vision_coreがありません)

:: 2. PowerShell (ソート) のパス解決テスト
echo.
echo [2/4] ソートスクリプト(PS1)のパス解決テスト...
powershell -NoProfile -Command "Write-Host '  相対パス解決完了: ' (Split-Path -Parent '%~dp0')"

:: 3. Python (clip_magic) の起動テスト
echo.
echo [3/4] Pythonエンジンの環境確認...
python -c "import os; print('  Python Path OK: ' + os.getcwd())"

:: 4. Node.js (Vision Core) の疎通確認
echo.
echo [4/4] Vision Core 精鋭JSの配置確認...
if exist "vision_core\ops_focus.js" (echo   ok: ops_focus)
if exist "vision_core\extract_challenge_list.js" (echo   ok: extract_challenge)

echo.
echo ==================================================
echo   📋 診断完了: 全て OK であれば Git Commit へ！
echo ==================================================
pause