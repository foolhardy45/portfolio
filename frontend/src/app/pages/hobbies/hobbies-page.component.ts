import { Component } from '@angular/core';
import { GlowCardDirective } from '../../directives/glow-card.directive';

@Component({
  selector: 'app-hobbies-page',
  imports: [GlowCardDirective],
  template: `
    <section class="min-h-screen px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">

      <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          style="font-family: 'Syne', sans-serif; color: var(--foreground);">
        Hobbies
      </h1>
      <p class="text-lg mb-12" style="color: var(--muted-foreground);">Quand je ne code pas.</p>

      <!-- BENTO GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[220px]">

        <!-- VOLLEY — span 2 cols -->
        <div class="md:col-span-2 rounded-2xl p-8 flex flex-col justify-between card-glow"
             appGlowCard style="background-color: var(--card); border: 1px solid var(--border);">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">🏐</span>
              <h2 class="text-xl font-bold" style="font-family: 'Syne', sans-serif; color: var(--foreground);">
                Volley-ball
              </h2>
            </div>
            <p class="text-sm leading-relaxed max-w-lg" style="color: var(--muted-foreground);">
              Sport d'équipe que je pratique depuis plusieurs mois. Le volley m'apporte la rigueur collective,
              le dépassement de soi et un vrai esprit de compétition.
            </p>
          </div>
        </div>

        <!-- GAMING — 1 col -->
        <div class="rounded-2xl p-8 flex flex-col justify-between card-glow"
             appGlowCard style="background-color: var(--card); border: 1px solid var(--border);">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">🎮</span>
              <h2 class="text-xl font-bold" style="font-family: 'Syne', sans-serif; color: var(--foreground);">
                Gaming
              </h2>
            </div>
            <p class="text-sm leading-relaxed" style="color: var(--muted-foreground);">
              Passionné de jeux vidéo, entre compétition en ligne et aventures solo.
            </p>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            @for (game of games; track game) {
              <span class="px-2 py-0.5 rounded text-xs"
                    style="background-color: var(--secondary); color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;">
                {{ game }}
              </span>
            }
          </div>
        </div>

        <!-- MANGA — 1 col -->
        <div class="rounded-2xl p-8 flex flex-col justify-between card-glow"
             appGlowCard style="background-color: var(--card); border: 1px solid var(--border);">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">📚</span>
              <h2 class="text-xl font-bold" style="font-family: 'Syne', sans-serif; color: var(--foreground);">
                Manga
              </h2>
            </div>
            <p class="text-sm leading-relaxed" style="color: var(--muted-foreground);">
              Grand lecteur de manga, du shonen classique aux seinen plus matures.
            </p>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            @for (manga of mangas; track manga) {
              <span class="px-2 py-0.5 rounded text-xs"
                    style="background-color: var(--secondary); color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;">
                {{ manga }}
              </span>
            }
          </div>
        </div>

        <!-- MUSIQUE — span 2 cols -->
        <div class="md:col-span-2 rounded-2xl p-8 flex flex-col justify-between card-glow"
             appGlowCard style="background-color: var(--card); border: 1px solid var(--border);">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">🎵</span>
              <h2 class="text-xl font-bold" style="font-family: 'Syne', sans-serif; color: var(--foreground);">
                Musique
              </h2>
            </div>
            <p class="text-sm leading-relaxed max-w-lg" style="color: var(--muted-foreground);">
              La musique fait partie de mon quotidien — écoute, découverte et production.
            </p>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            @for (genre of genres; track genre) {
              <span class="px-2 py-0.5 rounded text-xs"
                    style="background-color: var(--secondary); color: var(--muted-foreground); font-family: 'JetBrains Mono', monospace;">
                {{ genre }}
              </span>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HobbiesPageComponent {
  protected readonly games = ['Valorant', 'League of Legends', 'Dead Cells', 'Guilty Gear Strive'];
  protected readonly mangas = ['One Piece', 'Jujutsu Kaisen', 'Vinland Saga'];
  protected readonly genres = ['Rock', 'Electro', 'Jungle', 'Drill'];
}
