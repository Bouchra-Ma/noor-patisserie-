# Documentation technique — Noor Pâtisserie

**Projet e-commerce** — Site de vente de pâtisseries et douceurs Ramadan.

---

## 1. Présentation du projet

Noor Pâtisserie est une application e-commerce qui permet de consulter un catalogue de produits (pâtisseries orientales, jus, chocolats, dattes, etc.), d’ajouter des articles au panier, de s’inscrire / se connecter, et de payer en ligne via Stripe. Le projet a été déployé avec le frontend sur Vercel et le backend sur Render.

---

## 2. Technologies utilisées

**Frontend**
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- Zustand (panier et auth côté client)

**Backend**
- Django 5.2
- Django REST Framework + Simple JWT (authentification)
- Base de données : SQLite en local, PostgreSQL en production (Render)
- Paiement : Stripe (checkout + webhook)

**Déploiement**
- Frontend : Vercel
- Backend + base PostgreSQL : Render
- Code source : GitHub

---

## 3. Architecture

- **Monorepo** : un dépôt Git avec deux dossiers, `frontend/` et `backend/`.
- Le frontend appelle l’API Django via la variable d’environnement `NEXT_PUBLIC_API_URL` (ex. `https://noor-patisserie.onrender.com/api`).
- Côté backend, CORS et `FRONTEND_URL` sont configurés pour accepter les requêtes depuis le site Vercel et pour les redirections Stripe après paiement.

---

## 4. Fonctionnalités principales

- Catalogue produits par catégories (carrousels, page détail produit).
- Panier persistant (Zustand), ajout / suppression d’articles.
- Inscription et connexion (JWT), accès aux commandes.
- Création de commande et paiement Stripe (Checkout Session).
- Page de confirmation après paiement ; webhook Stripe pour marquer la commande comme payée et mettre à jour le stock.
- Images produits : chemins locaux dans `frontend/public/catalog/` et URLs dans le seed Django.

---

## 5. Installation en local

**Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # puis remplir les variables (Stripe, etc.)
python manage.py migrate
python manage.py seed_ramadan_catalog
python manage.py runserver
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
npm run dev
```

Le site est accessible sur http://localhost:3000 et l’API sur http://127.0.0.1:8000/api.

---

## 6. Déploiement

- **Backend (Render)** : service Web Python, racine `backend`, commande de build `pip install -r requirements.txt`, commande de démarrage `gunicorn config.wsgi:application`. Base PostgreSQL créée sur Render ; `DATABASE_URL` et les autres variables (Stripe, `RUN_STARTUP_TASKS=1` pour migrate + seed au démarrage) sont définies dans l’onglet Environnement.
- **Frontend (Vercel)** : import du repo GitHub, répertoire racine `frontend`, **variable obligatoire** `NEXT_PUBLIC_API_URL` pointant vers l’URL de l’API Render (ex. `https://noor-patisserie.onrender.com/api`). Sans cette variable, le site en production enverra les requêtes vers `127.0.0.1` et vous verrez « Failed to fetch » / « ERR_CONNECTION_REFUSED ». Après avoir ajouté ou modifié la variable, **redéployez** le projet (les variables `NEXT_PUBLIC_*` sont intégrées au build).
- **Stripe** : clés API (test) dans les variables d’environnement ; webhook configuré vers `https://[backend].onrender.com/api/payments/webhook/` pour l’événement `checkout.session.completed`.

---

## 7. API et paiement

- **Endpoints principaux** :  
  `GET /api/catalog/products/`, `GET /api/catalog/products/<slug>/`,  
  `POST /api/auth/register/`, `POST /api/auth/login/`,  
  `POST /api/payments/create-checkout-session/`,  
  `POST /api/payments/confirm-checkout-session/` (secours si webhook non reçu),  
  `POST /api/payments/webhook/` (Stripe).
- Après un paiement réussi, Stripe redirige vers la page de succès du frontend ; le frontend appelle `confirm-checkout-session` si besoin, et le webhook met à jour la commande et le stock côté serveur.

---

## 8. Dépannage : « Failed to fetch » / ERR_CONNECTION_REFUSED

Si après connexion (ou en naviguant sur le site déployé) vous voyez **Failed to load resource: net::ERR_CONNECTION_REFUSED** et **TypeError: Failed to fetch** :

1. **Vercel** : Vérifiez que la variable **`NEXT_PUBLIC_API_URL`** est bien définie dans *Settings → Environment Variables*, avec la valeur de votre API Render (ex. `https://noor-patisserie.onrender.com/api`), sans slash final.
2. **Redéploiement** : Les variables `NEXT_PUBLIC_*` sont lues au **build**. Après avoir ajouté ou modifié `NEXT_PUBLIC_API_URL`, lancez un nouveau déploiement (Deployments → Redeploy).
3. **Render** : Si l’URL est correcte, vérifiez que le service backend est en ligne (plan gratuit : réveil ~30–50 s après inactivité).

---

*Documentation rédigée dans le cadre du projet e-commerce Noor Pâtisserie.*
