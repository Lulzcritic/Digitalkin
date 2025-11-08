# 🧠 Digitalkin Backend API — Test Technique

Backend Node.js développé pour le test technique **Digitalkin**, permettant la gestion d’agents virtuels et la simulation de conversations interactives entre utilisateurs et agents.

---

## 🚀 Fonctionnalités principales

### 🔹 Agents
- CRUD complet (`GET`, `POST`, `PUT`, `DELETE`)
- Chaque agent possède une stratégie de réponse :
  - `echo` → répète le message utilisateur
  - `keyword` → répond selon des mots-clés configurés
  - `canned` → pioche dans une liste de réponses prédéfinies

### 🔹 Conversations
- Démarrer une conversation avec un agent
- Envoyer des messages dans une conversation existante
- Stockage et historique des échanges (rôle, contenu, timestamp)

### 🔹 Données & persistance
- **Stockage en mémoire** pour les tests unitaires
- Support de **SurrealDB** intégré (dans `src/storage/surreal.ts`)
- Interface de stockage (`StorageAdapter`) pour flexibilité

### 🔹 Documentation
- Fichier `openapi.yaml` à la racine (compatible Swagger / Postman)
- Exemple : `npx swagger-ui-watcher openapi.yaml`

### 🔹 Tests
- **Jest + Supertest** : tests automatisés pour tous les endpoints
- Tests organisés par stratégie (`echo`, `keyword`, `update`, etc.)

---

## 🧩 Stack technique

| Domaine | Choix | Raison |
|----------|--------|--------|
| Langage | TypeScript | Typage strict, meilleure lisibilité |
| Framework | Express (ou Fastify optionnel) | Simplicité + rapidité d’implémentation |
| Validation | Zod | Validation sûre et explicite |
| Tests | Jest + Supertest | API testable de bout en bout |
| Base de données | SurrealDB (ou mémoire) | Flexible et légère |
| Conteneurisation | Docker Compose | Lancer rapidement SurrealDB |

---

## 📁 Structure du projet

```
src/
 ├─ controllers/             # Logique HTTP
 │   ├─ agents.controller.ts
 │   └─ conversations.controller.ts
 ├─ models/                  # Types & schémas
 │   ├─ schemas.ts
 │   └─ types.ts
 ├─ routes/                  # Définition des routes REST
 │   ├─ agents.ts
 │   └─ conversations.ts
 ├─ services/                # Logique métier
 │   └─ reply.service.ts
 ├─ storage/                 # Persistance (mémoire / SurrealDB)
 │   ├─ adapter.ts
 │   ├─ memory.ts
 │   └─ surreal.ts
 ├─ utils/                   # Utilitaires (auth, erreurs, validation...)
 │   ├─ auth.ts
 │   ├─ errors.ts
 │   ├─ surrealClient.ts
 │   └─ validate.ts
 ├─ app.ts                   # Création et configuration du serveur
 └─ server.ts                # Entrée principale

tests/
 ├─ agents.test.ts
 ├─ agents.update.test.ts
 ├─ conversations.echo.test.ts
 ├─ conversations.keyword.test.ts
 └─ jest.setup.ts

docker-compose.yml          # Lancement SurrealDB local
openapi.yaml                # Documentation API
README.md                   # Ce fichier
```

---

## ⚙️ Installation et exécution

### 1. Installer les dépendances
```bash
npm install
```

### 2. Lancer SurrealDB en local
```bash
docker compose up -d
```

### 3. Lancer le serveur (dev)
```bash
npm run dev
```

Par défaut : [http://localhost:3000](http://localhost:3000)

### 4. Variables d’environnement (.env)
```
PORT=3000
SURREAL_URL=http://localhost:8000
SURREAL_USER=root
SURREAL_PASS=root
SURREAL_NS=testns
SURREAL_DB=testdb
API_KEY=dev-local-key
```

---

## 🧪 Tests

### Lancer tous les tests
```bash
npm test
```

Les tests couvrent :
- CRUD agents
- Conversations `echo`
- Conversations `keyword`

---

## 🔍 Exemple d’utilisation (cURL)

### ➕ Créer un agent
```bash
curl -X POST http://localhost:3000/agents   -H "x-api-key: dev-local-key"   -H "Content-Type: application/json"   -d '{
    "name": "Luna",
    "rules": {
      "mode": "keyword",
      "keywords": {
        "bonjour": ["Salut !", "Bonjour !"],
        "prix": ["Nos tarifs démarrent à 99€", "100 euros"]
      },
      "fallback": "Je vous écoute."
    }
  }'
```

### 💬 Démarrer une conversation
```bash
curl -X POST http://localhost:3000/conversations   -H "x-api-key: dev-local-key"   -H "Content-Type: application/json"   -d '{ "agentId": "<agent-id>", "message": "bonjour" }'
```

### 📨 Envoyer un message
```bash
curl -X POST http://localhost:3000/conversations/<conversationId>/messages   -H "x-api-key: dev-local-key"   -H "Content-Type: application/json"   -d '{ "message": "encore" }'
```

---

## 🧠 Architecture applicative

- **Séparation stricte** entre couches : contrôleurs → services → stockage.
- **Interface unique** `StorageAdapter` pour changer facilement de backend (mémoire ↔ SurrealDB).
- **Gestion d’erreurs centralisée** (`utils/errors.ts`).
- **Clé API simple** pour sécuriser les requêtes (`utils/auth.ts`).

---

## 🧩 Améliorations possibles

| Domaine | Amélioration |
|----------|---------------|
| Authentification | JWT ou OAuth2 |
| Tests | Mock SurrealDB et coverage >90% |
| Monitoring | Ajout de pino |
| IA | Remplacer les règles statiques par un LLM via API |

---

## Notes

### Stockage des données avec SurrealDB
Je stock mon propre id en type string pour les agents car le type de l'id de surrealdb n'etait pas compatible avec le type uuid de zod.
