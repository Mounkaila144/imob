'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Users, 
  CreditCard, 
  FileText, 
  Phone, 
  Mail,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      id: 'estimation',
      title: 'Estimation gratuite',
      description: 'Obtenez une estimation précise de votre bien immobilier en quelques minutes',
      icon: Calculator,
      features: ['Estimation en ligne', 'Rapport détaillé', 'Conseils personnalisés'],
      price: 'Gratuit',
      href: '/services/estimation',
      color: 'blue'
    },
    {
      id: 'conseil',
      title: 'Conseil immobilier',
      description: 'Bénéficiez de l\'expertise de nos conseillers pour tous vos projets',
      icon: Users,
      features: ['Accompagnement personnalisé', 'Expertise locale', 'Suivi complet'],
      price: 'Sur devis',
      href: '/services/conseil',
      color: 'green'
    },
    {
      id: 'financement',
      title: 'Aide au financement',
      description: 'Trouvez les meilleures solutions de crédit pour votre projet',
      icon: CreditCard,
      features: ['Simulation de prêt', 'Négociation bancaire', 'Montage de dossier'],
      price: 'Commission sur succès',
      href: '/services/financement',
      color: 'purple'
    }
  ];

  const stats = [
    { label: 'Clients satisfaits', value: '2,500+', icon: Users },
    { label: 'Biens vendus', value: '1,200+', icon: FileText },
    { label: 'Note moyenne', value: '4.9/5', icon: Star },
    { label: 'Années d\'expérience', value: '15+', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Nos Services Immobiliers
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Un accompagnement complet pour tous vos projets immobiliers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Phone className="h-5 w-5 mr-2" />
                Nous contacter
              </Button>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Calculator className="h-5 w-5 mr-2" />
                Estimation gratuite
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Services Experts
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez notre gamme complète de services pour vous accompagner dans tous vos projets immobiliers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600 border-blue-200',
                green: 'bg-green-100 text-green-600 border-green-200',
                purple: 'bg-purple-100 text-purple-600 border-purple-200'
              };

              return (
                <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${colorClasses[service.color as keyof typeof colorClasses]}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Badge variant="outline" className="text-sm">
                        {service.price}
                      </Badge>
                      <Button asChild size="sm">
                        <Link href={service.href} className="flex items-center space-x-1">
                          <span>En savoir plus</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-gray-600">
              Des chiffres qui témoignent de notre expertise et de la satisfaction de nos clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prêt à démarrer votre projet ?
            </h2>
            <p className="text-gray-600 mb-8">
              Contactez nos experts pour un accompagnement personnalisé et gratuit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>01 23 45 67 89</span>
              </Button>
              <Button size="lg" variant="outline" className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>contact@Gida-Center.fr</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
