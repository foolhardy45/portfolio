import { Component } from '@angular/core';
import { GlowCardDirective } from '../../directives/glow-card.directive';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-about-page',
  imports: [GlowCardDirective, ScrollRevealDirective],
  template: `
    <section class="min-h-screen px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto">

      <!-- TITRE -->
      <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          style="font-family: 'Syne', sans-serif; color: var(--foreground);">
        À propos
      </h1>
      <p class="text-lg mb-16 max-w-2xl" style="color: var(--muted-foreground);">
        Développeur fullstack en alternance, curieux et polyvalent — j'aime autant construire une API que peaufiner une interface.
      </p>

      <!-- SECTION PARCOURS -->
      <h2 appScrollReveal class="text-xl font-semibold mb-8" style="color: var(--foreground); font-family: 'Syne', sans-serif;">
        Parcours
      </h2>

      <div appScrollReveal [delay]="100" class="relative">
        <!-- Ligne verticale amber -->
        <div class="absolute left-1/2 top-0 bottom-0 w-px hidden md:block"
             style="background-color: var(--primary); opacity: 0.2;"></div>

        <div class="space-y-8">
          @for (item of timeline; track item.period; let i = $index) {
            <div [class]="i % 2 === 0
              ? 'md:flex md:justify-end md:pr-[calc(50%+2rem)]'
              : 'md:flex md:justify-start md:pl-[calc(50%+2rem)]'">
              <div appGlowCard class="card-glow rounded-2xl p-6 max-w-md w-full"
                   style="background-color: var(--card); border: 1px solid var(--border);">
                <span class="text-xs font-mono" style="color: var(--primary);">{{ item.period }}</span>
                <h3 class="text-base font-semibold mt-2" style="color: var(--foreground);">{{ item.title }}</h3>
                <p class="text-sm mt-2" style="color: var(--muted-foreground);">{{ item.description }}</p>
                <span class="inline-block mt-3 px-2 py-0.5 rounded text-xs"
                      style="background-color: var(--secondary); color: var(--primary);">
                  {{ item.tag }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- SECTION COMPÉTENCES -->
      <h2 appScrollReveal class="text-xl font-semibold mt-20 mb-8" style="color: var(--foreground); font-family: 'Syne', sans-serif;">
        Compétences
      </h2>

      <div appScrollReveal [delay]="100" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @for (cat of skills; track cat.label) {
          <div appGlowCard class="card-glow rounded-2xl p-6"
               style="background-color: var(--card); border: 1px solid var(--border);">
            <p class="text-sm font-medium mb-3" style="color: var(--primary);">{{ cat.label }}</p>
            <div class="flex flex-wrap gap-2">
              @for (tech of cat.items; track tech) {
                <span class="px-3 py-1 rounded-md text-xs"
                      style="background-color: var(--secondary); color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;">
                  {{ tech }}
                </span>
              }
            </div>
          </div>
        }
      </div>


      <!-- SECTION CV -->
      <div appGlowCard class="card-glow mt-16 rounded-2xl p-6 flex items-center justify-between"
           style="background-color: var(--card); border: 1px solid var(--border);">
        <div>
          <p class="font-medium" style="color: var(--foreground);">Mon CV</p>
          <p class="text-sm mt-1" style="color: var(--muted-foreground);">Télécharger au format PDF</p>
        </div>
        <a href="/assets/cv-tayrell.pdf" download
           class="px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:opacity-90 active:scale-95 transition-all"
           style="background-color: var(--primary); color: var(--primary-foreground);">
          Télécharger →
        </a>
      </div>
    </section>
  `,
})
export class AboutPageComponent {
  protected readonly timeline = [
    {
      period: '2024 — Présent',
      title: 'Alternance Développeur Fullstack chez Consilia Data',
      description: 'Conception et développement d\'applications web en Angular et Python chez Consilia Data.',
      tag: 'Expérience - Formation',
    },
    {
      period: '2023 — 2026',
      title: 'BUT Informatique en alternance',
      description: 'Formation intensive couvrant le développement frontend, backend, les bases de données et les méthodologies agiles.',
      tag: 'Formation',
    },
    {
      period: '2021 — 2022',
      title: 'Découverte du code',
      description: 'Premiers projets personnels en Python et JavaScript, découverte de la programmation et de la logique algorithmique. Sur des sites comme OpenClassrooms, et en autodidacte sur GitHub.',
      tag: 'Autodidacte',
    },
    {
      period: '2022',
      title: 'BAC STI2D',
      description: 'Diplôme obtenu en sciences et technologies de l\'industrie et du développement durable option SIN.',
      tag: 'Formation',
    }
  ];

  protected readonly skills = [
    { label: 'Frontend', items: ['Angular', 'TypeScript', 'Tailwind CSS', 'Spartan UI', 'HTML/CSS'] },
    { label: 'Backend', items: ['Flask', 'Python', 'SQLAlchemy', 'REST API'] },
    { label: 'Base de données', items: ['PostgreSQL', 'SQL'] },
    { label: 'Outils & DevOps', items: ['Docker', 'Git', 'GitHub', 'Linux'] },
  ];
}
