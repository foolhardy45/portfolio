import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <!-- Skip to content -->
    <a href="#main-content"
       class="skip-link">
      Aller au contenu principal
    </a>

    <div class="bg-grid-dots relative flex min-h-dvh flex-col">
      <app-navbar />
      <main id="main-content" role="main" class="flex-1 pt-16">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class App {
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.route),
      map((r) => { while (r.firstChild) r = r.firstChild; return r; }),
      mergeMap((r) => r.data),
      takeUntilDestroyed(),
    ).subscribe((data) => {
      const desc = data['description'] as string | undefined;
      if (desc) {
        this.meta.updateTag({ name: 'description', content: desc });
      }
    });
  }
}
