// ==========================================
// 1. 基礎工具 (UTILS)
// ==========================================

function getEl(id) { return document.getElementById(id); }

function removeClass(id) { 
    const el = getEl(id);
    if(el) el.classList.remove('hidden'); 
}
function addClass(id) { 
    const el = getEl(id);
    if(el) el.classList.add('hidden'); 
}
function toggleClass(id) { 
    const el = getEl(id);
    if(el) el.classList.toggle('hidden'); 
}

function updateMainDisplay(e, t) { 
    getEl('main-emoji').innerText = e; 
    getEl('main-text').innerText = t; 
    addToLog(t); 
}

function addToLog(message) {
    const logContent = getEl('log-content');
    if(!logContent) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    let timeStr = (typeof player !== 'undefined') ? `[${player.year}/${player.month}]` : `[系統]`;
    entry.innerText = `${timeStr} ${message}`;
    logContent.prepend(entry);
}

function playBlinkEffect(callback) {
    const overlay = getEl('blink-overlay');
    overlay.classList.add('blink-active');
    setTimeout(() => { if (callback) callback(); }, 500);
    setTimeout(() => { overlay.classList.remove('blink-active'); }, 1000);
}

function triggerShake(type) {
    const target = (type === 'v') ? getEl('main-display') : document.body;
    const className = (type === 'v') ? 'shake-v' : 'shake-h';
    target.classList.remove(className); 
    void target.offsetWidth; 
    target.classList.add(className);
    setTimeout(() => target.classList.remove(className), 200);
}

function showToast(title, name) {
    const toast = getEl('achievement-toast');
    if(!toast) return;
    getEl('toast-name').innerText = name;
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 4000);
}

// ==========================================
// 2. 介面開關與場景控制 (SCENE & UI)
// ==========================================

function toggleLog() { toggleClass('log-modal'); }
function openMap() { removeClass('map-modal'); }
function closeMap() { addClass('map-modal'); }

function openEquip() { 
    if(typeof updateEquipGrid === 'function') updateEquipGrid(); 
    removeClass('equip-modal'); 
}
function closeEquip() { addClass('equip-modal'); }

function openBag() { 
    removeClass('bag-modal'); 
    if(typeof renderBagGrid === 'function') renderBagGrid(); 
}
function closeBag() { addClass('bag-modal'); }

function openCollection() { 
    removeClass('collection-modal'); 
    if(typeof renderCollectionGrid === 'function') renderCollectionGrid(); 
}
function closeCollection() { addClass('collection-modal'); }

function openAchievement() { 
    if(typeof renderAchievementList === 'function') renderAchievementList();
    removeClass('achievement-modal'); 
}
function closeAchievement() { addClass('achievement-modal'); }

function openShop() { 
    const btn = document.querySelector('#shop-modal .tab-btn');
    if(btn && typeof switchShopTab === 'function') switchShopTab('buy', btn); 
    removeClass('shop-modal'); 
}
function closeShop() { addClass('shop-modal'); }

function openForge() { 
    if(typeof renderForgeList === 'function') renderForgeList();
    removeClass('forge-modal');
}
function closeForge() { addClass('forge-modal'); }

function openFloorSelector() {
    getEl('input-max-floor').innerText = player.maxFloor;
    getEl('floor-input').max = player.maxFloor;
    getEl('floor-input').value = player.floor;
    removeClass('floor-modal');
}
function closeFloorSelector() { addClass('floor-modal'); }

function closeItemDetail() { addClass('item-detail-modal'); }
function closeSelector() { addClass('selector-modal'); }

// 退出與死亡相關
function askQuit() { removeClass('confirm-modal'); }
function closeConfirm() { addClass('confirm-modal'); }

function confirmQuit() { 
    closeConfirm(); 
    backToTitle(); // 呼叫回標題
}

function checkDeath() { 
    if(player.hp <= 0){ 
        player.hp = 0; 
        updateUI(); 
        getEl('death-msg').innerText = `享年 ${player.year} 歲，死於 ${player.location}。`; 
        removeClass('death-modal'); 
    } 
}

// ★★★ 這裡補上了 backToTitle ★★★
function backToTitle() { 
    playBlinkEffect(() => { 
        addClass('death-modal'); 
        addClass('scene-game'); 
        addClass('scene-origin'); 
        addClass('job-selection'); 
        
        const karmaFill = getEl('karma-fill');
        if(karmaFill) karmaFill.style.width = '0%'; 
        
        removeClass('scene-start'); 
    }); 
}

// ==========================================
// 3. 遊戲資料庫 (DATA)
// ==========================================

setTimeout(() => {
    const titleEl = document.querySelector('.title-box h1');
    if(titleEl) titleEl.innerText = "🗡️ 浮生劍影 🛡️";
}, 50);

function loadMetaData() {
    try {
        const data = localStorage.getItem('fusheng_meta_v1');
        return data ? JSON.parse(data) : { col: [], ach: ["ach_first_blood"] };
    } catch(e) { return { col: [], ach: ["ach_first_blood"] }; }
}
function saveMetaData() {
    if(typeof player === 'undefined') return;
    const data = { col: player.unlockedCollection, ach: player.unlockedAchievements };
    localStorage.setItem('fusheng_meta_v1', JSON.stringify(data));
}
const meta = loadMetaData();

const immortalRanks = ["煉氣", "築基", "結丹", "元嬰", "化神", "煉虛", "合體", "大乘", "真仙", "金仙", "太乙"];
const devilRanks = ["煉體", "凝元", "意欲", "吞噬", "魔嬰", "出竅", "離識", "合體", "碎虛", "大乘", "渡劫"];

const jobs = {
    highGood: [ { name: "僧人", emoji: "🙏", desc: "每5次修煉必定雙倍。", hp: 20, mp: 20, atk: 0 }, { name: "大夫", emoji: "⚕️", desc: "每5次休息產出補氣丸。", hp: 0, mp: 20, atk: 0 } ],
    midGood: [ { name: "俠客", emoji: "⚔️", desc: "仗劍走天涯，浩氣長存。", hp: 20, mp: 0, atk: 0 }, { name: "捕快", emoji: "🛡️", desc: "奉公守法，鐵面無私。", hp: 15, mp: 0, atk: 5 } ],
    highEvil: [ { name: "蠱師", emoji: "🦂", desc: "攻擊附帶中毒。", hp: -10, mp: 30, atk: 0 }, { name: "羅剎", emoji: "👹", desc: "嗜血好戰，以殺止殺。", hp: 30, mp: 0, atk: 30 } ],
    midEvil: [ { name: "惡棍", emoji: "🚬", desc: "市井無賴，手段下作。", hp: 0, mp: 0, atk: 5 }, { name: "巨賈", emoji: "💰", desc: "無法修煉，戰鬥可賄賂。", hp: 0, mp: 0, atk: 0, money: 50000 } ],
    neutral: [ { name: "俠客", emoji: "⚔️", desc: "仗劍走天涯，浩氣長存。", hp: 20, mp: 0, atk: 0 }, { name: "惡棍", emoji: "🚬", desc: "市井無賴，手段下作。", hp: 0, mp: 0, atk: 5 } ]
};

const itemDB = {
    "weapon_001": { name: "樹枝", category: "equip", type: "hand", rarity: "gray", price: 10, atk: 3, hp: 0, emoji: "🌿", desc: "路邊隨手可得。" },
    "weapon_iron": { name: "鐵劍", category: "equip", type: "hand", rarity: "blue", price: 200, atk: 10, hp: 0, emoji: "🗡️", desc: "標準武器。" },
    "weapon_poison_needle": { name: "毒針", category: "equip", type: "hand", rarity: "blue", price: 300, atk: 15, hp: 0, emoji: "💉", desc: "淬毒暗器。" },
    "weapon_bone_club": { name: "狼牙棒", category: "equip", type: "hand", rarity: "blue", price: 250, atk: 12, hp: 0, emoji: "🍖", desc: "插滿骨刺。" },
    "weapon_black_iron": { name: "黑鐵劍", category: "equip", type: "hand", rarity: "purple", price: 1200, atk: 35, hp: 0, emoji: "🗡️", desc: "沉重的黑劍。" },
    "weapon_dragon": { name: "龍鱗刀", category: "equip", type: "hand", rarity: "gold", price: 5000, atk: 80, hp: 20, emoji: "🐉", desc: "黑蛟鱗片打造。" },
    "weapon_xuanyuan": { name: "軒轅劍", category: "equip", type: "hand", rarity: "red", price: 0, atk: 500, hp: 500, emoji: "⚔️", desc: "上古神器。(唯一)" },
    "head_001":   { name: "草帽", category: "equip", type: "head", rarity: "gray", price: 20, atk: 0, hp: 1, emoji: "👒", desc: "遮陽。" },
    "head_iron":  { name: "鐵頭盔", category: "equip", type: "head", rarity: "blue", price: 150, atk: 0, hp: 10, emoji: "🪖", desc: "保護頭部。" },
    "head_ghost": { name: "鬼面具", category: "equip", type: "head", rarity: "purple", price: 1000, atk: 10, hp: 10, emoji: "👺", desc: "宛如惡鬼。" },
    "head_lion":  { name: "獅王盔", category: "equip", type: "head", rarity: "purple", price: 2000, atk: 5, hp: 30, emoji: "🦁", desc: "威風凜凜。" },
    "body_001":   { name: "蓑衣", category: "equip", type: "body", rarity: "gray", price: 30, atk: 0, hp: 1, emoji: "🧥", desc: "透氣。" },
    "body_iron":  { name: "鐵甲", category: "equip", type: "body", rarity: "blue", price: 300, atk: 0, hp: 20, emoji: "🛡️", desc: "防禦不錯。" },
    "body_cloak": { name: "隱身披風", category: "equip", type: "body", rarity: "purple", price: 1000, atk: 0, hp: 5, emoji: "🧛", desc: "融入夜色。" },
    "body_gold_armor": { name: "金剛甲", category: "equip", type: "body", rarity: "gold", price: 8000, atk: 0, hp: 50, emoji: "🔱", desc: "堅不可摧。" },
    "feet_001":   { name: "草鞋", category: "equip", type: "feet", rarity: "gray", price: 15, atk: 0, hp: 1, emoji: "👡", desc: "沙沙作響。" },
    "feet_iron":  { name: "鐵靴", category: "equip", type: "feet", rarity: "blue", price: 150, atk: 0, hp: 5, emoji: "👢", desc: "有點重。" },
    "feet_wind":  { name: "疾風靴", category: "equip", type: "feet", rarity: "purple", price: 1500, atk: 2, hp: 10, emoji: "🍃", desc: "身輕如燕。" },
    "feet_cloud": { name: "踏雲履", category: "equip", type: "feet", rarity: "gold", price: 3000, atk: 5, hp: 20, emoji: "☁️", desc: "步履生雲。" },
    "acc_poison": { name: "萬毒蠱", category: "equip", type: "acc", rarity: "purple", price: 1500, atk: 10, hp: 0, emoji: "🦂", desc: "五毒俱全。" },
    "acc_blood_beads": { name: "染血念珠", category: "equip", type: "acc", rarity: "blue", price: 800, atk: 5, hp: 5, emoji: "📿", desc: "沾滿鮮血。" },
    "acc_jade": { name: "青玉佩", category: "equip", type: "acc", rarity: "blue", price: 600, atk: 0, hp: 15, emoji: "🟢", desc: "溫潤凝神。" },
    "acc_mirror": { name: "靈視鏡", category: "equip", type: "acc", rarity: "gold", price: 4000, atk: 20, hp: 20, emoji: "🧿", desc: "看穿一切虛妄。" },
    "pill_001":   { name: "補氣丸", category: "use", type: "use", rarity: "gray", price: 20, emoji: "💊", desc: "HP +20。", useFunc: (p) => { p.hp += 20; return "HP +20"; } },
    "pill_mp":    { name: "回氣散", category: "use", type: "use", rarity: "gray", price: 20, emoji: "🧂", desc: "MP +20。", useFunc: (p) => { p.mp += 20; return "MP +20"; } },
    "pill_exp":   { name: "大還丹", category: "use", type: "use", rarity: "gold", price: 2000, emoji: "🟠", desc: "修為 +50。", useFunc: (p) => { let t = (p.location==='tower')?p.devil:p.immortal; t.exp+=50; return "修為 +50"; } },
    "pill_antidote": { name: "解毒丹", category: "use", type: "use", rarity: "blue", price: 50, emoji: "🍵", desc: "解除中毒(未實裝)。", useFunc: (p) => { return "解毒成功"; } },
    "herb_heal":  { name: "止血草", category: "use", type: "use", rarity: "gray", price: 5, emoji: "🌿", desc: "HP +10。", useFunc: (p) => { p.hp += 10; return "HP +10"; } },
    "mat_iron":   { name: "鐵礦", category: "material", type: "material", rarity: "gray", price: 10, emoji: "🪨", desc: "鍛造基礎。" },
    "mat_bristle":{ name: "堅硬鬃毛", category: "material", type: "material", rarity: "blue", price: 50, emoji: "🖌️", desc: "野豬硬毛。" },
    "mat_poison": { name: "毒囊", category: "material", type: "material", rarity: "blue", price: 60, emoji: "🤢", desc: "充滿毒液。" },
    "mat_slime": { name: "黏液", category: "material", type: "material", rarity: "gray", price: 5, emoji: "🧪", desc: "黏糊糊。" },
    "mat_tooth": { name: "鼠牙", category: "material", type: "material", rarity: "gray", price: 8, emoji: "🦷", desc: "尖銳。" },
    "mat_venom": { name: "毒囊", category: "material", type: "material", rarity: "blue", price: 50, emoji: "🤢", desc: "充滿毒液。" },
    "mat_wing": { name: "蝙蝠翼", category: "material", type: "material", rarity: "gray", price: 15, emoji: "👿", desc: "薄而堅韌。" },
    "mat_soul": { name: "魂魄碎片", category: "material", type: "material", rarity: "blue", price: 80, emoji: "⚪", desc: "散發寒氣。" },
    "mat_bone": { name: "碎骨", category: "material", type: "material", rarity: "gray", price: 10, emoji: "🦴", desc: "充滿鈣質。" },
    "mat_mud": { name: "汙泥塊", category: "material", type: "material", rarity: "gray", price: 5, emoji: "🟤", desc: "惡臭難聞。" },
    "mat_web": { name: "蜘蛛絲", category: "material", type: "material", rarity: "gray", price: 20, emoji: "🕸️", desc: "極強韌。" },
    "mat_cloth": { name: "道袍布料", category: "material", type: "material", rarity: "gray", price: 20, emoji: "👘", desc: "帶有皂角香。" },
    "mat_peach": { name: "靈桃核", category: "material", type: "material", rarity: "blue", price: 50, emoji: "🍑", desc: "蘊含靈氣。" },
    "mat_feather": { name: "仙鶴羽", category: "material", type: "material", rarity: "blue", price: 60, emoji: "🪶", desc: "潔白無瑕。" },
    "mat_ginseng": { name: "人參鬚", category: "material", type: "material", rarity: "purple", price: 300, emoji: "🥕", desc: "大補之物。" },
    "mat_sand": { name: "金剛砂", category: "material", type: "material", rarity: "purple", price: 400, emoji: "⏳", desc: "金光閃閃。" },
    "mat_god_iron": { name: "神鐵塊", category: "material", type: "material", rarity: "gold", price: 1000, emoji: "🧱", desc: "極重金屬。" },
    "sp_frag":    { name: "神秘碎片", category: "special", type: "special", rarity: "gold", price: 500, emoji: "🧩", desc: "不知用途。" },
    "mat_dragon_scale": { name: "黑蛟鱗", category: "material", type: "material", rarity: "gold", price: 2000, emoji: "🛡️", desc: "堅不可摧。" },
    "mat_ice": { name: "萬年冰晶", category: "material", type: "material", rarity: "purple", price: 800, emoji: "❄️", desc: "永不融化。" },
    "mat_tiger_bone": { name: "虎骨", category: "material", type: "material", rarity: "blue", price: 100, emoji: "🍖", desc: "強身健體。" },
    "mat_oil": { name: "屍油", category: "material", type: "material", rarity: "gray", price: 20, emoji: "🧴", desc: "噁心液體。" },
    "mat_flower": { name: "妖花蜜", category: "material", type: "material", rarity: "blue", price: 80, emoji: "🍯", desc: "致幻。" },
    "mat_heart": { name: "石之心", category: "material", type: "material", rarity: "blue", price: 100, emoji: "🪨", desc: "跳動石頭。" },
    "mat_sword_frag": { name: "斷劍碎片", category: "material", type: "material", rarity: "gray", price: 10, emoji: "🗡️", desc: "生鏽劍片。" },
    "mat_fox_fur": { name: "妖狐毛", category: "material", type: "material", rarity: "purple", price: 500, emoji: "🧣", desc: "柔軟順滑。" },
    "mat_horn": { name: "火牛角", category: "material", type: "material", rarity: "purple", price: 600, emoji: "🔥", desc: "燙手。" },
    "mat_black_feather": { name: "厄運羽毛", category: "material", type: "material", rarity: "blue", price: 50, emoji: "🪶", desc: "漆黑如墨。" },
    "mat_fork": { name: "夜叉鋼叉", category: "material", type: "material", rarity: "blue", price: 200, emoji: "🔱", desc: "縮小武器。" },
    "mat_blood_orb": { name: "修羅血珠", category: "material", type: "material", rarity: "purple", price: 800, emoji: "🔴", desc: "凝結殺氣。" },
    "mat_token": { name: "鬼王令", category: "material", type: "material", rarity: "gold", price: 1500, emoji: "🎫", desc: "號令群鬼。" },
    "mat_fang": { name: "吞噬之牙", category: "material", type: "material", rarity: "gold", price: 1200, emoji: "🦷", desc: "咬碎虛空。" },
    "mat_chaos": { name: "混沌氣團", category: "material", type: "material", rarity: "gold", price: 2000, emoji: "☁️", desc: "模糊氣體。" },
    "mat_sword_will": { name: "劍意帖", category: "material", type: "material", rarity: "purple", price: 400, emoji: "📜", desc: "凌厲劍意。" },
    "mat_beads": { name: "念珠", category: "material", type: "material", rarity: "blue", price: 50, emoji: "📿", desc: "木珠子。" },
    "mat_cloud": { name: "雲棉", category: "material", type: "material", rarity: "gray", price: 30, emoji: "🍬", desc: "像棉花糖。" },
    "mat_antler": { name: "鹿茸", category: "material", type: "material", rarity: "purple", price: 500, emoji: "🌿", desc: "珍貴藥材。" },
    "mat_string": { name: "仙樂琴弦", category: "material", type: "material", rarity: "purple", price: 600, emoji: "🧵", desc: "不會斷。" },
    "mat_fire": { name: "三昧真火", category: "material", type: "material", rarity: "purple", price: 800, emoji: "🔥", desc: "永不熄滅。" },
    "mat_ink": { name: "千年墨", category: "material", type: "material", rarity: "blue", price: 100, emoji: "⬛", desc: "書香氣息。" },
    "mat_lotus": { name: "蓮子", category: "material", type: "material", rarity: "blue", price: 80, emoji: "🥜", desc: "清心寡慾。" },
    "mat_kirin": { name: "麒麟鱗片", category: "material", type: "material", rarity: "gold", price: 1500, emoji: "🔶", desc: "溫暖如玉。" },
    "mat_armor_frag": { name: "天兵甲片", category: "material", type: "material", rarity: "blue", price: 200, emoji: "📀", desc: "金色碎片。" },
    "mat_dragon_whisker": { name: "青龍鬚", category: "material", type: "material", rarity: "gold", price: 2000, emoji: "🎋", desc: "蘊含生機。" },
    "mat_phoenix_feather": { name: "鳳凰羽", category: "material", type: "material", rarity: "gold", price: 2000, emoji: "🪶", desc: "燃燒火焰。" },
    "mat_tiger_tooth": { name: "白虎牙", category: "material", type: "material", rarity: "gold", price: 2000, emoji: "🦷", desc: "殺伐之氣。" },
    "mat_turtle_shell": { name: "玄武甲", category: "material", type: "material", rarity: "gold", price: 2000, emoji: "🛡️", desc: "最硬防禦。" },
    "mat_mirror": { name: "心魔鏡片", category: "material", type: "material", rarity: "gold", price: 1200, emoji: "🪞", desc: "映照恐懼。" },
    "mat_thunder_wood": { name: "雷擊木", category: "material", type: "material", rarity: "gold", price: 1500, emoji: "🪵", desc: "被天雷劈過。" },
    "mat_wind_orb": { name: "定風珠", category: "material", type: "material", rarity: "gold", price: 1800, emoji: "🔮", desc: "平息風暴。" },
    "mat_star_sand": { name: "星辰砂", category: "material", type: "material", rarity: "gold", price: 2500, emoji: "✨", desc: "閃爍星光。" },
    "mat_primordial": { name: "鴻蒙紫氣", category: "material", type: "material", rarity: "red", price: 0, emoji: "🟣", desc: "天地初開。" },
    "mat_demon_blood": { name: "魔神之血", category: "material", type: "material", rarity: "red", price: 0, emoji: "🩸", desc: "無上魔力。" }
};

const recipeDB = [
    { id: "r_poison_needle", name: "毒針", resultId: "weapon_poison_needle", rumor: "「聽說有人用【堅硬鬃毛】沾了【毒囊】毒汁，做成毒針！」", materials: { "mat_bristle": 1, "mat_venom": 1 }, desc: "劇毒暗器。" },
    { id: "r_bone_club", name: "狼牙棒", resultId: "weapon_bone_club", rumor: "「把【碎骨】插在【樹枝】上，威力竟然不錯？」", materials: { "weapon_001": 1, "mat_bone": 3 }, desc: "簡易但殘忍的武器。" },
    { id: "r_cloak", name: "隱身披風", resultId: "body_cloak", rumor: "「用【蜘蛛絲】和【蝙蝠翼】織成的披風，據說能隱形。」", materials: { "mat_web": 2, "mat_wing": 2 }, desc: "潛行的好幫手。" },
    { id: "r_exp_pill", name: "大還丹", resultId: "pill_exp", rumor: "「【人參鬚】配上【靈桃核】，是煉製大還丹的秘方。」", materials: { "mat_ginseng": 2, "mat_peach": 1 }, desc: "提升修為的聖藥。" },
    { id: "r_god_armor", name: "金剛甲", resultId: "body_gold_armor", rumor: "「【神鐵塊】加上【金剛砂】，凡火難融，需心火鍛造。」", materials: { "mat_god_iron": 1, "mat_sand": 5 }, desc: "傳說中的防具。" },
    { id: "r_poison_acc", name: "萬毒蠱", resultId: "acc_poison", rumor: "「集齊【毒囊】、【蜘蛛絲】和【黏液】，可煉萬毒蠱。」", materials: { "mat_venom": 1, "mat_web": 1, "mat_slime": 1 }, desc: "劇毒飾品。" },
    { id: "r_dragon_sword", name: "龍鱗刀", resultId: "weapon_dragon", rumor: "「若得【黑蛟鱗】與【神鐵塊】，可鑄屠龍寶刀。」", materials: { "mat_dragon_scale": 1, "mat_god_iron": 2 }, desc: "寶刀。" },
    { id: "r_lion_helm", name: "獅王盔", resultId: "head_lion", rumor: "「以【虎骨】為架，【鐵礦】為甲，可鑄獅王盔。」", materials: { "mat_tiger_bone": 1, "mat_iron": 2 }, desc: "虎骨打造。" },
    { id: "r_wind_boots", name: "疾風靴", resultId: "feet_wind", rumor: "「【仙鶴羽】輕盈，【道袍布料】透氣，可製疾風靴。」", materials: { "mat_feather": 2, "mat_cloth": 1 }, desc: "身輕如燕。" },
    { id: "r_mirror", name: "靈視鏡", resultId: "acc_mirror", rumor: "「【萬年冰晶】打磨成鏡，鑲嵌於【鐵礦】之上，可見真理。」", materials: { "mat_ice": 1, "mat_iron": 1 }, desc: "看穿虛妄。" },
    { id: "r_xuanyuan", name: "軒轅劍", resultId: "weapon_xuanyuan", rumor: "「...」", materials: { "mat_sword_frag": 1, "mat_primordial": 1, "mat_demon_blood": 1 }, desc: "上古神器。" }
];

const eventDB = {
    town: [
        { id: "ev_thief", title: "抓小偷", emoji: "🏃", text: "你看到捕快正在追趕一名小偷！", options: [ { text: "絆倒小偷 (善+5)", effect: () => { player.karma += 5; addToLog("你伸腿絆倒了小偷，捕快向你致謝。"); } }, { text: "無視", effect: () => { addToLog("你假裝沒看見，繼續逛街。"); } } ]},
        { id: "ev_beggar", title: "老乞丐", emoji: "🥣", text: "路邊一個老乞丐向你乞討。", options: [ { text: "施捨 10 靈石 (善+2)", effect: () => { if(player.money>=10){player.money-=10; player.karma+=2; addToLog("你施捨了乞丐。");} else {addToLog("你沒錢施捨...");} } }, { text: "踢翻他的碗 (惡+5)", effect: () => { player.karma -= 5; addToLog("你踢翻了乞丐的碗，惡霸！"); } } ]}
    ],
    tower: [
        { id: "ev_corpse", title: "無名屍骸", emoji: "💀", text: "角落裡有一具冒險者的屍骸...", options: [ { text: "搜身 (獲得物品)", effect: () => { findItem("tower_loot"); } }, { text: "安葬 (善+5)", effect: () => { player.karma += 5; addToLog("你安葬了死者，心中感到平靜。"); } } ]},
        { id: "ev_altar", title: "染血祭壇", emoji: "🩸", text: "一座散發著邪氣的祭壇。", options: [ { text: "破壞 (獲得素材)", effect: () => { addToBag("mat_soul", 1); addToLog("你破壞了祭壇，撿到魂魄碎片。"); } }, { text: "獻祭 20 血 (魔修+20)", effect: () => { if(player.hp>20){player.hp-=20; player.devil.exp+=20; addToLog("你獻祭了鮮血，魔功精進。");} else {addToLog("血量不足！");} } } ]}
    ],
    emei: [
        { id: "ev_herb", title: "靈藥圃", emoji: "🌿", text: "發現一片無人看管的藥圃。", options: [ { text: "採摘 (獲得藥材)", effect: () => { findItem("emei_loot"); } }, { text: "離開", effect: () => { addToLog("你沒有打擾這片淨土。"); } } ]},
        { id: "ev_chess", title: "殘局", emoji: "♟️", text: "石桌上擺著一副無人下的棋局。", options: [ { text: "嘗試破解 (精-10, 仙修+30)", effect: () => { if(player.mp>=10){player.mp-=10; player.immortal.exp+=30; addToLog("你破解了殘局，對天道有所感悟。");} else {addToLog("精神不足。");} } }, { text: "離開", effect: () => { addToLog("你看不懂，轉身離開。"); } } ]}
    ]
};

const enemiesTower = [
    { id: "e01", name: "史萊姆", emoji: "💧", hp: 30, atk: 5, drop: "mat_slime", exp: 5 },
    { id: "e02", name: "鐵齒鼠", emoji: "🐀", hp: 50, atk: 8, drop: "mat_tooth", exp: 8 },
    { id: "e03", name: "青竹蛇", emoji: "🐍", hp: 70, atk: 12, drop: "mat_venom", exp: 12 },
    { id: "e04", name: "吸血蝠", emoji: "🦇", hp: 90, atk: 15, drop: "mat_wing", exp: 15 },
    { id: "e05", name: "野豬王", emoji: "🐗", hp: 150, atk: 20, drop: "mat_bristle", exp: 25 },
    { id: "e06", name: "孤魂", emoji: "👻", hp: 120, atk: 25, drop: "mat_soul", exp: 30 },
    { id: "e07", name: "白骨卒", emoji: "💀", hp: 180, atk: 30, drop: "mat_bone", exp: 40 },
    { id: "e08", name: "泥人怪", emoji: "💩", hp: 250, atk: 20, drop: "mat_mud", exp: 45 },
    { id: "e09", name: "巨型蜘蛛", emoji: "🕷️", hp: 220, atk: 40, drop: "mat_web", exp: 60 },
    { id: "e10", name: "鐵屍", emoji: "🧟", hp: 400, atk: 50, drop: "mat_oil", exp: 80 },
    { id: "e11", name: "黑煞虎", emoji: "🐅", hp: 500, atk: 60, drop: "mat_tiger_bone", exp: 100 },
    { id: "e12", name: "食人花", emoji: "🥀", hp: 450, atk: 55, drop: "mat_flower", exp: 90 },
    { id: "e13", name: "石像鬼", emoji: "🗿", hp: 600, atk: 45, drop: "mat_heart", exp: 110 },
    { id: "e14", name: "墮落散修", emoji: "👺", hp: 550, atk: 70, drop: "mat_sword_frag", exp: 120 },
    { id: "e15", name: "三尾妖狐", emoji: "🦊", hp: 500, atk: 80, drop: "mat_fox_fur", exp: 130 },
    { id: "e16", name: "獄火牛", emoji: "🐂", hp: 800, atk: 90, drop: "mat_horn", exp: 150 },
    { id: "e17", name: "陰鴉", emoji: "🐦‍⬛", hp: 400, atk: 100, drop: "mat_black_feather", exp: 140 },
    { id: "e18", name: "冰魄", emoji: "🧊", hp: 700, atk: 85, drop: "mat_ice", exp: 160 },
    { id: "e19", name: "飛天夜叉", emoji: "🧛", hp: 900, atk: 110, drop: "mat_fork", exp: 180 },
    { id: "e20", name: "血修羅", emoji: "👹", hp: 1200, atk: 130, drop: "mat_blood_orb", exp: 200 },
    { id: "e21", name: "黑蛟", emoji: "🐉", hp: 1500, atk: 150, drop: "mat_dragon_scale", exp: 250 },
    { id: "e22", name: "鬼王", emoji: "🤴", hp: 2000, atk: 180, drop: "mat_token", exp: 300 },
    { id: "e23", name: "饕餮", emoji: "🦁", hp: 3000, atk: 200, drop: "mat_fang", exp: 400 },
    { id: "e24", name: "混沌魔影", emoji: "👤", hp: 4000, atk: 250, drop: "mat_chaos", exp: 500 },
    { id: "e25", name: "魔尊化身", emoji: "😈", hp: 5000, atk: 300, drop: "mat_demon_blood", exp: 1000 }
];

const enemiesEmei = [
    { id: "g01", name: "守山道童", emoji: "🧒", hp: 40, atk: 4, drop: "mat_cloth", exp: 6 },
    { id: "g02", name: "偷桃靈猴", emoji: "🐒", hp: 60, atk: 7, drop: "mat_peach", exp: 10 },
    { id: "g03", name: "白鶴仙子", emoji: "🦢", hp: 80, atk: 10, drop: "mat_feather", exp: 15 },
    { id: "g04", name: "人參娃娃", emoji: "🥕", hp: 150, atk: 5, drop: "mat_ginseng", exp: 30 },
    { id: "g05", name: "劍靈", emoji: "🗡️", hp: 120, atk: 30, drop: "mat_sword_will", exp: 40 },
    { id: "g06", name: "苦行僧", emoji: "🧘", hp: 200, atk: 20, drop: "mat_beads", exp: 50 },
    { id: "g07", name: "雲精", emoji: "☁️", hp: 100, atk: 15, drop: "mat_cloud", exp: 35 },
    { id: "g08", name: "九色鹿", emoji: "🦌", hp: 300, atk: 25, drop: "mat_antler", exp: 70 },
    { id: "g09", name: "護法金剛", emoji: "🏋️", hp: 500, atk: 50, drop: "mat_sand", exp: 100 },
    { id: "g10", name: "玉琵琶", emoji: "🎸", hp: 400, atk: 60, drop: "mat_string", exp: 90 },
    { id: "g11", name: "丹爐之靈", emoji: "♨️", hp: 450, atk: 70, drop: "mat_fire", exp: 110 },
    { id: "g12", name: "墨仙", emoji: "🖌️", hp: 550, atk: 55, drop: "mat_ink", exp: 120 },
    { id: "g13", name: "蓮花仙子", emoji: "🌺", hp: 500, atk: 65, drop: "mat_lotus", exp: 130 },
    { id: "g14", name: "麒麟幻影", emoji: "🦄", hp: 800, atk: 80, drop: "mat_kirin", exp: 150 },
    { id: "g15", name: "金甲天兵", emoji: "👮", hp: 900, atk: 90, drop: "mat_armor_frag", exp: 160 },
    { id: "g16", name: "巨靈神將", emoji: "🔨", hp: 1000, atk: 100, drop: "mat_god_iron", exp: 180 },
    { id: "g17", name: "青龍之影", emoji: "🐉", hp: 1500, atk: 120, drop: "mat_dragon_whisker", exp: 200 },
    { id: "g18", name: "朱雀之影", emoji: "🦅", hp: 1400, atk: 130, drop: "mat_phoenix_feather", exp: 210 },
    { id: "g19", name: "白虎之影", emoji: "🐯", hp: 1600, atk: 140, drop: "mat_tiger_tooth", exp: 220 },
    { id: "g20", name: "玄武之影", emoji: "🐢", hp: 2000, atk: 100, drop: "mat_turtle_shell", exp: 230 },
    { id: "g21", name: "心魔", emoji: "👺", hp: 1800, atk: 150, drop: "mat_mirror", exp: 250 },
    { id: "g22", name: "雷公", emoji: "⚡", hp: 2200, atk: 180, drop: "mat_thunder_wood", exp: 300 },
    { id: "g23", name: "風伯", emoji: "💨", hp: 2100, atk: 170, drop: "mat_wind_orb", exp: 290 },
    { id: "g24", name: "星君", emoji: "🌟", hp: 2500, atk: 200, drop: "mat_star_sand", exp: 400 },
    { id: "g25", name: "峨眉老祖", emoji: "👴", hp: 5000, atk: 300, drop: "mat_primordial", exp: 1000 }
];

const achievementDB = [
    { id: "ach_first_blood", name: "初入江湖", desc: "第一次戰鬥勝利", condition: (p) => true },
    { id: "ach_rich", name: "腰纏萬貫", desc: "擁有 1000 靈石", condition: (p) => p.money >= 1000 },
    { id: "ach_karma_good", name: "大善人", desc: "善惡值達到 100", condition: (p) => p.karma >= 100 },
    { id: "ach_karma_evil", name: "大魔頭", desc: "善惡值達到 -100", condition: (p) => p.karma <= -100 },
    { id: "ach_floor_10", name: "初窺門徑", desc: "到達第 10 層", condition: (p) => p.maxFloor >= 10 },
    { id: "ach_floor_50", name: "登堂入室", desc: "到達第 50 層", condition: (p) => p.maxFloor >= 50 },
    { id: "ach_floor_100", name: "登峰造極", desc: "到達第 100 層", condition: (p) => p.maxFloor >= 100 },
    { id: "ach_kill_boss", name: "弒神者", desc: "擊敗任意塔主", condition: (p) => p.killedEmeiBoss || p.killedTowerBoss },
    { id: "ach_full_equip", name: "全副武裝", desc: "全身穿滿裝備", condition: (p) => p.equipment.head && p.equipment.body && p.equipment.hand && p.equipment.feet && p.equipment.acc },
    { id: "ach_craft", name: "工匠精神", desc: "成功鍛造一次裝備", condition: (p) => true },
    { id: "ach_immortal_5", name: "仙道中人", desc: "修仙達到第 5 階", condition: (p) => p.immortal.tier >= 5 },
    { id: "ach_devil_5", name: "魔道巨擘", desc: "修魔達到第 5 階", condition: (p) => p.devil.tier >= 5 }
];

// ==========================================
// 4. 全域變數 (VARIABLES)
// ==========================================

let player = {
    hp: 100, baseMaxHp: 100, maxHp: 100,
    mp: 0, maxMp: 50,
    atk: 10,
    immortal: { exp: 0, max: 50, tier: 0, name: "煉氣期 (一階)" },
    devil: { exp: 0, max: 50, tier: 0, name: "煉體期 (一階)" },
    karma: 0, money: 0, rank: "凡人", job: "未定",
    year: 1, month: 1, location: "home", state: "normal",
    bag: [], 
    unlockedCollection: meta.col, 
    unlockedAchievements: meta.ach,
    equipment: { head: null, hand: null, body: null, acc: null, feet: null },
    recipes: [],
    floor: 1, maxFloor: 1, floorKills: 0,
    cultivateCount: 0, restCount: 0,
    killedEmeiBoss: false, killedTowerBoss: false, dreamTriggered: false,
    shopStock: []
};

let currentEnemy = { hp: 100, maxHp: 100, atk: 10, name: "敵人", drop: null, exp: 0 };
let currentBagTab = 'equip';
let currentColTab = 'hand';
let currentShopTab = 'buy';

// ==========================================
// 5. 核心功能 (CORE LOGIC)
// ==========================================

function findItem(poolType) {
    let pool = [];
    if (poolType === 'tower_loot') {
        pool = ["mat_bone", "mat_soul", "mat_mud", "weapon_black_iron", "head_ghost", "acc_blood_beads"];
    } else if (poolType === 'emei_loot') {
        pool = ["mat_peach", "mat_ginseng", "mat_cloud", "feet_cloud", "acc_jade"];
    }
    let itemId = pool[Math.floor(Math.random() * pool.length)];
    let item = itemDB[itemId];
    addToBag(itemId, 1);
    updateUI();
    addClass('event-modal');
    addToLog(`🎁 你獲得了：${item.emoji} ${item.name}`);
}

function triggerEvent(location) {
    let pool = [];
    if (location === 'town') pool = eventDB.town;
    else if (location === 'tower') pool = eventDB.tower;
    else if (location === 'emei') pool = eventDB.emei;
    
    if (!pool || pool.length === 0) return;
    
    let event = pool[Math.floor(Math.random() * pool.length)];
    
    getEl('event-title').innerText = event.title;
    getEl('event-emoji').innerText = event.emoji;
    getEl('event-desc').innerText = event.text;
    
    const optDiv = getEl('event-options');
    optDiv.innerHTML = "";
    
    event.options.forEach(opt => {
        let btn = document.createElement('button');
        btn.innerText = opt.text;
        btn.onclick = () => {
            opt.effect();
            addClass('event-modal');
            updateUI();
        };
        optDiv.appendChild(btn);
    });
    
    removeClass('event-modal');
}

function passTime() {
    let oldYear = player.year;
    player.month++;
    if (player.month > 12) {
        player.month = 1;
        player.year++;
        addToLog(`⏳ 第 ${player.year} 年到了。`);
    }
    if (player.year > oldYear) {
        generateShopStock();
        addToLog("🛒 城鎮交易所進了新貨。");
    }
    updateUI();
}

function addToBag(itemId, count = 1) {
    let itemDef = itemDB[itemId];
    if (!itemDef) return;

    if (!player.unlockedCollection.includes(itemId)) {
        player.unlockedCollection.push(itemId);
        saveMetaData();
    }

    if (itemDef.category === 'equip') {
        for(let i=0; i<count; i++) {
            if (itemDef.rarity === 'red') {
                let hasIt = player.bag.some(b => b.id === itemId) || Object.values(player.equipment).includes(itemId);
                if (hasIt) {
                    addToLog(`⚠️ 你已經擁有 ${itemDef.name}，無法再次獲得。`);
                    return;
                }
            }
            player.bag.push({ id: itemId, count: 1, uuid: Date.now() + Math.random() });
        }
    } else {
        let existingItem = player.bag.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.count += count;
        } else {
            player.bag.push({ id: itemId, count: count });
        }
    }
    checkAchievements();
}

function getBagCount(itemId) {
    let item = player.bag.find(i => i.id === itemId);
    return item ? item.count : 0;
}

function removeFromBag(itemId, count = 1, uuid = null) {
    if (uuid) {
        let index = player.bag.findIndex(i => i.uuid === uuid);
        if (index > -1) {
            player.bag.splice(index, 1);
            return true;
        }
    } else {
        let index = player.bag.findIndex(i => i.id === itemId);
        if (index > -1) {
            player.bag[index].count -= count;
            if (player.bag[index].count <= 0) {
                player.bag.splice(index, 1);
            }
            return true;
        }
    }
    return false;
}

function calculateStats() {
    let baseAtk = 10;
    if (player.job === '捕快') baseAtk += 5;
    if (player.job === '惡棍') baseAtk += 5;
    if (player.job === '羅剎') baseAtk += 30;

    let devilBonus = player.devil.tier * 2;
    let equipAtk = 0; let equipHp = 0;
    
    Object.keys(player.equipment).forEach(slot => {
        let itemId = player.equipment[slot];
        if (itemId) {
            let item = itemDB[itemId];
            if (item) {
                if (item.atk) equipAtk += item.atk;
                if (item.hp) equipHp += item.hp;
            }
        }
    });
    player.atk = baseAtk + devilBonus + equipAtk;
    player.maxHp = player.baseMaxHp + equipHp;
    player.maxMp = 50 + (player.immortal.tier * 20); 
}

function checkAchievements() {
    let changed = false;
    achievementDB.forEach(ach => {
        if (!player.unlockedAchievements.includes(ach.id)) {
            if (ach.condition(player)) {
                player.unlockedAchievements.push(ach.id);
                showToast("成就解鎖", ach.name);
                changed = true;
            }
        }
    });
    if(changed) saveMetaData();
}

// ==========================================
// 6. 遊戲流程 (GAMEPLAY)
// ==========================================

function enterJianghu() {
    playBlinkEffect(() => {
        addClass('scene-start');
        removeClass('scene-origin');
        
        player.money = 0; player.year = 1; player.month = 1;
        player.location = "home"; player.state = "normal";
        player.immortal = { exp: 0, max: 50, tier: 0, name: "煉氣 (一階)" };
        player.devil = { exp: 0, max: 50, tier: 0, name: "煉體 (一階)" };
        player.cultivateCount = 0; player.restCount = 0;
        player.recipes = []; 
        player.floor = 1; player.maxFloor = 1; player.floorKills = 0;
        player.killedEmeiBoss = false; player.killedTowerBoss = false; player.dreamTriggered = false;
        
        player.bag = []; 
        player.unlockedCollection = meta.col; 
        player.unlockedAchievements = meta.ach;
        player.equipment = { head: null, hand: null, body: null, acc: null, feet: null };
        
        addToBag("weapon_001", 1);
        addToBag("pill_001", 5);
        addToBag("herb_heal", 3);
        
        generateShopStock();

        let randomKarma = Math.floor((Math.random() - 0.5) * 200);
        player.karma = randomKarma;

        const bar = getEl('karma-fill');
        bar.style.transition = 'none'; bar.style.width = '0%'; bar.style.left = '50%';
        void bar.offsetWidth; 
        bar.style.transition = 'width 1.5s ease-out, left 1.5s ease-out, background-color 1.5s'; 
        setTimeout(() => animateKarmaBar(randomKarma), 100);
    });
}

function animateKarmaBar(value) {
    const bar = getEl('karma-fill');
    const desc = getEl('origin-desc'); 
    let widthPercent = Math.abs(value) / 2; 
    
    if (value >= 0) {
        bar.style.left = "50%"; bar.style.backgroundColor = "#3498db";
        desc.innerText = "浩然正氣湧入..."; desc.style.color = "#3498db";
    } else {
        bar.style.left = (50 - widthPercent) + "%"; bar.style.backgroundColor = "#e74c3c";
        desc.innerText = "狂暴煞氣湧入..."; desc.style.color = "#e74c3c";
    }
    bar.style.width = widthPercent + "%";
    getEl('origin-karma-val').innerText = value;
    setTimeout(() => showJobSelection(value), 1600);
}

function showJobSelection(karmaVal) {
    removeClass('job-selection');
    const jobOptionsDiv = getEl('job-options');
    
    let availableJobs = [];
    if (karmaVal >= 80) availableJobs = jobs.highGood;
    else if (karmaVal >= 40) availableJobs = jobs.midGood;
    else if (karmaVal <= -80) availableJobs = jobs.highEvil;
    else if (karmaVal <= -40) availableJobs = jobs.midEvil;
    else availableJobs = jobs.neutral;

    jobOptionsDiv.innerHTML = "";
    availableJobs.forEach(job => {
        let btn = document.createElement('button');
        btn.innerHTML = `${job.emoji} <b>${job.name}</b><br><small>${job.desc}</small>`;
        btn.onclick = () => startGame(job);
        jobOptionsDiv.appendChild(btn);
    });
}

function startGame(selectedJob) {
    playBlinkEffect(() => {
        player.job = selectedJob.name;
        player.baseMaxHp = 100 + selectedJob.hp; 
        player.hp = player.baseMaxHp;
        player.maxMp = 50 + selectedJob.mp; 
        player.mp = 0;
        if (selectedJob.money) player.money += selectedJob.money;
        
        addClass('scene-origin');
        removeClass('scene-game');
        getEl('log-content').innerHTML = '';
        
        travelTo('home');
    });
}

function updateUI() {
    getEl('year-val').innerText = player.year;
    getEl('month-val').innerText = player.month;
    getEl('money-val').innerText = player.money;
    
    updateKarmaUI();
    calculateStats(); 
    checkAchievements();

    getEl('atk-val').innerText = player.atk;

    if (player.hp > player.maxHp) player.hp = player.maxHp;
    if (player.hp < 0) player.hp = 0;
    if (player.mp > player.maxMp) player.mp = player.maxMp;

    getEl('hp-val').innerText = player.hp;
    getEl('max-hp-val').innerText = player.maxHp;
    getEl('hp-bar').style.width = (player.hp / player.maxHp * 100) + "%";

    getEl('mp-val').innerText = player.mp;
    getEl('max-mp-val').innerText = player.maxMp;
    getEl('mp-bar').style.width = (player.mp / player.maxMp * 100) + "%";
    
    let totalTier = player.immortal.tier + player.devil.tier;
    if (totalTier === 0) player.rank = "凡人";
    else player.rank = `修者 (共${totalTier}階)`;
    getEl('rank').innerText = player.rank;
    
    if (player.state === 'combat') {
        removeClass('enemy-status');
        getEl('enemy-name').innerText = currentEnemy.name;
        getEl('enemy-hp').innerText = currentEnemy.hp;
        getEl('enemy-max-hp').innerText = currentEnemy.maxHp;
    } else {
        addClass('enemy-status');
    }
    
    if (player.location === 'emei' || player.location === 'tower') {
        removeClass('tower-progress');
        getEl('floor-val').innerText = player.floor;
        getEl('max-floor-val').innerText = player.maxFloor;
        getEl('kill-val').innerText = player.floorKills;
        updateActionButtons(); 
    } else {
        addClass('tower-progress');
        updateActionButtons();
    }
}

function updateKarmaUI() {
    const kDisplay = getEl('karma-display');
    const val = player.karma;
    kDisplay.classList.remove('karma-good', 'karma-evil', 'karma-neutral');
    if (val > 10) { kDisplay.innerText = `${val} (善)`; kDisplay.classList.add('karma-good'); } 
    else if (val < -10) { kDisplay.innerText = `${val} (惡)`; kDisplay.classList.add('karma-evil'); } 
    else { kDisplay.innerText = `${val} (中立)`; kDisplay.classList.add('karma-neutral'); }
}

function cultivate(type) {
    if (player.job === '巨賈') { addToLog("🚫 巨賈：賺錢要緊，不修仙。"); return; }
    const cost = 5;
    if (player.mp < cost) { addToLog("❌ 【精】不足。"); return; }
    
    passTime();
    player.mp -= cost;
    player.cultivateCount++;

    let targetStats = (type === 'immortal') ? player.immortal : player.devil;
    let rankList = (type === 'immortal') ? immortalRanks : devilRanks;
    let typeName = (type === 'immortal') ? "仙道" : "魔道";
    let emoji = (type === 'immortal') ? "🧘" : "😈";

    let roll = Math.random() * 100;
    let gain = 0; let msg = "";
    if (roll > 99.5) { gain = 50; msg = "✨ 靈光一閃！(大成功 +50)"; }
    else if (roll > 90.0) { gain = Math.floor(Math.random()*(49-36+1))+36; msg = `🔥 狀態極佳！(+${gain})`; }
    else if (roll > 75.0) { gain = Math.floor(Math.random()*(35-21+1))+21; msg = `💪 頗有心得！(+${gain})`; }
    else if (roll > 54.0) { gain = Math.floor(Math.random()*(20-11+1))+11; msg = `👍 穩步精進。(+${gain})`; }
    else if (roll > 30.0) { gain = Math.floor(Math.random()*(10-6+1))+6; msg = `👌 略有所得。(+${gain})`; }
    else { gain = Math.floor(Math.random()*5)+1; msg = `💤 雜念叢生...(+${gain})`; }

    if (player.job === '僧人' && player.cultivateCount % 5 === 0) { gain *= 2; msg += " (僧人雙倍)"; }

    let multiplier = 1.0;
    if (player.karma > 10) { 
        if (type === 'immortal') multiplier = 1.2; 
        if (type === 'devil') multiplier = 0.7;    
    } else if (player.karma < -10) { 
        if (type === 'devil') multiplier = 1.2;    
        if (type === 'immortal') multiplier = 0.7; 
    }
    gain = Math.floor(gain * multiplier);
    if (multiplier !== 1.0) msg += (multiplier > 1) ? " [善惡加成]" : " [善惡排斥]";

    targetStats.exp += gain;

    if (targetStats.exp >= targetStats.max) {
        targetStats.exp = 0; targetStats.tier++; 
        if (targetStats.tier < 11) {
            targetStats.max = Math.floor(targetStats.max * 1.5);
            let rName = rankList[targetStats.tier];
            targetStats.name = `${rName} (第${targetStats.tier+1}階)`;
            updateMainDisplay("⚡", `恭喜！突破至【${rName}】！`);
        } else {
            targetStats.max = targetStats.max * 3;
            let godName = (type === 'immortal') ? "仙神" : "魔神";
            targetStats.name = `${godName} (終極)`;
            updateMainDisplay("🌟", `凡胎已褪！踏入【${godName}】之路！`);
        }
    } else {
        updateMainDisplay(emoji, `${msg}\n目前${typeName}: ${targetStats.exp}/${targetStats.max}`);
    }
    updateUI();
}

function startCombat() { 
    if (player.location === 'emei' || player.location === 'tower') {
        if (Math.random() < 0.1) {
            triggerEvent(player.location);
            return;
        }
    }

    player.state = "combat"; 
    
    let pool = [];
    let enemyIndex = 0;
    
    if (player.location === 'tower') {
        pool = enemiesTower;
    } else if (player.location === 'emei') {
        pool = enemiesEmei;
    } else {
        pool = [enemiesTower[0], enemiesTower[1]];
    }

    if (player.location === 'home' || player.location === 'town') {
        enemyIndex = 0;
    } else {
        if (player.floor >= 100) {
            enemyIndex = 24; 
            removeClass('boss-overlay');
        } else {
            enemyIndex = Math.floor((player.floor - 1) / 4);
            if (enemyIndex > 23) enemyIndex = 23;
        }
    }
    
    if (enemyIndex >= pool.length) enemyIndex = pool.length - 1;
    let baseEnemy = pool[enemyIndex];
    if (!baseEnemy) baseEnemy = enemiesTower[0]; 

    let scale = 1 + (player.floor * 0.1); 
    
    currentEnemy = { 
        ...baseEnemy, 
        hp: Math.floor(baseEnemy.hp * scale), 
        maxHp: Math.floor(baseEnemy.hp * scale),
        atk: Math.floor(baseEnemy.atk * scale)
    };
    
    updateMainDisplay("👹", `遭遇 ${currentEnemy.name} (Lv.${player.floor})！`); 
    updateActionButtons(); 
    updateUI();
}

function combatAttack() { 
    passTime(); 
    let dmg = player.atk + Math.floor(Math.random()*5); 
    
    currentEnemy.hp -= dmg;
    if (currentEnemy.hp < 0) currentEnemy.hp = 0;
    
    triggerShake('v');
    let logMsg = `⚔️ 你攻擊造成 ${dmg} 傷害！`;
    if (player.job === '蠱師' && Math.random() < 0.3) logMsg += " (中毒!)";

    if (currentEnemy.hp <= 0) {
        player.state = "normal";
        addClass('boss-overlay');

        let lootMoney = Math.floor(currentEnemy.exp * 1.5);
        player.money += lootMoney;
        
        if (player.floor === 100) {
            if (player.location === 'emei') player.killedEmeiBoss = true;
            if (player.location === 'tower') player.killedTowerBoss = true;
            checkAchievements();
        }

        if (player.location === 'tower' || player.location === 'emei') {
            player.floorKills++;
        }
        
        let dropMsg = "";
        if (currentEnemy.drop && Math.random() < 0.5) {
            addToBag(currentEnemy.drop, 1);
            let dropItem = itemDB[currentEnemy.drop];
            dropMsg = `\n🎁 獲得素材：${dropItem.emoji} ${dropItem.name}`;
        }

        updateMainDisplay("✌️", `${logMsg}\n戰勝了 ${currentEnemy.name}！\n獲得 ${lootMoney} 靈石。${dropMsg}`);
        updateActionButtons();
    } else {
        let enemyDmg = currentEnemy.atk + Math.floor(Math.random()*3);
        player.hp -= enemyDmg;
        triggerShake('h');
        updateMainDisplay("⚔️", `${logMsg}\n${currentEnemy.name} 反擊造成 ${enemyDmg} 傷害！`);
        checkDeath();
    }
    updateUI(); 
}

function combatBribe() {
    passTime();
    let bribeCost = 50 * player.floor; 
    if (player.money >= bribeCost) {
        player.money -= bribeCost;
        player.state = "normal";
        addClass('boss-overlay');
        updateMainDisplay("🤝", `你花了 ${bribeCost} 靈石打發了敵人。`);
        updateActionButtons();
    } else {
        addToLog("💸 錢不夠！");
        let enemyDmg = 10;
        player.hp -= enemyDmg;
        triggerShake('h');
        updateMainDisplay("💢", "賄賂失敗，被打了一頓！");
        updateUI();
    }
}

function combatFlee() { 
    player.state = "normal"; 
    addClass('boss-overlay');
    updateMainDisplay("💨", "逃跑成功！"); 
    updateActionButtons(); 
}

function climbTower() {
    if (player.floorKills >= 5) {
        player.floor++;
        if (player.floor > player.maxFloor) player.maxFloor = player.floor;
        player.floorKills = 0;
        playBlinkEffect(() => {
            updateMainDisplay("🧗", `你攀登到了第 ${player.floor} 層！`);
            updateActionButtons();
            updateUI();
        });
    } else {
        alert("必須擊敗 5 隻當前層數的敵人才能前往下一層！");
    }
}

function confirmFloor() {
    let val = parseInt(getEl('floor-input').value);
    if (val >= 1 && val <= player.maxFloor) {
        player.floor = val;
        player.floorKills = 0; 
        closeFloorSelector();
        updateMainDisplay("🪜", `你來到了第 ${player.floor} 層。`);
        updateUI();
    } else {
        alert("無效的層數！");
    }
}

function generateShopStock() {
    player.shopStock = [];
    let count = Math.floor(Math.random() * 4) + 5;
    let keys = Object.keys(itemDB).filter(k => itemDB[k].rarity !== 'red' && itemDB[k].price > 0 && itemDB[k].category !== 'special');
    
    for(let i=0; i<count; i++) {
        let randId = keys[Math.floor(Math.random() * keys.length)];
        let item = itemDB[randId];
        let roll = Math.random();
        let pass = false;
        if (item.rarity === 'gray') pass = true;
        else if (item.rarity === 'blue' && roll < 0.5) pass = true;
        else if (item.rarity === 'purple' && roll < 0.2) pass = true;
        else if (item.rarity === 'gold' && roll < 0.05) pass = true;
        
        if (pass) player.shopStock.push(randId);
    }
}

function switchShopTab(tab, btn) {
    currentShopTab = tab;
    document.querySelectorAll('#shop-modal .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderShopGrid();
}

function renderShopGrid() {
    const grid = getEl('shop-grid');
    grid.innerHTML = "";
    getEl('shop-money').innerText = `持有: ${player.money} 靈石`;

    if (currentShopTab === 'buy') {
        player.shopStock.forEach(itemId => {
            let item = itemDB[itemId];
            let div = document.createElement('div');
            div.className = `grid-item q-${item.rarity}`;
            div.innerHTML = `${item.emoji}<span class="item-count">${item.price}G</span>`;
            div.onclick = () => showItemDetail(itemId, null, 'shop_buy');
            grid.appendChild(div);
        });
    } else {
        player.bag.forEach(bagItem => {
            let item = itemDB[bagItem.id];
            if (item && item.rarity !== 'red' && item.category !== 'special') {
                let div = document.createElement('div');
                div.className = `grid-item q-${item.rarity}`;
                div.innerHTML = `${item.emoji}<span class="item-count">x${bagItem.count}</span>`;
                div.onclick = () => showItemDetail(bagItem.id, bagItem.uuid, 'shop_sell');
                grid.appendChild(div);
            }
        });
    }
}

function buyItem(itemId) {
    let item = itemDB[itemId];
    if (player.money >= item.price) {
        player.money -= item.price;
        addToBag(itemId, 1);
        updateUI();
        closeItemDetail();
        renderShopGrid(); 
        alert(`購買了 ${item.name}！`);
    } else {
        alert("靈石不足！");
    }
}

function sellItem(itemId, uuid, price) {
    removeFromBag(itemId, 1, uuid);
    player.money += price;
    updateUI();
    closeItemDetail();
    renderShopGrid(); 
    alert(`出售了 ${itemDB[itemId].name}，獲得 ${price} 靈石。`);
}

function switchBagTab(tab, btn) { 
    currentBagTab = tab; 
    document.querySelectorAll('#bag-modal .tab-btn').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active'); 
    renderBagGrid(); 
}

function renderBagGrid() {
    const grid = getEl('bag-grid'); grid.innerHTML = "";
    player.bag.forEach((bagItem) => {
        let item = itemDB[bagItem.id];
        if (item && item.category === currentBagTab) {
            let div = document.createElement('div'); 
            div.className = `grid-item q-${item.rarity || 'gray'}`; 
            let countHtml = (item.category === 'equip') ? '' : `<span class="item-count">x${bagItem.count}</span>`;
            div.innerHTML = `${item.emoji}${countHtml}`;
            div.onclick = () => showItemDetail(bagItem.id, bagItem.uuid || null, "bag"); 
            grid.appendChild(div);
        }
    });
}

function switchColTab(tab, btn) { 
    currentColTab = tab; 
    document.querySelectorAll('#collection-modal .tab-btn').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active'); 
    renderCollectionGrid(); 
}

function renderCollectionGrid() {
    const grid = getEl('collection-grid'); grid.innerHTML = "";
    Object.keys(itemDB).forEach(key => { 
        let item = itemDB[key];
        let show = false;
        if (item.category === 'equip' && item.type === currentColTab) show = true;
        else if (item.category === currentColTab) show = true;
        if (item.category === 'special' && currentColTab === 'special') show = true;
        if (show) {
            let isUnlocked = player.unlockedCollection.includes(key);
            let div = document.createElement('div'); 
            div.className = isUnlocked ? `grid-item q-${item.rarity || 'gray'}` : "grid-item locked"; 
            div.innerText = isUnlocked ? item.emoji : "🔒";
            if (isUnlocked) div.onclick = () => alert(`【${item.name}】\n${item.desc}`); 
            grid.appendChild(div);
        }
    });
}

function showItemDetail(itemId, uuid, source) {
    let item = itemDB[itemId];
    getEl('item-name').innerText = `${item.emoji} ${item.name}`;
    getEl('item-desc').innerText = item.desc;
    let statsText = ""; 
    if (item.atk) statsText += `攻+${item.atk} `; 
    if (item.hp) statsText += `血+${item.hp} `;
    if (item.useFunc) statsText = "可使用";
    getEl('item-stats').innerText = statsText || "無屬性";
    
    let priceDisplay = getEl('item-price');
    priceDisplay.innerText = "";

    const btn = getEl('btn-item-action');
    btn.onclick = null; 

    if (source === "equipped") { 
        btn.innerText = "卸下"; 
        btn.style.backgroundColor = "#c0392b"; 
        btn.onclick = () => unequipItem(item.type); 
    } 
    else if (source === "selector") { 
        btn.innerText = "裝備"; 
        btn.style.backgroundColor = "#27ae60"; 
        btn.onclick = () => equipFromSelector(itemId, uuid); 
    } 
    else if (source === "bag") {
        let val = Math.floor(item.price / 2);
        priceDisplay.innerText = `販賣價值: ${val}`;
        
        if (item.category === 'use') { 
            btn.innerText = "使用"; 
            btn.style.backgroundColor = "#2980b9"; 
            btn.onclick = () => useItem(itemId); 
        } else if (item.category === 'equip') { 
            btn.innerText = "請至裝備欄穿戴"; 
            btn.style.backgroundColor = "#555"; 
        } else { 
            btn.innerText = "不可使用"; 
            btn.style.backgroundColor = "#555"; 
        }
    }
    else if (source === "shop_buy") {
        priceDisplay.innerText = `價格: ${item.price}`;
        btn.innerText = "購買";
        btn.style.backgroundColor = "#e67e22";
        btn.onclick = () => buyItem(itemId);
    }
    else if (source === "shop_sell") {
        let val = Math.floor(item.price / 2);
        priceDisplay.innerText = `販賣價格: ${val}`;
        btn.innerText = "販賣";
        btn.style.backgroundColor = "#c0392b";
        btn.onclick = () => sellItem(itemId, uuid, val);
    }

    removeClass('item-detail-modal');
}

function useItem(itemId) {
    let item = itemDB[itemId];
    if (item.useFunc) {
        let msg = item.useFunc(player);
        removeFromBag(itemId, 1);
        updateUI(); closeItemDetail(); 
        renderBagGrid(); 
        alert(`使用了 ${item.name}：${msg}`);
    }
}

function handleSlotClick(slot) { 
    if (player.equipment[slot]) { 
        let itemId = player.equipment[slot];
        showItemDetail(itemId, null, "equipped");
    } else {
        openSelector(slot); 
    }
}

function openSelector(slot) {
    const list = getEl('selector-list'); const title = getEl('selector-title');
    list.innerHTML = ""; title.innerText = `選擇 ${slot} 裝備`;
    let found = false;
    player.bag.forEach((bagItem) => {
        let item = itemDB[bagItem.id];
        if (item && item.type === slot) {
            found = true;
            let div = document.createElement('div'); div.className = `select-item q-${item.rarity||'gray'}`;
            div.innerHTML = `<div class="info"><span style="font-size:1.5rem">${item.emoji}</span> <b>${item.name}</b></div><div style="color:#f39c12; font-size:0.8rem">${item.atk ? '攻+' + item.atk : ''} ${item.hp ? '血+' + item.hp : ''}</div>`;
            div.onclick = () => showItemDetail(bagItem.id, bagItem.uuid, "selector"); list.appendChild(div);
        }
    });
    if (!found) list.innerHTML = "<div style='text-align:center; color:#777; padding:20px;'>無可用裝備</div>";
    removeClass('selector-modal');
}

function equipFromSelector(itemId, uuid) { let item = itemDB[itemId]; let type = item.type; if (player.equipment[type]) addToBag(player.equipment[type], 1); player.equipment[type] = itemId; removeFromBag(itemId, 1, uuid); closeItemDetail(); closeSelector(); updateEquipGrid(); updateUI(); alert(`穿戴了 ${item.name}！`); }
function unequipItem(slot) { let itemId = player.equipment[slot]; if (itemId) { addToBag(itemId, 1); player.equipment[slot] = null; closeItemDetail(); updateEquipGrid(); updateUI(); alert(`卸下了 ${itemDB[itemId].name}！`); } }
function updateEquipGrid() {
    const slots = ['head', 'hand', 'body', 'acc', 'feet'];
    slots.forEach(slot => {
        let itemId = player.equipment[slot]; let el = getEl(`slot-${slot}`);
        if (itemId) { let item = itemDB[itemId]; el.innerHTML = `${item.emoji}<br>${item.name}`; el.className = `equip-slot ${slot}-slot q-${item.rarity||'gray'}`; el.style.color = "#fff"; } 
        else { let icons = {head:'🧢', hand:'⚔️', body:'👕', acc:'💍', feet:'👢'}; let names = {head:'頭', hand:'武', body:'身', acc:'飾', feet:'腳'}; el.innerHTML = `${icons[slot]}<br>${names[slot]}`; el.className = `equip-slot ${slot}-slot`; el.style.border = "2px dashed #666"; el.style.color = "#aaa"; }
    });
}

function renderForgeList() {
    const list = getEl('recipe-list'); list.innerHTML = "";
    if (player.recipes.length === 0) { list.innerHTML = "<div style='text-align:center; color:#777; padding:20px;'>尚未習得配方。<br>多去閒晃吧！</div>"; } 
    else {
        player.recipes.forEach(rId => {
            let recipe = recipeDB.find(r => r.id === rId); if (!recipe) return;
            let canCraft = true; let matHtml = "";
            for (const [matId, qty] of Object.entries(recipe.materials)) {
                let matItem = itemDB[matId]; let ownQty = getBagCount(matId);
                let statusClass = (ownQty >= qty) ? "req-ok" : "req-no";
                if (ownQty < qty) canCraft = false;
                matHtml += `<div class="req-item ${statusClass}">${matItem.emoji}${matItem.name} (${ownQty}/${qty})</div>`;
            }
            let div = document.createElement('div'); div.className = "select-item"; div.style.flexDirection = "column"; div.style.alignItems = "flex-start";
            div.innerHTML = `<div style="display:flex; justify-content:space-between; width:100%;"><span style="font-weight:bold; color:#f1c40f;">📜 ${recipe.name}</span><button style="width:auto; padding:2px 8px; font-size:0.8rem; background:${canCraft?'#27ae60':'#555'}" ${canCraft?'':'disabled'} onclick="craftItem('${rId}')">打造</button></div><div style="margin-top:5px; display:flex; gap:10px;">${matHtml}</div><div style="font-size:0.75rem; color:#888; margin-top:3px;">${recipe.desc}</div>`;
            list.appendChild(div);
        });
    }
}

function craftItem(rId) {
    let recipe = recipeDB.find(r => r.id === rId); if (!recipe) return;
    for (const [matId, qty] of Object.entries(recipe.materials)) { removeFromBag(matId, qty); }
    addToBag(recipe.resultId, 1); alert(`成功打造了 ${itemDB[recipe.resultId].name}！`); 
    renderForgeList();
}

function updateActionButtons() {
    const btnLeft = getEl('btn-action-left'); const btnRight = getEl('btn-action-right'); const btnMain = getEl('btn-action-main'); 
    if ((player.location === 'emei' || player.location === 'tower') && player.state !== 'combat') removeClass('btn-floor-select'); else addClass('btn-floor-select');
    btnLeft.className = ''; btnRight.className = ''; btnMain.className = '';
    
    if (player.state === 'combat') {
        if (player.job === '巨賈') { btnLeft.innerText = "💰 賄賂"; btnLeft.onclick = () => combatBribe(); btnLeft.className = "btn-bribe"; } 
        else { btnLeft.innerText = "⚔️ 攻擊"; btnLeft.onclick = () => combatAttack(); btnLeft.className = "btn-attack"; }
        btnRight.innerText = "🏃 逃跑"; btnRight.onclick = () => combatFlee(); btnRight.className = "btn-flee";
        btnMain.innerText = "防禦 (跳過)"; btnMain.onclick = () => passTime();
    } else {
        btnLeft.className = "btn-disabled"; btnRight.className = "btn-disabled"; btnLeft.onclick = null; btnRight.onclick = null;
        if (player.location === 'home') { btnLeft.innerText = "..."; btnRight.innerText = "..."; btnMain.innerText = "🛏️ 休息"; btnMain.onclick = () => actionRest(); } 
        else if (player.location === 'town') { 
            btnLeft.innerText = "⚖️ 交易"; btnLeft.className = "btn-trade"; btnLeft.onclick = () => openShop(); 
            btnRight.innerText = "🔥 鍛造"; btnRight.className = "btn-forge"; btnRight.onclick = () => openForge(); 
            btnMain.innerText = "🚶 到處晃晃"; btnMain.onclick = () => actionWander(); 
        }
        else if (player.location === 'emei') { 
            btnLeft.innerText = "⚔️ 挑戰眾神"; btnLeft.onclick = () => startCombat(); btnLeft.className = "btn-attack"; 
            btnRight.innerText = `仙: ${player.immortal.exp}/${player.immortal.max}`; btnRight.className = "btn-info"; btnRight.onclick = () => alert(`【${player.immortal.name}】`); 
            if (player.floorKills >= 5) { btnMain.innerText = "⏫ 前往下一層"; btnMain.className = "btn-next-floor"; btnMain.onclick = () => climbTower(); } 
            else { btnMain.innerText = "🧘 修仙"; btnMain.className = "btn-cultivate"; btnMain.onclick = () => cultivate('immortal'); }
        }
        else if (player.location === 'tower') { 
            btnLeft.innerText = "🏯 挑戰封魔塔"; btnLeft.onclick = () => startCombat(); btnLeft.className = "btn-attack"; 
            btnRight.innerText = `魔: ${player.devil.exp}/${player.devil.max}`; btnRight.className = "btn-info"; btnRight.onclick = () => alert(`【${player.devil.name}】`); 
            if (player.floorKills >= 5) { btnMain.innerText = "⏬ 前往下一層"; btnMain.className = "btn-next-floor"; btnMain.onclick = () => climbTower(); } 
            else { btnMain.innerText = "😈 修魔"; btnMain.className = "btn-cultivate"; btnMain.onclick = () => cultivate('devil'); }
        }
    }
}

function handleMainAction() { }

function actionRest() { 
    passTime(); 
    player.hp += 30; player.mp += 30; 
    if (player.killedEmeiBoss && player.killedTowerBoss && !player.dreamTriggered) {
        player.dreamTriggered = true;
        player.recipes.push("r_xuanyuan");
        updateMainDisplay("💤", "夢中一位老者傳授了你【軒轅劍】的鑄造圖譜！");
    } else {
        updateMainDisplay("🛏️", "休息了一個月，精神稍微恢復了。"); 
    }
    if (player.job === '大夫') { 
        player.restCount++; 
        if (player.restCount % 5 === 0) { addToBag("pill_001", 1); addToLog("⚕️ 大夫搓了一顆【補氣丸】！"); } 
    } 
    updateUI(); 
}

function actionWander() { 
    passTime(); 
    if (Math.random() < 0.1) {
        let r = recipeDB[Math.floor(Math.random() * recipeDB.length)];
        if (!player.recipes.includes(r.id)) { 
            player.recipes.push(r.id); 
            updateMainDisplay("👂", `閒晃時聽到了傳聞...\n${r.rumor}\n(已習得【${r.name}】配方！)`); 
        } 
        else { updateMainDisplay("🚶", "街上人們在討論之前的傳聞..."); }
    } else if (Math.random() < 0.3) {
        triggerEvent('town'); 
    } else {
        let rumors = ["聽說峨眉山有仙人。", "封魔塔怪叫聲。", "鐵匠鋪好像進了新貨。", "隔壁老王練成了神功。"];
        updateMainDisplay("🚶", `閒晃中... \n"${rumors[Math.floor(Math.random() * rumors.length)]}"`); 
    }
}

function travelTo(p) { 
    closeMap(); passTime(); player.location = p; player.state = "normal"; 
    let e="❓",t=""; if(p==='home'){e="🏠";t="回家";} if(p==='town'){e="🏰";t="進城";} if(p==='emei'){e="🏔️";t="峨眉";} if(p==='tower'){e="🗼";t="封魔";} 
    updateMainDisplay(e,t); updateActionButtons(); updateUI();
}

function renderAchievementList() {
    const list = getEl('achievement-list');
    list.innerHTML = "";
    achievementDB.forEach(ach => {
        let unlocked = player.unlockedAchievements.includes(ach.id);
        let div = document.createElement('div');
        div.className = unlocked ? "list-item" : "list-item locked";
        div.innerHTML = unlocked 
            ? `🏆 <b>${ach.name}</b><br><small>${ach.desc}</small>` 
            : `🔒 <b>???</b><br><small>繼續探索以解鎖</small>`;
        list.appendChild(div);
    });
}