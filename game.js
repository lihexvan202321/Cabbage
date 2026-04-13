// ==================== 游戏状态管理 ====================
const GameState = {
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
    restaurantLevel: 0,  // 0=普通, 1=餐馆, 2=工厂
    canUpgradeToRestaurant: false,  // 是否可以升级为餐馆(售卖15天后)
    cannedProduction: {
        enabled: false,  // 是否启用罐头生产
        cabbagesPerCan: 1  // 每个罐头的卷心菜数量(0.1-10)
    }
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

    // 价格配置
    MIN_PRICE: 2,
    MAX_PRICE: 15,
    BASE_PRICE: 3,
    COST_PRICE: 1.5,  // 成本价
    SALES_SESSIONS_PER_DAY: 2,  // 每天销售次数
    SALES_WAIT_TIME: 5,  // 销售等待时间(秒)

    // 营销配置(所有加成缩减到原来的10%)
    MARKETING_OPTIONS: {
        flyer: { cost: 200, salesBonus: 0.015, reputationBonus: 0, duration: 3, name: '传单派发' },
        social: { cost: 500, salesBonus: 0.03, reputationBonus: 0.5, duration: 5, name: '社交媒体' },
        radio: { cost: 1000, salesBonus: 0.05, reputationBonus: 1, duration: 7, name: '本地电台' },
        tv: { cost: 3000, salesBonus: 0.1, reputationBonus: 2, duration: 10, name: '电视广告' }
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
        75: { type: 'quality', name: '品质大赛', icon: '🏆', cost: 800 },
        90: { type: 'championship', name: '销售冠军赛', icon: '👑', cost: 0 }
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
    }
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

function updateUpgradeSystem() {
    const upgradeSection = document.getElementById('upgrade-section');
    const restaurantUpgrade = document.getElementById('restaurant-upgrade');
    const factoryUpgrade = document.getElementById('factory-upgrade');
    const cannedSection = document.getElementById('canned-production-section');

    // 显示升级区域
    if (GameState.endlessMode || GameState.restaurantLevel > 0) {
        upgradeSection.style.display = 'block';

        // 根据等级显示不同选项
        if (GameState.restaurantLevel === 0 && GameState.canUpgradeToRestaurant) {
            restaurantUpgrade.style.display = 'block';
            factoryUpgrade.style.display = 'none';
        } else if (GameState.restaurantLevel === 1) {
            restaurantUpgrade.style.display = 'none';
            factoryUpgrade.style.display = 'block';
        } else {
            restaurantUpgrade.style.display = 'none';
            factoryUpgrade.style.display = 'none';
        }
    } else {
        upgradeSection.style.display = 'none';
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
    } else {
        cannedSection.style.display = 'none';
    }

    // 更新价格滑块最大值
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
        priceSlider.max = maxPrice;
    }
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

    // 特殊效果加成
    if (GameState.specialEffects.newRecipe) {
        baseSales *= 1.2;
    }

    // 竞争对手打压
    if (GameState.specialEffects.competitorDebuff > 0) {
        baseSales *= 0.7;
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
    // 检查价格是否超过15元
    if (GameState.currentPrice > 15) {
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
        alert('今日销售已完成!请进入下一天。');
        return;
    }

    if (GameState.inventory <= 0) {
        return;
    }

    // 检查是否在等待中
    if (GameState.salesTimer.isWaiting) {
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

    const sessionName = session === 'session1' ? '第1次销售' : '第2次销售';

    document.getElementById('result-quantity').textContent = formatNumber(quantity);
    document.getElementById('result-price').textContent = formatMoney(price.toFixed(2));
    document.getElementById('result-revenue').textContent = formatMoney(revenue);

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
    resultDiv.querySelector('h2').textContent = `${sessionName}结果`;
}

// ==================== 市场营销系统 ====================
function buyMarketing(type) {
    const config = CONFIG.MARKETING_OPTIONS[type];

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

    addLog(`购买了${config.name},花费 ${formatMoney(config.cost)}`, 'neutral');
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
    const eventConfig = CONFIG.EVENTS[GameState.day];
    const currentEventDiv = document.getElementById('current-event');

    if (eventConfig && !GameState.completedEvents.includes(GameState.day)) {
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
        }

        html += `</div>`;

        if (eventConfig.cost > 0) {
            html += `<div class="event-cost">报名费: ${formatMoney(eventConfig.cost)}</div>`;
        }

        html += `
                <div class="event-actions">
                    <button class="btn btn-success" onclick="joinEvent(${GameState.day})">参加比赛</button>
                    <button class="btn btn-secondary" onclick="skipEvent(${GameState.day})">放弃参加</button>
                </div>
            </div>
        `;

        currentEventDiv.innerHTML = html;
    } else {
        currentEventDiv.innerHTML = '<p class="no-event">今天没有赛事活动</p>';
    }
}

function joinEvent(day) {
    const eventConfig = CONFIG.EVENTS[day];
    if (!eventConfig) return;

    if (GameState.money < eventConfig.cost) {
        alert('资金不足,无法参加比赛!');
        return;
    }

    GameState.money -= eventConfig.cost;
    GameState.completedEvents.push(day);

    let won = false;

    if (eventConfig.type === 'quality') {
        // 品质大赛: 需要营销投入≥1500且声誉≥60
        const totalMarketingSpent = GameState.activeMarketing.reduce((sum, effect) => {
            const config = CONFIG.MARKETING_OPTIONS[effect.type];
            return sum + config.cost;
        }, 0);

        won = totalMarketingSpent >= 1500 && GameState.reputation >= 60;

        if (won) {
            GameState.reputation = clamp(GameState.reputation + 25, 0, 100);
            GameState.specialEffects.qualityLabel = true;

            // 添加5天销量加成
            GameState.activeMarketing.push({
                type: 'event_bonus',
                daysLeft: 5,
                customBonus: 0.5
            });

            addLog('品质大赛获胜! 声誉+25, 获得优质卷心菜标签,销量加成50%(5天)', 'positive');
        } else {
            addLog('品质大赛未能获胜,继续努力!', 'neutral');
        }
    } else if (eventConfig.type === 'cooking') {
        // 创意料理大赛: 随机判定
        const winRate = 0.4 + (GameState.reputation * 0.003);
        won = Math.random() < winRate;

        if (won) {
            GameState.reputation = clamp(GameState.reputation + 30, 0, 100);
            GameState.specialEffects.newRecipe = true;
            addLog('创意料理大赛获胜! 声誉+30, 解锁新菜品(永久销量+20%)', 'positive');
        } else {
            addLog('创意料理大赛未能获胜,下次一定!', 'neutral');
        }
    } else if (eventConfig.type === 'championship') {
        // 销售冠军赛
        if (GameState.totalSold >= CONFIG.TARGET_SALES) {
            GameState.money += 5000;
            addLog('恭喜! 获得"卷心菜之王"称号和额外奖金¥5,000!', 'positive');
        } else {
            addLog('销售冠军赛: 继续加油,你离目标不远了!', 'neutral');
        }
    }

    updateUI();
    closeModal('event-modal');
}

function skipEvent(day) {
    GameState.completedEvents.push(day);
    addLog(`放弃了第${day}天的赛事`, 'neutral');
    updateUI();
}

// ==================== 随机事件系统 ====================
function triggerRandomEvent() {
    const rand = Math.random();

    if (rand < 0.3) {
        // 正面事件
        triggerPositiveEvent();
    } else if (rand < 0.6) {
        // 负面事件
        triggerNegativeEvent();
    }
    // 40%概率无事件
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
                GameState.reputation = clamp(GameState.reputation + 20, 0, 100);
                return '网红推荐! 声誉+20, 今日销量大幅提升';
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
                GameState.inventory = Math.max(0, GameState.inventory - 3000);
                return '发现病虫害! 库存-3000颗';
            },
            type: 'negative'
        },
        {
            name: '负面新闻',
            effect: () => {
                GameState.reputation = clamp(GameState.reputation - 15, 0, 100);
                return '出现负面新闻! 声誉-15';
            },
            type: 'negative'
        },
        {
            name: '设备故障',
            effect: () => {
                GameState.money = Math.max(0, GameState.money - 1000);
                return '冷藏设备故障! 维修费¥1,000';
            },
            type: 'negative'
        },
        {
            name: '竞争对手打压',
            effect: () => {
                GameState.specialEffects.competitorDebuff = 3;
                return '竞争对手恶意打压! 未来3天销量-30%';
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

    // 减少特殊效果计时器
    if (GameState.specialEffects.competitorDebuff > 0) {
        GameState.specialEffects.competitorDebuff--;
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
                超过了法定上限 <strong style="color: var(--error);">${formatMoney(15)}</strong>!
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
                "哄抬物价是违法行为,请合理定价!"
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
        cannedProduction: GameState.cannedProduction
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

        return true;
    } catch (e) {
        console.error('加载存档失败:', e);
        return false;
    }
}

// ==================== 导出存档功能 ====================
function exportSave() {
    const saveData = localStorage.getItem('cabbageSimulatorSave');
    if (!saveData) {
        alert('当前没有存档可导出!');
        return;
    }

    // 创建一个Blob对象,使用text/plain格式
    const blob = new Blob([saveData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // 创建下载链接,使用.txt扩展名
    const a = document.createElement('a');
    a.href = url;
    a.download = `cabbage-save-day${GameState.day}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog('💾 存档已导出为TXT文件!', 'positive');
}

// ==================== 导入存档功能 ====================
function importSave(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.json')) {
        alert('请选择.txt或.json格式的存档文件!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const saveData = e.target.result;
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

            // 重新加载游戏
            location.reload();
        } catch (error) {
            alert('存档文件格式错误!请确保文件内容是正确的JSON格式。\n错误信息: ' + error.message);
            // 重置文件输入框
            event.target.value = '';
        }
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

    // 重置升级系统状态
    GameState.restaurantLevel = 0;
    GameState.canUpgradeToRestaurant = false;
    GameState.cannedProduction = {
        enabled: false,
        cabbagesPerCan: 1
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

    // 价格滑块
    const priceSlider = document.getElementById('price-slider');
    priceSlider.addEventListener('input', (e) => {
        GameState.currentPrice = parseInt(e.target.value);
        document.getElementById('price-display').textContent = GameState.currentPrice;

        // 根据餐馆等级检查价格限制
        const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
        if (GameState.currentPrice > maxPrice) {
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
    if (GameState.codeRedeemed) {
        alert('你已经使用过兑换码了!每次游戏只能使用一次。');
        return;
    }

    const input = prompt('请输入兑换码:');
    if (!input) return;

    const code = input.trim();

    if (code === 'CHM is big SB') {
        GameState.codeRedeemed = true;
        GameState.inventory += 100000;
        addLog('🎁 兑换码成功! 获得 100,000 颗卷心菜!', 'positive');
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
    addLog(`罐头生产设置更新: 每个罐头含 ${value} 个卷心菜`, 'neutral');
}

// ==================== 启动游戏 ====================
document.addEventListener('DOMContentLoaded', initGame);
