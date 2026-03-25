import {
  Component, ElementRef, inject, signal,
  viewChildren, afterNextRender,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { lucideSun, lucideMoon, lucideMenu } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink, RouterLinkActive, NgIcon,
    ...HlmButtonImports, ...HlmSheetImports,
  ],
  template: `
    <nav
      class="fixed top-0 z-50 w-full transition-all duration-300"
      [class.nav-scrolled]="scrolled()"
    >
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">

        <!-- Logo -->
        <a
          routerLink="/"
          class="font-display text-xl font-bold tracking-tight text-foreground transition-colors duration-200 hover:text-primary"
        >
          Tayrell
        </a>

        <!-- Desktop center nav -->
        <div class="hidden md:flex">
          <div class="relative flex items-center">
            @for (link of navLinks; track link.path) {
              <a
                #navLink
                [routerLink]="link.path"
                routerLinkActive="!text-foreground"
                class="text-muted-foreground hover:text-foreground relative px-4 py-2 text-sm font-medium transition-colors duration-200"
              >
                {{ link.label }}
              </a>
            }

            <!-- Sliding amber dot indicator -->
            <span
              class="bg-primary absolute -bottom-1 h-0.5 rounded-full transition-all duration-300 ease-out"
              [class.opacity-0]="dotWidth() === 0"
              [style.left.px]="dotLeft()"
              [style.width.px]="dotWidth()"
            ></span>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-1">
          <!-- Theme toggle -->
          <button
            hlmBtn variant="ghost" size="icon"
            (click)="themeService.toggle()"
            [attr.aria-label]="themeService.darkMode() ? 'Passer au mode clair' : 'Passer au mode sombre'"
            class="text-muted-foreground hover:text-foreground"
          >
            @if (themeService.darkMode()) {
              <ng-icon [svg]="sunIcon" />
            } @else {
              <ng-icon [svg]="moonIcon" />
            }
          </button>

          <!-- Mobile: Sheet menu -->
          <hlm-sheet class="md:hidden">
            <button
              hlmSheetTrigger side="right"
              hlmBtn variant="ghost" size="icon"
              class="text-muted-foreground hover:text-foreground"
              aria-label="Menu de navigation"
            >
              <ng-icon [svg]="menuIcon" />
            </button>
            <ng-template hlmSheetPortal>
              <hlm-sheet-content>
                <div hlmSheetHeader>
                  <h3 hlmSheetTitle class="font-display">Navigation</h3>
                </div>
                <nav class="flex flex-col gap-1 px-4 pt-2">
                  @for (link of mobileNavLinks; track link.path) {
                    <button
                      hlmSheetClose
                      (click)="navigateTo(link.path)"
                      class="text-muted-foreground hover:text-foreground hover:bg-secondary flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors"
                    >
                      {{ link.label }}
                    </button>
                  }
                </nav>
              </hlm-sheet-content>
            </ng-template>
          </hlm-sheet>
        </div>

      </div>
    </nav>
  `,
})
export class NavbarComponent {
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly scrolled = signal(false);
  protected readonly dotLeft = signal(0);
  protected readonly dotWidth = signal(0);

  private readonly navLinkElements = viewChildren<ElementRef>('navLink');

  protected readonly sunIcon = lucideSun;
  protected readonly moonIcon = lucideMoon;
  protected readonly menuIcon = lucideMenu;

  protected readonly navLinks = [
    { path: '/projets', label: 'Projets' },
    { path: '/a-propos', label: 'À propos' },
    { path: '/hobbies', label: 'Hobbies' },
    { path: '/contact', label: 'Contact' },
  ];

  protected readonly mobileNavLinks = [
    { path: '/', label: 'Accueil' },
    ...this.navLinks,
  ];

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => {
      setTimeout(() => this.updateDotPosition(), 50);
    });

    afterNextRender(() => {
      this.updateDotPosition();

      window.addEventListener('scroll', () => {
        this.scrolled.set(window.scrollY > 20);
      }, { passive: true });

      window.addEventListener('resize', () => {
        this.updateDotPosition();
      }, { passive: true });
    });
  }

  protected navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  private updateDotPosition(): void {
    const links = this.navLinkElements();
    const url = this.router.url.split('?')[0];
    const activeIndex = this.navLinks.findIndex(
      (l) => url === l.path || url.startsWith(l.path + '/'),
    );

    if (activeIndex >= 0 && links[activeIndex]) {
      const el = links[activeIndex].nativeElement as HTMLElement;
      this.dotLeft.set(el.offsetLeft);
      this.dotWidth.set(el.offsetWidth);
    } else {
      this.dotWidth.set(0);
    }
  }
}
