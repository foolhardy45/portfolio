import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideGithub, lucideLinkedin, lucideMail } from '@ng-icons/lucide';

@Component({
  selector: 'app-footer',
  imports: [NgIcon],
  template: `
    <footer class="border-border/40 border-t">
      <div class="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <p class="text-muted-foreground text-sm">
          &copy; {{ currentYear }} Tayrell Ajinca. Tous droits réservés.
        </p>
        <div class="flex gap-4">
          <a
            href="https://github.com/tayrell"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <ng-icon [svg]="githubIcon" class="text-xl" />
          </a>
          <a
            href="https://linkedin.com/in/tayrell-ajinca"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="LinkedIn"
          >
            <ng-icon [svg]="linkedinIcon" class="text-xl" />
          </a>
          <a
            href="mailto:contact@tayrell.dev"
            class="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Email"
          >
            <ng-icon [svg]="mailIcon" class="text-xl" />
          </a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();
  protected readonly githubIcon = lucideGithub;
  protected readonly linkedinIcon = lucideLinkedin;
  protected readonly mailIcon = lucideMail;
}
