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
  protected fullscreenPreviewIndex: number | null = null;
  private readonly trustedUrls = new Map<string, SafeResourceUrl>();
  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly initialPanelCloseDelay = 1800;
  private readonly fullscreenChangeHandler = () => this.ngZone.run(() => this.syncFullscreenState());
  private swipeObserver?: ReturnType<typeof Observer.create>;
  private scrollTrigger?: ScrollTrigger;
  private fullscreenTimeline?: gsap.core.Timeline;
  private trackElement?: HTMLElement;
  private cardElements: HTMLElement[] = [];
  private lastScrollIndex = 0;
  private panelCloseTimeout?: ReturnType<typeof window.setTimeout>;
  private fullscreenOriginRect?: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;

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
    this.openPanelsThenClose(0);
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }

  ngOnDestroy(): void {
    this.swipeObserver?.kill();
    this.scrollTrigger?.kill();
    this.fullscreenTimeline?.kill();
    this.clearPanelCloseTimeout();
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
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
    this.clearPanelCloseTimeout();
    this.projectRailOpen = !this.projectRailOpen;
  }

  protected toggleProjectInfo(index: number): void {
    this.clearPanelCloseTimeout();
    this.infoOpenIndex = this.infoOpenIndex === index ? null : index;
  }

  protected togglePreviewFullscreen(index: number, event: Event): void {
    const previewElement = (event.currentTarget as HTMLElement).closest<HTMLElement>('.project-preview');

    if (!previewElement) {
      return;
    }

    this.clearPanelCloseTimeout();

    if (document.fullscreenElement === previewElement) {
      this.restorePreviewFullscreen(previewElement);
      return;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => this.requestPreviewFullscreen(index, previewElement));
      return;
    }

    this.requestPreviewFullscreen(index, previewElement);
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

  private requestPreviewFullscreen(index: number, previewElement: HTMLElement): void {
    const originRect = previewElement.getBoundingClientRect();

    this.fullscreenOriginRect = {
      left: originRect.left,
      top: originRect.top,
      width: originRect.width,
      height: originRect.height,
    };
    this.infoOpenIndex = null;
    this.projectRailOpen = false;
    previewElement
      .requestFullscreen()
      .then(() => {
        this.fullscreenPreviewIndex = index;
        this.animatePreviewMaximize(previewElement, this.fullscreenOriginRect);
      })
      .catch(() => {
        this.fullscreenPreviewIndex = null;
        this.fullscreenOriginRect = undefined;
      });
  }

  private restorePreviewFullscreen(previewElement: HTMLElement): void {
    const previewWindow = previewElement.querySelector<HTMLElement>('.preview-window');

    if (!previewWindow || !this.fullscreenOriginRect || this.prefersReducedMotion.matches) {
      document.exitFullscreen();
      return;
    }

    const targetRect = this.fullscreenOriginRect;
    const scaleX = targetRect.width / window.innerWidth;
    const scaleY = targetRect.height / window.innerHeight;

    this.fullscreenTimeline?.kill();
    this.fullscreenTimeline = gsap
      .timeline({
        defaults: { ease: 'expo.inOut' },
        onComplete: () => {
          document.exitFullscreen().finally(() => {
            gsap.set(previewWindow, { clearProps: 'transform,transformOrigin,boxShadow,borderRadius' });
            this.fullscreenOriginRect = undefined;
          });
        },
      })
      .to(previewWindow, {
        x: targetRect.left,
        y: targetRect.top,
        scaleX,
        scaleY,
        transformOrigin: 'top left',
        boxShadow: '0 24px 90px rgba(0, 0, 0, 0.7)',
        borderRadius: 0,
        duration: 0.74,
      });
  }

  private animatePreviewMaximize(
    previewElement: HTMLElement,
    originRect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'> | undefined,
  ): void {
    const previewWindow = previewElement.querySelector<HTMLElement>('.preview-window');

    if (!previewWindow || !originRect || this.prefersReducedMotion.matches) {
      return;
    }

    this.fullscreenTimeline?.kill();
    this.fullscreenTimeline = gsap
      .timeline({
        defaults: { ease: 'expo.inOut' },
        onComplete: () => gsap.set(previewWindow, { clearProps: 'transform,transformOrigin,boxShadow,borderRadius' }),
      })
      .fromTo(
        previewWindow,
        {
          x: originRect.left,
          y: originRect.top,
          scaleX: originRect.width / window.innerWidth,
          scaleY: originRect.height / window.innerHeight,
          transformOrigin: 'top left',
          boxShadow: '0 24px 90px rgba(0, 0, 0, 0.7)',
          borderRadius: 8,
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          borderRadius: 0,
          duration: 0.86,
        },
      );
  }

  private syncFullscreenState(): void {
    const fullscreenElement = document.fullscreenElement;
    const fullscreenPreview = fullscreenElement?.classList.contains('project-preview') ? fullscreenElement : null;

    if (!fullscreenPreview) {
      this.fullscreenPreviewIndex = null;
      this.fullscreenOriginRect = undefined;
      return;
    }

    this.fullscreenPreviewIndex = this.cardElements.findIndex((cardElement) => cardElement.contains(fullscreenPreview));
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
              this.applyStackState(true);
              this.animateActiveSlideContent();
            });
          },
      });
    });
  }

  private setActiveProject(index: number): void {
    this.activeIndex = index;
    this.openPanelsThenClose(index);
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

  private openPanelsThenClose(index: number): void {
    this.clearPanelCloseTimeout();
    this.infoOpenIndex = index;
    this.projectRailOpen = true;

    this.panelCloseTimeout = window.setTimeout(() => {
      if (this.activeIndex !== index) {
        return;
      }

      this.infoOpenIndex = null;
      this.projectRailOpen = false;
    }, this.initialPanelCloseDelay);
  }

  private clearPanelCloseTimeout(): void {
    if (!this.panelCloseTimeout) {
      return;
    }

    window.clearTimeout(this.panelCloseTimeout);
    this.panelCloseTimeout = undefined;
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
