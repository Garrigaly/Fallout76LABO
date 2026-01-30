import pyperclip
import json
import os

# --- 設定エリア ---
DATA_DIR = r'D:\nvidia_captures\data'

def magic_process():
    content = pyperclip.paste()
    if '{' in content and 'jsondata' in content:
        try:
            # JSON部分を抽出して保存
            start = content.find('{')
            end = content.rfind('}') + 1
            data = json.loads(content[start:end])
            for filename, body in data.items():
                with open(os.path.join(DATA_DIR, filename), 'w', encoding='utf-8') as f:
                    json.dump(body, f, ensure_ascii=False, indent=2)
            return True
        except: return False
    return False

if __name__ == "__main__":
    magic_process()