import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HoverLift } from '../../directives/hover-lift';
import { ScrambleText } from '../../directives/scramble-text';
import { ScrollReveal } from '../../directives/scroll-reveal';

export interface ProjectPreview {
  kind: 'placeholder' | 'iframe' | 'image' | 'video';
  label: string;
  url?: string;
}

export interface FeaturedProject {
  name: string;
  status: string;
  summary: string;
  technologies: readonly string[];
  highlights: readonly string[];
  decision: string;
  preview: ProjectPreview;
  liveUrl?: string;
  githubUrl?: string;
}

@Component({
  selector: 'app-featured-projects',
  imports: [ScrambleText, ScrollReveal, HoverLift],
  templateUrl: './featured-projects.html',
  styleUrl: './featured-projects.scss',
})
export class FeaturedProjects implements AfterViewInit, OnDestroy {
  readonly projects = input.required<readonly FeaturedProject[]>();

  protected activeIndex = 0;
  protected infoOpenIndex: number | null = null;
  protected projectRailOpen = false;
  private readonly trustedUrls = new Map<string, SafeResourceUrl>();
  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private swipeObserver?: ReturnType<typeof Observer.create>;
  private scrollTrigger?: ScrollTrigger;
  private scrollTween?: gsap.core.Tween;
  private glitchTimeline?: gsap.core.Timeline;
  private trackElement?: HTMLElement;
  private lastScrollIndex = 0;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone,
    private readonly sanitizer: DomSanitizer,
  ) {
    gsap.registerPlugin(Observer, ScrollTrigger);
  }

  ngAfterViewInit(): void {
    this.trackElement = this.elementRef.nativeElement.querySelector<HTMLElement>('.carousel-track') ?? undefined;

    if (!this.trackElement) {
      return;
    }

    gsap.set(this.trackElement, { xPercent: 0 });
    this.animateActiveSlideContent();
    this.setupSwipeObserver();
    this.setupStickyScroll();
  }

  ngOnDestroy(): void {
    this.swipeObserver?.kill();
    this.scrollTrigger?.kill();
    this.scrollTween?.kill();
    this.glitchTimeline?.kill();
  }

  protected previousProject(): void {
    const total = this.projects().length;

    if (total === 0) {
      return;
    }

    this.goToProject((this.activeIndex - 1 + total) % total);
  }

  protected nextProject(): void {
    const total = this.projects().length;

    if (total === 0) {
      return;
    }

    this.goToProject((this.activeIndex + 1) % total);
  }

  protected selectProject(index: number): void {
    this.goToProject(index);
  }

  protected toggleProjectRail(): void {
    this.projectRailOpen = !this.projectRailOpen;
  }

  protected toggleProjectInfo(index: number): void {
    this.infoOpenIndex = this.infoOpenIndex === index ? null : index;
  }

  protected trustedPreviewUrl(url: string): SafeResourceUrl {
    const cachedUrl = this.trustedUrls.get(url);

    if (cachedUrl) {
      return cachedUrl;
    }

    const trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.trustedUrls.set(url, trustedUrl);

    return trustedUrl;
  }

  private setupSwipeObserver(): void {
    const viewportElement = this.elementRef.nativeElement.querySelector<HTMLElement>('.carousel-viewport');

    if (!viewportElement) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.swipeObserver = Observer.create({
        target: viewportElement,
        type: 'touch,pointer',
        tolerance: 28,
        dragMinimum: 18,
        onLeft: () => this.ngZone.run(() => this.nextProject()),
        onRight: () => this.ngZone.run(() => this.previousProject()),
      });
    });
  }

  private goToProject(index: number): void {
    const total = this.projects().length;

    if (!this.trackElement || total === 0 || index === this.activeIndex) {
      return;
    }

    const targetIndex = (index + total) % total;
    this.setActiveProject(targetIndex);

    if (this.scrollTrigger && !this.prefersReducedMotion.matches) {
      const start = this.scrollTrigger.start;
      const end = this.scrollTrigger.end;
      const progress = total === 1 ? 0 : targetIndex / (total - 1);

      window.scrollTo({
        top: start + (end - start) * progress,
        behavior: 'smooth',
      });
      return;
    }

    if (this.prefersReducedMotion.matches) {
      gsap.set(this.trackElement, { xPercent: -targetIndex * 100 });
      return;
    }

    gsap.to(this.trackElement, {
      xPercent: -targetIndex * 100,
      duration: 0.72,
      ease: 'power3.inOut',
      overwrite: true,
      onComplete: () => this.animateActiveSlideContent(),
    });
  }

  private setupStickyScroll(): void {
    const total = this.projects().length;
    const shellElement = this.elementRef.nativeElement.querySelector<HTMLElement>('.carousel-shell');
    const trackElement = this.trackElement;

    if (!trackElement || !shellElement || total < 2 || this.prefersReducedMotion.matches || window.innerWidth < 940) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.scrollTween = gsap.to(trackElement, {
        xPercent: -(total - 1) * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: shellElement,
          start: 'top top+=18',
          end: () => `+=${Math.max(window.innerHeight * 0.85, 720) * (total - 1)}`,
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextIndex = Math.round(self.progress * (total - 1));

            if (nextIndex === this.lastScrollIndex) {
              return;
            }

            this.lastScrollIndex = nextIndex;
            this.ngZone.run(() => {
              this.setActiveProject(nextIndex);
              this.triggerTransitionGlitch();
              this.animateActiveSlideContent();
            });
          },
        },
      });

      this.scrollTrigger = this.scrollTween.scrollTrigger;
    });
  }

  private setActiveProject(index: number): void {
    this.activeIndex = index;
    this.infoOpenIndex = null;
    this.projectRailOpen = false;
  }

  private triggerTransitionGlitch(): void {
    const glitchElement = this.elementRef.nativeElement.querySelector<HTMLElement>('.transition-glitch');

    if (!glitchElement || this.prefersReducedMotion.matches) {
      return;
    }

    this.glitchTimeline?.kill();
    this.glitchTimeline = gsap
      .timeline()
      .set(glitchElement, { autoAlpha: 1, x: 0 })
      .to(glitchElement, {
        clipPath: 'inset(0 0 58% 0)',
        x: -12,
        duration: 0.055,
        ease: 'steps(1)',
      })
      .to(glitchElement, {
        clipPath: 'inset(36% 0 22% 0)',
        x: 14,
        duration: 0.055,
        ease: 'steps(1)',
      })
      .to(glitchElement, {
        clipPath: 'inset(68% 0 0 0)',
        x: -7,
        duration: 0.055,
        ease: 'steps(1)',
      })
      .to(glitchElement, {
        autoAlpha: 0,
        x: 0,
        clipPath: 'inset(0 0 0 0)',
        duration: 0.12,
        ease: 'power2.out',
      });
  }

  private animateActiveSlideContent(): void {
    if (this.prefersReducedMotion.matches) {
      return;
    }

    const activeCard = this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.project-card')[this.activeIndex];
    const animatedElements = activeCard?.querySelectorAll<HTMLElement>(
      '.preview-bar, .info-toggle, .project-content .card-meta, .project-content h3, .summary, .tech-list li, .details-grid > div, .project-actions .button',
    );

    if (!animatedElements?.length) {
      return;
    }

    gsap.fromTo(
      animatedElements,
      { autoAlpha: 0, y: 14 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        ease: 'power2.out',
        stagger: 0.035,
        overwrite: true,
      },
    );
  }
}
