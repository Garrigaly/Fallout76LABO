# [2026-02-04] Atomic Shop Weekly Rebranding Edition (v1.9.7)
$ScriptPath = $PSScriptRoot
$RootDir = Split-Path -Parent $ScriptPath
$SourceDir = Join-Path $RootDir "afterburner_png_stills"
$TargetBaseDir = Join-Path $RootDir "Fallout76"

Write-Host "--- 📸 フォルダ統合・リネームプロトコル開始 ---" -ForegroundColor Cyan

if (-not (Test-Path $SourceDir)) {
    Write-Host "⚠️ エラー: $SourceDir が見つかりません。" -ForegroundColor Red
    return
}

# フォルダを優先的に処理
$Items = Get-ChildItem -Path $SourceDir | Sort-Object PSIsContainer -Descending

foreach ($Item in $Items) {
    $DateString = ""
    $TargetName = $Item.Name # デフォルトは元の名前

    # 1. 日付抽出 (YYYY_MM_DD 形式を探す)
    if ($Item.Name -match "(\d{4})_(\d{2})_(\d{2})") {
        $DateString = "$($Matches[1])$($Matches[2])$($Matches[3])"
    } else {
        # 日付が含まれない場合は今日の日付を暫定使用
        $DateString = (Get-Date).ToString("yyyyMMdd")
    }

    # 2. フォルダの場合は名前を強制固定
    if ($Item.PSIsContainer) {
        $TargetName = "Atomic_Shop_Weekly"
    }

    # 3. 移動先パスの構築
    $DestFolderName = "Fallout76_$DateString"
    $DestParentPath = Join-Path $TargetBaseDir $DestFolderName
    
    if (-not (Test-Path $DestParentPath)) {
        New-Item -ItemType Directory -Path $DestParentPath | Out-Null
    }

    # 4. 重複チェックと2桁連番付与ロジック
    $FinalDestPath = Join-Path $DestParentPath $TargetName
    if (Test-Path $FinalDestPath) {
        $Counter = 2
        $Base = [System.IO.Path]::GetFileNameWithoutExtension($TargetName)
        $Ext  = [System.IO.Path]::GetExtension($TargetName)
        
        while (Test-Path $FinalDestPath) {
            $NewName = "${Base}_$( $Counter.ToString('02') )$Ext"
            $FinalDestPath = Join-Path $DestParentPath $NewName
            $Counter++
        }
        $TargetName = $NewName
        Write-Host "🔄 重複回避: [$($Item.Name)] -> [$TargetName] に変更" -ForegroundColor Yellow
    }

    # 5. 移動実行
    try {
        Move-Item -Path $Item.FullName -Destination $FinalDestPath -Force -ErrorAction Stop
        Write-Host "✅ 完了: $($Item.Name) -> $DestFolderName/$TargetName" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 失敗: $($Item.Name) の移動中にエラーが発生しました。" -ForegroundColor Red
    }
}

Write-Host "--- 🏁 フォルダリネーム・ソート完了 ---" -ForegroundColor Cyan