'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Gui-Center',
    siteDescription: 'Plateforme immobilière moderne',
    contactEmail: 'contact@Gui-Center.fr',
    supportPhone: '+33 1 23 45 67 89',
    currency: 'EUR',
    language: 'fr',
    timezone: 'Europe/Paris',
    allowRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    maintenanceMode: false,
    maxListingsPerUser: 10,
    commissionRate: 5,
    featuredListingPrice: 29.99,
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres sauvegardés avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      toast.success('Export des données en cours...');
      // Simulate export
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres de la Plateforme</h1>
        <p className="mt-2 text-gray-600">
          Configurez les paramètres généraux de votre plateforme immobilière
        </p>
      </div>

      <div className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
            <CardDescription>
              Configuration de base de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du site</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de contact</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Description du site</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Téléphone support</Label>
                <Input
                  id="supportPhone"
                  value={settings.supportPhone}
                  onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (CFA)</SelectItem>
                    <SelectItem value="USD">Dollar US ($)</SelectItem>
                    <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres utilisateur */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres Utilisateur</CardTitle>
            <CardDescription>
              Configuration des comptes utilisateur et des inscriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autoriser les inscriptions</Label>
                <p className="text-sm text-gray-500">
                  Permettre aux nouveaux utilisateurs de créer un compte
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => handleSettingChange('allowRegistration', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Vérification email obligatoire</Label>
                <p className="text-sm text-gray-500">
                  Exiger la vérification de l'email pour activer le compte
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="maxListings">Nombre max d'annonces par utilisateur</Label>
              <Input
                id="maxListings"
                type="number"
                value={settings.maxListingsPerUser}
                onChange={(e) => handleSettingChange('maxListingsPerUser', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Paramètres business */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres Business</CardTitle>
            <CardDescription>
              Configuration des tarifs et commissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Taux de commission (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.1"
                  value={settings.commissionRate}
                  onChange={(e) => handleSettingChange('commissionRate', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featuredPrice">Prix annonce mise en avant (CFA)</Label>
                <Input
                  id="featuredPrice"
                  type="number"
                  step="0.01"
                  value={settings.featuredListingPrice}
                  onChange={(e) => handleSettingChange('featuredListingPrice', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres système */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres Système</CardTitle>
            <CardDescription>
              Configuration technique et maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications activées</Label>
                <p className="text-sm text-gray-500">
                  Envoyer des notifications par email
                </p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode maintenance</Label>
                <p className="text-sm text-gray-500">
                  Activer le mode maintenance pour les utilisateurs
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>
            {settings.maintenanceMode && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  Le mode maintenance est activé. Seuls les administrateurs peuvent accéder au site.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Actions de maintenance et sauvegarde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Exporter les données
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importer des données
              </Button>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Purger les données
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}