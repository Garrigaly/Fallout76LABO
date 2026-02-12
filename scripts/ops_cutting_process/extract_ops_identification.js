import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- 解析によって割り出された「真実の座標」 ---
const TRUE_CONFIG = {
    L: { left: 48, top: 670, width: 470, height: 242 }, // アクティビティ・トラッカー
    R: { left: 525, top: 50, width: 705, height: 1150 }  // デイリーオプス詳細
};

const OUTPUT_FOLDER_NAME = 'ops_and';
const PROGRAM_ID = 'Identification';
// ------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const INPUT_DIR = path.join(ROOT, 'input');
const OUTPUT_DIR = path.join(ROOT, 'output', OUTPUT_FOLDER_NAME);

async function extractOpsIdentification() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const files = fs.readdirSync(INPUT_DIR).filter(f => f.match(/\.(png|jpg|jpeg)$/i));

    console.log(`>> [${PROGRAM_ID}] Starting precision extraction with TRUE coordinates...`);

    for (const file of files) {
        const inputPath = path.join(INPUT_DIR, file);
        try {
            // 解析済みの「真実の座標」で抜き出し
            await sharp(inputPath).extract(TRUE_CONFIG.L).toFile(path.join(OUTPUT_DIR, `L_${file}`));
            await sharp(inputPath).extract(TRUE_CONFIG.R).toFile(path.join(OUTPUT_DIR, `R_${file}`));
            console.log(` ✅ 精密抽出完了: ${file}`);
        } catch (err) {
            console.error(` ❌ 抽出失敗 (${file}): ${err.message}`);
        }
    }
}

extractOpsIdentification();