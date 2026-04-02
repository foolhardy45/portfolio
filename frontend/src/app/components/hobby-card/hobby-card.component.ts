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
      class="hobby-card hobby-card-spotlight corner-bracket bento-card"
      [style.--card-accent]="accentColor()"
      [style.--card-accent-glow]="accentGlow()"
      [style.animation-delay]="animDelay()"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()">

      <!-- LAYER 1: Low Poly SVG background -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden opacity-20 md:opacity-40">
        <svg [innerHTML]="svgIcon()" class="w-full h-full"></svg>
      </div>

      <!-- LAYER 2: Scanline sweep animation -->
      <div class="absolute inset-0 pointer-events-none"
           style="animation: scanline-sweep 8s ease-in-out infinite">
        <div class="w-full h-px" [style.background]="accentColor()" style="opacity: 0.04"></div>
      </div>

      <!-- LAYER 3: Tech Specs label (top-left) -->
      <span class="tech-specs-label absolute top-5 left-6 z-10">
        {{ techId() }} // {{ label() | uppercase }}
      </span>

      <!-- LAYER 4: Floating Tech Specs data (right side, scrolling) -->
      <div class="absolute top-12 right-4 z-10 overflow-hidden h-32 w-20 pointer-events-none hidden md:block">
        <div class="font-mono text-[8px] leading-[14px] opacity-[0.12] whitespace-nowrap"
             [style.color]="accentColor()"
             style="animation: data-scroll 20s linear infinite">
          <div>SYS.LOAD 0.847</div>
          <div>MEM.ALLOC 2.4GB</div>
          <div>FREQ 144Hz</div>
          <div>PING 12ms</div>
          <div>RENDER OK</div>
          <div>VSYNC ON</div>
          <div>GPU 78°C</div>
          <div>FPS 240</div>
          <div>NET.UP ▲</div>
          <div>CACHE HIT</div>
          <!-- Duplicated for infinite scroll -->
          <div>SYS.LOAD 0.847</div>
          <div>MEM.ALLOC 2.4GB</div>
          <div>FREQ 144Hz</div>
          <div>PING 12ms</div>
          <div>RENDER OK</div>
          <div>VSYNC ON</div>
          <div>GPU 78°C</div>
          <div>FPS 240</div>
          <div>NET.UP ▲</div>
          <div>CACHE HIT</div>
        </div>
      </div>

      <!-- LAYER 5: Main content (bottom of card) -->
      <div class="relative z-10 flex flex-col justify-end h-full p-6 pt-20">
        <!-- Title -->
        <h3 class="font-display text-3xl md:text-4xl font-extrabold tracking-tighter shibuya-glitch-text"
            style="color: var(--foreground)"
            [attr.data-text]="title()">
          {{ title() }}
        </h3>

        <!-- Accent line under title -->
        <div class="h-[3px] w-10 rounded-full mt-2 mb-3"
             [style.background]="accentColor()"></div>

        <!-- Description -->
        <p class="text-sm leading-relaxed" style="color: var(--muted-foreground)">
          {{ description() }}
        </p>

        <!-- Tags -->
        <div class="flex flex-wrap gap-2 mt-4">
          @for (tag of tags(); track tag) {
            <span class="hobby-tag">{{ tag }}</span>
          }
        </div>
      </div>

      <!-- LAYER 6: Coordinate overlay (bottom-right, Tech Specs) -->
      <span class="absolute bottom-3 right-4 font-mono text-[9px] z-10 opacity-20"
            [style.color]="accentColor()">
        {{ techId() }}.ACTIVE
      </span>
    </article>
  `,
})
export class HobbyCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly techId = input.required<string>();
  readonly label = input.required<string>();
  readonly accentColor = input.required<string>();
  readonly accentGlow = input.required<string>();
  readonly tags = input.required<string[]>();
  readonly svgIcon = input.required<string>();
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
