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
  protected infoOpenIndex: number | null = 0;
  protected projectRailOpen = true;
  private readonly trustedUrls = new Map<string, SafeResourceUrl>();
  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly initialPanelCloseDelay = 1800;
  private swipeObserver?: ReturnType<typeof Observer.create>;
  private scrollTrigger?: ScrollTrigger;
  private glitchTimeline?: gsap.core.Timeline;
  private trackElement?: HTMLElement;
  private cardElements: HTMLElement[] = [];
  private lastScrollIndex = 0;
  private panelCloseTimeout?: ReturnType<typeof window.setTimeout>;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone,
    private readonly sanitizer: DomSanitizer,
  ) {
    gsap.registerPlugin(Observer, ScrollTrigger);
  }

  ngAfterViewInit(): void {
    this.trackElement = this.elementRef.nativeElement.querySelector<HTMLElement>('.carousel-track') ?? undefined;
    this.cardElements = Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.project-card'));

    if (!this.trackElement) {
      return;
    }

    this.applyStackState(false);
    this.animateActiveSlideContent();
    this.setupSwipeObserver();
    this.setupStickyScroll();
    this.openPanelsThenCloseIfDeployed(0);
  }

  ngOnDestroy(): void {
    this.swipeObserver?.kill();
    this.scrollTrigger?.kill();
    this.glitchTimeline?.kill();
    this.clearPanelCloseTimeout();
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
    if (this.shouldKeepPanelsOpen(this.activeIndex)) {
      this.projectRailOpen = true;
      return;
    }

    this.projectRailOpen = !this.projectRailOpen;
  }

  protected toggleProjectInfo(index: number): void {
    if (this.shouldKeepPanelsOpen(index)) {
      this.infoOpenIndex = index;
      return;
    }

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
        onUp: () => this.ngZone.run(() => this.nextProject()),
        onDown: () => this.ngZone.run(() => this.previousProject()),
      });
    });
  }

  private goToProject(index: number): void {
    const total = this.projects().length;

    if (total === 0 || index === this.activeIndex) {
      return;
    }

    const targetIndex = (index + total) % total;
    this.setActiveProject(targetIndex);

    if (this.scrollTrigger && !this.prefersReducedMotion.matches) {
      const start = this.scrollTrigger.start;
      const end = this.scrollTrigger.end;
      const progress = targetIndex / Math.max(total - 1, 1);

      window.scrollTo({
        top: start + (end - start) * progress,
        behavior: 'smooth',
      });
      return;
    }

    this.triggerTransitionGlitch();
    this.applyStackState(!this.prefersReducedMotion.matches);
    this.animateActiveSlideContent();
  }

  private setupStickyScroll(): void {
    const total = this.projects().length;
    const shellElement = this.elementRef.nativeElement.querySelector<HTMLElement>('.carousel-shell');

    if (!shellElement || total < 2 || this.prefersReducedMotion.matches || window.innerWidth < 940) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.scrollTrigger = ScrollTrigger.create({
          trigger: shellElement,
          start: 'top top+=18',
          end: () => `+=${Math.max(window.innerHeight * 0.82, 680) * (total - 1)}`,
          pin: true,
          scrub: 0.35,
          snap: {
            snapTo: 1 / (total - 1),
            duration: { min: 0.22, max: 0.48 },
            delay: 0.04,
            ease: 'power2.out',
          },
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextIndex = Math.min(total - 1, Math.round(self.progress * (total - 1)));

            if (nextIndex === this.lastScrollIndex) {
              return;
            }

            this.lastScrollIndex = nextIndex;
            this.ngZone.run(() => {
              this.setActiveProject(nextIndex);
              this.triggerTransitionGlitch();
              this.applyStackState(true);
              this.animateActiveSlideContent();
            });
          },
      });
    });
  }

  private setActiveProject(index: number): void {
    this.activeIndex = index;

    if (this.shouldKeepPanelsOpen(index)) {
      this.clearPanelCloseTimeout();
      this.infoOpenIndex = index;
      this.projectRailOpen = true;
      return;
    }

    this.infoOpenIndex = null;
    this.projectRailOpen = false;
  }

  private applyStackState(animate: boolean): void {
    if (!this.cardElements.length) {
      return;
    }

    this.cardElements.forEach((cardElement, index) => {
      const stackState = this.resolveCardStackState(index);

      gsap.set(cardElement, {
        zIndex: stackState.zIndex,
        pointerEvents: index === this.activeIndex ? 'auto' : 'none',
      });

      const tweenVars = {
        x: stackState.x,
        y: stackState.y,
        scale: stackState.scale,
        rotate: stackState.rotate,
        autoAlpha: stackState.autoAlpha,
        duration: animate ? 0.72 : 0,
        ease: 'power3.inOut',
        overwrite: true,
      };

      if (animate) {
        gsap.to(cardElement, tweenVars);
        return;
      }

      gsap.set(cardElement, tweenVars);
    });
  }

  private resolveCardStackState(index: number): {
    x: number;
    y: number;
    scale: number;
    rotate: number;
    autoAlpha: number;
    zIndex: number;
  } {
    const relativeIndex = index - this.activeIndex;

    if (relativeIndex < 0) {
      return {
        x: 88,
        y: 52,
        scale: 0.98,
        rotate: 0,
        autoAlpha: 0,
        zIndex: 10 + index,
      };
    }

    const stackDepth = Math.min(relativeIndex, 4);

    return {
      x: stackDepth * -26,
      y: stackDepth * -22,
      scale: 1 - stackDepth * 0.018,
      rotate: 0,
      autoAlpha: relativeIndex > 5 ? 0 : 1 - stackDepth * 0.08,
      zIndex: 100 - relativeIndex,
    };
  }

  private openPanelsThenCloseIfDeployed(index: number): void {
    this.clearPanelCloseTimeout();
    this.infoOpenIndex = index;
    this.projectRailOpen = true;

    if (this.shouldKeepPanelsOpen(index)) {
      return;
    }

    this.panelCloseTimeout = window.setTimeout(() => {
      if (this.activeIndex !== index || this.shouldKeepPanelsOpen(index)) {
        return;
      }

      this.infoOpenIndex = null;
      this.projectRailOpen = false;
    }, this.initialPanelCloseDelay);
  }

  private shouldKeepPanelsOpen(index: number): boolean {
    return !this.projects()[index]?.liveUrl;
  }

  private clearPanelCloseTimeout(): void {
    if (!this.panelCloseTimeout) {
      return;
    }

    window.clearTimeout(this.panelCloseTimeout);
    this.panelCloseTimeout = undefined;
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
