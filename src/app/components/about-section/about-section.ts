import { Component, input } from '@angular/core';
import { HoverLift } from '../../directives/hover-lift';
import { ScrambleText } from '../../directives/scramble-text';
import { ScrollReveal } from '../../directives/scroll-reveal';

export interface AboutDetail {
  title: string;
  text: string;
}

export interface AboutSectionContent {
  intro: string;
  experience: string;
  difference: string;
  details: readonly AboutDetail[];
}

@Component({
  selector: 'app-about-section',
  imports: [ScrambleText, ScrollReveal, HoverLift],
  templateUrl: './about-section.html',
  styleUrl: './about-section.scss',
})
export class AboutSection {
  readonly content = input.required<AboutSectionContent>();
}
