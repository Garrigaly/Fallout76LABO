import pandas as pd
import re
from pathlib import Path

# --- パス設定 ---
BASE_DIR = Path(r"D:\nvidia_captures")
INPUT_CSV = BASE_DIR / "output" / "daily_ops_raw_data.csv"
OUTPUT_CSV = BASE_DIR / "output" / "daily_ops_structured.csv"

# --- 判定用キーワードリスト ---
ENEMIES = ["スーパーミュータント", "ロボット", "ブラッドイーグル", "モールマイナー", "スコーチ", "エイリアン", "モスマン教信者", "カルト教信者", "共産党員"]
LOCATIONS = ["Vault 94", "Vault 96", "ワトガ", "研究センター", "燃え盛る鉱山", "グラスド洞窟", "アンキャニー洞窟", "バレー・ガレリア", "アルクトス・ファーマ", "アリーナ"]
MUTATIONS = ["鋭い視線", "サヴェージ・ストライク", "スティングフロスト", "不安定", "グループ再生", "氷の手", "弾力性", "クローク", "冷酷無比", "毒霧", "爆発", "スウィフト・ストーカー", "プリスタリングコールド"]

def clean_ocr_noise(text):
    if not isinstance(text, str): return ""
    # 記号ノイズの除去
    text = re.sub(r'[|!_.,\'\"「」]', '', text)
    text = re.sub(r'ョレレョンーレス', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_details(row):
    filename = str(row['ファイル名'])
    raw_text = str(row['Rawテキスト'])
    text = clean_ocr_noise(raw_text)

    # 1. 日付
    date_match = re.search(r'(\d{4}[_.-]?\d{2}[_.-]?\d{2})', filename)
    date_str = date_match.group(1).replace('-', '_').replace('.', '_') if date_match else "不明"

    # 2. 敵 (誤読ケア付き)
    found_enemy = "未検知"
    for e in ENEMIES:
        if e in text:
            found_enemy = e
            break
    if found_enemy == "未検知":
        # 「プラッドイーグル」等の誤読を正規表現で救済
        if re.search(r'[プラ][ッラ]ッドイーグル', text):
            found_enemy = "ブラッドイーグル"

    # 3. ロケーション (キーワード照合)
    found_loc = "未検知"
    for l in LOCATIONS:
        if l in text:
            found_loc = l
            break

    # 4. 変異 (全抽出：ダブル変異対応)
    found_muts = [m for m in MUTATIONS if m in text]
    mutation_str = ", ".join(found_muts) if found_muts else "未検知"

    return pd.Series([date_str, found_loc, found_enemy, mutation_str])

def main():
    print("\n" + "="*60)
    print("   Daily Ops 精密構造化フェーズ：変異抽出＆誤読救済")
    print("="*60)

    if not INPUT_CSV.exists():
        print(f"エラー: {INPUT_CSV} が見つかりません。")
        return

    df = pd.read_csv(INPUT_CSV)
    
    # 新しいカラム構成で抽出
    df[['日付', 'ロケーション', '敵', '変異']] = df.apply(extract_details, axis=1)

    # 保存
    df.to_csv(OUTPUT_CSV, index=False, encoding='utf-8-sig')
    
    print(f"構造化完了: {OUTPUT_CSV}")
    print(f"総件数: {len(df)} 件")
    print(f"敵検知成功: {len(df[df['敵'] != '未検知'])} 件")
    print(f"変異検知成功: {len(df[df['変異'] != '未検知'])} 件")
    print("-" * 60)

if __name__ == "__main__":
    main()