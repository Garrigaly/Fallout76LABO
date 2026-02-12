import cv2
import numpy as np
import pytesseract
import csv
from pathlib import Path

# --- Tesseractの場所（インストール先に合わせて修正してください） ---
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# --- パス設定：ROOTを D:\nvidia_captures に固定 ---
BASE_DIR = Path(r"D:\nvidia_captures")
INPUT_DIR = BASE_DIR / "output" / "ops"
OUTPUT_CSV = BASE_DIR / "output" / "daily_ops_raw_data.csv"

def main():
    print("\n" + "="*60)
    print("   Daily Ops OCR：生データ・テーブル化フェーズ")
    print("="*60)

    if not INPUT_DIR.exists():
        print(f"【エラー】画像フォルダが見つかりません: {INPUT_DIR}")
        return

    images = list(INPUT_DIR.glob("R_*.png"))
    print(f"解析対象: {len(images)} 枚 | 生データの抽出を開始します...")

    # Excelでそのまま開けるように utf-8-sig で保存
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        # テーブルのヘッダー（項目名）
        writer.writerow(["ファイル名", "Rawテキスト"])

        for i, p in enumerate(images, 1):
            # 画像読み込み（日本語パス対応）
            img = cv2.imdecode(np.fromfile(str(p), dtype=np.uint8), cv2.IMREAD_COLOR)
            if img is None: continue

            # OCRの精度を安定させるためのグレースケール変換のみ実施
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # OCR実行（日本語 + 英語モードで読み取り）
            # 加工は一切せず、読み取ったままの文字列を取得
            raw_text = pytesseract.image_to_string(gray, lang='jpn+eng')
            
            # 改行だけはCSVのセル内で見やすくするために整理
            clean_raw_text = " ".join(raw_text.split())
            
            writer.writerow([p.name, clean_raw_text])
            
            if i % 20 == 0 or i == len(images):
                print(f"進捗: {i} / {len(images)} 枚完了...")

    print("-" * 60)
    print(f"【デジタル化完了】")
    print(f"生成ファイル: {OUTPUT_CSV.absolute()}")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()