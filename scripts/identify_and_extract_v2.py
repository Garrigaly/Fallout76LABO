import cv2
import numpy as np
import shutil
from pathlib import Path

# --- 【設定】2025年 1413問題・完全克服仕様 ---
BASE_DIR = Path(__file__).resolve().parent
INPUT_ROOT = Path(r"D:\nvidia_captures\2025bigdata") 
EXTRACT_DIR = BASE_DIR.parent / "daily_ops_extracted"
OUTPUT_DIR = BASE_DIR.parent / "output" / "ops"
TEMP_DIR = BASE_DIR.parent / "template"

THRESHOLD = 0.70  # 1413対策で少し余裕を持たせます

# 博士の「WQHD黄金座標」
CONFIG_R = {'left': 525, 'top': 505, 'width': 705, 'height': 430}

def standardize_image(img):
    """どんな解像度でも 2560x1440 に正規化する"""
    h, w = img.shape[:2]
    # WQHD(2560x1440)の黒いキャンバスを作成
    canvas = np.zeros((1440, 2560, 3), dtype=np.uint8)
    
    # 4Kなら縮小、それ以外は中央に配置（あるいはリサイズ）
    if w == 3840:
        img = cv2.resize(img, (2560, 1440), interpolation=cv2.INTER_LANCZOS4)
    elif w == 2560:
        # 1413などの縦不足はそのまま中央付近に貼り付けて、アスペクト比を維持
        h_offset = (1440 - h) // 2
        canvas[h_offset:h_offset+h, 0:w] = img
        return canvas
    else:
        # それ以外は強制リサイズ
        img = cv2.resize(img, (2560, 1440), interpolation=cv2.INTER_LANCZOS4)
    
    return img

def main():
    print("\n" + "="*60)
    print("   究極の警察犬 v2.0：一本化・1413問題対策モード")
    print("="*60)

    # テンプレート準備
    temp_l = cv2.imread(str(TEMP_DIR / "template_L.png"))
    temp_r = cv2.imread(str(TEMP_DIR / "template_R.png"))
    if temp_l is None: return print("【エラー】テンプレート未検出")

    # フォルダ作成
    for d in [EXTRACT_DIR, OUTPUT_DIR]: d.mkdir(parents=True, exist_ok=True)

    image_paths = [p for p in INPUT_ROOT.rglob('*') if p.suffix.lower() in {".png", ".jpg"}]
    total = len(image_paths)
    match, fail, processed = 0, 0, 0

    print(f"総ターゲット数: {total} 枚 | 精査・抽出を同時に開始します...")

    for p in image_paths:
        processed += 1
        if processed % 50 == 0: print(f"進捗: {processed} / {total} 枚目...")

        img_orig = cv2.imdecode(np.fromfile(str(p), dtype=np.uint8), cv2.IMREAD_COLOR)
        if img_orig is None: continue

        # --- 標準化プロトコル ---
        img_std = standardize_image(img_orig)
        
        # 判定用（1080p）にリサイズ
        img_check = cv2.resize(img_std, (1920, 1080))
        roi_l = (int(670*0.75), int(48*0.75), int(242*0.75), int(470*0.75))
        
        # 判定
        score = get_score(img_check, cv2.resize(temp_l, None, fx=0.75, fy=0.75), roi_l)

        if score >= THRESHOLD:
            match += 1
            # 【直接抽出】合格した瞬間に Rパネルを切り出す
            r = CONFIG_R
            panel_r = img_std[r['top'] : r['top']+r['height'], r['left'] : r['left']+r['width']]
            cv2.imwrite(str(OUTPUT_DIR / f"R_{p.stem}.png"), panel_r)
        else:
            fail += 1

    print("-" * 60)
    print(f"【作戦完了】 合格: {match} / 落選: {fail}")
    print(f"成果物は {OUTPUT_DIR} に集結しました。")
    print("="*60 + "\n")

def get_score(img, temp, roi):
    t, l, h, w = roi
    crop = img[t:t+h, l:l+w]
    if np.std(crop) < 5: return 0
    res = cv2.matchTemplate(crop, temp, cv2.TM_CCOEFF_NORMED)
    return cv2.minMaxLoc(res)[1]

if __name__ == "__main__":
    main()