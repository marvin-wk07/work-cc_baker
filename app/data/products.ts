export interface ProductVariant {
  label: string   // e.g. "9顆", "12顆", "單顆", "整條"
  price: number
}

export interface ProductAddon {
  label: string   // e.g. "紅豆", "芋頭", "芝麻"
  price: number   // additional cost
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  bgColor: string
  icon: string
  variants?: ProductVariant[]
  addons?: ProductAddon[]
  minQty?: number      // minimum quantity per order (default 1)
  maxQty?: number      // maximum quantity per order (undefined = unlimited)
  capacity?: number    // 製作能量，用於估算每日產能（預設 1）
}

export const categories = [
  '全部', '歐式麵包', '餐包', '老麵系列', '吐司', '手撕麵包', '包子饅頭', '特色',
]

// Shown only when Firestore has no products yet
export const defaultProducts: Product[] = [
  {
    id: 'default-1',
    name: '經典可頌',
    description: '手工折疊32層，純正法式奶油，酥脆層次分明，入口即化',
    price: 65,
    category: '特色',
    bgColor: '#FEF9C3',
    icon: '🥐',
  },
  {
    id: 'default-2',
    name: '生吐司',
    description: '使用北海道牛奶及淡忌廉製作，入口即化，奶味十足',
    price: 130,
    category: '吐司',
    bgColor: '#FFF7ED',
    icon: '🍞',
  },
  {
    id: 'default-3',
    name: '肉桂捲',
    description: '鬆軟麵團配上肉桂糖餡，出爐後淋上香草奶油糖霜',
    price: 95,
    category: '特色',
    bgColor: '#FEF3C7',
    icon: '🍥',
  },
]

// Full seed data from physical menu (2026/03/10)
export const seedProducts: Omit<Product, 'id'>[] = [
  // ── 歐式麵包 鮮奶系列 ──
  { name: '藍莓乳酪丁', description: '鮮奶歐式麵包，藍莓與乳酪丁內餡，外皮酥脆，每顆', price: 235, category: '歐式麵包', bgColor: '#EDE9FE', icon: '🍞' },
  { name: '草莓/藍莓歐包', description: '鮮奶歐式麵包，草莓或藍莓口味，外酥內軟，每顆', price: 200, category: '歐式麵包', bgColor: '#FFF1F2', icon: '🍞' },
  { name: '雜糧穀物歐包', description: '鮮奶歐式麵包，加入多種穀物，健康飽腹，每顆', price: 195, category: '歐式麵包', bgColor: '#FEF3C7', icon: '🍞' },
  { name: '乳酪丁歐包', description: '鮮奶歐式麵包，豐富乳酪丁內餡，鹹香濃郁，每顆', price: 185, category: '歐式麵包', bgColor: '#FFF7ED', icon: '🍞' },
  { name: '黑芝麻歐包', description: '鮮奶歐式麵包，黑芝麻口味，香氣十足，每顆', price: 155, category: '歐式麵包', bgColor: '#F5F5F4', icon: '🍞' },
  // ── 歐式麵包 米麵T65 ──
  { name: 'T65米麵 原味', description: '米麵T65歐式麵包，原味，口感Q彈有嚼勁，每顆', price: 110, category: '歐式麵包', bgColor: '#FEF3C7', icon: '🍞' },
  { name: 'T65米麵 黑芝麻', description: '米麵T65歐式麵包，黑芝麻粒，香氣濃郁，每顆', price: 125, category: '歐式麵包', bgColor: '#F5F5F4', icon: '🍞' },
  { name: 'T65米麵 核桃', description: '米麵T65歐式麵包，核桃，堅果香氣豐富，每顆', price: 150, category: '歐式麵包', bgColor: '#FEF3C7', icon: '🍞' },
  // ── 歐式麵包 裸麥 ──
  { name: '裸麥歐包 原味', description: '裸麥歐式麵包，風味獨特，高纖健康，每顆', price: 120, category: '歐式麵包', bgColor: '#E7E5E4', icon: '🫓' },
  // ── 歐式麵包 斯佩爾特 ──
  { name: '斯佩爾特 T65原味', description: '斯佩爾特半麵，T65原味，口感紮實，每顆', price: 155, category: '歐式麵包', bgColor: '#FEF3C7', icon: '🫓' },
  { name: '斯佩爾特 山茶花', description: '斯佩爾特半麵，山茶花口味，口感較柔軟，每顆', price: 150, category: '歐式麵包', bgColor: '#FFF1F2', icon: '🫓' },
  // ── 餐包 米湯種 ──
  { name: '米湯種 原味餐包', description: '米湯種製法，原味軟餐包，鬆軟可口，每顆', price: 15, category: '餐包', bgColor: '#FFF7ED', icon: '🍞' },
  { name: '米湯種 紅豆/芋泥', description: '米湯種製法，紅豆或芋泥內餡，甜而不膩，每顆', price: 20, category: '餐包', bgColor: '#FFF1F2', icon: '🍞' },
  { name: '米湯種 帕瑪森', description: '米湯種製法，帕瑪森起司，鹹香美味，每顆', price: 18, category: '餐包', bgColor: '#FEF3C7', icon: '🍞' },
  { name: '米湯種 乳酪丁', description: '米湯種製法，乳酪丁內餡，奶香十足，每顆', price: 25, category: '餐包', bgColor: '#FFF7ED', icon: '🍞' },
  // ── 餐包 波蘭種 ──
  { name: '波蘭種 原味餐包', description: '波蘭種製法，原味軟餐包，外皮薄脆，每顆', price: 15, category: '餐包', bgColor: '#FEFCE8', icon: '🍞' },
  { name: '波蘭種 帕瑪森', description: '波蘭種製法，帕瑪森起司風味，每顆', price: 18, category: '餐包', bgColor: '#FEF3C7', icon: '🍞' },
  { name: '波蘭種 帕瑪森乳酪丁', description: '波蘭種製法，帕瑪森與乳酪丁雙重起司，每顆', price: 25, category: '餐包', bgColor: '#FFF7ED', icon: '🍞' },
  // ── 老麵系列 ──
  { name: '鹽奶油奇亞籽', description: '鮮奶老麵，鹽奶油奇亞籽口味，外皮酥脆香氣十足', price: 20, category: '老麵系列', bgColor: '#FEF3C7', icon: '🍞',
    variants: [{ label: '單顆', price: 20 }, { label: '整條', price: 80 }] },
  { name: '草莓乾乳酪丁', description: '鮮奶老麵，草莓乾配乳酪丁，酸甜鹹香交織', price: 25, category: '老麵系列', bgColor: '#FFF1F2', icon: '🍞',
    variants: [{ label: '單顆', price: 25 }, { label: '整條', price: 100 }] },
  // ── 吐司 ──
  { name: '波蘭種大餐包', description: '波蘭種製法大餐包，鬆軟有嚼勁，每個', price: 15, category: '吐司', bgColor: '#FEFCE8', icon: '🍞' },
  { name: '起司小吐司', description: '起司風味小吐司，每條', price: 75, category: '吐司', bgColor: '#FEF9C3', icon: '🍞' },
  { name: '生吐司', description: '北海道牛奶製作，入口即化，奶味濃郁，每條', price: 130, category: '吐司', bgColor: '#FFF7ED', icon: '🍞' },
  { name: '南瓜吐司', description: '南瓜泥製作，色澤金黃，口感鬆軟，每條', price: 130, category: '吐司', bgColor: '#FEF3C7', icon: '🍞' },
  // ── 特色/其他 ──
  { name: '澳洲香蕉蛋糕', description: '澳洲風味香蕉蛋糕，香甜濕潤，每條', price: 120, category: '特色', bgColor: '#FEFCE8', icon: '🧁' },
  { name: '鹽奶油帕瑪森麵包', description: '鹽奶油搭配帕瑪森起司，每份5個', price: 110, category: '特色', bgColor: '#FEF3C7', icon: '🍞' },
  { name: '芋泥/紅豆/乳酪丁麵包', description: '多種口味選擇：芋泥、紅豆或乳酪丁，每個', price: 20, category: '特色', bgColor: '#F5F0FF', icon: '🍞' },
  { name: '芋泥肉鬆麵包', description: '芋泥搭配肉鬆，鹹甜雙重享受，每份7個', price: 154, category: '特色', bgColor: '#F5F0FF', icon: '🍞' },
  { name: '草莓乾紅豆麵包', description: '草莓乾配紅豆餡，酸甜交織，每份7個', price: 175, category: '特色', bgColor: '#FFF1F2', icon: '🍞' },
  { name: '全麥小麵包', description: '全麥製作，健康美味，適合分享，每份24個', price: 200, category: '特色', bgColor: '#FEF3C7', icon: '🍞' },
  { name: '全麥蔓莓堅果捲', description: '全麥花捲，加入蔓莓與堅果，每顆', price: 16, category: '特色', bgColor: '#FFF1F2', icon: '🍞' },
  { name: '柿子頭 原味微甜', description: '台式柿子頭造型麵包，原味微甜，每顆', price: 11, category: '特色', bgColor: '#FFF7ED', icon: '🍞' },
  { name: '柿子頭 全麥黑芝麻', description: '全麥黑芝麻柿子頭，健康美味，每顆', price: 13, category: '特色', bgColor: '#F5F5F4', icon: '🍞' },
  // ── 手撕麵包 ──
  { name: '草莓乾手撕麵包', description: '草莓乾口味，柔軟拉絲，適合分享', price: 180, category: '手撕麵包', bgColor: '#FFF1F2', icon: '🍞',
    variants: [{ label: '9顆', price: 180 }, { label: '12顆', price: 240 }] },
  { name: '橘子皮核桃手撕', description: '橘子皮核桃口味，香氣迷人', price: 160, category: '手撕麵包', bgColor: '#FEF3C7', icon: '🍞',
    variants: [{ label: '9顆', price: 160 }, { label: '12顆', price: 210 }] },
  { name: '紅豆/黑芝麻手撕', description: '多口味：紅豆、黑芝麻、芋泥或蔓果', price: 120, category: '手撕麵包', bgColor: '#FFF1F2', icon: '🍞',
    variants: [{ label: '9顆', price: 120 }, { label: '12顆', price: 160 }] },
  // ── 包子饅頭 ──
  { name: '白饅頭', description: '傳統白饅頭，鬆軟Q彈，每顆', price: 10, category: '包子饅頭', bgColor: '#F5F5F4', icon: '🥟',
    addons: [{ label: '紅豆', price: 10 }, { label: '芋頭', price: 10 }, { label: '芝麻', price: 10 }] },
  { name: '全麥饅頭', description: '全麥製作，高纖健康，每顆', price: 10, category: '包子饅頭', bgColor: '#E7E5E4', icon: '🥟',
    addons: [{ label: '紅豆', price: 10 }, { label: '芋頭', price: 10 }, { label: '芝麻', price: 10 }] },
  { name: '黑芝麻饅頭', description: '黑芝麻風味，香氣濃郁，每顆', price: 15, category: '包子饅頭', bgColor: '#F5F5F4', icon: '🥟',
    addons: [{ label: '紅豆', price: 10 }, { label: '芋頭', price: 10 }, { label: '芝麻', price: 10 }] },
  { name: '黑米米饅頭', description: '黑米製作，色澤深紫，每顆', price: 15, category: '包子饅頭', bgColor: '#F5F5F4', icon: '🥟',
    addons: [{ label: '紅豆', price: 10 }, { label: '芋頭', price: 10 }, { label: '芝麻', price: 10 }] },
  { name: '糙米黑米米饅頭', description: '糙米與黑米結合，雙重穀物，每顆', price: 15, category: '包子饅頭', bgColor: '#E7E5E4', icon: '🥟',
    addons: [{ label: '紅豆', price: 10 }, { label: '芋頭', price: 10 }, { label: '芝麻', price: 10 }] },
]
