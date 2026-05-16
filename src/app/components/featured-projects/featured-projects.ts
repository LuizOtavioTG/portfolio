import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
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
  imports: [ScrambleText, ScrollReveal],
  templateUrl: './featured-projects.html',
  styleUrl: './featured-projects.scss',
})
export class FeaturedProjects implements AfterViewInit, OnDestroy {
  readonly projects = input.required<readonly FeaturedProject[]>();

  protected activeIndex = 0;
  protected expandedIndex: number | null = null;
  private readonly trustedUrls = new Map<string, SafeResourceUrl>();
  private readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private swipeObserver?: ReturnType<typeof Observer.create>;
  private trackElement?: HTMLElement;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone,
    private readonly sanitizer: DomSanitizer,
  ) {
    gsap.registerPlugin(Observer);
  }

  ngAfterViewInit(): void {
    this.trackElement = this.elementRef.nativeElement.querySelector<HTMLElement>('.carousel-track') ?? undefined;

    if (!this.trackElement) {
      return;
    }

    gsap.set(this.trackElement, { xPercent: 0 });
    this.animateActiveSlideContent();
    this.setupSwipeObserver();
  }

  ngOnDestroy(): void {
    this.swipeObserver?.kill();
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

  protected expandProject(index: number): void {
    this.expandedIndex = index;
  }

  protected collapseProject(index: number): void {
    if (this.expandedIndex === index) {
      this.expandedIndex = null;
    }
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
    this.activeIndex = targetIndex;

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

  private animateActiveSlideContent(): void {
    if (this.prefersReducedMotion.matches) {
      return;
    }

    const activeCard = this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.project-card')[this.activeIndex];
    const animatedElements = activeCard?.querySelectorAll<HTMLElement>(
      '.preview-bar, .project-content .card-meta, .project-content h3, .summary, .tech-list li, .details-grid > div, .project-actions .button',
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
