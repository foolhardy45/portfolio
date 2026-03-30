import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { GlowCardDirective } from '../../directives/glow-card.directive';

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, GlowCardDirective],
  template: `
    <section class="min-h-screen px-4 sm:px-6 lg:px-8 py-20 max-w-5xl mx-auto">

      <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          style="font-family: 'Syne', sans-serif; color: var(--foreground);">
        Contact
      </h1>
      <p class="text-lg mb-12" style="color: var(--muted-foreground);">
        Un projet en tête ? Discutons-en.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-8">

        <!-- INFO COLUMN (2/5) -->
        <div class="md:col-span-2 space-y-4">
          <div appGlowCard class="card-glow rounded-2xl p-6"
               style="background-color: var(--card); border: 1px solid var(--border);">
            <p class="text-sm" style="color: var(--muted-foreground);">Email</p>
            <p class="text-sm mt-1" style="color: var(--foreground);">tayrellajincapro@gmail.com</p>
          </div>

          <div appGlowCard class="card-glow rounded-2xl p-6"
               style="background-color: var(--card); border: 1px solid var(--border);">
            <p class="text-sm" style="color: var(--muted-foreground);">Réseaux</p>
            <div class="flex gap-4 mt-2">
              <a href="https://github.com/foolhardy45" target="_blank" rel="noopener noreferrer"
                 class="card-link text-sm underline underline-offset-4 decoration-1 hover:decoration-2 transition-colors"
                 style="color: var(--primary);">GitHub ↗</a>
              <a href="https://linkedin.com/in/tayrell-ajinca" target="_blank" rel="noopener noreferrer"
                 class="card-link text-sm underline underline-offset-4 decoration-1 hover:decoration-2 transition-colors"
                 style="color: var(--primary);">LinkedIn ↗</a>
            </div>
          </div>

          <div appGlowCard class="card-glow rounded-2xl p-6"
               style="background-color: var(--card); border: 1px solid var(--border);">
            <p class="text-sm" style="color: var(--muted-foreground);">Disponibilité</p>
            <div class="flex items-center gap-2 mt-2">
              <div class="h-2 w-2 rounded-full" style="background-color: var(--success);"></div>
              <span class="text-sm" style="color: var(--foreground);">Recherche une alternance pour 2026-2027</span>
            </div>
          </div>
        </div>

        <!-- FORM COLUMN (3/5) -->
        <div class="md:col-span-3">
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()"
                appGlowCard class="card-glow rounded-2xl p-8"
                style="background-color: var(--card); border: 1px solid var(--border);">

            <div class="space-y-5">
              <!-- Name -->
              <div>
                <label for="contact-name" class="mb-1.5 block text-sm" style="color: var(--muted-foreground);">Nom</label>
                <input id="contact-name" formControlName="name" type="text" placeholder="Votre nom"
                       class="contact-input w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all">
                @if (contactForm.get('name')?.invalid && contactForm.get('name')?.touched) {
                  <p class="mt-1 text-xs" class="form-error-text">Nom requis (2 caractères minimum)</p>
                }
              </div>

              <!-- Email -->
              <div>
                <label for="contact-email" class="mb-1.5 block text-sm" style="color: var(--muted-foreground);">Email</label>
                <input id="contact-email" formControlName="email" type="email" placeholder="votre&#64;email.com"
                       class="contact-input w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all">
                @if (contactForm.get('email')?.invalid && contactForm.get('email')?.touched) {
                  <p class="mt-1 text-xs" class="form-error-text">Email valide requis</p>
                }
              </div>

              <!-- Message -->
              <div>
                <label for="contact-message" class="mb-1.5 block text-sm" style="color: var(--muted-foreground);">Message</label>
                <textarea id="contact-message" formControlName="message" rows="5" placeholder="Votre message..."
                          class="contact-input w-full resize-none rounded-lg px-4 py-2.5 text-sm outline-none transition-all">
                </textarea>
                @if (contactForm.get('message')?.invalid && contactForm.get('message')?.touched) {
                  <p class="mt-1 text-xs" class="form-error-text">Message requis (10 caractères minimum)</p>
                }
              </div>

              <!-- Submit -->
              <button type="submit" [disabled]="contactForm.invalid || loading()"
                      class="w-full rounded-lg py-2.5 text-sm font-medium transition-all disabled:opacity-50 shadow-sm hover:opacity-90 active:scale-95"
                      style="background-color: var(--primary); color: var(--primary-foreground);">
                {{ loading() ? 'Envoi en cours...' : 'Envoyer le message →' }}
              </button>
            </div>

            <!-- Success -->
            @if (success()) {
              <div class="form-feedback-success mt-4 rounded-lg p-4 text-sm">
                Message envoyé avec succès !
              </div>
            }

            <!-- Error -->
            @if (error()) {
              <div class="form-feedback-error mt-4 rounded-lg p-4 text-sm">
                {{ error() }}
              </div>
            }

          </form>
        </div>

      </div>
    </section>
  `,
})
export class ContactPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  protected readonly loading = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
  });

  protected onSubmit(): void {
    if (this.contactForm.invalid) return;

    this.loading.set(true);
    this.success.set(false);
    this.error.set(null);

    this.api.sendContactMessage(this.contactForm.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.contactForm.reset();
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message || 'Une erreur est survenue, réessayez.');
      },
    });
  }
}
