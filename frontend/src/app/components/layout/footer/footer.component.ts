import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideGithub, lucideLinkedin, lucideMail } from '@ng-icons/lucide';

@Component({
  selector: 'app-footer',
  imports: [NgIcon],
  template: `
    <footer class="border-border/40 relative border-t" style="box-shadow: 0 -1px 8px var(--glow)">
      <div class="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between lg:px-8">
        <p class="text-muted-foreground text-sm">
          &copy; {{ currentYear }} Tayrell Ajinca
        </p>
        <div class="flex items-center gap-5">
          @for (link of socialLinks; track link.label) {
            <a
              [href]="link.href"
              [target]="link.external ? '_blank' : '_self'"
              [rel]="link.external ? 'noopener noreferrer' : ''"
              class="text-muted-foreground hover:text-primary transition-colors duration-200"
              [attr.aria-label]="link.label"
            >
              <ng-icon [svg]="link.icon" class="text-lg" />
            </a>
          }
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly socialLinks = [
    { href: 'https://github.com/foolhardy45', icon: lucideGithub, label: 'GitHub', external: true },
    { href: 'https://linkedin.com/in/tayrell-ajinca', icon: lucideLinkedin, label: 'LinkedIn', external: true },
    { href: 'mailto:tayrellajincapro@gmail.com', icon: lucideMail, label: 'Email', external: false },
  ];
}
