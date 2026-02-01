// [2026-02-01] Version: 1.9.1 - Master Linked Version
const fs = require('fs');
const path = require('path');

const PATHS = {
    basic: 'D:\\nvidia_captures\\data\\jsondata_today_basic.json',
    ops: 'D:\\nvidia_captures\\data\\jsondata_today_ops.json',
    shop: 'D:\\nvidia_captures\\data\\jsondata_today_atomicshop.json',
    // 修正：マスターロードマップへの参照を固定
    roadmap: 'D:\\nvidia_captures\\data\\jsondata_roadmap_master.json', 
    outputTxt: 'D:\\nvidia_captures\\data\\today_daily_post.txt'
};
// ...（以下、ロジックは1.9.0を継承）