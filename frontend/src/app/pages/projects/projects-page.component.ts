import { Component, computed, inject, signal, OnInit, HostListener } from '@angular/core';
import { ProjectCardComponent } from '../../components/project-card/project-card.component';
import { ApiService } from '../../services/api.service';
import type { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects-page',
  imports: [ProjectCardComponent],
  template: `
    <section class="min-h-screen px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">

      <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-2"
          style="font-family: 'Syne', sans-serif; color: var(--foreground);">
        Projets
      </h1>
      <p class="text-lg mb-8" style="color: var(--muted-foreground);">Ce que j'ai construit.</p>

      <!-- Filters -->
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

      <!-- Project grid -->
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

      <!-- Detail modal -->
      @if (selectedProject()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
             (click)="selectedProject.set(null)">
          <div class="fixed inset-0" style="background-color: rgba(0,0,0,0.6);"></div>
          <div class="relative z-10 w-full max-w-lg rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
               style="background-color: var(--card); border: 1px solid var(--border);"
               (click)="$event.stopPropagation()">
            <button class="absolute top-4 right-4 text-lg"
                    style="color: var(--muted-foreground);"
                    (click)="selectedProject.set(null)">
              ✕
            </button>
            <h2 class="text-xl font-bold mb-1" style="font-family: 'Syne', sans-serif; color: var(--foreground);">
              {{ selectedProject()!.title }}
            </h2>
            <p class="text-sm mb-4" style="color: var(--primary);">{{ selectedProject()!.shortDescription }}</p>
            <p class="text-sm leading-relaxed mb-4" style="color: var(--muted-foreground);">
              {{ selectedProject()!.description }}
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
              @for (tech of selectedProject()!.technologies; track tech) {
                <span class="rounded-md px-3 py-1 text-xs"
                      style="background-color: var(--secondary); color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;">
                  {{ tech }}
                </span>
              }
            </div>
            <div class="flex gap-3 pt-3" style="border-top: 1px solid var(--border);">
              @if (selectedProject()!.githubUrl) {
                <a [href]="selectedProject()!.githubUrl" target="_blank" rel="noopener noreferrer"
                   class="px-4 py-2 rounded-lg text-sm font-medium"
                   style="background-color: var(--secondary); color: var(--foreground);">
                  GitHub ↗
                </a>
              }
              @if (selectedProject()!.demoUrl) {
                <a [href]="selectedProject()!.demoUrl" target="_blank" rel="noopener noreferrer"
                   class="px-4 py-2 rounded-lg text-sm font-medium"
                   style="background-color: var(--primary); color: var(--primary-foreground);">
                  Demo ↗
                </a>
              }
            </div>
          </div>
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
  protected readonly selectedProject = signal<Project | null>(null);

  protected readonly filters = computed(() => {
    const techs = new Set(this.projects().flatMap((p) => p.technologies));
    return ['Tous', ...Array.from(techs).sort()];
  });

  protected readonly filteredProjects = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'Tous') return this.projects();
    return this.projects().filter((p) => p.technologies.includes(filter));
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.selectedProject.set(null);
  }

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
