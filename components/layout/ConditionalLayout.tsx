'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isDashboardRoute = pathname?.startsWith('/dashboard');
  const isAuthRoute = pathname?.startsWith('/auth');

  // Pour les pages admin, on affiche seulement le contenu sans header/footer
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-900">
        {children}
      </div>
    );
  }

  // Pour les pages dashboard (listers), on affiche seulement le contenu sans header/footer
  if (isDashboardRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // Pour les pages d'authentification, layout simplifié
  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // Layout normal pour le reste du site
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}