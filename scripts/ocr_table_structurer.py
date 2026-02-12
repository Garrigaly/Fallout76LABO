import pandas as pd
import re
from pathlib import Path

# --- パス設定 ---
BASE_DIR = Path(r"D:\nvidia_captures")
INPUT_CSV = BASE_DIR / "output" / "daily_ops_raw_data.csv"
OUTPUT_CSV = BASE_DIR / "output" / "daily_ops_structured.csv"

# 敵派閥のリスト（生データに含まれる可能性のあるキーワード）
ENEMIES = ["スーパーミュータント", "ロボット", "ブラッドイーグル", "モールマイナー", "スコーチ", "エイリアン", "モスマン教信者"]

def clean_ocr_noise(text):
    """
    OCR特有の記号ノイズや誤読フラグメントを正規化する
    """
    if not isinstance(text, str):
        return ""
    
    # 1. 枠線や影による記号ノイズの除去 (| ! _ . , ' 等)
    text = re.sub(r'[|!_.,\'\"「」]', '', text)
    
    # 2. 特定の誤読パターンの除去 (例: 「ロケーション」付近のゴミ)
    text = re.sub(r'ョレレョンーレス', '', text)
    
    # 3. 連続する空白を1つにまとめる
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_details(row):
    filename = str(row['ファイル名'])
    raw_text = str(row['Rawテキスト'])

    # ノイズクリーニングを実行
    text = clean_ocr_noise(raw_text)

    # 1. 日付の抽出 (YYYY_MM_DD または YYYYMMDD)
    date_match = re.search(r'(\d{4}[_.-]?\d{2}[_.-]?\d{2})', filename)
    date_str = date_match.group(1).replace('-', '_').replace('.', '_') if date_match else "不明"

    # 2. ロケーションと敵の分離
    found_loc = "未検知"
    found_enemy = "未検知"
    
    # 敵の名前をフックにして分割
    for enemy in ENEMIES:
        if enemy in text:
            found_enemy = enemy
            # 「XXH」（リセット時間）や「ロケーション」をキーワードに場所を推定
            # クリーニング済みなので「ロケーション」などの文字を狙いやすい
            loc_part = re.split(r'\d{1,2}H|ロケーション', text)
            if len(loc_part) > 1:
                # 敵の名前の直前までを取得
                loc_candidate = loc_part[-1].split(enemy)[0].strip()
                if loc_candidate:
                    found_loc = loc_candidate
            break

    return pd.Series([date_str, found_loc, found_enemy])

def main():
    print("\n" + "="*60)
    print("   Daily Ops 構造化フェーズ：ノイズ除去＆情報選別")
    print("="*60)

    if not INPUT_CSV.exists():
        print(f"エラー: {INPUT_CSV} が見つかりません。")
        return

    df = pd.read_csv(INPUT_CSV)
    
    # 構造化実行（変異は後のフェーズで処理するため、現在は日付・場所・敵のみ）
    df[['日付', 'ロケーション', '敵']] = df.apply(extract_details, axis=1)

    # 結果を保存
    df.to_csv(OUTPUT_CSV, index=False, encoding='utf-8-sig')
    
    print(f"構造化完了: {OUTPUT_CSV}")
    print(f"処理件数: {len(df)} 件")
    print("-" * 60)

if __name__ == "__main__":
    main()