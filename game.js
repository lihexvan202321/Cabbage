// ==================== 游戏状态管理 ====================
const GameState = {
    // 玩家信息
    playerName: '',  // 玩家名字
    gameTitle: '卷心菜模拟器',  // 游戏标题(可能被彩蛋修改)

    // 基础资源
    inventory: 1000000,
    money: 5000,
    reputation: 50,
    day: 1,
    totalSold: 0,

    // 成本系统
    costPrice: 1.5,  // 卷心菜成本价(每颗)

    // 无尽模式
    endlessMode: false,
    contractSigned: false,  // 是否与种植基地签约
    contractDay: 0,  // 签约天数
    nextDeliveryDay: 0,  // 下次送达天数
    stockoutDays: 0,  // 缺货天数累计
    todayPurchase: 0,  // 今日已购买数量

    // 销售相关
    currentPrice: 3,
    promotions: {
        bogo: false,      // 买一送一
        discount: false,  // 限时折扣
        bundle: false     // 捆绑销售
    },

    // 营销效果
    activeMarketing: [],

    // 店铺
    ownedShops: [],

    // 赛事
    completedEvents: [],

    // 天气
    weather: 'sunny',

    // 特殊状态
    specialEffects: {
        qualityLabel: false,  // 优质卷心菜标签
        newRecipe: false,     // 新菜品解锁
        competitorDebuff: 0   // 竞争对手打压剩余天数
    },

    // 今日销售数据(改为支持多次销售)
    todaySales: {
        session1: { quantity: 0, revenue: 0, hasSold: false },
        session2: { quantity: 0, revenue: 0, hasSold: false },
        currentSession: 0  // 当前是第几次销售(0=未开始, 1=第一次, 2=第二次)
    },

    // 销售倒计时
    salesTimer: {
        isWaiting: false,
        timeLeft: 0,
        timerId: null
    },

    // 游戏状态
    isGameOver: false,
    gameWon: false,

    // 兑换码系统
    codeRedeemed: false,  // 是否已兑换过代码

    // 升级系统
    restaurantLevel: 0,  // 0=普通, 1=餐馆, 2=工厂, 3=实验室
    canUpgradeToRestaurant: false,  // 是否可以升级为餐馆(售卖15天后)
    cannedProduction: {
        enabled: false,  // 是否启用罐头生产
        dailyInput: 1000,  // 每日投入卷心菜数量
        cabbagesPerCan: 1,  // 每个罐头的卷心菜数量(0.1-10)
        pricePerCan: 5  // 每个罐头售价
    },
    
    // 实验室系统
    labProduction: {
        enabled: false,  // 是否启用实验室
        experimentAmount: 1000,  // 每次实验投入卷心菜数(1000-100000,步长1000)
        cultureAmount: 1000,  // 组织培养数量(1000-100000,步长1000)
        experimentLevel: 0,  // 实验等级(影响销量提升)
        lastCultureDay: 0  // 上次使用组织培养的天数
    },
    
    // 科技点系统
    techPoints: 0,                    // 科技点总数
    researchUpgrades: [],             // 已购买的升级 ID 列表
    
    // 卷心菜神学院系统
    academy: {
        unlocked: false,              // 是否已解锁神学院
        divinePoints: 0,              // 神佑点数量
        sacrificeAmount: 10000,       // 每次献祭卷心菜数量(10000-1000000,步长10000)
        salesBonus: 0                 // 永久销量加成
    },
    
    // 自定义比赛系统
    customEvent: null  // 当前进行中的自定义比赛
};

// ==================== 配置常量 ====================
const CONFIG = {
    MAX_DAYS: 90,
    TARGET_SALES: 1000000,
    INITIAL_INVENTORY: 1000000,
    INITIAL_MONEY: 5000,
    INITIAL_REPUTATION: 50,

    // 无尽模式配置
    CONTRACT_DELIVERY: 100000,  // 每7天送达卷心菜数量
    CONTRACT_INTERVAL: 7,  // 合约周期(天)
    CONTRACT_COST: 50000,  // 签约费用
    WHOLESALE_PRICE: 10,  // 无尽模式批发价/颗
    WHOLESALE_MAX_DAILY: 100000,  // 每天最多购买数量
    STOCKOUT_LIMIT: 2,  // 连续缺货天数上限
    BANKRUPTCY_LIMIT: -100000,  // 资金链断裂阈值

    // 升级系统配置
    RESTAURANT_UPGRADE_COST: 1000000,  // 升级为餐馆的费用
    RESTAURANT_UPGRADE_DAY: 15,  // 售卖15天后可升级
    RESTAURANT_COST_PRICE: 10,  // 餐馆成本价
    RESTAURANT_MAX_PRICE: 100,  // 餐馆最高定价
    FACTORY_UPGRADE_COST: 10000000,  // 升级为工厂的费用
    CANNED_MIN_CABBAGES: 0.1,  // 罐头最少卷心菜数量
    CANNED_MAX_CABBAGES: 10,  // 罐头最多卷心菜数量
    
    // 实验室配置
    LAB_UPGRADE_COST: 100000000,  // 升级为实验室的费用(1亿,原10亿)
    LAB_EXPERIMENT_MAX: 100000,  // 实验投入卷心菜上限
    LAB_EXPERIMENT_STEP: 1000,  // 实验滑块步长
    LAB_CULTURE_MAX: 100000,  // 组织培养上限
    LAB_CULTURE_STEP: 1000,  // 组织培养滑块步长

    // 价格配置
    MIN_PRICE: 2,
    MAX_PRICE: 15,
    BASE_PRICE: 3,
    COST_PRICE: 1.5,  // 成本价
    SALES_SESSIONS_PER_DAY: 2,  // 每天销售次数
    SALES_WAIT_TIME: 5,  // 销售等待时间(秒)

    // 营销配置(所有加成缩减到原来的10%)
    MARKETING_OPTIONS: {
        // 基础营销(立即可用)
        flyer: { cost: 200, salesBonus: 0.015, reputationBonus: 0, duration: 3, name: '传单派发', unlockDay: 0, icon: '📄' },
        social: { cost: 500, salesBonus: 0.03, reputationBonus: 0.5, duration: 5, name: '社交媒体', unlockDay: 0, icon: '📱' },
        radio: { cost: 1000, salesBonus: 0.05, reputationBonus: 1, duration: 7, name: '本地电台', unlockDay: 0, icon: '📻' },
        tv: { cost: 3000, salesBonus: 0.1, reputationBonus: 2, duration: 10, name: '电视广告', unlockDay: 0, icon: '📺' },
        
        // 高级营销(每5天解锁1个)
        newspaper: { cost: 1500, salesBonus: 0.06, reputationBonus: 1.5, duration: 8, name: '报纸广告', unlockDay: 5, icon: '📰' },
        billboard: { cost: 2500, salesBonus: 0.08, reputationBonus: 1.2, duration: 12, name: '户外广告牌', unlockDay: 10, icon: '🪧' },
        influencer: { cost: 4000, salesBonus: 0.12, reputationBonus: 3, duration: 6, name: '网红带货', unlockDay: 15, icon: '⭐' },
        livestream: { cost: 5000, salesBonus: 0.15, reputationBonus: 2.5, duration: 5, name: '直播带货', unlockDay: 20, icon: '🎥' },
        festival: { cost: 8000, salesBonus: 0.2, reputationBonus: 5, duration: 15, name: '卷心菜文化节', unlockDay: 25, icon: '🎉' },
        celebrity: { cost: 15000, salesBonus: 0.25, reputationBonus: 8, duration: 20, name: '明星代言', unlockDay: 30, icon: '🌟' },
        documentary: { cost: 25000, salesBonus: 0.3, reputationBonus: 10, duration: 30, name: '纪录片拍摄', unlockDay: 35, icon: '🎬' },
        international: { cost: 50000, salesBonus: 0.4, reputationBonus: 15, duration: 45, name: '国际推广', unlockDay: 40, icon: '🌍' }
    },

    // 店铺配置
    SHOPS: [
        { id: 'stall', name: '路边摊', icon: '🏪', unlockAt: 5000, cost: 1000, dailyCost: 50, salesBonus: 0.30, baseSales: 100 },
        { id: 'market', name: '农贸市场摊位', icon: '🏬', unlockAt: 15000, cost: 3000, dailyCost: 150, salesBonus: 0.60, baseSales: 200, wholesaleBonus: 0.10 },
        { id: 'community', name: '社区小店', icon: '🏠', unlockAt: 30000, cost: 8000, dailyCost: 300, salesBonus: 1.0, baseSales: 300 },
        { id: 'supermarket', name: '连锁超市专柜', icon: '🛒', unlockAt: 60000, cost: 15000, dailyCost: 500, salesBonus: 1.50, baseSales: 500 },
        { id: 'online', name: '线上商城', icon: '💻', unlockAt: 80000, cost: 10000, dailyCost: 200, salesBonus: 0.80, baseSales: 250, weatherImmune: true }
    ],

    // 赛事配置
    EVENTS: {
        15: { type: 'quality', name: '品质大赛', icon: '🏆', cost: 800 },
        30: { type: 'cooking', name: '创意料理大赛', icon: '👨‍🍳', cost: 1200 },
        45: { type: 'quality', name: '品质大赛', icon: '🏆', cost: 800 },
        60: { type: 'cooking', name: '创意料理大赛', icon: '👨‍🍳', cost: 1200 },
        75: { type: 'championship', name: '半决赛', icon: '🥈', cost: 2000 },
        90: { type: 'final', name: '总决赛', icon: '👑', cost: 0 }
    },

    // 天气配置
    WEATHER: {
        sunny: { name: '晴天', icon: '☀️', salesMultiplier: 1.0 },
        cloudy: { name: '多云', icon: '⛅', salesMultiplier: 0.9 },
        rainy: { name: '雨天', icon: '🌧️', salesMultiplier: 0.7 },
        stormy: { name: '暴雨', icon: '⛈️', salesMultiplier: 0.4 },
        snowy: { name: '雪天', icon: '❄️', salesMultiplier: 0.6 }
    },

    // 客户类型配置
    CUSTOMERS: {
        normal: { probability: 0.60, icon: '👤', name: '普通顾客', minDemand: 1, maxDemand: 5 },
        restaurant: { probability: 0.20, icon: '🍽️', name: '餐厅老板', minDemand: 50, maxDemand: 200 },
        wholesaler: { probability: 0.10, icon: '🚚', name: '批发商', minDemand: 500, maxDemand: 2000 },
        blogger: { probability: 0.05, icon: '📸', name: '美食博主', minDemand: 10, maxDemand: 30 },
        competitor: { probability: 0.05, icon: '😈', name: '竞争对手', minDemand: 0, maxDemand: 0 }
    },
    
    // 研究升级配置 (35项)
    RESEARCH_UPGRADES: [
        // 第 1-10 项：销量加成类
        { id: 'sales_boost_1', name: '营销技巧 I', description: '销量 +5%', cost: 1, effect: { type: 'sales_multiplier', value: 0.05 } },
        { id: 'sales_boost_2', name: '营销技巧 II', description: '销量 +8%', cost: 3, effect: { type: 'sales_multiplier', value: 0.08 } },
        { id: 'sales_boost_3', name: '营销技巧 III', description: '销量 +12%', cost: 6, effect: { type: 'sales_multiplier', value: 0.12 } },
        { id: 'sales_boost_4', name: '品牌效应 I', description: '销量 +15%', cost: 10, effect: { type: 'sales_multiplier', value: 0.15 } },
        { id: 'sales_boost_5', name: '品牌效应 II', description: '销量 +20%', cost: 15, effect: { type: 'sales_multiplier', value: 0.20 } },
        { id: 'sales_boost_6', name: '客户忠诚 I', description: '销量 +25%', cost: 22, effect: { type: 'sales_multiplier', value: 0.25 } },
        { id: 'sales_boost_7', name: '客户忠诚 II', description: '销量 +30%', cost: 30, effect: { type: 'sales_multiplier', value: 0.30 } },
        { id: 'sales_boost_8', name: '市场扩张 I', description: '销量 +35%', cost: 40, effect: { type: 'sales_multiplier', value: 0.35 } },
        { id: 'sales_boost_9', name: '市场扩张 II', description: '销量 +40%', cost: 50, effect: { type: 'sales_multiplier', value: 0.40 } },
        { id: 'sales_boost_10', name: '全球知名', description: '销量 +50%', cost: 65, effect: { type: 'sales_multiplier', value: 0.50 } },
        
        // 第 11-18 项：卷心菜获取翻倍类
        { id: 'weekly_cabbage_1', name: '农业补贴 I', description: '每周免费卷心菜 ×1.5', cost: 5, effect: { type: 'weekly_cabbage_multiplier', value: 1.5 } },
        { id: 'weekly_cabbage_2', name: '农业补贴 II', description: '每周免费卷心菜 ×2', cost: 12, effect: { type: 'weekly_cabbage_multiplier', value: 2.0 } },
        { id: 'weekly_cabbage_3', name: '农场合作 I', description: '每周免费卷心菜 ×2.5', cost: 20, effect: { type: 'weekly_cabbage_multiplier', value: 2.5 } },
        { id: 'weekly_cabbage_4', name: '农场合作 II', description: '每周免费卷心菜 ×3', cost: 30, effect: { type: 'weekly_cabbage_multiplier', value: 3.0 } },
        { id: 'weekly_cabbage_5', name: '基因改良 I', description: '每周免费卷心菜 ×4', cost: 45, effect: { type: 'weekly_cabbage_multiplier', value: 4.0 } },
        { id: 'weekly_cabbage_6', name: '基因改良 II', description: '每周免费卷心菜 ×5', cost: 60, effect: { type: 'weekly_cabbage_multiplier', value: 5.0 } },
        { id: 'weekly_cabbage_7', name: '垂直农业', description: '每周免费卷心菜 ×6', cost: 80, effect: { type: 'weekly_cabbage_multiplier', value: 6.0 } },
        { id: 'weekly_cabbage_8', name: '太空种植', description: '每周免费卷心菜 ×8', cost: 100, effect: { type: 'weekly_cabbage_multiplier', value: 8.0 } },
        
        // 第 19-26 项：实验室效率类
        { id: 'lab_efficiency_1', name: '实验加速 I', description: '实验研究成本 -10%', cost: 8, effect: { type: 'experiment_cost_reduction', value: 0.10 } },
        { id: 'lab_efficiency_2', name: '实验加速 II', description: '实验研究成本 -20%', cost: 18, effect: { type: 'experiment_cost_reduction', value: 0.20 } },
        { id: 'lab_efficiency_3', name: '组织培养 I', description: '组织培养冷却时间 -2 天', cost: 25, effect: { type: 'culture_cooldown_reduction', value: 2 } },
        { id: 'lab_efficiency_4', name: '组织培养 II', description: '组织培养冷却时间 -4 天', cost: 40, effect: { type: 'culture_cooldown_reduction', value: 4 } },
        { id: 'lab_efficiency_5', name: '克隆技术 I', description: '组织培养产量 +50%', cost: 55, effect: { type: 'culture_yield_bonus', value: 0.50 } },
        { id: 'lab_efficiency_6', name: '克隆技术 II', description: '组织培养产量 +100%', cost: 75, effect: { type: 'culture_yield_bonus', value: 1.0 } },
        { id: 'lab_efficiency_7', name: '自动化实验', description: '实验等级获取 ×2', cost: 90, effect: { type: 'experiment_level_multiplier', value: 2.0 } },
        { id: 'lab_efficiency_8', name: '量子计算', description: '所有实验室效果 +25%', cost: 110, effect: { type: 'lab_global_bonus', value: 0.25 } },
        
        // 第 27-35 项：其他效果类
        { id: 'passive_sales_1', name: '自动售货 I', description: '被动销售频率 +20%', cost: 15, effect: { type: 'passive_sales_frequency', value: 0.20 } },
        { id: 'passive_sales_2', name: '自动售货 II', description: '被动销售频率 +40%', cost: 35, effect: { type: 'passive_sales_frequency', value: 0.40 } },
        { id: 'marketing_boost_1', name: '广告优化 I', description: '营销效果 +15%', cost: 20, effect: { type: 'marketing_effectiveness', value: 0.15 } },
        { id: 'marketing_boost_2', name: '广告优化 II', description: '营销效果 +30%', cost: 45, effect: { type: 'marketing_effectiveness', value: 0.30 } },
        { id: 'price_premium_1', name: '奢侈品定位', description: '可定价上限 +¥20', cost: 50, effect: { type: 'max_price_increase', value: 20 } },
        { id: 'reputation_boost', name: '声誉加速器', description: '声誉获取 +50%', cost: 60, effect: { type: 'reputation_gain', value: 0.50 } },
        { id: 'cost_reduction', name: '供应链优化', description: '成本价 -¥2', cost: 70, effect: { type: 'cost_price_reduction', value: 2 } },
        { id: 'shop_bonus', name: '连锁经营', description: '店铺收益 +30%', cost: 85, effect: { type: 'shop_revenue_bonus', value: 0.30 } },
        { id: 'ultimate_tech', name: '终极科技', description: '所有效果 +10%', cost: 120, effect: { type: 'global_bonus', value: 0.10 } }
    ],
    
    // 神学院配置
    ACADEMY_UNLOCK_COST: 10000000000,  // 神学院解锁费用(100亿)
    ACADEMY_SACRIFICE_MIN: 10000,       // 最小献祭数量
    ACADEMY_SACRIFICE_MAX: 1000000,     // 最大献祭数量
    ACADEMY_SACRIFICE_STEP: 10000,      // 献祭步长
    
    // 无尽模式赛事配置（每75天一个周期）
    ENDLESS_EVENTS: [
        { day: 105, type: 'quality', name: '品质大赛', icon: '🏆', cost: 800 },
        { day: 120, type: 'cooking', name: '创意料理大赛', icon: '👨‍🍳', cost: 1200 },
        { day: 135, type: 'quality', name: '品质大赛', icon: '🏆', cost: 800 },
        { day: 150, type: 'cooking', name: '创意料理大赛', icon: '👨‍🍳', cost: 1200 },
        { day: 165, type: 'championship', name: '半决赛', icon: '🥈', cost: 2000 },
        { day: 180, type: 'final', name: '总决赛', icon: '👑', cost: 0 }
    ]
};

// ==================== 工具函数 ====================
function formatNumber(num) {
    return num.toLocaleString('zh-CN');
}

function formatMoney(amount) {
    return '¥' + formatNumber(amount);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ==================== 日志系统 ====================
function addLog(message, type = 'neutral') {
    const logEntries = document.getElementById('log-entries');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `第${GameState.day}天: ${message}`;
    logEntries.insertBefore(entry, logEntries.firstChild);

    // 只保留最近10条日志
    while (logEntries.children.length > 10) {
        logEntries.removeChild(logEntries.lastChild);
    }
}

// ==================== UI更新函数 ====================
function updateUI() {
    // 更新头部信息
    document.getElementById('current-day').textContent = GameState.day;
    document.getElementById('sold-count').textContent = formatNumber(GameState.totalSold);

    // 更新无尽模式显示
    const daysLimit = document.getElementById('days-limit');
    const endlessBadge = document.getElementById('endless-badge');
    if (GameState.endlessMode) {
        daysLimit.textContent = '';
        endlessBadge.style.display = 'inline';
    } else {
        daysLimit.textContent = '/ 90';
        endlessBadge.style.display = 'none';
    }

    // 更新进度条
    const progressPercent = GameState.endlessMode ? 100 : (GameState.totalSold / CONFIG.TARGET_SALES) * 100;
    const progressBar = document.getElementById('sales-progress');
    progressBar.style.width = `${progressPercent}%`;

    // 根据完成度改变进度条颜色
    progressBar.classList.remove('low', 'medium', 'high');
    if (progressPercent < 33) {
        progressBar.classList.add('low');
    } else if (progressPercent < 66) {
        progressBar.classList.add('medium');
    } else {
        progressBar.classList.add('high');
    }

    // 更新状态面板
    document.getElementById('inventory').textContent = formatNumber(GameState.inventory);
    document.getElementById('money').textContent = formatMoney(GameState.money);
    document.getElementById('cost-price').textContent = formatMoney(GameState.costPrice) + '/颗';

    // 更新成本价显示(定价区域)
    const costPriceDisplay = document.getElementById('cost-price-display');
    if (costPriceDisplay) {
        costPriceDisplay.textContent = GameState.costPrice;
    }

    document.getElementById('reputation').textContent = `${GameState.reputation}/100`;

    // 更新声誉条
    document.getElementById('reputation-fill').style.width = `${GameState.reputation}%`;

    // 库存警告
    const inventoryEl = document.getElementById('inventory');
    inventoryEl.classList.remove('warning', 'error');
    if (GameState.inventory < 10000) {
        inventoryEl.classList.add('error');
    } else if (GameState.inventory < 30000) {
        inventoryEl.classList.add('warning');
    }

    // 更新天气
    const weatherConfig = CONFIG.WEATHER[GameState.weather];
    document.getElementById('weather-icon').textContent = weatherConfig.icon;
    document.getElementById('weather').textContent = weatherConfig.name;

    // 更新预估销量
    updateEstimatedSales();

    // 更新活跃效果
    updateActiveEffects();

    // 更新店铺列表
    updateShopsList();

    // 更新赛事日历
    updateEventCalendar();

    // 检查并显示当前赛事
    checkCurrentEvent();

    // 更新手动赛事区域显示（无尽模式且超过90天）
    const hostEventSection = document.getElementById('host-event-section');
    if (hostEventSection) {
        const shouldShow = GameState.endlessMode && GameState.day > 90;
        hostEventSection.style.display = shouldShow ? 'block' : 'none';
    }

    // 更新无尽模式批发标签
    const wholesaleTabBtn = document.getElementById('wholesale-tab-btn');
    if (wholesaleTabBtn) {
        wholesaleTabBtn.style.display = GameState.endlessMode ? 'block' : 'none';
    }

    // 更新批发信息
    if (GameState.endlessMode) {
        const remaining = CONFIG.WHOLESALE_MAX_DAILY - GameState.todayPurchase;
        const wholesaleRemaining = document.getElementById('wholesale-remaining');
        const wholesaleTodayPurchase = document.getElementById('wholesale-today-purchase');
        const stockoutDaysDisplay = document.getElementById('stockout-days-display');
        const stockoutLimitDisplay = document.getElementById('stockout-limit-display');

        if (wholesaleRemaining) wholesaleRemaining.textContent = formatNumber(Math.max(0, remaining)) + ' 颗';
        if (wholesaleTodayPurchase) wholesaleTodayPurchase.textContent = formatNumber(GameState.todayPurchase) + ' 颗';
        if (stockoutDaysDisplay) stockoutDaysDisplay.textContent = GameState.stockoutDays + ' 天';
        if (stockoutLimitDisplay) stockoutLimitDisplay.textContent = CONFIG.STOCKOUT_LIMIT + ' 天';
    }

    // 更新升级系统显示
    updateUpgradeSystem();

    // 更新赛事倒计时
    updateEventCountdown();

    // 更新自定义比赛状态显示
    updateCustomEventDisplay();

    // 更新神学院UI（如果已解锁）
    if (GameState.academy && GameState.academy.unlocked) {
        updateAcademyUI();
    }

    // 同步所有文本与真实值
    syncAllText();

    // 更新营销选项显示
    updateMarketingOptions();
}

function updateEstimatedSales() {
    if (GameState.todaySales.session1.hasSold && GameState.todaySales.session2.hasSold) {
        document.getElementById('estimated-sales').textContent = '今日销售已完成';
        return;
    }

    const estimated = calculateEstimatedSales();
    const sessionNum = !GameState.todaySales.session1.hasSold ? 1 : 2;
    document.getElementById('estimated-sales').textContent = `第${sessionNum}次预估: 约 ${formatNumber(estimated)} 颗`;
}

// ==================== 同步所有文本与真实值 ====================
function syncAllText() {
    console.log('syncAllText called, restaurantLevel:', GameState.restaurantLevel);

    // 更新天数限制显示
    const daysLimit = document.getElementById('days-limit');
    if (daysLimit) {
        if (GameState.endlessMode) {
            daysLimit.textContent = '(无尽)';
        } else {
            daysLimit.textContent = `/ ${CONFIG.MAX_DAYS}`;
        }
    }

    // 更新销售目标显示
    const salesTarget = document.getElementById('sales-target');
    if (salesTarget) {
        salesTarget.textContent = formatNumber(CONFIG.TARGET_SALES);
    }

    // 更新价格滑块的最大值 - 使用setAttribute确保生效
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
        const illegalPriceThreshold = Math.floor(maxPrice * 0.99);
        
        // 同时使用setAttribute和property确保生效
        priceSlider.setAttribute('max', illegalPriceThreshold.toString());
        priceSlider.max = illegalPriceThreshold;
        
        console.log('✅ Price slider updated:');
        console.log('  - Target max:', illegalPriceThreshold);
        console.log('  - Attribute max:', priceSlider.getAttribute('max'));
        console.log('  - Property max:', priceSlider.max);
    }

    // 更新销售按钮文本
    const salesBtn = document.getElementById('start-sales-btn');
    if (salesBtn && !GameState.todaySales.session1.hasSold && !GameState.todaySales.session2.hasSold) {
        salesBtn.textContent = `开始第${GameState.day}次销售`;
    }

    // 更新网页标题
    document.title = `${GameState.gameTitle} - Cabbage Simulator`;
}

function updateUpgradeSystem() {
    const upgradeSection = document.getElementById('upgrade-section');
    const restaurantUpgrade = document.getElementById('restaurant-upgrade');
    const factoryUpgrade = document.getElementById('factory-upgrade');
    const labUpgrade = document.getElementById('lab-upgrade');
    const academyUnlock = document.getElementById('academy-unlock');
    const cannedSection = document.getElementById('canned-production-section');
    const labSection = document.getElementById('lab-production-section');
    
    // 子标签按钮
    const factorySubtabBtn = document.getElementById('factory-subtab-btn');
    const labSubtabBtn = document.getElementById('lab-subtab-btn');
    const researchUpgradesSubtabBtn = document.getElementById('research-upgrades-subtab-btn');

    // 显示升级区域
    if (GameState.endlessMode || GameState.restaurantLevel > 0) {
        upgradeSection.style.display = 'block';

        // 根据等级显示不同选项
        if (GameState.restaurantLevel === 0 && GameState.canUpgradeToRestaurant) {
            restaurantUpgrade.style.display = 'block';
            factoryUpgrade.style.display = 'none';
            labUpgrade.style.display = 'none';
            academyUnlock.style.display = 'none';
        } else if (GameState.restaurantLevel === 1) {
            restaurantUpgrade.style.display = 'none';
            factoryUpgrade.style.display = 'block';
            labUpgrade.style.display = 'none';
            academyUnlock.style.display = 'none';
        } else if (GameState.restaurantLevel === 2) {
            restaurantUpgrade.style.display = 'none';
            factoryUpgrade.style.display = 'none';
            labUpgrade.style.display = 'block';
            academyUnlock.style.display = 'none';
        } else if (GameState.restaurantLevel >= 3) {
            restaurantUpgrade.style.display = 'none';
            factoryUpgrade.style.display = 'none';
            labUpgrade.style.display = 'none';
            // 实验室等级>=3时，如果未解锁神学院则显示解锁选项
            academyUnlock.style.display = GameState.academy.unlocked ? 'none' : 'block';
        }
    } else {
        upgradeSection.style.display = 'none';
    }
    
    // 显示/隐藏工厂子标签按钮（餐馆等级>=1时显示）
    if (factorySubtabBtn) {
        factorySubtabBtn.style.display = GameState.restaurantLevel >= 1 ? 'block' : 'none';
    }
    
    // 显示/隐藏实验室子标签按钮（餐馆等级>=2时显示）
    if (labSubtabBtn) {
        labSubtabBtn.style.display = GameState.restaurantLevel >= 2 ? 'block' : 'none';
    }
    
    // 显示/隐藏研究升级子标签按钮（实验室等级>=3时显示）
    if (researchUpgradesSubtabBtn) {
        researchUpgradesSubtabBtn.style.display = GameState.restaurantLevel >= 3 ? 'block' : 'none';
    }
    
    // 显示/隐藏神学院子标签按钮（实验室等级>=3且已解锁神学院时显示）
    const academySubtabBtn = document.getElementById('academy-subtab-btn');
    if (academySubtabBtn) {
        const shouldShow = GameState.restaurantLevel >= 3 && GameState.academy.unlocked;
        academySubtabBtn.style.display = shouldShow ? 'block' : 'none';
    }

    // 显示罐头生产控制
    if (GameState.cannedProduction.enabled) {
        cannedSection.style.display = 'block';
        const cannedSlider = document.getElementById('canned-slider');
        if (cannedSlider) {
            cannedSlider.value = GameState.cannedProduction.cabbagesPerCan;
        }
        const cannedDisplay = document.getElementById('canned-cabbages-display');
        if (cannedDisplay) {
            cannedDisplay.textContent = GameState.cannedProduction.cabbagesPerCan;
        }
        
        const dailyInputSlider = document.getElementById('daily-input-slider');
        if (dailyInputSlider) {
            dailyInputSlider.value = GameState.cannedProduction.dailyInput;
        }
        const dailyInputDisplay = document.getElementById('daily-input-display');
        if (dailyInputDisplay) {
            dailyInputDisplay.textContent = formatNumber(GameState.cannedProduction.dailyInput);
        }
        
        // 更新预计收益显示
        updateCannedPreview();
    } else {
        cannedSection.style.display = 'none';
    }

    // 显示实验室生产控制
    if (GameState.labProduction.enabled) {
        labSection.style.display = 'block';
        const experimentSlider = document.getElementById('experiment-slider');
        if (experimentSlider) {
            experimentSlider.value = GameState.labProduction.experimentAmount;
        }
        const experimentDisplay = document.getElementById('experiment-amount-display');
        if (experimentDisplay) {
            experimentDisplay.textContent = formatNumber(GameState.labProduction.experimentAmount);
        }
        
        // 显示实验等级和销量提升
        const experimentLevelEl = document.getElementById('experiment-level-display');
        if (experimentLevelEl) {
            const level = GameState.labProduction.experimentLevel;
            const bonus = (level / 1000 * 100).toFixed(1);
            experimentLevelEl.textContent = `实验等级: ${formatNumber(level)} (销量+${bonus}%)`;
        }
        
        // 更新科技点显示
        const techPointsDisplay = document.getElementById('tech-points-display');
        if (techPointsDisplay) {
            techPointsDisplay.textContent = formatNumber(GameState.techPoints);
        }
        
        const upgradeTechPoints = document.getElementById('upgrade-tech-points');
        if (upgradeTechPoints) {
            upgradeTechPoints.textContent = formatNumber(GameState.techPoints);
        }
        
        const cultureSlider = document.getElementById('culture-slider');
        if (cultureSlider) {
            cultureSlider.value = GameState.labProduction.cultureAmount;
        }
        const cultureDisplay = document.getElementById('culture-amount-display');
        if (cultureDisplay) {
            cultureDisplay.textContent = formatNumber(GameState.labProduction.cultureAmount);
        }
        
        // 更新组织培养预计消耗和冷却状态
        updateCultureAmount(GameState.labProduction.cultureAmount);
        
        // 显示冷却状态
        const cultureCooldownEl = document.getElementById('culture-cooldown-display');
        if (cultureCooldownEl) {
            const lastDay = GameState.labProduction.lastCultureDay;
            
            // 获取升级效果
            const bonuses = getUpgradeBonuses();
            const cooldownReduction = bonuses.cultureCooldownReduction;
            const actualCooldown = Math.max(1, 10 - cooldownReduction);
            
            if (lastDay > 0) {
                const daysSince = GameState.day - lastDay;
                if (daysSince < actualCooldown) {
                    const remaining = actualCooldown - daysSince;
                    cultureCooldownEl.textContent = `🕒 冷却中: 还需 ${remaining} 天 (第${lastDay + actualCooldown}天可用)`;
                    cultureCooldownEl.style.color = 'var(--error)';
                } else {
                    cultureCooldownEl.textContent = '✅ 已就绪: 可以使用';
                    cultureCooldownEl.style.color = 'var(--success)';
                }
            } else {
                cultureCooldownEl.textContent = '✅ 未使用过: 可以立即使用';
                cultureCooldownEl.style.color = 'var(--success)';
            }
        }
    } else {
        labSection.style.display = 'none';
    }

    // 更新价格滑块最大值(设置为最高定价的99%作为违法上限)
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
        const illegalPriceThreshold = Math.floor(maxPrice * 0.99);
        priceSlider.max = illegalPriceThreshold;
    }
}

// ==================== 更新营销选项显示 ====================
function updateMarketingOptions() {
    const marketingGrid = document.getElementById('marketing-grid');
    if (!marketingGrid) return;

    marketingGrid.innerHTML = '';

    Object.entries(CONFIG.MARKETING_OPTIONS).forEach(([type, config]) => {
        // 检查是否已解锁
        const isUnlocked = GameState.day >= config.unlockDay;
        
        const item = document.createElement('div');
        item.className = 'marketing-item';
        item.dataset.type = type;
        
        if (!isUnlocked) {
            item.classList.add('locked');
            item.innerHTML = `
                <div class="marketing-icon">🔒</div>
                <h3>${config.name}</h3>
                <p class="cost">第 ${config.unlockDay} 天解锁</p>
                <p class="effect">敬请期待</p>
                <button class="btn btn-secondary buy-ad-btn" disabled>未解锁</button>
            `;
        } else {
            // 检查是否已有相同类型的广告
            const existingEffect = GameState.activeMarketing.find(effect => effect.type === type);
            
            item.innerHTML = `
                <div class="marketing-icon">${config.icon}</div>
                <h3>${config.name}</h3>
                <p class="cost">成本: ¥${config.cost.toLocaleString()}</p>
                <p class="effect">销量+${(config.salesBonus * 100).toFixed(0)}%, ${config.reputationBonus > 0 ? '声誉+' + config.reputationBonus + ', ' : ''}持续${config.duration}天</p>
                <button class="btn btn-secondary buy-ad-btn" ${existingEffect ? 'disabled' : ''}>
                    ${existingEffect ? `已购买 (剩余${existingEffect.daysLeft}天)` : '购买'}
                </button>
            `;
        }
        
        marketingGrid.appendChild(item);
    });

    // 重新绑定购买按钮事件
    document.querySelectorAll('.buy-ad-btn').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', (e) => {
                const itemType = e.target.closest('.marketing-item').dataset.type;
                buyMarketing(itemType);
            });
        }
    });
}

function updateActiveEffects() {
    const effectsList = document.getElementById('effects-list');
    effectsList.innerHTML = '';

    // 无尽模式标识
    if (GameState.endlessMode) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = '🌟 无尽模式中';
        div.style.color = 'var(--secondary)';
        div.style.fontWeight = 'bold';
        effectsList.appendChild(div);
    }

    // 合约状态
    if (GameState.contractSigned) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = `📋 种植基地合约 (下次送达: 第${GameState.nextDeliveryDay}天)`;
        effectsList.appendChild(div);
    }

    // 显示营销效果
    GameState.activeMarketing.forEach(effect => {
        const config = CONFIG.MARKETING_OPTIONS[effect.type];
        if (config) {
            const div = document.createElement('div');
            div.className = 'effect-item';
            div.textContent = `${config.name} (剩余${effect.daysLeft}天)`;
            effectsList.appendChild(div);
        }
    });

    // 显示特殊效果
    if (GameState.specialEffects.qualityLabel) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = '✨ 优质卷心菜标签 (+¥1/颗)';
        effectsList.appendChild(div);
    }

    if (GameState.specialEffects.newRecipe) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = '🍲 新菜品解锁 (销量+20%)';
        effectsList.appendChild(div);
    }

    if (GameState.specialEffects.competitorDebuff > 0) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = `⚠️ 竞争对手打压 (剩余${GameState.specialEffects.competitorDebuff}天)`;
        effectsList.appendChild(div);
    }
}

function updateShopsList() {
    const shopsList = document.getElementById('shops-list');
    shopsList.innerHTML = '';

    CONFIG.SHOPS.forEach(shop => {
        const isOwned = GameState.ownedShops.includes(shop.id);
        const isUnlocked = GameState.totalSold >= shop.unlockAt;

        const shopItem = document.createElement('div');
        shopItem.className = `shop-item ${!isUnlocked ? 'shop-locked' : ''}`;

        let html = `
            <div class="shop-info">
                <h3>${shop.icon} ${shop.name}</h3>
                <p>解锁条件: 已售 ${formatNumber(shop.unlockAt)} 颗</p>
                <p>开店成本: ${formatMoney(shop.cost)} | 日运营成本: ${formatMoney(shop.dailyCost)}</p>
                <p>效果: 销量+${(shop.salesBonus * 100).toFixed(0)}%</p>
        `;

        if (shop.wholesaleBonus) {
            html += `<p>额外: 批发商概率+${(shop.wholesaleBonus * 100).toFixed(0)}%</p>`;
        }
        if (shop.weatherImmune) {
            html += `<p>特性: 不受天气影响</p>`;
        }

        html += `</div><div class="shop-actions">`;

        if (isOwned) {
            html += `<span class="shop-owned">✓ 已拥有</span>`;
        } else if (isUnlocked) {
            html += `<button class="btn btn-secondary" onclick="buyShop('${shop.id}')">开店 (${formatMoney(shop.cost)})</button>`;
        } else {
            html += `<button class="btn" disabled>未解锁</button>`;
        }

        html += `</div>`;
        shopItem.innerHTML = html;
        shopsList.appendChild(shopItem);
    });
}

function updateEventCalendar() {
    Object.keys(CONFIG.EVENTS).forEach(day => {
        const statusEl = document.getElementById(`event-${day}`);
        if (!statusEl) return;

        if (GameState.completedEvents.includes(parseInt(day))) {
            statusEl.textContent = '已完成';
            statusEl.className = 'status completed';
        } else if (parseInt(day) === GameState.day) {
            statusEl.textContent = '进行中';
            statusEl.className = 'status active';
        } else if (parseInt(day) < GameState.day) {
            statusEl.textContent = '已错过';
            statusEl.className = 'status';
        } else {
            statusEl.textContent = '待进行';
            statusEl.className = 'status';
        }
    });
}

// ==================== 核心计算引擎 ====================
function calculatePriceCoefficient(price) {
    if (price <= 2) return 2.0;      // 超低价
    if (price <= 4) return 1.5;      // 低价
    if (price === 3) return 1.0;     // 正常价格(3元)
    if (price <= 7) return 0.8;      // 偏高
    if (price <= 10) return 0.5;     // 高价
    if (price <= 15) return 0.3;     // 超高价
    return 0.1;                       // 天价(会被抓)
}

function calculateReputationCoefficient() {
    return 0.5 + (GameState.reputation / 100);
}

function calculateWeatherCoefficient() {
    return CONFIG.WEATHER[GameState.weather].salesMultiplier;
}

function calculateMarketingCoefficient() {
    // 相同的广告营销不能叠加,只取最高值
    const marketingTypes = {};
    GameState.activeMarketing.forEach(effect => {
        const config = CONFIG.MARKETING_OPTIONS[effect.type];
        if (config) {
            if (!marketingTypes[effect.type] || config.salesBonus > marketingTypes[effect.type]) {
                marketingTypes[effect.type] = config.salesBonus;
            }
        }
    });

    let bonus = 0;
    Object.values(marketingTypes).forEach(salesBonus => {
        bonus += salesBonus;
    });
    return 1 + bonus;
}

function calculateShopBonus() {
    let bonus = 0;
    GameState.ownedShops.forEach(shopId => {
        const shop = CONFIG.SHOPS.find(s => s.id === shopId);
        if (shop) {
            bonus += shop.salesBonus;
        }
    });
    return 1 + bonus;
}

function calculatePromotionEffect(price) {
    let finalPrice = price;
    let salesMultiplier = 1;

    if (GameState.promotions.bogo) {
        salesMultiplier *= 2; // 销量翻倍
    }

    if (GameState.promotions.discount) {
        finalPrice *= 0.8; // 降价20%
        salesMultiplier *= 1.6; // 销量+60%
    }

    if (GameState.promotions.bundle) {
        finalPrice += 2; // 单价+¥2
        salesMultiplier *= 1.4; // 销量+40%
    }

    return { price: finalPrice, multiplier: salesMultiplier };
}

function calculateEstimatedSales() {
    const priceCoeff = calculatePriceCoefficient(GameState.currentPrice);
    const repCoeff = calculateReputationCoefficient();
    const weatherCoeff = calculateWeatherCoefficient();
    const marketingCoeff = calculateMarketingCoefficient();
    const shopBonus = calculateShopBonus();

    let promoEffect = calculatePromotionEffect(GameState.currentPrice);

    let baseSales = 1000 * priceCoeff * repCoeff * weatherCoeff * marketingCoeff * shopBonus * promoEffect.multiplier;

    // 实验研究加成: g = a + (a * b / 1000 * 100%)
    // 其中 a = baseSales(初始购买量), b = experimentLevel(实验等级)
    if (GameState.labProduction.experimentLevel > 0) {
        const experimentBonus = baseSales * (GameState.labProduction.experimentLevel / 1000);
        baseSales += experimentBonus;
    }

    // 研究升级加成：销量乘数
    const bonuses = getUpgradeBonuses();
    if (bonuses.salesMultiplier > 0) {
        const upgradeBonus = baseSales * bonuses.salesMultiplier;
        baseSales += upgradeBonus;
    }

    // 全局加成
    if (bonuses.globalBonus > 0) {
        const globalBonus = baseSales * bonuses.globalBonus;
        baseSales += globalBonus;
    }

    // 神学院销量加成（永久）
    if (GameState.academy && GameState.academy.salesBonus > 0) {
        const academyBonus = baseSales * GameState.academy.salesBonus;
        baseSales += academyBonus;
    }

    // 特殊效果加成
    if (GameState.specialEffects.newRecipe) {
        baseSales *= 1.2;
    }

    // 竞争对手打压
    if (GameState.specialEffects.competitorDebuff > 0) {
        baseSales *= 0.7;
    }

    // 劣质卷心菜效果（销量-10%）
    if (GameState.specialEffects.inferiorCabbage > 0) {
        baseSales *= 0.9;
    }

    // 确保不超过库存
    return Math.min(Math.floor(baseSales), GameState.inventory);
}

function calculatePassiveSales() {
    let passiveSales = 0;
    const weatherCoeff = calculateWeatherCoefficient();
    const marketingCoeff = calculateMarketingCoefficient();

    GameState.ownedShops.forEach(shopId => {
        const shop = CONFIG.SHOPS.find(s => s.id === shopId);
        if (!shop) return;

        // 线上商城不受天气影响
        let shopWeatherCoeff = shop.weatherImmune ? 1.0 : weatherCoeff;

        // 暴雨时室外店铺无效
        if (GameState.weather === 'stormy' && !shop.weatherImmune) {
            shopWeatherCoeff = 0;
        }

        // 雨天时路边摊无效
        if (GameState.weather === 'rainy' && shopId === 'stall') {
            shopWeatherCoeff = 0;
        }

        let shopSales = shop.baseSales * shopWeatherCoeff * marketingCoeff;
        passiveSales += Math.floor(shopSales);
    });

    return Math.min(passiveSales, GameState.inventory);
}

// ==================== 销售系统 ====================
function executeSales() {
    console.log('=== 开始执行销售 ===');
    console.log('当前状态:', {
        day: GameState.day,
        inventory: GameState.inventory,
        currentPrice: GameState.currentPrice,
        restaurantLevel: GameState.restaurantLevel,
        session1HasSold: GameState.todaySales.session1.hasSold,
        session2HasSold: GameState.todaySales.session2.hasSold,
        isWaiting: GameState.salesTimer.isWaiting,
        isGameOver: GameState.isGameOver
    });

    // 检查游戏是否结束
    if (GameState.isGameOver) {
        console.log('游戏已结束，无法销售');
        alert('游戏已结束，无法进行销售！');
        return;
    }

    // 检查价格是否超过违法上限(最高定价的99%)
    const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
    const illegalPriceThreshold = Math.floor(maxPrice * 0.99);
    
    console.log('价格检查:', {
        currentPrice: GameState.currentPrice,
        maxPrice: maxPrice,
        illegalPriceThreshold: illegalPriceThreshold
    });
    
    if (GameState.currentPrice > illegalPriceThreshold) {
        console.log('价格超过违法上限，触发游戏结束');
        endGameByAuthority();
        return;
    }

    // 确定当前是第几次销售
    let sessionKey = '';
    if (!GameState.todaySales.session1.hasSold) {
        sessionKey = 'session1';
    } else if (!GameState.todaySales.session2.hasSold) {
        sessionKey = 'session2';
    } else {
        console.log('今日销售已完成');
        alert('今日销售已完成!请进入下一天。');
        return;
    }

    console.log('当前销售场次:', sessionKey);

    if (GameState.inventory <= 0) {
        console.log('库存不足，无法销售');
        alert('库存不足，无法进行销售！');
        return;
    }

    // 检查是否在等待中
    if (GameState.salesTimer.isWaiting) {
        console.log('销售等待中');
        alert('销售进行中,请等待...');
        return;
    }

    // 计算主动销售
    const estimatedSales = calculateEstimatedSales();
    const actualSales = Math.min(estimatedSales, GameState.inventory);

    // 计算实际价格
    let promoEffect = calculatePromotionEffect(GameState.currentPrice);
    let finalPrice = promoEffect.price;

    // 优质标签加成
    if (GameState.specialEffects.qualityLabel) {
        finalPrice += 1;
    }

    // 计算成本
    const totalCost = actualSales * GameState.costPrice;

    // 买一送一的收入计算
    let revenue = actualSales * finalPrice;
    if (GameState.promotions.bogo) {
        revenue = revenue / 2; // 买一送一,收入减半
    }

    // 计算利润
    const profit = Math.floor(revenue) - Math.floor(totalCost);

    // 执行销售
    GameState.inventory -= actualSales;
    GameState.money += Math.floor(revenue);
    GameState.totalSold += actualSales;

    // 记录今日销售
    GameState.todaySales[sessionKey].quantity = actualSales;
    GameState.todaySales[sessionKey].revenue = Math.floor(revenue);
    GameState.todaySales[sessionKey].hasSold = true;
    GameState.todaySales.currentSession = sessionKey === 'session1' ? 1 : 2;

    // 显示结果
    showSalesResult(actualSales, finalPrice, Math.floor(revenue), Math.floor(totalCost), profit, sessionKey);

    // 添加日志
    addLog(`第${GameState.todaySales.currentSession}次销售: 售出 ${formatNumber(actualSales)} 颗, 收入 ${formatMoney(Math.floor(revenue))}, 利润 ${formatMoney(profit)}`, profit >= 0 ? 'positive' : 'negative');

    // 启动倒计时(只有第1次销售后才需要等待)
    if (sessionKey === 'session1' && !GameState.todaySales.session2.hasSold && GameState.inventory > 0) {
        startSalesTimer();
    } else if (GameState.todaySales.session2.hasSold || GameState.inventory <= 0) {
        // 如果已经完成两次销售或库存为0,禁用按钮
        const salesBtn = document.getElementById('start-sales-btn');
        salesBtn.disabled = true;
        salesBtn.textContent = '今日销售已完成';
    }

    // 检查游戏结束
    checkGameEnd();

    // 更新UI
    updateUI();
}

function startSalesTimer() {
    GameState.salesTimer.isWaiting = true;
    GameState.salesTimer.timeLeft = CONFIG.SALES_WAIT_TIME;

    const salesBtn = document.getElementById('start-sales-btn');
    salesBtn.disabled = true;
    salesBtn.textContent = `等待中... ${GameState.salesTimer.timeLeft}秒`;

    GameState.salesTimer.timerId = setInterval(() => {
        GameState.salesTimer.timeLeft--;

        if (GameState.salesTimer.timeLeft <= 0) {
            clearInterval(GameState.salesTimer.timerId);
            GameState.salesTimer.isWaiting = false;
            GameState.salesTimer.timerId = null;

            salesBtn.disabled = false;
            salesBtn.textContent = '开始第2次销售';
            addLog('可以开始第2次销售了!', 'neutral');
        } else {
            salesBtn.textContent = `等待中... ${GameState.salesTimer.timeLeft}秒`;
        }

        updateUI();
    }, 1000);
}

function showSalesResult(quantity, price, revenue, cost, profit, session) {
    const resultDiv = document.getElementById('today-result');
    resultDiv.style.display = 'block';

    // 更新对应次数的销量
    if (session === 'session1') {
        document.getElementById('result-quantity-1').textContent = formatNumber(quantity);
    } else {
        document.getElementById('result-quantity-2').textContent = formatNumber(quantity);
    }

    // 计算总销量和总收入
    const totalQuantity = GameState.todaySales.session1.quantity + GameState.todaySales.session2.quantity;
    const totalRevenue = GameState.todaySales.session1.revenue + GameState.todaySales.session2.revenue;

    document.getElementById('result-quantity').textContent = formatNumber(totalQuantity);
    document.getElementById('result-revenue').textContent = formatMoney(totalRevenue);

    // 添加成本和利润显示
    let costEl = document.getElementById('result-cost');
    let profitEl = document.getElementById('result-profit');

    if (!costEl) {
        const statsDiv = document.querySelector('.result-stats');
        const costRow = document.createElement('div');
        costRow.className = 'stat-row';
        costRow.innerHTML = '<span>成本:</span><strong id="result-cost">¥0</strong>';
        statsDiv.appendChild(costRow);

        const profitRow = document.createElement('div');
        profitRow.className = 'stat-row';
        profitRow.innerHTML = '<span>利润:</span><strong id="result-profit">¥0</strong>';
        statsDiv.appendChild(profitRow);

        costEl = document.getElementById('result-cost');
        profitEl = document.getElementById('result-profit');
    }

    costEl.textContent = formatMoney(cost);
    profitEl.textContent = formatMoney(profit);
    profitEl.style.color = profit >= 0 ? 'var(--success)' : 'var(--error)';

    // 更新标题显示是哪次销售
    const sessionName = session === 'session1' ? '第1次销售' : '第2次销售';
    resultDiv.querySelector('h2').textContent = `${sessionName}结果`;
}

// ==================== 市场营销系统 ====================
function buyMarketing(type) {
    const config = CONFIG.MARKETING_OPTIONS[type];

    // 检查是否已解锁
    if (GameState.day < config.unlockDay) {
        alert(`${config.name} 还未解锁!需要第 ${config.unlockDay} 天才能使用。`);
        return;
    }

    if (GameState.money < config.cost) {
        alert('资金不足!');
        return;
    }

    // 检查是否已有相同类型的广告营销
    const existingEffect = GameState.activeMarketing.find(effect => effect.type === type);
    if (existingEffect) {
        alert(`你已经购买了${config.name},相同的广告不能叠加!剩余${existingEffect.daysLeft}天`);
        return;
    }

    // 扣除资金
    GameState.money -= config.cost;

    // 添加营销效果
    GameState.activeMarketing.push({
        type: type,
        daysLeft: config.duration
    });

    // 立即增加声誉
    if (config.reputationBonus > 0) {
        GameState.reputation = clamp(GameState.reputation + config.reputationBonus, 0, 100);
    }

    addLog(`购买了${config.icon} ${config.name},花费 ${formatMoney(config.cost)}`, 'positive');
    updateUI();
}

function updateMarketingEffects() {
    // 减少所有营销效果的剩余天数
    GameState.activeMarketing = GameState.activeMarketing.filter(effect => {
        effect.daysLeft--;
        return effect.daysLeft > 0;
    });
}

// ==================== 客户互动系统 ====================
function generateCustomer() {
    const rand = Math.random();
    let cumulativeProb = 0;
    let customerType = 'normal';

    // 根据概率选择客户类型
    for (const [type, config] of Object.entries(CONFIG.CUSTOMERS)) {
        cumulativeProb += config.probability;
        if (rand <= cumulativeProb) {
            customerType = type;
            break;
        }
    }

    // 农贸市场摊位增加批发商概率
    if (GameState.ownedShops.includes('market') && customerType === 'normal') {
        if (Math.random() < 0.10) {
            customerType = 'wholesaler';
        }
    }

    const config = CONFIG.CUSTOMERS[customerType];
    const demand = customerType === 'competitor' ? 0 : randomInt(config.minDemand, config.maxDemand);

    // 计算报价
    let offerPrice = GameState.currentPrice;
    if (customerType === 'wholesaler') {
        offerPrice = GameState.currentPrice * 0.7; // 批发商压价30%
    } else if (customerType === 'restaurant') {
        offerPrice = GameState.currentPrice * 1.1; // 餐厅愿意多付10%
    } else if (customerType === 'blogger') {
        offerPrice = GameState.currentPrice * 1.2; // 博主愿意多付20%
    }

    return {
        type: customerType,
        ...config,
        demand: demand,
        offerPrice: Math.max(2, Math.floor(offerPrice))
    };
}

function showCustomerInteraction(customer) {
    const modal = document.getElementById('customer-modal');
    const body = document.getElementById('customer-body');
    const footer = document.getElementById('customer-footer');

    document.getElementById('customer-title').textContent = `${customer.icon} ${customer.name}来访`;

    let html = `
        <div class="customer-info">
            <div class="customer-icon">${customer.icon}</div>
            <div class="customer-type">${customer.name}</div>
    `;

    if (customer.type !== 'competitor') {
        html += `
            <div class="customer-demand">需求: ${formatNumber(customer.demand)} 颗</div>
            <div class="customer-offer">报价: ${formatMoney(customer.offerPrice)}/颗</div>
        `;
    }

    html += `</div>`;
    body.innerHTML = html;

    // 生成操作按钮
    footer.innerHTML = '';

    if (customer.type === 'competitor') {
        // 竞争对手的特殊交互
        footer.innerHTML = `
            <button class="btn btn-danger" onclick="handleCompetitor(false)">拒绝 (声誉+5)</button>
            <button class="btn btn-secondary" onclick="handleCompetitor(true)">接受交易 (资金+¥2000, 声誉-10)</button>
        `;
    } else if (customer.type === 'blogger') {
        // 美食博主可以免费赠送
        footer.innerHTML = `
            <button class="btn btn-success" onclick="handleCustomerDeal(window.currentCustomer, true)">正常交易</button>
            <button class="btn btn-secondary" onclick="handleCustomerDeal(window.currentCustomer, false, true)">免费赠送 (声誉+15)</button>
            <button class="btn btn-danger" onclick="closeModal('customer-modal')">拒绝</button>
        `;
    } else {
        // 普通交易
        footer.innerHTML = `
            <button class="btn btn-success" onclick="handleCustomerDeal(window.currentCustomer, true)">接受交易</button>
            <button class="btn btn-secondary" onclick="handleCustomerNegotiation(window.currentCustomer)">尝试还价</button>
            <button class="btn btn-danger" onclick="closeModal('customer-modal')">拒绝</button>
        `;
    }

    modal.style.display = 'flex';

    // 将customer对象存储到window以便后续使用
    window.currentCustomer = customer;
}

function handleCustomerDeal(customer, accept, freeGiveaway = false) {
    if (freeGiveaway) {
        // 免费赠送
        const giveawayAmount = Math.min(customer.demand, GameState.inventory);
        GameState.inventory -= giveawayAmount;
        GameState.reputation = clamp(GameState.reputation + 15, 0, 100);
        addLog(`免费赠送${giveawayAmount}颗卷心菜给美食博主,声誉+15`, 'positive');
    } else if (accept) {
        // 正常交易
        const quantity = Math.min(customer.demand, GameState.inventory);
        const revenue = quantity * customer.offerPrice;

        GameState.inventory -= quantity;
        GameState.money += revenue;
        GameState.totalSold += quantity;

        addLog(`${customer.name}购买了${formatNumber(quantity)}颗卷心菜,收入${formatMoney(revenue)}`, 'positive');
    }

    closeModal('customer-modal');
    updateUI();
    checkGameEnd();
}

function handleCustomerNegotiation(customer) {
    // 还价成功率基于声誉
    const successRate = 0.3 + (GameState.reputation / 200);
    const success = Math.random() < successRate;

    if (success) {
        const betterPrice = Math.floor((customer.offerPrice + GameState.currentPrice) / 2);
        const quantity = Math.min(customer.demand, GameState.inventory);
        const revenue = quantity * betterPrice;

        GameState.inventory -= quantity;
        GameState.money += revenue;
        GameState.totalSold += quantity;
        GameState.reputation = clamp(GameState.reputation + 3, 0, 100);

        addLog(`还价成功! 以${formatMoney(betterPrice)}/颗的价格售出${formatNumber(quantity)}颗`, 'positive');
    } else {
        addLog(`还价失败,${customer.name}离开了`, 'negative');
        GameState.reputation = clamp(GameState.reputation - 2, 0, 100);
    }

    closeModal('customer-modal');
    updateUI();
    checkGameEnd();
}

function handleCompetitor(accept) {
    if (accept) {
        GameState.money += 2000;
        GameState.reputation = clamp(GameState.reputation - 10, 0, 100);
        addLog('接受了竞争对手的交易,获得¥2000但声誉-10', 'negative');
    } else {
        GameState.reputation = clamp(GameState.reputation + 5, 0, 100);
        addLog('拒绝了竞争对手,声誉+5', 'positive');
    }

    closeModal('customer-modal');
    updateUI();
}

function checkDailyCustomer() {
    // 每天有30%的概率出现特殊客户
    if (Math.random() < 0.3 && GameState.inventory > 0) {
        const customer = generateCustomer();
        setTimeout(() => {
            showCustomerInteraction(customer);
        }, 500);
    }
}

// ==================== 连锁店系统 ====================
function buyShop(shopId) {
    const shop = CONFIG.SHOPS.find(s => s.id === shopId);
    if (!shop) return;

    if (GameState.money < shop.cost) {
        alert('资金不足!');
        return;
    }

    if (GameState.ownedShops.includes(shopId)) {
        alert('已经拥有该店铺!');
        return;
    }

    GameState.money -= shop.cost;
    GameState.ownedShops.push(shopId);

    addLog(`开设了${shop.name},花费${formatMoney(shop.cost)}`, 'positive');
    updateUI();
}

function calculateDailyShopCosts() {
    let totalCost = 0;
    GameState.ownedShops.forEach(shopId => {
        const shop = CONFIG.SHOPS.find(s => s.id === shopId);
        if (shop) {
            totalCost += shop.dailyCost;
        }
    });
    return totalCost;
}

// ==================== 赛事系统 ====================
function checkCurrentEvent() {
    const currentEventDiv = document.getElementById('current-event');
    let eventConfig = null;
    let day = GameState.day;

    // 如果在无尽模式且超过90天，使用无尽模式赛事
    if (GameState.endlessMode && day > 90) {
        // 计算无尽模式中的相对天数（从第91天开始）
        const endlessDay = day - 90;
        // 每75天一个周期循环
        const cycleDay = ((endlessDay - 1) % 75) + 1;
        const actualDay = 90 + cycleDay;

        // 查找对应的无尽模式赛事
        eventConfig = CONFIG.ENDLESS_EVENTS.find(e => e.day === actualDay);

        // 检查是否已完成该赛事
        if (eventConfig && GameState.completedEvents.includes(actualDay)) {
            eventConfig = null;
        }
    } else {
        // 普通模式赛事
        eventConfig = CONFIG.EVENTS[day];
    }

    if (eventConfig) {
        let html = `
            <div class="event-details">
                <div class="event-icon">${eventConfig.icon}</div>
                <div class="event-name">${eventConfig.name}</div>
                <div class="event-description">
        `;

        if (eventConfig.type === 'quality') {
            html += `
                展示你的卷心菜品质! 需要投入营销资金≥¥1,500且声誉≥60才能获胜。
                <br>奖励: 声誉+25, 销量加成50%(持续5天), 解锁"优质卷心菜"标签
            `;
        } else if (eventConfig.type === 'cooking') {
            html += `
                用卷心菜创作美味料理! 获胜概率: 40% + 声誉×0.3%
                <br>奖励: 声誉+30, 解锁新菜品(永久销量+20%)
            `;
        } else if (eventConfig.type === 'championship') {
            html += `
                最终评比! 如果你已经售完10万颗卷心菜,将获得"卷心菜之王"称号和额外奖金¥5,000
            `;
        } else if (eventConfig.type === 'final') {
            html += `
                总决赛! 这是最高荣誉的比赛,证明你是真正的卷心菜大师!
                <br>奖励: 声誉+50, 获得"卷心菜大师"称号, 解锁特殊成就
            `;
        }

        html += `</div>`;

        if (eventConfig.cost > 0) {
            html += `<div class="event-cost">报名费: ${formatMoney(eventConfig.cost)}</div>`;
        }

        html += `
                <div class="event-actions">
                    <button class="btn btn-success" onclick="joinEvent(${eventConfig.day})">参加比赛</button>
                    <button class="btn btn-secondary" onclick="skipEvent(${eventConfig.day})">放弃参加</button>
                </div>
            </div>
        `;

        currentEventDiv.innerHTML = html;
    } else {
        currentEventDiv.innerHTML = '<p class="no-event">今天没有赛事活动</p>';
    }
}

function joinEvent(day) {
    // 支持普通模式和无尽模式的赛事
    let eventConfig = CONFIG.EVENTS[day];
    if (!eventConfig) {
        // 尝试从无尽模式赛事中查找
        eventConfig = CONFIG.ENDLESS_EVENTS.find(e => e.day === day);
    }
    if (!eventConfig) return;

    if (GameState.money < eventConfig.cost) {
        alert('资金不足,无法参加比赛!');
        return;
    }

    GameState.money -= eventConfig.cost;
    GameState.completedEvents.push(day);

    let won = false;

    if (eventConfig.type === 'quality') {
        // 品质大赛: 降低门槛,营销投入≥800或声誉≥40即可
        const totalMarketingSpent = GameState.activeMarketing.reduce((sum, effect) => {
            const config = CONFIG.MARKETING_OPTIONS[effect.type];
            return sum + config.cost;
        }, 0);

        won = (totalMarketingSpent >= 800 || GameState.reputation >= 40);

        if (won) {
            GameState.reputation = clamp(GameState.reputation + 20, 0, 100);
            GameState.specialEffects.qualityLabel = true;

            // 添加5天销量加成
            GameState.activeMarketing.push({
                type: 'event_bonus',
                daysLeft: 5,
                customBonus: 0.3
            });

            addLog('品质大赛获胜! 声誉+20, 获得优质卷心菜标签(售价+¥1),销量加成30%(5天)', 'positive');
        } else {
            // 即使失败也给少量声誉
            GameState.reputation = clamp(GameState.reputation + 5, 0, 100);
            addLog('品质大赛未能获胜,但获得了经验! 声誉+5', 'neutral');
        }
    } else if (eventConfig.type === 'cooking') {
        // 创意料理大赛: 提高胜率
        const winRate = 0.5 + (GameState.reputation * 0.005);
        won = Math.random() < winRate;

        if (won) {
            GameState.reputation = clamp(GameState.reputation + 25, 0, 100);
            GameState.specialEffects.newRecipe = true;
            addLog('创意料理大赛获胜! 声誉+25, 解锁新菜品(永久销量+20%)', 'positive');
        } else {
            // 失败也给少量声誉
            GameState.reputation = clamp(GameState.reputation + 8, 0, 100);
            addLog('创意料理大赛未能获胜,但学到了经验! 声誉+8', 'neutral');
        }
    } else if (eventConfig.type === 'championship') {
        // 半决赛: 检查总销量
        const targetSold = 500000; // 50万目标
        if (GameState.totalSold >= targetSold) {
            GameState.money += 20000;
            GameState.reputation = clamp(GameState.reputation + 30, 0, 100);
            addLog(`半决赛获胜! 总销量${formatNumber(GameState.totalSold)}超过目标${formatNumber(targetSold)},获得奖金${formatMoney(20000)},声誉+30`, 'positive');
        } else {
            GameState.reputation = clamp(GameState.reputation + 10, 0, 100);
            addLog(`半决赛遗憾失利! 总销量${formatNumber(GameState.totalSold)}未达目标${formatNumber(targetSold)},继续努力! 声誉+10`, 'neutral');
        }
    } else if (eventConfig.type === 'final') {
        // 总决赛: 大幅提高奖励
        const finalTarget = CONFIG.TARGET_SALES; // 100万
        if (GameState.totalSold >= finalTarget) {
            // 获胜奖励大幅提升
            GameState.money += 100000;
            GameState.reputation = clamp(GameState.reputation + 50, 0, 100);
            
            // 解锁自己办比赛
            GameState.gameWon = true;
            
            addLog(`🎉 恭喜获得总冠军! 总销量${formatNumber(GameState.totalSold)}达成目标!`, 'positive');
            addLog(`💰 获得奖金${formatMoney(100000)},声誉+50`, 'positive');
            addLog(`🏆 你已成为卷心菜之王! 可以开始举办自己的比赛了!`, 'positive');
            
            // 显示胜利弹窗
            setTimeout(() => {
                showVictoryModal();
            }, 1000);
        } else {
            // 即使失败也有参与奖
            GameState.money += 10000;
            GameState.reputation = clamp(GameState.reputation + 20, 0, 100);
            addLog(`总决赛结束! 总销量${formatNumber(GameState.totalSold)}未达目标${formatNumber(finalTarget)},但获得参与奖${formatMoney(10000)},声誉+20`, 'neutral');
        }
    }

    updateUI();
    checkCurrentEvent();
}

function skipEvent(day) {
    GameState.completedEvents.push(day);
    addLog(`放弃了第${day}天的赛事`, 'neutral');
    updateUI();
}

// ==================== 自定义赛事系统（无尽模式）====================

/**
 * 打开举办比赛表单
 */
function hostCustomEvent() {
    // 检查是否在无尽模式且超过90天
    if (!GameState.endlessMode || GameState.day <= 90) {
        alert('只有在无尽模式中且超过90天后才能举办自定义比赛！');
        return;
    }

    // 关闭可能存在的旧弹窗
    const oldModal = document.getElementById('custom-event-modal');
    if (oldModal) {
        oldModal.remove();
    }

    // 创建表单弹窗
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'custom-event-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <h2>🎯 举办自定义比赛</h2>
            <p style="margin-bottom: 20px; color: #666;">设置你的比赛参数，吸引敌商参加！</p>
            
            <div style="display: grid; gap: 15px;">
                <!-- 比赛名称 -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                        📝 比赛名称
                    </label>
                    <input type="text" id="event-name-input" placeholder="例如：春季卷心菜大赛" 
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem;"
                           maxlength="20">
                </div>
                
                <!-- 报名费 -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                        💰 报名费（最多 ¥10,000）
                    </label>
                    <input type="number" id="event-cost-input" placeholder="5000" min="0" max="10000" value="5000"
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem;">
                    <small style="color: #999;">敌商需要支付的报名费，获胜后可获得</small>
                </div>
                
                <!-- 比赛天数 -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                        📅 比赛持续天数（最多 10 天）
                    </label>
                    <input type="number" id="event-days-input" placeholder="5" min="1" max="10" value="5"
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem;">
                    <small style="color: #999;">比赛将持续的天数，期间将与敌商竞争销量</small>
                </div>
                
                <!-- 敌商信息预览 -->
                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #4a90e2;">
                    <h4 style="margin-bottom: 10px; color: #4a90e2;">👥 敌商信息</h4>
                    <p style="margin: 5px 0; color: #666;">• 参赛敌商数量：<strong id="rival-count-preview">随机 5-15 个</strong></p>
                    <p style="margin: 5px 0; color: #666;">• 敌商实力：你的 <strong>10%</strong>（可联合）</p>
                    <p style="margin: 5px 0; color: #666;">• 获胜奖励：所有敌商报名费 + 5天"优质卷心菜"效果</p>
                    <p style="margin: 5px 0; color: #666;">• 失败惩罚：10天"劣质卷心菜"效果（销量-10%）</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                <button class="btn btn-primary" onclick="confirmHostEvent()" style="width: 100%;">
                    🚀 开始比赛
                </button>
                <button class="btn btn-secondary" onclick="closeModal('custom-event-modal')" style="width: 100%;">
                    取消
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

/**
 * 确认举办比赛
 */
function confirmHostEvent() {
    const eventNameInput = document.getElementById('event-name-input');
    const eventCostInput = document.getElementById('event-cost-input');
    const eventDaysInput = document.getElementById('event-days-input');
    
    if (!eventNameInput || !eventCostInput || !eventDaysInput) {
        alert('表单错误，请重试！');
        closeModal('custom-event-modal');
        return;
    }
    
    const eventName = eventNameInput.value.trim();
    const eventCost = parseInt(eventCostInput.value);
    const eventDays = parseInt(eventDaysInput.value);
    
    // 验证输入
    if (!eventName) {
        alert('请输入比赛名称！');
        return;
    }
    
    if (isNaN(eventCost) || eventCost < 0 || eventCost > 10000) {
        alert('报名费必须在 0-10000 之间！');
        return;
    }
    
    if (isNaN(eventDays) || eventDays < 1 || eventDays > 10) {
        alert('比赛天数必须在 1-10 天之间！');
        return;
    }
    
    // 生成敌商
    const rivalCount = Math.floor(Math.random() * 11) + 5; // 5-15个
    const rivals = [];
    
    for (let i = 0; i < rivalCount; i++) {
        // 敌商基础实力为玩家当前销量的10%
        const basePower = Math.floor(GameState.inventory * 0.1);
        
        // 随机决定是否联合（30%概率联合，联合后实力+50%）
        const isAllied = Math.random() < 0.3;
        const power = isAllied ? Math.floor(basePower * 1.5) : basePower;
        
        rivals.push({
            name: `敌商${i + 1}`,
            basePower: basePower,
            isAllied: isAllied,
            currentPower: power,
            totalSold: 0
        });
    }
    
    // 保存比赛状态到GameState
    GameState.customEvent = {
        active: true,
        name: eventName,
        cost: eventCost,
        duration: eventDays,
        daysLeft: eventDays,
        rivals: rivals,
        playerTotalSold: 0,
        rivalTotalSold: 0,
        startedDay: GameState.day
    };
    
    closeModal('custom-event-modal');
    
    addLog(`🎯 比赛"${eventName}"正式开始！`, 'positive');
    addLog(`👥 共有 ${rivalCount} 个敌商参加比赛`, 'neutral');
    
    updateUI();
}

/**
 * 处理自定义比赛每日逻辑
 */
function processCustomEventDay() {
    if (!GameState.customEvent || !GameState.customEvent.active) {
        return;
    }
    
    const event = GameState.customEvent;
    
    // 计算今日玩家销量
    const todayPlayerSales = GameState.todaySales.session1.quantity + GameState.todaySales.session2.quantity;
    event.playerTotalSold += todayPlayerSales;
    
    // 计算敌商今日销量（不同步玩家实力，使用固定算法）
    let todayRivalSales = 0;
    event.rivals.forEach(rival => {
        // 敌商每日销量为基础实力的随机比例（20%-40%）
        const dailySale = Math.floor(rival.currentPower * (0.2 + Math.random() * 0.2));
        rival.totalSold += dailySale;
        todayRivalSales += dailySale;
    });
    
    event.rivalTotalSold += todayRivalSales;
    
    event.daysLeft--;
    
    addLog(`📊 比赛第${event.duration - event.daysLeft}天：你售出${formatNumber(todayPlayerSales)}颗，敌商共售出${formatNumber(todayRivalSales)}颗`, 'neutral');
    
    // 比赛结束
    if (event.daysLeft <= 0) {
        finishCustomEvent();
    }
    
    updateUI();
}

/**
 * 更新自定义比赛状态显示
 */
function updateCustomEventDisplay() {
    const statusDiv = document.getElementById('custom-event-status');
    const detailsDiv = document.getElementById('custom-event-details');
    const hostSection = document.getElementById('host-event-section');
    
    if (!statusDiv || !detailsDiv) return;
    
    if (GameState.customEvent && GameState.customEvent.active) {
        // 显示比赛状态
        statusDiv.style.display = 'block';
        if (hostSection) hostSection.style.display = 'none'; // 隐藏举办按钮
        
        const event = GameState.customEvent;
        const progress = ((event.duration - event.daysLeft) / event.duration * 100).toFixed(1);
        
        let html = `
            <div style="margin-bottom: 15px;">
                <h4 style="font-size: 1.3em; margin-bottom: 10px;">${event.name}</h4>
                <p>📅 剩余天数：<strong>${event.daysLeft}</strong> / ${event.duration} 天</p>
                <p>💰 报名费：¥${formatNumber(event.cost)} × ${event.rivals.length} 个敌商</p>
                <p>🏆 获胜奖励：¥${formatNumber(event.cost * event.rivals.length)} + 5天优质效果</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px;">📊 比赛进度</h4>
                <div style="background: rgba(255,255,255,0.3); height: 20px; border-radius: 10px; overflow: hidden; margin-bottom: 10px;">
                    <div style="background: white; height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                </div>
                <p>你的总销量：<strong style="font-size: 1.2em;">${formatNumber(event.playerTotalSold)}</strong> 颗</p>
                <p>敌商总销量：<strong style="font-size: 1.2em;">${formatNumber(event.rivalTotalSold)}</strong> 颗</p>
                <p style="margin-top: 10px; font-weight: bold;">
                    ${event.playerTotalSold >= event.rivalTotalSold ? 
                        '✅ 目前领先！继续保持！' : 
                        '⚠️ 目前落后，加油！'}
                </p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                <h4 style="margin-bottom: 10px;">👥 敌商列表（共${event.rivals.length}个）</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${event.rivals.slice(0, 5).map(rival => `
                        <div style="padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                            <span>${rival.name}</span>
                            ${rival.isAllied ? '<span style="background: yellow; color: black; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 5px;">联合</span>' : ''}
                            <span style="float: right;">已售: ${formatNumber(rival.totalSold)}</span>
                        </div>
                    `).join('')}
                    ${event.rivals.length > 5 ? `<p style="text-align: center; margin-top: 10px; font-style: italic;">...还有${event.rivals.length - 5}个敌商</p>` : ''}
                </div>
            </div>
        `;
        
        detailsDiv.innerHTML = html;
    } else {
        // 隐藏比赛状态，显示举办按钮（如果符合条件）
        statusDiv.style.display = 'none';
        if (hostSection) {
            const shouldShow = GameState.endlessMode && GameState.day > 90;
            hostSection.style.display = shouldShow ? 'block' : 'none';
        }
    }
}

/**
 * 结束自定义比赛
 */
function finishCustomEvent() {
    const event = GameState.customEvent;
    if (!event) return;
    
    const playerWon = event.playerTotalSold >= event.rivalTotalSold;
    
    // 计算总报名费
    const totalEntryFee = event.cost * event.rivals.length;
    
    if (playerWon) {
        // 获胜奖励
        GameState.money += totalEntryFee;
        
        // 添加5天优质卷心菜效果
        GameState.activeMarketing.push({
            type: 'quality_label',
            daysLeft: 5,
            customBonus: 0
        });
        
        addLog(`🏆 恭喜！你在"${event.name}"中获胜！`, 'positive');
        addLog(`💰 获得敌商报名费总计 ${formatMoney(totalEntryFee)}`, 'positive');
        addLog(`⭐ 获得5天"优质卷心菜"效果！`, 'positive');
    } else {
        // 失败惩罚：10天劣质卷心菜效果
        GameState.specialEffects.inferiorCabbage = 10; // 10天
        
        addLog(`😢 很遗憾，你在"${event.name}"中失败了...`, 'error');
        addLog(`⚠️ 获得10天"劣质卷心菜"效果（销量-10%）`, 'error');
    }
    
    // 清除比赛状态
    GameState.customEvent = null;
    
    updateUI();
}

// ==================== 赛事倒计时系统 ====================
function updateEventCountdown() {
    const countdownDiv = document.getElementById('event-countdown');
    const daysLeftSpan = document.getElementById('event-days-left');

    if (!countdownDiv || !daysLeftSpan) return;

    let nextEventDay = null;

    // 如果在无尽模式且超过90天
    if (GameState.endlessMode && GameState.day > 90) {
        const endlessDay = GameState.day - 90;
        const cycleDay = ((endlessDay - 1) % 75) + 1;

        // 查找下一个无尽模式赛事
        for (const event of CONFIG.ENDLESS_EVENTS) {
            if (event.day > 90 + cycleDay && !GameState.completedEvents.includes(event.day)) {
                nextEventDay = event.day;
                break;
            }
        }

        // 如果当前周期没有更多赛事，计算下一个周期的第一个赛事
        if (!nextEventDay && CONFIG.ENDLESS_EVENTS.length > 0) {
            const firstEventInCycle = CONFIG.ENDLESS_EVENTS[0].day;
            const daysInCurrentCycle = 75 - cycleDay;
            nextEventDay = GameState.day + daysInCurrentCycle + firstEventInCycle - 90;
        }
    } else if (!GameState.endlessMode) {
        // 普通模式：查找下一个赛事
        for (const [day, event] of Object.entries(CONFIG.EVENTS)) {
            const dayNum = parseInt(day);
            if (dayNum > GameState.day && !GameState.completedEvents.includes(dayNum)) {
                nextEventDay = dayNum;
                break;
            }
        }
    }

    if (nextEventDay) {
        const daysLeft = nextEventDay - GameState.day;
        daysLeftSpan.textContent = daysLeft;
        countdownDiv.style.display = 'block';
    } else {
        countdownDiv.style.display = 'none';
    }
}

// ==================== 随机事件系统 ====================
function triggerRandomEvent() {
    const rand = Math.random();

    if (rand < 0.4) {
        // 正面事件(提高到40%)
        triggerPositiveEvent();
    } else if (rand < 0.65) {
        // 负面事件(降低到25%,原30%)
        triggerNegativeEvent();
    }
    // 35%概率无事件(原40%)
}

function triggerPositiveEvent() {
    const events = [
        {
            name: '丰收季节',
            effect: () => {
                GameState.inventory += 5000;
                return '丰收季节! 库存+5000颗';
            },
            type: 'positive'
        },
        {
            name: '网红推荐',
            effect: () => {
                GameState.reputation = clamp(GameState.reputation + 15, 0, 100);
                return '美食网红推荐了你的卷心菜! 声誉+15';
            },
            type: 'positive'
        },
        {
            name: '政府补贴',
            effect: () => {
                GameState.money += 2000;
                return '获得政府农业补贴¥2,000!';
            },
            type: 'positive'
        },
        {
            name: '好天气',
            effect: () => {
                return '运输顺畅,今日销量+30%';
            },
            type: 'positive',
            salesBonus: 0.3
        },
        {
            name: '客户好评',
            effect: () => {
                GameState.reputation = clamp(GameState.reputation + 10, 0, 100);
                GameState.money += 1000;
                return '收到客户五星好评! 声誉+10,小费¥1,000';
            },
            type: 'positive'
        },
        {
            name: '社区表彰',
            effect: () => {
                GameState.reputation = clamp(GameState.reputation + 20, 0, 100);
                return '因诚信经营获得社区表彰! 声誉+20';
            },
            type: 'positive'
        }
    ];

    const event = events[randomInt(0, events.length - 1)];
    const message = event.effect();
    addLog(message, event.type || 'positive');
}

function triggerNegativeEvent() {
    const events = [
        {
            name: '病虫害',
            effect: () => {
                GameState.inventory = Math.max(0, GameState.inventory - 2000);
                return '发现病虫害! 库存-2000颗';
            },
            type: 'negative'
        },
        {
            name: '负面新闻',
            effect: () => {
                GameState.reputation = clamp(GameState.reputation - 8, 0, 100);
                return '出现负面新闻! 声誉-8';
            },
            type: 'negative'
        },
        {
            name: '设备故障',
            effect: () => {
                GameState.money = Math.max(0, GameState.money - 800);
                return '冷藏设备故障! 维修费¥800';
            },
            type: 'negative'
        },
        {
            name: '竞争对手打压',
            effect: () => {
                GameState.specialEffects.competitorDebuff = 2;
                return '竞争对手恶意打压! 未来2天销量-20%';
            },
            type: 'negative'
        }
    ];

    const event = events[randomInt(0, events.length - 1)];
    const message = event.effect();
    addLog(message, event.type || 'negative');
}

// ==================== 天气系统 ====================
function generateWeather() {
    const weathers = Object.keys(CONFIG.WEATHER);
    const weights = [0.35, 0.25, 0.20, 0.10, 0.10]; // 各天气的概率权重

    const rand = Math.random();
    let cumulativeWeight = 0;

    for (let i = 0; i < weathers.length; i++) {
        cumulativeWeight += weights[i];
        if (rand <= cumulativeWeight) {
            GameState.weather = weathers[i];
            break;
        }
    }
}

// ==================== 每日推进 ====================
function nextDay() {
    if (GameState.isGameOver) {
        return;
    }

    // 合约送达检测
    if (GameState.contractSigned && GameState.day >= GameState.nextDeliveryDay) {
        GameState.inventory += CONFIG.CONTRACT_DELIVERY;
        GameState.nextDeliveryDay = GameState.day + CONFIG.CONTRACT_INTERVAL;
        addLog(`种植基地合约送达! 获得 ${formatNumber(CONFIG.CONTRACT_DELIVERY)} 颗卷心菜`, 'positive');
        addLog(`下次送达: 第${GameState.nextDeliveryDay}天`, 'neutral');
    }

    // 无尽模式：每天开始时重置购买额度
    if (GameState.endlessMode) {
        GameState.todayPurchase = 0;

        // 检查资金链断裂
        if (GameState.money <= CONFIG.BANKRUPTCY_LIMIT) {
            endGameByBankruptcy('你的资金已降至' + formatMoney(GameState.money) + ', 低于' + formatMoney(CONFIG.BANKRUPTCY_LIMIT) + '的警戒线, 资金链断裂!');
            return;
        }
    }

    // 如果今天还没销售,先执行销售
    if (!GameState.todaySales.session1.hasSold && GameState.inventory > 0) {
        executeSales();
    }

    // 执行罐头生产销售(自动)
    if (GameState.cannedProduction.enabled) {
        executeCannedProduction();
    }

    // 计算被动销量
    const passiveSales = calculatePassiveSales();
    if (passiveSales > 0) {
        let passiveRevenue = passiveSales * GameState.currentPrice;

        if (GameState.specialEffects.qualityLabel) {
            passiveRevenue += passiveSales;
        }

        GameState.inventory -= passiveSales;
        GameState.money += Math.floor(passiveRevenue);
        GameState.totalSold += passiveSales;

        addLog(`店铺被动销售: ${formatNumber(passiveSales)} 颗,收入 ${formatMoney(Math.floor(passiveRevenue))}`, 'positive');
    }

    // 扣除店铺运营成本
    const dailyCosts = calculateDailyShopCosts();
    if (dailyCosts > 0) {
        GameState.money -= dailyCosts;
        addLog(`店铺运营成本: ${formatMoney(dailyCosts)}`, 'negative');
    }

    // 更新营销效果
    updateMarketingEffects();

    // 处理自定义比赛逻辑
    processCustomEventDay();

    // 减少特殊效果计时器
    if (GameState.specialEffects.competitorDebuff > 0) {
        GameState.specialEffects.competitorDebuff--;
    }
    
    // 减少劣质卷心菜效果计时器
    if (GameState.specialEffects.inferiorCabbage > 0) {
        GameState.specialEffects.inferiorCabbage--;
        if (GameState.specialEffects.inferiorCabbage === 0) {
            addLog('✅ "劣质卷心菜"效果已消失', 'positive');
        }
    }

    // 重置今日销售状态
    GameState.todaySales.session1.hasSold = false;
    GameState.todaySales.session2.hasSold = false;
    GameState.todaySales.currentSession = 0;

    // 无尽模式缺货天数检测
    if (GameState.endlessMode) {
        if (GameState.inventory <= 0) {
            GameState.stockoutDays++;
            addLog(`⚠️ 库存耗尽! 连续缺货第 ${GameState.stockoutDays} 天 (超过${CONFIG.STOCKOUT_LIMIT}天将资金链断裂)`, 'negative');

            if (GameState.stockoutDays > CONFIG.STOCKOUT_LIMIT) {
                endGameByBankruptcy(`卷心菜连续缺货 ${GameState.stockoutDays} 天 (超过${CONFIG.STOCKOUT_LIMIT}天上限), 供应链断裂!`);
                return;
            }
        } else {
            GameState.stockoutDays = 0;
        }
    }

    // 清除销售计时器
    if (GameState.salesTimer.timerId) {
        clearInterval(GameState.salesTimer.timerId);
        GameState.salesTimer.timerId = null;
    }
    GameState.salesTimer.isWaiting = false;
    GameState.salesTimer.timeLeft = 0;

    // 重置销售按钮
    const salesBtn = document.getElementById('start-sales-btn');
    if (salesBtn) {
        salesBtn.disabled = false;
        salesBtn.textContent = '开始第1次销售';
    }

    // 隐藏销售结果
    document.getElementById('today-result').style.display = 'none';
    // 移除成本和利润显示
    const costEl = document.getElementById('result-cost');
    const profitEl = document.getElementById('result-profit');
    if (costEl && costEl.parentElement) {
        costEl.parentElement.remove();
    }
    if (profitEl && profitEl.parentElement) {
        profitEl.parentElement.remove();
    }

    // 进入下一天
    GameState.day++;

    // 生成新天气
    generateWeather();

    // 触发随机事件
    triggerRandomEvent();

    // 检查是否有特殊客户
    checkDailyCustomer();

    // 检查餐馆升级条件
    checkRestaurantUpgrade();

    // 更新UI
    updateUI();

    // 检查游戏结束
    checkGameEnd();

    // 保存游戏
    saveGame();
}

// ==================== 游戏结束检测 ====================
function checkGameEnd() {
    if (GameState.isGameOver) {
        return;
    }

    // 胜利条件: 售完所有卷心菜(且未在无尽模式)
    if ((GameState.inventory <= 0 || GameState.totalSold >= CONFIG.TARGET_SALES) && !GameState.endlessMode) {
        // 触发无尽模式
        triggerEndlessMode();
        return;
    }

    // 失败条件: 超过90天(且未在无尽模式)
    if (GameState.day > CONFIG.MAX_DAYS && !GameState.endlessMode) {
        endGame(false);
        return;
    }
}

// 触发无尽模式
function triggerEndlessMode() {
    GameState.endlessMode = true;
    GameState.inventory = 0; // 先清空

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const body = document.getElementById('game-over-body');

    title.textContent = '🎉 恭喜通关!';
    title.className = 'result-title win';

    body.innerHTML = `
        <div class="game-over-result">
            <div class="result-icon">🏆</div>
            <div class="result-title win">你成功售完了所有卷心菜!</div>
            <div class="result-stats-final">
                <div class="result-stat">
                    <div class="label">用时</div>
                    <div class="value">${GameState.day} 天</div>
                </div>
                <div class="result-stat">
                    <div class="label">总销量</div>
                    <div class="value">${formatNumber(GameState.totalSold)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终资金</div>
                    <div class="value">${formatMoney(GameState.money)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终声誉</div>
                    <div class="value">${GameState.reputation}/100</div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 8px;">
                <h3 style="color: var(--primary);">🌟 无尽模式已解锁!</h3>
                <p style="margin: 10px 0; color: var(--text-secondary);">
                    你已经完成了90天售完1,000,000颗卷心菜的目标!<br>
                    现在你可以继续经营,与卷心菜种植基地签约获得源源不断的卷心菜。
                </p>
            </div>
            <div style="margin-top: 15px; padding: 15px; background: #fff8e1; border-radius: 8px;">
                <h4>📋 种植基地合约</h4>
                <p style="margin: 8px 0; font-size: 0.9rem; color: var(--text-secondary);">
                    • 签约费用: <strong style="color: var(--error);">${formatMoney(CONFIG.CONTRACT_COST)}</strong><br>
                    • 合约周期: 每 <strong>${CONFIG.CONTRACT_INTERVAL}</strong> 天送达 <strong>${formatNumber(CONFIG.CONTRACT_DELIVERY)}</strong> 颗卷心菜<br>
                    • 成本价: <strong>${formatMoney(GameState.costPrice)}</strong>/颗<br>
                    • 合约无限期有效,可持续经营!
                </p>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // 添加合约按钮
    const modalFooter = document.getElementById('game-over-modal').querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button class="btn btn-success" onclick="signContract()" ${GameState.money < CONFIG.CONTRACT_COST ? 'disabled' : ''}>
            ${GameState.money < CONFIG.CONTRACT_COST ? '资金不足' : '签约种植基地'} (${formatMoney(CONFIG.CONTRACT_COST)})
        </button>
        <button class="btn btn-secondary" onclick="startEndlessMode()">直接开始无尽模式</button>
    `;

    updateUI();
}

// 开始无尽模式(不签约)
function startEndlessMode() {
    closeModal('game-over-modal');
    addLog('已进入无尽模式! 你仍有库存可以继续销售。', 'neutral');
    // 给一些初始库存
    GameState.inventory = 50000;
    addLog(`获得初始库存: ${formatNumber(50000)} 颗卷心菜`, 'positive');
    updateUI();
}

// 与种植基地签约
function signContract() {
    if (GameState.money < CONFIG.CONTRACT_COST) {
        alert('资金不足!签约需要' + formatMoney(CONFIG.CONTRACT_COST));
        return;
    }

    GameState.money -= CONFIG.CONTRACT_COST;
    GameState.contractSigned = true;
    GameState.contractDay = GameState.day;
    GameState.nextDeliveryDay = GameState.day + CONFIG.CONTRACT_INTERVAL;
    GameState.inventory += CONFIG.CONTRACT_DELIVERY;

    addLog(`与卷心菜种植基地签约成功! 花费${formatMoney(CONFIG.CONTRACT_COST)}, 获得${formatNumber(CONFIG.CONTRACT_DELIVERY)}颗卷心菜`, 'positive');
    addLog(`下次送达: 第${GameState.nextDeliveryDay}天`, 'neutral');

    closeModal('game-over-modal');
    updateUI();
}

// 价格违规导致的游戏结束
function endGameByAuthority() {
    GameState.isGameOver = true;
    GameState.gameWon = false;

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const body = document.getElementById('game-over-body');

    title.textContent = '🚔 游戏结束';
    title.className = 'result-title lose';

    body.innerHTML = `
        <div class="game-over-result">
            <div class="result-icon">🚫</div>
            <div class="result-title lose">你因定价过高被市场监督管理局带走!</div>
            <p style="margin: 20px 0; font-size: 1.1rem; color: var(--text-secondary);">
                你的卷心菜定价为 <strong style="color: var(--error); font-size: 1.3rem;">${formatMoney(GameState.currentPrice)}</strong>,
                超过了法定上限 <strong style="color: var(--error);">${formatMoney(illegalPriceThreshold)}</strong>!
            </p>
            <div class="result-stats-final">
                <div class="result-stat">
                    <div class="label">经营天数</div>
                    <div class="value">${GameState.day} 天</div>
                </div>
                <div class="result-stat">
                    <div class="label">总销量</div>
                    <div class="value">${formatNumber(GameState.totalSold)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">剩余库存</div>
                    <div class="value">${formatNumber(GameState.inventory)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终资金</div>
                    <div class="value">${formatMoney(GameState.money)}</div>
                </div>
            </div>
            <p style="margin-top: 20px; color: var(--text-secondary); font-style: italic;">
                "哄抬物价是违法行为,请合理定价!法定最高定价为${formatMoney(maxPrice)}元的99%即${formatMoney(illegalPriceThreshold)}元"
            </p>
        </div>
    `;

    modal.style.display = 'flex';

    // 清除存档
    localStorage.removeItem('cabbageSimulatorSave');
}

// 资金链断裂导致的游戏结束
function endGameByBankruptcy(reason) {
    GameState.isGameOver = true;
    GameState.gameWon = false;

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const body = document.getElementById('game-over-body');

    title.textContent = '💸 游戏结束';
    title.className = 'result-title lose';

    body.innerHTML = `
        <div class="game-over-result">
            <div class="result-icon">📉</div>
            <div class="result-title lose">资金链断裂,经营破产!</div>
            <p style="margin: 20px 0; font-size: 1.1rem; color: var(--error);">
                ${reason}
            </p>
            <div class="result-stats-final">
                <div class="result-stat">
                    <div class="label">经营天数</div>
                    <div class="value">${GameState.day} 天</div>
                </div>
                <div class="result-stat">
                    <div class="label">总销量</div>
                    <div class="value">${formatNumber(GameState.totalSold)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">剩余库存</div>
                    <div class="value">${formatNumber(GameState.inventory)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终资金</div>
                    <div class="value">${formatMoney(GameState.money)}</div>
                </div>
            </div>
            <p style="margin-top: 20px; color: var(--text-secondary); font-style: italic;">
                "经营有风险,投资需谨慎!合理控制库存和资金周转。"
            </p>
        </div>
    `;

    modal.style.display = 'flex';

    // 清除存档
    localStorage.removeItem('cabbageSimulatorSave');
}

// ==================== 胜利弹窗(90日获胜后) ====================
function showVictoryModal() {
    const modal = document.getElementById('custom-modal');
    const body = document.getElementById('modal-body');

    body.innerHTML = `
        <div class="game-over-result">
            <div class="result-icon">🏆</div>
            <div class="result-title win">🎉 恭喜获得总冠军!</div>
            <p style="margin: 20px 0; font-size: 1.1rem; color: var(--text-secondary);">
                你在90天内售出了 <strong style="color: var(--success); font-size: 1.3rem;">${formatNumber(GameState.totalSold)}</strong> 颗卷心菜!
            </p>
            <div class="result-stats-final">
                <div class="result-stat">
                    <div class="label">最终资金</div>
                    <div class="value">${formatMoney(GameState.money)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终声誉</div>
                    <div class="value">${GameState.reputation}/100</div>
                </div>
                <div class="result-stat">
                    <div class="label">游戏评级</div>
                    <div class="value" id="final-rating">计算中...</div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
                <h3 style="color: white; margin-bottom: 10px;">🌟 现在你可以举办自己的比赛了!</h3>
                <p style="margin: 10px 0;">
                    作为卷心菜之王,你现在可以:<br>
                    • 举办奥林匹克卷心菜竞赛<br>
                    • 邀请其他玩家参加<br>
                    • 制定比赛规则和目标<br>
                    • 成为卷心菜界的主办方!
                </p>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="closeModal('custom-modal')" class="btn btn-primary" style="flex: 1;">继续经营</button>
                <button onclick="startOwnCompetition()" class="btn btn-success" style="flex: 1;">🏆 举办自己的比赛</button>
            </div>
        </div>
    `;

    // 计算并显示评级
    const rating = calculateGameRating();
    const ratingEl = document.getElementById('final-rating');
    if (ratingEl) {
        ratingEl.textContent = `${rating.rating}级 (${rating.score}分)`;
        ratingEl.style.color = rating.score >= 100 ? 'var(--success)' : rating.score >= 70 ? 'var(--warning)' : 'var(--error)';
    }

    modal.style.display = 'flex';
}

// 举办自己的比赛
function startOwnCompetition() {
    closeModal('custom-modal');
    
    // 更新赛事活动栏显示自己办的比赛
    const eventsTab = document.querySelector('[data-tab="events"]');
    if (eventsTab) {
        eventsTab.textContent = '🏆 我的比赛';
    }
    
    addLog('🏆 你开始筹备自己的奥林匹克卷心菜竞赛!', 'positive');
    alert('恭喜你成为卷心菜竞赛主办方!\n\n赛事活动栏已更新为"我的比赛"\n\n你可以在这里举办属于自己的卷心菜竞赛!');
}

// 无尽模式批发购买
function purchaseWholesale() {
    if (!GameState.endlessMode) return;

    const pricePerUnit = CONFIG.WHOLESALE_PRICE;
    const maxCanBuy = CONFIG.WHOLESALE_MAX_DAILY - GameState.todayPurchase;

    if (maxCanBuy <= 0) {
        alert('今日购买额度已用完! 每天最多购买' + formatNumber(CONFIG.WHOLESALE_MAX_DAILY) + '颗');
        return;
    }

    // 弹窗输入购买数量
    const input = prompt(
        `无尽模式批发购买\n\n` +
        `• 批发价: ${formatMoney(pricePerUnit)}/颗\n` +
        `• 今日已购买: ${formatNumber(GameState.todayPurchase)} 颗\n` +
        `• 今日剩余额度: ${formatNumber(maxCanBuy)} 颗\n` +
        `• 当前资金: ${formatMoney(GameState.money)}\n\n` +
        `请输入购买数量 (1-${maxCanBuy}):`
    );

    if (input === null) return;

    const quantity = parseInt(input);
    if (isNaN(quantity) || quantity <= 0) {
        alert('请输入有效的数量!');
        return;
    }

    if (quantity > maxCanBuy) {
        alert(`今日剩余额度不足! 最多可购买 ${formatNumber(maxCanBuy)} 颗`);
        return;
    }

    const totalCost = quantity * pricePerUnit;

    GameState.money -= totalCost;
    GameState.inventory += quantity;
    GameState.todayPurchase += quantity;

    addLog(`批发购买 ${formatNumber(quantity)} 颗卷心菜, 花费 ${formatMoney(totalCost)}`, 'neutral');
    addLog(`今日已购买: ${formatNumber(GameState.todayPurchase)}/${formatNumber(CONFIG.WHOLESALE_MAX_DAILY)} 颗`, 'neutral');

    // 检查资金链
    if (GameState.money <= CONFIG.BANKRUPTCY_LIMIT) {
        endGameByBankruptcy('购买后资金降至' + formatMoney(GameState.money) + ', 低于' + formatMoney(CONFIG.BANKRUPTCY_LIMIT) + '的警戒线!');
        return;
    }

    updateUI();
}

function endGame(won) {
    GameState.isGameOver = true;
    GameState.gameWon = won;

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const body = document.getElementById('game-over-body');

    if (won) {
        title.textContent = '🎉 恭喜通关!';
        title.className = 'result-title win';

        // 计算评分
        const ratingData = calculateGameRating();
        const daysUsed = GameState.day;
        const efficiency = Math.round((CONFIG.TARGET_SALES / daysUsed) * 100) / 100;

        body.innerHTML = `
            <div class="game-over-result">
                <div class="result-icon">🏆</div>
                <div class="result-title win">你成功在${daysUsed}天内售完了所有卷心菜!</div>
                <div class="result-stats-final">
                    <div class="result-stat">
                        <div class="label">用时</div>
                        <div class="value">${daysUsed} 天</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">日均销量</div>
                        <div class="value">${formatNumber(efficiency)}</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">最终资金</div>
                        <div class="value">${formatMoney(GameState.money)}</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">最终声誉</div>
                        <div class="value">${GameState.reputation}/100</div>
                    </div>
                </div>
                <div style="font-size: 2rem; margin: 20px 0;">
                    评级: <strong style="color: var(--primary); font-size: 3rem;">${ratingData.rating}</strong>
                    <div style="font-size: 1.2rem; color: var(--text-secondary); margin-top: 5px;">
                        综合得分: ${ratingData.score} 分
                    </div>
                </div>
            </div>
        `;
    } else {
        title.textContent = '😢 游戏结束';
        title.className = 'result-title lose';

        const remaining = GameState.inventory;
        const completionRate = ((GameState.totalSold / CONFIG.TARGET_SALES) * 100).toFixed(1);
        const ratingData = calculateGameRating();

        body.innerHTML = `
            <div class="game-over-result">
                <div class="result-icon">💔</div>
                <div class="result-title lose">90天期限已到,还有卷心菜未售出</div>
                <div class="result-stats-final">
                    <div class="result-stat">
                        <div class="label">总销量</div>
                        <div class="value">${formatNumber(GameState.totalSold)}</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">完成率</div>
                        <div class="value">${completionRate}%</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">剩余库存</div>
                        <div class="value">${formatNumber(remaining)}</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">最终资金</div>
                        <div class="value">${formatMoney(GameState.money)}</div>
                    </div>
                </div>
                <div style="font-size: 2rem; margin: 20px 0;">
                    评级: <strong style="color: var(--text-secondary); font-size: 3rem;">${ratingData.rating}</strong>
                    <div style="font-size: 1.2rem; color: var(--text-secondary); margin-top: 5px;">
                        综合得分: ${ratingData.score} 分
                    </div>
                </div>
                <p style="margin-top: 20px; color: var(--text-secondary);">
                    别灰心! 调整策略再来一次吧!
                </p>
            </div>
        `;
    }

    modal.style.display = 'flex';

    // 清除存档
    localStorage.removeItem('cabbageSimulatorSave');
}

// ==================== 研究升级系统 ====================

/**
 * 获取所有已购买升级的综合效果
 */
function getUpgradeBonuses() {
    const bonuses = {
        salesMultiplier: 0,
        weeklyCabbageMultiplier: 1,
        experimentCostReduction: 0,
        cultureCooldownReduction: 0,
        cultureYieldBonus: 0,
        experimentLevelMultiplier: 1,
        labGlobalBonus: 0,
        passiveSalesFrequency: 0,
        marketingEffectiveness: 0,
        maxPriceIncrease: 0,
        reputationGain: 0,
        shopRevenueBonus: 0,
        globalBonus: 0
    };
    
    GameState.researchUpgrades.forEach(upgradeId => {
        const upgrade = CONFIG.RESEARCH_UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return;
        
        const effect = upgrade.effect;
        switch (effect.type) {
            case 'sales_multiplier':
                bonuses.salesMultiplier += effect.value;
                break;
            case 'weekly_cabbage_multiplier':
                bonuses.weeklyCabbageMultiplier *= effect.value;
                break;
            case 'experiment_cost_reduction':
                bonuses.experimentCostReduction += effect.value;
                break;
            case 'culture_cooldown_reduction':
                bonuses.cultureCooldownReduction += effect.value;
                break;
            case 'culture_yield_bonus':
                bonuses.cultureYieldBonus += effect.value;
                break;
            case 'experiment_level_multiplier':
                bonuses.experimentLevelMultiplier *= effect.value;
                break;
            case 'lab_global_bonus':
                bonuses.labGlobalBonus += effect.value;
                break;
            case 'passive_sales_frequency':
                bonuses.passiveSalesFrequency += effect.value;
                break;
            case 'marketing_effectiveness':
                bonuses.marketingEffectiveness += effect.value;
                break;
            case 'max_price_increase':
                bonuses.maxPriceIncrease += effect.value;
                break;
            case 'reputation_gain':
                bonuses.reputationGain += effect.value;
                break;
            case 'shop_revenue_bonus':
                bonuses.shopRevenueBonus += effect.value;
                break;
            case 'global_bonus':
                bonuses.globalBonus += effect.value;
                break;
        }
    });
    
    return bonuses;
}

/**
 * 渲染研究升级列表
 */
function renderResearchUpgrades(filter = 'all') {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    CONFIG.RESEARCH_UPGRADES.forEach(upgrade => {
        // 根据分类过滤
        let shouldShow = false;
        if (filter === 'all') {
            shouldShow = true;
        } else if (filter === 'sales' && upgrade.id.startsWith('sales_boost_')) {
            shouldShow = true;
        } else if (filter === 'cabbage' && upgrade.id.startsWith('weekly_cabbage_')) {
            shouldShow = true;
        } else if (filter === 'lab' && upgrade.id.startsWith('lab_efficiency_')) {
            shouldShow = true;
        } else if (filter === 'other' && !upgrade.id.startsWith('sales_boost_') && 
                   !upgrade.id.startsWith('weekly_cabbage_') && 
                   !upgrade.id.startsWith('lab_efficiency_')) {
            shouldShow = true;
        }
        
        if (!shouldShow) return;
        
        const isPurchased = GameState.researchUpgrades.includes(upgrade.id);
        const canAfford = GameState.techPoints >= upgrade.cost;
        
        const card = document.createElement('div');
        card.className = `upgrade-card ${isPurchased ? 'purchased' : ''} ${!canAfford && !isPurchased ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-cost">💎 ${upgrade.cost}</span>
            </div>
            <div class="upgrade-description">${upgrade.description}</div>
            ${isPurchased 
                ? '<span class="upgrade-status purchased">✓ 已解锁</span>'
                : `<button class="btn btn-primary btn-small" onclick="purchaseUpgrade('${upgrade.id}')" ${!canAfford ? 'disabled' : ''}>
                     ${canAfford ? '购买升级' : '科技点不足'}
                   </button>`
            }
        `;
        
        container.appendChild(card);
    });
}

/**
 * 购买研究升级
 */
function purchaseUpgrade(upgradeId) {
    const upgrade = CONFIG.RESEARCH_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) {
        alert('无效的升级ID!');
        return;
    }
    
    if (GameState.researchUpgrades.includes(upgradeId)) {
        alert('你已经购买过这个升级了!');
        return;
    }
    
    if (GameState.techPoints < upgrade.cost) {
        alert(`科技点不足!需要 ${upgrade.cost} 点`);
        return;
    }
    
    const confirmMsg = `确认购买升级 "${upgrade.name}"？\n\n` +
                      `消耗: ${upgrade.cost} 点科技点\n` +
                      `效果: ${upgrade.description}`;
    
    if (!window.confirm(confirmMsg)) return;
    
    // 扣除科技点并记录升级
    GameState.techPoints -= upgrade.cost;
    GameState.researchUpgrades.push(upgradeId);
    
    addLog(`🔬 成功购买升级: ${upgrade.name}!`, 'positive');
    
    // 应用升级效果
    applyUpgradeEffect(upgrade);
    
    // 重新渲染列表
    renderResearchUpgrades();
    updateUI();
    saveGame();
}

/**
 * 应用升级效果到游戏逻辑
 */
function applyUpgradeEffect(upgrade) {
    const effect = upgrade.effect;
    
    switch (effect.type) {
        case 'cost_price_reduction':
            // 直接修改成本价
            GameState.costPrice = Math.max(0.1, GameState.costPrice - effect.value);
            break;
        // 其他效果在计算时动态应用，不需要立即处理
    }
}

/**
 * 初始化研究升级筛选器
 */
function initResearchUpgradeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) {
        console.log('筛选按钮未找到，跳过初始化');
        return;
    }
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有激活状态
            filterButtons.forEach(b => b.classList.remove('active'));
            // 激活当前按钮
            btn.classList.add('active');
            // 渲染对应分类
            const filter = btn.dataset.filter;
            renderResearchUpgrades(filter);
        });
    });
    
    console.log(`研究升级筛选器已初始化，共 ${filterButtons.length} 个按钮`);
}

/**
 * 一键购买营销（从低到高自动购买）
 */
function buyAllMarketing() {
    // 获取所有营销选项并按成本排序
    const marketingList = Object.entries(CONFIG.MARKETING_OPTIONS)
        .map(([type, config]) => ({ type, ...config }))
        .filter(item => GameState.day >= item.unlockDay) // 只考虑已解锁的
        .sort((a, b) => a.cost - b.cost); // 按成本从低到高排序
    
    if (marketingList.length === 0) {
        alert('当前没有可购买的营销项目！');
        return;
    }
    
    let purchasedCount = 0;
    let totalSpent = 0;
    let skippedCount = 0;
    let purchasedNames = [];
    
    for (const item of marketingList) {
        // 检查是否已经购买
        const existingEffect = GameState.activeMarketing.find(effect => effect.type === item.type);
        if (existingEffect) {
            skippedCount++;
            continue; // 跳过已购买的
        }
        
        // 检查资金是否足够
        if (GameState.money < item.cost) {
            // 资金不足，停止购买
            break;
        }
        
        // 购买该营销项目
        GameState.money -= item.cost;
        GameState.activeMarketing.push({
            type: item.type,
            daysLeft: item.duration,
            salesBonus: item.salesBonus,
            reputationBonus: item.reputationBonus
        });
        
        purchasedCount++;
        totalSpent += item.cost;
        purchasedNames.push(item.name);
    }
    
    // 显示购买结果
    let message = `🛒 一键购买完成！\n\n`;
    message += `✅ 成功购买: ${purchasedCount} 项\n`;
    message += `💰 总花费: ¥${totalSpent.toLocaleString()}\n`;
    
    if (purchasedNames.length > 0) {
        message += `\n已购买项目:\n• ${purchasedNames.join('\n• ')}\n`;
    }
    
    if (skippedCount > 0) {
        message += `\n⏭️ 跳过已购买: ${skippedCount} 项`;
    }
    
    // 检查是否有因资金不足而未购买的
    const remainingCount = marketingList.length - purchasedCount - skippedCount;
    if (remainingCount > 0) {
        message += `\n⚠️ 资金不足未购买: ${remainingCount} 项`;
    }
    
    alert(message);
    
    // 更新UI和保存
    updateUI();
    saveGame();
    
    addLog(`🛒 一键购买了 ${purchasedCount} 项营销，花费 ¥${totalSpent.toLocaleString()}`, 'positive');
}

// ==================== 卷心菜神学院系统 ====================

/**
 * 从业务升级页面解锁卷心菜神学院
 */
function unlockAcademyFromUpgrade() {
    if (GameState.academy.unlocked) {
        alert('神学院已经解锁了！');
        return;
    }
    
    // 检查前置条件：实验室等级>=3
    if (GameState.restaurantLevel < 3) {
        alert('需要先升级到卷心菜实验室才能解锁神学院！');
        return;
    }
    
    if (GameState.money < CONFIG.ACADEMY_UNLOCK_COST) {
        alert(`资金不足！需要 ${formatMoney(CONFIG.ACADEMY_UNLOCK_COST)} 才能解锁神学院`);
        return;
    }
    
    const confirm = window.confirm(
        `确定要解锁卷心菜神学院吗？\n\n` +
        `• 消耗: ${formatMoney(CONFIG.ACADEMY_UNLOCK_COST)}\n` +
        `• 解锁: 献祭卷心菜获得神佑点\n` +
        `• 解锁: 神圣商店兑换强力物品\n` +
        `• 解锁: 销售中心新增"卷心菜神学院"子页面`
    );
    
    if (!confirm) return;
    
    GameState.money -= CONFIG.ACADEMY_UNLOCK_COST;
    GameState.academy.unlocked = true;
    GameState.academy.divinePoints = 0;
    
    addLog('🎓 成功解锁卷心菜神学院！', 'positive');
    addLog('✨ 销售中心已新增"卷心菜神学院"子页面', 'positive');
    updateUI();
    saveGame();
}

/**
 * 更新献祭数量显示
 */
function updateSacrificeAmount(value) {
    const display = document.getElementById('sacrifice-amount-display');
    if (display) {
        display.textContent = formatNumber(parseInt(value));
    }
    GameState.academy.sacrificeAmount = parseInt(value);
}

/**
 * 献祭卷心菜
 */
function sacrificeCabbage() {
    if (!GameState.academy.unlocked) {
        alert('需要先解锁神学院才能献祭！');
        return;
    }
    
    const amount = GameState.academy.sacrificeAmount;
    const pointsGained = Math.floor(amount / 10000);
    
    if (GameState.inventory < amount) {
        alert(`卷心菜不足！需要 ${formatNumber(amount)} 颗`);
        return;
    }
    
    const confirm = window.confirm(
        `确定要献祭卷心菜吗？\n\n` +
        `• 消耗: ${formatNumber(amount)} 颗卷心菜\n` +
        `• 获得: ${pointsGained} 点神佑点`
    );
    
    if (!confirm) return;
    
    GameState.inventory -= amount;
    GameState.academy.divinePoints += pointsGained;
    
    addLog(`⚡ 献祭完成！获得 ${pointsGained} 点神佑点`, 'positive');
    updateUI();
    saveGame();
}

/**
 * 兑换卷心菜
 */
function exchangeCabbage() {
    const cost = 5;
    if (GameState.academy.divinePoints < cost) {
        alert(`神佑点不足！需要 ${cost} 点`);
        return;
    }
    
    const confirm = window.confirm(`消耗 ${cost} 神佑点兑换 100,000 颗卷心菜？`);
    if (!confirm) return;
    
    GameState.academy.divinePoints -= cost;
    GameState.inventory += 100000;
    
    addLog('🥬 兑换成功！获得 100,000 颗卷心菜', 'positive');
    updateUI();
    saveGame();
}

/**
 * 兑换资金
 */
function exchangeMoney() {
    const cost = 10;
    if (GameState.academy.divinePoints < cost) {
        alert(`神佑点不足！需要 ${cost} 点`);
        return;
    }
    
    const confirm = window.confirm(`消耗 ${cost} 神佑点兑换 ¥1,000,000？`);
    if (!confirm) return;
    
    GameState.academy.divinePoints -= cost;
    GameState.money += 1000000;
    
    addLog('💰 兑换成功！获得 ¥1,000,000', 'positive');
    updateUI();
    saveGame();
}

/**
 * 兑换销量加成
 */
function exchangeSalesBonus() {
    const cost = 20;
    if (GameState.academy.divinePoints < cost) {
        alert(`神佑点不足！需要 ${cost} 点`);
        return;
    }
    
    const confirm = window.confirm(`消耗 ${cost} 神佑点获得永久销量 +10%？`);
    if (!confirm) return;
    
    GameState.academy.divinePoints -= cost;
    
    // 添加永久销量加成标记
    if (!GameState.academy.salesBonus) {
        GameState.academy.salesBonus = 0;
    }
    GameState.academy.salesBonus += 0.10;
    
    addLog('📈 兑换成功！获得永久销量 +10%', 'positive');
    updateUI();
    saveGame();
}

/**
 * 更新神学院UI显示
 */
function updateAcademyUI() {
    const lockedDiv = document.getElementById('academy-locked');
    const unlockedDiv = document.getElementById('academy-unlocked');
    const divinePointsDisplay = document.getElementById('divine-points-display');
    
    if (!lockedDiv || !unlockedDiv) return;
    
    if (GameState.academy.unlocked) {
        lockedDiv.style.display = 'none';
        unlockedDiv.style.display = 'block';
        
        // 更新神佑点显示
        if (divinePointsDisplay) {
            divinePointsDisplay.textContent = GameState.academy.divinePoints;
        }
        
        // 更新滑块值
        const sacrificeSlider = document.getElementById('sacrifice-slider');
        if (sacrificeSlider) {
            sacrificeSlider.value = GameState.academy.sacrificeAmount;
        }
        const sacrificeAmountDisplay = document.getElementById('sacrifice-amount-display');
        if (sacrificeAmountDisplay) {
            sacrificeAmountDisplay.textContent = formatNumber(GameState.academy.sacrificeAmount);
        }
    } else {
        lockedDiv.style.display = 'block';
        unlockedDiv.style.display = 'none';
    }
}

// ==================== 存档系统 ====================
function saveGame() {
    if (GameState.isGameOver) {
        return;
    }

    const saveData = {
        inventory: GameState.inventory,
        money: GameState.money,
        reputation: GameState.reputation,
        day: GameState.day,
        totalSold: GameState.totalSold,
        currentPrice: GameState.currentPrice,
        activeMarketing: GameState.activeMarketing,
        ownedShops: GameState.ownedShops,
        completedEvents: GameState.completedEvents,
        weather: GameState.weather,
        specialEffects: GameState.specialEffects,
        // 无尽模式状态
        endlessMode: GameState.endlessMode,
        contractSigned: GameState.contractSigned,
        contractDay: GameState.contractDay,
        nextDeliveryDay: GameState.nextDeliveryDay,
        stockoutDays: GameState.stockoutDays,
        todayPurchase: GameState.todayPurchase,
        codeRedeemed: GameState.codeRedeemed,
        // 升级系统状态
        restaurantLevel: GameState.restaurantLevel,
        canUpgradeToRestaurant: GameState.canUpgradeToRestaurant,
        cannedProduction: GameState.cannedProduction,
        // 实验室系统状态
        labProduction: GameState.labProduction,
        // 科技点系统
        techPoints: GameState.techPoints,
        researchUpgrades: GameState.researchUpgrades,
        // 卷心菜神学院系统
        academy: GameState.academy,
        // 自定义比赛系统
        customEvent: GameState.customEvent,
        // 玩家信息
        playerName: GameState.playerName,
        gameTitle: GameState.gameTitle
    };

    localStorage.setItem('cabbageSimulatorSave', JSON.stringify(saveData));
}

function loadGame() {
    const saveData = localStorage.getItem('cabbageSimulatorSave');
    if (!saveData) {
        return false;
    }

    try {
        const data = JSON.parse(saveData);

        GameState.inventory = data.inventory;
        GameState.money = data.money;
        GameState.reputation = data.reputation;
        GameState.day = data.day;
        GameState.totalSold = data.totalSold;
        GameState.currentPrice = data.currentPrice;
        GameState.activeMarketing = data.activeMarketing || [];
        GameState.ownedShops = data.ownedShops || [];
        GameState.completedEvents = data.completedEvents || [];
        GameState.weather = data.weather || 'sunny';
        GameState.specialEffects = data.specialEffects || {
            qualityLabel: false,
            newRecipe: false,
            competitorDebuff: 0
        };
        // 加载无尽模式状态
        GameState.endlessMode = data.endlessMode || false;
        GameState.contractSigned = data.contractSigned || false;
        GameState.contractDay = data.contractDay || 0;
        GameState.nextDeliveryDay = data.nextDeliveryDay || 0;
        GameState.stockoutDays = data.stockoutDays || 0;
        GameState.todayPurchase = data.todayPurchase || 0;
        GameState.codeRedeemed = data.codeRedeemed || false;

        // 加载升级系统状态
        GameState.restaurantLevel = data.restaurantLevel || 0;
        GameState.canUpgradeToRestaurant = data.canUpgradeToRestaurant || false;
        GameState.cannedProduction = data.cannedProduction || {
            enabled: false,
            cabbagesPerCan: 1
        };

        // 加载实验室系统状态
        GameState.labProduction = data.labProduction || {
            enabled: false,
            experimentAmount: 1000,
            cultureAmount: 1000
        };

        // 加载科技点系统
        GameState.techPoints = data.techPoints || 0;
        GameState.researchUpgrades = data.researchUpgrades || [];

        // 加载卷心菜神学院系统
        GameState.academy = data.academy || {
            unlocked: false,
            divinePoints: 0,
            sacrificeAmount: 10000,
            salesBonus: 0
        };

        // 加载自定义比赛系统
        GameState.customEvent = data.customEvent || null;

        // 加载玩家信息
        GameState.playerName = data.playerName || '';
        GameState.gameTitle = data.gameTitle || '卷心菜模拟器';

        return true;
    } catch (e) {
        console.error('加载存档失败:', e);
        return false;
    }
}

// ==================== 导出存档功能 ====================
function exportSave() {
    try {
        const saveData = localStorage.getItem('cabbageSimulatorSave');
        if (!saveData) {
            alert('当前没有存档可导出!');
            return;
        }

        console.log('导出存档数据:', saveData);

        // 创建一个Blob对象,使用application/json格式
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // 创建下载链接,使用.json扩展名
        const a = document.createElement('a');
        a.href = url;
        a.download = `cabbage-save-day${GameState.day}.json`;
        document.body.appendChild(a);
        a.click();
        
        // 延迟移除元素,确保下载完成
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        addLog('💾 存档已导出为JSON文件!', 'positive');
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败! 错误信息: ' + error.message);
    }
}

// ==================== 导入存档功能 ====================
function importSave(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型（优先JSON格式，但保持对txt的兼容）
    if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
        alert('请选择.json或.txt格式的存档文件!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let saveData = e.target.result;
            
            // 尝试解密(如果是加密的存档)
            if (typeof decryptSaveData === 'function') {
                const decryptedData = decryptSaveData(saveData);
                if (decryptedData) {
                    saveData = decryptedData;
                    console.log('存档已解密');
                }
            }
            
            // 验证JSON格式
            const data = JSON.parse(saveData);

            // 确认导入
            const confirm = window.confirm(
                `确定要导入这个存档吗?\n\n` +
                `• 存档天数: 第${data.day}天\n` +
                `• 当前资金: ¥${data.money.toLocaleString()}\n` +
                `• 总销量: ${data.totalSold.toLocaleString()}\n\n` +
                `⚠️ 导入后将覆盖当前进度!`
            );

            if (!confirm) {
                // 重置文件输入框
                event.target.value = '';
                return;
            }

            // 保存到localStorage
            localStorage.setItem('cabbageSimulatorSave', saveData);
            
            console.log('存档导入成功！');

            // 重新加载游戏
            location.reload();
        } catch (error) {
            console.error('导入失败:', error);
            alert('存档文件格式错误!请确保文件内容是正确的JSON格式。\n\n错误信息: ' + error.message + '\n\n提示：请检查文件是否为有效的JSON格式。');
            // 重置文件输入框
            event.target.value = '';
        }
    };
    
    reader.onerror = function(error) {
        console.error('文件读取失败:', error);
        alert('文件读取失败！请重试。');
        event.target.value = '';
    };

    reader.readAsText(file);
}

// ==================== 初始化游戏 ====================
function initGame() {
    // 尝试加载存档
    const loaded = loadGame();

    if (!loaded) {
        // 新游戏,重置状态
        resetGameState();

        // 显示取名弹窗
        showNameInputDialog();
    } else {
        // 加载存档后更新标题
        updateGameTitle();
    }

    // 绑定事件监听器
    bindEventListeners();

    // 初始UI更新
    updateUI();

    if (loaded) {
        addLog('已加载上次的游戏进度', 'neutral');
    }
}

function resetGameState() {
    GameState.inventory = CONFIG.INITIAL_INVENTORY;
    GameState.money = CONFIG.INITIAL_MONEY;
    GameState.reputation = CONFIG.INITIAL_REPUTATION;
    GameState.day = 1;
    GameState.totalSold = 0;
    GameState.costPrice = CONFIG.COST_PRICE;
    GameState.currentPrice = CONFIG.BASE_PRICE;
    GameState.activeMarketing = [];
    GameState.ownedShops = [];
    GameState.completedEvents = [];
    GameState.weather = 'sunny';
    GameState.specialEffects = {
        qualityLabel: false,
        newRecipe: false,
        competitorDebuff: 0
    };
    GameState.todaySales = {
        session1: { quantity: 0, revenue: 0, hasSold: false },
        session2: { quantity: 0, revenue: 0, hasSold: false },
        currentSession: 0
    };
    GameState.salesTimer = {
        isWaiting: false,
        timeLeft: 0,
        timerId: null
    };
    // 重置无尽模式状态
    GameState.endlessMode = false;
    GameState.contractSigned = false;
    GameState.contractDay = 0;
    GameState.nextDeliveryDay = 0;
    GameState.stockoutDays = 0;
    GameState.todayPurchase = 0;
    GameState.isGameOver = false;
    GameState.gameWon = false;
    GameState.codeRedeemed = false;

    // 重置玩家信息
    GameState.playerName = '';
    GameState.gameTitle = '卷心菜模拟器';

    // 重置升级系统状态
    GameState.restaurantLevel = 0;
    GameState.canUpgradeToRestaurant = false;
    GameState.cannedProduction = {
        enabled: false,
        cabbagesPerCan: 1
    };
    
    // 重置实验室系统状态
    GameState.labProduction = {
        enabled: false,
        experimentAmount: 1000,
        cultureAmount: 1000,
        experimentLevel: 0,
        lastCultureDay: 0
    };
    
    // 重置科技点系统
    GameState.techPoints = 0;
    GameState.researchUpgrades = [];

    // 重置卷心菜神学院系统
    GameState.academy = {
        unlocked: false,
        divinePoints: 0,
        sacrificeAmount: 10000,
        salesBonus: 0
    };

    // 重置自定义比赛系统
    GameState.customEvent = null;

    // 重置罐头生产设置
    GameState.cannedProduction = {
        enabled: false,
        dailyInput: 1000,
        cabbagesPerCan: 1,
        pricePerCan: 5
    };

    // 重置价格滑块
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        priceSlider.value = CONFIG.BASE_PRICE;
    }

    const priceDisplay = document.getElementById('price-display');
    if (priceDisplay) {
        priceDisplay.textContent = CONFIG.BASE_PRICE;
    }

    // 重置促销选项
    const promoBogo = document.getElementById('promo-bogo');
    if (promoBogo) promoBogo.checked = false;

    const promoDiscount = document.getElementById('promo-discount');
    if (promoDiscount) promoDiscount.checked = false;

    const promoBundle = document.getElementById('promo-bundle');
    if (promoBundle) promoBundle.checked = false;

    // 重置销售按钮
    const salesBtn = document.getElementById('start-sales-btn');
    if (salesBtn) {
        salesBtn.disabled = false;
        salesBtn.textContent = '开始第1次销售';
    }
}

// ==================== 事件监听器绑定 ====================
function bindEventListeners() {
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有激活状态
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // 激活当前标签
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });

    // 销售中心子标签页切换
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有激活状态
            document.querySelectorAll('.sub-tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'white';
                b.style.color = 'var(--text)';
            });
            document.querySelectorAll('.sub-tab-content').forEach(c => c.style.display = 'none');

            // 激活当前子标签
            btn.classList.add('active');
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            const subtabId = btn.dataset.subtab;
            document.getElementById(`subtab-${subtabId}`).style.display = 'block';
            
            // 如果切换到研究升级页面，动态渲染升级列表
            if (subtabId === 'research-upgrades') {
                renderResearchUpgrades();
                // 更新科技点显示
                const upgradeTechPoints = document.getElementById('upgrade-tech-points');
                if (upgradeTechPoints) {
                    upgradeTechPoints.textContent = formatNumber(GameState.techPoints);
                }
            }
            
            // 如果切换到神学院页面，更新UI
            if (subtabId === 'academy') {
                updateAcademyUI();
            }
        });
    });

    // 价格滑块
    const priceSlider = document.getElementById('price-slider');
    priceSlider.addEventListener('input', (e) => {
        GameState.currentPrice = parseInt(e.target.value);
        document.getElementById('price-display').textContent = GameState.currentPrice;

        // 根据餐馆等级检查价格限制(违法上限为最高定价的99%)
        const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
        const illegalPriceThreshold = Math.floor(maxPrice * 0.99);
        if (GameState.currentPrice > illegalPriceThreshold) {
            const priceDisplay = document.getElementById('price-display');
            priceDisplay.style.color = 'var(--error)';
            priceDisplay.textContent = `${GameState.currentPrice} ⚠️`;
        } else {
            const priceDisplay = document.getElementById('price-display');
            priceDisplay.style.color = '';
        }

        updateEstimatedSales();
    });

    // 促销选项
    document.getElementById('promo-bogo').addEventListener('change', (e) => {
        GameState.promotions.bogo = e.target.checked;
        updateEstimatedSales();
    });

    document.getElementById('promo-discount').addEventListener('change', (e) => {
        GameState.promotions.discount = e.target.checked;
        updateEstimatedSales();
    });

    document.getElementById('promo-bundle').addEventListener('change', (e) => {
        GameState.promotions.bundle = e.target.checked;
        updateEstimatedSales();
    });

    // 开始销售按钮
    document.getElementById('start-sales-btn').addEventListener('click', () => {
        executeSales();
    });

    // 下一天按钮
    document.getElementById('next-day-btn').addEventListener('click', () => {
        nextDay();
    });

    // 购买广告按钮
    document.querySelectorAll('.buy-ad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const marketingItem = btn.closest('.marketing-item');
            const type = marketingItem.dataset.type;
            buyMarketing(type);
        });
    });

    // 弹窗关闭按钮
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // 点击弹窗外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // 重新开始按钮
    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over-modal').style.display = 'none';
        resetGameState();
        updateUI();
        addLog('新游戏开始!', 'neutral');
    });
}

// ==================== 辅助函数 ====================
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ==================== 兑换码系统 ====================
function redeemCode() {
    const input = prompt('请输入兑换码:');
    if (!input) return;

    const code = input.trim();

    if (code === 'CHM is big SB') {
        if (GameState.codeRedeemed) {
            alert('你已经使用过兑换码了!每次游戏只能使用一次。');
            return;
        }
        GameState.codeRedeemed = true;
        GameState.inventory += 100000;
        addLog('🎁 兑换码成功! 获得 100,000 颗卷心菜!', 'positive');
        updateUI();
        saveGame();
    } else if (code === 'something for nothing') {
        // 作弊码：获得20亿资金、100万颗卷心菜，并设置为第75天
        GameState.money = 2000000000;
        GameState.inventory = 1000000;
        GameState.day = 75;
        
        // 重置今日销售状态，确保可以正常销售
        GameState.todaySales.session1.hasSold = false;
        GameState.todaySales.session2.hasSold = false;
        GameState.todaySales.currentSession = 0;
        
        // 清除销售计时器
        if (GameState.salesTimer.timerId) {
            clearInterval(GameState.salesTimer.timerId);
            GameState.salesTimer.timerId = null;
        }
        GameState.salesTimer.isWaiting = false;
        GameState.salesTimer.timeLeft = 0;
        
        addLog('💰 作弊码激活! 获得 2,000,000,000 资金和 1,000,000 颗卷心菜，时间设为第75天!', 'positive');
        updateUI();
        saveGame();
    } else {
        alert('无效的兑换码!');
    }
}

// ==================== 评分系统 ====================
function calculateGameRating() {
    const daysUsed = GameState.day;
    const totalSold = GameState.totalSold;
    const finalMoney = GameState.money;
    const finalReputation = GameState.reputation;

    // 基础评分(基于完成速度)
    let rating = 'C';
    let score = 0;

    if (daysUsed <= 30) {
        rating = 'S';
        score = 100;
    } else if (daysUsed <= 45) {
        rating = 'A';
        score = 85;
    } else if (daysUsed <= 60) {
        rating = 'B';
        score = 70;
    } else if (daysUsed <= 75) {
        rating = 'C';
        score = 55;
    } else {
        rating = 'D';
        score = 40;
    }

    // 资金加成
    if (finalMoney >= 100000) score += 15;
    else if (finalMoney >= 50000) score += 10;
    else if (finalMoney >= 20000) score += 5;

    // 声誉加成
    if (finalReputation >= 90) score += 10;
    else if (finalReputation >= 70) score += 5;

    // 总销量加成(无尽模式)
    if (totalSold >= 2000000) score += 10;
    else if (totalSold >= 1500000) score += 5;

    // 根据最终分数调整评级
    if (score >= 120) rating = 'S+';
    else if (score >= 100) rating = 'S';
    else if (score >= 85) rating = 'A';
    else if (score >= 70) rating = 'B';
    else if (score >= 55) rating = 'C';
    else rating = 'D';

    return { rating, score };
}

// ==================== 取名系统 ====================
function showNameInputDialog() {
    const name = prompt('欢迎来到卷心菜模拟器!\n\n请输入你的角色名字:');

    if (name && name.trim()) {
        GameState.playerName = name.trim();

        // 彩蛋:如果名字是"杜子德",更改游戏名为"做干净的卷心菜"
        if (GameState.playerName === '杜子德') {
            GameState.gameTitle = '做干净的卷心菜';
            addLog('🥚 彩蛋触发! 游戏名已更改为"做干净的卷心菜"', 'positive');
        } else {
            addLog(`欢迎你, ${GameState.playerName}!`, 'positive');
        }
    } else {
        // 默认名字
        GameState.playerName = '卷心菜商人';
        addLog('欢迎你, 卷心菜商人!', 'positive');
    }

    // 更新UI显示
    updateGameTitle();
    saveGame();
}

function updateGameTitle() {
    const titleElement = document.querySelector('.header-left h1');
    if (titleElement) {
        titleElement.textContent = `🥬 ${GameState.gameTitle}`;
    }

    // 同时更新网页标题
    document.title = `${GameState.gameTitle} - Cabbage Simulator`;
}

// ==================== 升级系统 ====================
function checkRestaurantUpgrade() {
    // 售卖15天后且进入无尽模式时,可以升级为餐馆
    if (GameState.day >= CONFIG.RESTAURANT_UPGRADE_DAY &&
        GameState.endlessMode &&
        GameState.restaurantLevel === 0) {
        GameState.canUpgradeToRestaurant = true;
        addLog('🎉 恭喜!你现在可以升级为卷心菜餐馆了!', 'positive');
        updateUI();
    }
}

function upgradeToRestaurant() {
    if (GameState.restaurantLevel > 0) {
        alert('你已经是餐馆或工厂等级了!');
        return;
    }

    if (!GameState.canUpgradeToRestaurant) {
        alert(`需要售卖至少${CONFIG.RESTAURANT_UPGRADE_DAY}天并进入无尽模式才能升级!`);
        return;
    }

    if (GameState.money < CONFIG.RESTAURANT_UPGRADE_COST) {
        alert(`资金不足!升级为餐馆需要 ${formatMoney(CONFIG.RESTAURANT_UPGRADE_COST)}`);
        return;
    }

    const confirm = window.confirm(
        `确定要升级为卷心菜餐馆吗?\n\n` +
        `• 消耗: ${formatMoney(CONFIG.RESTAURANT_UPGRADE_COST)}\n` +
        `• 成本价增加到: ${formatMoney(CONFIG.RESTAURANT_COST_PRICE)}/颗\n` +
        `• 最高定价提升到: ${formatMoney(CONFIG.RESTAURANT_MAX_PRICE)}/颗\n`
    );

    if (!confirm) return;

    GameState.money -= CONFIG.RESTAURANT_UPGRADE_COST;
    GameState.restaurantLevel = 1;
    GameState.costPrice = CONFIG.RESTAURANT_COST_PRICE;
    GameState.canUpgradeToRestaurant = false;

    addLog('🏪 成功升级为卷心菜餐馆! 成本价和最高定价已提升!', 'positive');
    updateUI();
    saveGame();
}

function upgradeToFactory() {
    if (GameState.restaurantLevel !== 1) {
        alert('需要先升级为餐馆才能升级为工厂!');
        return;
    }

    if (GameState.money < CONFIG.FACTORY_UPGRADE_COST) {
        alert(`资金不足!升级为工厂需要 ${formatMoney(CONFIG.FACTORY_UPGRADE_COST)}`);
        return;
    }

    const confirm = window.confirm(
        `确定要升级为卷心菜工厂吗?\n\n` +
        `• 消耗: ${formatMoney(CONFIG.FACTORY_UPGRADE_COST)}\n` +
        `• 解锁罐头生产功能\n` +
        `• 可以决定每个罐头中卷心菜数量(0.1-10个)\n`
    );

    if (!confirm) return;

    GameState.money -= CONFIG.FACTORY_UPGRADE_COST;
    GameState.restaurantLevel = 2;
    GameState.cannedProduction.enabled = true;
    GameState.cannedProduction.cabbagesPerCan = 1;

    addLog('🏭 成功升级为卷心菜工厂! 罐头生产功能已解锁!', 'positive');
    updateUI();
    saveGame();
}

function updateCannedProduction(value) {
    if (!GameState.cannedProduction.enabled) return;

    GameState.cannedProduction.cabbagesPerCan = parseFloat(value);
    document.getElementById('canned-cabbages-display').textContent = value;
    
    // 更新预计收益显示
    updateCannedPreview();
}

function updateDailyInput(value) {
    if (!GameState.cannedProduction.enabled) return;

    GameState.cannedProduction.dailyInput = parseInt(value);
    document.getElementById('daily-input-display').textContent = formatNumber(GameState.cannedProduction.dailyInput);
    
    // 更新预计收益显示
    updateCannedPreview();
}

function updateCannedPreview() {
    const dailyInput = GameState.cannedProduction.dailyInput;
    const cabbagesPerCan = GameState.cannedProduction.cabbagesPerCan;
    const pricePerCan = GameState.cannedProduction.pricePerCan;
    
    const cansProduced = Math.floor(dailyInput / cabbagesPerCan);
    const revenue = cansProduced * pricePerCan;
    const cost = dailyInput * GameState.costPrice;
    const profit = revenue - cost;
    
    const previewEl = document.getElementById('canned-preview');
    if (previewEl) {
        previewEl.innerHTML = `
            <p>每日产出: <strong>${formatNumber(cansProduced)}</strong> 个罐头</p>
            <p>销售收入: <strong>${formatMoney(revenue)}</strong></p>
            <p>原料成本: <strong>${formatMoney(cost)}</strong></p>
            <p style="color: ${profit >= 0 ? 'var(--success)' : 'var(--error)'};">
                预计利润: <strong>${formatMoney(profit)}</strong>
            </p>
        `;
    }
}

// 执行罐头生产销售(每天自动调用)
function executeCannedProduction() {
    if (!GameState.cannedProduction.enabled) return 0;

    const dailyInput = GameState.cannedProduction.dailyInput;
    const cabbagesPerCan = GameState.cannedProduction.cabbagesPerCan;
    const pricePerCan = GameState.cannedProduction.pricePerCan;

    // 检查库存
    if (GameState.inventory < dailyInput) {
        addLog(`🥫 库存不足! 需要 ${formatNumber(dailyInput)} 颗卷心菜进行罐头生产`, 'negative');
        return 0;
    }

    // 计算产出
    const cansProduced = Math.floor(dailyInput / cabbagesPerCan);
    const revenue = cansProduced * pricePerCan;
    const cost = dailyInput * GameState.costPrice;
    const profit = revenue - cost;

    // 扣除原料
    GameState.inventory -= dailyInput;
    
    // 自动售出获得收入
    GameState.money += revenue;
    GameState.totalSold += cansProduced;

    addLog(`🥫 罐头生产完成: 投入${formatNumber(dailyInput)}颗 → 产出${formatNumber(cansProduced)}个罐头 → 售出获得${formatMoney(revenue)} (利润:${formatMoney(profit)})`, 'positive');
    
    return profit;
}

// ==================== 实验室升级系统 ====================
function upgradeToLab() {
    if (GameState.restaurantLevel !== 2) {
        alert('需要先升级为工厂才能升级为实验室!');
        return;
    }

    if (GameState.money < CONFIG.LAB_UPGRADE_COST) {
        alert(`资金不足!升级为实验室需要 ${formatMoney(CONFIG.LAB_UPGRADE_COST)}`);
        return;
    }

    const confirm = window.confirm(
        `确定要升级为卷心菜实验室吗?\n\n` +
        `• 消耗: ${formatMoney(CONFIG.LAB_UPGRADE_COST)}\n` +
        `• 解锁实验研究功能\n` +
        `• 解锁组织培养功能\n` +
        `• 可以通过实验提升购买能力\n` +
        `• 可以通过组织培养大量繁殖卷心菜\n`
    );

    if (!confirm) return;

    GameState.money -= CONFIG.LAB_UPGRADE_COST;
    GameState.restaurantLevel = 3;
    GameState.labProduction.enabled = true;
    GameState.labProduction.experimentAmount = 1000;
    GameState.labProduction.cultureAmount = 1000;

    addLog('🧪 成功升级为卷心菜实验室! 实验研究和组织培养功能已解锁!', 'positive');
    updateUI();
    saveGame();
}

function updateExperimentAmount(value) {
    if (!GameState.labProduction.enabled) return;

    GameState.labProduction.experimentAmount = parseInt(value);
    document.getElementById('experiment-amount-display').textContent = formatNumber(GameState.labProduction.experimentAmount);
}

function updateCultureAmount(value) {
    if (!GameState.labProduction.enabled) return;

    GameState.labProduction.cultureAmount = parseInt(value);
    document.getElementById('culture-amount-display').textContent = formatNumber(GameState.labProduction.cultureAmount);
    
    // 更新预计消耗和获得
    const a = GameState.labProduction.cultureAmount;
    const costCabbage = a;
    const costMoney = a * 10;
    const gain = a * 100;
    
    document.getElementById('culture-cost-cabbage').textContent = formatNumber(costCabbage);
    document.getElementById('culture-cost-money').textContent = formatMoney(costMoney);
    document.getElementById('culture-gain').textContent = formatNumber(gain);
}

function executeExperiment() {
    if (!GameState.labProduction.enabled) {
        alert('需要先升级为实验室才能进行实验研究!');
        return;
    }
    
    const amount = parseInt(document.getElementById('experiment-slider').value);
    
    // 获取升级效果
    const bonuses = getUpgradeBonuses();
    const costReduction = bonuses.experimentCostReduction;
    const levelMultiplier = bonuses.experimentLevelMultiplier;
    
    // 计算实际消耗（可被升级减少）
    const moneyCost = (amount / 1000) * 100000 * (1 - costReduction);
    
    if (GameState.inventory < amount) {
        alert(`卷心菜不足!需要 ${formatNumber(amount)} 颗`);
        return;
    }
    
    if (GameState.money < moneyCost) {
        alert(`资金不足!需要 ${formatMoney(moneyCost)}`);
        return;
    }
    
    // 计算获得的科技点
    const techPointsGained = amount / 1000;
    
    const confirmMsg = `确认进行实验研究？\n\n` +
                      `消耗: ${formatNumber(amount)} 颗卷心菜 + ${formatMoney(moneyCost)}\n` +
                      `获得: ${techPointsGained} 点科技点`;
    
    if (!window.confirm(confirmMsg)) return;
    
    // 扣除资源
    GameState.inventory -= amount;
    GameState.money -= moneyCost;
    
    // 获得科技点
    GameState.techPoints += techPointsGained;
    
    // 获得实验等级（可被升级倍增）
    const levelGain = amount * levelMultiplier;
    GameState.labProduction.experimentLevel += levelGain;
    
    addLog(`🔬 实验研究完成! 获得 ${techPointsGained} 点科技点，实验等级提升 ${formatNumber(levelGain)}`, 'positive');
    updateUI();
    saveGame();
}

function executeCulture() {
    if (!GameState.labProduction.enabled) {
        alert('需要先升级为实验室才能使用组织培养!');
        return;
    }

    // 获取升级效果
    const bonuses = getUpgradeBonuses();
    const cooldownReduction = bonuses.cultureCooldownReduction;
    const yieldBonus = bonuses.cultureYieldBonus;
    
    // 检查冷却时间（基础10天，可被升级减少）
    const actualCooldown = Math.max(1, 10 - cooldownReduction);
    const daysSinceLastCulture = GameState.day - GameState.labProduction.lastCultureDay;
    if (GameState.labProduction.lastCultureDay > 0 && daysSinceLastCulture < actualCooldown) {
        const remainingDays = actualCooldown - daysSinceLastCulture;
        alert(`组织培养还在冷却中!还需等待 ${remainingDays} 天`);
        return;
    }

    const a = GameState.labProduction.cultureAmount;
    const costCabbage = a;
    const costMoney = a * 10;
    const gain = Math.floor(a * 100 * (1 + yieldBonus));

    if (GameState.inventory < costCabbage) {
        alert(`库存不足!需要 ${formatNumber(costCabbage)} 颗卷心菜`);
        return;
    }

    if (GameState.money < costMoney) {
        alert(`资金不足!需要 ${formatMoney(costMoney)}`);
        return;
    }

    const confirm = window.confirm(
        `确定要进行组织培养吗?\n\n` +
        `• 消耗: ${formatNumber(costCabbage)} 颗卷心菜 + ${formatMoney(costMoney)}\n` +
        `• 获得: ${formatNumber(gain)} 颗卷心菜\n` +
        `• 净收益: ${formatNumber(gain - costCabbage)} 颗卷心菜\n` +
        `• 冷却时间: ${actualCooldown}天\n`
    );

    if (!confirm) return;

    // 执行组织培养
    GameState.inventory -= costCabbage;
    GameState.money -= costMoney;
    GameState.inventory += gain;
    
    // 记录使用天数
    GameState.labProduction.lastCultureDay = GameState.day;

    addLog(`🌱 组织培养完成! 消耗 ${formatNumber(costCabbage)} 颗卷心菜和 ${formatMoney(costMoney)},获得 ${formatNumber(gain)} 颗卷心菜 (下次可用: 第${GameState.day + actualCooldown}天)`, 'positive');
    updateUI();
    saveGame();
    
    // 重新启动冷却时间定时器
    startCultureCooldownTimer();
}

// ==================== 动态更新定时器 ====================
let cultureCooldownTimer = null;

/**
 * 启动组织培养冷却时间动态更新
 */
function startCultureCooldownTimer() {
    // 清除旧的定时器
    if (cultureCooldownTimer) {
        clearInterval(cultureCooldownTimer);
    }
    
    // 每秒更新一次冷却时间显示
    cultureCooldownTimer = setInterval(() => {
        const cultureCooldownEl = document.getElementById('culture-cooldown-display');
        if (cultureCooldownEl && GameState.labProduction.enabled) {
            const lastDay = GameState.labProduction.lastCultureDay;
            
            // 获取升级效果
            const bonuses = getUpgradeBonuses();
            const cooldownReduction = bonuses.cultureCooldownReduction;
            const actualCooldown = Math.max(1, 10 - cooldownReduction);
            
            if (lastDay > 0) {
                const daysSince = GameState.day - lastDay;
                if (daysSince < actualCooldown) {
                    const remaining = actualCooldown - daysSince;
                    cultureCooldownEl.textContent = `🕒 冷却中: 还需 ${remaining} 天 (第${lastDay + actualCooldown}天可用)`;
                    cultureCooldownEl.style.color = 'var(--error)';
                } else {
                    cultureCooldownEl.textContent = '✅ 已就绪: 可以使用';
                    cultureCooldownEl.style.color = 'var(--success)';
                    // 已就绪后停止定时器
                    if (cultureCooldownTimer) {
                        clearInterval(cultureCooldownTimer);
                        cultureCooldownTimer = null;
                    }
                }
            }
        }
    }, 1000); // 每秒更新
}

/**
 * 停止组织培养冷却时间动态更新
 */
function stopCultureCooldownTimer() {
    if (cultureCooldownTimer) {
        clearInterval(cultureCooldownTimer);
        cultureCooldownTimer = null;
    }
}

// ==================== 启动游戏 ====================
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    // 初始化研究升级筛选器
    initResearchUpgradeFilters();
    // 启动组织培养冷却时间动态更新
    startCultureCooldownTimer();
});
