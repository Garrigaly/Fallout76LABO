import os
import json

# [2026-02-03] Relative Path Edition
# このファイル(script/)から見た相対パスを設定
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "data")

# 修正後のパス定義
INPUT_FILE = os.path.join(DATA_DIR, "Fallout76_data.json")
# 必要に応じて、TESSERACTの学習データ(traineddata)のパスもここを起点に設定可能です

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"[Error] ファイルが見つかりません: {INPUT_FILE}")
        return
    
    # 既存のロジック（原子分解処理）をここに継続
    print(f"[System] {INPUT_FILE} を読み込み中...")

if __name__ == "__main__":
    main()