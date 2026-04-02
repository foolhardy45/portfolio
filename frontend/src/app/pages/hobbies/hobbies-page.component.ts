import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HobbyCardComponent } from '../../components/hobby-card/hobby-card.component';
import { LowPolySvgService, type HobbyType } from '../../services/low-poly-svg.service';

interface HobbyData {
  type: HobbyType;
  title: string;
  description: string;
  techId: string;
  label: string;
  tags: string[];
  accentColor: string;
  accentGlow: string;
  gridClass: string;
  animDelay: string;
  svg: string;
  hudLines: string[];
}

@Component({
  selector: 'app-hobbies-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HobbyCardComponent],
  template: `
    <section class="min-h-screen px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto"
             aria-label="Mes passions et hobbies">

      <!-- HEADER -->
      <header class="mb-12">
        <span class="tech-specs-label fade-in" style="animation-delay: 0.5s">
          PAGE_04 // HOBBIES
        </span>

        <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mt-3 letter-reveal shibuya-glitch-text"
            style="color: var(--foreground)"
            data-text="Mes Passions">
          Mes Passions
        </h1>

        <div class="h-1 w-20 rounded-full mt-4"
             style="background-color: var(--primary)"></div>

        <!-- Shibuya gradient stripe -->
        <div class="h-1 w-48 md:w-72 rounded-sm mt-3 fade-in"
             style="background: linear-gradient(90deg, #06b6d4 0%, #ec4899 50%, #f59e0b 100%); opacity: 0.6; transform: rotate(-2deg); animation-delay: 0.3s"></div>

        <p class="text-lg mt-4 max-w-xl fade-in"
           style="color: var(--muted-foreground)">
          Ce qui m'anime en dehors du code.
        </p>
      </header>

      <!-- BENTO GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        @for (hobby of hobbies; track hobby.techId) {
          <app-hobby-card
            [class]="'grid min-h-[280px] lg:min-h-[400px] ' + hobby.gridClass"
            [title]="hobby.title"
            [description]="hobby.description"
            [techId]="hobby.techId"
            [label]="hobby.label"
            [tags]="hobby.tags"
            [accentColor]="hobby.accentColor"
            [accentGlow]="hobby.accentGlow"
            [svgIcon]="hobby.svg"
            [hudLines]="hobby.hudLines"
            [animDelay]="hobby.animDelay" />
        }
      </div>

      <!-- BOTTOM -->
      <footer class="mt-16 text-center">
        <span class="tech-specs-label" style="opacity: 0.3">
          END_OF_PAGE // 4 HOBBIES LOADED
        </span>
      </footer>

    </section>
  `,
})
export class HobbiesPageComponent {
  private readonly svgService = inject(LowPolySvgService);

  protected readonly hobbies: readonly HobbyData[] = [
    {
      type: 'gaming',
      title: 'GAMING',
      description: 'FPS compétitif, RPG japonais, roguelikes. Du skill et des histoires qui marquent.',
      techId: 'HOBBY_01',
      label: 'Gaming',
      tags: ['Valorant', 'Elden Ring', 'Hades', 'Zelda'],
      accentColor: 'var(--hobby-cyan)',
      accentGlow: 'var(--hobby-cyan-glow)',
      gridClass: 'lg:col-span-7',
      animDelay: '0s',
      svg: this.svgService.generateHobbySvg('gaming', 'var(--hobby-cyan)'),
      hudLines: ['FPS 240', 'RANK S+', 'KDA 3.2', 'PING 12ms', 'SENS 0.45', 'GPU 98%', 'VRAM 6G', 'TICK 128', 'WIN 67%', 'SKILL A+'],
    },
    {
      type: 'manga',
      title: 'MANGA',
      description: "Shonen, seinen, slice of life. Des récits qui repoussent les limites de l'imagination.",
      techId: 'HOBBY_02',
      label: 'Manga & Anime',
      tags: ['One Piece', 'JJK', 'Chainsaw Man'],
      accentColor: 'var(--hobby-magenta)',
      accentGlow: 'var(--hobby-magenta-glow)',
      gridClass: 'lg:col-span-5',
      animDelay: '0.1s',
      svg: this.svgService.generateHobbySvg('manga', 'var(--hobby-magenta)'),
      hudLines: ['VOL 104', 'CH 1089', 'READ 847h', 'RATE 9.8', 'ARC 11', 'SHELF 3m', 'SCAN HQ', 'FAVE \u221E', 'TIER S', 'NEW \u25B2'],
    },
    {
      type: 'volley',
      title: 'VOLLEY',
      description: "Esprit d'équipe, compétition, dépassement. Sur le terrain comme dans le code.",
      techId: 'HOBBY_03',
      label: 'Volleyball',
      tags: ['Compétition', 'Équipe', 'Terrain'],
      accentColor: 'var(--hobby-lime)',
      accentGlow: 'var(--hobby-lime-glow)',
      gridClass: 'lg:col-span-5',
      animDelay: '0.2s',
      svg: this.svgService.generateHobbySvg('volley', 'var(--hobby-lime)'),
      hudLines: ['SPIKE 87%', 'SET 94%', 'BLOCK 12', 'ACE 8', 'DIG 23', 'JUMP 89cm', 'POWER 7.2', 'REACT 0.3s', 'WIN \u25B2', 'TEAM 6'],
    },
    {
      type: 'musique',
      title: 'MUSIQUE',
      description: 'Rap FR, hip-hop US, lo-fi, afrobeats. Le son qui accompagne chaque session de code.',
      techId: 'HOBBY_04',
      label: 'Musique',
      tags: ['Rap FR', 'Hip-Hop', 'Lo-Fi', 'Afrobeats'],
      accentColor: 'var(--primary)',
      accentGlow: 'var(--glow)',
      gridClass: 'lg:col-span-7',
      animDelay: '0.3s',
      svg: this.svgService.generateHobbySvg('musique', 'var(--primary)'),
      hudLines: ['BPM 140', 'VOL -6dB', 'FREQ 44k', 'BIT 24', 'TRKS 2847', 'BASS \u2593\u2593\u2593', 'MID \u2593\u2593\u2591', 'EQ FLAT', 'LOOP ON', 'VIBE \u221E'],
    },
  ];
}
