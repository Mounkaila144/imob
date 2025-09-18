'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// Mock data - à remplacer par de vraies données API
const mockProperties = [
  {
    id: 1,
    title: 'Appartement moderne à Paris',
    type: 'apartment',
    transaction_type: 'sale',
    price: 450000,
    city: 'Paris',
    status: 'active',
    owner: 'Marie Martin',
    created_at: '2024-01-15',
    views: 234,
  },
  {
    id: 2,
    title: 'Maison avec jardin à Lyon',
    type: 'house',
    transaction_type: 'sale',
    price: 320000,
    city: 'Lyon',
    status: 'pending',
    owner: 'Sophie Bernard',
    created_at: '2024-01-18',
    views: 156,
  },
  {
    id: 3,
    title: 'Studio meublé centre-ville',
    type: 'apartment',
    transaction_type: 'rent',
    price: 850,
    city: 'Paris',
    status: 'active',
    owner: 'Marie Martin',
    created_at: '2024-01-20',
    views: 89,
  },
  {
    id: 4,
    title: 'Bureau en open space',
    type: 'office',
    transaction_type: 'rent',
    price: 2500,
    city: 'Paris',
    status: 'draft',
    owner: 'Sophie Bernard',
    created_at: '2024-01-22',
    views: 12,
  },
];

export default function AdminPropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactionFilter, setTransactionFilter] = useState('all');

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesTransaction = transactionFilter === 'all' || property.transaction_type === transactionFilter;

    return matchesSearch && matchesType && matchesStatus && matchesTransaction;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Appartement';
      case 'house': return 'Maison';
      case 'office': return 'Bureau';
      case 'land': return 'Terrain';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rented': return 'bg-purple-100 text-purple-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'draft': return 'Brouillon';
      case 'sold': return 'Vendu';
      case 'rented': return 'Loué';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const formatPrice = (price: number, transactionType: string) => {
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);

    return transactionType === 'rent' ? `${formatted}/mois` : formatted;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Propriétés</h1>
        <p className="mt-2 text-gray-600">
          Gérez toutes les annonces immobilières de la plateforme
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                {mockProperties.length}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                Total propriétés
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {mockProperties.filter(p => p.status === 'active').length}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                Actives
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mockProperties.filter(p => p.status === 'pending').length}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                En attente
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockProperties.reduce((sum, p) => sum + p.views, 0)}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                Vues totales
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres et Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre, ville ou propriétaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="apartment">Appartement</SelectItem>
                <SelectItem value="house">Maison</SelectItem>
                <SelectItem value="office">Bureau</SelectItem>
                <SelectItem value="land">Terrain</SelectItem>
              </SelectContent>
            </Select>
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="sale">Vente</SelectItem>
                <SelectItem value="rent">Location</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des propriétés */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Propriétés</CardTitle>
          <CardDescription>
            {filteredProperties.length} propriété(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propriété</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-sm text-gray-500">{property.city}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTypeLabel(property.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(property.price, property.transaction_type)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.transaction_type === 'sale' ? 'Vente' : 'Location'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(property.status)}>
                      {getStatusLabel(property.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{property.owner}</TableCell>
                  <TableCell>{property.views}</TableCell>
                  <TableCell>{new Date(property.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {property.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}