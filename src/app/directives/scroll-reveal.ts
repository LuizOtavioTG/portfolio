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
  readonly duration = input(0.72, { alias: 'appScrollRevealDuration' });
  readonly stagger = input(0.055, { alias: 'appScrollRevealStagger' });
  readonly delay = input(0, { alias: 'appScrollRevealDelay' });
  readonly start = input('top 72%', { alias: 'appScrollRevealStart' });
  readonly once = input(true, { alias: 'appScrollRevealOnce' });

  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private animationContext?: gsap.Context;
  private revealFallbackFrame?: number;
  private removeRevealFallbackListeners?: () => void;

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

        const shouldPrepareHidden = element.getBoundingClientRect().top > window.innerHeight;
        let hasRevealed = false;

        const isRevealRange = (): boolean => {
          const rect = element.getBoundingClientRect();

          return rect.top <= window.innerHeight * 0.92 && rect.bottom >= 0;
        };

        if (shouldPrepareHidden) {
          gsap.set(targets, {
            autoAlpha: 0,
            x: this.x(),
            y: this.y(),
          });
        }

        const playReveal = (): void => {
          if (hasRevealed) {
            return;
          }

          hasRevealed = true;
          this.removeRevealFallbackListeners?.();

          gsap.fromTo(
            targets,
            {
              autoAlpha: shouldPrepareHidden ? 0 : 1,
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

        const playFallbackReveal = (): void => {
          if (!hasRevealed && isRevealRange()) {
            playReveal();
          }
        };

        if (shouldPrepareHidden) {
          window.addEventListener('scroll', playFallbackReveal, { passive: true });
          window.addEventListener('resize', playFallbackReveal);
          window.addEventListener('load', playFallbackReveal, { once: true });
          this.revealFallbackFrame = window.requestAnimationFrame(playFallbackReveal);

          this.removeRevealFallbackListeners = (): void => {
            window.removeEventListener('scroll', playFallbackReveal);
            window.removeEventListener('resize', playFallbackReveal);
            window.removeEventListener('load', playFallbackReveal);

            if (this.revealFallbackFrame !== undefined) {
              window.cancelAnimationFrame(this.revealFallbackFrame);
              this.revealFallbackFrame = undefined;
            }
          };
        }

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
    this.removeRevealFallbackListeners?.();
    this.animationContext?.revert();
  }
}
