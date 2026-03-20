'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  ChevronRight,
  Shield,
  Home,
  UserPlus,
  Search,
  Heart,
  Settings,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function SupportPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      detail: 'support@guidacenter.com',
      description: 'Réponse sous 24h',
      href: 'mailto:support@guidacenter.com',
      color: 'blue',
    },
    {
      icon: Phone,
      title: 'Téléphone',
      detail: '+227 00 00 00 00',
      description: 'Lun - Ven, 8h - 18h',
      href: 'tel:+22700000000',
      color: 'green',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      detail: 'Discuter avec nous',
      description: 'Réponse rapide',
      href: 'https://wa.me/22700000000',
      color: 'emerald',
    },
  ];

  const faqItems = [
    {
      icon: UserPlus,
      question: 'Comment créer un compte ?',
      answer:
        "Téléchargez l'application Guida Center, appuyez sur \"Créer un compte\" et remplissez le formulaire avec votre nom, email et mot de passe. Vous pouvez vous inscrire en tant qu'acheteur/locataire ou en tant qu'annonceur.",
    },
    {
      icon: Home,
      question: 'Comment publier une annonce ?',
      answer:
        "Pour publier une annonce, vous devez avoir un compte annonceur. Connectez-vous, accédez à votre tableau de bord et appuyez sur \"Ajouter une propriété\". Remplissez les détails du bien, ajoutez des photos et publiez. La validation prend généralement moins de 24 heures.",
    },
    {
      icon: Search,
      question: 'Comment rechercher un bien ?',
      answer:
        "Utilisez la barre de recherche sur l'écran d'accueil ou les filtres avancés pour affiner vos résultats par type de bien (maison, appartement, studio, terrain), localisation, prix et superficie.",
    },
    {
      icon: Heart,
      question: 'Comment sauvegarder mes favoris ?',
      answer:
        "Appuyez sur l'icône coeur sur n'importe quelle annonce pour l'ajouter à vos favoris. Retrouvez tous vos favoris dans l'onglet \"Favoris\" de l'application.",
    },
    {
      icon: Settings,
      question: 'Comment modifier mon profil ?',
      answer:
        'Allez dans l\'onglet "Profil" et appuyez sur "Modifier le profil" pour mettre à jour vos informations personnelles, votre photo de profil ou votre mot de passe.',
    },
    {
      icon: CreditCard,
      question: 'Comment fonctionne l\'abonnement annonceur ?',
      answer:
        "L'abonnement annonceur vous permet de publier vos biens immobiliers sur la plateforme. Rendez-vous dans la section \"Mon abonnement\" de votre profil pour voir les plans disponibles et souscrire.",
    },
    {
      icon: AlertCircle,
      question: 'Comment signaler une annonce ?',
      answer:
        "Si vous remarquez une annonce suspecte ou frauduleuse, contactez-nous par email à support@guidacenter.com avec les détails de l'annonce. Notre équipe de modération examinera le signalement rapidement.",
    },
    {
      icon: Shield,
      question: 'Comment supprimer mon compte ?',
      answer:
        'Vous pouvez demander la suppression de votre compte en vous rendant sur la page dédiée à guidacenter.com/supprimer-compte ou en nous contactant par email. La suppression est définitive et irréversible.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
              <HelpCircle className="h-10 w-10 text-blue-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Aide & Support
            </h1>
            <p className="text-xl text-blue-200 mb-4">
              Nous sommes là pour vous aider
            </p>
            <Badge
              variant="outline"
              className="bg-white/10 border-white/20 text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Support disponible du lundi au vendredi
            </Badge>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Contactez-nous
              </h2>
              <p className="text-gray-600 text-lg">
                Choisissez le moyen de communication qui vous convient
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <a
                    key={method.title}
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full cursor-pointer">
                      <CardContent className="pt-6 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                          <Icon className="h-7 w-7 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {method.title}
                        </h3>
                        <p className="text-blue-600 font-medium mb-1">
                          {method.detail}
                        </p>
                        <p className="text-sm text-gray-500">
                          {method.description}
                        </p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions fréquentes
              </h2>
              <p className="text-gray-600 text-lg">
                Trouvez rapidement les réponses à vos questions
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={index}
                    className="overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <details className="group">
                      <summary className="flex items-center cursor-pointer p-6 list-none">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-4 flex-shrink-0">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900 flex-1">
                          {item.question}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="px-6 pb-6 pt-0 ml-14">
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </details>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* App Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                    <Home className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">
                    À propos de Guida Center
                  </h2>
                  <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                    Guida Center est la plateforme de référence pour
                    l&apos;immobilier au Niger. Trouvez des maisons,
                    appartements, studios et terrains à vendre ou à louer dans
                    toutes les villes du Niger.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                      <Mail className="h-5 w-5" />
                      <span>support@guidacenter.com</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                      <Shield className="h-5 w-5" />
                      <a href="/confidentialite" className="hover:underline">
                        Politique de confidentialité
                      </a>
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
              Si vous ne trouvez pas la réponse à votre question, n&apos;hésitez
              pas à nous contacter directement. Notre équipe se fera un plaisir
              de vous aider.
            </p>
            <p className="mt-2">
              <strong>Guida Center</strong> - Plateforme Immobilière au Niger -
              Tous droits réservés &copy; 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
