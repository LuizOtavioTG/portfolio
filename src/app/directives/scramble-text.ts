import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appScrambleText]',
})
export class ScrambleText implements AfterViewInit, OnDestroy {
  private readonly characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/.:-';
  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private animationFrame = 0;
  private intersectionObserver?: IntersectionObserver;
  private hasAnimated = false;
  private originalText = '';

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    const element = this.elementRef.nativeElement;
    this.originalText = element.textContent?.trim() ?? '';

    if (!this.originalText || this.prefersReducedMotion.matches) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && !this.hasAnimated) {
            this.hasAnimated = true;
            this.play();
            this.intersectionObserver?.disconnect();
          }
        },
        { threshold: 0.45 },
      );

      this.intersectionObserver.observe(element);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrame);
    this.intersectionObserver?.disconnect();
  }

  private play(): void {
    const element = this.elementRef.nativeElement;
    const framesPerCharacter = 6.4;
    const holdFrames = 12;
    const scrambleHoldFrames = 5;
    const totalFrames = Math.ceil(this.originalText.length * framesPerCharacter + holdFrames);
    let scrambledText = Array.from(this.originalText, (character) =>
      character === ' ' ? character : this.getRandomCharacter(),
    );
    let frame = 0;

    const tick = (): void => {
      const progress = frame / totalFrames;
      const revealedCharacters = Math.floor(progress * this.originalText.length);

      if (frame % scrambleHoldFrames === 0) {
        scrambledText = scrambledText.map((currentCharacter, index) => {
          if (this.originalText[index] === ' ' || index < revealedCharacters) {
            return currentCharacter;
          }

          return this.getRandomCharacter();
        });
      }

      element.textContent = Array.from(this.originalText)
        .map((character, index) => {
          if (character === ' ' || index < revealedCharacters) {
            return character;
          }

          return scrambledText[index];
        })
        .join('');

      frame += 1;

      if (frame <= totalFrames) {
        this.animationFrame = requestAnimationFrame(tick);
        return;
      }

      element.textContent = this.originalText;
    };

    tick();
  }

  private getRandomCharacter(): string {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }
}
