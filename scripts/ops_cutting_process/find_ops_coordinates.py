import cv2
import numpy as np
import os

def find_coordinates(base_image_path, template_path, label):
    # 画像の読み込み
    base_img = cv2.imread(base_image_path)
    template = cv2.imread(template_path)
    
    if base_img is None or template is None:
        print(f"❌ ファイルが見つかりません: {label}")
        return None

    # テンプレートマッチング実行
    result = cv2.matchTemplate(base_img, template, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

    # 確信度（精度）のチェック
    threshold = 0.8
    if max_val >= threshold:
        h, w = template.shape[:2]
        print(f"✅ {label} を発見！ (精度: {max_val:.2f})")
        print(f"   座標: {{ left: {max_loc[0]}, top: {max_loc[1]}, width: {w}, height: {h} }}")
        return {"left": max_loc[0], "top": max_loc[1], "width": w, "height": h}
    else:
        print(f"❌ {label} が見つかりませんでした (最高精度: {max_val:.2f})")
        return None

# メイン処理
base = "input/Fallout76_2026_02_07_07_27_27_753.jpg" # 元の巨大画像
temp_l = "output/ops/L_Fallout76_2026_02_07_07_27_27_753.jpg" # 先ほどの左
temp_r = "output/ops/R_Fallout76_2026_02_07_07_27_27_753.png" # 先ほどの右

print("--- 座標割り出しシーケンス開始 ---")
find_coordinates(base, temp_l, "左パーツ (L)")
find_coordinates(base, temp_r, "右パーツ (R)")