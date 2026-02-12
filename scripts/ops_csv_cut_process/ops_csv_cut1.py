"""
1枚2秒の10分の動画から抜き出したCSVファイルを、頭のタイムスタンプ、推奨レベル、リセットまでの時間の項目を削除するプログラム
インプットファイルはこのプログラムと同じフォルダ内に入れること。
アウトプットファイルはops_西暦月日_countになっている。
インプットのファイルは、一つのファイルが一件とカウントされ、理論上では何件の同じ形式のファイルを入れても処理するようになっている。
"""
import pandas as pd
import os
from datetime import datetime

def process_csv():
    # 削除対象の列
    target_columns = ['タイムスタンプ', '推奨レベル', 'リセットまでの時間']
    
    # 現在のディレクトリ内のファイルをスキャン
    current_dir = os.path.dirname(os.path.abspath(__file__))
    files = [f for f in os.listdir(current_dir) if f.endswith('.csv')]
    
    # 今日の日付を取得
    today_str = datetime.now().strftime('%Y%m%d')
    
    processed_count = 0
    
    for file in files:
        # すでに加工済みのファイル（ops_で始まる）はスキップ
        if file.startswith('ops_'):
            continue
            
        try:
            # CSVの読み込み
            file_path = os.path.join(current_dir, file)
            df = pd.read_csv(file_path)
            
            # 列の削除
            df_filtered = df.drop(columns=[col for col in target_columns if col in df.columns])
            
            # ナンバリングの決定
            index = 1
            while True:
                new_filename = f"ops_{today_str}_{index:02d}.csv"
                if not os.path.exists(os.path.join(current_dir, new_filename)):
                    break
                index += 1
            
            # 保存 (BOM付きUTF-8)
            output_path = os.path.join(current_dir, new_filename)
            df_filtered.to_csv(output_path, index=False, encoding='utf-8-sig')
            
            print(f"Success: {file} -> {new_filename}")
            processed_count += 1
            
        except Exception as e:
            print(f"Error processing {file}: {e}")

    if processed_count == 0:
        print("処理対象のCSVファイルが見つかりませんでした。")
    else:
        print(f"合計 {processed_count} 件のファイルを処理しました。")

if __name__ == "__main__":
    process_csv()
    input("処理が完了しました。Enterキーを押して終了してください...")
