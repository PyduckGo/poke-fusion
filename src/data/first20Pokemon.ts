// 前20个宝可梦的中文名称和编号列表
export const first20Pokemon = [
  { id: 1, name: "妙蛙种子", english: "Bulbasaur", type: ["草", "毒"] },
  { id: 2, name: "妙蛙草", english: "Ivysaur", type: ["草", "毒"] },
  { id: 3, name: "妙蛙花", english: "Venusaur", type: ["草", "毒"] },
  { id: 4, name: "小火龙", english: "Charmander", type: ["火"] },
  { id: 5, name: "火恐龙", english: "Charmeleon", type: ["火"] },
  { id: 6, name: "喷火龙", english: "Charizard", type: ["火", "飞行"] },
  { id: 7, name: "杰尼龟", english: "Squirtle", type: ["水"] },
  { id: 8, name: "卡咪龟", english: "Wartortle", type: ["水"] },
  { id: 9, name: "水箭龟", english: "Blastoise", type: ["水"] },
  { id: 10, name: "绿毛虫", english: "Caterpie", type: ["虫"] },
  { id: 11, name: "铁甲蛹", english: "Metapod", type: ["虫"] },
  { id: 12, name: "巴大蝶", english: "Butterfree", type: ["虫", "飞行"] },
  { id: 13, name: "独角虫", english: "Weedle", type: ["虫", "毒"] },
  { id: 14, name: "铁壳蛹", english: "Kakuna", type: ["虫", "毒"] },
  { id: 15, name: "大针蜂", english: "Beedrill", type: ["虫", "毒"] },
  { id: 16, name: "波波", english: "Pidgey", type: ["一般", "飞行"] },
  { id: 17, name: "比比鸟", english: "Pidgeotto", type: ["一般", "飞行"] },
  { id: 18, name: "大比鸟", english: "Pidgeot", type: ["一般", "飞行"] },
  { id: 19, name: "小拉达", english: "Rattata", type: ["一般"] },
  { id: 20, name: "拉达", english: "Raticate", type: ["一般"] }
];

// 快速搜索函数
export const searchFirst20Pokemon = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return first20Pokemon.filter(pokemon => 
    pokemon.name.toLowerCase().includes(lowerQuery) || 
    pokemon.english.toLowerCase().includes(lowerQuery) || 
    pokemon.id.toString() === query
  );
};

// 根据ID获取宝可梦
export const getPokemonById = (id: number) => {
  return first20Pokemon.find(pokemon => pokemon.id === id);
};

// 根据名称获取宝可梦
export const getPokemonByName = (name: string) => {
  const lowerName = name.toLowerCase();
  return first20Pokemon.find(pokemon => 
    pokemon.name.toLowerCase() === lowerName || 
    pokemon.english.toLowerCase() === lowerName
  );
};
