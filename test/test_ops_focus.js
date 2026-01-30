const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const outputDir = 'd:/nvidia_captures/output';

/**
 * 【博士が確定させた黄金座標】
 */
const TEST_OPS_AREA = {
    left: 530, 
    top: 54, 
    width: 680, 
    height: 880 
};

/**
 * 無視すべき共通セリフ（博士の指示）
 */
const IGNORE_PHRASE = "アップリンクの機能を復旧し、敵の行動を監視して敵対勢力をすべて排除しろ！";

async function checkOpsOCR() {
    console.log(">> オプス文字認識テスト（共通セリフ無視設定）を開始...");
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    if (files.length === 0) return;
    
    const targetFile = files[0];
    const fullPath = path.join(inputDir, targetFile);

    try {
        const cropBuf = await sharp(fullPath).extract(TEST_OPS_AREA).toBuffer();
        await sharp(cropBuf).toFile(path.join(outputDir, 'val_ops_vision.png'));

        const { data: { text } } = await Tesseract.recognize(cropBuf, 'jpn');
        
        // --- 博士の指示：共通セリフを削除する処理 ---
        // 改行やスペースを除去してから比較・置換します
        let cleanText = text.replace(/\s+/g, "");
        const cleanIgnorePhrase = IGNORE_PHRASE.replace(/\s+/g, "");
        
        // 共通セリフを空文字に置き換える
        const finalInfo = cleanText.replace(cleanIgnorePhrase, "");

        console.log(`\n-----------------------------------------`);
        console.log(`【抽出された純粋な情報】`);
        console.log(finalInfo); 
        console.log(`-----------------------------------------`);

        // マスタ照合（この finalInfo を使ってマスタと突き合わせる）
        if (finalInfo.includes("アップリンク")) {
            console.log("★判定: 正しく情報をキャッチしました。");
        }

    } catch (err) {
        console.error(`error: ${err.message}`);
    }
}

checkOpsOCR();