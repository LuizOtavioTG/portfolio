import { Component, input } from '@angular/core';

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
  templateUrl: './about-section.html',
  styleUrl: './about-section.scss',
})
export class AboutSection {
  readonly content = input.required<AboutSectionContent>();
}
