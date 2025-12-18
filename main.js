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
    "weapon_poison_needle": { name: "毒針", category: "equip", type: "hand", rarity: "blue", price: 300, atk: 15, hp: 0, poison: 10, emoji: "💉", desc: "淬毒暗器，每回合造成 10 點毒傷。" },
    "weapon_bone_club": { name: "狼牙棒", category: "equip", type: "hand", rarity: "blue", price: 250, atk: 12, hp: 0, bleed: 0.05, emoji: "🍖", desc: "插滿骨刺，造成流血(每回合扣5%血)。" },
    "weapon_black_iron": { name: "黑鐵劍", category: "equip", type: "hand", rarity: "purple", price: 1200, atk: 35, hp: 0, emoji: "🗡️", desc: "沉重的黑劍。" },
    "weapon_dragon": { name: "龍鱗刀", category: "equip", type: "hand", rarity: "gold", price: 5000, atk: 80, hp: 20, burn: 20, emoji: "🐉", desc: "附帶龍炎，每回合燃燒 20 點血。" },
    "weapon_xuanyuan": { name: "軒轅劍", category: "equip", type: "hand", rarity: "red", price: 0, atk: 5000, hp: 5000, stun: 0.2, lifesteal: 0.5, emoji: "⚔️", desc: "上古神器，聖道之劍。" },
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
    "feet_wind":  { name: "疾風靴", category: "equip", type: "feet", rarity: "purple", price: 1500, atk: 2, hp: 10, dodge: 0.1, emoji: "🍃", desc: "身輕如燕，10% 機率閃避攻擊。" },
    "feet_cloud": { name: "踏雲履", category: "equip", type: "feet", rarity: "gold", price: 3000, atk: 5, hp: 20, dodge: 0.2, emoji: "☁️", desc: "步履生雲，20% 機率閃避攻擊。" },
    "acc_poison": { name: "萬毒蠱", category: "equip", type: "acc", rarity: "purple", price: 1500, atk: 10, hp: 0, poison: 15, emoji: "🦂", desc: "五毒俱全，每回合劇毒 15 點。" },
    "acc_blood_beads": { name: "染血念珠", category: "equip", type: "acc", rarity: "blue", price: 800, atk: 5, hp: 5, lifesteal: 0.1, emoji: "📿", desc: "攻擊時吸取 10% 傷害的血量。" },
    "acc_jade": { name: "青玉佩", category: "equip", type: "acc", rarity: "blue", price: 600, atk: 0, hp: 15, emoji: "🟢", desc: "溫潤凝神。" },
    "acc_mirror": { name: "靈視鏡", category: "equip", type: "acc", rarity: "gold", price: 4000, atk: 20, hp: 20, crit: 0.2, emoji: "🧿", desc: "看穿虛妄，20% 機率造成爆擊。" },
    "pill_001":   { name: "補氣丸", category: "use", type: "use", rarity: "gray", price: 20, emoji: "💊", desc: "HP +20。", useFunc: (p) => { p.hp += 20; return "HP +20"; } },
    "pill_mp":    { name: "回氣散", category: "use", type: "use", rarity: "gray", price: 20, emoji: "🧂", desc: "MP +20。", useFunc: (p) => { p.mp += 20; return "MP +20"; } },
    "pill_exp":   { name: "大還丹", category: "use", type: "use", rarity: "gold", price: 2000, emoji: "🟠", desc: "修為 +50。", useFunc: (p) => { let t = (p.location==='tower')?p.devil:p.immortal; t.exp+=50; return "修為 +50"; } },
  
// --- 【修改】老朋友復活 ---
    "pill_antidote": { name: "解毒丹", category: "use", type: "use", rarity: "blue", price: 50, emoji: "🍵", desc: "清除體內毒素，回復 50 HP。", 
        useFunc: function(p) { 
            p.hp += 50; 
            // 雖然目前敵人還不會下毒，但這行代碼預留了未來擴充空間
            if(p.poisoned) { p.poisoned = false; return "劇毒已解，HP+50"; }
            return "神清氣爽，HP+50"; 
        } 
    },

    // --- 【新增】攻擊型道具 (戰鬥中對敵人使用) ---
    "use_fire_bomb": { name: "霹靂火彈", category: "use", type: "use", rarity: "blue", price: 150, emoji: "💣", desc: "對敵人造成 100 點火焰傷害。", 
        useFunc: function(p) { 
            if(p.state !== 'combat') return "戰鬥中才能丟！";
            currentEnemy.hp -= 100; 
            addToLog("💥 轟！霹靂火彈造成 100 傷害！"); 
            updateUI(); return "炸得好！"; 
        } 
    },
    "use_ice_needle": { name: "冰魄銀針", category: "use", type: "use", rarity: "purple", price: 300, emoji: "❄️", desc: "造成 50 傷害並凍結敵人。", 
        useFunc: function(p) { 
            if(p.state !== 'combat') return "戰鬥中才能射！";
            currentEnemy.hp -= 50; 
            currentEnemy.frozen = true;
            addToLog("❄️ 敵人被冰魄銀針凍住了！"); 
            updateUI(); return "敵人已凍結"; 
        } 
    },
    "use_poison_flask": { name: "腐屍毒水", category: "use", type: "use", rarity: "blue", price: 200, emoji: "🧪", desc: "使敵人陷入劇毒狀態。", 
        useFunc: function(p) { 
            if(p.state !== 'combat') return "戰鬥中才能潑！";
            currentEnemy.poisoned = true; 
            addToLog("🤢 敵人沾染了腐屍毒！"); 
            return "施毒成功"; 
        } 
    },
    "use_stun_sand": { name: "石灰粉", category: "use", type: "use", rarity: "gray", price: 50, emoji: "🌫️", desc: "下三濫的招數，使敵人暈眩。", 
        useFunc: function(p) { 
            if(p.state !== 'combat') return "戰鬥中才能撒！";
            currentEnemy.stunned = true; 
            addToLog("👀 敵人眼睛進了石灰，暈眩了！"); 
            return "撒石灰成功"; 
        } 
    },
    "use_blood_leech": { name: "吸血蠱蟲", category: "use", type: "use", rarity: "purple", price: 500, emoji: "🐛", desc: "吸取敵人 100 HP 給自己。", 
        useFunc: function(p) { 
            if(p.state !== 'combat') return "戰鬥中才能放！";
            let drain = 100;
            if(currentEnemy.hp < drain) drain = currentEnemy.hp;
            currentEnemy.hp -= drain;
            p.hp += drain;
            addToLog(`🧛 蠱蟲吸取了 ${drain} 點生命！`); 
            updateUI(); return "吸血成功"; 
        } 
    },
    "use_money_dart": { name: "金錢鏢", category: "use", type: "use", rarity: "gold", price: 1000, emoji: "💸", desc: "土豪一擲！造成 500 點真實傷害。", 
        useFunc: function(p) { 
            if(p.state !== 'combat') return "戰鬥中才能丟！";
            currentEnemy.hp -= 500; 
            addToLog("💰 有錢能使鬼推磨！造成 500 傷害！"); 
            updateUI(); return "金錢攻擊！"; 
        } 
    },

    // --- 【新增】增益/恢復型 (任何時候可用) ---
    "pill_super_heal": { name: "九轉還魂丹", category: "use", type: "use", rarity: "gold", price: 5000, emoji: "🌟", desc: "HP 與 MP 完全恢復。", 
        useFunc: function(p) { 
            p.hp = p.maxHp; 
            p.mp = p.maxMp; 
            updateUI(); return "狀態全滿！"; 
        } 
    },
    "pill_power": { name: "大力丸", category: "use", type: "use", rarity: "blue", price: 200, emoji: "💪", desc: "攻擊力永久 +1。", 
        useFunc: function(p) { 
            p.atk += 1; 
            addToLog("💪 感覺肌肉充滿了力量 (ATK+1)"); 
            updateUI(); return "力量提升"; 
        } 
    },
    "pill_stone_skin": { name: "鐵皮散", category: "use", type: "use", rarity: "blue", price: 200, emoji: "🗿", desc: "最大 HP 永久 +5。", 
        useFunc: function(p) { 
            p.baseMaxHp += 5; 
            p.hp += 5;
            addToLog("🗿 皮膚變硬了 (MaxHP+5)"); 
            updateUI(); return "體質提升"; 
        } 
    },
    "pill_brain": { name: "醒神茶", category: "use", type: "use", rarity: "blue", price: 200, emoji: "🍵", desc: "最大 MP 永久 +5。", 
        useFunc: function(p) { 
            p.maxMp += 5; 
            p.mp += 5;
            addToLog("🧠 思緒清晰了 (MaxMP+5)"); 
            updateUI(); return "精神提升"; 
        } 
    },

    // --- 【新增】特殊功能型 ---
    "use_escape_charm": { name: "神行符", category: "use", type: "use", rarity: "purple", price: 300, emoji: "💨", desc: "戰鬥中必定逃跑成功。", 
        useFunc: function(p) { 
            if(p.state !== 'combat') return "戰鬥中才能用";
            combatFlee(); 
            return "溜之大吉"; 
        } 
    },
    "use_lucky_bag": { name: "幸運福袋", category: "use", type: "use", rarity: "red", price: 500, emoji: "🧧", desc: "隨機獲得 1~2000 靈石。", 
        useFunc: function(p) { 
            let gain = Math.floor(Math.random() * 2000) + 1;
            p.money += gain;
            addToLog(`🧧 打開福袋，獲得 ${gain} 靈石！`);
            updateUI(); return "恭喜發財"; 
        } 
    },
    "use_exp_book": { name: "無字天書", category: "use", type: "use", rarity: "gold", price: 3000, emoji: "📖", desc: "當前修為直接 +100。", 
        useFunc: function(p) { 
            let t = (p.location === 'tower') ? p.devil : p.immortal;
            t.exp += 100;
            addToLog("📖 讀了天書，豁然開朗！");
            updateUI(); return "修為大增"; 
        } 
    },
    "use_karma_clean": { name: "洗心水", category: "use", type: "use", rarity: "purple", price: 1000, emoji: "💧", desc: "洗去 50 點罪惡(善惡趨向0)。", 
        useFunc: function(p) { 
            if(p.karma > 0) p.karma = Math.max(0, p.karma - 50);
            else if(p.karma < 0) p.karma = Math.min(0, p.karma + 50);
            addToLog("💧 心靈得到了淨化...");
            updateUI(); return "洗心革面"; 
        } 
    },
    "use_karma_bad": { name: "惡魔契約", category: "use", type: "use", rarity: "red", price: 0, emoji: "📜", desc: "獲得 1000 靈石，但善惡 -100。", 
        useFunc: function(p) { 
            p.money += 1000;
            p.karma -= 100;
            addToLog("👿 你出賣了靈魂...");
            updateUI(); return "交易完成"; 
        } 
    },
    "use_teleport_home": { name: "回城卷軸", category: "use", type: "use", rarity: "gray", price: 50, emoji: "🏰", desc: "瞬間傳送回家。", 
        useFunc: function(p) { 
            travelTo('home');
            return "傳送成功"; 
        } 
    },
    "use_monster_bait": { name: "引獸香", category: "use", type: "use", rarity: "gray", price: 100, emoji: "🥩", desc: "立刻遭遇一場戰鬥。", 
        useFunc: function(p) { 
            startCombat();
            return "野獸來了！"; 
        } 
    },
    
    // --- 【新增】鍛造用特殊素材 (給商店賣或掉落) ---
    "mat_sulfur": { name: "硫磺", category: "material", type: "material", rarity: "gray", price: 20, emoji: "🌋", desc: "製作火彈的材料。" },
    "mat_lime": { name: "石灰石", category: "material", type: "material", rarity: "gray", price: 10, emoji: "⬜", desc: "磨成粉可以陰人。" },
    "mat_ice_shard": { name: "冰渣", category: "material", type: "material", rarity: "blue", price: 50, emoji: "🧊", desc: "製作冰魄針的材料。" },
    "mat_poison_grass": { name: "斷腸草", category: "material", type: "material", rarity: "blue", price: 60, emoji: "🌿", desc: "劇毒草藥。" },
  
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
    // --- 新增的 10 個裝備 ---
    "weapon_snake": { name: "青蛇劍", category: "equip", type: "hand", rarity: "blue", price: 400, atk: 25, hp: 0, emoji: "🐍", desc: "劍身如蛇，淬有劇毒。" },
    "weapon_soul_hammer": { name: "碎魂錘", category: "equip", type: "hand", rarity: "purple", price: 1500, atk: 45, hp: 0, emoji: "🔨", desc: "每一擊都能震盪靈魂。" },
    "weapon_fire_spear": { name: "焚天槍", category: "equip", type: "hand", rarity: "gold", price: 6000, atk: 120, hp: 50, emoji: "🔥", desc: "槍尖燃燒著不滅之火。" },
    "weapon_ice_blade": { name: "寒月刃", category: "equip", type: "hand", rarity: "purple", price: 1800, atk: 40, hp: 20, emoji: "🌙", desc: "冷如寒月，殺氣逼人。" },
    
    "body_beast": { name: "蠻荒獸甲", category: "equip", type: "body", rarity: "blue", price: 500, atk: 5, hp: 40, emoji: "🐻", desc: "粗糙但厚實的獸皮甲。" },
    "body_ghost_robe": { name: "幽冥法衣", category: "equip", type: "body", rarity: "purple", price: 2000, atk: 10, hp: 60, emoji: "👻", desc: "散發著陰森的鬼氣。" },
    "body_thunder": { name: "雷神鎧", category: "equip", type: "body", rarity: "gold", price: 7000, atk: 30, hp: 150, emoji: "⚡", desc: "纏繞著雷電的寶甲。" },
    
    "feet_shadow": { name: "幻影靴", category: "equip", type: "feet", rarity: "purple", price: 2200, atk: 10, hp: 10, emoji: "👣", desc: "步法詭異，難以捉摸。" },
    
    "acc_ward": { name: "辟邪玉", category: "equip", type: "acc", rarity: "blue", price: 800, atk: 2, hp: 30, emoji: "🧧", desc: "可保平安。" },
    "acc_bag": { name: "乾坤袋", category: "equip", type: "acc", rarity: "gold", price: 5000, atk: 50, hp: 50, emoji: "👜", desc: "內藏乾坤，包羅萬象。" },

  // --- 新增：頭盔、防具、鞋子、飾品 ---
    "head_purple_gold": { name: "紫金冠", category: "equip", type: "head", rarity: "gold", price: 4500, atk: 20, hp: 100, emoji: "👑", desc: "王者之氣，紫氣東來。" },
    "head_demon": { name: "修羅面具", category: "equip", type: "head", rarity: "purple", price: 1800, atk: 35, hp: 10, emoji: "👺", desc: "戴上後殺氣騰騰。" },
    
    "body_star_robe": { name: "星辰袍", category: "equip", type: "body", rarity: "gold", price: 8000, atk: 50, hp: 80, emoji: "👘", desc: "吸收星光之力，法力無邊。" },
    "body_turtle": { name: "玄武重甲", category: "equip", type: "body", rarity: "gold", price: 7500, atk: 0, hp: 250, emoji: "🐢", desc: "不動如山，極致防禦。" },
    
    "feet_phoenix": { name: "鳳凰靴", category: "equip", type: "feet", rarity: "gold", price: 6000, atk: 30, hp: 30, emoji: "🔥", desc: "浴火重生，步步生蓮。" },
    "feet_unicorn": { name: "麒麟戰靴", category: "equip", type: "feet", rarity: "purple", price: 2500, atk: 15, hp: 50, emoji: "🦄", desc: "麒麟皮製成，祥瑞護體。" },
    
    "acc_bell": { name: "攝魂鈴", category: "equip", type: "acc", rarity: "purple", price: 2000, atk: 25, hp: 0, emoji: "🔔", desc: "鈴聲一響，魂飛魄散。" },
    "acc_heart_mirror": { name: "護心鏡", category: "equip", type: "acc", rarity: "blue", price: 600, atk: 0, hp: 60, emoji: "🛡️", desc: "保護心脈的重要防具。" },
    "acc_thunder_bead": { name: "雷靈珠", category: "equip", type: "acc", rarity: "gold", price: 5500, atk: 60, hp: 20, emoji: "🔮", desc: "蘊含狂暴雷電之力。" },
    "acc_lotus_lamp": { name: "寶蓮燈", category: "equip", type: "acc", rarity: "gold", price: 9000, atk: 40, hp: 150, emoji: "🪔", desc: "上古神器，救死扶傷。" },
  // --- 新增：頭盔 (4) ---
    "head_bandana": { name: "修形頭巾", category: "equip", type: "head", rarity: "gray", price: 100, atk: 2, hp: 5, emoji: "👳", desc: "簡單的布條，聊勝於無。" },
    "head_jade_crown": { name: "玉清冠", category: "equip", type: "head", rarity: "purple", price: 2500, atk: 15, hp: 50, emoji: "💠", desc: "玉石雕琢，清心凝神。" },
    "head_dragon_horn": { name: "龍角盔", category: "equip", type: "head", rarity: "gold", price: 6500, atk: 45, hp: 120, emoji: "🐲", desc: "以上古龍角打磨而成，威壓蓋世。" },
    "head_phoenix_crown": { name: "鳳翅紫金冠", category: "equip", type: "head", rarity: "gold", price: 7000, atk: 60, hp: 80, emoji: "👑", desc: "華麗無比，彷彿有鳳凰展翅。" },

    // --- 新增：身體 (1) ---
    "body_bone_plate": { name: "白骨戰甲", category: "equip", type: "body", rarity: "blue", price: 800, atk: 5, hp: 45, emoji: "🦴", desc: "用大量碎骨拼湊而成的戰甲，令人畏懼。" },

    // --- 新增：鞋子 (3) ---
    "feet_heavy_iron": { name: "重鐵靴", category: "equip", type: "feet", rarity: "blue", price: 350, atk: 2, hp: 15, emoji: "👞", desc: "非常沉重，但踢人很痛。" },
    "feet_tiger": { name: "虎嘯靴", category: "equip", type: "feet", rarity: "purple", price: 2800, atk: 20, hp: 40, emoji: "🐯", desc: "虎皮縫製，走起路來虎虎生風。" },
    "feet_void": { name: "虛空履", category: "equip", type: "feet", rarity: "gold", price: 8500, atk: 40, hp: 60, emoji: "🌌", desc: "踏破虛空，無視距離。" },
  // --- 新增：20 個使用現有素材的特效裝備 ---
    // 武器
    "weapon_slime_whip":   { name: "黏液鞭", category: "equip", type: "hand", rarity: "blue", price: 500, atk: 20, poison: 8, emoji: "🧪", desc: "沾滿腐蝕性黏液，令人作嘔。" },
    "weapon_fox_fan":      { name: "妖狐扇", category: "equip", type: "hand", rarity: "purple", price: 1800, atk: 40, burn: 25, emoji: "🔥", desc: "扇出的風帶有狐火。" },
    "weapon_thunder_sword":{ name: "雷木劍", category: "equip", type: "hand", rarity: "gold", price: 3500, atk: 60, stun: 0.1, crit: 0.15, emoji: "⚡", desc: "雷擊木削製而成，麻痺敵人。" },
    "weapon_ice_blade":    { name: "寒冰刃", category: "equip", type: "hand", rarity: "purple", price: 2200, atk: 45, freeze: 0.1, emoji: "❄️", desc: "萬年冰晶打磨，凍結萬物。" },
    "weapon_demon_fork":   { name: "夜叉血叉", category: "equip", type: "hand", rarity: "purple", price: 2000, atk: 50, lifesteal: 0.15, emoji: "🔱", desc: "渴望鮮血的鋼叉。" },
    
    // 頭盔
    "head_flower":         { name: "百花冠", category: "equip", type: "head", rarity: "blue", price: 600, hp: 50, regen: 10, emoji: "🌺", desc: "妖花蜜浸泡過，香氣能療傷。" },
    "head_tiger":          { name: "虎威盔", category: "equip", type: "head", rarity: "gold", price: 4000, atk: 30, hp: 100, crit: 0.1, emoji: "🐯", desc: "虎嘯山林，威勢震懾對手。" },
    "head_ink":            { name: "墨意巾", category: "equip", type: "head", rarity: "blue", price: 500, hp: 30, dodge: 0.05, emoji: "🏴", desc: "揮毫潑墨，身法飄逸。" },
    "head_antler":         { name: "鹿角帽", category: "equip", type: "head", rarity: "purple", price: 1500, hp: 80, thorns: 0.1, emoji: "🦌", desc: "鹿角堅硬，誰撞誰受傷。" },
    
    // 身體
    "body_mud":            { name: "淤泥甲", category: "equip", type: "body", rarity: "gray", price: 200, hp: 40, thorns: 0.05, emoji: "💩", desc: "髒兮兮的，敵人不想碰你。" },
    "body_tortoise":       { name: "玄武甲", category: "equip", type: "body", rarity: "gold", price: 8000, hp: 300, thorns: 0.25, emoji: "🐢", desc: "硬到讓敵人絕望。" },
    "body_star":           { name: "星光袍", category: "equip", type: "body", rarity: "gold", price: 6000, hp: 150, regen: 20, emoji: "👘", desc: "沐浴星光，生生不息。" },
    "body_ghost":          { name: "百鬼衣", category: "equip", type: "body", rarity: "purple", price: 2500, hp: 60, lifesteal: 0.1, emoji: "👻", desc: "魂魄纏繞，吞噬生機。" },
    
    // 鞋子
    "feet_web":            { name: "蛛絲履", category: "equip", type: "feet", rarity: "blue", price: 400, hp: 10, dodge: 0.08, emoji: "🕸️", desc: "黏性強，抓地力好，身法靈活。" },
    "feet_fire":           { name: "烽火靴", category: "equip", type: "feet", rarity: "purple", price: 2000, atk: 10, burn: 15, emoji: "🔥", desc: "所過之處，寸草不生。" },
    "feet_kirin":          { name: "麒麟步", category: "equip", type: "feet", rarity: "gold", price: 7000, atk: 20, hp: 50, dodge: 0.15, emoji: "🦄", desc: "祥瑞加身，逢凶化吉。" },
    
    // 飾品
    "acc_tooth":           { name: "狼牙鍊", category: "equip", type: "acc", rarity: "gray", price: 150, atk: 5, bleed: 0.03, emoji: "🦷", desc: "野性的象徵。" },
    "acc_wind":            { name: "定風珠串", category: "equip", type: "acc", rarity: "gold", price: 3500, hp: 20, dodge: 0.12, emoji: "📿", desc: "風暴無法近身。" },
    "acc_chaos":           { name: "混沌珠", category: "equip", type: "acc", rarity: "red", price: 0, atk: 100, lifesteal: 0.2, burn: 50, emoji: "⚫", desc: "混沌初開，毀滅一切。" },
    "acc_ice_ring":        { name: "冰魄戒", category: "equip", type: "acc", rarity: "purple", price: 1800, atk: 10, freeze: 0.05, emoji: "💍", desc: "觸摸即凍傷。" },
  
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
// --- 新增的 10 個配方 ---
    { id: "r_snake_sword", name: "青蛇劍", resultId: "weapon_snake", rumor: "「用【鐵劍】沾上【毒囊】，據說能煉出毒劍。」", materials: { "weapon_iron": 1, "mat_venom": 2 }, desc: "劇毒之劍。" },
    { id: "r_soul_hammer", name: "碎魂錘", resultId: "weapon_soul_hammer", rumor: "「【黑鐵劍】太輕了？試試加點【魂魄碎片】和【碎骨】。」", materials: { "weapon_black_iron": 1, "mat_soul": 5, "mat_bone": 10 }, desc: "重型武器。" },
    { id: "r_fire_spear", name: "焚天槍", resultId: "weapon_fire_spear", rumor: "「傳說【神鐵塊】遇上【三昧真火】，可鑄焚天神器。」", materials: { "mat_god_iron": 2, "mat_fire": 2, "mat_horn": 1 }, desc: "火屬性神兵。" },
    { id: "r_ice_blade", name: "寒月刃", resultId: "weapon_ice_blade", rumor: "「【斷劍碎片】若與【萬年冰晶】融合，鋒利無比。」", materials: { "mat_sword_frag": 3, "mat_ice": 1 }, desc: "冰屬性彎刀。" },

    { id: "r_beast_armor", name: "蠻荒獸甲", resultId: "body_beast", rumor: "「【堅硬鬃毛】加上【碎骨】，能做成簡易護甲。」", materials: { "mat_bristle": 5, "mat_bone": 5 }, desc: "野蠻防護。" },
    { id: "r_ghost_robe", name: "幽冥法衣", resultId: "body_ghost_robe", rumor: "「【道袍布料】浸泡在【屍油】裡，再用【魂魄碎片】縫製...」", materials: { "mat_cloth": 2, "mat_oil": 2, "mat_soul": 2 }, desc: "鬼修至寶。" },
    { id: "r_thunder_armor", name: "雷神鎧", resultId: "body_thunder", rumor: "「以【雷擊木】引雷，淬鍊【金剛甲】，凡人不可觸。」", materials: { "body_gold_armor": 1, "mat_thunder_wood": 2 }, desc: "雷電防禦。" },

    { id: "r_shadow_boots", name: "幻影靴", resultId: "feet_shadow", rumor: "「【蝙蝠翼】輕盈，【妖狐毛】靈動，合二為一可製靴。」", materials: { "mat_wing": 5, "mat_fox_fur": 2 }, desc: "提升閃避(設定上)。" },

    { id: "r_ward_jade", name: "辟邪玉", resultId: "acc_ward", rumor: "「普通的【念珠】若有【靈桃核】加持，可避邪祟。」", materials: { "mat_beads": 1, "mat_peach": 2 }, desc: "初級法器。" },
    { id: "r_bag", name: "乾坤袋", resultId: "acc_bag", rumor: "「【道袍布料】包裹住【混沌氣團】，內有大千世界。」", materials: { "mat_cloth": 5, "mat_chaos": 1 }, desc: "空間法寶。" },

  // --- 新增：10 個對應配方 ---
    { id: "r_purple_gold", name: "紫金冠", resultId: "head_purple_gold", rumor: "「【神鐵塊】打底，再撒上【金剛砂】，可鑄造帝王頭冠。」", materials: { "mat_god_iron": 1, "mat_sand": 5 }, desc: "尊貴象徵。" },
    { id: "r_demon_mask", name: "修羅面具", resultId: "head_demon", rumor: "「【鬼面具】沾染【修羅血珠】，會變成更可怕的東西...」", materials: { "head_ghost": 1, "mat_blood_orb": 1 }, desc: "惡鬼升級版。" },

    { id: "r_star_robe", name: "星辰袍", resultId: "body_star_robe", rumor: "「採集天上的【星辰砂】，織入【道袍布料】，可成仙衣。」", materials: { "mat_star_sand": 3, "mat_cloth": 2 }, desc: "星光璀璨。" },
    { id: "r_turtle_armor", name: "玄武重甲", resultId: "body_turtle", rumor: "「世間最硬的【玄武甲】，加上【神鐵塊】加固，堅不可摧。」", materials: { "mat_turtle_shell": 1, "mat_god_iron": 2 }, desc: "絕對防禦。" },

    { id: "r_phoenix_boots", name: "鳳凰靴", resultId: "feet_phoenix", rumor: "「以【鳳凰羽】為主材，【三昧真火】煉製，可踏火而行。」", materials: { "mat_phoenix_feather": 1, "mat_fire": 2 }, desc: "傳說之靴。" },
    { id: "r_unicorn_boots", name: "麒麟戰靴", resultId: "feet_unicorn", rumor: "「【麒麟鱗片】堅韌無比，用【堅硬鬃毛】縫製成靴，水火不侵。」", materials: { "mat_kirin": 1, "mat_bristle": 5 }, desc: "祥瑞戰靴。" },

    { id: "r_soul_bell", name: "攝魂鈴", resultId: "acc_bell", rumor: "「普通的【鐵礦】若是融入【魂魄碎片】，搖動時會有鬼哭聲。」", materials: { "mat_iron": 2, "mat_soul": 3 }, desc: "音波攻擊。" },
    { id: "r_heart_mirror", name: "護心鏡", resultId: "acc_heart_mirror", rumor: "「【鐵礦】反覆錘鍊，鑲嵌【石之心】，關鍵時刻能保命。」", materials: { "mat_iron": 3, "mat_heart": 1 }, desc: "保命裝備。" },
    { id: "r_thunder_bead", name: "雷靈珠", resultId: "acc_thunder_bead", rumor: "「將【雷擊木】燒成灰，壓縮進【定風珠】裡？瘋狂的想法！」", materials: { "mat_thunder_wood": 2, "mat_wind_orb": 1 }, desc: "雷電法寶。" },
    { id: "r_lotus_lamp", name: "寶蓮燈", resultId: "acc_lotus_lamp", rumor: "「集齊【蓮子】、【三昧真火】與【鴻蒙紫氣】，可重現上古神器。」", materials: { "mat_lotus": 5, "mat_fire": 1, "mat_primordial": 1 }, desc: "終極防禦神器。" },
  // --- 新增：8 個對應配方 ---
    { id: "r_bandana", name: "修形頭巾", resultId: "head_bandana", rumor: "「【道袍布料】剪裁一下，勉強能當頭巾用。」", materials: { "mat_cloth": 2 }, desc: "新手頭飾。" },
    { id: "r_jade_crown", name: "玉清冠", resultId: "head_jade_crown", rumor: "「【青玉佩】若能加上【萬年冰晶】雕琢，可成上好法冠。」", materials: { "acc_jade": 1, "mat_ice": 1 }, desc: "道家寶物。" },
    { id: "r_dragon_horn_helm", name: "龍角盔", resultId: "head_dragon_horn", rumor: "「【黑蛟鱗】堅硬，【火牛角】銳利，合二為一便是龍角盔。」", materials: { "mat_dragon_scale": 2, "mat_horn": 2 }, desc: "霸氣外露。" },
    { id: "r_phoenix_crown", name: "鳳翅紫金冠", resultId: "head_phoenix_crown", rumor: "「以【鳳凰羽】為飾，【神鐵塊】為底，盡顯王者風範。」", materials: { "mat_phoenix_feather": 2, "mat_god_iron": 1 }, desc: "大聖同款。" },

    { id: "r_bone_plate", name: "白骨戰甲", resultId: "body_bone_plate", rumor: "「收集大量【碎骨】，用【屍油】黏合，是邪修的入門手藝。」", materials: { "mat_bone": 10, "mat_oil": 3 }, desc: "陰森護甲。" },

    { id: "r_heavy_boots", name: "重鐵靴", resultId: "feet_heavy_iron", rumor: "「嫌【鐵礦】太多？乾脆打一雙鐵鞋穿著練功吧。」", materials: { "mat_iron": 5 }, desc: "負重訓練。" },
    { id: "r_tiger_boots", name: "虎嘯靴", resultId: "feet_tiger", rumor: "「【虎骨】支撐，【妖狐毛】保暖，這雙靴子冬天穿正好。」", materials: { "mat_tiger_bone": 2, "mat_fox_fur": 1 }, desc: "保暖又強悍。" },
    { id: "r_void_boots", name: "虛空履", resultId: "feet_void", rumor: "「【混沌氣團】無形無相，唯有【星辰砂】能將其定型為履。」", materials: { "mat_chaos": 1, "mat_star_sand": 2 }, desc: "空間跳躍。" },
  // --- 新增：20 個使用現有素材的配方 ---
    { id: "r_slime_whip", name: "黏液鞭", resultId: "weapon_slime_whip", rumor: "「【蜘蛛絲】沾滿【黏液】，做成鞭子雖然噁心但有毒。」", materials: { "mat_web": 2, "mat_slime": 5 }, desc: "毒性武器。" },
    { id: "r_fox_fan", name: "妖狐扇", resultId: "weapon_fox_fan", rumor: "「【妖狐毛】易燃，配上【三昧真火】，扇出的風都是燙的。」", materials: { "mat_fox_fur": 3, "mat_fire": 1 }, desc: "火焰法寶。" },
    { id: "r_thunder_sword", name: "雷木劍", resultId: "weapon_thunder_sword", rumor: "「【雷擊木】為主，【鐵礦】為鋒，這把劍自帶麻痺效果。」", materials: { "mat_thunder_wood": 2, "mat_iron": 3 }, desc: "雷系神兵。" },
    { id: "r_ice_blade", name: "寒冰刃", resultId: "weapon_ice_blade", rumor: "「【萬年冰晶】極其堅硬，用【斷劍碎片】打磨成刃。」", materials: { "mat_ice": 2, "mat_sword_frag": 5 }, desc: "冰凍控制。" },
    { id: "r_demon_fork", name: "夜叉血叉", resultId: "weapon_demon_fork", rumor: "「【夜叉鋼叉】若浸泡在【修羅血珠】中，會變得嗜血。」", materials: { "mat_fork": 1, "mat_blood_orb": 1 }, desc: "吸血武器。" },

    { id: "r_flower_crown", name: "百花冠", resultId: "head_flower", rumor: "「用【蜘蛛絲】編織【妖花蜜】浸泡過的花朵，香氣襲人。」", materials: { "mat_flower": 5, "mat_web": 2 }, desc: "回血頭飾。" },
    { id: "r_tiger_helm", name: "虎威盔", resultId: "head_tiger", rumor: "「【虎骨】做架，鑲嵌【白虎牙】，百獸震惶。」", materials: { "mat_tiger_bone": 2, "mat_tiger_tooth": 1 }, desc: "爆擊頭盔。" },
    { id: "r_ink_hat", name: "墨意巾", resultId: "head_ink", rumor: "「【道袍布料】染上【千年墨】，穿戴者身形如墨汁般難抓。」", materials: { "mat_cloth": 2, "mat_ink": 2 }, desc: "閃避頭巾。" },
    { id: "r_antler_cap", name: "鹿角帽", resultId: "head_antler", rumor: "「【鹿茸】不只能吃，綁在【堅硬鬃毛】做的帽子上能反傷。」", materials: { "mat_antler": 2, "mat_bristle": 3 }, desc: "反傷帽。" },

    { id: "r_mud_armor", name: "淤泥甲", resultId: "body_mud", rumor: "「【汙泥塊】混合【黏液】，塗在身上乾了就是盔甲。」", materials: { "mat_mud": 10, "mat_slime": 5 }, desc: "新手反傷甲。" },
    { id: "r_tortoise_armor", name: "玄武甲", resultId: "body_tortoise", rumor: "「【玄武甲】本身就是最強盾牌，無需多餘加工，加點【神鐵塊】即可。」", materials: { "mat_turtle_shell": 1, "mat_god_iron": 2 }, desc: "最強防禦。" },
    { id: "r_star_robe", name: "星光袍", resultId: "body_star", rumor: "「【星辰砂】織入【道袍布料】，夜晚會發光。」", materials: { "mat_star_sand": 3, "mat_cloth": 3 }, desc: "回血法袍。" },
    { id: "r_ghost_shroud", name: "百鬼衣", resultId: "body_ghost", rumor: "「【魂魄碎片】縫在【道袍布料】上，穿上如同鬼魅。」", materials: { "mat_soul": 5, "mat_cloth": 1 }, desc: "吸血衣。" },

    { id: "r_web_boots", name: "蛛絲履", resultId: "feet_web", rumor: "「【蜘蛛絲】編的鞋子，抓地力極強。」", materials: { "mat_web": 5, "mat_cloth": 1 }, desc: "閃避鞋。" },
    { id: "r_fire_boots", name: "烽火靴", resultId: "feet_fire", rumor: "「【三昧真火】燒不壞【堅硬鬃毛】，做成靴子步步生火。」", materials: { "mat_fire": 1, "mat_bristle": 5 }, desc: "燃燒鞋。" },
    { id: "r_kirin_boots", name: "麒麟步", resultId: "feet_kirin", rumor: "「【麒麟鱗片】與【黑蛟鱗】縫合，神獸之力加持。」", materials: { "mat_kirin": 1, "mat_dragon_scale": 1 }, desc: "神獸靴。" },

    { id: "r_tooth_neck", name: "狼牙鍊", resultId: "acc_tooth", rumor: "「【鼠牙】太小，但串上【蜘蛛絲】勉強能當項鍊，雖然很刺。」", materials: { "mat_tooth": 10, "mat_web": 1 }, desc: "流血飾品。" },
    { id: "r_wind_charm", name: "定風珠串", resultId: "acc_wind", rumor: "「【定風珠】穿上【仙樂琴弦】，佩戴者身輕如燕。」", materials: { "mat_wind_orb": 1, "mat_string": 1 }, desc: "高級閃避。" },
    { id: "r_chaos_orb", name: "混沌珠", resultId: "acc_chaos", rumor: "「【混沌氣團】與【鬼王令】融合，將誕生毀滅性的法寶。」", materials: { "mat_chaos": 1, "mat_token": 1 }, desc: "終極飾品。" },
    { id: "r_ice_ring", name: "冰魄戒", resultId: "acc_ice_ring", rumor: "「【萬年冰晶】太冷了，要用【仙樂琴弦】纏繞才能佩戴。」", materials: { "mat_ice": 1, "mat_string": 1 }, desc: "冰凍戒指。" },
  // --- 消耗品配方 ---
    { id: "r_fire_bomb", name: "霹靂火彈", resultId: "use_fire_bomb", rumor: "「【硫磺】裝進罐子，塞點【布料】引燃，威力巨大。」", materials: { "mat_sulfur": 3, "mat_cloth": 1 }, desc: "爆炸藝術。" },
    { id: "r_stun_sand", name: "石灰粉", resultId: "use_stun_sand", rumor: "「把【石灰石】磨碎，打架時往臉上撒，下流但有效。」", materials: { "mat_lime": 2 }, desc: "致盲粉末。" },
    { id: "r_poison_flask", name: "腐屍毒水", resultId: "use_poison_flask", rumor: "「【斷腸草】熬出的汁液，混合【黏液】，沾之即腐。」", materials: { "mat_poison_grass": 2, "mat_slime": 2 }, desc: "毒藥水。" },
    { id: "r_ice_needle", name: "冰魄銀針", resultId: "use_ice_needle", rumor: "「【冰渣】打磨成針，極易融化，需【鐵礦】固定。」", materials: { "mat_ice_shard": 3, "mat_iron": 1 }, desc: "暗器。" },
    { id: "r_antidote", name: "解毒丹", resultId: "pill_antidote", rumor: "「【止血草】只能治外傷，解毒還需【靈桃核】以毒攻毒。」", materials: { "herb_heal": 2, "mat_peach": 1 }, desc: "保命丹藥。" },
    { id: "r_power_pill", name: "大力丸", resultId: "pill_power", rumor: "「【虎骨】強筋健骨，配上【人參鬚】，吃了力大無窮。」", materials: { "mat_tiger_bone": 1, "mat_ginseng": 2 }, desc: "永久加攻。" },
    { id: "r_money_dart", name: "金錢鏢", resultId: "use_money_dart", rumor: "「最奢侈的暗器，直接用【金剛砂】打造，丟出去就是錢。」", materials: { "mat_sand": 5, "mat_iron": 1 }, desc: "土豪專用。" },
  
  { id: "r_xuanyuan", name: "軒轅劍", resultId: "weapon_xuanyuan", rumor: "「...」", materials: { "mat_sword_frag": 1, "mat_primordial": 1, "mat_demon_blood": 1 }, desc: "上古神器。" }
];

const eventDB = {
    town: [
        { id: "ev_thief", title: "抓小偷", emoji: "🏃", text: "你看到捕快正在追趕一名小偷！", options: [ { text: "絆倒小偷 (善+5)", effect: () => { player.karma += 5; addToLog("你伸腿絆倒了小偷，捕快向你致謝。"); } }, { text: "無視", effect: () => { addToLog("你假裝沒看見，繼續逛街。"); } } ]},
        { id: "ev_beggar", title: "老乞丐", emoji: "🥣", text: "路邊一個老乞丐向你乞討。", options: [ { text: "施捨 10 靈石 (善+2)", effect: () => { if(player.money>=10){player.money-=10; player.karma+=2; addToLog("你施捨了乞丐。");} else {addToLog("你沒錢施捨...");} } }, { text: "踢翻他的碗 (惡+5)", effect: () => { player.karma -= 5; addToLog("你踢翻了乞丐的碗，惡霸！"); } } ]},
      { id: "ev_perform", title: "街頭賣藝", emoji: "🤹", text: "有人在表演胸口碎大石，周圍一片叫好。", options: [ { text: "打賞10靈石(善+1)", effect: function(){ if(player.money>=10){player.money-=10; player.karma+=1; addToLog("你打賞了賣藝人。");} else addToLog("囊中羞澀..."); } }, { text: "喝采", effect: function(){ addToLog("你拍手叫好，心情不錯。"); } } ]},
    { id: "ev_gamble_stone", title: "賭石攤", emoji: "💎", text: "老闆：「50靈石開一顆石頭，可能出玉，也可能只是石頭。」", options: [ { text: "賭一把(-50G)", effect: function(){ if(player.money>=50){player.money-=50; if(Math.random()>0.7){addToBag("acc_jade",1); addToLog("✨ 運氣爆棚！切出了【青玉佩】！");} else {addToBag("mat_iron",1); addToLog("切開是普通的鐵礦...");}} else addToLog("沒錢別賭。"); } }, { text: "離開", effect: function(){ addToLog("十賭九輸，你不為所動。"); } } ]},
    { id: "ev_bully", title: "惡霸逼債", emoji: "👊", text: "幾個惡棍正在圍毆一個欠債的書生。", options: [ { text: "路見不平(戰鬥)", effect: function(){ startCombat(); addToLog("你拔劍相助！"); } }, { text: "幫還100靈石(善+10)", effect: function(){ if(player.money>=100){player.money-=100; player.karma+=10; addToLog("書生感激涕零，送了你家傳寶物。"); addToBag("mat_book_frag", 1);} else addToLog("你沒那麼多錢。"); } } ]},
    { id: "ev_mystery_shop", title: "神秘商人", emoji: "🕵️", text: "角落裡的人低聲道：「我有好東西，只要200靈石。」", options: [ { text: "買(-200G)", effect: function(){ if(player.money>=200){player.money-=200; var pool=["mat_god_iron","mat_ice","mat_fire"]; var item=pool[Math.floor(Math.random()*pool.length)]; addToBag(item,1); addToLog("買到了 "+itemDB[item].name);} else addToLog("買不起。"); } }, { text: "無視", effect: function(){ addToLog("小心是詐騙。"); } } ]},
    { id: "ev_dog", title: "流浪狗", emoji: "🐕", text: "一隻髒兮兮的狗盯著你...的包子。", options: [ { text: "餵食(失去補氣丸)", effect: function(){ if(removeFromBag("pill_001",1)){player.karma+=3; addToLog("狗狗開心地搖尾巴，叼來一塊骨頭。"); addToBag("mat_bone",1);} else addToLog("你身上沒有補氣丸。"); } }, { text: "趕走", effect: function(){ addToLog("你趕走了狗。"); } } ]},
    { id: "ev_bounty", title: "懸賞榜", emoji: "📜", text: "官府懸賞：徵求【鐵劍】一把，賞金300。", options: [ { text: "交付鐵劍", effect: function(){ if(removeFromBag("weapon_iron",1)){player.money+=300; addToLog("獲得賞金300靈石。");} else addToLog("你沒有鐵劍。"); } }, { text: "沒興趣", effect: function(){ addToLog("你轉身離開。"); } } ]},
    { id: "ev_fortune", title: "算命仙", emoji: "🔮", text: "「年輕人，我看你印堂發黑...」", options: [ { text: "給20靈石改運", effect: function(){ if(player.money>=20){player.money-=20; player.karma+=2; addToLog("算命仙說了一些吉祥話。");} else addToLog("沒錢。"); } }, { text: "踢翻攤子(惡+5)", effect: function(){ player.karma-=5; addToLog("你踢翻攤子，大罵迷信！"); } } ]},
    { id: "ev_wallet", title: "遺失的錢袋", emoji: "💰", text: "地上有個沉甸甸的錢袋。", options: [ { text: "據為己有(惡+5)", effect: function(){ player.money+=100; player.karma-=5; addToLog("撿到了100靈石。"); } }, { text: "尋找失主(善+5)", effect: function(){ player.karma+=5; addToLog("失主是個老奶奶，向你連連道謝。"); } } ]},
    { id: "ev_drink", title: "酒樓拚酒", emoji: "🍶", text: "大漢邀請你拚酒：「贏了給你寶貝，輸了扣血！」", options: [ { text: "喝！", effect: function(){ if(Math.random()>0.5){addToBag("mat_horn",1); addToLog("你酒量驚人，贏得【火牛角】！");} else {player.hp-=30; updateUI(); addToLog("你喝掛了，頭痛欲裂(HP-30)。");} } }, { text: "婉拒", effect: function(){ addToLog("酒多傷身。"); } } ]},
    { id: "ev_doctor", title: "行腳醫生", emoji: "⚕️", text: "「祖傳秘方，包治百病！」", options: [ { text: "治療(50G)", effect: function(){ if(player.money>=50){player.money-=50; player.hp=player.maxHp; updateUI(); addToLog("HP完全恢復！");} else addToLog("沒錢看病。"); } }, { text: "離開", effect: function(){ addToLog("你覺得身體倍兒棒。"); } } ]},
    ],
    tower: [
        { id: "ev_corpse", title: "無名屍骸", emoji: "💀", text: "角落裡有一具冒險者的屍骸...", options: [ { text: "搜身 (獲得物品)", effect: () => { findItem("tower_loot"); } }, { text: "安葬 (善+5)", effect: () => { player.karma += 5; addToLog("你安葬了死者，心中感到平靜。"); } } ]},
      { id: "ev_altar_deep", title: "鮮血祭壇(深層)", emoji: "🩸", text: "祭壇上乾涸的血跡散發著誘惑。", options: [ { text: "獻祭自己(HP-50)", effect: function(){ if(player.hp>50){player.hp-=50; player.devil.exp+=80; updateUI(); addToLog("劇痛換來了強大的魔力(+80)。");} else addToLog("血量不足。"); } }, { text: "破壞祭壇", effect: function(){ player.karma+=5; addToBag("mat_god_iron",1); addToLog("祭壇崩塌，掉落一塊神鐵。"); } } ]},
    { id: "ev_skeleton_shop", title: "骷髏商人", emoji: "💀", text: "這具骷髏居然會說話：「用壽命換寶物嗎？」", options: [ { text: "支付20HP", effect: function(){ if(player.hp>20){player.hp-=20; addToBag("mat_soul",2); updateUI(); addToLog("換到了魂魄碎片。");} else addToLog("你快死了。"); } }, { text: "攻擊它", effect: function(){ startCombat(); addToLog("骷髏尖叫著反擊！"); } } ]},
    { id: "ev_cursed_box", title: "詛咒寶箱", emoji: "🎁", text: "箱子上貼滿了封印符咒。", options: [ { text: "撕開封印", effect: function(){ if(Math.random()>0.5){addToBag("weapon_black_iron",1); addToLog("獲得黑鐵劍！");} else {player.hp-=40; updateUI(); addToLog("箱子爆炸了(HP-40)！");} } }, { text: "離開", effect: function(){ addToLog("不要手賤。"); } } ]},
    { id: "ev_succubus", title: "魅魔幻象", emoji: "💋", text: "眼前出現了你最渴望的畫面...", options: [ { text: "沉淪(精-30)", effect: function(){ if(player.mp>=30){player.mp-=30; player.devil.exp+=60; addToLog("雖然精神萎靡，但魔念更深了。");} else addToLog("你太累了，無法產生幻覺。"); } }, { text: "咬舌清醒", effect: function(){ player.hp-=10; updateUI(); addToLog("好痛！但清醒了。"); } } ]},
    { id: "ev_corpse_mt", title: "屍山", emoji: "⛰️", text: "無數屍體堆疊成山。", options: [ { text: "翻找", effect: function(){ addToBag("mat_bone",3); addToBag("money", 50); addToLog("撿到不少骨頭和零錢。"); } }, { text: "焚燒(善+5)", effect: function(){ player.karma+=5; addToLog("塵歸塵，土歸土。"); } } ]},
    { id: "ev_note", title: "瘋狂筆記", emoji: "📔", text: "地上有本沾血的筆記：「不要看...不要看...」", options: [ { text: "閱讀", effect: function(){ player.mp-=20; player.devil.exp+=50; addToLog("san值狂掉，但學到了邪法。"); } }, { text: "撕毀", effect: function(){ addToBag("mat_cloth",1); addToLog("獲得廢紙(布料)。"); } } ]},
    { id: "ev_vine", title: "嗜血藤", emoji: "🌱", text: "這株植物在蠕動。", options: [ { text: "砍斷", effect: function(){ addToBag("mat_poison",1); addToLog("獲得毒囊。"); } }, { text: "靠近觀察", effect: function(){ player.hp-=15; updateUI(); addToLog("被咬了一口！"); } } ]},
    { id: "ev_demon_sword", title: "魔劍殘影", emoji: "🗡️", text: "一把斷劍插在地上，周圍寸草不生。", options: [ { text: "拔劍", effect: function(){ if(player.devil.tier>=3){addToBag("mat_sword_frag",3); addToLog("拔出了幾塊碎片。");} else {player.hp-=30; updateUI(); addToLog("被煞氣彈開！");} } }, { text: "膜拜", effect: function(){ player.devil.exp+=20; addToLog("魔功微漲。"); } } ]},
    { id: "ev_crystal", title: "靈魂水晶", emoji: "💎", text: "漂浮的紫色水晶，觸摸會如何？", options: [ { text: "觸摸(回精)", effect: function(){ player.mp=player.maxMp; updateUI(); addToLog("精神完全恢復，但感覺怪怪的。"); } }, { text: "打碎", effect: function(){ addToBag("mat_star_sand",1); addToLog("獲得星辰砂。"); } } ]},
    { id: "ev_whisper", title: "黑暗低語", emoji: "👂", text: "虛空中傳來竊竊私語，許諾給你力量。", options: [ { text: "接受", effect: function(){ player.atk+=1; player.karma-=10; addToLog("攻擊力+1，善惡-10。"); } }, { text: "拒絕", effect: function(){ addToLog("你堅守本心。"); } } ]},
        { id: "ev_altar", title: "染血祭壇", emoji: "🩸", text: "一座散發著邪氣的祭壇。", options: [ { text: "破壞 (獲得素材)", effect: () => { addToBag("mat_soul", 1); addToLog("你破壞了祭壇，撿到魂魄碎片。"); } }, { text: "獻祭 20 血 (魔修+20)", effect: () => { if(player.hp>20){player.hp-=20; player.devil.exp+=20; addToLog("你獻祭了鮮血，魔功精進。");} else {addToLog("血量不足！");} } } ]}
    ],
    emei: [
        { id: "ev_herb", title: "靈藥圃", emoji: "🌿", text: "發現一片無人看管的藥圃。", options: [ { text: "採摘 (獲得藥材)", effect: () => { findItem("emei_loot"); } }, { text: "離開", effect: () => { addToLog("你沒有打擾這片淨土。"); } } ]},
      { id: "ev_cloud", title: "雲海頓悟", emoji: "☁️", text: "望著翻騰的雲海，你似乎抓住了什麼靈感。", options: [ { text: "冥想(精-20)", effect: function(){ if(player.mp>=20){player.mp-=20; player.immortal.exp+=50; addToLog("心境祥和，修為大漲(+50)。");} else addToLog("精神難以集中。"); } }, { text: "拍照留念", effect: function(){ addToLog("風景真好。"); } } ]},
    { id: "ev_cliff_herb", title: "懸崖靈芝", emoji: "🍄", text: "峭壁上長著一株千年靈芝，採摘極度危險。", options: [ { text: "冒險採摘", effect: function(){ if(Math.random()>0.6){addToBag("mat_ginseng",1); addToLog("身手矯健，採到了！");} else {player.hp-=50; updateUI(); addToLog("腳下一滑，摔得不輕(HP-50)！");} } }, { text: "算了", effect: function(){ addToLog("小命要緊。"); } } ]},
    { id: "ev_monkey", title: "受傷靈猴", emoji: "🐒", text: "一隻靈猴腿受傷了，吱吱亂叫。", options: [ { text: "包紮(消耗止血草)", effect: function(){ if(removeFromBag("herb_heal",1)){player.karma+=5; addToBag("mat_peach",2); addToLog("靈猴送你兩顆靈桃核報恩。");} else addToLog("沒有止血草。"); } }, { text: "無視", effect: function(){ addToLog("物競天擇。"); } } ]},
    { id: "ev_sword_tomb", title: "古劍塚", emoji: "⚔️", text: "遍地插滿了殘劍，隱約有劍氣流動。", options: [ { text: "感悟劍意", effect: function(){ if(player.immortal.tier>=3){addToBag("mat_sword_will",1); addToLog("你獲得了劍意帖！");} else {player.hp-=20; updateUI(); addToLog("修為不足，被劍氣所傷。");} } }, { text: "挖廢鐵", effect: function(){ addToBag("mat_sword_frag",2); addToLog("撿了些碎片。"); } } ]},
    { id: "ev_guide", title: "仙人指路", emoji: "👴", text: "一位白髮老者攔住去路：「年輕人，你的道在哪？」", options: [ { text: "在心中", effect: function(){ player.immortal.exp+=30; addToLog("老者點頭微笑，你頓感通透。"); } }, { text: "在腳下", effect: function(){ player.immortal.exp+=30; addToLog("老者大笑離去，你若有所思。"); } } ]},
    { id: "ev_spring", title: "靈泉", emoji: "💧", text: "發現一處散發靈氣的泉水。", options: [ { text: "飲用", effect: function(){ player.hp=player.maxHp; player.mp=player.maxMp; updateUI(); addToLog("全身舒暢，狀態全滿！"); } }, { text: "裝瓶", effect: function(){ addToBag("pill_mp",1); addToLog("裝了一瓶回氣散。"); } } ]},
    { id: "ev_mist", title: "迷霧", emoji: "🌫️", text: "四周突然升起大霧，方向難辨。", options: [ { text: "強行突破", effect: function(){ player.hp-=10; updateUI(); addToLog("在荊棘中穿行，受了點皮肉傷。"); } }, { text: "等待霧散", effect: function(){ addToLog("過了許久，霧終於散了。"); } } ]},
    { id: "ev_kirin_trace", title: "麒麟蹤跡", emoji: "🐾", text: "地上有巨大的燃燒腳印。", options: [ { text: "追蹤", effect: function(){ if(Math.random()>0.7){startCombat(); addToLog("你追上了神獸！");} else addToLog("跟丟了。"); } }, { text: "採集餘燼", effect: function(){ addToBag("mat_fire",1); addToLog("收集到三昧真火。"); } } ]},
    { id: "ev_thunder_arr", title: "天雷陣", emoji: "⚡", text: "前方雷聲轟鳴，似乎有異寶出世。", options: [ { text: "引雷煉體", effect: function(){ if(player.hp>80){player.hp-=80; player.devil.exp+=100; updateUI(); addToLog("被雷劈得外焦裡嫩，但肉體變強了(魔+100)。");} else addToLog("血量不足，會死的。"); } }, { text: "撿雷擊木", effect: function(){ addToBag("mat_thunder_wood",1); addToLog("在邊緣撿到一塊雷擊木。"); } } ]},
    { id: "ev_preach", title: "講道壇", emoji: "🧘", text: "不知何人留下的蒲團，坐上去似乎能聽見誦經聲。", options: [ { text: "聆聽(精-10)", effect: function(){ if(player.mp>=10){player.mp-=10; player.immortal.exp+=40; addToLog("修為精進(+40)。");} else addToLog("太累了，聽不進去。"); } }, { text: "搜刮", effect: function(){ addToBag("mat_cloth",1); addToLog("撿到一塊布料。"); } } ]},
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
    // --- 1. 基礎與進度 (原有) ---
    { id: "ach_first_blood", name: "初入江湖", desc: "第一次戰鬥勝利", condition: (p) => true },
    { id: "ach_craft", name: "工匠精神", desc: "成功鍛造一次裝備", condition: (p) => true }, // 需配合鍛造邏輯觸發
    { id: "ach_kill_boss", name: "弒神者", desc: "擊敗任意塔主", condition: (p) => p.killedEmeiBoss || p.killedTowerBoss },
    
    // --- 2. 樓層挑戰 (新增細分) ---
    { id: "ach_floor_5", name: "小試牛刀", desc: "到達第 5 層", condition: (p) => p.maxFloor >= 5 },
    { id: "ach_floor_10", name: "初窺門徑", desc: "到達第 10 層", condition: (p) => p.maxFloor >= 10 },
    { id: "ach_floor_20", name: "漸入佳境", desc: "到達第 20 層", condition: (p) => p.maxFloor >= 20 },
    { id: "ach_floor_30", name: "名動一方", desc: "到達第 30 層", condition: (p) => p.maxFloor >= 30 },
    { id: "ach_floor_40", name: "高手寂寞", desc: "到達第 40 層", condition: (p) => p.maxFloor >= 40 },
    { id: "ach_floor_50", name: "登堂入室", desc: "到達第 50 層", condition: (p) => p.maxFloor >= 50 },
    { id: "ach_floor_60", name: "威震江湖", desc: "到達第 60 層", condition: (p) => p.maxFloor >= 60 },
    { id: "ach_floor_70", name: "超凡入聖", desc: "到達第 70 層", condition: (p) => p.maxFloor >= 70 },
    { id: "ach_floor_80", name: "破碎虛空", desc: "到達第 80 層", condition: (p) => p.maxFloor >= 80 },
    { id: "ach_floor_90", name: "天人合一", desc: "到達第 90 層", condition: (p) => p.maxFloor >= 90 },
    { id: "ach_floor_100", name: "登峰造極", desc: "到達第 100 層", condition: (p) => p.maxFloor >= 100 },

    // --- 3. 財富積累 (擴充) ---
    { id: "ach_rich", name: "腰纏萬貫", desc: "擁有 1,000 靈石", condition: (p) => p.money >= 1000 },
    { id: "ach_rich_1w", name: "富甲一方", desc: "擁有 10,000 靈石", condition: (p) => p.money >= 10000 },
    { id: "ach_rich_5w", name: "揮金如土", desc: "擁有 50,000 靈石", condition: (p) => p.money >= 50000 },
    { id: "ach_rich_10w", name: "富可敵國", desc: "擁有 100,000 靈石", condition: (p) => p.money >= 100000 },
    { id: "ach_rich_100w", name: "財神轉世", desc: "擁有 1,000,000 靈石", condition: (p) => p.money >= 1000000 },
    { id: "ach_poor", name: "兩袖清風", desc: "存活5年以上且身無分文", condition: (p) => p.year >= 5 && p.money === 0 },

    // --- 4. 善惡抉擇 (擴充) ---
    { id: "ach_karma_good", name: "大善人", desc: "善惡值達到 100", condition: (p) => p.karma >= 100 },
    { id: "ach_karma_saint", name: "萬家生佛", desc: "善惡值達到 500", condition: (p) => p.karma >= 500 },
    { id: "ach_karma_god", name: "聖人降世", desc: "善惡值達到 1000", condition: (p) => p.karma >= 1000 },
    { id: "ach_karma_evil", name: "大魔頭", desc: "善惡值達到 -100", condition: (p) => p.karma <= -100 },
    { id: "ach_karma_devil", name: "混世魔王", desc: "善惡值達到 -500", condition: (p) => p.karma <= -500 },
    { id: "ach_karma_hell", name: "滅世災厄", desc: "善惡值達到 -1000", condition: (p) => p.karma <= -1000 },
    { id: "ach_karma_zero", name: "逍遙散人", desc: "第10年時善惡值剛好為 0", condition: (p) => p.year >= 10 && p.karma === 0 },

    // --- 5. 修仙境界 (全階位) ---
    { id: "ach_im_1", name: "煉氣入體", desc: "修仙達到 煉氣期", condition: (p) => p.immortal.tier >= 1 },
    { id: "ach_im_2", name: "築基有成", desc: "修仙達到 築基期", condition: (p) => p.immortal.tier >= 2 },
    { id: "ach_im_3", name: "金丹大道", desc: "修仙達到 結丹期", condition: (p) => p.immortal.tier >= 3 },
    { id: "ach_im_4", name: "元嬰出世", desc: "修仙達到 元嬰期", condition: (p) => p.immortal.tier >= 4 },
    { id: "ach_immortal_5", name: "化神遊虛", desc: "修仙達到 化神期", condition: (p) => p.immortal.tier >= 5 },
    { id: "ach_im_6", name: "煉虛合道", desc: "修仙達到 煉虛期", condition: (p) => p.immortal.tier >= 6 },
    { id: "ach_im_7", name: "合體歸一", desc: "修仙達到 合體期", condition: (p) => p.immortal.tier >= 7 },
    { id: "ach_im_8", name: "大乘渡劫", desc: "修仙達到 大乘期", condition: (p) => p.immortal.tier >= 8 },
    { id: "ach_im_9", name: "得道成仙", desc: "修仙達到 真仙境", condition: (p) => p.immortal.tier >= 9 },
    { id: "ach_im_10", name: "金仙不朽", desc: "修仙達到 金仙境", condition: (p) => p.immortal.tier >= 10 },

    // --- 6. 修魔境界 (全階位) ---
    { id: "ach_de_1", name: "魔氣煉體", desc: "修魔達到 煉體期", condition: (p) => p.devil.tier >= 1 },
    { id: "ach_de_2", name: "凝元化煞", desc: "修魔達到 凝元期", condition: (p) => p.devil.tier >= 2 },
    { id: "ach_de_3", name: "意欲無窮", desc: "修魔達到 意欲期", condition: (p) => p.devil.tier >= 3 },
    { id: "ach_de_4", name: "吞噬萬物", desc: "修魔達到 吞噬期", condition: (p) => p.devil.tier >= 4 },
    { id: "ach_devil_5", name: "魔嬰降世", desc: "修魔達到 魔嬰期", condition: (p) => p.devil.tier >= 5 },
    { id: "ach_de_6", name: "魔魂出竅", desc: "修魔達到 出竅期", condition: (p) => p.devil.tier >= 6 },
    { id: "ach_de_7", name: "離識奪舍", desc: "修魔達到 離識期", condition: (p) => p.devil.tier >= 7 },
    { id: "ach_de_8", name: "魔軀合體", desc: "修魔達到 合體期", condition: (p) => p.devil.tier >= 8 },
    { id: "ach_de_9", name: "碎虛入魔", desc: "修魔達到 碎虛期", condition: (p) => p.devil.tier >= 9 },
    { id: "ach_de_10", name: "大乘魔主", desc: "修魔達到 大乘期", condition: (p) => p.devil.tier >= 10 },
    { id: "ach_dual_cult", name: "仙魔雙修", desc: "仙魔皆達到第 5 階", condition: (p) => p.immortal.tier >= 5 && p.devil.tier >= 5 },

    // --- 7. 生存與長壽 ---
    { id: "ach_age_10", name: "初長成", desc: "存活達到 10 年", condition: (p) => p.year >= 10 },
    { id: "ach_age_30", name: "而立之年", desc: "存活達到 30 年", condition: (p) => p.year >= 30 },
    { id: "ach_age_50", name: "知天命", desc: "存活達到 50 年", condition: (p) => p.year >= 50 },
    { id: "ach_age_100", name: "長命百歲", desc: "存活達到 100 年", condition: (p) => p.year >= 100 },
    { id: "ach_age_200", name: "老妖怪", desc: "存活達到 200 年", condition: (p) => p.year >= 200 },
    { id: "ach_age_500", name: "與天同壽", desc: "存活達到 500 年", condition: (p) => p.year >= 500 },

    // --- 8. 屬性極限 ---
    { id: "ach_hp_1k", name: "氣血如牛", desc: "最大 HP 超過 1,000", condition: (p) => p.maxHp >= 1000 },
    { id: "ach_hp_5k", name: "血海無涯", desc: "最大 HP 超過 5,000", condition: (p) => p.maxHp >= 5000 },
    { id: "ach_hp_1w", name: "不死之身", desc: "最大 HP 超過 10,000", condition: (p) => p.maxHp >= 10000 },
    { id: "ach_atk_100", name: "百人斬", desc: "攻擊力超過 100", condition: (p) => p.atk >= 100 },
    { id: "ach_atk_500", name: "千軍辟易", desc: "攻擊力超過 500", condition: (p) => p.atk >= 500 },
    { id: "ach_atk_1k", name: "一擊必殺", desc: "攻擊力超過 1,000", condition: (p) => p.atk >= 1000 },
    { id: "ach_atk_5k", name: "武神降臨", desc: "攻擊力超過 5,000", condition: (p) => p.atk >= 5000 },
    { id: "ach_mp_500", name: "精力充沛", desc: "最大 MP 超過 500", condition: (p) => p.maxMp >= 500 },

    // --- 9. 裝備收集 (需檢查背包或已裝備) ---
    { id: "ach_full_equip", name: "全副武裝", desc: "全身穿滿裝備", condition: (p) => p.equipment.head && p.equipment.body && p.equipment.hand && p.equipment.feet && p.equipment.acc },
    { id: "ach_has_xuanyuan", name: "人皇傳承", desc: "持有【軒轅劍】", condition: (p) => p.bag.some(i=>i.id==='weapon_xuanyuan') || p.equipment.hand==='weapon_xuanyuan' },
    { id: "ach_has_dragon", name: "屠龍勇士", desc: "持有【龍鱗刀】", condition: (p) => p.bag.some(i=>i.id==='weapon_dragon') || p.equipment.hand==='weapon_dragon' },
    { id: "ach_has_phoenix", name: "大聖再世", desc: "持有【鳳翅紫金冠】", condition: (p) => p.bag.some(i=>i.id==='head_phoenix_crown') || p.equipment.head==='head_phoenix_crown' },
    { id: "ach_has_void", name: "虛空行者", desc: "持有【虛空履】", condition: (p) => p.bag.some(i=>i.id==='feet_void') || p.equipment.feet==='feet_void' },
    { id: "ach_has_lotus", name: "救世主", desc: "持有【寶蓮燈】", condition: (p) => p.bag.some(i=>i.id==='acc_lotus_lamp') || p.equipment.acc==='acc_lotus_lamp' },
    { id: "ach_has_turtle", name: "不動如山", desc: "持有【玄武重甲】", condition: (p) => p.bag.some(i=>i.id==='body_turtle') || p.equipment.body==='body_turtle' },
    
    // --- 10. 特殊素材收集 ---
    { id: "ach_mat_god", name: "神匠材料", desc: "持有【神鐵塊】", condition: (p) => p.bag.some(i=>i.id==='mat_god_iron') },
    { id: "ach_mat_blood", name: "禁忌之血", desc: "持有【魔神之血】", condition: (p) => p.bag.some(i=>i.id==='mat_demon_blood') },
    { id: "ach_mat_prim", name: "鴻蒙初開", desc: "持有【鴻蒙紫氣】", condition: (p) => p.bag.some(i=>i.id==='mat_primordial') },
    { id: "ach_mat_star", name: "手摘星辰", desc: "持有【星辰砂】", condition: (p) => p.bag.some(i=>i.id==='mat_star_sand') },
    
    // --- 11. 趣味與其他 ---
    { id: "ach_hoarder", name: "收藏家", desc: "背包內物品種類超過 20 種", condition: (p) => p.bag.length >= 20 },
    { id: "ach_bone_king", name: "白骨大王", desc: "持有超過 20 個【碎骨】", condition: (p) => { let b = p.bag.find(i=>i.id==='mat_bone'); return b && b.count >= 20; } },
    { id: "ach_iron_man", name: "鋼鐵大亨", desc: "持有超過 50 個【鐵礦】", condition: (p) => { let b = p.bag.find(i=>i.id==='mat_iron'); return b && b.count >= 50; } },
  // --- 12. 最終湊滿 100 (新增 6 個) ---
    { id: "ach_polymath", name: "博學多聞", desc: "圖鑑解鎖超過 30 種物品", condition: (p) => p.unlockedCollection.length >= 30 },
    { id: "ach_inventor", name: "發明家", desc: "習得超過 10 種鍛造配方", condition: (p) => p.recipes.length >= 10 },
    { id: "ach_lucky_7", name: "幸運數字", desc: "持有的靈石尾數為 777", condition: (p) => p.money > 0 && p.money.toString().endsWith("777") },
    { id: "ach_streaker", name: "裸奔狂人", desc: "不穿任何裝備到達第 20 層", condition: (p) => p.maxFloor >= 20 && !p.equipment.head && !p.equipment.body && !p.equipment.hand && !p.equipment.feet && !p.equipment.acc },
    { id: "ach_pill_eater", name: "藥罐子", desc: "背包內持有超過 50 顆【補氣丸】", condition: (p) => { let b = p.bag.find(i=>i.id==='pill_001'); return b && b.count >= 50; } },
    { id: "ach_millennium", name: "千年老妖", desc: "存活達到 1,000 年", condition: (p) => p.year >= 1000 },
    { id: "ach_killer", name: "千人斬", desc: "當前層數擊殺數超過 50", condition: (p) => p.floorKills >= 50 }
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
    let equipAtk = 0;
    let equipHp = 0;

    // --- 初始化特殊屬性 ---
    player.crit = 0;      // 爆擊率
    player.dodge = 0;     // 閃避率
    player.lifesteal = 0; // 吸血率
    player.thorns = 0;    // 反傷率
    player.poison = 0;    // 毒傷
    player.bleed = 0;     // 流血(%)
    player.burn = 0;      // 燃燒
    player.freeze = 0;    // 冰凍率
    player.stun = 0;      // 暈眩率
    player.regen = 0;     // 回血
    
    Object.keys(player.equipment).forEach(slot => {
        let itemId = player.equipment[slot];
        if (itemId) {
            let item = itemDB[itemId];
            if (item) {
                if (item.atk) equipAtk += item.atk;
                if (item.hp) equipHp += item.hp;
                
                // --- 累加特殊屬性 ---
                if (item.crit) player.crit += item.crit;
                if (item.dodge) player.dodge += item.dodge;
                if (item.lifesteal) player.lifesteal += item.lifesteal;
                if (item.thorns) player.thorns += item.thorns;
                if (item.poison) player.poison += item.poison;
                if (item.bleed) player.bleed += item.bleed;
                if (item.burn) player.burn += item.burn;
                if (item.freeze) player.freeze += item.freeze;
                if (item.stun) player.stun += item.stun;
                if (item.regen) player.regen += item.regen;
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
    if (player.location === 'tower') pool = enemiesTower;
    else if (player.location === 'emei') pool = enemiesEmei;
    else pool = [enemiesTower[0], enemiesTower[1]];

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
    
    // --- 初始化敵人狀態 ---
    currentEnemy = { 
        ...baseEnemy, 
        hp: Math.floor(baseEnemy.hp * scale), 
        maxHp: Math.floor(baseEnemy.hp * scale),
        atk: Math.floor(baseEnemy.atk * scale),
        // 新增狀態標記
        poisoned: false, 
        bleeding: false, 
        burning: false,
        frozen: false,
        stunned: false
    };
    
    updateMainDisplay("👹", `遭遇 ${currentEnemy.name} (Lv.${player.floor})！`); 
    updateActionButtons(); 
    updateUI();
}

function combatAttack() { 
    passTime(); 
    let logMsg = "";

    // 1. 玩家攻擊階段
    let dmg = player.atk + Math.floor(Math.random() * 5);
    
    // 判定爆擊
    if (Math.random() < player.crit) {
        dmg = Math.floor(dmg * 2);
        logMsg += "💥 爆擊！";
        triggerShake('v'); 
    }

    currentEnemy.hp -= dmg;
    if (currentEnemy.hp < 0) currentEnemy.hp = 0;
    triggerShake('v');
    logMsg += `你造成 ${dmg} 點傷害。`;

    // 判定吸血
    if (player.lifesteal > 0) {
        let heal = Math.floor(dmg * player.lifesteal);
        if (heal > 0) {
            player.hp += heal;
            if(player.hp > player.maxHp) player.hp = player.maxHp;
            logMsg += `(吸血+${heal}) `;
        }
    }

    // 判定施加異常狀態
    if (player.poison > 0 && !currentEnemy.poisoned) { currentEnemy.poisoned = true; logMsg += "🤢敵人中毒！"; }
    if (player.bleed > 0 && !currentEnemy.bleeding) { currentEnemy.bleeding = true; logMsg += "🩸敵人流血！"; }
    if (player.burn > 0 && !currentEnemy.burning) { currentEnemy.burning = true; logMsg += "🔥敵人燃燒！"; }
    if (Math.random() < player.freeze) { currentEnemy.frozen = true; logMsg += "❄️敵人凍結！"; }
    if (Math.random() < player.stun) { currentEnemy.stunned = true; logMsg += "💫敵人暈眩！"; }

    // 2. 判斷敵人是否死亡
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
        if (player.location !== 'home' && player.location !== 'town') player.floorKills++;
        
        let dropMsg = "";
        if (currentEnemy.drop && Math.random() < 0.5) {
            addToBag(currentEnemy.drop, 1);
            let dropItem = itemDB[currentEnemy.drop];
            dropMsg = `\n🎁 掉落：${dropItem.emoji} ${dropItem.name}`;
        }
        updateMainDisplay("✌️", `${logMsg}\n戰勝了 ${currentEnemy.name}！獲得 ${lootMoney} 靈石。${dropMsg}`);
        updateActionButtons();
    } else {
        // 3. 敵人行動階段
        let enemyCanMove = true;
        if (currentEnemy.frozen) {
            logMsg += "\n❄️ 敵人被凍結，無法行動！";
            currentEnemy.frozen = false; // 解凍
            enemyCanMove = false;
        } else if (currentEnemy.stunned) {
            logMsg += "\n💫 敵人暈眩，無法行動！";
            currentEnemy.stunned = false; // 解暈
            enemyCanMove = false;
        }

        if (enemyCanMove) {
            // 判定玩家閃避
            if (Math.random() < player.dodge) {
                logMsg += `\n💨 你閃過了 ${currentEnemy.name} 的攻擊！`;
            } else {
                let enemyDmg = currentEnemy.atk + Math.floor(Math.random()*3);
                player.hp -= enemyDmg;
                logMsg += `\n⚔️ 對手造成 ${enemyDmg} 傷害！`;
                
                // 判定反傷
                if (player.thorns > 0) {
                    let reflect = Math.floor(enemyDmg * player.thorns);
                    currentEnemy.hp -= reflect;
                    logMsg += `(反傷-${reflect})`;
                }
                triggerShake('h');
                checkDeath();
            }
        }

        // 4. 回合結算 (DoT 與 Regen)
        if (currentEnemy.hp > 0) {
            if (currentEnemy.poisoned) {
                let pDmg = player.poison || 10;
                currentEnemy.hp -= pDmg;
                logMsg += `\n🤢 毒發 -${pDmg}`;
            }
            if (currentEnemy.burning) {
                let bDmg = player.burn || 20;
                currentEnemy.hp -= bDmg;
                logMsg += `\n🔥 燃燒 -${bDmg}`;
            }
            if (currentEnemy.bleeding) {
                let blDmg = Math.floor(currentEnemy.hp * 0.05);
                if (blDmg < 1) blDmg = 1;
                currentEnemy.hp -= blDmg;
                logMsg += `\n🩸 流血 -${blDmg}`;
            }
            if (currentEnemy.hp <= 0) {
                logMsg += "\n💀 敵人力竭而亡！";
            }
        }

        // 玩家自動回血
        if (player.regen > 0 && player.hp > 0) {
            player.hp += player.regen;
            if(player.hp > player.maxHp) player.hp = player.maxHp;
            logMsg += `\n💚 再生 +${player.regen}`;
        }

        updateMainDisplay("⚔️", logMsg);
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
    const btnLeft = getEl('btn-action-left'); 
    const btnRight = getEl('btn-action-right'); 
    const btnMain = getEl('btn-action-main'); 
    
    // [修改] 徹底隱藏層數選擇按鈕，只在戰鬥中或特殊需求下透過 JS 呼叫 openFloorSelector()
    addClass('btn-floor-select'); 
    
    btnLeft.className = ''; btnRight.className = ''; btnMain.className = '';
    
    if (player.state === 'combat') {
        if (player.job === '巨賈') { btnLeft.innerText = "💰 賄賂"; btnLeft.onclick = () => combatBribe(); btnLeft.className = "btn-bribe"; } 
        else { btnLeft.innerText = "⚔️ 攻擊"; btnLeft.onclick = () => combatAttack(); btnLeft.className = "btn-attack"; }
        
        btnRight.innerText = "🏃 逃跑"; btnRight.onclick = () => combatFlee(); btnRight.className = "btn-flee";
        
        // 戰鬥中允許選擇層數（變相撤退/換層）
        btnMain.innerText = "🔢 選擇層數"; 
        btnMain.className = "btn-info";
        btnMain.onclick = () => openFloorSelector();
    } else {
        btnLeft.className = "btn-disabled"; btnRight.className = "btn-disabled"; btnLeft.onclick = null; btnRight.onclick = null;
        if (player.location === 'home') { 
            btnLeft.innerText = "..."; 
            
            // [新增] 神秘按鈕邏輯：點擊 10 次獲得神秘之書 (一局一次)
            btnLeft.onclick = () => {
                clickCountHomeLeft++;
                if (clickCountHomeLeft >= 10) {
                     if (!player.mysteryTriggered) {
                         player.mysteryTriggered = true;
                         addToBag('book_porn', 1);
                         alert("......\n(你在床底發現了一本髒髒的書，已放入背包)");
                         saveGame();
                     } else {
                         // 如果已經拿過了
                         addToLog("... (這裡已經什麼都沒有了)");
                     }
                }
            };
            // 使用 fake-disabled class 讓它看起來不能按，但可以按
            btnLeft.className = "fake-disabled"; 
            
            btnRight.innerText = "..."; 
            btnMain.innerText = "🛏️ 休息"; btnMain.onclick = () => actionRest(); 
        } 
        else if (player.location === 'town') { 
            btnLeft.innerText = "⚖️ 交易"; btnLeft.className = "btn-trade"; btnLeft.onclick = () => openShop(); 
            btnRight.innerText = "🔥 鍛造"; btnRight.className = "btn-forge"; btnRight.onclick = () => openForge(); 
            btnMain.innerText = "🚶 到處晃晃"; btnMain.onclick = () => actionWander(); 
        }
        else if (player.location === 'emei') { 
            btnLeft.innerText = "⚔️ 挑戰眾神"; btnLeft.onclick = () => startCombat(); btnLeft.className = "btn-attack"; 
            btnRight.innerText = `仙: ${player.immortal.exp}/${player.immortal.max}`; btnRight.className = "btn-info"; btnRight.onclick = () => alert(`【${player.immortal.name}】`); 
            
            // 這裡直接判斷是否爬塔，移除選擇層數按鈕
            if (player.floorKills >= 5) { 
                btnMain.innerText = "⏫ 前往下一層"; btnMain.className = "btn-next-floor"; btnMain.onclick = () => climbTower(); 
            } else { 
                btnMain.innerText = "🧘 修仙"; btnMain.className = "btn-cultivate"; btnMain.onclick = () => cultivate('immortal'); 
            }
        }
        else if (player.location === 'tower') { 
            btnLeft.innerText = "🏯 挑戰封魔塔"; btnLeft.onclick = () => startCombat(); btnLeft.className = "btn-attack"; 
            btnRight.innerText = `魔: ${player.devil.exp}/${player.devil.max}`; btnRight.className = "btn-info"; btnRight.onclick = () => alert(`【${player.devil.name}】`); 
            
            if (player.floorKills >= 5) { 
                btnMain.innerText = "⏬ 前往下一層"; btnMain.className = "btn-next-floor"; btnMain.onclick = () => climbTower(); 
            } else { 
                btnMain.innerText = "😈 修魔"; btnMain.className = "btn-cultivate"; btnMain.onclick = () => cultivate('devil'); 
            }
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