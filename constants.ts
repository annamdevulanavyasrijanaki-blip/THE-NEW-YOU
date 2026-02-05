
import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Midnight Velvet Evening Gown',
    price: 120,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    reviews: 124,
    reviewsList: [
      { id: 'r1', user: 'Alice M.', rating: 5, comment: 'Absolutely stunning fit! The fabric is heavy and luxurious.', date: '2023-10-12' },
      { id: 'r2', user: 'Sara K.', rating: 4, comment: 'Fabric is lovely, slightly long for my height.', date: '2023-11-05' }
    ],
    purchaseLink: 'https://www.google.com/search?tbm=shop&q=Midnight+Velvet+Evening+Gown',
    description: 'Elegant velvet gown with a high slit and deep neckline.',
    style: 'Glam',
    occasion: 'Party',
    material: 'Velvet',
    shopName: 'Velvet Vogue',
    purchaseType: 'rent',
    sizes: ['S', 'M', 'L']
  },
  {
    id: '2',
    name: 'Champagne Silk Slip Dress',
    price: 285,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
    rating: 4.5,
    reviews: 89,
    reviewsList: [
        { id: 'r3', user: 'Jenna O.', rating: 5, comment: 'Feels like pure luxury on the skin.', date: '2023-09-20' }
    ],
    purchaseLink: 'https://www.google.com/search?tbm=shop&q=Champagne+Silk+Slip+Dress',
    description: 'Luxurious silk slip dress perfect for cocktail parties.',
    style: 'Minimalist',
    occasion: 'Party',
    material: 'Silk',
    shopName: 'Urban Luxe',
    purchaseType: 'buy',
    sizes: ['XS', 'S', 'M']
  },
  {
    id: '3',
    name: 'Diamond Drop Earrings',
    price: 250,
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 56,
    reviewsList: [],
    purchaseLink: 'https://www.google.com/search?tbm=shop&q=Diamond+Drop+Earrings',
    description: 'Sparkling diamond drop earrings to elevate any look.',
    style: 'Glam',
    occasion: 'Wedding',
    material: 'Diamond',
    shopName: 'Gemstone Gallery',
    purchaseType: 'buy',
    sizes: ['One Size']
  },
  {
    id: '4',
    name: 'Structured Beige Blazer',
    price: 45,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
    rating: 4.6,
    reviews: 210,
    reviewsList: [],
    purchaseLink: 'https://www.google.com/search?tbm=shop&q=Structured+Beige+Blazer+Mango',
    description: 'Classic structured blazer for a sharp, professional silhouette.',
    style: 'Formal',
    occasion: 'Work',
    material: 'Blend',
    shopName: 'Mango',
    purchaseType: 'rent',
    sizes: ['M', 'L', 'XL']
  },
  {
    id: '5',
    name: 'Strappy Gold Heels',
    price: 95,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    reviews: 150,
    reviewsList: [],
    purchaseLink: 'https://www.google.com/search?tbm=shop&q=Strappy+Gold+Heels',
    description: 'Elegant gold heels that go with everything.',
    style: 'Glam',
    occasion: 'Party',
    material: 'Leather',
    shopName: 'Step Up',
    purchaseType: 'buy',
    sizes: ['6', '7', '8', '9']
  },
  {
    id: '6',
    name: 'Pearl Choker Necklace',
    price: 60,
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=800&auto=format&fit=crop',
    rating: 4.4,
    reviews: 34,
    reviewsList: [],
    purchaseLink: 'https://www.google.com/search?tbm=shop&q=Pearl+Choker+Necklace',
    description: 'Vintage-inspired pearl choker.',
    style: 'Vintage',
    occasion: 'Casual',
    material: 'Pearl',
    shopName: 'Vintage Vault',
    purchaseType: 'buy',
    sizes: ['One Size']
  },
  {
    id: '7',
    name: 'Classic Leather Belt',
    price: 45,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=800&auto=format&fit=crop',
    rating: 4.3,
    reviews: 22,
    reviewsList: [],
    purchaseLink: 'https://www.amazon.in/s?k=Classic+Leather+Belt',
    description: 'Timeless leather belt to cinch the waist.',
    style: 'Minimalist',
    occasion: 'Casual',
    material: 'Leather',
    shopName: 'Leather Co.',
    purchaseType: 'buy',
    sizes: ['S', 'M', 'L']
  },
];

export const INITIAL_USER_PROFILE = {
  name: 'Sophia Laurent',
  email: 'sophia.l@example.com',
  measurements: {
    height: '5\'7"',
    bust: '34"',
    waist: '26"',
    hips: '36"',
  },
};

export const CLOSET_FOLDERS = ['All', 'Favorites', 'Date Night', 'Office Chic', 'Vacation'];
