'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Trash2,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Mail,
  LogIn,
  KeyRound,
  UserX,
  Archive,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SupprimerComptePage() {
  const { user, token, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const handleDeleteAccount = async () => {
    if (!password) {
      setError('Veuillez saisir votre mot de passe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Une erreur est survenue');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        logout();
      }, 3000);
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const deletedData = [
    { label: 'Informations du compte', detail: 'Nom, email, mot de passe, photo de profil', icon: UserX },
    { label: 'Annonces immobilières', detail: 'Toutes vos annonces publiées, brouillons et photos associées', icon: Trash2 },
    { label: 'Abonnements', detail: 'Historique d\'abonnements et plan actuel', icon: Archive },
    { label: 'Favoris et préférences', detail: 'Liste de favoris et préférences de recherche', icon: XCircle },
    { label: 'Demandes de renseignements', detail: 'Messages envoyés et reçus concernant les annonces', icon: Mail },
  ];

  const retainedData = [
    { label: 'Journaux de transactions', detail: 'Conservés 10 ans pour obligations fiscales et légales', duration: '10 ans' },
    { label: 'Journaux d\'activité anonymisés', detail: 'Données statistiques anonymisées pour amélioration du service', duration: '3 ans' },
    { label: 'Données requises par la loi', detail: 'Toute donnée dont la conservation est imposée par la réglementation', duration: 'Variable' },
  ];

  const steps = [
    { step: 1, title: 'Connectez-vous', description: 'Connectez-vous à votre compte Guida-Center avec votre email et mot de passe.', icon: LogIn },
    { step: 2, title: 'Accédez à cette page', description: 'Rendez-vous sur cette page de suppression de compte.', icon: Trash2 },
    { step: 3, title: 'Confirmez votre identité', description: 'Saisissez votre mot de passe pour confirmer que vous êtes bien le propriétaire du compte.', icon: KeyRound },
    { step: 4, title: 'Suppression définitive', description: 'Votre compte et toutes les données associées seront supprimés immédiatement et de façon irréversible.', icon: UserX },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-800 via-red-900 to-slate-950 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
              <Trash2 className="h-10 w-10 text-red-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Suppression de Compte
            </h1>
            <p className="text-xl text-red-200 mb-4">
              Demandez la suppression de votre compte et de vos données
            </p>
            <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
              <Shield className="h-4 w-4 mr-2" />
              Guida-Center - Plateforme Immobilière
            </Badge>
          </div>
        </div>
      </section>

      {/* Warning */}
      <section className="py-12 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-amber-200 bg-white">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Attention : Action irréversible
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      La suppression de votre compte sur <strong>Guida-Center</strong> est <strong>définitive et irréversible</strong>.
                      Une fois votre compte supprimé, toutes vos données personnelles, annonces, photos et historique seront
                      effacés de nos serveurs. Vous ne pourrez plus récupérer ces informations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comment supprimer votre compte
              </h2>
              <p className="text-gray-600 text-lg">
                Suivez ces étapes pour demander la suppression de votre compte
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {steps.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.step} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full flex-shrink-0">
                          <Icon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-2">
                            Étape {item.step}
                          </Badge>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Data Deleted */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                    <Database className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <Badge variant="destructive" className="mb-1">
                      Suppression définitive
                    </Badge>
                    <CardTitle className="text-xl">Données supprimées</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">
                  Les données suivantes seront <strong>définitivement supprimées</strong> de nos serveurs dans un délai de <strong>30 jours</strong> après votre demande :
                </p>
                <ul className="space-y-4">
                  {deletedData.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li key={index} className="flex items-start space-x-4 p-3 bg-red-50 rounded-lg">
                        <Icon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-900">{item.label}</span>
                          <p className="text-sm text-gray-600">{item.detail}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <Archive className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1">
                      Conservation légale
                    </Badge>
                    <CardTitle className="text-xl">Données conservées</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">
                  Conformément à nos obligations légales, certaines données peuvent être conservées après la suppression de votre compte :
                </p>
                <ul className="space-y-4">
                  {retainedData.map((item, index) => (
                    <li key={index} className="flex items-start space-x-4 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-medium text-gray-900">{item.label}</span>
                          <Badge variant="secondary">{item.duration}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Delete Action / Login Prompt */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            {success ? (
              <Card className="border-green-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Compte supprimé avec succès
                  </h2>
                  <p className="text-gray-600">
                    Votre compte et toutes vos données ont été supprimés. Vous allez être redirigé vers la page d&apos;accueil.
                  </p>
                </CardContent>
              </Card>
            ) : user && token ? (
              <Card className="border-red-200">
                <CardHeader className="border-b bg-red-50">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <CardTitle className="text-xl text-red-900">Supprimer mon compte</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Compte connecté :</strong> {user.email}
                    </p>
                  </div>

                  {!showConfirm ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-6">
                        En supprimant votre compte, vous perdrez définitivement l&apos;accès à toutes vos annonces,
                        favoris et données personnelles.
                      </p>
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => setShowConfirm(true)}
                      >
                        <Trash2 className="h-5 w-5 mr-2" />
                        Je souhaite supprimer mon compte
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">
                          Pour confirmer la suppression, veuillez saisir votre mot de passe.
                          Cette action est irréversible.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-gray-700">
                          Mot de passe
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Saisissez votre mot de passe"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                          }}
                          className="mt-1"
                        />
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <span className="text-sm text-red-700">{error}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowConfirm(false);
                            setPassword('');
                            setError('');
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={handleDeleteAccount}
                          disabled={loading || !password}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Suppression...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Confirmer la suppression
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                    <LogIn className="h-8 w-8 text-gray-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Connexion requise
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Pour supprimer votre compte, vous devez d&apos;abord vous connecter à votre compte Guida-Center.
                  </p>
                  <Button
                    asChild
                    size="lg"
                  >
                    <a href="/auth/login">
                      <LogIn className="h-5 w-5 mr-2" />
                      Se connecter
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Contact Alternative */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">
                    Besoin d&apos;aide ?
                  </h2>
                  <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                    Si vous rencontrez des difficultés pour supprimer votre compte ou si vous souhaitez obtenir
                    une copie de vos données avant la suppression, contactez notre équipe support.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                      <Mail className="h-5 w-5" />
                      <span>support@guidacenter.com</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                      <Info className="h-5 w-5" />
                      <span>Délai de réponse : 48h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
            <p>
              Cette page est conforme aux exigences de Google Play Store concernant la suppression des comptes utilisateurs.
              Pour toute question relative à vos données personnelles, consultez notre{' '}
              <a href="/confidentialite" className="text-blue-600 hover:underline">
                politique de confidentialité
              </a>.
            </p>
            <p className="mt-2">
              <strong>Guida Center</strong> - Plateforme Immobilière au Niger - Tous droits réservés &copy; 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
