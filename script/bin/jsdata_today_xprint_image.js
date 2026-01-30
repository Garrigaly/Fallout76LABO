// [2026-01-29] Version: 1.9.0 - Final Master Version
const fs = require('fs');
const path = require('path');

const PATHS = {
    basic: 'D:\\nvidia_captures\\data\\jsondata_today_basic.json',
    ops: 'D:\\nvidia_captures\\data\\jsondata_today_ops.json',
    shop: 'D:\\nvidia_captures\\data\\jsondata_today_atomicshop.json',
    roadmap: 'D:\\nvidia_captures\\data\\jsondata_roadmap_2026_02_03.json',
    outputTxt: 'D:\\nvidia_captures\\data\\today_daily_post.txt'
};

const TAG_MAP = {
    "MOTHMAN EQUINOX": "#Mothman",
    "ダブルS.C.O.R.E.": "#DoubleScore",
    "ダブルXP": "#DoubleXP",
    "ファスナハト": "#Fasnacht",
    "ミネルヴァ": "#Minerva"
};

function isEventActive(rangeStr) {
    const now = new Date();
    const [start, end] = rangeStr.split('〜');
    const [sM, sD] = start.split('/').map(Number);
    const [eM, eD] = end.split('/').map(Number);
    const currentYear = now.getFullYear();
    const sDate = new Date(currentYear, sM - 1, sD);
    let eDate = new Date(currentYear, eM - 1, eD);
    if (eDate < sDate) eDate.setFullYear(currentYear + 1);
    return now >= sDate && now <= eDate;
}

try {
    const basic = JSON.parse(fs.readFileSync(PATHS.basic, 'utf8'));
    const opsData = JSON.parse(fs.readFileSync(PATHS.ops, 'utf8'));
    const shopData = JSON.parse(fs.readFileSync(PATHS.shop, 'utf8'));
    const roadData = JSON.parse(fs.readFileSync(PATHS.roadmap, 'utf8'));

    let eventLines = [];
    let autoTags = [];
    roadData.roadmap.forEach(m => m.events.forEach(e => {
        if (isEventActive(e.date)) {
            eventLines.push(`${e.name}開催中`);
            Object.keys(TAG_MAP).forEach(key => {
                if (e.name.includes(key) && !autoTags.includes(TAG_MAP[key])) {
                    autoTags.push(TAG_MAP[key]);
                }
            });
        }
    }));

    let lines = [];
    let firstLine = "#Fallout76";
    if (autoTags.length > 0) firstLine += " " + autoTags.join(" ");
    lines.push(firstLine, "皆様おはようございます😎");
    lines.push(`${basic.date} ${basic.weather.condition} ${basic.weather.icon}です`, "");

    if (eventLines.length > 0) {
        eventLines.forEach(l => lines.push(l));
        lines.push("");
    }

    const ops = opsData.daily_ops;
    lines.push(`オプスは${ops.mode}`, `${ops.location}・${ops.enemy_faction}`, `${ops.mutations.map(m => m.name).join('・')}です`, "");

    const items = shopData.atomic_shop.items;
    items.filter(i => i.status.includes("FREE")).forEach(i => lines.push(`${i.name}貰えます`));
    lines.push("", "お買い得は");
    items.filter(i => i.status.includes("オフ")).forEach(i => lines.push(i.name));
    lines.push("", "１ST限定");
    items.filter(i => i.status.includes("Fallout 1st")).forEach(i => {
        lines.push(`${i.name}${i.status.includes("付属") ? "貰えます" : "がお買い得"}`);
    });

    lines.push("", "今日も良き日を❤️", "#32CD32");
    fs.writeFileSync(PATHS.outputTxt, lines.join('\n'), 'utf8');
    console.log("✅ 投稿案を生成しました。");
} catch (e) {
    console.error("❌ エラーが発生しました:", e.message);
}