# Guide de Déploiement - Guida-Center

Ce guide détaille les étapes pour déployer l'application immobilière Guida-Center sur le serveur avec Apache et PHP 8.2.

## Informations du Serveur
- **Chemin du projet**: `/var/www/imob/`
- **Domaine**: `guidacenter.com`
- **PHP Version**: 8.2
- **Serveur Web**: Apache avec SSL
- **Port Frontend**: 3040

## 1. Préparation du Backend Laravel

### Installation et Configuration
```bash
# Aller dans le répertoire backend
cd /var/www/imob/imobackend

# Installer les dépendances Composer (production)
composer install --optimize-autoloader --no-dev

# Copier et configurer l'environnement
cp .env.example .env
nano .env
```

### Configuration .env pour la Production
```env
APP_NAME="Guida-Center"
APP_ENV=production
APP_KEY=base64:VOTRE_CLE_GENEREE
APP_DEBUG=false
APP_URL=https://guidacenter.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=imob_db
DB_USERNAME=root
DB_PASSWORD=mounkaila144

# JWT Configuration
JWT_SECRET=VOTRE_JWT_SECRET

# Queue Configuration
QUEUE_CONNECTION=database

# Cache Configuration
CACHE_DRIVER=file
SESSION_DRIVER=file

# CORS Configuration
FRONTEND_URL=https://guidacenter.com
```

### Commandes de Déploiement Laravel
```bash
# Générer la clé d'application
/usr/bin/php8.2 artisan key:generate

# Exécuter les migrations
/usr/bin/php8.2 artisan migrate --force

# Optimisations pour la production
/usr/bin/php8.2 artisan config:cache
/usr/bin/php8.2 artisan route:cache
/usr/bin/php8.2 artisan view:cache
/usr/bin/php8.2 artisan event:cache

# Appliquer les modifications CORS
/usr/bin/php8.2 artisan config:clear
/usr/bin/php8.2 artisan config:cache

# Créer le lien symbolique pour le storage
/usr/bin/php8.2 artisan storage:link

# Installer les dépendances Node.js et construire les assets
npm install
npm run build
```

## 2. Préparation du Frontend Next.js

### Configuration des Variables d'Environnement
```bash
# Aller dans le répertoire frontend
cd /var/www/imob

# Copier et configurer l'environnement
cp .env.local.example .env.local
nano .env.local
```

### Configuration .env.local pour la Production
```env
# Backend API URLs
NEXT_PUBLIC_API_URL=https://guidacenter.com/api

# Environnement
NODE_ENV=production

# Port pour PM2
PORT=3040
```

### Commandes de Déploiement Next.js
```bash
# Nettoyer le cache npm (en cas de problème)
npm cache clean --force

# Supprimer les dépendances existantes si problème
# rm -rf node_modules package-lock.json

# Installer les dépendances avec options de récupération
npm install --no-optional --legacy-peer-deps

# Alternative si npm échoue
# npm install --force
# ou utiliser yarn: yarn install

# Construire pour la production
npm run build

# Installer PM2 globalement (si pas déjà installé)
npm install -g pm2

# Créer le fichier de configuration PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'imob-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/imob',
    env: {
      NODE_ENV: 'production',
      PORT: 3040
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/imob-frontend-error.log',
    out_file: '/var/log/pm2/imob-frontend-out.log',
    log_file: '/var/log/pm2/imob-frontend.log'
  }]
};
EOF

# Créer le répertoire de logs PM2
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Démarrer l'application avec PM2 en utilisant le fichier de configuration
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
```

## 3. Configuration Apache

### Créer le fichier VirtualHost
Créer le fichier `/etc/apache2/sites-available/guidacenter.com.conf` :

```apache
<VirtualHost *:443>
    ServerName guidacenter.com
    DocumentRoot /var/www/imob

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/guidacenter.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/guidacenter.com/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    # Enable RewriteEngine
    RewriteEngine On

    # Handle API requests - proxy to Laravel backend
    RewriteCond %{REQUEST_URI} ^/api/(.*)$
    RewriteRule ^/api/(.*)$ /var/www/imob/imobackend/public/index.php [L]

    # Handle storage files - serve from Laravel
    RewriteCond %{REQUEST_URI} ^/storage/(.*)$
    RewriteRule ^/storage/(.*)$ /var/www/imob/imobackend/storage/app/public/$1 [L]

    # Everything else - proxy to Next.js on port 3040
    RewriteCond %{REQUEST_URhttps://github.com/Mounkaila144/imob.gitI} !^/api/
    RewriteCond %{REQUEST_URI} !^/storage/
    RewriteRule ^/(.*)$ http://localhost:3040/$1 [P,L]

    # Enable proxy modules
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPassReverse / http://localhost:3040/

    # Laravel backend directory configuration
    <Directory /var/www/imob/imobackend/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
    </Directory>

    # Storage directory configuration
    Alias /storage /var/www/imob/imobackend/storage/app/public
    <Directory /var/www/imob/imobackend/storage/app/public>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/guidacenter-error.log
    CustomLog ${APACHE_LOG_DIR}/guidacenter-access.log combined
</VirtualHost>

# Redirection HTTP vers HTTPS
<VirtualHost *:80>
    ServerName guidacenter.com
    Redirect permanent / https://guidacenter.com/
</VirtualHost>
```

### Activation du Site
```bash
# Activer les modules Apache nécessaires
a2enmod proxy
a2enmod proxy_http
a2enmod rewrite
a2enmod ssl
a2enmod headers
a2enmod deflate
a2enmod expires

# Activer le site
a2ensite guidacenter.com.conf

# Tester la configuration Apache
apache2ctl configtest

# Redémarrer Apache
systemctl reload apache2
```

## 4. Configuration des Permissions

```bash
# Configurer les permissions pour Laravel
sudo chown -R www-data:www-data /var/www/imob/imobackend
sudo chmod -R 755 /var/www/imob/imobackend
sudo chmod -R 775 /var/www/imob/imobackend/storage
sudo chmod -R 775 /var/www/imob/imobackend/bootstrap/cache

# Sécuriser le fichier .env
sudo chmod 600 /var/www/imob/imobackend/.env

# Configurer les permissions pour Next.js
sudo chown -R www-data:www-data /var/www/imob
sudo chmod -R 755 /var/www/imob
```

## 5. Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot (si pas déjà installé)
sudo apt update
sudo apt install certbot python3-certbot-apache

# Obtenir le certificat SSL pour le domaine
sudo certbot --apache -d guidacenter.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run

# Configurer le renouvellement automatique (crontab)
sudo crontab -e
# Ajouter cette ligne :
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. Configuration de la Base de Données

```bash
# Se connecter à MySQL
sudo mysql -u root -p

# Créer la base de données et l'utilisateur
CREATE DATABASE imob_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'imob_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON imob_db.* TO 'imob_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Exécuter les migrations
cd /var/www/imob/imobackend
/usr/bin/php8.2 artisan migrate --force

# Optionnel : Exécuter les seedersimob
/usr/bin/php8.2 artisan db:seed --force
```

## 7. Vérifications Post-Déploiement

### Vérifier les Services
```bash
# Vérifier Apache
sudo systemctl status apache2

# Vérifier PHP-FPM 8.2
sudo systemctl status php8.2-fpm

# Vérifier PM2
pm2 status

# Vérifier les logs
sudo tail -f /var/log/apache2/guidacenter-error.log
pm2 logs imob-frontend --lines 20
```

### Vérifier les Variables d'Environnement
```bash
# Vérifier que les variables sont correctes
cd /var/www/imob
cat .env.local

# Les URLs doivent pointer vers le domaine de production :
# NEXT_PUBLIC_API_URL=https://guidacenter.com/api
# PORT=3040
```

### Tests Fonctionnels
1. **Frontend** : Accéder à `https://guidacenter.com`
2. **API Backend** : Tester `https://guidacenter.com/api/health`
3. **Storage** : Vérifier l'accès aux images `https://guidacenter.com/storage/`

## 8. Maintenance et Mises à Jour

### Commandes de Maintenance Laravel
```bash
# Nettoyer les caches
/usr/bin/php8.2 artisan cache:clear
/usr/bin/php8.2 artisan config:clear
/usr/bin/php8.2 artisan route:clear
/usr/bin/php8.2 artisan view:clear

# Reconstruire les caches
/usr/bin/php8.2 artisan config:cache
/usr/bin/php8.2 artisan route:cache
/usr/bin/php8.2 artisan view:cache

# Migrations
/usr/bin/php8.2 artisan migrate --force
```

### Commandes de Maintenance Next.js
```bash
# Redéployer le frontend
cd /var/www/imob
npm run build
pm2 restart imob-frontend

# Vérifier les logs PM2
pm2 logs imob-frontend

# Redémarrer PM2 si nécessaire
pm2 restart imob-frontend
pm2 status

# Recharger la configuration PM2
pm2 reload ecosystem.config.js
```

## 9. Sauvegarde

### Script de Sauvegarde Automatique
```bash
#!/bin/bash
# /usr/local/bin/backup-imob.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/imob"
PROJECT_DIR="/var/www/imob"

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
mysqldump -u imob_user -p'VOTRE_MOT_DE_PASSE' imob_db > $BACKUP_DIR/imob_db_$DATE.sql

# Sauvegarder les fichiers
tar -czf $BACKUP_DIR/imob_files_$DATE.tar.gz -C $PROJECT_DIR .

# Nettoyer les anciennes sauvegardes (garder 7 jours)
find $BACKUP_DIR -type f -mtime +7 -delete
```

### Configurer la Sauvegarde Automatique
```bash
# Rendre le script exécutable
sudo chmod +x /usr/local/bin/backup-imob.sh

# Ajouter au crontab pour une sauvegarde quotidienne à 2h du matin
sudo crontab -e
# Ajouter : 0 2 * * * /usr/local/bin/backup-imob.sh
```

## 10. Surveillance et Logs

### Fichiers de Logs Importants
- Apache : `/var/log/apache2/guidacenter-error.log`
- Laravel : `/var/www/imob/imobackend/storage/logs/laravel.log`
- PM2 : `/var/log/pm2/imob-frontend.log`
- PM2 Error : `/var/log/pm2/imob-frontend-error.log`
- PM2 Out : `/var/log/pm2/imob-frontend-out.log`

### Commandes de Surveillance
```bash
# Surveiller les logs en temps réel
sudo tail -f /var/log/apache2/guidacenter-error.log
sudo tail -f /var/www/imob/imobackend/storage/logs/laravel.log
pm2 logs imob-frontend --lines 50

# Surveiller tous les logs PM2
sudo tail -f /var/log/pm2/imob-frontend.log

# Vérifier l'espace disque
df -h

# Vérifier l'utilisation mémoire
free -h

# Vérifier les processus
ps aux | grep php
ps aux | grep node

# Vérifier le statut du port 3040
sudo netstat -tulnp | grep :3040
```

---

**Note** : Remplacer tous les `VOTRE_MOT_DE_PASSE` et `VOTRE_CLE` par des valeurs sécurisées réelles lors du déploiement.