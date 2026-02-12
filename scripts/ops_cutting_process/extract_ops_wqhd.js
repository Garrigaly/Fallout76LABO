import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- パス設定 ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const INPUT_DIR = path.join(ROOT, 'daily_ops_extracted'); 
const OUTPUT_DIR = path.join(ROOT, 'output', 'ops');

// 博士の「WQHD完全準拠」座標（固定資産）
const CONFIG = {
    // 【資産温存】Lは将来の必要性に備えて定義のみ残します
    L: { left: 530, top: 54, width: 670, height: 442 }, 
    R: { left: 525, top: 505, width: 705, height: 430 }
};

async function extractOps() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (!fs.existsSync(INPUT_DIR)) return;

    const files = fs.readdirSync(INPUT_DIR).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    console.log(`>> [R-Specific Mode] ${files.length} 枚の解体を開始...`);

    for (const file of files) {
        const inputPath = path.join(INPUT_DIR, file);
        const fileName = path.parse(file).name;

        try {
            const image = sharp(inputPath);
            const metadata = await image.metadata();
            let processor = sharp(inputPath);

            // HD(1920)をWQHD(2560)に自動昇圧（Rを正確に切り抜くため）
            if (metadata.width === 1920) {
                processor = processor.resize(2560, 1440, { kernel: 'lanczos3' });
            }

            // --- 抽出フェーズ ---
            // Lの抽出は、博士の「データダイエット」指令に基づき現在は封印しています
            // await processor.clone().extract(CONFIG.L).toFile(path.join(OUTPUT_DIR, `L_${fileName}.png`));

            // R（情報・変異パネル）のみを精製
            await processor.clone().extract(CONFIG.R).toFile(path.join(OUTPUT_DIR, `R_${fileName}.png`));

            console.log(`   [成功] Rパネル抽出完了: R_${fileName}.png`);

        } catch (err) {
            console.error(`   [失敗] ${file}:`, err.message);
        }
    }
    console.log(`\n>> 完了。Rパネルのみが output/ops に精製されました。`);
}

extractOps();