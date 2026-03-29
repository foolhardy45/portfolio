import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({
  selector: '[appGlowCard]',
  host: {
    class: 'glow-card-spotlight',
  },
})
export class GlowCardDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  public readonly glowIntensity = input(0.15);

  @HostListener('mouseenter')
  onEnter(): void {
    this.el.nativeElement.style.setProperty('--spotlight-opacity', '1');
    this.el.nativeElement.style.setProperty(
      '--spotlight-intensity',
      String(this.glowIntensity()),
    );
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.el.nativeElement.style.setProperty('--spotlight-opacity', '0');
  }

  @HostListener('mousemove', ['$event'])
  onMove(e: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.el.nativeElement.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
    this.el.nativeElement.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
  }
}
