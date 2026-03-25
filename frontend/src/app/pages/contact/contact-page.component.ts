import { Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-contact-page',
  imports: [...HlmButtonImports],
  template: `
    <section class="mx-auto max-w-lg px-4 py-16">
      <h1 class="mb-2 text-3xl font-bold tracking-tight">Contact</h1>
      <p class="text-muted-foreground mb-8">
        Une question ou une proposition ? N'hésitez pas à me contacter.
      </p>
      <form class="space-y-4">
        <div>
          <label for="name" class="mb-1 block text-sm font-medium">Nom</label>
          <input
            id="name"
            type="text"
            placeholder="Votre nom"
            class="border-input bg-background ring-ring/10 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label for="email" class="mb-1 block text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            placeholder="votre@email.com"
            class="border-input bg-background ring-ring/10 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label for="message" class="mb-1 block text-sm font-medium">Message</label>
          <textarea
            id="message"
            rows="5"
            placeholder="Votre message..."
            class="border-input bg-background ring-ring/10 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          ></textarea>
        </div>
        <button hlmBtn type="submit" class="w-full">Envoyer</button>
      </form>
    </section>
  `,
})
export class ContactPageComponent {}
