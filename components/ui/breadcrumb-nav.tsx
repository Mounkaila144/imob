'use client';

import Link from 'next/link';
import { useActiveRoute } from '@/hooks/useActiveRoute';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  const { pathname, searchParams } = useActiveRoute();

  // Auto-generate breadcrumbs if not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname, searchParams);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={cn('flex items-center space-x-2 text-sm text-gray-600', className)}>
      <Link 
        href="/" 
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href && !item.isActive ? (
            <Link 
              href={item.href}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              item.isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

function generateBreadcrumbs(pathname: string, searchParams: URLSearchParams): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Custom labels for known routes
    const routeLabels: Record<string, string> = {
      'properties': 'Annonces',
      'services': 'Services',
      'estimation': 'Estimation',
      'conseil': 'Conseil',
      'financement': 'Financement',
      'auth': 'Authentification',
      'login': 'Connexion',
      'register': 'Inscription'
    };
    
    if (routeLabels[segment]) {
      label = routeLabels[segment];
    }

    // Add query params context for properties
    if (segment === 'properties' && searchParams.size > 0) {
      const transactionType = searchParams.get('transactionType');
      const type = searchParams.get('type');
      
      if (transactionType === 'sale') {
        label += ' - À vendre';
      } else if (transactionType === 'rent') {
        label += ' - À louer';
      }
      
      if (type) {
        const typeLabels: Record<string, string> = {
          'house': 'Maisons',
          'apartment': 'Appartements',
          'office': 'Bureaux',
          'land': 'Terrains'
        };
        if (typeLabels[type]) {
          label += ` - ${typeLabels[type]}`;
        }
      }
    }

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      isActive: isLast
    });
  });

  return breadcrumbs;
}
