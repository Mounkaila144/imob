'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  Eye,
  UserCheck,
  Database,
  Clock,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function ConfidentialitePage() {
  const sections = [
    {
      id: 'collecte',
      title: 'Collecte des Informations',
      icon: Database,
      content: [
        {
          subtitle: 'Informations que nous collectons',
          text: 'Nous collectons les informations que vous nous fournissez directement, notamment lors de la création de votre compte, de la publication d\'une annonce, ou lorsque vous nous contactez. Ces informations peuvent inclure :'
        }
      ],
      list: [
        'Nom, prénom et coordonnées (email, téléphone)',
        'Adresse postale et informations de localisation',
        'Informations relatives à vos biens immobiliers',
        'Historique de navigation et préférences de recherche',
        'Données de connexion et informations techniques'
      ]
    },
    {
      id: 'utilisation',
      title: 'Utilisation des Données',
      icon: Eye,
      content: [
        {
          subtitle: 'Comment nous utilisons vos informations',
          text: 'Les données collectées sont utilisées pour vous fournir nos services et améliorer votre expérience sur Guida-Center :'
        }
      ],
      list: [
        'Gestion de votre compte et de vos annonces',
        'Mise en relation entre acheteurs et vendeurs',
        'Personnalisation de votre expérience utilisateur',
        'Envoi de notifications et d\'alertes immobilières',
        'Amélioration continue de nos services',
        'Respect de nos obligations légales'
      ]
    },
    {
      id: 'protection',
      title: 'Protection des Données',
      icon: Lock,
      content: [
        {
          subtitle: 'Mesures de sécurité',
          text: 'La sécurité de vos données personnelles est notre priorité absolue. Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations contre tout accès non autorisé, modification, divulgation ou destruction.'
        }
      ],
      list: [
        'Chiffrement SSL/TLS pour toutes les communications',
        'Stockage sécurisé des données avec chiffrement',
        'Accès restreint aux données personnelles',
        'Surveillance continue des systèmes',
        'Audits de sécurité réguliers'
      ]
    },
    {
      id: 'partage',
      title: 'Partage des Informations',
      icon: UserCheck,
      content: [
        {
          subtitle: 'Avec qui partageons-nous vos données',
          text: 'Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :'
        }
      ],
      list: [
        'Avec votre consentement explicite',
        'Avec nos partenaires de confiance pour fournir nos services',
        'Pour respecter nos obligations légales',
        'Pour protéger nos droits et notre sécurité'
      ]
    },
    {
      id: 'droits',
      title: 'Vos Droits',
      icon: CheckCircle,
      content: [
        {
          subtitle: 'Droits relatifs à vos données',
          text: 'Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :'
        }
      ],
      list: [
        'Droit d\'accès à vos données personnelles',
        'Droit de rectification des informations inexactes',
        'Droit à l\'effacement (droit à l\'oubli)',
        'Droit à la limitation du traitement',
        'Droit à la portabilité de vos données',
        'Droit d\'opposition au traitement',
        'Droit de retirer votre consentement à tout moment'
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies et Technologies',
      icon: FileText,
      content: [
        {
          subtitle: 'Utilisation des cookies',
          text: 'Nous utilisons des cookies et technologies similaires pour améliorer votre expérience, analyser l\'utilisation de notre plateforme et personnaliser nos services.'
        }
      ],
      list: [
        'Cookies essentiels au fonctionnement du site',
        'Cookies de performance et d\'analyse',
        'Cookies de personnalisation',
        'Cookies de ciblage publicitaire (avec votre consentement)'
      ]
    },
    {
      id: 'conservation',
      title: 'Conservation des Données',
      icon: Clock,
      content: [
        {
          subtitle: 'Durée de conservation',
          text: 'Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, ou conformément aux obligations légales applicables.'
        }
      ],
      list: [
        'Données de compte : durée de l\'inscription + 3 ans',
        'Données de transaction : 10 ans (obligations fiscales)',
        'Cookies : 13 mois maximum',
        'Données de prospection : 3 ans après le dernier contact'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
              <Shield className="h-10 w-10 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-slate-300 mb-4">
              Votre vie privée est notre priorité
            </p>
            <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
              <Clock className="h-4 w-4 mr-2" />
              Dernière mise à jour : Janvier 2026
            </Badge>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-blue-200 bg-white">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Engagement de Guida-Center
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Chez <strong>Guida-Center</strong>, nous nous engageons à protéger votre vie privée et vos données personnelles.
                      Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations
                      lorsque vous utilisez notre plateforme immobilière. En utilisant nos services, vous acceptez les pratiques décrites
                      dans cette politique.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          Article {index + 1}
                        </Badge>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {section.content.map((content, contentIndex) => (
                      <div key={contentIndex} className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{content.subtitle}</h4>
                        <p className="text-gray-600 leading-relaxed">{content.text}</p>
                      </div>
                    ))}
                    {section.list && (
                      <ul className="mt-4 space-y-2">
                        {section.list.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">
                    Des questions sur vos données ?
                  </h2>
                  <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                    Notre Délégué à la Protection des Données (DPO) est à votre disposition pour répondre à toutes vos questions
                    concernant la collecte et le traitement de vos données personnelles.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                      <Mail className="h-5 w-5" />
                      <span>dpo@guida-center.fr</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                      <FileText className="h-5 w-5" />
                      <span>CNIL - Réclamation</span>
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
              Cette politique de confidentialité est conforme au Règlement Général sur la Protection des Données (RGPD)
              et à la loi Informatique et Libertés. Elle peut être mise à jour périodiquement.
              Nous vous encourageons à la consulter régulièrement.
            </p>
            <p className="mt-2">
              <strong>Guida-Center</strong> - Plateforme Immobilière Moderne - Tous droits réservés © 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
