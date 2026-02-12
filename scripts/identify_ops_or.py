import cv2
import numpy as np
import os
import shutil
import glob

# --- 設定項目 ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(BASE_DIR, "..", "input")
TEMPLATE_DIR = os.path.join(BASE_DIR, "..", "template")
OUTPUT_DIR = os.path.join(BASE_DIR, "..", "daily_ops_extracted")

# 黄金の座標（WQHD: 2560x1440 基準の資産）
ROI_L_WQHD = (670, 48, 242, 470)  # (top, left, height, width)
ROI_R_WQHD = (50, 525, 1150, 705) # (top, left, height, width)

# 識別しきい値（縮小による誤差を考慮し 0.70 から開始を推奨）
THRESHOLD = 0.70 

def scale_roi(roi, scale):
    """WQHDの座標を現在の解像度スケールに合わせて計算"""
    return tuple(int(val * scale) for val in roi)

def get_score(img, template, roi):
    """指定領域の類似度スコアを算出"""
    top, left, h, w = roi
    # 境界チェック
    if img.shape[0] < top + h or img.shape[1] < left + w:
        return 0.0
    crop = img[top:top+h, left:left+w]
    
    # テンプレートとクロップのサイズを完全に一致させる（念のため）
    if crop.shape[:2] != template.shape[:2]:
        template = cv2.resize(template, (w, h))

    res = cv2.matchTemplate(crop, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, _ = cv2.minMaxLoc(res)
    return max_val

def main():
    print("\n" + "="*55)
    print("   アイデンティフライ・マスター・エンジン（HD標準化プロトコル）")
    print("="*55)

    # 1. テンプレート（WQHD用）を読み込み、HD(0.75倍)に標準化
    temp_l_raw = cv2.imread(os.path.join(TEMPLATE_DIR, "template_L.png"))
    temp_r_raw = cv2.imread(os.path.join(TEMPLATE_DIR, "template_R.png"))

    if temp_l_raw is None or temp_r_raw is None:
        print("【エラー】テンプレート画像が template フォルダ内に見当たりません。")
        return

    # 標準化用テンプレート（1080p基準）の作成
    temp_l_hd = cv2.resize(temp_l_raw, None, fx=0.75, fy=0.75)
    temp_r_hd = cv2.resize(temp_r_raw, None, fx=0.75, fy=0.75)
    # HD基準の座標計算
    roi_l_hd = scale_roi(ROI_L_WQHD, 0.75)
    roi_r_hd = scale_roi(ROI_R_WQHD, 0.75)

    # 2. 獲物のリストアップ
    images = []
    for ext in ("*.png", "*.jpg", "*.jpeg"):
        images.extend(glob.glob(os.path.join(INPUT_DIR, ext)))
    
    print(f"索敵範囲: {os.path.abspath(INPUT_DIR)}")
    print(f"発見枚数: {len(images)} 枚")
    if not os.path.exists(OUTPUT_DIR): os.makedirs(OUTPUT_DIR)
    print("-" * 55)

    # 3. 識別・仕分け（HDの土俵で判定）
    match_count = 0
    for img_path in images:
        img_orig = cv2.imread(img_path)
        if img_orig is None: continue

        h_orig, w_orig = img_orig.shape[:2]
        
        # 判定用の一時画像を作成（1080pに統一）
        if w_orig == 2560:
            # WQHDなら縮小
            img_proc = cv2.resize(img_orig, (1920, 1080))
            mode_label = "[WQHD->HD縮小判定]"
        elif w_orig == 1920:
            # HDならそのまま
            img_proc = img_orig
            mode_label = "[HD等倍判定]     "
        else:
            # それ以外（未知の解像度）は 1080p に強制リサイズ
            img_proc = cv2.resize(img_orig, (1920, 1080))
            mode_label = "[他解像度補正判定]"

        # 照合
        score_l = get_score(img_proc, temp_l_hd, roi_l_hd)
        score_r = get_score(img_proc, temp_r_hd, roi_r_hd)

        is_match = score_l >= THRESHOLD or score_r >= THRESHOLD
        
        res_status = "【抽出】" if is_match else "【スルー】"
        print(f"{res_status} {mode_label} {os.path.basename(img_path)} (L:{score_l:.2f}, R:{score_r:.2f})")

        if is_match:
            match_count += 1
            # 保存は「加工前」のオリジナルをコピー
            shutil.copy(img_path, os.path.join(OUTPUT_DIR, os.path.basename(img_path)))

    print("-" * 55)
    print(f"作戦完了。 {match_count} 枚のオリジナルデータを確保しました。")
    print("="*55 + "\n")

if __name__ == "__main__":
    main()