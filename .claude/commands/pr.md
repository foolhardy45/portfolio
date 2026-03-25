# Commit, Push & Pull Request

Analyse les changements en cours, puis exécute ce workflow complet :

1. Vérifie qu'on n'est PAS sur `dev` ou `main`. Si c'est le cas, STOP et demande de créer une branche d'abord.
2. Lance les vérifications selon le dossier modifié :
   - Si fichiers frontend/ modifiés → `cd frontend && ng lint`
   - Si fichiers backend/ modifiés → `cd backend && pytest tests/ -v`
3. Si les vérifications échouent, STOP et affiche les erreurs.
4. `git add` les fichiers pertinents (pas de `git add -A` aveugle — stage uniquement les fichiers liés au changement logique)
5. Crée un commit avec un message conventional commit en français, basé sur l'analyse sémantique des changements.
6. `git push origin <branche-courante>`
7. Si l'argument $1 contient "pr" : crée une Pull Request vers `dev` avec `gh pr create` incluant un titre et une description générés automatiquement.

Règles pour le message de commit :
- Format : `<type>: <description courte en français>`
- Types : feat, fix, style, refactor, docs, test, chore
- Première ligne < 72 caractères
- Mode impératif
- PAS de Co-Authored-By

Affiche le diff résumé avant de commit pour validation.
