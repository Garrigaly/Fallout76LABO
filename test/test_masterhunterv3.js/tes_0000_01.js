const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');
const { createWorker } = require('tesseract.js');

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    inputPath: 'd:/nvidia_captures/input/test_shot.png', 
    outputDir: 'd:/nvidia_captures/output',
    masterDir: 'd:/nvidia_captures/master_assets',
    
    assets: {
        '1st':   'スクリーンショット 2026-01-26 172628.png',
        'FREE':  'スクリーンショット 2026-01-26 172632.png',
        'OWNED': 'スクリーンショット 2026-01-26 172638.png',
        'ATOM':  'スクリーンショット 2026-01-26 172715.png'
    },

    regions: [
        { name: 'V1_Upper', left: 580, top: 280, width: 1950, height: 655 },
        { name: 'V2_Lower', left: 580, top: 940, width: 1950, height: 340 }
    ],

    step: 3,         
    threshold: 0.18,

    // OCR用の設定: アイコンからの相対的な文字位置
    ocrOffset: {
        x: -50,      // アイコン位置から左へ50px
        y: -180,     // アイコン位置から上へ180px
        width: 450,  // 読み取り範囲の幅
        height: 120  // 読み取り範囲の高さ
    }
};

const pm = typeof pixelmatch === 'function' ? pixelmatch : pixelmatch.default;

// ==========================================
// MAIN PROCESS
// ==========================================

async function runAnalysis() {
    console.log('--- Fallout 76 Hybrid Scanner (Icon + OCR) ---');
    
    if (!fs.existsSync(CONFIG.outputDir)) fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    if (!fs.existsSync(CONFIG.inputPath)) return console.error('❌ Input not found');

    // OCRエンジンの初期化 (日本語と英語)
    const worker = await createWorker('jpn+eng');

    for (const region of CONFIG.regions) {
        console.log(`\n🔍 ${region.name} を走査中...`);
        
        try {
            const regionBuffer = await sharp(CONFIG.inputPath)
                .extract({ left: region.left, top: region.top, width: region.width, height: region.height })
                .ensureAlpha().toBuffer();
            const regionImg = PNG.sync.read(regionBuffer);

            for (const [label, fileName] of Object.entries(CONFIG.assets)) {
                const assetPath = path.join(CONFIG.masterDir, fileName);
                if (!fs.existsSync(assetPath)) continue;

                const stampBuffer = await sharp(assetPath).ensureAlpha().toBuffer();
                const stampImg = PNG.sync.read(stampBuffer);

                const result = findStamp(regionImg, stampImg);
                if (result) {
                    const globalX = region.left + result.x;
                    const globalY = region.top + result.y;
                    
                    console.log(`✅ 【${label}】を検知しました`);

                    // --- OCRフェーズ: 商品名の抽出 ---
                    try {
                        // アイコンの上部付近を切り抜く
                        const textCrop = {
                            left: Math.max(0, globalX + CONFIG.ocrOffset.x),
                            top: Math.max(0, globalY + CONFIG.ocrOffset.y),
                            width: CONFIG.ocrOffset.width,
                            height: CONFIG.ocrOffset.height
                        };

                        const textBuffer = await sharp(CONFIG.inputPath)
                            .extract(textCrop)
                            .threshold(120) // 文字を読みやすくするために二値化
                            .toBuffer();

                        const { data: { text } } = await worker.recognize(textBuffer);
                        const cleanText = text.replace(/\n/g, ' ').trim();
                        
                        console.log(`   📝 商品名推定: ${cleanText}`);

                        // 保存
                        await sharp(textBuffer).toFile(path.join(CONFIG.outputDir, `${label}_text_area.png`));
                    } catch (ocrErr) {
                        console.error('   ⚠️ OCR失敗:', ocrErr.message);
                    }
                }
            }
        } catch (err) {
            console.error(`❌ エラー: ${err.message}`);
        }
    }
    await worker.terminate();
    console.log('\n--- 解析完了 ---');
}

function findStamp(scene, stamp) {
    const { width: sW, height: sH } = stamp;
    const { width: zW, height: zH } = scene;
    let bestMatch = null;
    let minDiff = sW * sH;

    for (let y = 0; y <= zH - sH; y += CONFIG.step) {
        for (let x = 0; x <= zW - sW; x += CONFIG.step) {
            const numDiffPixels = pm(
                extractSubBuffer(scene, x, y, sW, sH),
                stamp.data, null, sW, sH, { threshold: CONFIG.threshold }
            );
            if (numDiffPixels < minDiff) {
                minDiff = numDiffPixels;
                const mismatchRatio = numDiffPixels / (sW * sH);
                if (mismatchRatio < CONFIG.threshold) {
                    return { x, y, confidence: 1 - mismatchRatio };
                }
            }
        }
    }
    return null;
}

function extractSubBuffer(mainImg, x, y, w, h) {
    const subBuffer = Buffer.alloc(w * h * 4);
    for (let row = 0; row < h; row++) {
        const sourceStart = ((y + row) * mainImg.width + x) * 4;
        const destStart = row * w * 4;
        mainImg.data.copy(subBuffer, destStart, sourceStart, sourceStart + (w * 4));
    }
    return subBuffer;
}

runAnalysis();