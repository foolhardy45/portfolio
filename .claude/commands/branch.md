# Créer une nouvelle branche de travail

Crée une nouvelle branche Git pour travailler sur une tâche.

1. Vérifie qu'on est sur `dev` et que `dev` est à jour : `git checkout dev && git pull origin dev`
2. Détermine le type de branche à partir de la description : $ARGUMENTS
   - S'il s'agit d'une nouvelle fonctionnalité → `feature/<nom-court>`
   - S'il s'agit d'un bug → `fix/<nom-court>`
   - S'il s'agit de style/CSS → `style/<nom-court>`
   - S'il s'agit de refactoring → `refactor/<nom-court>`
   - S'il s'agit de documentation → `docs/<nom-court>`
   - S'il s'agit de maintenance → `chore/<nom-court>`
3. Le nom de branche doit être en kebab-case, court, et descriptif (ex: `feature/page-projets`)
4. Crée la branche : `git checkout -b <type>/<nom>`
5. Confirme la création et affiche sur quelle branche on se trouve.
