import os
import shutil
import glob
import json
import datetime
import sys

# ==========================================
# 1. 鑑定・同期モジュール (v1.6.7-CalendarLock)
# ==========================================
def sync_latest_download():
    download_dir = r"D:\ダウンロード\Downloads"
    search_pattern = os.path.join(download_dir, "*_Fallout76_data_*.json")
    target_path = os.path.join("data", "Fallout76_data.json")
    
    os.makedirs("data", exist_ok=True)
    files = glob.glob(search_pattern)

    print("\n" + "▲" * 45)
    print("        Fallout76 鑑定ステータス報告")
    print("▼" * 45)

    if not files:
        print("\n" + "!" * 45)
        print("🔴 データがありません。")
        print("   データを入れて処理をやり直してください。")
        print("!" * 45 + "\n")
        input("Enterキーを押すと終了します...")
        sys.exit() 

    # --- ファイル名（日付文字列）で最新を判定 ---
    latest_file = max(files)
    file_basename = os.path.basename(latest_file)
    
    # システム日付とファイル名の日付を照合
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")
    is_date_match = today_str in file_basename

    mtime = datetime.datetime.fromtimestamp(os.path.getmtime(latest_file)).strftime('%Y-%m-%d %H:%M:%S')
    
    if is_date_match:
        print(f"【判定】🟢 良好: 本日の原本を捕捉しました。")
    else:
        print(f"【判定】🟡 注意: 暦のズレを検知しました（本日は {today_str} です）。")
        print(f"        原本は【過去】のデータの可能性があります。")

    print(f"  原本名: {file_basename}")
    print(f"  作成時: {mtime}")
    print("-" * 45)
    
    ans = input(f"❓ この内容で原子分解を実行しますか？ (y/n): ").lower()
    if ans != 'y':
        print("\n🛑 博士の指示により中止しました。")
        input("Enterキーで終了...")
        sys.exit()

    shutil.copy2(latest_file, target_path)
    print(f"\n🚚 同期完了: {target_path} を更新しました。")

# --- (以下、decompose_json および 実行スイッチは v1.6.6 と同様) ---
def decompose_json():
    input_file = os.path.join("data", "Fallout76_data.json")
    if not os.path.exists(input_file):
        return
    with open(input_file, 'r', encoding='utf-8') as f:
        full_data = json.load(f)
    sub_files = {
        "jsondata_today_basic.json": full_data.get("jsondata_today_basic.json"),
        "jsondata_today_ops.json": full_data.get("jsondata_today_ops.json"),
        "jsondata_today_atomicshop.json": full_data.get("jsondata_today_atomicshop.json"),
        "jsondata_today_dailychallenge.json": full_data.get("jsondata_today_dailychallenge.json")
    }
    for filename, content in sub_files.items():
        if content:
            output_path = os.path.join("data", filename)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(content, f, indent=4, ensure_ascii=False)
            print(f"✅ 分解成功: {filename}")

if __name__ == "__main__":
    sync_latest_download()
    decompose_json()
    print("\n--- 全工程完了。Ready for research. ---")
    input("Enterキーで画面を閉じます...")