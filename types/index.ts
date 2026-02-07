export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'lister' | 'client';
  phone?: string;
  status: string;
  email_verified_at?: string;
  profile: {
    avatar_path?: string;
    company?: string;
    about?: string;
  };
  created_at: string;
  updated_at: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
}

export interface VisitRequest {
  id: string;
  propertyId: string;
  property: Property;
  buyerId: string;
  buyer: User;
  message: string;
  proposedSlots: string[];
  selectedSlot?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  user?: User;
  property?: Property;
}

export interface Partner {
  id: number;
  name: string;
  logo_url: string | null;
  logo_path: string | null;
  sort_order: number;
  is_active: boolean;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerPublic {
  id: number;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}

// Subscription types

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  duration_months: 1 | 6 | 12;
  price: number;
  currency: string;
  is_active: boolean;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface Subscription {
  id: number;
  user_id: number;
  user: User;
  plan: SubscriptionPlan;
  plan_id: number;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatistics {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  expiring_soon: number;
  revenue: number;
}

export interface PaginatedSubscriptions {
  data: Subscription[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

export interface SubscriptionFilters {
  status?: string;
  plan_id?: number;
  search?: string;
  expiring_soon?: boolean;
  per_page?: number;
  sort_by?: string;
  sort_order?: string;
}