// 中文像素化字体处理工具
// 使用CSS像素化效果实现中文显示

// 中文宝可梦名称映射 - 扩展更多宝可梦
const pokemonNameMap: Record<string, string> = {
  'bulbasaur': '妙蛙种子',
  'ivysaur': '妙蛙草',
  'venusaur': '妙蛙花',
  'charmander': '小火龙',
  'charmeleon': '火恐龙',
  'charizard': '喷火龙',
  'squirtle': '杰尼龟',
  'wartortle': '卡咪龟',
  'blastoise': '水箭龟',
  'caterpie': '绿毛虫',
  'metapod': '铁甲蛹',
  'butterfree': '巴大蝶',
  'weedle': '独角虫',
  'kakuna': '铁壳蛹',
  'beedrill': '大针蜂',
  'pidgey': '波波',
  'pidgeotto': '比比鸟',
  'pidgeot': '大比鸟',
  'rattata': '小拉达',
  'raticate': '拉达',
  'spearow': '烈雀',
  'fearow': '大嘴雀',
  'ekans': '阿柏蛇',
  'arbok': '阿柏怪',
  'pikachu': '皮卡丘',
  'raichu': '雷丘',
  'sandshrew': '穿山鼠',
  'sandslash': '穿山王',
  'nidoran-f': '尼多兰',
  'nidorina': '尼多娜',
  'nidoqueen': '尼多后',
  'nidoran-m': '尼多朗',
  'nidorino': '尼多力诺',
  'nidoking': '尼多王',
  'clefairy': '皮皮',
  'clefable': '皮可西',
  'vulpix': '六尾',
  'ninetales': '九尾',
  'jigglypuff': '胖丁',
  'wigglytuff': '胖可丁',
  'zubat': '超音蝠',
  'golbat': '大嘴蝠',
  'oddish': '走路草',
  'gloom': '臭臭花',
  'vileplume': '霸王花',
  'paras': '派拉斯',
  'parasect': '派拉斯特',
  'venonat': '毛球',
  'venomoth': '摩鲁蛾',
  'diglett': '地鼠',
  'dugtrio': '三地鼠',
  'meowth': '喵喵',
  'persian': '猫老大',
  'psyduck': '可达鸭',
  'golduck': '哥达鸭',
  'mankey': '猴怪',
  'primeape': '火暴猴',
  'growlithe': '卡蒂狗',
  'arcanine': '风速狗',
  'poliwag': '蚊香蝌蚪',
  'poliwhirl': '蚊香君',
  'poliwrath': '蚊香泳士',
  'abra': '凯西',
  'kadabra': '勇基拉',
  'alakazam': '胡地',
  'machop': '腕力',
  'machoke': '豪力',
  'machamp': '怪力',
  'bellsprout': '喇叭芽',
  'weepinbell': '口呆花',
  'victreebel': '大食花',
  'tentacool': '玛瑙水母',
  'tentacruel': '毒刺水母',
  'geodude': '小拳石',
  'graveler': '隆隆石',
  'golem': '隆隆岩',
  'ponyta': '小火马',
  'rapidash': '烈焰马',
  'slowpoke': '呆呆兽',
  'slowbro': '呆壳兽',
  'magnemite': '小磁怪',
  'magneton': '三合一磁怪',
  'farfetchd': '大葱鸭',
  'doduo': '嘟嘟',
  'dodrio': '嘟嘟利',
  'seel': '小海狮',
  'dewgong': '白海狮',
  'grimer': '臭泥',
  'muk': '臭臭泥',
  'shellder': '大舌贝',
  'cloyster': '刺甲贝',
  'gastly': '鬼斯',
  'haunter': '鬼斯通',
  'gengar': '耿鬼',
  'onix': '大岩蛇',
  'drowzee': '催眠貘',
  'hypno': '引梦貘人',
  'krabby': '大钳蟹',
  'kingler': '巨钳蟹',
  'voltorb': '霹雳电球',
  'electrode': '顽皮雷弹',
  'exeggcute': '蛋蛋',
  'exeggutor': '椰蛋树',
  'cubone': '卡拉卡拉',
  'marowak': '嘎啦嘎啦',
  'hitmonlee': '飞腿郎',
  'hitmonchan': '快拳郎',
  'lickitung': '大舌头',
  'koffing': '瓦斯弹',
  'weezing': '双弹瓦斯',
  'rhyhorn': '独角犀牛',
  'rhydon': '钻角犀兽',
  'chansey': '吉利蛋',
  'tangela': '蔓藤怪',
  'kangaskhan': '袋兽',
  'horsea': '墨海马',
  'seadra': '海刺龙',
  'goldeen': '角金鱼',
  'seaking': '金鱼王',
  'staryu': '海星星',
  'starmie': '宝石海星',
  'mr-mime': '魔墙人偶',
  'scyther': '飞天螳螂',
  'jynx': '迷唇姐',
  'electabuzz': '电击兽',
  'magmar': '鸭嘴火兽',
  'pinsir': '凯罗斯',
  'tauros': '肯泰罗',
  'magikarp': '鲤鱼王',
  'gyarados': '暴鲤龙',
  'lapras': '拉普拉斯',
  'ditto': '百变怪',
  'eevee': '伊布',
  'vaporeon': '水伊布',
  'jolteon': '雷伊布',
  'flareon': '火伊布',
  'porygon': '多边兽',
  'omanyte': '菊石兽',
  'omastar': '多刺菊石兽',
  'kabuto': '化石盔',
  'kabutops': '镰刀盔',
  'aerodactyl': '化石翼龙',
  'snorlax': '卡比兽',
  'articuno': '急冻鸟',
  'zapdos': '闪电鸟',
  'moltres': '火焰鸟',
  'dratini': '迷你龙',
  'dragonair': '哈克龙',
  'dragonite': '快龙',
  'mewtwo': '超梦',
  'mew': '梦幻',
  // 第2世代
  'chikorita': '菊草叶',
  'bayleef': '月桂叶',
  'meganium': '大菊花',
  'cyndaquil': '火球鼠',
  'quilava': '火岩鼠',
  'typhlosion': '火暴兽',
  'totodile': '小锯鳄',
  'croconaw': '蓝鳄',
  'feraligatr': '大力鳄',
  'sentret': '尾立',
  'furret': '大尾立',
  'hoothoot': '咕咕',
  'noctowl': '猫头夜鹰',
  'ledyba': '芭瓢虫',
  'ledian': '安瓢虫',
  'spinarak': '圆丝蛛',
  'ariados': '阿利多斯',
  'crobat': '叉字蝠',
  'chinchou': '灯笼鱼',
  'lanturn': '电灯怪',
  'pichu': '皮丘',
  'cleffa': '皮宝宝',
  'igglybuff': '宝宝丁',
  'togepi': '波克比',
  'togetic': '波克基古',
  'natu': '天然雀',
  'xatu': '天然鸟',
  'mareep': '咩利羊',
  'flaaffy': '茸茸羊',
  'ampharos': '电龙',
  'bellossom': '美丽花',
  'marill': '玛力露',
  'azumarill': '玛力露丽',
  'sudowoodo': '胡说树',
  'politoed': '蚊香蛙皇',
  'hoppip': '毽子草',
  'skiploom': '毽子花',
  'jumpluff': '毽子棉',
  'aipom': '长尾怪手',
  'sunkern': '向日种子',
  'sunflora': '向日花怪',
  'yanma': '阳阳玛',
  'wooper': '乌波',
  'quagsire': '沼王',
  'espeon': '太阳伊布',
  'umbreon': '月亮伊布',
  'murkrow': '黑暗鸦',
  'slowking': '呆呆王',
  'misdreavus': '梦妖',
  'unown': '未知图腾',
  'wobbuffet': '果然翁',
  'girafarig': '麒麟奇',
  'pineco': '榛果球',
  'forretress': '佛烈托斯',
  'dunsparce': '土龙弟弟',
  'gligar': '天蝎',
  'steelix': '大钢蛇',
  'snubbull': '布鲁',
  'granbull': '布鲁皇',
  'qwilfish': '千针鱼',
  'scizor': '巨钳螳螂',
  'shuckle': '壶壶',
  'heracross': '赫拉克罗斯',
  'sneasel': '狃拉',
  'teddiursa': '熊宝宝',
  'ursaring': '圈圈熊',
  'slugma': '熔岩虫',
  'magcargo': '熔岩蜗牛',
  'swinub': '小山猪',
  'piloswine': '长毛猪',
  'corsola': '太阳珊瑚',
  'remoraid': '铁炮鱼',
  'octillery': '章鱼桶',
  'delibird': '信使鸟',
  'mantine': '巨翅飞鱼',
  'skarmory': '盔甲鸟',
  'houndour': '戴鲁比',
  'houndoom': '黑鲁加',
  'kingdra': '刺龙王',
  'phanpy': '小小象',
  'donphan': '顿甲',
  'porygon2': '多边兽2',
  'stantler': '惊角鹿',
  'smeargle': '图图犬',
  'tyrogue': '无畏小子',
  'hitmontop': '战舞郎',
  'smoochum': '迷唇娃',
  'elekid': '电击怪',
  'magby': '鸭嘴宝宝',
  'miltank': '大奶罐',
  'blissey': '幸福蛋',
  'raikou': '雷公',
  'entei': '炎帝',
  'suicune': '水君',
  'larvitar': '幼基拉斯',
  'pupitar': '沙基拉斯',
  'tyranitar': '班基拉斯',
  'lugia': '洛奇亚',
  'ho-oh': '凤王',
  'celebi': '时拉比'
};

// 特性中文映射
const abilityNameMap: Record<string, string> = {
  'overgrow': '茂盛',
  'blaze': '猛火',
  'torrent': '激流',
  'shield-dust': '鳞粉',
  'run-away': '逃跑',
  'shed-skin': '蜕皮',
  'compound-eyes': '复眼',
  'tinted-lens': '有色眼镜',
  'swarm': '虫之预感',
  'keen-eye': '锐利目光',
  'tangled-feet': '蹒跚',
  'big-pecks': '健壮胸肌',
  'guts': '毅力',
  'hustle': '活力',
  'sand-veil': '沙隐',
  'static': '静电',
  'lightning-rod': '避雷针',
  'battle-armor': '战斗盔甲',
  'speed-boost': '加速',
  'sturdy': '结实',
  'damp': '湿气',
  'limber': '柔软',
  'unburden': '轻装',
  'chlorophyll': '叶绿素',
  'solar-power': '太阳之力',
  'early-bird': '早起',
  'flash-fire': '引火',
  'white-smoke': '白色烟雾',
  'levitate': '飘浮',
  'effect-spore': '孢子',
  'dry-skin': '干燥皮肤',
  'poison-heal': '毒疗',
  'natural-cure': '自然回复',
  'serene-grace': '天恩',
  'swift-swim': '悠游自如',
  'rain-dish': '雨盘',
  'adaptability': '适应力',
  'download': '下载',
  'anticipation': '危险预知',
  'forewarn': '预知梦',
  'unaware': '纯朴',
  'cloud-nine': '无关天气',
  'insomnia': '不眠',
  'frisk': '察觉',
  'mold-breaker': '破格',
  'pressure': '压迫感',
  'thick-fat': '厚脂肪',
  'super-luck': '超幸运',
  'scrappy': '胆量',
  'hyper-cutter': '怪力钳',
  'sand-stream': '扬沙',
  'snow-warning': '降雪',
  'intimidate': '威吓',
  'technician': '技术高手',
  'skill-link': '连续攻击',
  'rock-head': '坚硬脑袋',
  'reckless': '舍身',
  'sheer-force': '强行',
  'moxie': '自信过度',
  'justified': '正义之心',
  'rattled': '胆怯',
  'magic-guard': '魔法防守',
  'regenerator': '再生力',
  'gluttony': '贪吃鬼',
  'marvel-scale': '神奇鳞片',
  'anger-point': '愤怒穴位',
  'competitive': '好胜',
  'defiant': '不服输',
  'cute-charm': '迷人之躯',
  'magic-bounce': '魔法镜',
  'prankster': '恶作剧之心',
  'multiscale': '多重鳞片',
  'toxic-boost': '毒激',
  'flare-boost': '热暴走',
  'harvest': '收获',
  'telepathy': '心灵感应',
  'analytic': '分析',
  'illusion': '幻觉',
  'imposter': '变身',
  'infiltrator': '穿透',
  'mummy': '木乃伊'
};

// 获取宝可梦中文名称
export function getPokemonChineseName(englishName: string): string {
  return pokemonNameMap[englishName.toLowerCase()] || englishName;
}

// 获取特性中文名称
export function getAbilityChineseName(englishName: string): string {
  return abilityNameMap[englishName.toLowerCase()] || englishName;
}

// 生成融合名称
export function generateFusionName(name1: string, name2: string): string {
  const chinese1 = getPokemonChineseName(name1);
  const chinese2 = getPokemonChineseName(name2);
  
  // 简单的名称融合算法
  const half1 = chinese1.slice(0, Math.ceil(chinese1.length / 2));
  const half2 = chinese2.slice(Math.floor(chinese2.length / 2));
  
  // 随机后缀
  const suffixes = ['兽', '龙', '鸟', '鱼', '花', '草', '火', '水', '雷', '冰', '风', '影', '光', '暗', '王', '皇', '灵', '怪', '妖', '精'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return half1 + half2 + suffix;
}

// 创建像素化CSS类
export function createPixelFontClass(): string {
  return `
    .pixel-font {
      font-family: 'ZCOOL QingKe HuangYou', 'Press Start 2P', monospace;
      font-weight: bold;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
      letter-spacing: 1px;
    }
  `;
}

// 生成更复杂的融合名称
export function generateComplexFusionName(name1: string, name2: string): string {
  const chinese1 = getPokemonChineseName(name1);
  const chinese2 = getPokemonChineseName(name2);
  
  // 中文名字符数组
  const chars1 = chinese1.split('');
  const chars2 = chinese2.split('');
  
  // 随机选择组合方式
  const methods = [
    // 前一半+后一半
    () => {
      const half1 = chars1.slice(0, Math.ceil(chars1.length / 2)).join('');
      const half2 = chars2.slice(Math.floor(chars2.length / 2)).join('');
      return half1 + half2;
    },
    // 交替字符
    () => {
      const maxLen = Math.max(chars1.length, chars2.length);
      let result = '';
      for (let i = 0; i < maxLen; i++) {
        if (i < chars1.length) result += chars1[i];
        if (i < chars2.length) result += chars2[i];
      }
      return result.slice(0, 4);
    },
    // 首字+尾字
    () => {
      const first = chars1[0] || '';
      const last = chars2[chars2.length - 1] || '';
      return first + last;
    }
  ];
  
  const method = methods[Math.floor(Math.random() * methods.length)];
  const baseName = method();
  
  // 随机后缀
  const suffixes = ['兽', '龙', '鸟', '鱼', '花', '草', '火', '水', '雷', '冰', '风', '影', '光', '暗', '王', '皇', '灵', '怪', '妖', '精', '神', '魔', '仙', '侠'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return baseName + suffix;
}
