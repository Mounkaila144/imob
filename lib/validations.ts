import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  role: z.enum(['lister', 'client']),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const propertySchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  price: z.number().min(1, 'Le prix doit être supérieur à 0'),
  type: z.enum(['house', 'apartment', 'office', 'land']),
  transactionType: z.enum(['sale', 'rent']),
  surface: z.number().min(1, 'La surface doit être supérieure à 0'),
  rooms: z.number().min(1, 'Le nombre de pièces doit être supérieur à 0'),
  bathrooms: z.number().min(1, 'Le nombre de salles de bain doit être supérieur à 0'),
  bedrooms: z.number().optional(),
  floor: z.number().optional(),
  totalFloors: z.number().optional(),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()).optional(),
  energyRating: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  street: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  zipCode: z.string().min(5, 'Le code postal doit contenir au moins 5 caractères'),
  country: z.string().min(2, 'Le pays doit contenir au moins 2 caractères'),
  features: z.array(z.string()).optional(),
});

export const visitRequestSchema = z.object({
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  proposedSlots: z.array(z.date()).min(1, 'Veuillez sélectionner au moins une date').max(3, 'Maximum 3 dates'),
});

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  type: z.string().optional(),
  transactionType: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  surfaceMin: z.number().optional(),
  surfaceMax: z.number().optional(),
  rooms: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  city: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PropertyFormData = z.infer<typeof propertySchema>;
export type VisitRequestFormData = z.infer<typeof visitRequestSchema>;
export type SearchFiltersFormData = z.infer<typeof searchFiltersSchema>;