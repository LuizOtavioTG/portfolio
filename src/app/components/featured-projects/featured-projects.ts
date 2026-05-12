import { Component, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  templateUrl: './featured-projects.html',
  styleUrl: './featured-projects.scss',
})
export class FeaturedProjects {
  readonly projects = input.required<readonly FeaturedProject[]>();

  protected activeIndex = 0;
  protected expandedIndex: number | null = null;
  private readonly trustedUrls = new Map<string, SafeResourceUrl>();

  constructor(private readonly sanitizer: DomSanitizer) {}

  protected previousProject(): void {
    const total = this.projects().length;

    if (total === 0) {
      return;
    }

    this.activeIndex = (this.activeIndex - 1 + total) % total;
  }

  protected nextProject(): void {
    const total = this.projects().length;

    if (total === 0) {
      return;
    }

    this.activeIndex = (this.activeIndex + 1) % total;
  }

  protected selectProject(index: number): void {
    this.activeIndex = index;
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
}
