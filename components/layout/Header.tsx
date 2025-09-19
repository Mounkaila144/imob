'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
// import { useActiveRoute } from '@/hooks/useActiveRoute';
// import { QuickActions, PageContext } from '@/components/layout/QuickActions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  Home,
  Heart,
  User,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Menu,
  X,
  Building,
  Search,
  MapPin,
  Briefcase
} from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced active link detection
  const isActiveLink = (href: string) => {
    if (typeof window === 'undefined') return false;
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentUrl = currentPath + currentSearch;

    // Page d'accueil exacte
    if (href === '/' && currentPath === '/' && !currentSearch) {
      return true;
    }

    // Comparaison exacte pour les liens avec paramètres
    if (href.includes('?')) {
      return currentUrl === href;
    }

    // Pour les liens sans paramètres, vérifier si l'URL courante contient les bons paramètres
    if (href === '/' && currentPath === '/') return false; // Éviter que "/" soit actif quand il y a des paramètres

    return currentPath === href;
  };

  // Navigation items with better routing structure
  const navigationItems = [
    {
      href: '/',
      label: 'Annonces',
      icon: Search,
      description: 'Parcourir tous les biens',
      subItems: [
        {
          href: '/',
          label: 'Toutes les annonces',
          description: 'Voir tous les biens disponibles'
        },
        {
          href: '/?type=sale',
          label: 'À vendre',
          description: 'Biens en vente'
        },
        {
          href: '/?type=rent',
          label: 'À louer',
          description: 'Biens en location'
        }
      ]
    },
    {
      href: '/?type=sale',
      label: 'Acheter',
      icon: Home,
      description: 'Biens à vendre',
      subItems: [
        {
          href: '/?type=sale&property_type=house',
          label: 'Maisons',
          description: 'Maisons à vendre'
        },
        {
          href: '/?type=sale&property_type=apartment',
          label: 'Appartements',
          description: 'Appartements à vendre'
        },
        {
          href: '/?type=sale&property_type=office',
          label: 'Bureaux',
          description: 'Espaces professionnels'
        },
        {
          href: '/?type=sale&property_type=land',
          label: 'Terrains',
          description: 'Terrains à bâtir'
        }
      ]
    },
    {
      href: '/?type=rent',
      label: 'Louer',
      icon: Building,
      description: 'Biens à louer',
      subItems: [
        {
          href: '/?type=rent&property_type=house',
          label: 'Maisons',
          description: 'Maisons à louer'
        },
        {
          href: '/?type=rent&property_type=apartment',
          label: 'Appartements',
          description: 'Appartements à louer'
        },
        {
          href: '/?type=rent&property_type=office',
          label: 'Bureaux',
          description: 'Bureaux à louer'
        }
      ]
    },
    {
      href: '/services',
      label: 'Services',
      icon: Briefcase,
      description: 'Nos services',
      subItems: [
        {
          href: '/services/estimation',
          label: 'Estimation gratuite',
          description: 'Estimez votre bien'
        },
        {
          href: '/services/conseil',
          label: 'Conseil immobilier',
          description: 'Accompagnement personnalisé'
        },
        {
          href: '/services/financement',
          label: 'Aide au financement',
          description: 'Solutions de crédit'
        }
      ]
    }
  ];



  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
        : 'bg-white/90 backdrop-blur-sm border-b border-gray-200/30'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative logo-glow">
              <div className="absolute inset-0 bg-blue-600 rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
              <div className="relative bg-white p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Guida-Center Logo"
                  width={50}
                  height={50}
                  className="h-6 w-6 object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Guida-Center</span>
              <span className="text-xs text-gray-500 hidden sm:block group-hover:text-blue-500 transition-colors duration-200">Immobilier moderne</span>
            </div>
          </Link>

          {/* Desktop Navigation - Simplified */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.href);

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>

                  {/* Dropdown for items with subItems */}
                  {item.subItems && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-2">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="font-medium text-sm text-gray-900">
                              {subItem.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {subItem.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* <QuickActions />
            <PageContext /> */}
            {user ? (
              <>
                {/* Add Property Button for Sellers */}
                {user.role === 'lister' && (
                  <Button
                    asChild
                    size="sm"
                    className="hidden sm:flex bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Link href="/seller/properties/new" className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Nouvelle annonce</span>
                    </Link>
                  </Button>
                )}

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-blue-200 transition-all duration-200">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={(user as any).avatar} alt={user.name || user.email} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={(user as any).avatar} alt={user.name || user.email} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold text-gray-900">{user.name || user.email}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <div className="flex items-center mt-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-600 capitalize">{user.role}</span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-blue-50 transition-colors">
                        <Link href="/admin" className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Dashboard Admin</p>
                            <p className="text-xs text-gray-500">Gérer la plateforme</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {user.role === 'lister' && (
                      <>
                        <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-blue-50 transition-colors">
                          <Link href="/seller" className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Dashboard Vendeur</p>
                              <p className="text-xs text-gray-500">Gérer mes annonces</p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-blue-50 transition-colors sm:hidden">
                          <Link href="/seller/properties/new" className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Plus className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Nouvelle annonce</p>
                              <p className="text-xs text-gray-500">Ajouter un bien</p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {user.role === 'client' && (
                      <>
                        <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-blue-50 transition-colors">
                          <Link href="/buyer" className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Mon compte</p>
                              <p className="text-xs text-gray-500">Profil et préférences</p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-red-50 transition-colors">
                          <Link href="/buyer/favorites" className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <Heart className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">Mes favoris</p>
                              <p className="text-xs text-gray-500">Biens sauvegardés</p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Link href="/profile" className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Settings className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">Paramètres</p>
                          <p className="text-xs text-gray-500">Configuration du compte</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={logout}
                      className="p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Se déconnecter</p>
                          <p className="text-xs text-red-500">Fermer la session</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  <Link href="/auth/login">Se connecter</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href="/auth/register">S'inscrire</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2 hover:bg-gray-100 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <Link href="/" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="bg-white p-2 rounded-lg shadow-lg">
                        <Image
                          src="/logo.png"
                          alt="Guida-Center Logo"
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-lg text-gray-900">Guida-Center</span>
                        <p className="text-xs text-gray-500">Immobilier moderne</p>
                      </div>
                    </Link>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 py-6">
                    <nav className="space-y-3 px-6">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveLink(item.href);

                        return (
                          <div key={item.href} className="space-y-2">
                            {/* Main navigation item */}
                            <Link
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                                isActive
                                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${
                                isActive ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                <Icon className={`h-4 w-4 ${
                                  isActive ? 'text-blue-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.description}</p>
                              </div>
                            </Link>

                            {/* Sub-items */}
                            {item.subItems && (
                              <div className="ml-6 space-y-1">
                                {item.subItems.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block p-2 rounded-md text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  >
                                    <div className="font-medium">{subItem.label}</div>
                                    <div className="text-xs text-gray-500">{subItem.description}</div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </nav>

                    {/* Mobile User Section */}
                    <div className="mt-8 px-6">
                      {user ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={(user as any).avatar} alt={user.name || user.email} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{user.name || user.email}</p>
                              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                          </div>

                          {user.role === 'lister' && (
                            <Button
                              asChild
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Link href="/seller/properties/new" className="flex items-center justify-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Nouvelle annonce</span>
                              </Link>
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => {
                              logout();
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Se déconnecter
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button
                            asChild
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link href="/auth/login">Se connecter</Link>
                          </Button>
                          <Button
                            asChild
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link href="/auth/register">S'inscrire</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}