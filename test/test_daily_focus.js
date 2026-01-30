const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const outputDir = 'd:/nvidia_captures/output';

// 博士の黄金座標
const TEST_DAILY_AREA = { left: 200, top: 400, width: 410, height: 600 };

/**
 * 【固定単語マスタ】
 * ここに登録された言葉以外は「ゴミ」として排除します。
 */
const MASTER_LIST = [
    "デイリー", "ウィークリー", "キャラクター", "サバイバル", 
    "コンバット", "ソーシャル", "アパラチア", "釣り", "バーニング・スプリングス"
];

async function checkDailyOCR() {
    console.log(">> 整合性チェック：固定単語マッチングを開始...");
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    if (files.length === 0) return;
    
    const targetFile = files[0];
    const fullPath = path.join(inputDir, targetFile);

    try {
        const cropBuf = await sharp(fullPath).extract(TEST_DAILY_AREA).toBuffer();
        await sharp(cropBuf).toFile(path.join(outputDir, 'val_daily_vision.png'));

        const { data: { text } } = await Tesseract.recognize(cropBuf, 'jpn');
        
        // 全スペースと改行を削除して「比較用の塊」を作る
        const cleanRawText = text.replace(/\s+/g, "");

        console.log(`\n-----------------------------------------`);
        console.log(`【確定した検知項目】`);

        // マスタと照合し、一致したものだけをリストに入れる
        const matches = MASTER_LIST.filter(word => cleanRawText.includes(word));

        // 博士の指示：各要素ごとに改行して出力
        if (matches.length > 0) {
            console.log(matches.join('\n'));
        } else {
            console.log("（有効なカテゴリーが検出されませんでした）");
        }
        
        console.log(`-----------------------------------------`);

        // 判定フラグ
        if (matches.includes("デイリー")) {
            console.log("★判定: 『デイリー』を捕捉！ 完璧な仕分けです。");
        }

    } catch (err) {
        console.error(`error: ${err.message}`);
    }
}

checkDailyOCR();