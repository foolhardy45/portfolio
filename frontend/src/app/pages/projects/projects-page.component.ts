import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ProjectCardComponent } from '../../components/project-card/project-card.component';
import { ApiService } from '../../services/api.service';
import type { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects-page',
  imports: [ProjectCardComponent],
  template: `
    <section class="min-h-screen px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">

      <span class="tech-specs-label mb-3 block" style="color: var(--muted-foreground);">
        PAGE_02 // PROJECTS
      </span>

      <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-2"
          style="font-family: 'Syne', sans-serif; color: var(--foreground);">
        Projets
      </h1>
      <p class="text-lg mb-8" style="color: var(--muted-foreground);">Ce que j'ai construit.</p>

      <div class="flex flex-wrap gap-2 mb-8">
        @for (f of filters(); track f) {
          <button
            (click)="activeFilter.set(f)"
            class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            [style]="activeFilter() === f
              ? 'background-color: var(--primary); color: var(--primary-foreground);'
              : 'background-color: var(--secondary); color: var(--muted-foreground); border: 1px solid var(--border);'"
          >
            {{ f }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-72 animate-pulse rounded-2xl"
                 style="background-color: var(--card);"></div>
          }
        </div>
      } @else if (filteredProjects().length === 0) {
        <div class="py-20 text-center">
          <p style="color: var(--muted-foreground);">Aucun projet pour ce filtre.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (project of filteredProjects(); track project.slug) {
            <app-project-card [project]="project" />
          }
        </div>
      }

    </section>
  `,
})
export class ProjectsPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly projects = signal<Project[]>([]);
  protected readonly activeFilter = signal('Tous');
  protected readonly loading = signal(true);

  protected readonly filters = computed(() => {
    const techs = new Set(this.projects().flatMap((p) => p.technologies));
    return ['Tous', ...Array.from(techs).sort()];
  });

  protected readonly filteredProjects = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'Tous') return this.projects();
    return this.projects().filter((p) => p.technologies.includes(filter));
  });

  ngOnInit(): void {
    this.api.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
