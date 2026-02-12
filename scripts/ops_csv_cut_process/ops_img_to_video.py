# 2026年2月9日オプス画像をつないでGeminiに認識させ文字データを抜き出させる動画を作るプログラム
# 指定されたフォルダ内のPNG画像を指定した秒数で連結し、1本最大10分の動画を生成するプログラムです。
# FFmpegのconcat機能とNVIDIA GPU（NVENC）を使用し、WQHD解像度で高速にエンコードを行います。
# 画像枚数が多い場合は自動的に分割して複数の動画ファイルとして出力します。

import os
import math
import subprocess

def generate_videos_ffmpeg():
    # ディレクトリ設定（相対パス運用）
    current_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.normpath(os.path.join(current_dir, "..", "..", "output", "ops_cut_data"))
    output_folder = os.path.normpath(os.path.join(current_dir, "..", "..", "output", "Gemini_seeing"))
    
    resolution = "2560:1440" # WQHD (ffmpeg filter format)
    max_duration_sec = 600    # 10分
    fps = 24
    
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        
    if not os.path.exists(input_path):
        print(f"Error: フォルダが見つかりません。\n探した場所: {input_path}")
        return

    # PNGファイルの取得とソート
    files = sorted([f for f in os.listdir(input_path) if f.lower().endswith('.png')])
    if not files:
        print("Error: PNGファイルが見つかりません。")
        return
    
    print(f"計 {len(files)} 枚の画像を確認しました。")
    try:
        duration_per_image = float(input("1枚あたりの表示時間を秒で入力してください (例: 2): "))
    except ValueError:
        print("無効な数値です。")
        return

    # 動画1本あたりの画像枚数を算出
    images_per_video = math.floor(max_duration_sec / duration_per_image)
    total_videos = math.ceil(len(files) / images_per_video)
    
    for i in range(total_videos):
        start_idx = i * images_per_video
        end_idx = min((i + 1) * images_per_video, len(files))
        batch_files = files[start_idx:end_idx]
        
        # ffmpeg用の入力リスト(txtファイル)を作成
        list_file_path = os.path.join(current_dir, f"input_list_{i+1:02d}.txt")
        with open(list_file_path, "w", encoding="utf-8") as f:
            for file_name in batch_files:
                full_path = os.path.join(input_path, file_name).replace('\\', '/')
                f.write(f"file '{full_path}'\n")
                f.write(f"duration {duration_per_image}\n")
            # ffmpeg concatの仕様上、最後のファイルもdurationを指定するか、最後にもう一度記述が必要
            f.write(f"file '{os.path.join(input_path, batch_files[-1]).replace('\\', '/')}'\n")

        output_save_path = os.path.join(output_folder, f"Gemini_seeing_{i+1:02d}.mp4")
        print(f"\n--- 動画 {i+1}/{total_videos} を生成中 (ffmpeg直結・爆速モード) ---")

        # ffmpeg コマンドの構築
        cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", list_file_path,
            "-vcodec", "h264_nvenc",
            "-preset", "p1",
            "-tune", "ll",
            "-qp", "28",
            "-pix_fmt", "yuv420p",
            "-vf", f"scale={resolution}",
            "-r", str(fps),
            output_save_path
        ]

        # 実行
        subprocess.run(cmd)
        
        # 一時ファイルの削除
        if os.path.exists(list_file_path):
            os.remove(list_file_path)
        
    print(f"\n全工程が完了しました！\n出力先: {output_folder}")

if __name__ == "__main__":
    generate_videos_ffmpeg()