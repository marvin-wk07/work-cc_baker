export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  bgColor: string
  icon: string
}

export const products: Product[] = [
  {
    id: '1',
    name: '酸種鄉村麵包',
    description: '天然酸種發酵72小時，外皮酥脆，內裡Q彈有嚼勁，帶有淡淡的酸香',
    price: 280,
    category: '歐式麵包',
    bgColor: '#FEF3C7',
    icon: '🍞',
  },
  {
    id: '2',
    name: '黑麥雜糧麵包',
    description: '富含纖維的黑麥加上葵花籽、南瓜籽等多種雜糧，健康又飽腹',
    price: 240,
    category: '歐式麵包',
    bgColor: '#E7E5E4',
    icon: '🫓',
  },
  {
    id: '3',
    name: '經典可頌',
    description: '手工折疊32層，純正法式奶油，酥脆層次分明，入口即化',
    price: 65,
    category: '法式糕點',
    bgColor: '#FEF9C3',
    icon: '🥐',
  },
  {
    id: '4',
    name: '杏仁可頌',
    description: '填入自製杏仁奶油餡，表面撒上烤杏仁片，香甜馥郁',
    price: 85,
    category: '法式糕點',
    bgColor: '#FEF3C7',
    icon: '🥐',
  },
  {
    id: '5',
    name: '朱古力可頌',
    description: '包裹比利時70%黑巧克力棒，苦甜平衡，巧克力控必試',
    price: 75,
    category: '法式糕點',
    bgColor: '#F5F5F4',
    icon: '🥐',
  },
  {
    id: '6',
    name: '生吐司',
    description: '使用北海道牛奶及淡忌廉製作，入口即化，奶味十足，適合直接品嚐',
    price: 180,
    category: '吐司',
    bgColor: '#FFF7ED',
    icon: '🍞',
  },
  {
    id: '7',
    name: '全麥吐司',
    description: '100%石磨全麥麵粉，高纖健康，麥香濃郁，適合日常早餐',
    price: 160,
    category: '吐司',
    bgColor: '#FEF3C7',
    icon: '🍞',
  },
  {
    id: '8',
    name: '蜂蜜吐司',
    description: '加入台灣龍眼蜂蜜，微甜清香，撕開時有蜂蜜絲，小朋友最愛',
    price: 170,
    category: '吐司',
    bgColor: '#FEFCE8',
    icon: '🍞',
  },
  {
    id: '9',
    name: '肉桂捲',
    description: '鬆軟麵團配上肉桂糖餡，出爐後淋上香草奶油糖霜，溫暖香甜',
    price: 95,
    category: '特色麵包',
    bgColor: '#FEF3C7',
    icon: '🍥',
  },
  {
    id: '10',
    name: '迷迭香佛卡夏',
    description: '義式橄欖油佛卡夏，鋪滿新鮮迷迭香與海鹽，鬆軟帶有香草氣息',
    price: 150,
    category: '特色麵包',
    bgColor: '#F0FDF4',
    icon: '🫓',
  },
  {
    id: '11',
    name: '紐約貝果',
    description: '正宗水煮貝果，外Q內韌，原味配奶油起司，適合任何時段享用',
    price: 55,
    category: '特色麵包',
    bgColor: '#FFF7ED',
    icon: '🥯',
  },
  {
    id: '12',
    name: '台式紅豆麵包',
    description: '鬆軟台式麵包包裹自製蜜紅豆餡，甜而不膩，每日新鮮出爐',
    price: 45,
    category: '特色麵包',
    bgColor: '#FFF1F2',
    icon: '🍞',
  },
]

export const categories = ['全部', '歐式麵包', '法式糕點', '吐司', '特色麵包']

export const featuredIds = ['3', '6', '1', '9']
