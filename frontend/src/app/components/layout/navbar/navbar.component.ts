import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  lucideSun,
  lucideMoon,
  lucideMenu,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgIcon, ...HlmButtonImports],
  template: `
    <nav class="border-border/40 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <!-- Logo -->
        <a routerLink="/" class="text-lg font-bold tracking-tight">
          Tayrell
        </a>

        <!-- Desktop nav -->
        <div class="hidden items-center gap-1 md:flex">
          @for (link of navLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="bg-accent text-accent-foreground"
              [routerLinkActiveOptions]="{ exact: link.path === '/' }"
              hlmBtn
              variant="ghost"
              size="sm"
            >
              {{ link.label }}
            </a>
          }
          <button
            hlmBtn
            variant="ghost"
            size="icon"
            (click)="themeService.toggle()"
            [attr.aria-label]="themeService.darkMode() ? 'Passer au mode clair' : 'Passer au mode sombre'"
          >
            @if (themeService.darkMode()) {
              <ng-icon [svg]="sunIcon" class="text-base" />
            } @else {
              <ng-icon [svg]="moonIcon" class="text-base" />
            }
          </button>
        </div>

        <!-- Mobile buttons -->
        <div class="flex items-center gap-1 md:hidden">
          <button
            hlmBtn
            variant="ghost"
            size="icon"
            (click)="themeService.toggle()"
            [attr.aria-label]="themeService.darkMode() ? 'Passer au mode clair' : 'Passer au mode sombre'"
          >
            @if (themeService.darkMode()) {
              <ng-icon [svg]="sunIcon" class="text-base" />
            } @else {
              <ng-icon [svg]="moonIcon" class="text-base" />
            }
          </button>
          <button
            hlmBtn
            variant="ghost"
            size="icon"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            aria-label="Menu"
          >
            @if (mobileMenuOpen()) {
              <ng-icon [svg]="closeIcon" class="text-base" />
            } @else {
              <ng-icon [svg]="menuIcon" class="text-base" />
            }
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileMenuOpen()) {
        <div class="border-border/40 border-t px-4 pb-4 md:hidden">
          <div class="flex flex-col gap-1 pt-2">
            @for (link of navLinks; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-accent text-accent-foreground"
                [routerLinkActiveOptions]="{ exact: link.path === '/' }"
                hlmBtn
                variant="ghost"
                class="justify-start"
                (click)="mobileMenuOpen.set(false)"
              >
                {{ link.label }}
              </a>
            }
          </div>
        </div>
      }
    </nav>
  `,
})
export class NavbarComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly mobileMenuOpen = signal(false);

  protected readonly sunIcon = lucideSun;
  protected readonly moonIcon = lucideMoon;
  protected readonly menuIcon = lucideMenu;
  protected readonly closeIcon = lucideX;

  protected readonly navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/projects', label: 'Projets' },
    { path: '/about', label: 'À propos' },
    { path: '/hobbies', label: 'Hobbies' },
    { path: '/contact', label: 'Contact' },
  ];
}
