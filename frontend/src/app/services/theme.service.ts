import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _darkMode = signal(false);

  public readonly darkMode = this._darkMode.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._darkMode.set(stored === 'dark' || (!stored && prefersDark));
    }

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const html = document.documentElement;
        if (this._darkMode()) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
        localStorage.setItem('theme', this._darkMode() ? 'dark' : 'light');
      }
    });
  }

  toggle(): void {
    this._darkMode.update((v) => !v);
  }
}
