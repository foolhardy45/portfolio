import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-hobby-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe],
  template: `
    <article
      class="hobby-card hobby-card-spotlight"
      [style.--card-accent]="accentColor()"
      [style.--card-accent-glow]="accentGlow()"
      [style.--stagger]="animDelay()"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()">

      <!-- HUD grid background -->
      <div class="hud-grid-bg"></div>

      <!-- Low Poly SVG illustration -->
      <div class="hobby-svg-layer absolute pointer-events-none"
           style="right: -5%; top: 5%; width: 65%; height: 75%"
           [style.filter]="'drop-shadow(0 0 16px ' + accentGlow() + ')'">
        <svg [innerHTML]="svgIcon()" class="w-full h-full"></svg>
      </div>

      <!-- Scanline sweep -->
      <div class="hud-scanline"
           [style.background]="'linear-gradient(90deg, transparent 0%, ' + accentColor() + ' 20%, ' + accentColor() + ' 80%, transparent 100%)'"
           [style.box-shadow]="'0 0 10px ' + accentGlow()"
           style="animation: scanline-sweep 6s ease-in-out infinite"></div>

      <!-- 4 HUD corner brackets -->
      <div class="hud-bracket hud-bracket--tl"></div>
      <div class="hud-bracket hud-bracket--tr"></div>
      <div class="hud-bracket hud-bracket--bl"></div>
      <div class="hud-bracket hud-bracket--br"></div>

      <!-- Tech Specs label (top-left) -->
      <span class="tech-specs-label absolute top-5 left-6 z-10">
        {{ techId() }} // {{ label() | uppercase }}
      </span>

      <!-- HUD data column (right side, scrolling) -->
      <div class="hud-data-col hidden md:block"
           [style.text-shadow]="'0 0 4px ' + accentGlow()">
        <div class="hud-data-scroll">
          @for (line of hudLines(); track $index) {
            <div>{{ line }}</div>
          }
          @for (line of hudLines(); track $index) {
            <div>{{ line }}</div>
          }
        </div>
      </div>

      <!-- Main content (bottom of card) -->
      <div class="relative z-10 flex flex-col justify-end h-full p-6 pt-20">
        <h3 class="font-display text-3xl md:text-4xl font-extrabold tracking-tighter shibuya-glitch-text"
            style="color: var(--foreground)"
            [attr.data-text]="title()">
          {{ title() }}
        </h3>

        <div class="h-[3px] w-10 rounded-full mt-2 mb-3"
             [style.background]="accentColor()"></div>

        <div class="flex flex-wrap gap-2 mt-4">
          @for (tag of tags(); track tag) {
            <span class="hobby-tag">{{ tag }}</span>
          }
        </div>
      </div>

      <!-- Diagonal stripe — Shibuya graffiti slash -->
      <div class="shibuya-stripe"
           [style.background]="'linear-gradient(90deg, transparent, ' + accentColor() + ' 20%, ' + accentColor() + ' 80%, transparent)'"></div>

      <!-- Grain noise overlay -->
      <div class="shibuya-grain"></div>

      <!-- Coordinate overlay (bottom-right) -->
      <span class="absolute bottom-3 right-4 font-mono text-[9px] z-10 opacity-20"
            [style.color]="accentColor()">
        {{ techId() }}.ACTIVE
      </span>
    </article>
  `,
})
export class HobbyCardComponent {
  readonly title = input.required<string>();
  readonly techId = input.required<string>();
  readonly label = input.required<string>();
  readonly accentColor = input.required<string>();
  readonly accentGlow = input.required<string>();
  readonly tags = input.required<string[]>();
  readonly svgIcon = input.required<string>();
  readonly hudLines = input.required<string[]>();
  readonly animDelay = input('0s');

  private cardEl: HTMLElement | null = null;

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    this.cardEl = el;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
    el.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
    el.style.setProperty('--spotlight-opacity', '1');
  }

  onMouseLeave(): void {
    this.cardEl?.style.setProperty('--spotlight-opacity', '0');
  }
}
