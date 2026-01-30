# lab_note: capture_environment_setup
このファイルは、博士のキャプチャ環境および設計思想を記録したマスターデータである。

## 1. directory_structure
すべてのフォルダ名は lowercase（小文字）で統一。

- `d:/nvidia_captures/` : 親フォルダ
- `d:/nvidia_captures/afterburner_png_stills` : png静止画保存用
- `d:/nvidia_captures/afterburner_mkv_clips` : mkv動画保存用（本ファイル配置場所）
- `d:/nvidia_captures/afterburner_mp4_clips` : mp4動画保存用（編集メイン）

## 2. screen_capture_settings (msi afterburner)
- **hotkey**: f4
- **format**: png / 100% quality
- **path**: d:/nvidia_captures/afterburner_png_stills

## 3. video_capture_settings (msi afterburner)
- **hotkey**: none (割り当てなし)
  - **reason**: mkv形式の性質（記録の堅牢性）を活かし、システム側や手動での確実な運用を優先するため。誤操作による録画トラブルを防止する。
- **container**: matroska mkv
- **video_format**: mjpg compression
- **resolution**: 1080p (16:9) / 60 fps
- **path**: d:/nvidia_captures/afterburner_mkv_clips

## 4. file_naming_convention
自動仕分けスクリプトで使用する標準フォーマット。

- **static_images**: `game_date_snap_number.png`
- **video_clips**: `game_date_clip_number.ext`