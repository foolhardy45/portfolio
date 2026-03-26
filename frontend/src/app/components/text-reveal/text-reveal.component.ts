import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-text-reveal',
  template: `
    <span aria-label="{{ text() }}">
      @for (letter of letters(); track $index) {
        <span
          class="letter-reveal"
          [style.animation-delay]="speed() * $index + 'ms'"
          [attr.aria-hidden]="true"
        >{{ letter === ' ' ? '\u00A0' : letter }}</span>
      }
    </span>
  `,
  host: { style: 'display: inline' },
})
export class TextRevealComponent {
  readonly text = input.required<string>();
  readonly speed = input(60);

  protected readonly letters = computed(() => this.text().split(''));
}
