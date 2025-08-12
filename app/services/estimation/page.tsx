'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, MapPin, Home, TrendingUp } from 'lucide-react';

export default function EstimationPage() {
  const [formData, setFormData] = useState({
    propertyType: '',
    surface: '',
    rooms: '',
    location: '',
    condition: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Estimation request:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Calculator className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Estimation Gratuite
            </h1>
            <p className="text-xl text-blue-100">
              Obtenez une estimation précise de votre bien immobilier en quelques minutes
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Formulaire d'estimation</CardTitle>
                <CardDescription className="text-center">
                  Remplissez les informations ci-dessous pour recevoir votre estimation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Type de bien</Label>
                      <Select value={formData.propertyType} onValueChange={(value) => setFormData({...formData, propertyType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">Maison</SelectItem>
                          <SelectItem value="apartment">Appartement</SelectItem>
                          <SelectItem value="office">Bureau</SelectItem>
                          <SelectItem value="land">Terrain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surface">Surface (m²)</Label>
                      <Input
                        id="surface"
                        type="number"
                        placeholder="Ex: 85"
                        value={formData.surface}
                        onChange={(e) => setFormData({...formData, surface: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rooms">Nombre de pièces</Label>
                      <Select value={formData.rooms} onValueChange={(value) => setFormData({...formData, rooms: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nombre de pièces" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 pièce</SelectItem>
                          <SelectItem value="2">2 pièces</SelectItem>
                          <SelectItem value="3">3 pièces</SelectItem>
                          <SelectItem value="4">4 pièces</SelectItem>
                          <SelectItem value="5">5 pièces et +</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">État du bien</Label>
                      <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="État général" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Bon</SelectItem>
                          <SelectItem value="average">Moyen</SelectItem>
                          <SelectItem value="renovation">À rénover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      placeholder="Ville, code postal ou adresse"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description complémentaire (optionnel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez les spécificités de votre bien (balcon, parking, vue, etc.)"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Calculator className="h-5 w-5 mr-2" />
                    Obtenir mon estimation gratuite
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre estimation ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Précision maximale</h3>
              <p className="text-gray-600">
                Algorithme basé sur les données du marché local et l'expertise de nos agents
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Analyse locale</h3>
              <p className="text-gray-600">
                Prise en compte des spécificités de votre quartier et des tendances du marché
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Home className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Rapport détaillé</h3>
              <p className="text-gray-600">
                Estimation complète avec fourchette de prix et conseils personnalisés
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
