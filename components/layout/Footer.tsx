import Link from 'next/link';
import { Home, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Gui-Center</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme immobilière moderne qui simplifie l'achat, la vente et la location de biens immobiliers.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties" className="text-muted-foreground hover:text-foreground transition-colors">
                  Toutes les annonces
                </Link>
              </li>
              <li>
                <Link href="/properties?transactionType=sale" className="text-muted-foreground hover:text-foreground transition-colors">
                  Acheter
                </Link>
              </li>
              <li>
                <Link href="/properties?transactionType=rent" className="text-muted-foreground hover:text-foreground transition-colors">
                  Louer
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/register?role=seller" className="text-muted-foreground hover:text-foreground transition-colors">
                  Devenir vendeur
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@Gui-Center.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>01 23 45 67 89</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Gui-Center. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}