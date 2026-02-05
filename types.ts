
export enum Screen {
  LANDING = 'LANDING',
  HOME = 'HOME', // Concierge
  STYLIST = 'STYLIST',
  SHOP = 'SHOP',
  CLOSET = 'CLOSET',
  ACCOUNT = 'ACCOUNT',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT',
  FAQ = 'FAQ',
  CONTACT = 'CONTACT',
  PRIVACY = 'PRIVACY',
  BLOG = 'BLOG',
  BRAND_GUIDE = 'BRAND_GUIDE'
}

export type OrderStatus = 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export interface Order {
  id: string;
  date: string;
  items: Product[];
  total: number;
  status: OrderStatus;
  estimatedDelivery: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Dresses' | 'Jewelry' | 'Shoes' | 'Outerwear' | 'Accessories';
  image: string;
  rating: number;
  reviews: number;
  reviewsList?: Review[];
  purchaseLink?: string; 
  description: string;
  shopName: string;
  purchaseType: 'buy' | 'rent';
  sizes: string[];
  isOwnerAdded?: boolean;
  style?: string;
  occasion?: string;
  material?: string;
}

export interface CartItem extends Product {
  selectedSize: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text?: string;
  image?: string;
  type?: 'text' | 'image' | 'try-on-result';
  isTyping?: boolean;
}

export interface SavedLook {
  id: string;
  date: string;
  image: string;
  items: string[];
  folder?: string;
  isFavorite?: boolean;
}

export interface UserPreferences {
  isPrivate: boolean;
  personalizedRecommendations: boolean;
  allowAnalytics: boolean;
  notifications: {
    push: boolean;
    email: boolean;
    styleSuggestions: boolean;
    security: boolean;
  };
  app: {
    darkMode: boolean;
    language: 'English' | 'Hindi' | 'Telugu';
    units: 'cm' | 'inches';
  };
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  photoURL?: string;
  measurements?: {
    height: string;
    bust: string;
    waist: string;
    hips: string;
  };
  preferences?: UserPreferences;
}

export interface BestOutfitSelection {
  selectedIndex: number;
  reasoning: string;
  stylingTips: string;
}

export interface OutfitSuggestion {
  itemName: string;
  description: string;
  category: string;
  searchQuery: string;
  visualDescription?: string;
}
