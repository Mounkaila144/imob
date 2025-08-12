'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useActiveRoute } from '@/hooks/useActiveRoute';
import { 
  Plus, 
  Search, 
  Heart, 
  Calculator,
  TrendingUp,
  Filter
} from 'lucide-react';

export function QuickActions() {
  const { user } = useAuth();
  const { pathname, searchParams } = useActiveRoute();

  // Don't show on auth pages
  if (pathname.startsWith('/auth')) {
    return null;
  }

  // Quick actions based on current page
  const getContextualActions = () => {
    const actions = [];

    // Properties page actions
    if (pathname === '/properties') {
      const hasFilters = searchParams.size > 0;
      
      actions.push({
        href: '/properties',
        label: hasFilters ? 'Réinitialiser' : 'Filtrer',
        icon: hasFilters ? Search : Filter,
        variant: hasFilters ? 'outline' : 'default' as const,
        size: 'sm' as const
      });

      if (user?.role === 'buyer') {
        actions.push({
          href: '/buyer/favorites',
          label: 'Favoris',
          icon: Heart,
          variant: 'outline' as const,
          size: 'sm' as const
        });
      }
    }

    // Services page actions
    if (pathname.startsWith('/services')) {
      actions.push({
        href: '/services/estimation',
        label: 'Estimation',
        icon: Calculator,
        variant: 'outline' as const,
        size: 'sm' as const
      });
    }

    // Home page actions
    if (pathname === '/') {
      actions.push({
        href: '/properties',
        label: 'Parcourir',
        icon: Search,
        variant: 'outline' as const,
        size: 'sm' as const
      });

      if (!user) {
        actions.push({
          href: '/auth/register?role=seller',
          label: 'Vendre',
          icon: TrendingUp,
          variant: 'default' as const,
          size: 'sm' as const
        });
      }
    }

    // Seller specific actions
    if (user?.role === 'seller') {
      actions.push({
        href: '/seller/properties/new',
        label: 'Nouvelle annonce',
        icon: Plus,
        variant: 'default' as const,
        size: 'sm' as const,
        className: 'bg-green-600 hover:bg-green-700'
      });
    }

    return actions;
  };

  const actions = getContextualActions();

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:flex items-center space-x-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            asChild
            variant={action.variant}
            size={action.size}
            className={action.className}
          >
            <Link href={action.href} className="flex items-center space-x-1">
              <Icon className="h-4 w-4" />
              <span>{action.label}</span>
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

// Component for showing current page context
export function PageContext() {
  const { pathname, searchParams } = useActiveRoute();

  const getPageContext = () => {
    if (pathname === '/properties') {
      const transactionType = searchParams.get('transactionType');
      const type = searchParams.get('type');
      const query = searchParams.get('query');

      const contexts = [];

      if (transactionType) {
        contexts.push({
          label: transactionType === 'sale' ? 'À vendre' : 'À louer',
          color: transactionType === 'sale' ? 'blue' : 'green'
        });
      }

      if (type) {
        const typeLabels: Record<string, string> = {
          'house': 'Maisons',
          'apartment': 'Appartements',
          'office': 'Bureaux',
          'land': 'Terrains'
        };
        if (typeLabels[type]) {
          contexts.push({
            label: typeLabels[type],
            color: 'purple'
          });
        }
      }

      if (query) {
        contexts.push({
          label: `"${query}"`,
          color: 'gray'
        });
      }

      return contexts;
    }

    return [];
  };

  const contexts = getPageContext();

  if (contexts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {contexts.map((context, index) => (
        <Badge 
          key={index} 
          variant="outline" 
          className={`text-xs ${
            context.color === 'blue' ? 'border-blue-200 text-blue-700 bg-blue-50' :
            context.color === 'green' ? 'border-green-200 text-green-700 bg-green-50' :
            context.color === 'purple' ? 'border-purple-200 text-purple-700 bg-purple-50' :
            'border-gray-200 text-gray-700 bg-gray-50'
          }`}
        >
          {context.label}
        </Badge>
      ))}
    </div>
  );
}
