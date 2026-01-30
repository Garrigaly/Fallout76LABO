const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const outputDir = 'd:/nvidia_captures/output';

// --- 【判定用の目】座標の確定工程を飛ばし、最適値をセット済 ---
const EYES = {
    MENU_AREA:  { left: 150,  top: 350, width: 450, height: 450 }, // 左：チャレンジ画面確認用
    SCORE_AREA: { left: 1450, top: 200, width: 420, height: 800 }, // 右：スコアの桁数(250/1000)確認用
    OPS_SCREEN: { left: 530,  top: 54,  width: 680, height: 880 }  // 上：オプス確認用
};

// --- 【保存用の腕】 ---
const CROPS = {
    DAILY_FINAL:  { left: 800, top: 300, width: 970, height: 600 }, 
    WEEKLY_FINAL: { left: 800, top: 300, width: 970, height: 850 },
    OPS_LEFT:     { left: 530, top: 54,  width: 670, height: 442 },
    OPS_RIGHT:    { left: 525, top: 505, width: 705, height: 430 }
};

const CHALLENGE_MASTER = ["デイリー", "ウィークリー", "キャラクター", "サバイバル", "コンバット", "ソーシャル", "アパラチア"];
const IGNORE_PHRASE = "アップリンクの機能を復旧し、敵の行動を監視して敵対勢力をすべて排除しろ！";

/**
 * 博士のロジック：桁数の多数決による精密判別
 */
async function identifyByDigitCount(fullPath) {
    // 1. 左側メニューをOCR（日本語モード）
    const mBuf = await sharp(fullPath).extract(EYES.MENU_AREA).toBuffer();
    const { data: { text: mText } } = await Tesseract.recognize(mBuf, 'jpn');
    const cleanMText = mText.replace(/\s+/g, "");

    // チャレンジ画面のキーワードが全くなければオプス判定へ回す
    if (!CHALLENGE_MASTER.some(word => cleanMText.includes(word))) return "NONE";

    // 2. 右側スコア列をOCR（数字に強い英語モードで高速実行）
    const sBuf = await sharp(fullPath).extract(EYES.SCORE_AREA).toBuffer();
    const { data: { text: sText } } = await Tesseract.recognize(sBuf, 'eng');
    
    // 数字を抽出
    const numbers = sText.match(/\d+/g) || [];
    let d3 = 0; // 3桁（250など）＝デイリー優勢
    let d4 = 0; // 4桁（1000など）＝ウィークリー優勢

    numbers.forEach(num => {
        if (num.length === 3) d3++;
        else if (num.length === 4) d4++;
    });

    console.log(`      - スコア桁数分析: 3桁[${d3}件] / 4桁[${d4}件]`);

    // 3. 多数決で最終判定
    if (d3 > d4) return "DAILY";
    if (d4 >= d3 && d4 > 0) return "WEEKLY"; // 1000が1つでもあればウィークリーの可能性大

    return "NONE";
}

async function processImage(fullPath) {
    const fileName = path.basename(fullPath);
    console.log(`\n[分析中] ${fileName}...`);

    try {
        // デイリー・ウィークリーの桁数判別
        const category = await identifyByDigitCount(fullPath);
        
        if (category === "DAILY") {
            console.log(`   ┗ 【判定】3桁スコア多数により『デイリー』と断定。`);
            await sharp(fullPath).extract(CROPS.DAILY_FINAL).toFile(path.join(outputDir, 'processed_daily.png'));
            return;
        } else if (category === "WEEKLY") {
            console.log(`   ┗ 【判定】4桁スコア多数により『ウィークリー』と断定。`);
            await sharp(fullPath).extract(CROPS.WEEKLY_FINAL).toFile(path.join(outputDir, 'processed_weekly.png'));
            return;
        }

        // チャレンジ画面でない場合はオプスを診る
        const oBuf = await sharp(fullPath).extract(EYES.OPS_SCREEN).toBuffer();
        const { data: { text: oRaw } } = await Tesseract.recognize(oBuf, 'jpn');
        let cleanO = oRaw.replace(/\s+/g, "").replace(IGNORE_PHRASE.replace(/\s+/g, ""), "");

        if (cleanO.includes("オプス") || cleanO.includes("アップリンク")) {
            console.log(`   ┗ 【判定】『デイリーオプス』と断定。`);
            const img = sharp(fullPath);
            const left = await img.clone().extract(CROPS.OPS_LEFT).toBuffer();
            const right = await img.clone().extract(CROPS.OPS_RIGHT).toBuffer();
            await sharp({ create: { width: 1430, height: 482, channels: 4, background: { r: 15, g: 15, b: 15, alpha: 1 } } })
                .composite([{ input: left, left: 20, top: 20 }, { input: right, left: 705, top: 26 }])
                .toFile(path.join(outputDir, 'processed_ops.png'));
        } else {
            console.log(`   ┗ 【除外】ノイズ画像（対象外）です。`);
        }
    } catch (err) {
        console.error(`   ┗ 【エラー】${err.message}`);
    }
}

async function main() {
    console.log(">> 臨床試験 v2：博士提案『スコア桁数判別エンジン』を起動...");
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    for (const file of files) await processImage(path.join(inputDir, file));
    console.log("\n>> 全工程完了。");
}

main();