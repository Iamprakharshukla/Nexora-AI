export interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  description: string;
  category: string;
  rating: number;
  reviewsCount: number;
  carpetArea?: string;
  carpetAreaSqFt?: number;
  facing?: string;
  completionStatus?: string;
  reraId?: string;
  purpose?: 'BUY' | 'RENT' | 'SELL';
  images?: string[];
  // 99acres-style extended fields
  bhk?: number;
  locality?: string;
  city?: string;
  furnishing?: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  floor?: number;
  totalFloors?: number;
  parking?: number;
  amenities?: string[];
  pricePerSqFt?: number;
  possessionDate?: string;
  constructionAge?: string;
  latitude?: number;
  longitude?: number;
}

export interface JarvisMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Product[];
}

export interface Transaction {
  id: string;
  amount: number;
  location: string;
  timestamp: string;
}

export interface FraudAlert {
  id: string;
  message: string;
  severity: 'MEDIUM' | 'HIGH';
  timestamp: string;
}

export interface LocalityData {
  name: string;
  city: string;
  avgPricePerSqFt: number;
  yoyGrowth: number;
  lifestyleScore: number;
  connectivityScore: number;
  totalListings: number;
  trend: 'RISING' | 'STABLE' | 'COOLING';
}
