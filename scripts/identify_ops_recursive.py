import cv2
import numpy as np
import os
import shutil
from pathlib import Path

# --- 【設定】2025年大容量データ・高精度モード ---
BASE_DIR = Path(__file__).resolve().parent
# 2000枚超えの2025年フォルダをルートに設定
INPUT_ROOT = Path(r"D:\nvidia_captures\2025bigdata") 
# 出力先：D:\nvidia_captures\daily_ops_extracted
OUTPUT_DIR = BASE_DIR.parent / "daily_ops_extracted"

# 識別しきい値：0.75（歴史的データの救還用）
THRESHOLD = 0.75

def main():
    print("\n" + "="*60)
    print("   アイデンティフライ・エンジン：2025大容量・4K対応モード")
    print("="*60)
    print(f"索敵地点: {INPUT_ROOT.absolute()}")

    # テンプレート読み込み
    temp_dir = BASE_DIR.parent / "template"
    temp_l_raw = cv2.imread(str(temp_dir / "template_L.png"))
    temp_r_raw = cv2.imread(str(temp_dir / "template_R.png"))

    if temp_l_raw is None or temp_r_raw is None:
        print("【エラー】テンプレートが見つかりません。")
        return

    # 判定用にテンプレートを高品質リサイズ (Lanczos4)
    temp_l_hd = cv2.resize(temp_l_raw, None, fx=0.75, fy=0.75, interpolation=cv2.INTER_LANCZOS4)
    temp_r_hd = cv2.resize(temp_r_raw, None, fx=0.75, fy=0.75, interpolation=cv2.INTER_LANCZOS4)

    if not OUTPUT_DIR.exists(): OUTPUT_DIR.mkdir(parents=True)

    # 全階層（サブフォルダ込）を再帰的に検索
    image_paths = [p for p in INPUT_ROOT.rglob('*') if p.suffix.lower() in {".png", ".jpg", ".jpeg"}]
    
    total_files = len(image_paths)
    match_count, fail_count, skip_count, processed_count = 0, 0, 0, 0
    standardized_4k = 0

    print(f"発見した総ターゲット数: {total_files} 枚")
    print("精査を開始します... (100枚ごとに進捗を表示)")
    print("-" * 60)

    for p in image_paths:
        processed_count += 1
        if processed_count % 100 == 0:
            print(f"現在 {processed_count} / {total_files} 枚目を通過中...")

        # 日本語パス対応読み込み
        img_orig = cv2.imdecode(np.fromfile(str(p), dtype=np.uint8), cv2.IMREAD_COLOR)
        if img_orig is None or img_orig.shape[1] < 1280:
            skip_count += 1
            continue

        # [4K対応] どんな解像度でも高品質に縮小して判定の物差しを統一
        if img_orig.shape[1] == 3840: standardized_4k += 1
        img_proc = cv2.resize(img_orig, (1920, 1080), interpolation=cv2.INTER_LANCZOS4)

        # 博士の黄金座標（1080p換算）
        roi_l = (int(670*0.75), int(48*0.75), int(242*0.75), int(470*0.75))
        roi_r = (int(50*0.75), int(525*0.75), int(1150*0.75), int(705*0.75))

        if get_score(img_proc, temp_l_hd, roi_l) >= THRESHOLD or \
           get_score(img_proc, temp_r_hd, roi_r) >= THRESHOLD:
            match_count += 1
            shutil.copy2(str(p), str(OUTPUT_DIR / p.name))
        else:
            fail_count += 1

    print("-" * 60)
    print(f"【2025サルベージ完了報告】")
    print(f"  ■ 総スキャン数   : {total_files} 枚")
    print(f"  ■ 合格（抽出）   : {match_count} 枚")
    print(f"  ■ 不合格（落選） : {fail_count} 枚")
    print(f"  ■ 4K画像補正     : {standardized_4k} 枚")
    print(f"  ■ スキップ       : {skip_count} 枚")
    print("="*60 + "\n")

def get_score(img, template, roi):
    top, left, h, w = roi
    crop = img[top:top+h, left:left+w]
    if np.std(crop) < 5.0: return 0.0
    res = cv2.matchTemplate(crop, template, cv2.TM_CCOEFF_NORMED)
    return cv2.minMaxLoc(res)[1]

if __name__ == "__main__":
    main()