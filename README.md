# TadjPharm

Site e-commerce pour la vente de produits paramédicaux en Algérie. Catalogue public sans compte client ni paiement en ligne (les commandes sont confirmées par téléphone) + interface d'administration.

## Stack

- **client/** — React + Vite + TypeScript + TailwindCSS + React Router + TanStack React Query
- **server/** — Node.js + Express + TypeScript + Prisma + PostgreSQL

## Démarrage

1. Lancer Postgres :
   ```
   docker compose up -d
   ```
2. Configurer et démarrer le serveur :
   ```
   cd server
   cp .env.example .env
   npm install
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```
3. Configurer et démarrer le client (dans un autre terminal) :
   ```
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```
4. Site public : http://localhost:5173
   Admin : http://localhost:5173/admin/login (identifiants définis dans `server/.env`)
