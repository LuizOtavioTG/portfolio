import { Directive, ElementRef, NgZone, OnDestroy, OnInit, input } from '@angular/core';
import { gsap } from 'gsap';

@Directive({
  selector: '[appHoverLift]',
})
export class HoverLift implements OnInit, OnDestroy {
  readonly y = input(-4, { alias: 'appHoverLiftY' });
  readonly scale = input(1, { alias: 'appHoverLiftScale' });
  readonly borderColor = input('rgba(185, 255, 190, 0.42)', { alias: 'appHoverLiftBorderColor' });
  readonly boxShadow = input(
    '0 0 0 1px rgba(185, 255, 190, 0.34), 0 16px 38px rgba(0, 0, 0, 0.28)',
    { alias: 'appHoverLiftShadow' },
  );
  readonly duration = input(0.18, { alias: 'appHoverLiftDuration' });

  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private removeListeners?: () => void;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    const element = this.elementRef.nativeElement;

    if (this.prefersReducedMotion.matches) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const enter = (): void => {
        gsap.to(element, {
          y: this.y(),
          scale: this.scale(),
          borderColor: this.borderColor(),
          boxShadow: this.boxShadow(),
          duration: this.duration(),
          ease: 'power2.out',
          overwrite: true,
        });
      };

      const leave = (): void => {
        gsap.to(element, {
          y: 0,
          scale: 1,
          borderColor: '',
          boxShadow: '',
          duration: this.duration(),
          ease: 'power2.out',
          overwrite: true,
        });
      };

      element.addEventListener('pointerenter', enter);
      element.addEventListener('pointerleave', leave);
      element.addEventListener('focusin', enter);
      element.addEventListener('focusout', leave);

      this.removeListeners = () => {
        element.removeEventListener('pointerenter', enter);
        element.removeEventListener('pointerleave', leave);
        element.removeEventListener('focusin', enter);
        element.removeEventListener('focusout', leave);
      };
    });
  }

  ngOnDestroy(): void {
    this.removeListeners?.();
    gsap.killTweensOf(this.elementRef.nativeElement);
  }
}
