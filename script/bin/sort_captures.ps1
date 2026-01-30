# 博士専用：仕分け・スマートリネーム・素材リスト(CSV)生成スクリプト
$root = "d:/nvidia_captures"
$sources = @("afterburner_png_stills", "afterburner_mkv_clips", "afterburner_mp4_clips")
$prefix_map = @{ "fallout76" = "f76"; "fallout4" = "f04"; "falloutnv" = "fnv" }

# --- フェーズ1：仕分け (node_modules等を厳密に除外) ---
$game_folders = get-childitem $root -directory | where-object { $_.name -notmatch "afterburner|node_modules|script|input|output" }
foreach ($folder in ($sources + $game_folders)) {
    $source_path = if ($folder -is [string]) { join-path $root $folder } else { $folder.fullname }
    if (-not (test-path $source_path)) { continue }
    
    get-childitem $source_path -file | where-object { $_.name -like "*_*_*_*" } | foreach-object {
        $parts = $_.name -split "_"
        if ($parts.count -ge 4) {
            $game = $parts[0].tolower()
            $dest_dir = join-path $root (join-path $game ("$game`_" + $parts[1] + $parts[2] + $parts[3]))
            if (-not (test-path $dest_dir)) { new-item -itemtype directory -path $dest_dir -force | out-null }
            if (-not (test-path (join-path $dest_dir $_.name))) { move-item $_.fullname $dest_dir -force }
        }
    }
}

# --- フェーズ2：リネーム ＆ CSV生成 ---
write-host "Renaming and generating scene notes..." -foregroundcolor yellow
foreach ($g_dir in $game_folders) {
    get-childitem $g_dir.fullname -directory | foreach-object {
        $s_dir = $_
        $prefix = if ($prefix_map.contains($g_dir.name)) { $prefix_map[$g_dir.name] } else { $g_dir.name.substring(0, [math]::min(3, $g_dir.name.length)) }
        $mmdd = if ($s_dir.name -match "(\d{4})$") { $matches[1] } else { "0000" }

        $inner_files = get-childitem $s_dir.fullname -file | where-object { $_.name -notmatch "csv$" } | sort-object lastwritetime
        $digit_format = if ($inner_files.count -ge 100) { "d3" } else { "d2" }

        $count = 1
        $csv_data = @()
        foreach ($f in $inner_files) {
            $new_name = "{0}_{1}_{2:$digit_format}{3}" -f $prefix, $mmdd, $count, $f.extension
            $new_path = join-path $s_dir.fullname $new_name
            if ($f.fullname -ne $new_path -and -not (test-path $new_path)) { rename-item $f.fullname -newname $new_name -force }
            $csv_data += [pscustomobject]@{ "file_name" = $new_name; "note" = "" }
            $count++
        }
        $csv_path = join-path $s_dir.fullname "scene_notes.csv"
        if (-not (test-path $csv_path)) { $csv_data | export-csv -path $csv_path -notypeinformation -encoding utf8 }
    }
}
write-host "Done, Doctor! All systems operational." -foregroundcolor green