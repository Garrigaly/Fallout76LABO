import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import https from "https";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = require(path.join(__dirname, "main_key.json"));
const genAI = new GoogleGenerativeAI(config.api_key);

const orderPath = path.join(__dirname, "../file_convert_order.md");
const eventPath = path.join(__dirname, "../event_roadmap.md");
const imageDir = path.join(__dirname, "../../afterburner_png_stills");
const outputDir = path.join(__dirname, "../../output");
const psScriptPath = path.join(__dirname, "../sort_captures.ps1");

// 天気を日本語で取得
function getFukuokaWeather() {
    return new Promise((resolve) => {
        https.get('https://wttr.in/Fukuoka?format=%C+%c&lang=ja', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data.trim() || "晴れ ☀️"));
        }).on("error", () => resolve("晴れ ☀️"));
    });
}

async function runSnsFactory() {
    try {
        const instruction = fs.readFileSync(orderPath, "utf-8");
        const roadmap = fs.readFileSync(eventPath, "utf-8");
        const weather = await getFukuokaWeather();
        
        const now = new Date();
        const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()];
        const todayStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${dayOfWeek}曜日`;

        const allFiles = fs.readdirSync(imageDir);
        const latestImages = allFiles.filter(f => f.startsWith("Fallout76_")).sort((a, b) => b.localeCompare(a)).slice(0, 3);
        const imageParts = latestImages.map(f => ({
            inlineData: { data: Buffer.from(fs.readFileSync(path.join(imageDir, f))).toString("base64"), mimeType: "image/png" },
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
【システム事実】今日の日付: ${todayStr} / 福岡の天気: ${weather}
【予定表データ】
${roadmap}

【指示】
1. 画像を解析し、指令書の「美学（空行の配置、見出し禁止）」に従って出力せよ。
2. ミネルヴァの期間中（JST 2/7〜等）であれば、最新のウェブ情報を検索して出現場所（クレーター、ファウンデーション、フォート・アトラス、ホワイトスプリングのいずれか）を特定して記載せよ。
3. 全セクション間、およびショップの各ブロック間には必ず「空行」を入れよ。

【運用指令書】
${instruction}
`;

        console.log(`🤖 博士、情報の渋滞を解消し、ミネルヴァを捜索します...`);
        const result = await model.generateContent([prompt, ...imageParts]);
        const outputText = result.response.text();

        const fileName = `Fallout76_Report_${now.toISOString().split('T')[0].replace(/-/g, '_')}.md`;
        fs.writeFileSync(path.join(outputDir, fileName), outputText, 'utf-8');
        
        console.log("\n" + "=".repeat(30) + "\n" + outputText + "\n" + "=".repeat(30));

        exec(`powershell.exe -ExecutionPolicy Bypass -File "${psScriptPath}"`);

    } catch (error) { console.error("❌ エラー:", error.message); }
}
runSnsFactory();