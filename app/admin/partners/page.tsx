'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminPartners } from '@/hooks/useAdminPartners';
import { PartnerResponse } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Edit,
  GripVertical,
  ExternalLink,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Upload,
} from 'lucide-react';

export default function AdminPartnersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    sort_order: 0,
    is_active: true,
  });
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    partners: partnersData,
    loading,
    error,
    fetchPartners,
    createPartner,
    updatePartner,
    deletePartner,
    toggleActive,
  } = useAdminPartners();

  const partners = partnersData?.data || [];

  // Filter partners by search
  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      website_url: '',
      sort_order: partners.length,
      is_active: true,
    });
    setSelectedLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open create modal
  const handleOpenCreate = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, sort_order: partners.length }));
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (partner: PartnerResponse) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      website_url: partner.website_url || '',
      sort_order: partner.sort_order,
      is_active: partner.is_active,
    });
    setLogoPreview(partner.logo_url);
    setSelectedLogo(null);
    setShowEditModal(true);
  };

  // Open delete confirmation
  const handleOpenDelete = (partner: PartnerResponse) => {
    setSelectedPartner(partner);
    setShowDeleteModal(true);
  };

  // Create partner
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du partenaire est requis',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedLogo) {
      toast({
        title: 'Erreur',
        description: 'Le logo du partenaire est requis',
        variant: 'destructive',
      });
      return;
    }

    const result = await createPartner({
      name: formData.name,
      logo: selectedLogo,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
      website_url: formData.website_url || undefined,
    });

    if (result) {
      toast({
        title: 'Partenaire créé',
        description: `${result.name} a été ajouté avec succès`,
      });
      setShowCreateModal(false);
      resetForm();
    }
  };

  // Update partner
  const handleUpdate = async () => {
    if (!selectedPartner) return;

    if (!formData.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du partenaire est requis',
        variant: 'destructive',
      });
      return;
    }

    const result = await updatePartner(selectedPartner.id, {
      name: formData.name,
      logo: selectedLogo || undefined,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
      website_url: formData.website_url || null,
    });

    if (result) {
      toast({
        title: 'Partenaire mis à jour',
        description: `${result.name} a été mis à jour avec succès`,
      });
      setShowEditModal(false);
      resetForm();
    }
  };

  // Delete partner
  const handleDelete = async () => {
    if (!selectedPartner) return;

    const success = await deletePartner(selectedPartner.id);

    if (success) {
      toast({
        title: 'Partenaire supprimé',
        description: `${selectedPartner.name} a été supprimé avec succès`,
      });
      setShowDeleteModal(false);
      setSelectedPartner(null);
    }
  };

  // Toggle active status
  const handleToggleActive = async (partner: PartnerResponse) => {
    const result = await toggleActive(partner.id);
    if (result) {
      toast({
        title: result.is_active ? 'Partenaire activé' : 'Partenaire désactivé',
        description: `${result.name} est maintenant ${result.is_active ? 'visible' : 'masqué'} sur le site`,
      });
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    await fetchPartners();
    toast({
      title: 'Données actualisées',
      description: 'La liste des partenaires a été rafraîchie',
    });
  };

  // Apply search filter with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPartners({ search: searchTerm || undefined });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Partenaires</h1>
            <p className="mt-2 text-gray-600">
              Gérez les logos des partenaires affichés sur la page d'accueil
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un partenaire
            </Button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800 font-medium">Erreur API</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                {partners.length}
              </div>
              <div className="ml-2 text-sm text-gray-600">Total partenaires</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {partners.filter((p) => p.is_active).length}
              </div>
              <div className="ml-2 text-sm text-gray-600">Actifs</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-400">
                {partners.filter((p) => !p.is_active).length}
              </div>
              <div className="ml-2 text-sm text-gray-600">Inactifs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rechercher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un partenaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Partners table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Partenaires</CardTitle>
          <CardDescription>
            {filteredPartners.length} partenaire(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ordre</TableHead>
                <TableHead className="w-24">Logo</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Site web</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'ajout</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-500">Chargement des partenaires...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPartners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      {error ? 'Impossible de charger les partenaires' : 'Aucun partenaire trouvé'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">{partner.sort_order}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="h-12 w-16 object-contain rounded border bg-white"
                        />
                      ) : (
                        <div className="h-12 w-16 bg-gray-100 rounded border flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{partner.name}</span>
                    </TableCell>
                    <TableCell>
                      {partner.website_url ? (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visiter
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          partner.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {partner.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(partner.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(partner)}
                          title={partner.is_active ? 'Désactiver' : 'Activer'}
                          className={
                            partner.is_active
                              ? 'text-yellow-600 hover:text-yellow-700'
                              : 'text-green-600 hover:text-green-700'
                          }
                        >
                          {partner.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(partner)}
                          title="Modifier"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDelete(partner)}
                          title="Supprimer"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un partenaire</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau partenaire qui sera affiché sur la page d'accueil
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du partenaire *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom du partenaire"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo du partenaire *</Label>
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="logo"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {logoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={logoPreview}
                        alt="Aperçu"
                        className="h-20 mx-auto object-contain"
                      />
                      <p className="text-sm text-gray-500">Cliquez pour changer</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Cliquez pour sélectionner un logo
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, WebP ou SVG (max 2MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="website_url">Site web (optionnel)</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sort_order">Ordre d'affichage</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                }
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Actif (visible sur le site)</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le partenaire</DialogTitle>
            <DialogDescription>
              Modifiez les informations du partenaire
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Nom du partenaire *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom du partenaire"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit_logo">Logo du partenaire</Label>
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="edit_logo"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {logoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={logoPreview}
                        alt="Aperçu"
                        className="h-20 mx-auto object-contain"
                      />
                      <p className="text-sm text-gray-500">Cliquez pour changer</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Cliquez pour sélectionner un nouveau logo
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit_website_url">Site web (optionnel)</Label>
              <Input
                id="edit_website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit_sort_order">Ordre d'affichage</Label>
              <Input
                id="edit_sort_order"
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                }
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit_is_active">Actif (visible sur le site)</Label>
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le partenaire</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le partenaire sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>

          {selectedPartner && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-800 font-medium">Attention</span>
                </div>
                <p className="text-red-700 mt-2">
                  Êtes-vous sûr de vouloir supprimer le partenaire "{selectedPartner.name}" ?
                </p>
              </div>

              {selectedPartner.logo_url && (
                <div className="flex justify-center">
                  <img
                    src={selectedPartner.logo_url}
                    alt={selectedPartner.name}
                    className="h-16 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
