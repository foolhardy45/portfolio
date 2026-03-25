import { Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  template: `
    <section class="mx-auto max-w-3xl px-4 py-16">
      <h1 class="mb-2 text-3xl font-bold tracking-tight">À propos</h1>
      <p class="text-muted-foreground mb-8">
        Mon parcours, mes compétences et ma formation.
      </p>
      <div class="space-y-4">
        <p>
          Développeur fullstack passionné par les technologies web modernes.
          Je travaille principalement avec Angular et Python pour créer des applications performantes et accessibles.
        </p>
      </div>
    </section>
  `,
})
export class AboutPageComponent {}
