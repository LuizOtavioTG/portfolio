import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, input } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollReveal implements AfterViewInit, OnDestroy {
  readonly targetSelector = input('', { alias: 'appScrollReveal' });
  readonly x = input(0, { alias: 'appScrollRevealX' });
  readonly y = input(22, { alias: 'appScrollRevealY' });
  readonly duration = input(0.58, { alias: 'appScrollRevealDuration' });
  readonly stagger = input(0.055, { alias: 'appScrollRevealStagger' });
  readonly delay = input(0, { alias: 'appScrollRevealDelay' });
  readonly start = input('top 72%', { alias: 'appScrollRevealStart' });
  readonly once = input(true, { alias: 'appScrollRevealOnce' });

  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private animationContext?: gsap.Context;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone,
  ) {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit(): void {
    if (this.prefersReducedMotion.matches) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.animationContext = gsap.context(() => {
        const element = this.elementRef.nativeElement;
        const selector = this.targetSelector().trim();
        const targets = selector
          ? Array.from(element.querySelectorAll<HTMLElement>(selector))
          : [element];

        if (!targets.length) {
          return;
        }

        const playReveal = (): void => {
          gsap.fromTo(
            targets,
            {
              autoAlpha: 0,
              x: this.x(),
              y: this.y(),
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              delay: this.delay(),
              duration: this.duration(),
              ease: 'power3.out',
              stagger: this.stagger(),
              overwrite: true,
            },
          );
        };

        ScrollTrigger.create({
          trigger: element,
          start: this.start(),
          once: this.once(),
          onEnter: playReveal,
          onEnterBack: this.once() ? undefined : playReveal,
        });
      }, this.elementRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.animationContext?.revert();
  }
}
