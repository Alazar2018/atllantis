export interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  rating: number
  reviews: number
  category: string
  isNew: boolean
  isSale: boolean
  description: string
  features?: string[]
  sizes?: string[]
  colors?: string[]
  inStock: boolean
  weight?: string
  dimensions?: string
  material: string
  care?: string
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Premium Leather Business Bag',
    price: 899.99,
    originalPrice: 1200.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
    rating: 4.8,
    reviews: 127,
    category: 'Leather Bags',
    isNew: true,
    isSale: false,
    description: 'High-quality, stylish, and durable bag designed for everyday use',
    features: ['Premium leather construction', 'Multiple compartments', 'Adjustable shoulder strap', 'Professional design'],
    sizes: ['One Size'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    weight: '0.8 kg',
    dimensions: '30 x 25 x 12 cm',
    material: '100% Premium Leather',
    care: 'Clean with leather conditioner, avoid water exposure'
  },
  {
    id: 2,
    name: 'Classic Leather Wallet',
    price: 459.99,
    originalPrice: 650.00,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop&crop=center',
    rating: 4.9,
    reviews: 89,
    category: 'Leather Wallets',
    isNew: false,
    isSale: true,
    description: 'Premium leather wallet with multiple card slots and coin pocket',
    features: ['Multiple card slots', 'Coin pocket', 'RFID protection', 'Premium leather finish'],
    sizes: ['One Size'],
    colors: ['Brown', 'Black'],
    inStock: true,
    weight: '0.2 kg',
    dimensions: '11 x 9 x 2 cm',
    material: 'Premium Leather',
    care: 'Wipe with damp cloth, apply leather conditioner monthly'
  },
  {
    id: 3,
    name: 'Durable Leather Belt',
    price: 349.99,
    originalPrice: 490.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
    rating: 4.7,
    reviews: 156,
    category: 'Leather Belts',
    isNew: false,
    isSale: true,
    description: 'High-quality leather belt designed to last',
    features: ['Premium leather construction', 'Adjustable buckle', 'Durable hardware', 'Classic design'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Black'],
    inStock: true,
    weight: '0.3 kg',
    dimensions: '120 cm length',
    material: 'Premium Leather',
    care: 'Clean with leather cleaner, store in cool dry place'
  },
  {
    id: 4,
    name: 'Professional Leather Apron',
    price: 679.99,
    originalPrice: 850.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
    rating: 4.6,
    reviews: 203,
    category: 'Leather Aprons',
    isNew: false,
    isSale: false,
    description: 'Robust and stylish leather apron, ideal for professionals and artisans',
    features: ['Heavy-duty leather', 'Adjustable straps', 'Multiple pockets', 'Professional fit'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    weight: '0.6 kg',
    dimensions: 'Adjustable length',
    material: 'Premium Leather',
    care: 'Spot clean with mild soap, air dry naturally'
  },
  {
    id: 5,
    name: 'Men\'s Classic Leather Oxfords',
    price: 1299.99,
    originalPrice: 1600.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
    rating: 4.9,
    reviews: 98,
    category: 'Men\'s Leather Shoes',
    isNew: true,
    isSale: false,
    description: 'Combining style and comfort for the modern man',
    features: ['Premium leather upper', 'Cushioned insole', 'Durable construction', 'Classic oxford design'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    weight: '0.8 kg',
    dimensions: 'Standard shoe sizing',
    material: 'Premium Leather upper, TR Soles',
    care: 'Clean with leather cleaner, apply conditioner monthly'
  },
  {
    id: 6,
    name: 'Women\'s Elegant Leather Heels',
    price: 959.99,
    originalPrice: 1300.00,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&crop=center',
    rating: 4.8,
    reviews: 145,
    category: 'Women\'s Leather Shoes',
    isNew: false,
    isSale: true,
    description: 'Elegant and durable shoes for every occasion',
    features: ['Premium leather upper', 'Comfortable heel', 'Cushioned insole', 'Elegant design'],
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    weight: '0.6 kg',
    dimensions: 'Standard shoe sizing',
    material: 'Premium Leather upper, TR Soles',
    care: 'Clean with leather cleaner, store in dust bag'
  },
  {
    id: 7,
    name: 'Kids Comfortable Leather Sneakers',
    price: 499.99,
    originalPrice: 650.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
    rating: 4.7,
    reviews: 167,
    category: 'Kids Leather Shoes',
    isNew: false,
    isSale: false,
    description: 'Comfortable, stylish, and durable shoes designed specifically for children',
    features: ['Soft leather upper', 'Flexible sole', 'Comfortable fit', 'Durable construction'],
    sizes: ['1', '2', '3', '4', '5', '6'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    weight: '0.4 kg',
    dimensions: 'Kids shoe sizing',
    material: 'Premium Leather upper, TR Soles',
    care: 'Clean with mild soap, air dry naturally'
  },
  {
    id: 8,
    name: 'Premium Leather Gloves',
    price: 289.99,
    originalPrice: 400.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
    rating: 4.6,
    reviews: 89,
    category: 'Leather Gloves',
    isNew: false,
    isSale: true,
    description: 'Perfectly crafted gloves that combine functionality with elegance',
    features: ['Premium leather construction', 'Comfortable fit', 'Flexible design', 'Elegant finish'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    weight: '0.2 kg',
    dimensions: 'Standard glove sizing',
    material: 'Premium Leather',
    care: 'Clean with leather cleaner, store in cool place'
  },
  {
    id: 9,
    name: 'Leather Crossbody Bag',
    price: 759.99,
    originalPrice: 950.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
    rating: 4.8,
    reviews: 112,
    category: 'Leather Bags',
    isNew: false,
    isSale: true,
    description: 'Stylish crossbody bag perfect for everyday use',
    features: ['Adjustable crossbody strap', 'Multiple pockets', 'Premium leather', 'Versatile design'],
    sizes: ['One Size'],
    colors: ['Brown', 'Black'],
    inStock: true,
    weight: '0.6 kg',
    dimensions: '25 x 20 x 8 cm',
    material: 'Premium Leather',
    care: 'Spot clean with mild soap, air dry naturally'
  },
  {
    id: 10,
    name: 'Men\'s Casual Leather Loafers',
    price: 899.99,
    originalPrice: 1100.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
    rating: 4.7,
    reviews: 134,
    category: 'Men\'s Leather Shoes',
    isNew: false,
    isSale: false,
    description: 'Casual yet sophisticated loafers for the modern man',
    features: ['Premium leather upper', 'Slip-on design', 'Cushioned insole', 'Versatile style'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    weight: '0.5 kg',
    dimensions: 'Standard shoe sizing',
    material: 'Premium Leather upper, TR Soles',
    care: 'Clean with leather cleaner, polish regularly'
  },
  {
    id: 11,
    name: 'Women\'s Leather Ballet Flats',
    price: 679.99,
    originalPrice: 850.00,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&crop=center',
    rating: 4.6,
    reviews: 78,
    category: 'Women\'s Leather Shoes',
    isNew: false,
    isSale: true,
    description: 'Classic ballet flats with premium leather craftsmanship',
    features: ['Premium leather upper', 'Ballet flat design', 'Comfortable fit', 'Versatile style'],
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    weight: '0.4 kg',
    dimensions: 'Standard shoe sizing',
    material: 'Premium Leather upper, TR Soles',
    care: 'Clean with leather cleaner, store in dust bag'
  },
  {
    id: 12,
    name: 'Kids Leather School Shoes',
    price: 599.99,
    originalPrice: 750.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
    rating: 4.8,
    reviews: 156,
    category: 'Kids Leather Shoes',
    isNew: false,
    isSale: false,
    description: 'Durable and comfortable school shoes for children',
    features: ['Premium leather upper', 'School shoe design', 'Durable construction', 'Comfortable fit'],
    sizes: ['1', '2', '3', '4', '5', '6'],
    colors: ['Brown', 'Black'],
    inStock: true,
    weight: '0.5 kg',
    dimensions: 'Kids shoe sizing',
    material: 'Premium Leather upper, TR Soles',
    care: 'Clean with mild soap, air dry naturally'
  }
]

export const categories = [
  { name: 'All Products', value: 'all', count: products.length },
  { name: 'Leather Bags', value: 'Leather Bags', count: products.filter(p => p.category === 'Leather Bags').length },
  { name: 'Men\'s Leather Shoes', value: 'Men\'s Leather Shoes', count: products.filter(p => p.category === 'Men\'s Leather Shoes').length },
  { name: 'Women\'s Leather Shoes', value: 'Women\'s Leather Shoes', count: products.filter(p => p.category === 'Women\'s Leather Shoes').length },
  { name: 'Kids Leather Shoes', value: 'Kids Leather Shoes', count: products.filter(p => p.category === 'Kids Leather Shoes').length },
  { name: 'Leather Belts', value: 'Leather Belts', count: products.filter(p => p.category === 'Leather Belts').length },
  { name: 'Leather Gloves', value: 'Leather Gloves', count: products.filter(p => p.category === 'Leather Gloves').length },
  { name: 'Leather Aprons', value: 'Leather Aprons', count: products.filter(p => p.category === 'Leather Aprons').length },
  { name: 'Leather Wallets', value: 'Leather Wallets', count: products.filter(p => p.category === 'Leather Wallets').length }
]

export const getProductById = (id: number): Product | undefined => {
  return products.find(product => product.id === id)
}

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products
  return products.filter(product => product.category === category)
}
