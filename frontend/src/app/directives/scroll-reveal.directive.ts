import {
  Directive, ElementRef, inject, input,
  afterNextRender, DestroyRef,
} from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollRevealDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  public readonly delay = input(0);
  public readonly once = input(true);

  constructor() {
    afterNextRender(() => {
      const element = this.el.nativeElement;
      const delayMs = this.delay();
      const triggerOnce = this.once();

      // Initial hidden state
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = `opacity 0.5s ease-out ${delayMs}ms, transform 0.5s ease-out ${delayMs}ms`;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              element.style.opacity = '1';
              element.style.transform = 'translateY(0)';
              if (triggerOnce) observer.unobserve(element);
            } else if (!triggerOnce) {
              element.style.opacity = '0';
              element.style.transform = 'translateY(20px)';
            }
          }
        },
        { threshold: 0.15 },
      );

      observer.observe(element);

      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
