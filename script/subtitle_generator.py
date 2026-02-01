import datetime

# 博士流エイリアス辞書
ALIAS_DICT = {
    "ウエストテック研究センター": "ウエ研",
    "スーパーミュータント": "スパミュ",
    "鋭い視線": "Per増加",
    "不安定": "爆発",
    "サヴェージ・ストライク": "アーマー貫通",
    "グループ再生": "回復"
}

def apply_aliases(text):
    """テキスト内の単語を博士流エイリアスに置換する"""
    for formal, alias in ALIAS_DICT.items():
        text = text.replace(formal, alias)
    return text

def format_srt_time(seconds):
    """秒数をSRT形式のタイムスタンプ(00:00:00,000)に変換"""
    td = datetime.timedelta(seconds=seconds)
    total_seconds = int(td.total_seconds())
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds_part = divmod(remainder, 60)
    milliseconds = int(td.microseconds / 1000)
    return f"{hours:02}:{minutes:02}:{seconds_part:02},{milliseconds:03}"

def generate_srt(segments, output_path):
    """セグメントデータからSRTファイルを生成"""
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, seg in enumerate(segments, 1):
            start = format_srt_time(seg['start'])
            end = format_srt_time(seg['end'])
            text = apply_aliases(seg['text'])
            f.write(f"{i}\n{start} --> {end}\n{text}\n\n")
    print(f"字幕ファイルを生成しました: {output_path}")

# --- 実行セクション ---
# 動画「今日のアパラチア2026.01.30.mp4」に合わせたタイミング設定
video_segments = [
    {"start": 0, "end": 9, "text": "今日のおはようアパラチア 2026.01.30"},
    {"start": 10, "end": 16, "text": "2026年1月30日(金) 晴れ。本日のアパラチア"},
    {"start": 31, "end": 36, "text": "オプス：Vault 96 (モールマイナー)\n変異：スウィフト・ストーカー / 鋭い視線"} # ここがPer増加に変換される
]

# 博士の作業環境に合わせた絶対パスで出力
output_file = r"D:\nvidia_captures\subtitle_20260130.srt"
generate_srt(video_segments, output_file)