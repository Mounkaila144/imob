'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminUsers } from '@/hooks/useAdminUsers';
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
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  Eye,
  Settings,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Mock data temporaire
const mockUsers = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    role: 'client',
    status: 'active',
    phone: '+33 1 23 45 67 89',
    created_at: '2024-01-15',
    profile: {
      company: null,
      about: null
    },
    stats: {
      listings_count: 0,
      inquiries_count: 2,
      deals_count: 0
    }
  },
  {
    id: 2,
    name: 'Marie Martin',
    email: 'marie.martin@example.com',
    role: 'lister',
    status: 'active',
    phone: '+33 1 23 45 67 90',
    created_at: '2024-01-10',
    profile: {
      company: 'Agence Martin Immobilier',
      about: 'Agent immobilier expérimenté'
    },
    stats: {
      listings_count: 12,
      inquiries_count: 5,
      deals_count: 3
    }
  },
  {
    id: 3,
    name: 'Pierre Durand',
    email: 'pierre.durand@example.com',
    role: 'client',
    status: 'pending',
    phone: '+33 1 23 45 67 91',
    created_at: '2024-01-20',
    profile: {
      company: null,
      about: null
    },
    stats: {
      listings_count: 0,
      inquiries_count: 1,
      deals_count: 0
    }
  },
  {
    id: 4,
    name: 'Sophie Bernard',
    email: 'sophie.bernard@example.com',
    role: 'lister',
    status: 'active',
    phone: '+33 1 23 45 67 92',
    created_at: '2024-01-12',
    profile: {
      company: 'Agence Sophie B.',
      about: 'Spécialiste en vente de propriétés'
    },
    stats: {
      listings_count: 8,
      inquiries_count: 3,
      deals_count: 2
    }
  },
  {
    id: 5,
    name: 'Admin Test',
    email: 'admin@test.com',
    role: 'admin',
    status: 'active',
    phone: '+33 1 23 45 67 93',
    created_at: '2024-01-01',
    profile: {
      company: null,
      about: 'Compte administrateur'
    },
    stats: {
      listings_count: 0,
      inquiries_count: 0,
      deals_count: 0
    }
  },
];

export default function SimpleAdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'status' | 'role' | 'delete'>('status');
  const [newStatus, setNewStatus] = useState('');
  const [newRole, setNewRole] = useState('');
  const { toast } = useToast();

  const {
    users: usersData,
    statistics: apiStatistics,
    loading,
    error,
    fetchUsers,
    fetchStatistics,
    updateUserStatus,
    updateUserRole,
    deleteUser
  } = useAdminUsers();

  // Utiliser les données de l'API ou fallback vers mock
  const users = usersData?.data || mockUsers;

  // Fallback vers les statistiques mockées si pas encore chargées depuis l'API
  const finalStatistics = apiStatistics || {
    total_users: users.length,
    by_role: {
      admin: users.filter(u => u.role === 'admin').length,
      lister: users.filter(u => u.role === 'lister').length,
      client: users.filter(u => u.role === 'client').length,
    },
    by_status: {
      active: users.filter(u => u.status === 'active').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      pending: users.filter(u => u.status === 'pending').length,
    },
    recent_registrations: users.filter(u => {
      const createdDate = new Date(u.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    }).length,
  };

  // Le filtrage se fait maintenant côté API, plus besoin de filtrer localement
  const filteredUsers = users;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'lister': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserAction = (action: string, userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setSelectedUser(user);

    if (action === 'view') {
      setShowDetailsModal(true);
    } else if (action === 'manage') {
      setActionType('status');
      setNewStatus(user.status);
      setNewRole(user.role);
      setShowActionModal(true);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser || !newStatus) return;

    try {
      if (isUsingMockData) {
        // Simulation pour la démo
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: 'Statut mis à jour (Simulation)',
          description: `Le statut de ${selectedUser.name} a été changé en ${newStatus === 'active' ? 'Actif' : newStatus === 'suspended' ? 'Suspendu' : 'En attente'} (données de démonstration)`,
        });
      } else {
        await updateUserStatus(selectedUser.id, newStatus);
        toast({
          title: 'Statut mis à jour (API)',
          description: `Le statut de ${selectedUser.name} a été changé en ${newStatus === 'active' ? 'Actif' : newStatus === 'suspended' ? 'Suspendu' : 'En attente'}`,
        });
        await fetchStatistics(); // Rafraîchir les statistiques
      }

      setShowActionModal(false);
    } catch (error) {
      toast({
        title: 'Erreur API',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      if (isUsingMockData) {
        // Simulation pour la démo
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: 'Rôle mis à jour (Simulation)',
          description: `Le rôle de ${selectedUser.name} a été changé en ${newRole === 'lister' ? 'Agent' : newRole === 'client' ? 'Client' : 'Admin'} (données de démonstration)`,
        });
      } else {
        await updateUserRole(selectedUser.id, newRole);
        toast({
          title: 'Rôle mis à jour (API)',
          description: `Le rôle de ${selectedUser.name} a été changé en ${newRole === 'lister' ? 'Agent' : newRole === 'client' ? 'Client' : 'Admin'}`,
        });
        await fetchStatistics(); // Rafraîchir les statistiques
      }

      setShowActionModal(false);
    } catch (error) {
      toast({
        title: 'Erreur API',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour le rôle',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      if (isUsingMockData) {
        // Simulation pour la démo
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: 'Utilisateur supprimé (Simulation)',
          description: `${selectedUser.name} a été supprimé avec succès (données de démonstration)`,
        });
      } else {
        await deleteUser(selectedUser.id);
        toast({
          title: 'Utilisateur supprimé (API)',
          description: `${selectedUser.name} a été supprimé avec succès`,
        });
        await fetchStatistics(); // Rafraîchir les statistiques
      }

      setShowActionModal(false);
    } catch (error) {
      toast({
        title: 'Erreur API',
        description: error instanceof Error ? error.message : 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchUsers({ search: searchTerm, role: roleFilter, status: statusFilter });
      await fetchStatistics();
      toast({
        title: 'Données actualisées',
        description: 'La liste des utilisateurs a été rafraîchie',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'actualiser les données',
        variant: 'destructive',
      });
    }
  };

  // Appliquer les filtres via l'API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers({
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, statusFilter]);

  // Vérifier si on utilise des données mock à cause d'un utilisateur inactif
  const isUsingMockData = !usersData && !loading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Gestion des Utilisateurs</h1>
            <p className="mt-2 text-gray-400">
              Gérez tous les utilisateurs de la plateforme
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Banner d'information pour les données mock */}
      {isUsingMockData && (
        <div className="mb-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-blue-400 font-medium">Mode Démonstration</span>
          </div>
          <p className="text-gray-300 mt-2">
            L'interface utilise des données de démonstration car l'utilisateur actuel n'a pas encore été activé par un administrateur.
            <br />
            <strong>Les actions (modification statut/rôle, suppression) sont fonctionnelles mais utilisent des simulations.</strong>
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            Pour tester avec de vraies données API : Activez l'utilisateur "admin@test.com" (ID: 5) en base de données en changeant status="pending" vers status="active".
          </p>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-100">
                {finalStatistics.total_users}
              </div>
              <div className="ml-2 text-sm text-gray-400">
                Total utilisateurs
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-400">
                {finalStatistics.by_role.lister}
              </div>
              <div className="ml-2 text-sm text-gray-400">
                Agents
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-400">
                {finalStatistics.by_role.client}
              </div>
              <div className="ml-2 text-sm text-gray-400">
                Clients
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-yellow-400">
                {finalStatistics.by_status.pending}
              </div>
              <div className="ml-2 text-sm text-gray-400">
                En attente
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Filtres et Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email, téléphone ou entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="lister">Agent</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-100">Liste des Utilisateurs</CardTitle>
              <CardDescription className="text-gray-400">
                {filteredUsers.length} utilisateur(s) trouvé(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Utilisateur</TableHead>
                <TableHead className="text-gray-300">Rôle</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Téléphone</TableHead>
                <TableHead className="text-gray-300">Entreprise</TableHead>
                <TableHead className="text-gray-300">Annonces</TableHead>
                <TableHead className="text-gray-300">Date d'inscription</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700">
                  <TableCell>
                    <div className="cursor-pointer">
                      <div className="font-medium text-gray-100 hover:text-blue-400">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getRoleColor(user.role)}>
                      {user.role === 'lister' ? 'Agent' : user.role === 'client' ? 'Client' : 'Admin'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(user.status)}>
                      {user.status === 'active' ? 'Actif' :
                       user.status === 'pending' ? 'En attente' : 'Suspendu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{user.phone || '-'}</TableCell>
                  <TableCell className="text-gray-300">{user.profile.company || '-'}</TableCell>
                  <TableCell className="text-gray-300">
                    <div className="text-center">
                      <span className="font-medium">{user.stats.listings_count}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{new Date(user.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUserAction('view', user.id)}
                        title="Voir les détails"
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUserAction('manage', user.id)}
                        title="Gérer l'utilisateur"
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionType('delete');
                          setShowActionModal(true);
                        }}
                        title="Supprimer l'utilisateur"
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Détails Utilisateur */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">
              Détails de l'utilisateur
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Informations complètes sur l'utilisateur sélectionné
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Nom complet</Label>
                  <p className="text-gray-100 font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <p className="text-gray-100">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Téléphone</Label>
                  <p className="text-gray-100">{selectedUser.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Rôle</Label>
                  <Badge variant="secondary" className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role === 'lister' ? 'Agent' : selectedUser.role === 'client' ? 'Client' : 'Admin'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-300">Statut</Label>
                  <Badge variant="secondary" className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status === 'active' ? 'Actif' :
                     selectedUser.status === 'pending' ? 'En attente' : 'Suspendu'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-300">Date d'inscription</Label>
                  <p className="text-gray-100">{new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {selectedUser.profile.company && (
                <div>
                  <Label className="text-gray-300">Entreprise</Label>
                  <p className="text-gray-100">{selectedUser.profile.company}</p>
                </div>
              )}

              {selectedUser.profile.about && (
                <div>
                  <Label className="text-gray-300">À propos</Label>
                  <p className="text-gray-100">{selectedUser.profile.about}</p>
                </div>
              )}

              <div className="border-t border-gray-700 pt-4">
                <Label className="text-gray-300">Statistiques</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{selectedUser.stats.listings_count}</div>
                    <div className="text-sm text-gray-400">Annonces</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{selectedUser.stats.inquiries_count}</div>
                    <div className="text-sm text-gray-400">Demandes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{selectedUser.stats.deals_count}</div>
                    <div className="text-sm text-gray-400">Transactions</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Actions Utilisateur */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">
              {actionType === 'delete' ? 'Supprimer l\'utilisateur' : 'Gérer l\'utilisateur'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {actionType === 'delete'
                ? 'Cette action est irréversible. L\'utilisateur sera définitivement supprimé.'
                : 'Modifiez le statut ou le rôle de l\'utilisateur'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Utilisateur</Label>
                <p className="text-gray-100 font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
              </div>

              {actionType === 'delete' ? (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-400 font-medium">Attention</span>
                  </div>
                  <p className="text-gray-300 mt-2">
                    Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action supprimera également :
                  </p>
                  <ul className="text-gray-400 mt-2 ml-4 list-disc">
                    <li>Toutes ses annonces ({selectedUser.stats.listings_count})</li>
                    <li>Son historique de transactions ({selectedUser.stats.deals_count})</li>
                    <li>Toutes ses données personnelles</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status" className="text-gray-300">Statut</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="suspended">Suspendu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-gray-300">Rôle</Label>
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="lister">Agent</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)} disabled={loading}>
              Annuler
            </Button>
            {actionType === 'delete' ? (
              <Button variant="destructive" onClick={handleDeleteUser} disabled={loading}>
                {loading ? 'Suppression...' : 'Supprimer'}
              </Button>
            ) : (
              <div className="space-x-2">
                <Button onClick={handleUpdateStatus} disabled={loading || newStatus === selectedUser?.status}>
                  {loading ? 'Mise à jour...' : 'Mettre à jour le statut'}
                </Button>
                <Button onClick={handleUpdateRole} disabled={loading || newRole === selectedUser?.role}>
                  {loading ? 'Mise à jour...' : 'Mettre à jour le rôle'}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}