import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _theme = signal<Theme>('dark');

  public readonly theme = this._theme.asReadonly();
  public readonly darkMode = () => this._theme() === 'dark';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('theme') as Theme | null;
      // Dark by default — only switch to light if explicitly stored
      this._theme.set(stored === 'light' ? 'light' : 'dark');
    }

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const html = document.documentElement;
        const current = this._theme();
        html.classList.toggle('dark', current === 'dark');
        html.classList.toggle('light', current === 'light');
        localStorage.setItem('theme', current);
      }
    });
  }

  toggle(): void {
    this._theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }
}
