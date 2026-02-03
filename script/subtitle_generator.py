import os

# [2026-02-03] Relative Path Edition
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "data")

SOURCE_TEXT = os.path.join(DATA_DIR, "today_daily_post.txt")
OUTPUT_SRT = os.path.join(DATA_DIR, "today_daily_post.srt")

print(f"[System] 字幕生成ターゲット: {SOURCE_TEXT}")
# 以下、字幕生成ロジック...