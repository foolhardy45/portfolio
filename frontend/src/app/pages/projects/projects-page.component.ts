import { Component } from '@angular/core';

@Component({
  selector: 'app-projects-page',
  template: `
    <section class="mx-auto max-w-5xl px-4 py-16">
      <h1 class="mb-2 text-3xl font-bold tracking-tight">Mes projets</h1>
      <p class="text-muted-foreground mb-8">
        Une sélection de projets personnels et professionnels.
      </p>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <p class="text-muted-foreground col-span-full text-center">
          Les projets seront affichés ici prochainement.
        </p>
      </div>
    </section>
  `,
})
export class ProjectsPageComponent {}
