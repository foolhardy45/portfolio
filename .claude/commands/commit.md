# Commit les changements en cours

Analyse les changements et crée un commit propre.

1. Vérifie qu'on n'est PAS sur `dev` ou `main`. Si oui, STOP.
2. Affiche un résumé des changements (`git diff --stat`).
3. Stage les fichiers pertinents (pas de `git add -A`).
4. Génère un message de commit conventional commit en français basé sur le diff.
   - Format : `<type>: <description>`
   - Types : feat, fix, style, refactor, docs, test, chore
   - Première ligne < 72 caractères
   - PAS de Co-Authored-By
5. Affiche le message proposé et le diff avant de commit.
6. Ne pas mettre de tag du style Author by Claude opus 4.6 ou autre tag garder uniquement le contexte.
7. Exécute le commit.

Si $ARGUMENTS est fourni, utilise-le comme indication pour le message de commit.
