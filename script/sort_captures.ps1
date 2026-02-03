# [2026-02-03] Relative Path Edition
# スクリプトがある場所(script/)を起点にルートを設定
$ScriptPath = $PSScriptRoot
$RootDir = Split-Path -Parent $ScriptPath

# 各ディレクトリの設定を相対パスに変更
$SourceDir = "$RootDir"
$TargetBaseDir = "$RootDir\processed"

# ログ出力用
Write-Host "--- 📸 スクリーンショット整理シーケンス開始 ---" -ForegroundColor Cyan
Write-Host "ソース: $SourceDir"
Write-Host "移動先: $TargetBaseDir"

# ソースディレクトリ内のPNGファイルをスキャン
$Files = Get-ChildItem -Path $SourceDir -Filter "*.png"

foreach ($File in $Files) {
    # ファイル名から日付(YYYY_MM_DD)を抽出
    if ($File.Name -match "Fallout76_(\d{4}_\d{2}_\d{2})") {
        $DateString = $Matches[1].Replace("_", "")
        
        # 移動先フォルダ名の決定（例：processed_760126）
        $DestFolderName = "processed_76$($DateString.Substring(2))"
        $DestPath = Join-Path $TargetBaseDir $DestFolderName
        
        # フォルダが存在しなければ作成
        if (-not (Test-Path $DestPath)) {
            New-Item -ItemType Directory -Path $DestPath | Out-Null
            Write-Host "📁 新規フォルダ作成: $DestFolderName" -ForegroundColor Yellow
        }
        
        # ファイルの移動
        Move-Item -Path $File.FullName -Destination $DestPath -Force
        Write-Host "✅ 移動完了: $($File.Name) -> $DestFolderName"
    }
}

Write-Host "--- 整理完了 ---" -ForegroundColor Cyan