'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';

export default function ConseilPage() {
  const services = [
    {
      title: 'Accompagnement Vendeur',
      description: 'De l\'estimation à la signature, nous vous accompagnons à chaque étape',
      features: ['Estimation précise', 'Mise en valeur du bien', 'Négociation', 'Suivi juridique'],
      duration: '2-6 mois'
    },
    {
      title: 'Accompagnement Acheteur',
      description: 'Trouvez le bien idéal avec l\'aide de nos experts locaux',
      features: ['Recherche ciblée', 'Visites organisées', 'Négociation prix', 'Aide au financement'],
      duration: '1-4 mois'
    },
    {
      title: 'Conseil en Investissement',
      description: 'Optimisez votre investissement immobilier avec nos conseils',
      features: ['Analyse de rentabilité', 'Fiscalité optimisée', 'Gestion locative', 'Stratégie patrimoniale'],
      duration: 'Sur mesure'
    }
  ];

  const experts = [
    {
      name: 'Marie Dubois',
      role: 'Conseillère Senior',
      speciality: 'Résidentiel Paris',
      experience: '12 ans',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Pierre Martin',
      role: 'Expert Investissement',
      speciality: 'Immobilier locatif',
      experience: '15 ans',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Sophie Laurent',
      role: 'Négociatrice',
      speciality: 'Maisons de prestige',
      experience: '8 ans',
      image: '/api/placeholder/150/150'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Users className="h-16 w-16 mx-auto mb-6 text-green-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Conseil Immobilier Expert
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Bénéficiez de l'expertise de nos conseillers pour tous vos projets immobiliers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Phone className="h-5 w-5 mr-2" />
                Consultation gratuite
              </Button>
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                <Mail className="h-5 w-5 mr-2" />
                Nous contacter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Services de Conseil
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un accompagnement personnalisé pour chaque type de projet immobilier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                  <Badge variant="outline" className="w-fit">
                    Durée: {service.duration}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full group-hover:bg-green-600 transition-colors">
                    En savoir plus
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Experts Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Experts à Votre Service
            </h2>
            <p className="text-gray-600">
              Une équipe d'experts passionnés et expérimentés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {experts.map((expert, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-semibold text-lg mb-1">{expert.name}</h3>
                  <p className="text-green-600 font-medium mb-2">{expert.role}</p>
                  <p className="text-sm text-gray-600 mb-2">{expert.speciality}</p>
                  <Badge variant="outline">{expert.experience} d'expérience</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Notre Processus d'Accompagnement
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Consultation', desc: 'Analyse de vos besoins et objectifs' },
                { step: '2', title: 'Stratégie', desc: 'Élaboration d\'un plan personnalisé' },
                { step: '3', title: 'Action', desc: 'Mise en œuvre avec suivi régulier' },
                { step: '4', title: 'Succès', desc: 'Finalisation et bilan du projet' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à Démarrer Votre Projet ?
            </h2>
            <p className="text-green-100 mb-8">
              Contactez-nous pour une consultation gratuite et sans engagement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Phone className="h-5 w-5 mr-2" />
                01 23 45 67 89
              </Button>
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                <Mail className="h-5 w-5 mr-2" />
                Demander un rappel
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
