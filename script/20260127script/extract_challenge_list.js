const sharp = require('sharp');
const path = require('path');

// 設定：ディレクトリ
const inputDir = 'D:\\nvidia_captures\\afterburner_png_stills';
const outputDir = 'D:\\nvidia_captures\\output';

// 設定：ファイル名
const inputFileName = 'Fallout76_2026_01_27_06_27_23_579.png';
const outputFileName = 'challenge_list_output.png';

const inputPath = path.join(inputDir, inputFileName);
const outputPath = path.join(outputDir, outputFileName);

// 切り出し範囲 (WQHD 2560x1440 用)
const CHALLENGE_LIST = {
    left: 530,
    top: 55,
    width: 690,
    height: 1150
};

async function extractSection() {
    try {
        console.log(`読み込み中: ${inputPath}`);
       
        await sharp(inputPath)
            .extract(CHALLENGE_LIST)
            .toFile(outputPath);
        
        console.log(`成功: ${outputPath} に保存しました。`);
        console.log('※入力ファイルは削除されず保持されています。');
    } catch (error) {
        if (error.message.includes('Input file is missing')) {
            console.error('エラー: 指定された入力ファイルが見つかりません。');
        } else {
            console.error('エラーが発生しました:', error);
        }
    }
}

extractSection();