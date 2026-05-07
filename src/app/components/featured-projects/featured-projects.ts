import { Component, input } from '@angular/core';

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
}
