import json
import os

# --- 設定エリア ---
# clip_magic.pyの場所（script/）から見た、dataフォルダの場所を自動計算
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
# ダウンロードした統合ファイルのパス
INPUT_FILE = os.path.join(DATA_DIR, 'Fallout76_data.json')

def magic_process_from_file():
    # 1. 統合ファイルが存在するか確認
    if not os.path.exists(INPUT_FILE):
        print(f"警告: {INPUT_FILE} が見つかりません。")
        return False

    try:
        # 2. 統合JSONを読み込む
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            full_data = json.load(f)
        
        # 3. 各セクションを個別のファイルに分解して保存
        # （これにより、既存のJSやBATファイルとの連携を維持します）
        for filename, body in full_data.items():
            save_path = os.path.join(DATA_DIR, filename)
            with open(save_path, 'w', encoding='utf-8') as f:
                json.dump(body, f, ensure_ascii=False, indent=2)
            print(f"成功: {filename} を展開しました。")
        
        return True
    except Exception as e:
        print(f"エラー発生: {e}")
        return False

if __name__ == "__main__":
    print("--- Fallout76 ラボ自動連携魔法 起動 ---")
    if magic_process_from_file():
        print("完了！全てのデータが正常に配置されました。")
    else:
        print("失敗！上記のエラーを確認してください。")