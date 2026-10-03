// 额外武魂扩展 - extra-souls.js
// 新增10种武魂，每种9个魂技

const EXTRA_SOULS = [
  // ========== 1. 七宝琉璃塔 ==========
  {
    id: 'seven_treasures',
    name: '七宝琉璃塔',
    element: 'support',
    type: 'support',
    color: 0xffd700,
    desc: '辅助系器武魂，七宝琉璃塔形态，天下第一辅助武魂，可大幅增幅队友属性',
    attackType: 'ranged',
    attackRange: 15,
    attackSpeed: 0.8,
    atkBonus: 1,
    spdBonus: 0.5,
    defBonus: 2,
    skills: [
      { name: '力量增幅', type: 'buff', dmgMult: 1.5, desc: '提升队友攻击力，使其战力大增' },
      { name: '速度增幅', type: 'buff', dmgMult: 1.3, desc: '提升队友速度，身法如电' },
      { name: '防御增幅', type: 'buff', dmgMult: 1.4, desc: '提升队友防御力，固若金汤' },
      { name: '魂力增幅', type: 'buff', dmgMult: 1.6, desc: '提升魂力上限，源源不绝' },
      { name: '生命增幅', type: 'heal', dmgMult: 1.8, desc: '恢复队友生命，生机盎然' },
      { name: '七宝神光', type: 'aoe', dmgMult: 2.5, desc: '七彩神光爆发，攻击范围内敌人' },
      { name: '九宝真身', type: 'buff', dmgMult: 3.0, desc: '武魂真身，琉璃塔升华为九宝，全属性大幅提升' },
      { name: '九宝神光罩', type: 'defense', dmgMult: 3.5, desc: '无敌护盾展开，免疫一切伤害' },
      { name: '七宝转出有琉璃', type: 'ultimate', dmgMult: 5.0, desc: '终极奥义，七宝转出，全队全属性翻倍' },
    ],
  },

  // ========== 2. 九心海棠 ==========
  {
    id: 'nine_heart_begonia',
    name: '九心海棠',
    element: 'support',
    type: 'support',
    color: 0xff69b4,
    desc: '辅助系器武魂，九心海棠形态，最强治愈武魂，拥有起死回生之能',
    attackType: 'ranged',
    attackRange: 12,
    attackSpeed: 0.7,
    atkBonus: 0,
    spdBonus: 0.3,
    defBonus: 3,
    skills: [
      { name: '治愈之光', type: 'heal', dmgMult: 1.3, desc: '恢复单个目标生命，海棠光辉照耀' },
      { name: '花之守护', type: 'buff', dmgMult: 1.4, desc: '海棠花瓣护体，防御力提升' },
      { name: '海棠绽放', type: 'heal', dmgMult: 2.0, desc: '海棠花盛开，范围内队友恢复生命' },
      { name: '生命祝福', type: 'buff', dmgMult: 1.6, desc: '祝福队友，生命上限大幅提升' },
      { name: '花毒', type: 'aoe', dmgMult: 2.2, desc: '海棠花瓣带毒，对敌人造成持续伤害' },
      { name: '海棠领域', type: 'aoe', dmgMult: 3.0, desc: '海棠领域展开，队友持续回血，敌人持续中毒' },
      { name: '九心真身', type: 'buff', dmgMult: 3.5, desc: '武魂真身，九心海棠完全觉醒，治愈力暴涨' },
      { name: '生死人肉白骨', type: 'heal', dmgMult: 4.0, desc: '超强治愈之力，可起死回生，肉白骨' },
      { name: '海棠奥义', type: 'ultimate', dmgMult: 4.5, desc: '终极奥义，海棠绽放天地间，全队满血满状态' },
    ],
  },

  // ========== 3. 蓝电霸王龙 ==========
  {
    id: 'blue_lightning_dragon',
    name: '蓝电霸王龙',
    element: 'thunder',
    type: 'attack',
    color: 0x4169e1,
    desc: '强攻系兽武魂，蓝电霸王龙形态，天下第一兽武魂，雷电之力毁天灭地',
    attackType: 'melee',
    attackRange: 6,
    attackSpeed: 0.45,
    atkBonus: 9,
    spdBonus: 0.8,
    defBonus: 4,
    skills: [
      { name: '雷霆龙爪', type: 'melee', dmgMult: 1.9, desc: '龙爪附带雷电，撕裂敌人' },
      { name: '雷霆万钧', type: 'aoe', dmgMult: 2.3, desc: '雷霆从天而降，轰击范围内敌人' },
      { name: '雷霆之怒', type: 'buff', dmgMult: 1.8, desc: '雷霆之力附体，攻击力大幅提升' },
      { name: '雷暴', type: 'aoe', dmgMult: 2.8, desc: '雷暴席卷四周，万物化为焦土' },
      { name: '蓝电神龙疾', type: 'dash', dmgMult: 3.5, desc: '化身为龙形闪电，冲锋撕裂敌人' },
      { name: '龙之怒', type: 'aoe', dmgMult: 3.8, desc: '龙怒咆哮，雷霆震退四周敌人' },
      { name: '蓝电霸王龙真身', type: 'buff', dmgMult: 4.2, desc: '武魂真身，龙化形态，雷电之力登峰造极' },
      { name: '天雷', type: 'ranged', dmgMult: 4.5, desc: '召唤九天神雷，从天而降毁灭敌人' },
      { name: '蓝电龙皇破', type: 'ultimate', dmgMult: 6.0, desc: '终极奥义，龙皇降临，雷霆万钧毁天灭地' },
    ],
  },

  // ========== 4. 鬼魅 ==========
  {
    id: 'ghost',
    name: '鬼魅',
    element: 'dark',
    type: 'agile',
    color: 0x6b5b95,
    desc: '敏攻系兽武魂，鬼魅形态，来去无踪，擅长暗杀与诡异身法',
    attackType: 'melee',
    attackRange: 4,
    attackSpeed: 0.2,
    atkBonus: 5,
    spdBonus: 2.5,
    defBonus: -2,
    skills: [
      { name: '鬼影', type: 'dash', dmgMult: 1.7, desc: '快速位移攻击，如鬼魅般出没' },
      { name: '鬼爪', type: 'melee', dmgMult: 1.5, desc: '鬼魅利爪出击，阴寒刺骨' },
      { name: '隐身', type: 'buff', dmgMult: 1.3, desc: '进入隐身状态，敌人无法察觉' },
      { name: '鬼影迷踪', type: 'dash', dmgMult: 2.2, desc: '诡异步法，身形飘忽，多重攻击' },
      { name: '幽冥百爪', type: 'melee', dmgMult: 2.8, desc: '百爪齐出，爪影重重，撕裂一切' },
      { name: '鬼影重重', type: 'aoe', dmgMult: 3.2, desc: '分身万千，群攻范围内敌人' },
      { name: '鬼魅真身', type: 'buff', dmgMult: 4.0, desc: '武魂真身，虚无状态，免疫物理攻击' },
      { name: '幽冥领域', type: 'aoe', dmgMult: 4.2, desc: '幽冥领域展开，一切敌人减速受创' },
      { name: '万鬼噬魂', type: 'ultimate', dmgMult: 5.8, desc: '终极奥义，万鬼齐出，吞噬敌人魂魄' },
    ],
  },

  // ========== 5. 月刃 ==========
  {
    id: 'moon_blade',
    name: '月刃',
    element: 'moon',
    type: 'attack',
    color: 0xc0c0c0,
    desc: '强攻系器武魂，月刃形态，月光化作利刃，攻守兼备',
    attackType: 'ranged',
    attackRange: 10,
    attackSpeed: 0.5,
    atkBonus: 7,
    spdBonus: 0.6,
    defBonus: 2,
    skills: [
      { name: '月刃斩', type: 'ranged', dmgMult: 1.8, desc: '月刃飞斩，划破长空' },
      { name: '月光', type: 'buff', dmgMult: 1.5, desc: '月光加持，攻击力大幅提升' },
      { name: '双月同天', type: 'aoe', dmgMult: 2.3, desc: '两轮月刃回旋，切割范围内敌人' },
      { name: '月刃连击', type: 'ranged', dmgMult: 2.6, desc: '连续发射月刃，连绵不绝' },
      { name: '月落星沉', type: 'aoe', dmgMult: 3.2, desc: '月光如瀑倾泻而下，万物沉沦' },
      { name: '月影', type: 'melee', dmgMult: 3.5, desc: '月影突袭，近身致命一击' },
      { name: '月刃真身', type: 'buff', dmgMult: 4.0, desc: '武魂真身，月刃巨大化，月光之力暴涨' },
      { name: '皎月领域', type: 'aoe', dmgMult: 4.3, desc: '皎月领域展开，敌人持续受月光灼伤' },
      { name: '月神之怒', type: 'ultimate', dmgMult: 5.8, desc: '终极奥义，月神降临，月光审判万物' },
    ],
  },

  // ========== 6. 火凤凰 ==========
  {
    id: 'fire_phoenix',
    name: '火凤凰',
    element: 'fire',
    type: 'attack',
    color: 0xff6347,
    desc: '强攻系兽武魂，火凤凰形态，纯净凤凰之火，涅槃重生之力',
    attackType: 'ranged',
    attackRange: 11,
    attackSpeed: 0.55,
    atkBonus: 6,
    spdBonus: 0.4,
    defBonus: 2,
    skills: [
      { name: '凤凰火线', type: 'ranged', dmgMult: 1.9, desc: '喷射灼热凤凰火焰，焚尽一切' },
      { name: '凤凰火羽', type: 'aoe', dmgMult: 2.1, desc: '火焰羽毛散射，覆盖大范围敌人' },
      { name: '凤凰火焰柱', type: 'ranged', dmgMult: 2.5, desc: '凝聚火焰柱，贯穿敌人' },
      { name: '凤凰化', type: 'buff', dmgMult: 1.8, desc: '凤凰附体，全属性提升' },
      { name: '凤凰流星雨', type: 'aoe', dmgMult: 3.0, desc: '火焰流星从天而降，毁灭大地' },
      { name: '凤凰烈焰击', type: 'ranged', dmgMult: 3.5, desc: '强力火焰弹，爆炸产生巨大伤害' },
      { name: '火凤凰真身', type: 'buff', dmgMult: 4.0, desc: '武魂真身，火凤凰形态，火焰之力登峰造极' },
      { name: '凤凰领域', type: 'aoe', dmgMult: 4.5, desc: '凤凰领域展开，焚尽领域内一切敌人' },
      { name: '凤凰涅槃击', type: 'ultimate', dmgMult: 6.0, desc: '终极奥义，涅槃重生，释放毁灭之火' },
    ],
  },

  // ========== 7. 冰凤凰 ==========
  {
    id: 'ice_phoenix',
    name: '冰凤凰',
    element: 'ice',
    type: 'control',
    color: 0x87ceeb,
    desc: '控制系兽武魂，冰凤凰形态，极寒之力，冰封万物',
    attackType: 'ranged',
    attackRange: 12,
    attackSpeed: 0.6,
    atkBonus: 4,
    spdBonus: 0.5,
    defBonus: 3,
    skills: [
      { name: '冰锥术', type: 'ranged', dmgMult: 1.6, desc: '发射尖锐冰锥，刺穿敌人' },
      { name: '冰冻', type: 'control', dmgMult: 1.8, desc: '冰冻敌人，使其无法行动' },
      { name: '冰墙', type: 'defense', dmgMult: 2.0, desc: '召唤冰墙防御，阻挡敌人攻击' },
      { name: '冰风暴', type: 'aoe', dmgMult: 2.5, desc: '冰风暴席卷，范围冰冻伤害' },
      { name: '极寒领域', type: 'aoe', dmgMult: 3.0, desc: '极寒领域展开，减速并持续冻伤敌人' },
      { name: '冰爆术', type: 'aoe', dmgMult: 3.5, desc: '冰冻后引爆，造成巨大范围伤害' },
      { name: '冰凤凰真身', type: 'buff', dmgMult: 4.0, desc: '武魂真身，冰凤形态，极寒之力暴涨' },
      { name: '绝对零度', type: 'control', dmgMult: 4.5, desc: '绝对零度降临，冰封一切敌人' },
      { name: '凤凰冰雪劫', type: 'ultimate', dmgMult: 5.5, desc: '终极奥义，冰雪天劫降临，天地冰封' },
    ],
  },

  // ========== 8. 碧磷蛇皇 ==========
  {
    id: 'green_phosphorus_snake',
    name: '碧磷蛇皇',
    element: 'poison',
    type: 'control',
    color: 0x32cd32,
    desc: '控制系兽武魂，碧磷蛇皇形态，剧毒无比，万物皆腐',
    attackType: 'ranged',
    attackRange: 10,
    attackSpeed: 0.65,
    atkBonus: 5,
    spdBonus: 0.4,
    defBonus: 2,
    skills: [
      { name: '碧磷毒', type: 'ranged', dmgMult: 1.7, desc: '碧磷蛇毒喷射，腐蚀敌人' },
      { name: '蛇缠', type: 'control', dmgMult: 1.9, desc: '蛇身缠绕敌人，使其动弹不得' },
      { name: '毒雾', type: 'aoe', dmgMult: 2.2, desc: '释放碧磷毒雾，范围内敌人持续中毒' },
      { name: '蛇信', type: 'ranged', dmgMult: 2.6, desc: '蛇信快速出击，精准打击敌人' },
      { name: '万蛇噬心', type: 'aoe', dmgMult: 3.0, desc: '万蛇齐出，撕咬吞噬敌人' },
      { name: '碧磷神光', type: 'ranged', dmgMult: 3.5, desc: '碧磷神光腐蚀，所过之处万物消融' },
      { name: '蛇皇真身', type: 'buff', dmgMult: 4.0, desc: '武魂真身，蛇皇化，剧毒之力登峰造极' },
      { name: '毒域', type: 'aoe', dmgMult: 4.5, desc: '毒域展开，万物中毒，寸草不生' },
      { name: '碧磷万劫', type: 'ultimate', dmgMult: 5.5, desc: '终极奥义，万毒噬身，永劫不复' },
    ],
  },

  // ========== 9. 大力金刚熊 ==========
  {
    id: 'diamond_mammoth',
    name: '大力金刚熊',
    element: 'earth',
    type: 'attack',
    color: 0xd2b48c,
    desc: '强攻系兽武魂，大力金刚熊形态，力大无穷，防御惊人',
    attackType: 'melee',
    attackRange: 5,
    attackSpeed: 0.6,
    atkBonus: 10,
    spdBonus: 0,
    defBonus: 8,
    skills: [
      { name: '大力金刚掌', type: 'melee', dmgMult: 2.0, desc: '力大无穷的掌击，开山裂石' },
      { name: '金刚护体', type: 'buff', dmgMult: 1.6, desc: '金刚护体，防御力暴涨' },
      { name: '大力金刚拳', type: 'melee', dmgMult: 2.5, desc: '重拳出击，力贯千钧' },
      { name: '地震波', type: 'aoe', dmgMult: 2.8, desc: '跺脚引发地震，震伤周围敌人' },
      { name: '大力神爪', type: 'melee', dmgMult: 3.2, desc: '利爪撕裂，粉碎一切防御' },
      { name: '金刚怒', type: 'buff', dmgMult: 3.0, desc: '暴怒状态，攻击力暴涨' },
      { name: '金刚真身', type: 'buff', dmgMult: 3.8, desc: '武魂真身，金刚化，攻防登峰造极' },
      { name: '大力领域', type: 'aoe', dmgMult: 4.2, desc: '大力领域展开，压制敌人，重力倍增' },
      { name: '金刚破岳', type: 'ultimate', dmgMult: 6.5, desc: '终极奥义，一拳破山岳，力压万古' },
    ],
  },

  // ========== 10. 九尾狐 ==========
  {
    id: 'nine_tailed_fox',
    name: '九尾狐',
    element: 'charm',
    type: 'agile',
    color: 0xffa500,
    desc: '敏攻系兽武魂，九尾狐形态，魅惑幻术，速度奇快',
    attackType: 'melee',
    attackRange: 5,
    attackSpeed: 0.3,
    atkBonus: 6,
    spdBonus: 2,
    defBonus: 1,
    skills: [
      { name: '狐爪', type: 'melee', dmgMult: 1.6, desc: '狐狸利爪攻击，迅捷凌厉' },
      { name: '魅惑', type: 'control', dmgMult: 1.5, desc: '魅惑敌人，使其神志混乱' },
      { name: '狐影', type: 'dash', dmgMult: 2.0, desc: '高速移动攻击，身影飘忽不定' },
      { name: '九尾', type: 'aoe', dmgMult: 2.5, desc: '九尾齐出，全方位攻击敌人' },
      { name: '幻术', type: 'control', dmgMult: 2.8, desc: '制造幻觉，困住敌人心智' },
      { name: '狐火', type: 'ranged', dmgMult: 3.2, desc: '妖狐火焰，灼烧灵魂' },
      { name: '九尾真身', type: 'buff', dmgMult: 4.0, desc: '武魂真身，九尾完全觉醒，妖力暴涨' },
      { name: '九尾领域', type: 'aoe', dmgMult: 4.5, desc: '九尾领域展开，幻境重重，迷失方向' },
      { name: '九尾天狐', type: 'ultimate', dmgMult: 5.5, desc: '终极奥义，天狐降世，魅惑天地' },
    ],
  },
];

// 将新武魂添加到全局配置（延迟到CONFIG初始化后）
function _injectExtraSouls() {
  if (window.CONFIG && window.CONFIG.MARTIAL_SOULS) {
    window.CONFIG.MARTIAL_SOULS.push(...EXTRA_SOULS);
    // 标记额外武魂已加载完成
    window._extraSoulsLoaded = true;
    console.log('[extra-souls] 额外武魂注入完成，共', window.CONFIG.MARTIAL_SOULS.length, '种武魂');
    
    // 注入额外武魂图标
    _injectExtraSoulIcons();
  } else {
    setTimeout(_injectExtraSouls, 100);
  }
}

// 注入额外武魂的图标
function _injectExtraSoulIcons() {
  if (!window.GameIcons || !window.GameIcons.soulIcons) {
    setTimeout(_injectExtraSoulIcons, 100);
    return;
  }
  
  const icons = window.GameIcons.soulIcons;
  
  // 七宝琉璃塔
  icons.seven_treasures = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="stGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#fbbf24;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#fef08a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect x="20" y="12" width="24" height="6" rx="1" fill="url(#stGrad)" stroke="#fff" stroke-width="0.5"/>
    <rect x="18" y="18" width="28" height="5" rx="1" fill="url(#stGrad)" stroke="#fff" stroke-width="0.5"/>
    <rect x="22" y="23" width="20" height="6" rx="1" fill="url(#stGrad)" stroke="#fff" stroke-width="0.5"/>
    <rect x="18" y="29" width="28" height="5" rx="1" fill="url(#stGrad)" stroke="#fff" stroke-width="0.5"/>
    <rect x="24" y="34" width="16" height="6" rx="1" fill="url(#stGrad)" stroke="#fff" stroke-width="0.5"/>
    <rect x="20" y="40" width="24" height="5" rx="1" fill="url(#stGrad)" stroke="#fff" stroke-width="0.5"/>
    <rect x="26" y="45" width="12" height="6" rx="1" fill="url(#stGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M32 10 L34 12 L30 12 Z" fill="#fef08a" stroke="#fff" stroke-width="0.5"/>
    <circle cx="32" cy="8" r="2" fill="#fff" opacity="0.9"/>
  </svg>`;
  
  // 九心海棠
  icons.nine_heart_begonia = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bhGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#fda4af;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="8" fill="url(#bhGrad)" stroke="#fff" stroke-width="0.5"/>
    <ellipse cx="32" cy="18" rx="6" ry="10" fill="url(#bhGrad)" stroke="#fff" stroke-width="0.5" opacity="0.9"/>
    <ellipse cx="32" cy="46" rx="6" ry="10" fill="url(#bhGrad)" stroke="#fff" stroke-width="0.5" opacity="0.9"/>
    <ellipse cx="18" cy="32" rx="10" ry="6" fill="url(#bhGrad)" stroke="#fff" stroke-width="0.5" opacity="0.9"/>
    <ellipse cx="46" cy="32" rx="10" ry="6" fill="url(#bhGrad)" stroke="#fff" stroke-width="0.5" opacity="0.9"/>
    <ellipse cx="22" cy="20" rx="5" ry="8" fill="url(#bhGrad)" stroke="#fff" stroke-width="0.5" opacity="0.7" transform="rotate(-45 22 20)"/>
    <ellipse cx="42" cy="20" rx="5" ry="8" fill="url(#bhGrad)" stroke="#fff" stroke-width="0.5" opacity="0.7" transform="rotate(45 42 20)"/>
    <ellipse cx="22" cy="44" rx="5" ry="8" fill="url(#bhGrad)" stroke="#fff" stroke-width="0.5" opacity="0.7" transform="rotate(45 22 44)"/>
    <ellipse cx="42" cy="44" rx="5" ry="8" fill="url(#bhGrad)" stroke="#fff" stroke-width="0.5" opacity="0.7" transform="rotate(-45 42 44)"/>
    <circle cx="32" cy="32" r="4" fill="#fef08a" stroke="#fff" stroke-width="0.5"/>
  </svg>`;
  
  // 蓝电霸王龙
  icons.blue_lightning_dragon = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#93c5fd;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e3a8a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <path d="M20 18 L26 14 L30 20 L28 26 L36 22 L40 18 L44 24 L48 20 L46 28 L50 32 L44 36 L46 44 L38 42 L34 48 L30 42 L24 46 L22 38 L16 36 L18 28 L14 24 Z" fill="url(#bldGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M28 10 L30 16 L26 14 Z" fill="url(#bldGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M36 10 L34 16 L38 14 Z" fill="url(#bldGrad)" stroke="#fff" stroke-width="0.5"/>
    <circle cx="28" cy="28" r="2" fill="#fef08a"/>
    <circle cx="36" cy="28" r="2" fill="#fef08a"/>
    <path d="M30 34 Q32 36 34 34" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round"/>
    <path d="M24 50 L28 48 L32 52 L36 48 L40 50" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  </svg>`;
  
  // 鬼魅
  icons.ghost = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:0.9" />
        <stop offset="70%" style="stop-color:#9ca3af;stop-opacity:0.7" />
        <stop offset="100%" style="stop-color:#6b7280;stop-opacity:0.4" />
      </linearGradient>
    </defs>
    <path d="M20 16 Q20 8 32 8 Q44 8 44 16 L44 48 Q40 44 36 50 Q32 46 28 50 Q24 44 20 48 Z" fill="url(#ghostGrad)" stroke="#fff" stroke-width="0.5"/>
    <ellipse cx="26" cy="24" rx="3" ry="4" fill="#1f2937"/>
    <ellipse cx="38" cy="24" rx="3" ry="4" fill="#1f2937"/>
    <circle cx="26" cy="23" r="1" fill="#fff"/>
    <circle cx="38" cy="23" r="1" fill="#fff"/>
    <ellipse cx="32" cy="32" rx="4" ry="3" fill="#1f2937" opacity="0.5"/>
    <path d="M20 36 Q16 40 18 46" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
    <path d="M44 36 Q48 40 46 46" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
  </svg>`;
  
  // 月刃
  icons.moon_blade = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e0e7ff;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#a5b4fc;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
      </linearGradient>
    </defs>
    <path d="M40 8 Q24 12 20 32 Q24 52 40 56 Q28 44 28 32 Q28 20 40 8 Z" fill="url(#mbGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M44 12 L52 16 L48 32 L52 48 L44 52" fill="none" stroke="#c7d2fe" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <circle cx="32" cy="32" r="3" fill="#fff" opacity="0.8"/>
    <path d="M46 20 L50 24 M48 32 L52 32 M46 44 L50 40" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
  </svg>`;
  
  // 火凤凰
  icons.fire_phoenix = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="fpGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" style="stop-color:#fef08a;stop-opacity:1" />
        <stop offset="30%" style="stop-color:#fb923c;stop-opacity:1" />
        <stop offset="70%" style="stop-color:#ef4444;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
      </radialGradient>
    </defs>
    <path d="M32 6 Q42 14 46 28 Q52 22 56 16 Q52 32 42 42 Q36 48 32 50 Q28 48 22 42 Q12 32 8 16 Q12 22 18 28 Q22 14 32 6Z" fill="url(#fpGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M32 18 Q38 26 38 34 Q38 42 32 44 Q26 42 26 34 Q26 26 32 18Z" fill="#fef08a" opacity="0.4"/>
    <path d="M18 48 Q22 56 32 58 Q42 56 46 48" fill="none" stroke="#ef4444" stroke-width="2" opacity="0.8"/>
    <circle cx="26" cy="26" r="2" fill="#fff"/>
    <circle cx="38" cy="26" r="2" fill="#fff"/>
  </svg>`;
  
  // 冰凤凰
  icons.ice_phoenix = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ipGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
        <stop offset="30%" style="stop-color:#67e8f9;stop-opacity:1" />
        <stop offset="70%" style="stop-color:#0ea5e9;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0c4a6e;stop-opacity:1" />
      </radialGradient>
    </defs>
    <path d="M32 6 Q42 14 46 28 Q52 22 56 16 Q52 32 42 42 Q36 48 32 50 Q28 48 22 42 Q12 32 8 16 Q12 22 18 28 Q22 14 32 6Z" fill="url(#ipGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M32 18 Q38 26 38 34 Q38 42 32 44 Q26 42 26 34 Q26 26 32 18Z" fill="#fff" opacity="0.3"/>
    <path d="M16 20 L20 24 M12 28 L18 28 M16 36 L20 32" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    <path d="M48 20 L44 24 M52 28 L46 28 M48 36 L44 32" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    <circle cx="26" cy="26" r="2" fill="#fff"/>
    <circle cx="38" cy="26" r="2" fill="#fff"/>
  </svg>`;
  
  // 碧磷蛇
  icons.green_phosphorus_snake = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gpsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#86efac;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#22c55e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#166534;stop-opacity:1" />
      </linearGradient>
    </defs>
    <path d="M14 52 Q14 40 24 40 Q34 40 34 30 Q34 20 24 20 Q20 20 18 24" fill="none" stroke="url(#gpsGrad)" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="16" cy="18" rx="8" ry="6" fill="url(#gpsGrad)" stroke="#fff" stroke-width="0.5"/>
    <circle cx="12" cy="16" r="1.5" fill="#fef08a"/>
    <circle cx="12" cy="16" r="0.5" fill="#1f2937"/>
    <path d="M8 20 L4 22 M8 22 L4 20" stroke="#ef4444" stroke-width="1" stroke-linecap="round"/>
    <circle cx="28" cy="30" r="2" fill="#fef08a" opacity="0.6"/>
    <circle cx="24" cy="40" r="2" fill="#fef08a" opacity="0.6"/>
    <circle cx="20" cy="50" r="2" fill="#fef08a" opacity="0.6"/>
  </svg>`;
  
  // 钻石猛犸
  icons.diamond_mammoth = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#e0f2fe;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#7dd3fc;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="38" rx="20" ry="16" fill="url(#dmGrad)" stroke="#fff" stroke-width="0.5"/>
    <ellipse cx="20" cy="28" rx="10" ry="12" fill="url(#dmGrad)" stroke="#fff" stroke-width="0.5"/>
    <ellipse cx="44" cy="28" rx="10" ry="12" fill="url(#dmGrad)" stroke="#fff" stroke-width="0.5"/>
    <ellipse cx="24" cy="50" rx="4" ry="6" fill="url(#dmGrad)" stroke="#fff" stroke-width="0.5"/>
    <ellipse cx="40" cy="50" rx="4" ry="6" fill="url(#dmGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M14 24 L10 16 M50 24 L54 16" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <circle cx="18" cy="28" r="1.5" fill="#1f2937"/>
    <circle cx="46" cy="28" r="1.5" fill="#1f2937"/>
    <path d="M28 36 Q32 38 36 36" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round"/>
    <polygon points="32,16 36,24 32,28 28,24" fill="#fff" opacity="0.4"/>
  </svg>`;
  
  // 九尾狐
  icons.nine_tailed_fox = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ntfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#fce7f3;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#f472b6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#be185d;stop-opacity:1" />
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="36" rx="14" ry="12" fill="url(#ntfGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M20 28 Q14 20 16 12 Q22 18 26 24" fill="url(#ntfGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M44 28 Q50 20 48 12 Q42 18 38 24" fill="url(#ntfGrad)" stroke="#fff" stroke-width="0.5"/>
    <path d="M20 18 L22 22 L18 22 Z" fill="#fce7f3" stroke="#fff" stroke-width="0.3"/>
    <path d="M44 18 L42 22 L46 22 Z" fill="#fce7f3" stroke="#fff" stroke-width="0.3"/>
    <path d="M18 44 Q8 40 6 32 Q10 38 16 40" fill="url(#ntfGrad)" stroke="#fff" stroke-width="0.5" opacity="0.8"/>
    <path d="M22 48 Q10 50 8 42 Q14 46 20 44" fill="url(#ntfGrad)" stroke="#fff" stroke-width="0.5" opacity="0.7"/>
    <path d="M28 50 Q22 56 14 54 Q20 50 26 48" fill="url(#ntfGrad)" stroke="#fff" stroke-width="0.5" opacity="0.6"/>
    <path d="M46 44 Q56 40 58 32 Q54 38 48 40" fill="url(#ntfGrad)" stroke="#fff" stroke-width="0.5" opacity="0.8"/>
    <path d="M42 48 Q54 50 56 42 Q50 46 44 44" fill="url(#ntfGrad)" stroke="#fff" stroke-width="0.5" opacity="0.7"/>
    <path d="M36 50 Q42 56 50 54 Q44 50 38 48" fill="url(#ntfGrad)" stroke="#fff" stroke-width="0.5" opacity="0.6"/>
    <circle cx="26" cy="32" r="2" fill="#831843"/>
    <circle cx="38" cy="32" r="2" fill="#831843"/>
    <ellipse cx="32" cy="40" rx="2" ry="1.5" fill="#831843" opacity="0.6"/>
    <path d="M30 42 Q32 44 34 42" fill="none" stroke="#831843" stroke-width="0.5"/>
  </svg>`;
  
  console.log('[extra-souls] 额外武魂图标注入完成');
}

_injectExtraSouls();
