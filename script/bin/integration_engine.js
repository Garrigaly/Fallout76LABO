/**
 * Fallout 76 毎日投稿・黄金比率統合エンジン
 * @version 1.2.0 (2026-02-01)
 */

const DOCTOR_ALIAS = {
    "スーパーミュータント": "スパミュ",
    "ウエストテック研究センター": "ウエ研",
    "鋭い視線": "Per増加",
    "サヴェージ・ストライク": "アーマー貫通",
    "グループ再生": "回復",
    "アンステイブル": "素早く+爆発", // 「高速」禁止ルール適用
    "アクティブ迷彩": "透明",
    "不安定": "爆発",
    "氷の手": "氷結",
    "スティングフロスト": "氷結・毒"
};

const COLOR_CODES = {
    "月": "#FF8C00", "火": "#FF0040", "水": "#00BFFF",
    "木": "#32CD32", "金": "#FFD700", "土": "#9932CC", "日": "#DC143C"
};

function generatePost(data) {
    // 1. ヘッダーセクション
    let post = `#Fallout76 #${data.eventTag}\n\n`;
    post += `皆様おはようございます😎\n\n`;
    post += `${data.year}年${data.month}月${data.day}日${data.weekday}${data.weather}${data.weatherEmoji}です\n\n`;

    // 2. イベント・ミネルヴァ
    if (data.event) {
        const period = data.eventDays >= 6 ? "開催中" : "週末開催中";
        post += `${data.eventName}${period}\n`;
    }
    if (data.minerva) {
        post += `ミネルヴァさんは${data.minervaLocation}です\n\n`;
    }

    // 3. デイリーオプス
    const opsMode = data.mutations.length >= 3 ? "オプスもダブル" : `オプスは${data.opsMode}`;
    post += `${opsMode}\n`;
    
    // エイリアス変換適用 [cite: 2026-01-26]
    const convertedMutations = data.mutations.map(m => DOCTOR_ALIAS[m] || m).join("・");
    post += `${data.opsLocation}・${data.opsFaction}\n`;
    post += `${convertedMutations}です\n\n`;

    // 4. アトミックショップ
    if (data.shopFree) {
        const freeItem = data.shopFree.replace("無料", ""); // 「無料」文字削除ルール
        post += `${freeItem}貰えます\n`;
    }
    if (data.shopSale) {
        post += `お買い得は${data.shopSale}\n`;
    }
    if (data.shop1st) {
        post += `1ST限定${data.shop1st}貰えます\n`;
    }
    post += "\n";

    // 5. フッターセクション
    post += `今日も良き日を♡\n\n`;
    post += `#${COLOR_CODES[data.weekday] || "#FFFFFF"}`;

    // 6. 最終整形（半角スペース排除ルール）
    return post.replace(/ /g, "").replace(/\n{3,}/g, "\n\n");
}