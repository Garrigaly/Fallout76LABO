const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const outputDir = 'd:/nvidia_captures/output';

// --- your golden ratio sanctuary (strictly fixed) --- [cite: 2026-01-24, 2026-01-25]
const opsLeftPart = { left: 530, top: 54, width: 670, height: 442 };
const opsRightPart = { left: 525, top: 505, width: 705, height: 430 };
const dailyFinalCrop = { left: 800, top: 300, width: 970, height: 600 };

async function processImages() {
    // Corrected to readdirSync [cite: 2026-01-25]
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    if (files.length !== 2) {
        console.log(`error: input folder has ${files.length} images. please keep exactly 2.`);
        return;
    }

    const fileA = files[0];
    const fileB = files[1];
    
    console.log(`analyzing: ${fileA}...`);
    const resultA = await analyzeImageWithRetries(path.join(inputDir, fileA));

    if (resultA === 'ops') {
        console.log(`>> image A is [ops]. forcing image B to [daily].`);
        await transformOps(path.join(inputDir, fileA), fileA);
        await transformDaily(path.join(inputDir, fileB), fileB);
    } 
    else if (resultA === 'daily') {
        console.log(`>> image A is [daily]. forcing image B to [ops].`);
        await transformDaily(path.join(inputDir, fileA), fileA);
        await transformOps(path.join(inputDir, fileB), fileB);
    } 
    else {
        console.log(`image A unknown. analyzing: ${fileB}...`);
        const resultB = await analyzeImageWithRetries(path.join(inputDir, fileB));

        if (resultB === 'ops') {
            console.log(`>> image B is [ops]. forcing image A to [daily].`);
            await transformDaily(path.join(inputDir, fileA), fileA);
            await transformOps(path.join(inputDir, fileB), fileB);
        } else if (resultB === 'daily') {
            console.log(`>> image B is [daily]. forcing image A to [ops].`);
            await transformOps(path.join(inputDir, fileA), fileA);
            await transformDaily(path.join(inputDir, fileB), fileB);
        } else {
            console.log('no identification data found.');
        }
    }
}

async function analyzeImageWithRetries(inputPath) {
    // Corrected to resolveWithObject [cite: 2026-01-25]
    const { data } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });

    // step 1: persistent yellow (daily) scan - 5 retries [cite: 2026-01-25]
    for (let i = 1; i <= 5; i++) {
        const threshold = 180 - (i * 10);
        let yellowCount = 0;
        for (let j = 0; j < data.length; j += 3) {
            if (data[j] > threshold && data[j+1] > (threshold - 30) && data[j+2] < 120) yellowCount++;
        }
        if (yellowCount > 800) return 'daily';
    }

    // step 2: persistent blue (ops) scan - 5 retries [cite: 2026-01-25]
    for (let i = 1; i <= 5; i++) {
        const thresholdR = 100 + (i * 10);
        const thresholdB = 220 - (i * 10);
        let blueCount = 0;
        for (let j = 0; j < data.length; j += 3) {
            if (data[j] < thresholdR && data[j+1] > 140 && data[j+2] > thresholdB) blueCount++;
        }
        if (blueCount > 300) return 'ops';
    }
    return 'unknown';
}

async function transformOps(input, name) {
    const img = sharp(input);
    const leftBuf = await img.clone().extract(opsLeftPart).toBuffer();
    const rightBuf = await img.clone().extract(opsRightPart).toBuffer();
    
    // Corrected to toFile [cite: 2026-01-25]
    await sharp({ 
        create: { width: 1430, height: 482, channels: 4, background: { r: 15, g: 15, b: 15, alpha: 1 } } 
    })
    .composite([
        { input: leftBuf, left: 20, top: 20 },
        { input: rightBuf, left: 705, top: 26 }
    ])
    .toFile(path.join(outputDir, `processed_ops_${name}`));
    console.log(`>> processed ops: ${name}`);
}

async function transformDaily(input, name) {
    // Corrected to toFile [cite: 2026-01-25]
    await sharp(input)
        .extract(dailyFinalCrop)
        .toFile(path.join(outputDir, `processed_daily_${name}`));
    console.log(`>> processed daily: ${name}`);
}

processImages();