# Portfolio — Tayrell Ajinca

Site portfolio personnel pour présenter mes projets, compétences et parcours.
Monorepo fullstack : Angular 20 (frontend) + Flask 3.1 (backend) + PostgreSQL.

## Architecture

```
portfolio/
├── frontend/                # Angular 20 (standalone components, signals, Spartan UI, Tailwind CSS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/       # Composants de pages (home, projects, about, contact, hobbies)
│   │   │   ├── components/  # Composants réutilisables (navbar, footer, project-card...)
│   │   │   ├── services/    # Services Angular (api, theme, animation...)
│   │   │   └── models/      # Interfaces TypeScript
│   │   ├── assets/          # Images, fonts, icônes
│   │   └── styles/          # CSS global, Tailwind config, CSS variables theming
│   └── angular.json
├── backend/                 # Flask 3.1 API REST
│   ├── app/
│   │   ├── routes/          # Blueprints Flask (projects, contact, health)
│   │   ├── models/          # Modèles SQLAlchemy Core
│   │   ├── services/        # Logique métier
│   │   ├── schemas/         # Validation Marshmallow/Pydantic
│   │   └── config.py        # Configuration par environnement
│   ├── migrations/          # Alembic
│   ├── tests/               # pytest
│   └── requirements.txt
├── docker-compose.yml       # PostgreSQL + Backend + Frontend dev
├── CLAUDE.md
└── README.md
```

## Stack technique

- **Frontend** : Angular 20, TypeScript strict, standalone components, signals
- **UI** : Spartan UI (spartan.ng) — le shadcn/ui d'Angular. Brain (primitives accessibles) + Helm (styles Tailwind)
- **Styling** : Tailwind CSS 4 pour les utilitaires + CSS variables pour le theming. Pas de SCSS
- **Backend** : Flask 3.1, Python 3.12+, SQLAlchemy Core (pas ORM), Alembic
- **BDD** : PostgreSQL 16 via psycopg v3 (pas psycopg2-binary)
- **Conteneurisation** : Docker, docker-compose
- **Package managers** : npm (frontend), pip (backend)
- **Inspiration design** : 21st.dev pour les références visuelles (composants React → adapter en Angular)

## Commandes

### Frontend
```bash
cd frontend
npm install                    # Installer les dépendances
ng serve                       # Dev server (http://localhost:4200)
ng build                       # Build production
ng test                        # Tests unitaires
ng lint                        # Linting
npx nx g @spartan-ng/cli:ui <component>  # Ajouter un composant Spartan UI
```

### Backend
```bash
cd backend
pip install -r requirements.txt
flask run --debug              # Dev server (http://localhost:5000)
pytest tests/ -v               # Tests
flask db upgrade               # Appliquer les migrations Alembic
flask db migrate -m "message"  # Générer une migration
```

### Docker
```bash
docker-compose up -d           # Lancer PostgreSQL + backend
docker-compose down            # Arrêter
docker-compose logs -f backend # Logs backend
```

## Conventions de code

### Général
- Commits en **français**, format conventional commits : `feat: ajouter la page projets`
- Pas de tag Co-Authored-By dans les commits
- Branche `dev` pour le développement, `main` pour la production
- Code et commentaires en **anglais**, UI et contenu en **français**

### Frontend (Angular/TypeScript)
- Standalone components uniquement (pas de NgModules)
- Signals pour la réactivité (pas de BehaviorSubject sauf cas RxJS nécessaire)
- Tailwind CSS pour le styling — utiliser les classes utilitaires directement dans les templates
- Spartan UI pour les composants interactifs (dialog, dropdown, tabs, accordion...)
- CSS variables pour le theming (dark mode, couleurs custom) dans styles.css
- Mobile-first, responsive design
- Lazy loading des routes
- Nommage : `kebab-case` pour les fichiers, `PascalCase` pour les classes
- Animations : utiliser Angular Animations ou les transitions/animations CSS natives

### Backend (Flask/Python)
- SQLAlchemy Core (pas l'ORM) — cohérent avec le projet Consilia Data
- Repository pattern pour l'accès aux données
- Type hints sur toutes les fonctions
- Docstrings en anglais sur les fonctions publiques
- Gestion d'erreurs centralisée via error handlers Flask

## Pages du site

1. **Accueil** — Hero section, résumé, call-to-action vers les projets
2. **Projets** — Grille/liste des projets avec filtres par techno, modal ou page détail
3. **À propos** — Parcours, formation, compétences techniques, CV téléchargeable
4. **Hobbies** — Volley, gaming, manga, musique
5. **Contact** — Formulaire (nom, email, message) envoyé via l'API Flask

## API Backend — Endpoints prévus

```
GET    /api/health              # Healthcheck
GET    /api/projects            # Liste des projets
GET    /api/projects/:id        # Détail d'un projet
POST   /api/contact             # Envoyer un message de contact
```

## Git Workflow

### Branches
Toujours créer une branche depuis `dev` avant de travailler. Ne jamais commit directement sur `dev` ou `main`.

Format de nommage :
- `feature/<nom-court>` — Nouvelle fonctionnalité (ex: `feature/page-projets`, `feature/formulaire-contact`)
- `fix/<nom-court>` — Correction de bug (ex: `fix/navbar-mobile`, `fix/cors-backend`)
- `style/<nom-court>` — Changements visuels/CSS uniquement (ex: `style/hero-responsive`)
- `refactor/<nom-court>` — Refactoring sans changement fonctionnel (ex: `refactor/api-service`)
- `docs/<nom-court>` — Documentation (ex: `docs/readme-setup`)
- `chore/<nom-court>` — Maintenance, dépendances (ex: `chore/update-angular`)

### Commits
Format : conventional commits en **français**, mode impératif.
```
<type>: <description courte>

<corps optionnel : explique le pourquoi, pas le quoi>
```

Types autorisés : `feat`, `fix`, `style`, `refactor`, `docs`, `test`, `chore`

Exemples :
- `feat: ajouter la page projets avec filtres par techno`
- `fix: corriger le formulaire de contact sur mobile`
- `style: améliorer le responsive de la hero section`
- `refactor: extraire la logique API dans un service dédié`

Règles :
- Pas de tag Co-Authored-By dans les commits
- Première ligne < 72 caractères
- Un commit = un changement logique (ne pas mélanger feature + fix)
- Toujours vérifier avec `ng lint` (frontend) ou `pytest` (backend) avant de commit

### Workflow type pour une feature
```
1. git checkout dev && git pull origin dev
2. git checkout -b feature/<nom>
3. Coder la feature (commits atomiques au fur et à mesure)
4. Vérifier : lint + tests passent
5. git push origin feature/<nom>
6. Créer une Pull Request vers dev via gh (GitHub CLI)
7. Review (par Tayrell) puis merge
8. Supprimer la branche feature après merge
```

### Pull Requests
- Titre : même format que les commits (`feat: ajouter la page projets`)
- Description : résumé des changements, screenshots si UI, lien vers l'issue si applicable
- Target branch : toujours `dev` (jamais directement `main`)
- `main` est mis à jour uniquement via PR depuis `dev` pour les releases

## Design et UI

- **Spartan UI** (spartan.ng) : Utiliser les composants brain+helm pour dialog, dropdown, tabs, accordion, tooltip, sheet, etc.
- **Tailwind CSS 4** : Classes utilitaires pour le layout, spacing, typography, couleurs. Pas de CSS custom sauf pour les animations complexes
- **Theming** : Définir les CSS variables (--background, --foreground, --primary, --accent...) dans styles.css pour gérer le dark mode et la palette de couleurs
- **Inspiration** : Chercher sur 21st.dev les hero sections, project cards, navbars, formulaires de contact. Observer le design puis l'adapter en Angular + Spartan + Tailwind
- **Icônes** : Lucide icons via ng-icons (@ng-icons/lucide)
- **Fonts** : Inter ou Geist pour le body, importées via Google Fonts

## Workflow de développement

1. Avant de coder, vérifier s'il y a des patterns existants dans le code
2. Planifier l'approche pour les tâches complexes avant d'implémenter
3. Écrire le code de manière incrémentale (composant par composant)
4. Tester manuellement dans le navigateur après chaque changement UI
5. S'assurer que le linting passe avant de commit

## Ce qu'il ne faut PAS faire

- NE PAS utiliser psycopg2-binary (problèmes Windows/Unicode connus)
- NE PAS créer de NgModules — tout en standalone
- NE PAS hardcoder les URLs d'API — utiliser environment.ts
- NE PAS commit de secrets, clés API ou mots de passe
- NE PAS ignorer les erreurs TypeScript strict mode
- NE PAS utiliser SCSS — tout le styling passe par Tailwind CSS + CSS variables
- NE PAS utiliser Angular Material — on utilise Spartan UI pour les composants
- NE PAS copier-coller du code React depuis 21st.dev — s'en inspirer visuellement et recréer en Angular