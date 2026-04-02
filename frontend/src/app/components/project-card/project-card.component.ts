import { Component, input } from '@angular/core';
import type { Project } from '../../models/project.model';
import { GlowCardDirective } from '../../directives/glow-card.directive';

@Component({
  selector: 'app-project-card',
  imports: [GlowCardDirective],
  template: `
    <div appGlowCard class="card-glow subtle-grain group relative flex h-full flex-col overflow-hidden rounded-2xl"
         style="background-color: var(--card); border: 1px solid var(--border);">

      <!-- Subtle HUD brackets -->
      <div class="subtle-bracket-tl"></div>
      <div class="subtle-bracket-br"></div>

      <!-- Image -->
      <div class="h-40 overflow-hidden" style="background-color: var(--secondary);">
        @if (project().imageUrl) {
          <img [src]="project().imageUrl" [alt]="'Capture du projet ' + project().title"
               loading="lazy"
               class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105">
        } @else {
          <div class="flex h-full w-full items-center justify-center">
            <span class="text-3xl" style="color: var(--muted-foreground);">📁</span>
          </div>
        }
      </div>

      <!-- Content -->
      <div class="flex flex-1 flex-col p-5">
        <h3 class="text-base font-semibold" style="color: var(--foreground);">
          {{ project().title }}
        </h3>
        <p class="mt-1 flex-1 text-sm leading-relaxed line-clamp-2" style="color: var(--muted-foreground);">
          {{ project().shortDescription }}
        </p>

        <!-- Tech badges -->
        <div class="mt-3 flex flex-wrap gap-1.5">
          @for (tech of project().technologies.slice(0, 4); track tech) {
            <span class="rounded px-2 py-0.5 text-[10px]"
                  style="background-color: var(--secondary); color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;">
              {{ tech }}
            </span>
          }
          @if (project().technologies.length > 4) {
            <span class="rounded px-2 py-0.5 text-[10px]"
                  style="color: var(--muted-foreground);">
              +{{ project().technologies.length - 4 }}
            </span>
          }
        </div>

        <!-- Links -->
        @if (project().githubUrl || project().demoUrl) {
          <div class="mt-4 flex gap-3 pt-3" style="border-top: 1px solid var(--border);">
            @if (project().githubUrl) {
              <a [href]="project().githubUrl" target="_blank" rel="noopener noreferrer"
                 class="card-link text-xs transition-colors"
                 (click)="$event.stopPropagation()">
                GitHub ↗
              </a>
            }
            @if (project().demoUrl) {
              <a [href]="project().demoUrl" target="_blank" rel="noopener noreferrer"
                 class="card-link text-xs transition-colors"
                 (click)="$event.stopPropagation()">
                Demo ↗
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();
}
