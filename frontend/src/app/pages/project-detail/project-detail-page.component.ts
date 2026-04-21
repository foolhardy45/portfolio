import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { GlowCardDirective } from '../../directives/glow-card.directive';
import type { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-detail-page',
  imports: [RouterLink, GlowCardDirective],
  template: `
    <section class="min-h-screen px-4 sm:px-6 lg:px-8 py-20 max-w-5xl mx-auto">

      <!-- Back link -->
      <a routerLink="/projets"
         class="inline-flex items-center gap-1 text-sm mb-8 transition-colors hover:opacity-80"
         style="color: var(--muted-foreground);">
        <span aria-hidden="true">←</span>
        <span>Retour aux projets</span>
      </a>

      @if (loading()) {
        <div class="animate-pulse space-y-4">
          <div class="h-4 w-24 rounded" style="background-color: var(--card);"></div>
          <div class="h-12 w-2/3 rounded" style="background-color: var(--card);"></div>
          <div class="h-64 rounded-2xl" style="background-color: var(--card);"></div>
          <div class="h-24 rounded" style="background-color: var(--card);"></div>
        </div>
      } @else if (project(); as p) {

        <span class="tech-specs-label mb-3 block" style="color: var(--muted-foreground);">
          PROJECT // {{ p.slug }}
        </span>

        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-2"
            style="font-family: 'Syne', sans-serif; color: var(--foreground);">
          {{ p.title }}
        </h1>
        <p class="text-lg mb-10" style="color: var(--primary);">
          {{ p.shortDescription }}
        </p>

        @if (p.imageUrl) {
          <div appGlowCard
               class="card-glow subtle-grain relative mb-10 overflow-hidden rounded-2xl"
               style="background-color: var(--card); border: 1px solid var(--border);">
            <div class="subtle-bracket-tl"></div>
            <div class="subtle-bracket-br"></div>
            <img [src]="p.imageUrl"
                 [alt]="'Capture du projet ' + p.title"
                 class="w-full h-auto object-cover"
                 loading="eager">
          </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div class="md:col-span-2">
            <h2 class="text-xs uppercase tracking-wider mb-3"
                style="color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;">
              À propos
            </h2>
            <p class="text-base leading-relaxed whitespace-pre-line"
               style="color: var(--foreground);">{{ p.description }}</p>
          </div>

          <aside class="space-y-6">
            <div>
              <h2 class="text-xs uppercase tracking-wider mb-3"
                  style="color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;">
                Stack technique
              </h2>
              <div class="flex flex-wrap gap-1.5">
                @for (tech of p.technologies; track tech) {
                  <span class="rounded px-2 py-1 text-[11px]"
                        style="background-color: var(--secondary); color: var(--foreground); font-family: 'JetBrains Mono', monospace;">
                    {{ tech }}
                  </span>
                }
              </div>
            </div>

            <div>
              <h2 class="text-xs uppercase tracking-wider mb-3"
                  style="color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;">
                Liens
              </h2>
              <div class="flex flex-col gap-2">
                @if (p.githubUrl) {
                  <a [href]="p.githubUrl" target="_blank" rel="noopener noreferrer"
                     class="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
                     style="background-color: var(--primary); color: var(--primary-foreground);">
                    Voir sur GitHub ↗
                  </a>
                }
                @if (p.demoUrl) {
                  <a [href]="p.demoUrl" target="_blank" rel="noopener noreferrer"
                     class="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                     style="background-color: var(--secondary); color: var(--foreground); border: 1px solid var(--border);">
                    Voir la démo ↗
                  </a>
                }
                @if (!p.githubUrl && !p.demoUrl) {
                  <p class="text-xs" style="color: var(--muted-foreground);">
                    Aucun lien public disponible.
                  </p>
                }
              </div>
            </div>
          </aside>
        </div>

      } @else {
        <div class="py-20 text-center">
          <span class="tech-specs-label block mb-3" style="color: var(--muted-foreground);">
            ERROR // 404
          </span>
          <h1 class="text-3xl font-bold mb-2"
              style="font-family: 'Syne', sans-serif; color: var(--foreground);">
            Projet introuvable
          </h1>
          <p class="text-sm mb-6" style="color: var(--muted-foreground);">
            Ce projet n'existe pas ou a été retiré.
          </p>
          <a routerLink="/projets"
             class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
             style="background-color: var(--primary); color: var(--primary-foreground);">
            ← Retour aux projets
          </a>
        </div>
      }

    </section>
  `,
})
export class ProjectDetailPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroy$ = new Subject<void>();

  protected readonly project = signal<Project | null>(null);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    // React to slug changes so navigation between projects re-fetches cleanly.
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap((params) => {
        this.loading.set(true);
        return this.api.getProjectBySlug(params.get('slug') ?? '');
      }),
    ).subscribe({
      next: (p) => {
        this.project.set(p);
        this.loading.set(false);
        this.updateMeta(p);
      },
      error: () => {
        // 404 or network — show the not-found state.
        this.project.set(null);
        this.loading.set(false);
        this.title.setTitle('Projet introuvable — Tayrell');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMeta(p: Project): void {
    this.title.setTitle(`${p.title} — Tayrell`);
    this.meta.updateTag({ name: 'description', content: p.shortDescription });
  }
}
