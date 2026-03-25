import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ...HlmButtonImports],
  template: `
    <section class="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 text-center">
      <p class="text-muted-foreground mb-4 text-sm font-medium uppercase tracking-widest">
        Développeur Fullstack
      </p>
      <h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Tayrell Ajinca
      </h1>
      <p class="text-muted-foreground mx-auto mb-8 max-w-xl text-lg">
        Je conçois et développe des applications web modernes avec Angular et Python.
      </p>
      <div class="flex gap-4">
        <a hlmBtn routerLink="/projects">
          Voir mes projets
        </a>
        <a hlmBtn variant="outline" routerLink="/contact">
          Me contacter
        </a>
      </div>
    </section>
  `,
})
export class HomePageComponent {}
