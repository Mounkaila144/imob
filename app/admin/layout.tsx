'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Home,
  BarChart3,
  Settings,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Handshake
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const navigation = [
    {
      name: 'Tableau de Bord',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Utilisateurs',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'Propriétés',
      href: '/admin/properties',
      icon: Home,
    },
    {
      name: 'Partenaires',
      href: '/admin/partners',
      icon: Handshake,
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-white">Admin Guida-Center</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-700 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-white">Admin Guida-Center</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-gray-800 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs font-medium text-gray-400 group-hover:text-gray-300">
                      Administrateur
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-gray-800 shadow-lg border-b border-gray-700">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              {/* Search peut être ajouté ici */}
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button
                type="button"
                className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-200">{user?.name || user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-900">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}