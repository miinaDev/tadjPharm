# Guide de lancement en local (localhost)

Ce guide explique, étape par étape, comment faire tourner **TadjPharm** sur votre
ordinateur. Le site est composé de **3 briques** qui doivent toutes tourner en
même temps :

| Brique | Rôle | Adresse |
|--------|------|---------|
| 🗄️ **Base de données** (PostgreSQL, dans Docker) | Stocke produits, commandes, wilayas… | `localhost:5433` |
| ⚙️ **Serveur** (API Node/Express) | Logique métier, communique avec la BDD | http://localhost:4000 |
| 🖥️ **Client** (site React) | Ce que voient les visiteurs | http://localhost:5173 |

> ⚠️ **Le point le plus important** : le serveur ne démarre pas correctement si la
> base de données n'est pas allumée. Or la base tourne dans **Docker**. Donc
> **Docker Desktop doit être lancé AVANT tout le reste**.

---

## 1. Prérequis (à installer une seule fois)

- **Node.js** (version 20 ou plus) — https://nodejs.org
- **Docker Desktop** — https://www.docker.com/products/docker-desktop
  (c'est lui qui héberge la base de données PostgreSQL)

Pour vérifier que tout est installé, dans un terminal :

```bash
node --version     # doit afficher v20.x ou plus
docker --version   # doit afficher une version de Docker
```

---

## 2. Première installation (à faire UNE SEULE FOIS)

À ne faire qu'au tout premier lancement, ou après avoir récupéré le projet sur un
nouveau PC.

### a) Démarrer Docker Desktop
Ouvrez l'application **Docker Desktop** et attendez qu'elle indique *"Running"*
(l'icône baleine en bas est stable, plus en train de tourner).

### b) Démarrer la base de données
À la **racine du projet** (`TadjPharm/`) :
```bash
docker compose up -d
```
Cela télécharge et lance PostgreSQL en arrière-plan.

### c) Préparer le serveur
```bash
cd server
cp .env.example .env      # crée le fichier de configuration
npm install               # installe les dépendances
npx prisma migrate deploy # crée les tables dans la base
npx prisma db seed        # remplit les données de base (catégories, 58 wilayas, admin)
```

### d) Préparer le client
Dans un **autre terminal** :
```bash
cd client
cp .env.example .env      # crée la configuration (adresse de l'API)
npm install               # installe les dépendances
```

Une fois ces étapes faites, passez à la partie **3** — et les fois suivantes, vous
n'aurez **plus jamais** à refaire la partie 2 (sauf `docker compose up -d` qui reste
nécessaire après chaque redémarrage du PC).

---

## 3. Lancement quotidien (à chaque fois que vous voulez travailler)

### Étape 1 — Démarrer Docker Desktop
Ouvrez l'application **Docker Desktop** et attendez qu'elle soit *"Running"*.

### Étape 2 — Démarrer la base de données
À la racine du projet :
```bash
docker compose up -d
```
> Si le conteneur tourne déjà, la commande ne fait rien de mal, elle confirme juste
> qu'il est actif. Vos données sont conservées entre les redémarrages.

### Étape 3 — Démarrer le serveur (Terminal 1)
```bash
cd server
npm run dev
```
Attendez le message : **`TadjPharm API demarree sur http://localhost:4000`**.
Laissez ce terminal ouvert.

### Étape 4 — Démarrer le client (Terminal 2)
Ouvrez un **deuxième** terminal :
```bash
cd client
npm run dev
```
Attendez que Vite affiche **`Local: http://localhost:5173`**.
Laissez aussi ce terminal ouvert.

### Étape 5 — Ouvrir le site
- 🖥️ **Site public** : http://localhost:5173
- 🔐 **Espace admin** : http://localhost:5173/admin/login

**Identifiants admin** (définis dans `server/.env`) :
- Email : `admin@tadjpharm.dz`
- Mot de passe : `TadjPharm2026!`

---

## En résumé (une fois l'installation faite)

Trois choses à lancer, dans l'ordre :

```
1. Docker Desktop  (l'application)
2. docker compose up -d          ← à la racine
3. cd server && npm run dev      ← terminal 1
4. cd client && npm run dev      ← terminal 2
```

---

## 4. Arrêter le site

- **Arrêter le serveur et le client** : dans chaque terminal, appuyez sur `Ctrl + C`.
- **Arrêter la base de données** (optionnel) :
  ```bash
  docker compose stop
  ```
  Vos données restent intactes. Pour tout relancer plus tard : `docker compose up -d`.

> ⚠️ **N'utilisez pas** `docker compose down -v` : le `-v` **supprime le volume**,
> donc **efface toute la base de données** (produits, commandes…). Utilisez
> `docker compose stop` pour un simple arrêt.

---

## 5. Dépannage

**« Can't reach database server » / le serveur plante au démarrage**
→ Docker Desktop n'est pas lancé, ou le conteneur est arrêté. Lancez Docker Desktop,
puis `docker compose up -d`, puis relancez le serveur.

**Vérifier que la base tourne**
```bash
docker compose ps
```
La ligne `postgres` doit être à l'état `running` (ou `Up`).

**Le port 4000 ou 5173 est déjà utilisé**
→ Une ancienne instance tourne encore. Fermez l'ancien terminal, ou tuez le processus
Node concerné, puis relancez.

**Erreur `prisma generate` : fichier verrouillé (EPERM) sur Windows**
→ Le serveur est en train de tourner et bloque le fichier. Arrêtez le serveur
(`Ctrl + C`), relancez la commande Prisma, puis redémarrez le serveur.

**J'ai modifié le schéma Prisma (`schema.prisma`)**
→ Arrêtez le serveur, puis :
```bash
cd server
npx prisma migrate dev      # crée + applique la migration et régénère le client
npm run dev                 # redémarrez
```

**Repartir d'une base vide** (attention : efface tout)
```bash
docker compose down -v
docker compose up -d
cd server
npx prisma migrate deploy
npx prisma db seed
```
