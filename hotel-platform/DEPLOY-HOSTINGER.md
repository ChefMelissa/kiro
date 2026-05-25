# 🚀 Guide de Déploiement sur Hostinger

## Prérequis
- Compte Hostinger avec plan **Business** (Node.js activé)
- Accès au panneau hPanel

---

## Étape 1: Créer la base de données MySQL

1. Allez dans **hPanel → Bases de données → MySQL**
2. Créez une nouvelle base de données:
   - Nom: `hotel_platform`
   - Utilisateur: `hotel_user`
   - Mot de passe: (notez-le!)
3. Notez les informations de connexion

---

## Étape 2: Configurer Node.js sur Hostinger

1. Allez dans **hPanel → Avancé → Node.js**
2. Créez une nouvelle application:
   - Version Node.js: **18.x** (ou plus récent)
   - Répertoire racine: `/hotel-platform`
   - Fichier de démarrage: `backend/server.js`
   - Port: `3000` (Hostinger fait le proxy automatiquement)

---

## Étape 3: Upload des fichiers

### Option A: Via Git (recommandé)
```bash
# Dans hPanel → Git, connectez votre repository
# Branche: feature/hotel-booking-platform
```

### Option B: Via Gestionnaire de fichiers
1. Allez dans **hPanel → Fichiers → Gestionnaire de fichiers**
2. Naviguez vers le dossier de votre app Node.js
3. Uploadez tous les fichiers du dossier `hotel-platform/`
   - ⚠️ NE PAS uploader `node_modules/` ni `data/`

---

## Étape 4: Configuration .env

1. Créez un fichier `.env` à la racine de `hotel-platform/`:

```env
PORT=3000
NODE_ENV=production

# MySQL (depuis Étape 1)
DB_HOST=localhost
DB_PORT=3306
DB_USER=u123456789_hotel_user
DB_PASSWORD=VotreMotDePasse123!
DB_NAME=u123456789_hotel_platform

# Votre numéro WhatsApp (format international sans +)
WHATSAPP_NUMBER=213XXXXXXXXX

# Marge bénéficiaire
MARKUP_PERCENT=2
```

---

## Étape 5: Installer les dépendances

Dans le **Terminal SSH** de Hostinger (ou via l'interface Node.js):

```bash
cd ~/hotel-platform
npm install
```

---

## Étape 6: Initialiser la base de données

```bash
npm run setup-db
```

Vous devriez voir:
```
✅ Base de données "hotel_platform" prête
✅ Table "reservations" créée
✅ Table "agencies" créée
✅ Table "search_cache" créée
🎉 Installation terminée avec succès!
```

---

## Étape 7: Démarrer l'application

Dans l'interface Node.js de Hostinger, cliquez sur **"Redémarrer"**

Ou via SSH:
```bash
npm start
```

---

## Étape 8: Configurer le domaine

1. Allez dans **hPanel → Domaines**
2. Pointez votre domaine (ou sous-domaine) vers l'app Node.js
3. Exemple: `hotels.votreagence.com`

---

## ✅ Vérification

Ouvrez votre domaine dans le navigateur:
- Page d'accueil: `https://votre-domaine.com`
- Dashboard: `https://votre-domaine.com/dashboard`

---

## 🔧 Configuration WhatsApp

⚠️ **IMPORTANT**: Modifiez le numéro WhatsApp dans 2 endroits:

1. **Fichier `.env`**: `WHATSAPP_NUMBER=213XXXXXXXXX`
2. **Fichier `frontend/js/app.js`** (ligne 2): 
   ```js
   const WHATSAPP_NUMBER = '213XXXXXXXXX';
   ```

Remplacez `213XXXXXXXXX` par votre vrai numéro (sans le +).

---

## 📋 Structure des fichiers sur Hostinger

```
hotel-platform/
├── .env                 ← Configuration (NE PAS PARTAGER!)
├── package.json
├── backend/
│   ├── server.js        ← Point d'entrée
│   ├── database.js      ← Connexion MySQL
│   └── setup-db.js      ← Initialisation DB
├── frontend/
│   ├── index.html       ← Page principale
│   ├── css/
│   │   ├── styles.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── app.js
│   │   └── dashboard.js
│   └── pages/
│       └── dashboard.html
└── scraper/
    └── tunisiabeds_scraper.py  ← Pour plus tard
```

---

## 🔒 Sécurité

- Le fichier `.env` ne doit JAMAIS être partagé
- Le dashboard `/dashboard` est accessible par URL directe (ajoutez un mot de passe plus tard si nécessaire)
- Les données des clients sont stockées dans MySQL

---

## 🆘 Problèmes courants

| Problème | Solution |
|----------|----------|
| Erreur MySQL | Vérifiez les credentials dans `.env` |
| Page blanche | Vérifiez que le fichier de démarrage est `backend/server.js` |
| 502 Bad Gateway | Redémarrez l'app Node.js dans hPanel |
| npm install échoue | Essayez `npm install --production` |
