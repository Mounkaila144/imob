export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'seller' | 'buyer';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'house' | 'apartment' | 'office' | 'land';
  transactionType: 'sale' | 'rent';
  surface: number;
  rooms: number;
  bathrooms: number;
  bedrooms?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  features: string[];
  photos: PropertyPhoto[];
  documents: PropertyDocument[];
  sellerId: string;
  seller: User;
  status: 'draft' | 'active' | 'sold' | 'rented' | 'suspended';
  viewCount: number;
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  alt: string;
  order: number;
  isMain: boolean;
}

export interface PropertyDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
}

export interface VisitRequest {
  id: string;
  propertyId: string;
  property: Property;
  buyerId: string;
  buyer: User;
  message: string;
  proposedSlots: Date[];
  selectedSlot?: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  query?: string;
  type?: string;
  transactionType?: string;
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  features?: string[];
  energyRating?: string[];
  yearBuiltMin?: number;
  yearBuiltMax?: number;
}

export interface DashboardStats {
  totalProperties: number;
  totalUsers: number;
  totalVisitRequests: number;
  monthlyRevenue: number;
  recentActivities: Activity[];
  propertyTypeDistribution: { type: string; count: number }[];
  monthlyStats: { month: string; properties: number; users: number }[];
}

export interface Activity {
  id: string;
  type: 'property_created' | 'visit_requested' | 'user_registered' | 'property_sold';
  description: string;
  createdAt: Date;
  user?: User;
  property?: Property;
}