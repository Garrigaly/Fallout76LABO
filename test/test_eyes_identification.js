const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';

// --- 博士と確定させた【黄金の覗き窓】 ---
const EYES = {
    DAILY: { left: 200, top: 400, width: 500, height: 600 },
    OPS:   { left: 530, top: 54,  width: 680, height: 880 }
};

// 無視設定
const IGNORE_PHRASE = "アップリンクの機能を復旧し、敵の行動を監視して敵対勢力をすべて排除しろ！";

/**
 * デイリーの目：カテゴリー列を見て「デイリー/ウィークリー」を識別
 */
async function identifyDaily(fullPath) {
    const buf = await sharp(fullPath).extract(EYES.DAILY).toBuffer();
    const { data: { text } } = await Tesseract.recognize(buf, 'jpn');
    const cleanText = text.replace(/\s+/g, "");
    return cleanText.includes("デイリー") || cleanText.includes("ウィークリー");
}

/**
 * オプスの目：タイトルエリアを見て「オプス/アップリンク」を識別
 */
async function identifyOps(fullPath) {
    const buf = await sharp(fullPath).extract(EYES.OPS).toBuffer();
    const { data: { text } } = await Tesseract.recognize(buf, 'jpn');
    let cleanText = text.replace(/\s+/g, "");
    const cleanIgnore = IGNORE_PHRASE.replace(/\s+/g, "");
    
    // 共通セリフを除去した状態で判定
    const targetText = cleanText.replace(cleanIgnore, "");
    return targetText.includes("オプス") || targetText.includes("アップリンク");
}

async function startIdentificationTest() {
    console.log(">> 判定精度テスト（臨床試験）を開始します...");
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    
    if (files.length === 0) return console.log("error: inputフォルダにテスト用の画像を入れてください。");

    console.log(`検証対象: ${files.length}枚\n`);

    for (const file of files) {
        const fullPath = path.join(inputDir, file);
        console.log(`[診察中] ${file}...`);

        // 1. デイリーの目で見る
        const isDaily = await identifyDaily(fullPath);
        if (isDaily) {
            console.log(`   ┗ 結果: 【デイリー（チャレンジ）】と判定`);
            continue;
        }

        // 2. オプスの目で見る
        const isOps = await identifyOps(fullPath);
        if (isOps) {
            console.log(`   ┗ 結果: 【デイリーオプス】と判定`);
            continue;
        }

        console.log(`   ┗ 結果: 【判定不能】どちらの条件にも一致しません`);
    }

    console.log("\n>> テスト終了。すべての画像が正しく仕分けられましたか？");
}

startIdentificationTest();