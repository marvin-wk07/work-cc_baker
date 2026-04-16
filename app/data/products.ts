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
    id: 'default-1',
    name: '經典可頌',
    description: '手工折疊32層，純正法式奶油，酥脆層次分明，入口即化',
    price: 65,
    category: '法式糕點',
    bgColor: '#FEF9C3',
    icon: '🥐',
  },
  {
    id: 'default-2',
    name: '生吐司',
    description: '使用北海道牛奶及淡忌廉製作，入口即化，奶味十足',
    price: 180,
    category: '吐司',
    bgColor: '#FFF7ED',
    icon: '🍞',
  },
  {
    id: 'default-3',
    name: '肉桂捲',
    description: '鬆軟麵團配上肉桂糖餡，出爐後淋上香草奶油糖霜',
    price: 95,
    category: '特色麵包',
    bgColor: '#FEF3C7',
    icon: '🍥',
  },
]

export const categories = ['全部', '歐式麵包', '法式糕點', '吐司', '特色麵包']
