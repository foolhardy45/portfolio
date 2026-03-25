import { Component } from '@angular/core';

@Component({
  selector: 'app-hobbies-page',
  template: `
    <section class="mx-auto max-w-3xl px-4 py-16">
      <h1 class="mb-2 text-3xl font-bold tracking-tight">Centres d'intérêt</h1>
      <p class="text-muted-foreground mb-8">
        Ce qui me passionne en dehors du code.
      </p>
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="rounded-lg border p-4">
          <h2 class="mb-1 font-semibold">Volley-ball</h2>
          <p class="text-muted-foreground text-sm">Sport d'équipe et compétition.</p>
        </div>
        <div class="rounded-lg border p-4">
          <h2 class="mb-1 font-semibold">Gaming</h2>
          <p class="text-muted-foreground text-sm">Jeux vidéo et culture gaming.</p>
        </div>
        <div class="rounded-lg border p-4">
          <h2 class="mb-1 font-semibold">Manga</h2>
          <p class="text-muted-foreground text-sm">Lecture et découverte de mangas.</p>
        </div>
        <div class="rounded-lg border p-4">
          <h2 class="mb-1 font-semibold">Musique</h2>
          <p class="text-muted-foreground text-sm">Écoute et production musicale.</p>
        </div>
      </div>
    </section>
  `,
})
export class HobbiesPageComponent {}
