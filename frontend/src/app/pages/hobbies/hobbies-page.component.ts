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
        <span class="tech-specs-label">PAGE_04 // HOBBIES</span>

        <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mt-3 letter-reveal"
            style="color: var(--foreground)">
          Mes Passions
        </h1>

        <div class="h-1 w-20 rounded-full mt-4"
             style="background-color: var(--primary)"></div>

        <p class="text-lg mt-4 max-w-xl fade-in"
           style="color: var(--muted-foreground)">
          Ce qui m'anime en dehors du code.
        </p>
      </header>

      <!-- BENTO GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        @for (hobby of hobbies; track hobby.techId) {
          <app-hobby-card
            [class]="'grid min-h-[320px] lg:min-h-[400px] ' + hobby.gridClass"
            [title]="hobby.title"
            [description]="hobby.description"
            [techId]="hobby.techId"
            [label]="hobby.label"
            [tags]="hobby.tags"
            [accentColor]="hobby.accentColor"
            [accentGlow]="hobby.accentGlow"
            [svgIcon]="hobby.svg"
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
    },
  ];
}
