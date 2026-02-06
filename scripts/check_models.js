import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyABmnqklBMUondCVVmsHSb8uOAtvKD-uIA"; 
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  console.log("現在、博士のプロジェクトで使用可能なモデルを確認中...");
  try {
    // 使用可能なモデル一覧を取得
    const models = await genAI.listModels();
    console.log('\n--- 使用可能なモデル一覧 ---');
    for (const model of models) {
      console.log(`名前: ${model.name} (対応機能: ${model.supportedGenerationMethods})`);
    }
    console.log('----------------------------\n');
  } catch (error) {
    console.error("モデル一覧の取得に失敗しました:", error);
  }
}

listModels();