import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GlowCardDirective } from '../../directives/glow-card.directive';
import { TextRevealComponent } from '../../components/text-reveal/text-reveal.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, GlowCardDirective, TextRevealComponent],
  template: `
    <section class="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">

      <!-- BENTO GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">

        <!-- HERO — 2 cols × 2 rows -->
        <div
          appGlowCard class="card-glow md:col-span-2 md:row-span-2 rounded-2xl p-8 flex flex-col justify-between"
          style="background-color: var(--card); border: 1px solid var(--border);"
        >
          <div>
            <h1
              class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
              style="font-family: 'Syne', sans-serif; color: var(--foreground);"
            >
              <app-text-reveal text="Tayrell" [speed]="80" />
            </h1>
            <p class="mt-2 text-xl" style="color: var(--primary);">Développeur Fullstack</p>
            <p class="mt-4 text-base max-w-md" style="color: var(--muted-foreground);">
              Je conçois des applications web robustes et élégantes, du design à la mise en production.
            </p>
          </div>
          <div class="flex gap-3 mt-6">
            <a
              routerLink="/projets"
              class="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
              style="background-color: var(--primary); color: var(--primary-foreground);"
            >
              Voir mes projets →
            </a>
            <a
              routerLink="/contact"
              class="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
              style="border: 1px solid var(--border); color: var(--foreground);"
            >
              Me contacter
            </a>
          </div>
        </div>

        <!-- STACK — 2 cols × 1 row -->
        <div
          appGlowCard class="card-glow md:col-span-2 rounded-2xl p-6 flex flex-col justify-between"
          style="background-color: var(--card); border: 1px solid var(--border);"
        >
          <p class="text-sm font-medium mb-3" style="color: var(--muted-foreground);">Technologies</p>
          <div class="flex flex-wrap gap-2">
            @for (tech of technologies; track tech) {
              <span
                class="px-3 py-1 rounded-md text-xs"
                style="background-color: var(--secondary); color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;"
              >
                {{ tech }}
              </span>
            }
          </div>
        </div>

        <!-- PROJETS — 1 col × 2 rows -->
        <div
          appGlowCard class="card-glow md:row-span-2 rounded-2xl p-6 flex flex-col"
          style="background-color: var(--card); border: 1px solid var(--border);"
        >
          <p class="text-sm font-medium mb-4" style="color: var(--primary);">Projets</p>

          <div class="space-y-4 flex-1">
            @for (project of featuredProjects; track project.title) {
              <div>
                <p class="font-medium text-sm" style="color: var(--foreground);">{{ project.title }}</p>
                <p class="text-xs mt-1" style="color: var(--muted-foreground);">{{ project.description }}</p>
                <div class="flex gap-1 mt-2">
                  @for (tag of project.tags; track tag) {
                    <span
                      class="px-2 py-0.5 rounded text-[10px]"
                      style="background-color: var(--secondary); color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;"
                    >
                      {{ tag }}
                    </span>
                  }
                </div>
              </div>
              @if (!$last) {
                <div style="height: 1px; background-color: var(--border);"></div>
              }
            }
          </div>

          <a
            routerLink="/projets"
            class="text-sm mt-4 flex items-center gap-1 transition-colors"
            style="color: var(--primary);"
          >
            Voir tous les projets →
          </a>
        </div>

        <!-- À PROPOS — 1 col × 1 row -->
        <div
          appGlowCard class="card-glow rounded-2xl p-6 flex flex-col justify-between"
          style="background-color: var(--card);"
        >
          <div>
            <p class="text-sm font-medium mb-2" style="color: var(--primary);">À propos</p>
            <p class="text-sm leading-relaxed" style="color: var(--muted-foreground);">
              Développeur fullstack en alternance, passionné par le craft logiciel et les interfaces soignées.
            </p>
          </div>
          <a
            routerLink="/a-propos"
            class="text-sm mt-3 flex items-center gap-1"
            style="color: var(--primary);"
          >
            En savoir plus →
          </a>
        </div>

        <!-- ACTUELLEMENT — 1 col × 1 row -->
        <div
          appGlowCard class="card-glow rounded-2xl p-6"
          style="background-color: var(--card);"
        >
          <p class="text-sm font-medium mb-3" style="color: var(--muted-foreground);">Actuellement</p>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" style="background-color: var(--primary);"></div>
              <span class="text-sm" style="color: var(--foreground);">Construction de ce portfolio</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" style="background-color: var(--primary);"></div>
              <span class="text-sm" style="color: var(--foreground);">Alternance développeur fullstack</span>
            </div>
          </div>
        </div>

        <!-- CONTACT — 1 col × 1 row -->
        <div
          appGlowCard class="card-glow rounded-2xl p-6 flex flex-col justify-between"
          style="background-color: var(--card);"
        >
          <div>
            <p class="text-sm font-medium mb-2" style="color: var(--primary);">Contact</p>
            <p class="text-sm" style="color: var(--muted-foreground);">Un projet en tête ? Discutons-en.</p>
          </div>
          <a
            routerLink="/contact"
            class="text-sm mt-3"
            style="color: var(--primary);"
          >
            Me contacter →
          </a>
        </div>

        <!-- GITHUB — 1 col × 1 row -->
        <div
          appGlowCard class="card-glow rounded-2xl p-6 flex flex-col justify-between"
          style="background-color: var(--card);"
        >
          <p class="text-sm font-medium" style="color: var(--muted-foreground);">Explorer mon code</p>
          <a
            href="https://github.com/foolhardy45"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm flex items-center gap-1 mt-2"
            style="color: var(--primary);"
          >
            github.com/foolhardy45 →
          </a>
        </div>

      </div>
    </section>
  `,
})
export class HomePageComponent {
  protected readonly technologies = [
    'Angular', 'TypeScript', 'Flask', 'Python',
    'PostgreSQL', 'Docker', 'Tailwind CSS', 'Spartan UI',
  ];

  protected readonly featuredProjects = [
    {
      title: 'Portfolio',
      description: 'Ce site — Angular 20, Flask, bento grid.',
      tags: ['Angular', 'Flask', 'Tailwind'],
    },
    {
      title: 'Consilia Data',
      description: 'Creation d\'un site vitrine avec gestion des offres d\'emploi',
      tags: ['Flask', 'PostgreSQL', 'SQLAlchemy', 'Angular'],
    },
  ];
}
