'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calculator, TrendingUp, Shield, CheckCircle } from 'lucide-react';

export default function FinancementPage() {
  const [loanData, setLoanData] = useState({
    amount: '',
    duration: '',
    income: '',
    contribution: ''
  });

  const [simulation, setSimulation] = useState<{
    monthlyPayment: number;
    totalCost: number;
    interestRate: number;
  } | null>(null);

  const handleSimulation = () => {
    const amount = parseFloat(loanData.amount);
    const duration = parseInt(loanData.duration);
    const rate = 0.035; // 3.5% example rate

    if (amount && duration) {
      const monthlyRate = rate / 12;
      const monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -duration * 12));
      const totalCost = monthlyPayment * duration * 12;

      setSimulation({
        monthlyPayment: Math.round(monthlyPayment),
        totalCost: Math.round(totalCost),
        interestRate: rate * 100
      });
    }
  };

  const partners = [
    { name: 'BNP Paribas', rate: '3.2%', logo: '/api/placeholder/120/60' },
    { name: 'Crédit Agricole', rate: '3.4%', logo: '/api/placeholder/120/60' },
    { name: 'Société Générale', rate: '3.3%', logo: '/api/placeholder/120/60' },
    { name: 'LCL', rate: '3.5%', logo: '/api/placeholder/120/60' },
    { name: 'Crédit Mutuel', rate: '3.1%', logo: '/api/placeholder/120/60' },
    { name: 'La Banque Postale', rate: '3.6%', logo: '/api/placeholder/120/60' }
  ];

  const advantages = [
    {
      icon: Calculator,
      title: 'Simulation gratuite',
      description: 'Calculez votre capacité d\'emprunt en quelques clics'
    },
    {
      icon: TrendingUp,
      title: 'Meilleurs taux',
      description: 'Négociation avec nos partenaires bancaires pour obtenir les meilleurs conditions'
    },
    {
      icon: Shield,
      title: 'Accompagnement complet',
      description: 'De la simulation à la signature, nous vous accompagnons à chaque étape'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <CreditCard className="h-16 w-16 mx-auto mb-6 text-purple-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Aide au Financement
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              Trouvez les meilleures solutions de crédit pour votre projet immobilier
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <Calculator className="h-5 w-5 mr-2" />
              Simuler mon prêt
            </Button>
          </div>
        </div>
      </section>

      {/* Simulation Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Simulation Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Simulateur de Prêt</span>
                  </CardTitle>
                  <CardDescription>
                    Calculez votre mensualité et votre capacité d'emprunt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant souhaité (€)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="300000"
                      value={loanData.amount}
                      onChange={(e) => setLoanData({...loanData, amount: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (années)</Label>
                    <Select value={loanData.duration} onValueChange={(value) => setLoanData({...loanData, duration: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir la durée" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 ans</SelectItem>
                        <SelectItem value="20">20 ans</SelectItem>
                        <SelectItem value="25">25 ans</SelectItem>
                        <SelectItem value="30">30 ans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income">Revenus mensuels (€)</Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="4000"
                      value={loanData.income}
                      onChange={(e) => setLoanData({...loanData, income: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contribution">Apport personnel (€)</Label>
                    <Input
                      id="contribution"
                      type="number"
                      placeholder="60000"
                      value={loanData.contribution}
                      onChange={(e) => setLoanData({...loanData, contribution: e.target.value})}
                    />
                  </div>

                  <Button onClick={handleSimulation} className="w-full">
                    Calculer ma mensualité
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Résultats de la Simulation</CardTitle>
                  <CardDescription>
                    Estimation basée sur un taux moyen du marché
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {simulation ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {simulation.monthlyPayment.toLocaleString()} €/mois
                        </div>
                        <div className="text-sm text-gray-600">Mensualité estimée</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-lg">{simulation.interestRate}%</div>
                          <div className="text-sm text-gray-600">Taux d'intérêt</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-lg">
                            {simulation.totalCost.toLocaleString()} €
                          </div>
                          <div className="text-sm text-gray-600">Coût total</div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-3">
                          Cette simulation est indicative. Contactez-nous pour une étude personnalisée.
                        </p>
                        <Button className="w-full">
                          Demander une étude personnalisée
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Remplissez le formulaire pour voir votre simulation</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Partenaires Bancaires
            </h2>
            <p className="text-gray-600">
              Nous négocions pour vous auprès des meilleures banques
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            {partners.map((partner, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="h-12 bg-gray-200 rounded mb-3"></div>
                  <div className="font-medium text-sm mb-1">{partner.name}</div>
                  <Badge variant="outline" className="text-xs">
                    À partir de {partner.rate}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi Passer par Nous ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{advantage.title}</h3>
                  <p className="text-gray-600">{advantage.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Besoin d'un Financement ?
            </h2>
            <p className="text-purple-100 mb-8">
              Nos experts vous accompagnent gratuitement dans votre recherche de financement
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <CreditCard className="h-5 w-5 mr-2" />
              Demander un accompagnement
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
