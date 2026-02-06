import { GoogleGenerativeAI } from "@google/generative-ai";

// 画像 の「...0Yzc」で終わるキーをここに貼り付けてください
const API_KEY = "AIzaSyABmnqklBMUondCVVmsHSb8uOAtvKD-uIA"; 

const genAI = new GoogleGenerativeAI(API_KEY);
// hello_gemini.js の 8 行目を修正
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

async function run() {
  const prompt = "こんにちは、博士です。AI Studio SDK 経由で繋がりましたか？博士流に短く挨拶してください。";

  console.log("Gemini を呼び出し中（AI Studio 経由）...");

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('\n--- 接続成功！Gemini からの返答 ---');
    console.log(response.text());
    console.log('------------------------------------\n');
  } catch (error) {
    console.error("接続に失敗しました:", error);
  }
}

run();